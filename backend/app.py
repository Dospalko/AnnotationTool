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
    favorite = db.Column(db.Boolean, default=False)

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
    word = db.Column(db.String(50), unique=True)  # Add unique constraint
    pdf_text_id = db.Column(db.Integer, db.ForeignKey('pdf_text.id'), nullable=False)
    annotation_id = db.Column(db.Integer, db.ForeignKey('annotation.id'), nullable=True)

    annotation = db.relationship('Annotation', backref=db.backref('tokens', lazy=True))

@app.route('/assign_annotation', methods=['POST'])
def assign_annotation():
    try:
        data = request.json
        token_id = data.get('token_id')
        annotation_id = data.get('annotation_id')

        if not token_id or not annotation_id:
            return jsonify({"error": "Token ID or Annotation ID is missing"}), 400

        token = Token.query.get(token_id)
        if not token:
            return jsonify({"error": "Token not found"}), 404

        annotation = Annotation.query.get(annotation_id)
        if not annotation:
            return jsonify({"error": "Annotation not found"}), 404

        token.annotation_id = annotation_id
        db.session.commit()

        return jsonify({"message": "Annotation assigned to token successfully."}), 200
    except Exception as e:
        # Log the exception for debugging
        print(f"Error: {e}")
        return jsonify({"error": "An internal error occurred"}), 500


@app.route('/tokenize_pdf/<int:pdf_text_id>', methods=['GET'])
def tokenize_pdf(pdf_text_id):
    pdf_text_record = PdfText.query.get_or_404(pdf_text_id)
    tokens = word_tokenize(pdf_text_record.text)

    token_objects = []
    for word in tokens:
        token = Token.query.filter_by(word=word).first()
        if not token:
            token = Token(word=word, pdf_text_id=pdf_text_id)
            db.session.add(token)
            db.session.commit()
        
        annotation_data = None
        if token.annotation_id:
            annotation = Annotation.query.get(token.annotation_id)
            annotation_data = {
                'id': annotation.id,
                'text': annotation.text,
                'color': annotation.color
            }

        token_objects.append({'id': token.id, 'word': token.word, 'annotation': annotation_data})

    return jsonify(token_objects)



@app.route('/save_tokens/<int:pdf_text_id>', methods=['POST'])
def save_tokens(pdf_text_id):
    data = request.json
    updated_tokens = data.get('tokens', [])

    # Process each token
    for token_data in updated_tokens:
        token = Token.query.get(token_data['id'])
        if token:
            token.annotation_id = token_data['annotation']['id'] if token_data['annotation'] else None
            db.session.add(token)
    
    db.session.commit()
    return jsonify({"message": "Tokens updated successfully."}), 200


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

@app.route('/export_annotations/<int:pdf_text_id>', methods=['GET'])
def export_annotations(pdf_text_id):
    tokens = Token.query.filter(Token.pdf_text_id == pdf_text_id, Token.annotation_id != None).all()
    annotations_data = [
        {"token_id": token.id, "text": token.word, "annotation": token.annotation.text}
        for token in tokens
    ]
    return jsonify(annotations_data)

@app.route('/export_annotations_bio/<int:pdf_text_id>', methods=['GET'])
def export_annotations_bio(pdf_text_id):
    tokens = Token.query.filter(Token.pdf_text_id == pdf_text_id, Token.annotation_id.isnot(None)).order_by(Token.id).all()
    bio_data = []
    previous_annotation_id = None

    for token in tokens:
        bio_tag = "O"
        if token.annotation_id:
            if token.annotation_id != previous_annotation_id:
                bio_tag = f"B-{token.annotation.text}"  # Beginning of a new entity
            else:
                bio_tag = f"I-{token.annotation.text}"  # Inside an entity
            previous_annotation_id = token.annotation_id
        else:
            previous_annotation_id = None

        bio_data.append({'word': token.word, 'tag': bio_tag})

    return jsonify(bio_data)



    return jsonify(bio_data)
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

@app.route('/edit/<int:annotation_id>', methods=['PUT'])
def edit_annotation(annotation_id):
    annotation = Annotation.query.get(annotation_id)
    if not annotation:
        return jsonify({"message": "Annotation not found"}), 404

    data = request.json
    annotation.text = data.get('text', annotation.text)
    annotation.color = data.get('color', annotation.color)
    db.session.commit()

    return jsonify({"message": "Annotation updated successfully.", "id": annotation.id}), 200


@app.route('/annotations', methods=['GET'])
def get_annotations():
    annotations = Annotation.query.all()
    output = [{
        'id': annotation.id,
        'text': annotation.text,
        'color': annotation.color,
        'favorite': annotation.favorite  # Include the favorite status in the output
    } for annotation in annotations]
    return jsonify(output)


# Route to toggle the favorite status of an annotation
@app.route('/toggle_favorite/<int:annotation_id>', methods=['POST'])
def toggle_favorite(annotation_id):
    annotation = Annotation.query.get(annotation_id)
    if annotation:
        annotation.favorite = not annotation.favorite
        db.session.commit()
        return jsonify({"message": "Favorite status toggled.", "favorite": annotation.favorite}), 200
    else:
        return jsonify({"error": "Annotation not found"}), 404

# Route to retrieve all favorite annotations
@app.route('/annotations/favorites', methods=['GET'])
def get_favorite_annotations():
    favorite_annotations = Annotation.query.filter_by(favorite=True).all()
    favorites = [{"id": ann.id, "text": ann.text, "color": ann.color, "favorite": ann.favorite} for ann in favorite_annotations]
    return jsonify(favorites)

# Route to retrieve all non-favorite annotations
@app.route('/annotations/non_favorites', methods=['GET'])
def get_non_favorite_annotations():
    non_favorite_annotations = Annotation.query.filter_by(favorite=False).all()
    non_favorites = [{"id": ann.id, "text": ann.text, "color": ann.color, "favorite": ann.favorite} for ann in non_favorite_annotations]
    return jsonify(non_favorites)


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
