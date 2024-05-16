# Assuming this is in a new file: routes/project_routes.py
import csv
from flask import Blueprint, request, jsonify
from extensions import db
from models.annotation import Annotation
from models.pdf_text import PdfText
from models.project import Project
from models.token import Token
import re
from io import StringIO
from PyPDF2 import PdfReader 
from docx import Document
import os
import json
from routes.extract import pre_process,extract_text_line_by_line_with_styles,extract_text
import pdfplumber
project_routes = Blueprint('project_routes', __name__)

@project_routes.route('/upload_jsonl_to_project/<int:project_id>', methods=['POST'])
def upload_jsonl_to_project(project_id):
    if 'jsonl_file' not in request.files:
        return jsonify({"error": "No JSONL file provided."}), 400

    jsonl_file = request.files['jsonl_file']

    if not jsonl_file.filename.endswith('.jsonl'):
        return jsonify({"error": "Invalid file type. Only .jsonl files are accepted."}), 400

    lines = jsonl_file.read().decode('utf-8').splitlines()
    uploaded_files_info = []

    for index, line in enumerate(lines):
        try:
            json_data = json.loads(line)
            text_content = json_data.get('text', '')
            filename = f"{jsonl_file.filename}_line{index+1}.json"
            new_pdf_text = PdfText(text=text_content, filename=filename, project_id=project_id)
            db.session.add(new_pdf_text)
            uploaded_files_info.append({'filename': filename, 'status': 'Uploaded successfully'})
        except json.JSONDecodeError as e:
            uploaded_files_info.append({'filename': f"Line {index+1}", 'status': f"Failed to process: {str(e)}"})

    db.session.commit()
    return jsonify(uploaded_files_info), 201

@project_routes.route('/delete_all_files_in_project/<int:project_id>', methods=['DELETE'])
def delete_all_files_in_project(project_id):
    # Fetch all PdfText records for the given project_id
    pdf_texts_to_delete = PdfText.query.filter_by(project_id=project_id).all()

    if not pdf_texts_to_delete:
        return jsonify({"error": "No files found for the specified project."}), 404

    try:
        # Delete all tokens associated with the fetched PdfText records
        for pdf_text in pdf_texts_to_delete:
            Token.query.filter_by(pdf_text_id=pdf_text.id).delete()

        # Now safe to delete PdfText records since related tokens are removed
        for pdf_text in pdf_texts_to_delete:
            db.session.delete(pdf_text)

        db.session.commit()
        return jsonify({"message": "All files and associated tokens have been deleted successfully."}), 200
    except Exception as e:
        db.session.rollback()  # Roll back in case of error during deletion
        return jsonify({"error": str(e)}), 500

@project_routes.route('/projects', methods=['POST'])
def create_project():
    data = request.get_json()
    name = data.get('name')
    new_project = Project(name=name)
    db.session.add(new_project)
    db.session.commit()
    return jsonify({'message': 'Projekt bol vytvorený úspešne', 'project_id': new_project.id}), 201

@project_routes.route('/projects', methods=['GET'])
def list_projects():
    projects = Project.query.all()
    return jsonify([{'id': project.id, 'name': project.name} for project in projects]), 200

@project_routes.route('/projects/<int:project_id>', methods=['GET'])
def get_project_details(project_id):
    project = Project.query.get_or_404(project_id)
    return jsonify({'id': project.id, 'name': project.name}), 200

@project_routes.route('/projects/<int:project_id>/files', methods=['GET'])
def get_project_files(project_id):
    project = Project.query.get_or_404(project_id)
    files = PdfText.query.filter_by(project_id=project.id).all()
    return jsonify([{'id': file.id, 'filename': file.filename} for file in files]), 200

@project_routes.route('/upload_files_to_project/<int:project_id>', methods=['POST'])
def upload_files_to_project(project_id):
    files = request.files.getlist('files')
    options = json.loads(request.form.get('extractionOptions', '{}'))  # Retrieve options from form data

    # Default extraction settings if not provided
    bold = options.get('bold', False)
    italic = options.get('italic', False)
    colored = options.get('colored', False)
    sized = options.get('sized', False)
    ssized = options.get('ssize', False)
    if not files:
        return jsonify({"error": "No files provided."}), 400

    uploaded_files_info = []

    for uploaded_file in files:
        filename = uploaded_file.filename
        file_extension = os.path.splitext(filename)[1].lower()
        if file_extension not in ['.pdf', '.docx', '.txt']:
            continue  # Skip files with invalid formats

        if file_extension == '.pdf':
            text = extract_text(uploaded_file.stream)
            text = extract_text_line_by_line_with_styles(uploaded_file.stream, bold, italic, colored, sized, ssized, False)
        elif file_extension == '.docx':
            text = extract_text_from_docx(uploaded_file.stream)
        elif file_extension == '.txt':
            text = uploaded_file.stream.read().decode('utf-8')

        # Normalize whitespaces while preserving lines
        text = pre_process(text)

        new_pdf_text = PdfText(text=text, filename=filename, project_id=project_id)
        db.session.add(new_pdf_text)
        uploaded_files_info.append({'filename': filename, 'status': 'Uploaded successfully'})

    db.session.commit()
    return jsonify(uploaded_files_info), 201


    return extracted_text
