
from flask import jsonify, Blueprint, request, make_response, Response

from models.pdf_text import PdfText  # Import the PdfText model here
from models.token import Token
from models.annotation import Annotation
from models.relation import Relation
from extensions import db
from nltk.tokenize import word_tokenize
import re
from PyPDF2 import PdfReader
import csv
from dicttoxml import dicttoxml
from io import StringIO
from xml.dom.minidom import parseString
from xml.etree.ElementTree import Element, SubElement, tostring
from transformers import pipeline

annotation_routes = Blueprint('annotation_routes', __name__)


ner_map = {0: '0', 1: 'B-OSOBA', 2: 'I-OSOBA', 3: 'B-ORGANIZÁCIA', 4: 'I-ORGANIZÁCIA', 5: 'B-LOKALITA', 6: 'I-LOKALITA'}
entity_color_map = {
    'B-OSOBA': '#FF5733',  # Example: red
    'I-OSOBA': '#FF5733',  # Same type, same color
    'B-ORGANIZÁCIA': '#33FF57',  # Example: green
    'I-ORGANIZÁCIA': '#33FF57',  # Same type, same color
    'B-LOKALITA': '#3357FF',  # Example: blue
    'I-LOKALITA': '#3357FF',  # Same type, same color
    # Add other types as needed
}
ner_models = {
    'bertz': 'crabz/slovakbert-ner',
    'conll': 'ju-bezdek/slovakbert-conll2003-sk-ner'
}

ner_pipeline = pipeline('ner', model='crabz/slovakbert-ner')
def annotate_texts_with_ner(pdf_text_id):
    pdf_text = PdfText.query.get(pdf_text_id)
    if not pdf_text:
        return "PDF text not found", 404

    # Get NER annotations
    ner_annotations = ner_pipeline(pdf_text.text)

    # Sort annotations by start index for sequential processing
    ner_annotations_sorted = sorted(ner_annotations, key=lambda ann: ann['start'])

    # Convert NER results to a set of start-end tuples for quick lookup
    annotated_spans = {(ann['start'], ann['end']): ner_map.get(ann['entity'], '0') for ann in ner_annotations_sorted}

    last_index = 0
    for start, end in annotated_spans:
        # Handle text before the current entity
        if start > last_index:
            create_tokens_for_intermediate_text(pdf_text.text[last_index:start], last_index, pdf_text.id, None)

        # Handle the entity itself
        entity_label = annotated_spans[(start, end)]
        color = entity_color_map.get(entity_label, None)  # Get the color for the entity type
        annotation_id = None
        if entity_label != '0':  
            annotation = Annotation.query.filter_by(text=entity_label).first()
            if not annotation:
                annotation = Annotation(text=entity_label, color=color)
                db.session.add(annotation)
                db.session.flush()  # This will assign an ID to the new annotation
            annotation_id = annotation.id

        # Add the token for the current entity
        token_text = pdf_text.text[start:end]
        create_token(token_text, start, end, pdf_text.id, annotation_id)

        # Update the last index
        last_index = end

    # Handle any text after the last annotation
    if last_index < len(pdf_text.text):
        create_tokens_for_intermediate_text(pdf_text.text[last_index:], last_index, pdf_text.id, None)

    db.session.commit()
    return "Tokenization and annotation completed successfully.", 200

def create_tokens_for_intermediate_text(text, offset, pdf_text_id, annotation_id):
    # Create tokens for intermediate non-entity text
    intermediate_tokens = text.split()  # Naive split by whitespace
    index = offset
    for word in intermediate_tokens:
        start = index + text[index-offset:].find(word)
        end = start + len(word)
        create_token(word, start, end, pdf_text_id, annotation_id)
        index = end + 1  # Skip over the space after the word

def create_token(word, start, end, pdf_text_id, annotation_id):
    new_token = Token(word=word, start=start, end=end, pdf_text_id=pdf_text_id, annotation_id=annotation_id)
    db.session.add(new_token)


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

def generate_csv_data(annotations, style):
    output = StringIO()
    writer = csv.writer(output)

    if style == 'bio':
        header = ['word', 'BIO', 'start', 'end']
    else:  # 'normal' style
        header = ['word', 'annotation']

    writer.writerow(header)

    for annotation in annotations:
        if style == 'bio':
            row = [annotation['word'], annotation['BIO'], annotation['start'], annotation['end']]
        else:  # 'normal' style
            row = [annotation['word'], annotation['annotation']]
        writer.writerow(row)

    output.seek(0)
    return output.getvalue()


def generate_xml_data(annotations, style):
    root = Element('annotations')

    for annotation in annotations:
        token_elem = SubElement(root, 'token')
        SubElement(token_elem, 'word').text = annotation['word']
        
        if style == 'bio':
            SubElement(token_elem, 'BIO').text = annotation['BIO']
            SubElement(token_elem, 'start').text = str(annotation['start'])
            SubElement(token_elem, 'end').text = str(annotation['end'])
        else:  # 'normal' style
            SubElement(token_elem, 'annotation').text = annotation['annotation']

    xml_str = tostring(root, 'utf-8')
    parsed_xml = parseString(xml_str)
    return parsed_xml.toprettyxml(indent="  ")

@annotation_routes.route('/export_annotations/<int:pdf_text_id>', methods=['GET'])
def export_annotations(pdf_text_id):
    style = request.args.get('style', 'normal')
    format_type = request.args.get('format', 'json')

    tokens = Token.query.filter(Token.pdf_text_id == pdf_text_id).all()
    if not tokens:
        return jsonify({'error': 'No tokens found for the given PDF text ID'}), 404

    exported_annotations = []

    if style == 'bio':
        previous_tag = "O"
        for token in tokens:
            bio_tag = "O"
            annotation = Annotation.query.get(token.annotation_id).text if token.annotation_id else None
            if annotation:
                bio_tag = "B-" + annotation if previous_tag != annotation else "I-" + annotation
            exported_annotations.append({
                'word': token.word,
                'BIO': bio_tag,
                'start': str(token.start),
                'end': str(token.end)
            })
            previous_tag = annotation or "O"
    else:  # Normal style
        for token in tokens:
            annotation_text = Annotation.query.get(token.annotation_id).text if token.annotation_id else "O"
            exported_annotations.append({
                'word': token.word,
                'annotation': annotation_text
            })

    # Generate export based on the format
    if format_type == 'json':
        return jsonify(exported_annotations)
    elif format_type == 'csv':
        csv_data = generate_csv_data(exported_annotations, style)
        return Response(csv_data, mimetype='text/csv', headers={"Content-Disposition": "attachment;filename=annotations.csv"})
    elif format_type == 'xml':
        xml_data = generate_xml_data(exported_annotations, style)
        return Response(xml_data, mimetype='application/xml', headers={"Content-Disposition": "attachment;filename=annotations.xml"})
    else:
        return jsonify({'error': 'Invalid export format'}), 400


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

