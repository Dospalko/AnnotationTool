from extensions import db
class Relation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    source_token_id = db.Column(db.Integer, db.ForeignKey('token.id'), nullable=False)
    target_token_id = db.Column(db.Integer, db.ForeignKey('token.id'), nullable=False)
    relation_type = db.Column(db.String(50))

    source_token = db.relationship('Token', foreign_keys=[source_token_id], backref='source_relations')
    target_token = db.relationship('Token', foreign_keys=[target_token_id], backref='target_relations')

    def to_dict(self):
        return {
            'id': self.id,
            'source_token_id': self.source_token_id,
            'target_token_id': self.target_token_id,
            'relation_type': self.relation_type
        }