def extract_text_from_docx(stream):
    """Extracts text from DOCX files, preserving paragraph breaks."""
    doc = Document(stream)
    return '\n'.join(paragraph.text for paragraph in doc.paragraphs)



@project_routes.route('/projects/<int:project_id>', methods=['DELETE'])
def delete_project(project_id):
    project = Project.query.get_or_404(project_id)
    db.session.delete(project)
    db.session.commit()
    return jsonify({'message': 'Project deleted successfully'}), 200



@project_routes.route('/import_annotated_text/<int:project_id>', methods=['POST'])
def import_annotated_text(project_id):
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    file_type = file.filename.rsplit('.', 1)[1].lower()

    if file_type not in ['jsonl', 'csv']:
        return jsonify({'error': 'Unsupported file type'}), 400

    # Handle JSONL or CSV file
    if file_type == 'jsonl':
        return import_jsonl(file, project_id)
    else:  # CSV import
        return import_csv(file, project_id)

def import_jsonl(file, project_id):
    lines = file.read().decode('utf-8').splitlines()
    project = Project.query.get(project_id)
    if not project:
        return jsonify({'error': 'Project not found'}), 404

    full_text = ""  # Accumulate the full text from all lines

    # First pass to construct the full text and validate data
    for line in lines:
        data = json.loads(line)
        full_text += data['text'] + '\n'  # Append text from each line

    # Create a PdfText object for the entire project using the full text
    pdf_text = PdfText(text=full_text.strip(), filename=f"annotated_{project_id}.pdf", project_id=project_id)
    db.session.add(pdf_text)
    db.session.flush()  # Assigns an ID to pdf_text for token reference

    start_offset = 0  # Track the global start offset of each token
    # Second pass to create tokens now that we have pdf_text.id
    for line in lines:
        data = json.loads(line)
        annotations_data = data.get('labels', [])
        text_content = data['text'] + '\n'  # Include newline to maintain format

        tokens = text_content.split()  # Split by spaces to create tokens
        local_start = 0  # Local start position for tokens within the line

        for word in tokens:
            # Calculate the end position of the token within the current line
            end_position = local_start + len(word)
            
            # Create a token with no annotation initially
            token = Token(
                word=word,
                start=start_offset + local_start,  # Global position start
                end=start_offset + end_position,  # Global position end
                pdf_text_id=pdf_text.id,
                annotation_id=None
            )

            # Check if there's an annotation for the current token
            for annotation_data in annotations_data:
                if start_offset + local_start >= annotation_data['start'] and start_offset + end_position <= annotation_data['end']:
                    annotation = Annotation.query.filter_by(text=annotation_data['label']).first()
                    if annotation:
                        token.annotation_id = annotation.id
                        break  # Found annotation, no need to continue checking

            db.session.add(token)
            local_start = end_position + 1  # Update local start to the next token position

        start_offset += len(text_content)  # Update the global start offset after the whole line

    db.session.commit()
    return jsonify({'message': 'JSONL file imported successfully with full text and annotations'}), 201


def import_csv(file, project_id):
    file_content = file.read().decode('utf-8')
    reader = csv.DictReader(StringIO(file_content))

    project = Project.query.get(project_id)
    if not project:
        return jsonify({'error': 'Project not found'}), 404

    all_text = []  # List to hold all text before creating a PdfText
    tokens_data = []  # List to accumulate token data for each line

    for row in reader:
        tokens_list = json.loads(row['tokens'].replace("'", '"'))
        try:
            annotations_ids = [int(id.strip().replace("'", "")) for id in row['ner_tags'].strip("[]").split(',')]
        except ValueError as e:
            print(f"Error parsing annotations: {e}")
            continue  # Skip this row if there's a problem parsing the annotations

        # Ensure we have the same number of annotations as tokens
        annotations_ids = (annotations_ids + [0] * len(tokens_list))[:len(tokens_list)]

        # Save full line text for PdfText
        all_text.append(' '.join(tokens_list))
        # Save tokens and annotations for creating Token objects
        tokens_data.append((tokens_list, annotations_ids))

    # Join all text with new lines to maintain line-by-line structure
    consolidated_text = '\n'.join(all_text)
    pdf_text = PdfText(text=consolidated_text, filename=f"consolidated_{project_id}.pdf", project_id=project_id)
    db.session.add(pdf_text)
    db.session.flush()

    start_offset = 0
    for line_index, (tokens_list, annotations_ids) in enumerate(tokens_data):
        for token, ann_id in zip(tokens_list, annotations_ids):
            end_offset = start_offset + len(token)
            annotation_id = None if ann_id == 0 else ann_id
            new_token = Token(word=token, start=start_offset, end=end_offset, pdf_text_id=pdf_text.id, annotation_id=annotation_id)
            db.session.add(new_token)
            start_offset = end_offset + 1  # Increment start_offset for the next token, including spaces

        # Insert a newline token at the end of each line only if it's not the last line
        if line_index < len(tokens_data) - 1 and not tokens_list[-1].endswith('\n'):
            newline_token = Token(word='\n', start=start_offset, end=start_offset, pdf_text_id=pdf_text.id, annotation_id=None)
            db.session.add(newline_token)
            start_offset += 1  # Increment start_offset for the newline

    db.session.commit()
    return jsonify({'message': 'CSV file processed successfully with line-by-line separation maintained'}), 201
