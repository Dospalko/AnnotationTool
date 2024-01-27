from extensions import db

class Annotation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(500))
    color = db.Column(db.String(10))  # Save the color as a hex string
    favorite = db.Column(db.Boolean, default=False)

    def __init__(self, text, color):
        self.text = text
        self.color = color

    def to_dict(self):
        return {
            'id': self.id,
            'text': self.text,
            'color': self.color,
            'favorite': self.favorite
        }