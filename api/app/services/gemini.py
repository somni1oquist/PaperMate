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
    def rate_papers(papers:list[Paper], query):
        '''
        Rate papers based on relevance to a query.\n
        `papers`: **Required.** List of Paper to rate\n
        `query`: **Required.** The criteria to rate papers on relevance
        '''
        GeminiService.load_model()
        # Raise error if no papers found
        if not papers:
            raise ValueError('No papers to rate.', 404)
        prompt = '''
        Rate the following papers' abstract based on relevance to the criteria on a scale of 0-10:
        '''
        for paper in papers:
            prompt += f'''
            DOI: {paper.doi}
            Title: {paper.title}
            Abstract: {paper.abstract}
            '''
        # Specify criteria to prompt
        if not query:
            raise ValueError('Missing query for rating papers.', 400)
        prompt += f'''
        Criteria to rate: {query}
        '''
        # Specify response format
        prompt += '''
        Response format: [{ 'doi': 'example', 'relevance': 0, 'synopsis': '...' }, ...]
        '''
        # Generate content
        response = GeminiService.model.generate_content(prompt)
        res_obj = json.loads(response.text)
        for obj in res_obj:
            paper = next((p for p in papers if p.doi == obj['doi']))
            paper.relevance = obj['relevance']
            paper.synopsis = obj['synopsis']
            db.session.commit()
        return papers
    
    @staticmethod
    def mutate_papers(papers:list[Paper], query):
        '''
        Mutate papers based on a query.\n
        `papers` is a list of Paper objects. If empty, fetch all papers\n
        `query` is a string describing the mutation criteria
        '''
        GeminiService.load_model()
        # Apply mutation logic based on query here
        return Paper.query.all()