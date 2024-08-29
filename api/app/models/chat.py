import json
from app import db
from app.models.paper import Paper

class Chat(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    query = db.Column(db.String(255), nullable=False)
    response = db.Column(db.String(255), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('chat.id', name='fk_chat_parent_id'), nullable=True)
    chats = db.relationship('Chat', backref=db.backref('parent', remote_side=[id]), cascade='all, delete-orphan')
    timestamp = db.Column(db.DateTime, server_default=db.func.now())

    def __repr__(self):
        return f'<Chat {self.query}>'
    
    def __init__(self, query, response=None, parent_id=None):
        self.query = query
        self.response = response
        self.parent_id = parent_id
    
    def to_dict(self):
        return {key: value for key, value in self.__dict__.items() if key not in ['_sa_instance_state']}
    
    def get_related_papers(self):
        '''
        Return a list of dois from the chat history
        '''
        dictionary = json.loads(self.response)
        papers = []
        for item in dictionary:
            doi = item.get('doi', None)
            paper = Paper.query.filter_by(doi=doi).first()
            if paper:
                papers.append(paper)
        
        return papers