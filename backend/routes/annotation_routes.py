
import json
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
from transformers import pipeline, AutoTokenizer, AutoModelForTokenClassification

from collections import defaultdict
    
annotation_routes = Blueprint('annotation_routes', __name__)


ner_map = {0: '0', 1: 'B-OSOBA', 2: 'I-OSOBA', 3: 'B-ORGANIZÁCIA', 4: 'I-ORGANIZÁCIA', 5: 'B-LOKALITA', 6: 'I-LOKALITA'}
entity_color_map = {
    'B-OSOBA': '#FF5733',  # Example: red
    'I-OSOBA': '#FF5733',  # Same type, same color
    'B-ORGANIZÁCIA': '#33FF57',  # Example: green
    'I-ORGANIZÁCIA': '#33FF57',  # Same type, same color
    'B-LOKALITA': '#3357FF',  
    'I-LOKALITA': '#3357FF',  
}
ner_models = {
    'bertz': 'crabz/slovakbert-ner',
}
tokenizer = AutoTokenizer.from_pretrained("crabz/slovakbert-ner", add_prefix_space=True)
model = AutoModelForTokenClassification.from_pretrained("crabz/slovakbert-ner")

# Define your special tokens
special_tokens = [
    "<bold>", "</bold>", "<nbold>", "</nbold>",
    "<size>", "</size>", "<nsize>", "</nsize>",
    "<color>", "</color>", "<ncolor>", "</ncolor>",
    "<italic>", "</italic>", "<nitalic>", "</nitalic>",
]

# Add special tokens to the tokenizer
tokenizer.add_tokens(special_tokens)

# Resize the model's token embeddings to account for the new tokens
model.resize_token_embeddings(len(tokenizer))

# Create a new NER pipeline using the updated model and tokenizer
ner_pipeline = pipeline('ner', model=model, tokenizer=tokenizer)
def annotate_texts_with_ner(pdf_text_id):
    pdf_text = PdfText.query.get(pdf_text_id)
    if not pdf_text:
        return "PDF text not found", 404

    # Get NER annotations
    ner_annotations = ner_pipeline(pdf_text.text)

    # Start from the beginning of the text
    last_index = 0
    current_text = ''
    for ann in ner_annotations:
        # Append current word to form whole tokens; handle subword tokenization by checking for full words
        if ann['word'].startswith('Ġ'):
            # If it starts with 'Ġ', it's a new word
            if current_text:
                # Process the previous accumulated text if there is any
                process_token(current_text, last_index, last_index + len(current_text), pdf_text.id, current_annotation)
            # Reset for new word
            current_text = ann['word'][1:]  # Remove the 'Ġ' for clean text
            last_index = ann['start']  # Update the start index to current word's start
            current_annotation = get_annotation_id(ner_map.get(ann['entity'], '0'))
        else:
            # Continue appending to form a full word from subwords
            current_text += ann['word']

    # Process any remaining text
    if current_text:
        process_token(current_text, last_index, last_index + len(current_text), pdf_text.id, current_annotation)

    db.session.commit()
    return "Tokenization and annotation completed successfully."

def process_token(word, start, end, pdf_text_id, annotation_id):
    new_token = Token(word=word, start=start, end=end, pdf_text_id=pdf_text_id, annotation_id=annotation_id)
    db.session.add(new_token)

def get_annotation_id(entity_label):
    if entity_label == '0':  # Assume '0' means no annotation
        return None
    annotation = Annotation.query.filter_by(text=entity_label).first()
    if not annotation:
        # Assume entity_label is actually a label like 'B-OSOBA', not an ID
        color = entity_color_map.get(entity_label)
        annotation = Annotation(text=entity_label, color=color)
        db.session.add(annotation)
        db.session.flush()  # This assigns an ID to the new annotation
    return annotation.id

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
    return output.getvalue()
       

       



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
    style = request.args.get('style', 'normal')
    format_type = request.args.get('format', 'json')
    # Export annotations based on the requested format and style
    if format_type == 'json':
        return generate_jsonl_data(pdf_text_id)
        pass
    elif format_type == 'csv':
        if style == 'bio':
            # Call the function that generates 'bio' style CSV data
            csv_data = generate_csv_data(pdf_text_id)
            return Response(csv_data, mimetype='text/csv', headers={"Content-Disposition": f"attachment;filename=annotations_{pdf_text_id}.csv"})
        else:
            # Handle 'normal' style CSV export if necessary
            pass
    elif format_type == 'xml':
        # XML export logic (not shown for brevity)
        pass
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

