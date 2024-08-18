import json
from flask import current_app as app
from app import db
from app.models.paper import Paper
import google.generativeai as genai

class GeminiService:
    model = None

    @classmethod
    def load_model(cls):
        if cls.model is None:
            key = app.config['LLM_API_KEY']
            name = app.config['LLM_MODEL_NAME']
            if key is None or name is None:
                raise ValueError('Missing API key or model name for LLM')
            genai.configure(api_key=key)
            cls.model = genai.GenerativeModel(name,
                                              generation_config={'response_mime_type': 'application/json'})
    
    @staticmethod
    def rate_papers(query):
        '''Rate papers based on relevance to a query'''
        GeminiService.load_model()
        papers = Paper.query.all()
        prompt = '''
        Rate the following papers' abstract based on relevance to the criteria on a scale of 0-10:
        '''
        for paper in papers:
            prompt += f'''
            ID: {paper.id}
            Title: {paper.title}
            Abstract: {paper.abstract}
            '''
        # Specify criteria to prompt
        prompt += f'''
        Criteria: {query}
        '''
        # Specify response format
        prompt += '''
        Response format: [{ 'id': 1, 'relevance': 0, 'synopsis': '...' }]
        '''
        
        response = GeminiService.model.generate_content(prompt)
        res_obj = json.loads(response.text)
        for obj in res_obj:
            paper = Paper.query.get(obj.get('id'))
            paper.relevance = obj.get('relevance')
            paper.synopsis = obj.get('synopsis')
            db.session.add(paper)
        db.session.commit()
        return Paper.query.all()
    
    @staticmethod
    def mutate_papers(query):
        GeminiService.load_model()
        # Apply mutation logic based on query here
        return Paper.query.all()
    
    @staticmethod
    def filter_papers(query):
        GeminiService.load_model()
        # Apply filter logic based on query here
        return Paper.query.all()