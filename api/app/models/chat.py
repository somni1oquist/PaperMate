import json
import uuid
from app import db
from app.models.paper import Paper

class Chat(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    parent_id = db.Column(db.String(36), db.ForeignKey('chat.id', name='fk_chat_parent_id'), nullable=True)
    chats = db.relationship('Chat', 
                            backref=db.backref('parent', remote_side=[id]),
                            lazy='dynamic', cascade='all, delete-orphan',
                            order_by='Chat.timestamp')
    history = db.Column(db.JSON, nullable=False)
    timestamp = db.Column(db.DateTime, index=True, default=db.func.now())

    def __repr__(self):
        return f'<Chat instruction: {self.history[0]["parts"][0]["text"]}>'
    
    
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