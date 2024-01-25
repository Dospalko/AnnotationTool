from extensions import db
class Token(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    word = db.Column(db.String(50), unique=False)  # Add unique constraint
    start = db.Column(db.Integer, nullable=False)  # Add start attribute
    end = db.Column(db.Integer, nullable=False)  # Add end attribute
    pdf_text_id = db.Column(db.Integer, db.ForeignKey('pdf_text.id'), nullable=False)
    annotation_id = db.Column(db.Integer, db.ForeignKey('annotation.id'), nullable=True)

    annotation = db.relationship('Annotation', backref=db.backref('tokens', lazy=True))