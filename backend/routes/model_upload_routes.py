from flask import Blueprint, jsonify, request
import os

model_upload_routes = Blueprint('model_upload_routes', __name__)

ALLOWED_EXTENSIONS = {'pt', 'h5', 'hdf5', 'bin'}  # Add the allowed model file extensions

# Define the maximum file size (1GB)
MAX_FILE_SIZE_BYTES = 1024 * 1024 * 1024  

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@model_upload_routes.route('/upload_model', methods=['POST'])
def upload_model():
    if 'model' not in request.files:
        return jsonify({"error": "No model file provided"}), 400

    model_file = request.files['model']

    if model_file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if model_file and allowed_file(model_file.filename):
        # Check file size
        if len(model_file.read()) > MAX_FILE_SIZE_BYTES:
            return jsonify({"error": "File size exceeds maximum limit (1GB)"}), 400

        filename = model_file.filename
        # Change the upload directory to your desired location
        upload_directory = 'path/to/your/upload/directory'
        model_path = os.path.join(upload_directory, filename)
        model_file.seek(0)  # Reset file pointer to the beginning before saving
        model_file.save(model_path)

        return jsonify({"message": "Model uploaded successfully", "model_path": model_path}), 200
    else:
        return jsonify({"error": "Invalid model file format or extension"}), 400
