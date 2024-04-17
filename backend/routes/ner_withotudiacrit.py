ner_pipeline = pipeline('ner', model='crabz/slovakbert-ner')

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
                text = extract_text(uploaded_file.stream)
                styled_text = extract_text_line_by_line_with_styles(uploaded_file.stream, True, True, True, True, True, True)
                ext = pre_process(styled_text)
                text = ext  # Use styled text as the final text
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
