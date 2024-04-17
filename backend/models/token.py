from extensions import db
class Token(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    word = db.Column(db.String(255), nullable=False)
    start = db.Column(db.Integer, nullable=False)
    end = db.Column(db.Integer, nullable=False)
    pdf_text_id = db.Column(db.Integer, db.ForeignKey('pdf_text.id'), nullable=False)
    annotation_id = db.Column(db.Integer, db.ForeignKey('annotation.id'), nullable=True)

    annotation = db.relationship('Annotation', backref=db.backref('tokens', lazy=True))

    def to_dict(self):
        """Convert token object to a dictionary."""
        return {
            'id': self.id,
            'word': self.word,
            'start': self.start,
            'end': self.end,
            'annotation_id': self.annotation_id,
            'annotation': self.annotation.to_dict() if self.annotation else None
        }
