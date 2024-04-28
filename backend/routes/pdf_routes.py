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
from models.project import Project
import json
from flask import Response,json

pdf_routes = Blueprint('pdf_routes', __name__)


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
    existing_tokens = Token.query.filter_by(pdf_text_id=pdf_text_id).order_by(Token.start.asc()).all()  # Order by start position

    if not existing_tokens:
        tokens = tokenize_text(pdf_text_record.text, pdf_text_id)
        db.session.add_all(tokens)
        db.session.commit()
        existing_tokens = Token.query.filter_by(pdf_text_id=pdf_text_id).order_by(Token.start.asc()).all()  # Fetch again ordered

    tokens_data = format_token_data(existing_tokens)
    print(tokens_data)
    return jsonify(tokens_data), 200

def tokenize_text(text, pdf_text_id):
    tokens = []
    start = 0
    inside_special_tag = False

    # Update the regex pattern to capture colons as separate tokens
    pattern = re.compile(r'(<\/?[a-z]+>|[^\s<:]+|:|\s+|\n)')

    for match in pattern.finditer(text):
        token_text = match.group()
        end = start + len(token_text)

        if '<' in token_text and token_text.endswith('>'):
            # Check if the token is a special tag and update the inside_special_tag flag
            inside_special_tag = not token_text.startswith('</')

        if token_text.strip() or token_text == '\n':  # Non-empty or newline token
            tokens.append(Token(word=token_text, start=start, end=end, pdf_text_id=pdf_text_id))
        
        start = end  # Move start to the next position

    return tokens

def format_token_data(tokens):
    """Format token data for JSON response, including annotation details."""
    return [
        {
            'id': token.id,
            'word': token.word,
            'start': token.start,
            'end': token.end,
            'annotation_id': token.annotation_id,
            'annotation': {
                'id': token.annotation.id,
                'text': token.annotation.text,
                'color': token.annotation.color,
                'favorite': getattr(token.annotation, 'favorite', False)
            } if token.annotation else None
        }
        for token in tokens
    ]

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
