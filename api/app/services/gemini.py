import json
from sqlite3 import DataError, OperationalError
from flask import current_app as app
from app import db
from app.models.paper import Paper
from app.models.chat import Chat
import google.generativeai as genai

class GeminiService:
    model = None

    @classmethod
    def load_model(cls):
        """Load the LLM model if not already loaded."""
        if cls.model is None:
            key = app.config.get('LLM_API_KEY')
            name = app.config.get('LLM_MODEL_NAME')
            if not key or not name:
                raise ValueError('Missing API key or model name for LLM')
            
            genai.configure(api_key=key)
            system_instruction = '''
                1. This is a system for automating search, scanning, and analysis for literature.
                2. Researchers are the target users.
                3. Based on the given query, you may need to rate or add columns to the data.
                4. Store data in a fixed format:
                [ { doi: mutation: { ... } }, ... ]
                5. Only include doi as object ID in JSON response to avoid long text.
            '''
            cls.model = genai.GenerativeModel(
                name,
                system_instruction=system_instruction,
                generation_config={'response_mime_type': 'application/json'}
            )
    
    def create_prompt(self, papers, query):
        """Create a structured prompt from the papers and query."""
        if not papers:
            raise ValueError('No papers to rate.', 404)
        
        papers_dict = {paper.doi: {'title': paper.title, 'abstract': paper.abstract} for paper in papers}
        prompt = json.dumps(papers_dict)
        prompt += f'''
        For the data above, mutate the data based on query: {query}
        Return the mutated data using doi as key. No nested structure.
        Exclude title and abstract from the result.
        '''
        return prompt
    
    def analyse_papers(self, query):
        """
        Generate relevance and synopsis for papers based on a query.

        Args:
            query: The criteria to rate papers.

        Returns:
            The rated papers.

        Raises:
            ValueError: If no query or invalid response from Gemini.
        """
        GeminiService.load_model()

        papers = Paper.query.all()
        
        if not query:
            raise ValueError('Missing query for rating papers.', 400)

        # Generate content
        query += '\nRate the relevance on scale of 0-10 and provide a synopsis for the papers.'
        prompt = self.create_prompt(papers, query)
        response = self.model.generate_content(prompt)

        try:
            papers_json = json.loads(response.text)
            for doi, analysis in papers_json.items():
                paper = next((p for p in papers if p.doi == doi))
                paper.relevance = analysis['relevance']
                paper.synopsis = analysis['synopsis']
            db.session.commit()
            return papers
        except json.JSONDecodeError:
            raise ValueError('Invalid response from Gemini', 500)
    
    def mutate_papers(self, query):
        """
        Mutate papers based on a query.

        Args:
            query: The criteria to mutate papers.

        Returns:
            The mutated papers in JSON format.

        Raises:
            ValueError: If no query or invalid response from Gemini.
        """
        GeminiService.load_model()
        if not query:
            raise ValueError('Missing query to interact with Gemini', 400)
        
        # Prepare chat history
        current_chat = Chat.query.order_by(Chat.timestamp.desc()).first()

        papers = current_chat.get_related_papers() if current_chat else Paper.query.all()

        if not current_chat:
            current_chat = Chat(history=[])
            db.session.add(current_chat)
        
        prompt = self.create_prompt(papers, query)
        session = GeminiService.model.start_chat(history=current_chat.history)
        response = session.send_message(prompt)

        try:
            papers_json = json.loads(response.text)
        except json.JSONDecodeError:
            raise ValueError('Invalid response from Gemini', 500)
        

        # Save chat history
        user_content = { 'role': 'user', 'parts': [ { 'text': query } ] }
        model_content = { 'role': 'model', 'parts': [ { 'text': response.text } ] }
        # Content(parts=[Part(text=query)], role='user'),
        # Content(parts=[Part(text=response.text)], role='model')
        current_chat.history.append(user_content)
        current_chat.history.append(model_content)

        # Handle database errors
        try:
            db.session.commit()
        except OperationalError as op_err:
            raise ValueError(f'Error saving chat history: {str(op_err)}', 500)
        except DataError as data_err:
            raise ValueError(f'Error saving chat history: {str(data_err)}', 500)
        
        return papers_json