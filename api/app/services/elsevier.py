from datetime import datetime
from app.models.paper import Paper
from app import db

class ElsevierService:
    @staticmethod
    def fetch_papers(params:dict=None):
        '''
        Fetch papers from Elsevier API.\n
        `params` is a dictionary containing query parameters. If None, fetch all papers in database
        '''
        # @TODO: Implement fetching papers from Elsevier API
        return Paper.query.all()
    
    @staticmethod
    def create_papers(data):
        '''
        Create papers in batch.\n
        `data` is a list of dictionaries containing paper information
        '''
        papers = []
        for paper in data:
            date = datetime.strptime(paper.get('publish_date'), '%Y-%m-%d').date()
            new_paper = Paper(doi=paper.get('doi'),
                              publication=paper.get('publication'),
                              title=paper.get('title'),
                              author=paper.get('author'),
                              publish_date=date,
                              abstract=paper.get('abstract'),
                              url=paper.get('url'))
            db.session.add(new_paper)
            papers.append(new_paper)
        db.session.commit()
        return papers
    
    @staticmethod
    def delete_papers():
        '''
        Delete all papers in database
        '''
        db.session.query(Paper).delete()
        db.session.commit()
        return 'All papers deleted successfully.'