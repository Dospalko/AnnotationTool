# Assuming this is in a new file: routes/project_routes.py
from flask import Blueprint, request, jsonify
from models.project import Project
from extensions import db
from models.pdf_text import PdfText
import re
from PyPDF2 import PdfReader 
from docx import Document
import os
import json
from models.token import Token
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
            text = extract_text_line_by_line_with_styles(uploaded_file.stream, True, True, True, True, True, False)
            print(text)
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


def extract_text_with_formatting(file_path):
    """Extracts text from a PDF, attempting to preserve all formatting."""
    extracted_text = ''
    
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            # Extract text using multiple strategies to ensure all text is captured
            text = page.extract_text()
            if not text:  # If standard extraction fails, fall back to alternative methods
                text = page.extract_text(x_tolerance=2, y_tolerance=2)
            if not text:  # As a last resort, use OCR
                text = page.extract_text(use_text_flow=True)
            
            # Append page text to the overall text, add a page break at the end
            if text:
                extracted_text += text + '\n\n'  # Two new lines to indicate a page break
                
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

