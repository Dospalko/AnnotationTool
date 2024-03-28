from flask import Blueprint, jsonify, request
from models.pdf_text import PdfText  # Import the PdfText model here
from models.token import Token
from models.annotation import Annotation
from extensions import db
from nltk.tokenize import word_tokenize
import re
from PyPDF2 import PdfReader 
from docx import Document
import os
from routes.annotation_routes import annotate_texts_with_ner
from models.project import Project
pdf_routes = Blueprint('pdf_routes', __name__)

@pdf_routes.route('/upload_file', methods=['POST'])
def upload_file():
    uploaded_file = request.files.get('file')
    if uploaded_file:
        filename = uploaded_file.filename
        file_extension = os.path.splitext(filename)[1]
        text = ''

        if file_extension == '.pdf':
            pdf_reader = PdfReader(uploaded_file.stream)
            text = ' '.join(page.extract_text() for page in pdf_reader.pages if page.extract_text())

        elif file_extension == '.docx':
            doc = Document(uploaded_file.stream)
            text = ' '.join(p.text for p in doc.paragraphs)

        elif file_extension == '.txt':
            text = uploaded_file.stream.read().decode('utf-8')

        else:
            return jsonify({"error": "Invalid file format."}), 400

        text = re.sub(r'\s+', ' ', text).strip()
        new_pdf_text = PdfText(text, filename)
        db.session.add(new_pdf_text)
        db.session.commit()

        return jsonify({"message": "File uploaded and text extracted."}), 201
    

@pdf_routes.route('/api/files-overview', methods=['GET'])
def get_files_overview():
    pdf_texts = PdfText.query.all()
    overview_data = []

    for pdf_text in pdf_texts:
        tokens = Token.query.filter_by(pdf_text_id=pdf_text.id).all()
        tokens_count = len(tokens)

        # Count the number of tokens that are annotated
        annotated_tokens_count = len([token for token in tokens if token.annotation_id])

        # Get unique annotation IDs associated with these tokens
        unique_annotation_ids = set(token.annotation_id for token in tokens if token.annotation_id)
        unique_annotations_count = len(unique_annotation_ids)

        # Calculate the percentage of tokens that are annotated
        annotated_percentage = (annotated_tokens_count / tokens_count * 100) if tokens_count > 0 else 0

        overview_data.append({
            'id': pdf_text.id,
            'filename': pdf_text.filename,
            'tokensCount': tokens_count,
            'annotatedTokensCount': annotated_tokens_count,
            'uniqueAnnotationsCount': unique_annotations_count,
            'annotatedPercentage': round(annotated_percentage, 2)
        })

    return jsonify(overview_data)

@pdf_routes.route('/tokenize_pdf/<int:pdf_text_id>', methods=['GET'])
def tokenize_pdf(pdf_text_id):
    pdf_text_record = PdfText.query.get_or_404(pdf_text_id)

    # Check if the text has been tokenized already
    existing_tokens = Token.query.filter_by(pdf_text_id=pdf_text_id).all()
    
    # If no tokens exist, perform tokenization and annotation
    if not existing_tokens:
        # Perform NER and tokenization
        annotate_texts_with_ner(pdf_text_id)

        # Fetch all tokens again after NER and tokenization
        existing_tokens = Token.query.filter_by(pdf_text_id=pdf_text_id).all()

    # Now existing_tokens contains all tokens, including those not annotated
    sorted_tokens = sorted(existing_tokens, key=lambda token: token.start)
    return jsonify([{
        'id': token.id, 
        'word': token.word, 
        'start': token.start, 
        'end': token.end, 
        'annotation_id': token.annotation_id,
        'annotation': {
            'id': token.annotation.id,
            'text': token.annotation.text,
            'color': token.annotation.color,
            'favorite': token.annotation.favorite
        } if token.annotation else None
    } for token in sorted_tokens])

