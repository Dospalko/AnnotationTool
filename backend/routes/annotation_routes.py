from flask import Blueprint, jsonify, request
from models.pdf_text import PdfText  # Import the PdfText model here
from models.token import Token
from models.annotation import Annotation
from extensions import db
from nltk.tokenize import word_tokenize
import re
from PyPDF2 import PdfReader 


annotation_routes = Blueprint('annotation_routes', __name__)

@annotation_routes.route('/assign_annotation', methods=['POST'])
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

@annotation_routes.route('/export_annotations/<int:pdf_text_id>', methods=['GET'])
def export_annotations(pdf_text_id):
    tokens = Token.query.filter(Token.pdf_text_id == pdf_text_id, Token.annotation_id.isnot(None)).order_by(Token.id).all()
    annotations_data = []
    previous_annotation_id = None
    annotation = None

    for token in tokens:
        if token.annotation_id != previous_annotation_id:
            if annotation:  # If there's a previous annotation, add it to the list
                annotations_data.append(annotation)
            # Start a new annotation
            annotation = {
                "text_id": f"text{pdf_text_id}",
                "annotations": [
                    {
                        "label": token.word,
                        "start": token.start,  # Assuming the token has a start attribute
                        "end": token.end  # Assuming the token has an end attribute
                    }
                ]
            }
            previous_annotation_id = token.annotation_id
        else:
            # If the token is part of the current annotation, update the end index
            annotation["annotations"][-1]["end"] = token.end

    # Add the last annotation
    if annotation:
        annotations_data.append(annotation)

    return jsonify({"annotations": annotations_data})

@annotation_routes.route('/export_annotations_bio/<int:pdf_text_id>', methods=['GET'])
def export_annotations_bio(pdf_text_id):
    tokens = Token.query.filter(Token.pdf_text_id == pdf_text_id, Token.annotation_id.isnot(None)).order_by(Token.id).all()
    bio_data = []
    previous_annotation_id = None

    for token in tokens:
        bio_tag = "O"
        annotation_type = None
        annotation_id = None
        if token.annotation_id:
            annotation_type = token.annotation.text
            annotation_id = token.annotation_id
            if token.annotation_id != previous_annotation_id:
                bio_tag = f"B-{annotation_type}"  # Beginning of a new entity
            else:
                bio_tag = f"I-{annotation_type}"  # Inside an entity
            previous_annotation_id = token.annotation_id

        bio_data.append({
            'word': token.word, 
            'tag': bio_tag, 
            'annotation_id': annotation_id, 
            'annotation_type': annotation_type
        })

    return jsonify(bio_data)



    return jsonify(bio_data)
@annotation_routes.route('/add', methods=['POST'])
def add_annotation():
    data = request.json
    text = data.get('text', '')
    color = data.get('color', '')

    new_annotation = Annotation(text, color)
    db.session.add(new_annotation)
    db.session.commit()
    return jsonify({"message": "Added new annotation."}), 201

@annotation_routes.route('/delete/<int:annotation_id>', methods=['DELETE'])
def delete_annotation(annotation_id):
    annotation = Annotation.query.get(annotation_id)
    if annotation is None:
        return jsonify({"message": "Annotation not found"}), 404

    db.session.delete(annotation)
    db.session.commit()
    return jsonify({"message": "Annotation deleted."}), 200

@annotation_routes.route('/edit/<int:annotation_id>', methods=['PUT'])
def edit_annotation(annotation_id):
    annotation = Annotation.query.get(annotation_id)
    if not annotation:
        return jsonify({"message": "Annotation not found"}), 404

    data = request.json
    annotation.text = data.get('text', annotation.text)
    annotation.color = data.get('color', annotation.color)
    db.session.commit()

    return jsonify({"message": "Annotation updated successfully.", "id": annotation.id}), 200


@annotation_routes.route('/annotations', methods=['GET'])
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
@annotation_routes.route('/toggle_favorite/<int:annotation_id>', methods=['POST'])
def toggle_favorite(annotation_id):
    annotation = Annotation.query.get(annotation_id)
    if annotation:
        annotation.favorite = not annotation.favorite
        db.session.commit()
        return jsonify({"message": "Favorite status toggled.", "favorite": annotation.favorite}), 200
    else:
        return jsonify({"error": "Annotation not found"}), 404

# Route to retrieve all favorite annotations
@annotation_routes.route('/annotations/favorites', methods=['GET'])
def get_favorite_annotations():
    favorite_annotations = Annotation.query.filter_by(favorite=True).all()
    favorites = [{"id": ann.id, "text": ann.text, "color": ann.color, "favorite": ann.favorite} for ann in favorite_annotations]
    return jsonify(favorites)

# Route to retrieve all non-favorite annotations
@annotation_routes.route('/annotations/non_favorites', methods=['GET'])
def get_non_favorite_annotations():
    non_favorite_annotations = Annotation.query.filter_by(favorite=False).all()
    non_favorites = [{"id": ann.id, "text": ann.text, "color": ann.color, "favorite": ann.favorite} for ann in non_favorite_annotations]
    return jsonify(non_favorites)

