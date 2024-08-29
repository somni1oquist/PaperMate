import json
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
    mutation = db.Column(db.Text, nullable=True) # Mutated json data of the paper

    def __repr__(self):
        return f'<Paper {self.title}>'
    
    def to_dict(self):
        return {key: value for key, value in self.__dict__.items() if key not in ['_sa_instance_state', 'id']}
    
    def mutation_dict(self):
        '''
        Return a JSON object of the mutation data
        '''
        if self.mutation is None:
            return
        # Remove sa_instance_state, id and mutation from json object
        json_obj = { key: value for key, value in self.__dict__.items() if key not in ['_sa_instance_state', 'id', 'mutation']}
        mutation = json.loads(self.mutation)
        json_obj.update(mutation)
        return json_obj