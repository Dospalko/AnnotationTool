from flask import Flask
from flask_cors import CORS
from config import DevelopmentConfig
from extensions import db, migrate

def create_app(config_class=DevelopmentConfig):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Enable CORS
    CORS(app)

    db.init_app(app)
    migrate.init_app(app, db)
    # Import models
    from models.annotation import Annotation
    from models.pdf_text import PdfText
    from models.token import Token
    from models.project import Project

    # Import routes
    from routes.annotation_routes import annotation_routes
    from routes.pdf_routes import pdf_routes
    from routes.project_routes import project_routes
    from routes.model_upload_routes import model_upload_routes
    app.register_blueprint(annotation_routes)
    app.register_blueprint(pdf_routes)
    app.register_blueprint(project_routes)
    app.register_blueprint(model_upload_routes)
    return app

if __name__ == '__main__':
    app = create_app()
    app.run()
