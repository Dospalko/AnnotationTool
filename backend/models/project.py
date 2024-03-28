# Assuming this is in project.py
from extensions import db

class Project(db.Model):
    __tablename__ = 'project'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    pdf_texts = db.relationship('PdfText', backref='project', lazy=True)
