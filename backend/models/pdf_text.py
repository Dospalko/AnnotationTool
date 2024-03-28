# Assuming this is in pdf_text.py
from extensions import db

class PdfText(db.Model):
    __tablename__ = 'pdf_text'
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=True)

    def __init__(self, text, filename, project_id=None):
        self.text = text
        self.filename = filename
        self.project_id = project_id
