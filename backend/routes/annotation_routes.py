from flask import Blueprint, jsonify, request, Response
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



@annotation_routes.route('/export_annotations/<int:pdf_text_id>', methods=['GET'])
def export_annotations(pdf_text_id):
    tokens = Token.query.filter(Token.pdf_text_id == pdf_text_id,
                                Token.annotation_id.isnot(None)).order_by(Token.id).all()
    annotations_data = []
    annotation = None
    label_words = []  # To accumulate words for a single annotation

    for token in tokens:
        if annotation is None or token.annotation_id != annotation['annotation_id']:
            if annotation:
                annotation['annotations'][0]['label'] = ' '.join(label_words)
                annotations_data.append(annotation)
            annotation = {
                "text_id": f"text{pdf_text_id}",
                "filename": token.pdf_text_id,
                "annotations": [{
                    "label": token.word,  # Initially set to the first word; will be updated
                    "type": token.annotation.text,
                    "start": token.start,
                    "end": token.end
                }],
                "annotation_id": token.annotation_id  # Keep track of the current annotation_id
            }
            label_words = [token.word]  # Reset label_words with the current token's word
        else:
            # Append current word to label_words and update the end of the annotation
            label_words.append(token.word)
            annotation['annotations'][0]['end'] = token.end

    # Add the last annotation
    if annotation:
        annotation['annotations'][0]['label'] = ' '.join(label_words)
        annotations_data.append(annotation)

    return jsonify({"annotations": annotations_data})



def convert_to_xml(bio_data):
    root = Element('annotation')
    document = SubElement(root, 'document', {'source': bio_data['source']})
    sentence = SubElement(document, 'sentence', {
    'id': str(bio_data['sentence_id'])})

    for token in bio_data['tokens']:
        token_elem = SubElement(sentence, 'token', {
            'id': str(token['id']),
            'begin': str(token['begin']),
            'end': str(token['end'])
        })
        token_elem.text = token['word']

    entities = SubElement(root, 'entities')
    for entity in bio_data['entities']:
        entity_elem = SubElement(entities, 'entity', {
            'type': entity['type'],
            'begin': str(entity['begin']),
            'end': str(entity['end'])
        })
        entity_elem.text = entity['text']

    return tostring(root, encoding='unicode')


@annotation_routes.route('/export_annotations_bio/<int:pdf_text_id>', methods=['GET'])
def export_annotations_bio(pdf_text_id):
    export_format = request.args.get('format', 'json')
    tokens = Token.query.filter_by(pdf_text_id=pdf_text_id).all()
    annotations = Annotation.query.all()
    annotation_dict = {ann.id: ann.text for ann in annotations}

    bio_data = {
        'source': 'example.txt',
        'sentence_id': 1,
        'tokens': [],
        'entities': []
    }
    current_entity = None

    for token in tokens:
        token_data = {
            'id': token.id,
            'begin': token.start,
            'end': token.end,
            'word': token.word
        }

        if token.annotation_id:
            ann_text = annotation_dict[token.annotation_id]
            if current_entity and current_entity['type'] == ann_text:
                token_data['BIO'] = 'I-' + ann_text
            else:
                token_data['BIO'] = 'B-' + ann_text
                current_entity = {
                    'type': ann_text, 'begin': token.start, 'end': token.end, 'text': ann_text}
                bio_data['entities'].append(current_entity)
        else:
            token_data['BIO'] = 'O'
            current_entity = None

        bio_data['tokens'].append(token_data)

    if export_format == 'xml':
        xml_data = convert_to_xml(bio_data)
        return Response(xml_data, mimetype='text/xml')

    elif export_format == 'csv':
        output = StringIO()
        writer = csv.writer(output)
        header = ['id', 'word', 'begin', 'end', 'BIO']
        writer.writerow(header)
        for token in bio_data["annotation"]["document"]["sentence"]["tokens"]:
            row = [token['id'], token['word'],
                   token['begin'], token['end'], token['BIO']]
            writer.writerow(row)
        output.seek(0)
        return Response(output, mimetype='text/csv', headers={"Content-disposition": "attachment; filename=annotations.csv"})

    else:  # Default to JSON
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

@annotation_routes.route('/relations', methods=['POST'])
def create_relation():
    data = request.json
    source_token_id = data.get('source_token_id')
    target_token_id = data.get('target_token_id')
    relation_type = data.get('relation_type')

    if not all([source_token_id, target_token_id, relation_type]):
        return jsonify({"error": "Missing data for creating a relation"}), 400

    new_relation = Relation(source_token_id=source_token_id, target_token_id=target_token_id, relation_type=relation_type)
    db.session.add(new_relation)
    db.session.commit()
    return jsonify(new_relation.to_dict()), 201

@annotation_routes.route('/relations', methods=['GET'])
def get_relations():
    relations = Relation.query.all()
    return jsonify([relation.to_dict() for relation in relations]), 200