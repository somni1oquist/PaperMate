from app import db

class Paper(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    author = db.Column(db.String(255), nullable=False)
    year = db.Column(db.Integer, nullable=False)

    @staticmethod
    def get_all():
        return Paper.query.all()

    @staticmethod
    def create(data):
        new_paper = Paper(title=data['title'], author=data['author'], year=data['year'])
        db.session.add(new_paper)
        db.session.commit()
        return new_paper