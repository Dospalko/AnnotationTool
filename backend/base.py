from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
import json
from sqlalchemy import or_
from PyPDF2 import PdfReader 
import io
from flask_migrate import Migrate
from nltk.tokenize import word_tokenize
import nltk
import re
from flask_sqlalchemy import SQLAlchemy
app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:heslo@localhost/annotator'

db = SQLAlchemy(app)
migrate = Migrate(app, db)
entities = []

class Annotation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(500))
    color = db.Column(db.String(10))  # Save the color as a hex string

    def __init__(self, text, color):
        self.text = text
        self.color = color

class PdfText(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text)
    filename = db.Column(db.String(255))  # New column to store filename
  
    def __init__(self, text, filename):
        self.text = text
        self.filename = filename


class Token(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    word = db.Column(db.String(50))
    pdf_text_id = db.Column(db.Integer, db.ForeignKey('pdf_text.id'), nullable=False)


@app.route('/tokenize_pdf/<int:pdf_text_id>', methods=['GET'])
def tokenize_pdf(pdf_text_id):
    # 1. Retrieve the text for the given PDF ID
    pdf_text_record = PdfText.query.get_or_404(pdf_text_id)

    # 2. Tokenize the text
    tokens = word_tokenize(pdf_text_record.text)

    # 3. Return the tokens as a JSON response
    return jsonify(tokens)

@app.route('/save_tokens/<int:pdf_text_id>', methods=['POST'])
def save_tokens(pdf_text_id):
    data = request.json
    tokens = data.get('tokens', [])

    # First, let's delete any existing tokens for this pdf_text_id
    Token.query.filter_by(pdf_text_id=pdf_text_id).delete()

    # Now, let's insert the new tokens
    for word in tokens:
        token = Token(word=word, pdf_text_id=pdf_text_id)
        db.session.add(token)

    db.session.commit()

    return jsonify({"message": "Tokens saved successfully."}), 200


@app.route('/upload_pdf', methods=['POST'])
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


@app.route('/pdf_texts', methods=['GET'])
def get_pdf_texts():
    pdf_texts = PdfText.query.all()
    output = [{'id': text.id, 'text': text.text, 'filename': text.filename} for text in pdf_texts]  # Include filename here
    return jsonify(output)

@app.route('/delete_pdf_text/<int:pdf_text_id>', methods=['DELETE'])
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



@app.route('/add', methods=['POST'])
def add_annotation():
    data = request.json
    text = data.get('text', '')
    color = data.get('color', '')

    new_annotation = Annotation(text, color)
    db.session.add(new_annotation)
    db.session.commit()
    return jsonify({"message": "Added new annotation."}), 201

@app.route('/delete/<int:annotation_id>', methods=['DELETE'])
def delete_annotation(annotation_id):
    annotation = Annotation.query.get(annotation_id)
    if annotation is None:
        return jsonify({"message": "Annotation not found"}), 404

    db.session.delete(annotation)
    db.session.commit()
    return jsonify({"message": "Annotation deleted."}), 200

@app.route('/annotations', methods=['GET'])
def get_annotations():
    annotations = Annotation.query.all()
    output = []
    for annotation in annotations:
        output.append({
            'id': annotation.id,
            'text': annotation.text,
            'color': annotation.color
        })
    return jsonify(output)




@app.route('/search_all', methods=['GET'])
def search_all():
    search_query = request.args.get('q', '').strip().lower()  # Remove whitespace and convert to lowercase
    if not search_query:
        return jsonify([])  # Return an empty list if the search query is empty

    # Searching in PDF texts
    matched_pdf_texts = PdfText.query.filter(
        PdfText.text.ilike(f"%{search_query}%")
    ).all()
    pdf_output = [{'type': 'pdf', 'id': text.id, 'text': text.text, 'filename': text.filename} for text in matched_pdf_texts]

    # Searching in annotations with word boundary regex
    matched_annotations = Annotation.query.filter(
        or_(
            Annotation.text.ilike(f"%{search_query}%"),
            Annotation.color.ilike(f"%{search_query}%"),
            Annotation.text.op('~*')(rf'\m{re.escape(search_query)}\M')  # Use regex for word boundary matching
        )
    ).all()
    annotation_output = [{'type': 'annotation', 'id': annotation.id, 'text': annotation.text, 'color': annotation.color} for annotation in matched_annotations]

    # Combine both outputs
    output = pdf_output + annotation_output
    return jsonify(output)


def init_db():
    db.create_all
if __name__ == '__main__':
    init_db() 
    app.run(debug=True)
