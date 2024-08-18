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
    
    @staticmethod
    def filter_papers(query):
        # Apply filter logic based on query here
        return Paper.query.all()

import requests

def search_gemini(query):
    api_key = 'YOUR_GEMINI_API_KEY'  # Replace with your Gemini API key
    url = f'https://api.gemini.com/v1/search?query={query}'
    headers = {'Authorization': f'Bearer {api_key}'}
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return response.json()
