import json
from flask import current_app as app
from app import db
from app.models.paper import Paper
from app.models.chat import Chat
import google.generativeai as genai

class GeminiService:
    model = None
    
    def __init__(self):
        self.session = None

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
    
    def renew_chat_session(self, chat: Chat):
        """Renew or start a chat session based on the provided chat history."""
        GeminiService.load_model()
        chat_history = []
        if chat.parent_id:
            chat_history = [item.query for item in Chat.chats if chat.parent_id]
        self.session = GeminiService.model.start_chat(history=chat_history)

    def get_papers_for_chat(self, chat_id):
        """Fetch related papers based on the chat history or return all papers if no chat history exists."""
        if chat_id:
            prev_chat = Chat.query.get(chat_id)
            if prev_chat:
                self.renew_chat_session(prev_chat)
                return prev_chat.get_related_papers()
        return Paper.query.all()
    
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
    
    def mutate_papers(self, query, chat_id=None):
        """
        Mutate papers based on a query.

        Args:
            query: The criteria to mutate papers.
            chat_id: The chat ID to continue the conversation.

        Returns:
            The mutated papers in JSON format.

        Raises:
            ValueError: If no query or invalid response from Gemini.
        """
        if not query:
            raise ValueError('Missing query to interact with Gemini', 400)
        
        papers = self.get_papers_for_chat(chat_id)
        prompt = self.create_prompt(papers, query)

        current_chat = Chat(query, parent_id=chat_id)
        self.renew_chat_session(current_chat)
        response = self.session.send_message(prompt)

        try:
            papers_json = json.loads(response.text)
            current_chat.response = response.text
            db.session.add(current_chat)
            db.session.commit()
            return papers_json
        except json.JSONDecodeError:
            raise ValueError('Invalid response from Gemini', 500)