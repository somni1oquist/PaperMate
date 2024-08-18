from app.models.paper import Paper
from app import db

class GeminiService:
    @staticmethod
    def rate_papers():
        # Apply rating logic here
        return Paper.query.all()
    
    @staticmethod
    def mutate_papers(query):
        # Apply mutation logic based on query here
        return Paper.query.all()
    
    '''
    @staticmethod
    def get_top_20_relevant_papers():
        # Assume the score field name is 'score'
        # Take the top 20 papers based on the score sorted from highest to lowest
        papers = Paper.query.all()
        return papers
    '''

