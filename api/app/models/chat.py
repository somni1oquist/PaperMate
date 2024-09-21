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
    
    def __str__(self):
        return self.history[0]["parts"][0]["text"]