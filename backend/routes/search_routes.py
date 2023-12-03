from flask import Blueprint

search_routes = Blueprint('search_routes', __name__)
@search_routes.route('/search_all', methods=['GET'])
def search_all():
    search_query = request.args.get('q', '').strip().lower()  # Remove whitespace and convert to lowercase
    if not search_query:
        return jsonify([])  # Return an empty list if the search query is empty

    # Searching in PDF texts
    matched_pdf_texts = PdfText.query.filter(
        PdfText.text.ilike(f"%{search_query}%")
    ).all()
    pdf_output = [{'type': 'pdf', 'id': text.id, 'text': text.text, 'filename': text.filename} for text in matched_pdf_texts]

    # Searching in annotations with word boundary regex
    matched_annotations = Annotation.query.filter(
        or_(
            Annotation.text.ilike(f"%{search_query}%"),
            Annotation.color.ilike(f"%{search_query}%"),
            Annotation.text.op('~*')(rf'\m{re.escape(search_query)}\M')  # Use regex for word boundary matching
        )
    ).all()
    annotation_output = [{'type': 'annotation', 'id': annotation.id, 'text': annotation.text, 'color': annotation.color} for annotation in matched_annotations]

    # Combine both outputs
    output = pdf_output + annotation_output
    return jsonify(output)