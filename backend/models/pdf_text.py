from extensions import db
class PdfText(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text)
    filename = db.Column(db.String(255))  # New column to store filename
  
    def __init__(self, text, filename):
        self.text = text
        self.filename = filename