@pdf_routes.route('/save_tokens/<int:pdf_text_id>', methods=['POST'])
def save_tokens(pdf_text_id):
    data = request.json
    updated_tokens = data.get('tokens', [])

    # Extract token IDs
    token_ids = [token_data['id'] for token_data in updated_tokens]

    # Fetch all relevant tokens in a single query
    tokens = Token.query.filter(Token.id.in_(token_ids)).all()
    token_dict = {token.id: token for token in tokens}

    # Process each token
    for token_data in updated_tokens:
        token = token_dict.get(token_data['id'])
        if token:
            token.annotation_id = token_data['annotation']['id'] if token_data.get('annotation') else None

    db.session.commit()
    return jsonify({"message": "Tokens updated successfully."}), 200


@pdf_routes.route('/upload_pdf', methods=['POST'])
def upload_pdf():
    uploaded_file = request.files.get('file')
    if uploaded_file and uploaded_file.filename.endswith('.pdf'):
        pdf_reader = PdfReader(uploaded_file.stream)
        text = ''
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            text += page.extract_text()

        # Removing consecutive white spaces and replacing them with a single space
        text = re.sub(r'\s+', ' ', text).strip()

        new_pdf_text = PdfText(text, uploaded_file.filename)  # Save filename here
        db.session.add(new_pdf_text)
        db.session.commit()

        return jsonify({"message": "PDF uploaded and text extracted."}), 201
    else:
        return jsonify({"error": "Invalid file format."}), 400


@pdf_routes.route('/pdf_texts', methods=['GET'])
def get_pdf_texts():
    pdf_texts = PdfText.query.all()
    output = [{'id': text.id, 'text': text.text, 'filename': text.filename} for text in pdf_texts]  # Include filename here
    return jsonify(output)

@pdf_routes.route('/pdf_texts/<int:pdf_text_id>', methods=['GET'])
def get_pdf_text(pdf_text_id):
    pdf_text = PdfText.query.get_or_404(pdf_text_id)
    return jsonify({
        'id': pdf_text.id,
        'text': pdf_text.text,
        'filename': pdf_text.filename
    })

@pdf_routes.route('/delete_pdf_text/<int:pdf_text_id>', methods=['DELETE'])
def delete_pdf_text(pdf_text_id):
    pdf_text = PdfText.query.get(pdf_text_id)
    
    if pdf_text is None:
        return jsonify({"message": "PDF Text not found"}), 404

    # Deleting associated tokens before deleting the PDF Text
    # You can adjust the line below based on the relationship between PdfText and token in your ORM setup
    Token.query.filter_by(pdf_text_id=pdf_text_id).delete()

    db.session.delete(pdf_text)
    db.session.commit()
    
    return jsonify({"message": "PDF Text deleted."}), 200

@pdf_routes.route('/get_tokenized_text/<int:pdf_text_id>', methods=['GET'])
def get_tokenized_text(pdf_text_id):
    tokens = Token.query.filter_by(pdf_text_id=pdf_text_id).all()
    return jsonify([token.word for token in tokens])

# Assuming this is within your routes/pdf_routes.py

@pdf_routes.route('/files/unassigned', methods=['GET'])
def get_unassigned_files():
    unassigned_files = PdfText.query.filter_by(project_id=None).all()
    return jsonify([{'id': file.id, 'filename': file.filename} for file in unassigned_files]), 200

@pdf_routes.route('/assign-files', methods=['POST'])
def assign_files_to_project():
    data = request.json
    project_id = data['project_id']
    file_ids = data['file_ids']

    # Check if the project exists
    project = Project.query.filter_by(id=project_id).first()
    if not project:
        return jsonify({'error': 'Project not found'}), 404

    # Update PdfText instances with the provided project_id
    PdfText.query.filter(PdfText.id.in_(file_ids)).update({'project_id': project_id}, synchronize_session=False)
    db.session.commit()

    return jsonify({'message': 'Files successfully assigned to the project'}), 200

@pdf_routes.route('/projects/<int:project_id>/files', methods=['GET'])
def get_project_files(project_id):
    project_files = PdfText.query.filter_by(project_id=project_id).all()
    return jsonify([{'id': file.id, 'filename': file.filename} for file in project_files]), 200
