from app import db

class Paper(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    publication = db.Column(db.String(255), nullable=False)
    doi = db.Column(db.String(255), nullable=True)
    title = db.Column(db.String(255), nullable=False)
    author = db.Column(db.String(255), nullable=False)
    publish_date = db.Column(db.Date, nullable=False)
    abstract = db.Column(db.Text, nullable=False)
    synopsis = db.Column(db.Text, nullable=True)
    relevance = db.Column(db.Integer, nullable=True)
    url = db.Column(db.String(255), nullable=True)
