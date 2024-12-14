from flask import request, current_app as app
from werkzeug.exceptions import BadRequest
from flask_restx import Namespace, Resource, fields
from app.models.paper import Paper
from app.services.gemini import GeminiService
from app import socketio
from app.models.chat import Chat
from app.services import get_source


api = Namespace('papers', description='Operations related to papers')
gemini = GeminiService()
Source = get_source()

paper_model = api.model('Paper', {
    'doi': fields.String(required=True, description='DOI of the paper'),
    'title': fields.String(required=True, description='Title of the paper'),
    'abstract': fields.String(required=True, description='Abstract of the paper'),
    'author': fields.String(required=True, description='Author of the paper'),
    'publication': fields.String(required=True, description='Publication name'),
    'publish_date': fields.Date(required=True, description='Cover date'),
    'url': fields.String(required=True, description='URL to the paper'),
    'relevance': fields.Float(description='Relevance to query'),
    'synopsis': fields.String(description='Synopsis of the paper'),
    'mutation': fields.String(description='Mutated json data of the paper')
})


@api.route('/mutate_from_chat')
class MutateFromChat(Resource):
    def post(self):
        '''
        Extract relevant information from chat and update papers
        '''
        chat_id = request.json.get('chat_id', None)
        query = request.json.get('query', None)
        switch_model = request.json.get('model') == 'true'
        if switch_model:
            model_name = app.config.get('LLM_MODEL_NAMES').split(',')[1]
        else:
            model_name = app.config.get('LLM_MODEL_NAMES').split(',')[0]
        if not query:
            raise BadRequest('Instruction is required.')
        app.logger.info(f'Chat ID: {chat_id}, Query: {query}, Model: {model_name}')

        batch_size = app.config.get('BATCH_SIZE', 5)
        total_count = Paper.query.count()
        mutated_papers = []

        # Batch process papers
        for i in range(0, total_count, batch_size):
            batch_papers = Paper.query.limit(batch_size).offset(i).all()
            batch_result, chat_id = gemini.mutate_papers(batch_papers, query, chat_id, model_name=model_name)
            # Update mutation column in the database
            Source.update_papers(batch_result)
            doi_list = [doi for doi in batch_result]
            mutated_papers.extend(Source.get_papers_by_dois(doi_list))
            # Emit progress to the client
            progress = int((i + batch_size) / total_count * 100)
            socketio.emit('chat-progress', {'progress': progress if progress < 100 else 100})

        # Organise result papers from database
        response = {
            'papers': [paper.mutation_dict() for paper in mutated_papers],
            'chat': chat_id
        }
        return response, 200


@api.route('/search')
class PaperSearch(Resource):
    @api.marshal_list_with(paper_model)
    def get(self):
        '''Search papers based on query parameters'''
        # Extract query parameters
        query = request.args.get('query', None)
        title = request.args.get('title', None)
        author = request.args.get('author', None)
        publication = request.args.get('publication', None)
        keyword = request.args.get('keyword', None)
        from_date = request.args.get('fromDate', None)
        to_date = request.args.get('toDate', None)
        switch_model = request.args.get('model') == 'true'
        if switch_model:
            model_name = app.config.get('LLM_MODEL_NAMES').split(',')[1]
        else:
            model_name = app.config.get('LLM_MODEL_NAMES').split(',')[0]
        # Build query
        query_params = {
            'query': query,
            'title': title,
            'author': author,
            'publication': publication.split(',') if publication else None,
            'keyword': keyword,
            'fromDate': from_date,
            'toDate': to_date
        }

        batch_size = app.config.get('BATCH_SIZE', 5)
        papers_rated = []

        total_count = Source.get_total_count(query_params)
        if total_count == 0:
            raise BadRequest('No papers found with the given query.')

        app.logger.info(f'Seaching papers with query: {query_params}')

        # Batch process papers
        for i in range(0, total_count, batch_size):
            # Set index for pagination
            query_params['start'] = i
            # Fetch papers from Source API. Delete existing papers for the first batch.
            batch_papers = Source.fetch_papers(query_params, delete_existing=i == 0)
            # Analyse papers using Gemini
            batch_result = gemini.analyse_papers(batch_papers, query, model_name=model_name)
            papers_rated.extend(batch_result)
            # Emit progress to the client
            progress = int((i + batch_size) / total_count * 100)
            socketio.emit('search-progress', {'progress': progress if progress < 100 else 100})

        return papers_rated, 200


@api.route('/getTotalCount')
class get_total_count(Resource):
    def get(self):
        params = request.args.to_dict()
        if 'publication' in params:
            params['publication'] = params['publication'].split(',')

        total_count = Source.get_total_count(params)
        return {'total_count': total_count}, 200


@api.route('/chat_history')
class ChatHistory(Resource):
    def get(self):
        '''Get chat history'''
        chat_id = request.args.get('chat_id', None)
        chat_list = []
        if not chat_id:
            return chat_list, 200
        main_chat = Chat.query.get(chat_id)
        chat_list.append(main_chat.__str__())
        for chat in main_chat.chats:
            chat_list.append(chat.__str__())
        return chat_list, 200
