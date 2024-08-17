from app.models.paper import Paper
from app import db

class ElsevierService:
    @staticmethod
    def fetch_papers():
        return Paper.query.all()

    @staticmethod
    def fetch_paper(id):
        return Paper.query.get(id)
    
    @staticmethod
    def create_papers(data):
        papers = []
        for paper in data:
            new_paper = Paper(title=paper['title'], author=paper['author'], year=paper['year'])
            db.session.add(new_paper)
            papers.append(new_paper)
        db.session.commit()
        return papers