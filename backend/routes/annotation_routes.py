
import json
from flask import jsonify, Blueprint, request, make_response, Response

from models.pdf_text import PdfText  # Import the PdfText model here
from models.token import Token
from models.annotation import Annotation
from models.relation import Relation
from extensions import db

import re
from PyPDF2 import PdfReader
import csv
from dicttoxml import dicttoxml
from io import StringIO
from xml.dom.minidom import parseString
from xml.etree.ElementTree import Element, SubElement, tostring

from collections import defaultdict
    
annotation_routes = Blueprint('annotation_routes', __name__)



@annotation_routes.route('/assign_annotation', methods=['POST'])
def assign_annotation():
    try:
        data = request.json
        token_ids = data.get('token_ids')  # Expecting a list of token IDs
        annotation_id = data.get('annotation_id')

        if not token_ids or not annotation_id:
            return jsonify({"error": "Token IDs or Annotation ID is missing"}), 400

        # Assign the annotation to each token
        for token_id in token_ids:
            token = Token.query.get(token_id)
            if token:
                token.annotation_id = annotation_id
            else:
                return jsonify({"error": f"Token with ID {token_id} not found"}), 404

        db.session.commit()
        return jsonify({"message": "Annotation assigned to tokens successfully."}), 200
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An internal error occurred"}), 500



def generate_csv_data(pdf_text_id):
    # Fetch the PDF text based on the ID
    pdf_text_record = PdfText.query.get(pdf_text_id)
    if not pdf_text_record:
        return jsonify({'error': "PDF text not found"}), 404

    # Fetch annotations related to the PDF text
    tokens = Token.query.filter(Token.pdf_text_id == pdf_text_id).order_by(Token.start.asc()).all()

    output = StringIO()
    writer = csv.writer(output)

    # Writing header for CSV
    header = ['document', 'id', 'tokens', 'ner_tags']
    writer.writerow(header)

    # Initialize variables to keep track of the current line and token annotations
    current_line_tokens = []
    current_line_annotations = []
    current_line_id = 1
    for token in tokens:
        if token.word == '\n':
            # End of line found, write the current line to the CSV
            # Formatting tokens and annotations as JSON strings with additional quotes and brackets
            formatted_tokens = json.dumps(current_line_tokens).replace('"', "'")
            formatted_annotations = json.dumps(current_line_annotations).replace('[', "['").replace(']', "']")
            writer.writerow([pdf_text_id, current_line_id, formatted_tokens, formatted_annotations])
            # Reset for the new line
            current_line_tokens = []
            current_line_annotations = []
            current_line_id += 1
        else:
            # Add the current token to the line
            current_line_tokens.append(token.word)
            # Append the current token's annotation ID or 0 if no annotation exists
            current_line_annotations.append(token.annotation_id if token.annotation_id else 0)

    # Ensure any remaining tokens are written to the CSV if the document does not end with a newline
    if current_line_tokens:
        formatted_tokens = json.dumps(current_line_tokens).replace('"', "'")
        formatted_annotations = json.dumps(current_line_annotations).replace('[', "['").replace(']', "']")
        writer.writerow([pdf_text_id, current_line_id, formatted_tokens, formatted_annotations])

    output.seek(0)  # Move to the beginning of the stream
    return Response(output.getvalue(), mimetype='text/csv', headers={"Content-Disposition": f"attachment;filename=annotations_{pdf_text_id}.csv"})
  
       
def generate_jsonl_data(pdf_text_id):
    # Fetch the PDF text based on the ID
    pdf_text_record = PdfText.query.get(pdf_text_id)
    if not pdf_text_record:
        return jsonify({'error': "PDF text not found"}), 404

    tokens = Token.query.filter(Token.pdf_text_id == pdf_text_id).order_by(Token.start.asc()).all()
    if not tokens:
        return jsonify({'error': "No tokens found for the given PDF text ID"}), 404

    # Initialize variables to keep track of the full text and annotations
    full_text = ''
    labels = []
    offset = 0  # Start offset for labels
    output = StringIO()

    for token in tokens:
        if token.annotation_id:
            # Retrieve the annotation
            annotation = Annotation.query.get(token.annotation_id)
            if annotation:
                # Create a label for JSONL output
                labels.append({
                    'start': offset,
                    'end': offset + len(token.word),
                    'label': annotation.text
                })
        # Append token word to full text and update offset
        full_text += token.word + " "
        offset += len(token.word) + 1  # Update offset for spaces

    # JSONL formatted string for each line/document
    jsonl_data = {
        'id': pdf_text_id,
        'text': full_text.strip(),
        'labels': labels,
        'Comments': []
    }
    # Write JSONL data to output buffer
    output.write(json.dumps(jsonl_data) + '\n')

    output.seek(0)  # Move to the beginning of the stream
    return Response(
        output.getvalue(),
        mimetype='application/json',
        headers={'Content-Disposition': f'attachment;filename={pdf_text_id}_annotations.jsonl'}
    )



@annotation_routes.route('/export_annotations/<int:pdf_text_id>', methods=['GET'])
def export_annotations(pdf_text_id):
    format_type = request.args.get('format', 'json')
    style = request.args.get('style', 'normal')

    if format_type == 'json':
        return generate_jsonl_data(pdf_text_id)
    elif format_type == 'csv' and style == 'bio':
        return generate_csv_data(pdf_text_id)
    else:
        return jsonify({'error': 'Invalid format or style specified'}), 400
    
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
    favorites = [{"id": ann.id, "text": ann.text, "color": ann.color,
                  "favorite": ann.favorite} for ann in favorite_annotations]
    return jsonify(favorites)

# Route to retrieve all non-favorite annotations


@annotation_routes.route('/annotations/non_favorites', methods=['GET'])
def get_non_favorite_annotations():
    non_favorite_annotations = Annotation.query.filter_by(favorite=False).all()
    non_favorites = [{"id": ann.id, "text": ann.text, "color": ann.color,
                      "favorite": ann.favorite} for ann in non_favorite_annotations]
    return jsonify(non_favorites)

