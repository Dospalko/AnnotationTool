from flask import Blueprint, jsonify, request
from models.pdf_text import PdfText

pdf_texts_bp = Blueprint('pdf_texts', __name__)

@app.route('/tokenize_pdf/<int:pdf_text_id>', methods=['GET'])
def tokenize_pdf(pdf_text_id):
    # 1. Retrieve the text for the given PDF ID
    pdf_text_record = PdfText.query.get_or_404(pdf_text_id)

    # 2. Tokenize the text
    tokens = word_tokenize(pdf_text_record.text)

    # 3. Return the tokens as a JSON response
    return jsonify(tokens)

@app.route('/save_tokens/<int:pdf_text_id>', methods=['POST'])
def save_tokens(pdf_text_id):
    data = request.json
    tokens = data.get('tokens', [])

    # First, let's delete any existing tokens for this pdf_text_id
    Token.query.filter_by(pdf_text_id=pdf_text_id).delete()

    # Now, let's insert the new tokens
    for word in tokens:
        token = Token(word=word, pdf_text_id=pdf_text_id)
        db.session.add(token)

    db.session.commit()

    return jsonify({"message": "Tokens saved successfully."}), 200


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

