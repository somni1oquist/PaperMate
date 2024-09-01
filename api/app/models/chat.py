import json
from app import db
from app.models.paper import Paper

class Chat(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    history = db.Column(db.JSON, nullable=True)
    timestamp = db.Column(db.DateTime, index=True, default=db.func.now())

    def __repr__(self):
        return f'<Chat {self.query}>'
    
    
    def get_related_papers(self):
        '''
        Get related papers from the latest chat history.
        '''
        papers = []
        latest_output = [content for content in self.history if content['role'] == 'model'][-1]
        response_text = latest_output['parts'][0]['text']
        for doi in json.loads(response_text):
            paper = Paper.query.filter_by(doi=doi).first()
            if paper:
                papers.append(paper)
        
        return papers