from flask import Blueprint, jsonify, request
from models.annotation import Annotation

annotations_bp = Blueprint('annotations', __name__)


@app.route('/add', methods=['POST'])
def add_annotation():
    data = request.json
    text = data.get('text', '')
    color = data.get('color', '')

    new_annotation = Annotation(text, color)
    db.session.add(new_annotation)
    db.session.commit()
    return jsonify({"message": "Added new annotation."}), 201

@app.route('/delete/<int:annotation_id>', methods=['DELETE'])
def delete_annotation(annotation_id):
    annotation = Annotation.query.get(annotation_id)
    if annotation is None:
        return jsonify({"message": "Annotation not found"}), 404

    db.session.delete(annotation)
    db.session.commit()
    return jsonify({"message": "Annotation deleted."}), 200

@app.route('/annotations', methods=['GET'])
def get_annotations():
    annotations = Annotation.query.all()
    output = []
    for annotation in annotations:
        output.append({
            'id': annotation.id,
            'text': annotation.text,
            'color': annotation.color
        })
    return jsonify(output)
