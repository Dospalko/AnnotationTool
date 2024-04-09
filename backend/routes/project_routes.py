# Assuming this is in a new file: routes/project_routes.py
from flask import Blueprint, request, jsonify
from models.project import Project
from extensions import db
from models.pdf_text import PdfText
import re
from PyPDF2 import PdfReader 
from docx import Document
import os
project_routes = Blueprint('project_routes', __name__)

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
    files = request.files.getlist('files')  # Use getlist to support multiple files

    if not files:
        return jsonify({"error": "No files provided."}), 400

    uploaded_files_info = []

    for uploaded_file in files:
        if uploaded_file:
            filename = uploaded_file.filename
            file_extension = os.path.splitext(filename)[1].lower()
            if file_extension not in ['.pdf', '.docx', '.txt']:
                continue  # Skip files with invalid formats

            text = ''
            if file_extension == '.pdf':
                pdf_reader = PdfReader(uploaded_file.stream)
                text = ' '.join(page.extract_text() for page in pdf_reader.pages if page.extract_text())
            elif file_extension == '.docx':
                doc = Document(uploaded_file.stream)
                text = ' '.join(p.text for p in doc.paragraphs)
            elif file_extension == '.txt':
                text = uploaded_file.stream.read().decode('utf-8')
            
            text = re.sub(r'\s+', ' ', text).strip()
            new_pdf_text = PdfText(text=text, filename=filename, project_id=project_id)
            db.session.add(new_pdf_text)
            uploaded_files_info.append({'filename': filename, 'status': 'Uploaded successfully'})

    db.session.commit()

    if uploaded_files_info:
        return jsonify(uploaded_files_info), 201
    else:
        return jsonify({"error": "No valid files were uploaded. Please ensure you are uploading PDF, DOCX, or TXT files."}), 400


@project_routes.route('/projects/<int:project_id>', methods=['DELETE'])
def delete_project(project_id):
    project = Project.query.get_or_404(project_id)
    db.session.delete(project)
    db.session.commit()
    return jsonify({'message': 'Project deleted successfully'}), 200
