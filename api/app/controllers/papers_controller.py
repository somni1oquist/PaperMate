import json
from flask import request, abort, current_app as app
from flask_restx import Namespace, Resource, fields
from app.models.paper import Paper
from app.services.elsevier import ElsevierService
from app.services.gemini import GeminiService
import pandas as pd
from flask import make_response
from app.models.chat import Chat


api = Namespace('papers', description='Operations related to papers')
gemini = GeminiService()

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

@api.route('/')
class PaperList(Resource):
    @api.marshal_list_with(paper_model)
    def get(self):
        '''List all papers based on default query'''
        papers = ElsevierService.fetch_papers({'query': app.config['DEFAULT_QUERY']})
        return papers, 200

@api.route('/rate/<string:query>')
class Rate(Resource):
    @api.marshal_list_with(paper_model, code=200)
    @api.doc(params={'query': 'The criteria to rate papers.'})
    def put(self, query):
        '''Rate papers based on relevance to a query'''
        ElsevierService.fetch_papers({'query': query})
        papers = gemini.analyse_papers(query)
        return papers
    
@api.route('/mutate/<string:query>')
class Mutate(Resource):
    @api.marshal_list_with(paper_model, code=200)
    @api.doc(params={'query': 'The criteria to mutate papers.'})
    def put(self, query):
        '''Mutate papers based on a query'''
        papers = gemini.mutate_papers(query) # Result should contain only doi and mutation
        ElsevierService.update_papers(papers)
        return papers, 200

@api.route('/mutate_from_chat')
class MutateFromChat(Resource):
    def post(self):
        '''
        Extract relevant information from chat and update papers
        '''
        chat_id = request.json.get('chat_id', None)
        query = request.json.get('query', None)
        if not query:
            abort(400, 'Instruction is required.')
        app.logger.info(f'Chat ID: {chat_id}, Query: {query}')
        # Extract relevant information from chat
        mutated_papers, chat_id = gemini.mutate_papers(query, chat_id)
        # Update papers with mutated data
        ElsevierService.update_papers(mutated_papers)

        doi_list = [doi for doi in mutated_papers]
        # Get papers from database
        papers = ElsevierService.get_papers_by_dois(doi_list)
        response = {
            'papers': [paper.mutation_dict() for paper in papers],
            'chat': chat_id
        }
        return response, 200

@api.route('/export')
class Export(Resource):
    def post(self):
        '''Export relevant papers to CSV'''
        # Get top 5 papers sorted by relevance
        papers = Paper.query.all()
        
        if not papers:
            return "No paper to export.", 404
        
        papers_dict = [paper.mutation_dict() for paper in papers]

        # Create DataFrame
        df = pd.DataFrame(papers_dict)

        # Convert DataFrame to CSV
        csv_data = df.to_csv(index=False)

        # Create a response object and set the headers for downloading
        response = make_response(csv_data)
        response.headers['Content-Disposition'] = 'attachment; filename=top_20_papers.csv'
        response.headers['Content-Type'] = 'text/csv'
        return response

    
@api.route('/search')
class PaperSearch(Resource):
    @api.marshal_list_with(paper_model)
    def get(self):
        '''Search papers based on query parameters'''
        # Extract query parameters
        # @TODO: Conform to UI specification
        query = request.args.get('query', None)
        title = request.args.get('title', None)
        author = request.args.get('author', None)
        keyword = request.args.get('keyword', None)
        from_date = request.args.get('fromDate', None)
        to_date = request.args.get('toDate', None)
        
        # Build query
        query_params = {
            'query': query,
            'title': title,
            'author': author,
            'keyword': keyword,
            'fromDate': from_date,
            'toDate': to_date
        }
        total_count = ElsevierService.get_total_count(query_params)
        if total_count == 0:
            abort(404, 'No papers found.')
        app.logger.info(f'Seaching papers with query: {query_params}')
        # Search through Elsevier API
        ElsevierService.fetch_papers(query_params)

        # Rate papers using Gemini API
        papers_rated = gemini.analyse_papers(query_params.get('query'))
        return papers_rated, 200
    
@api.route('/getTotalCount')
class get_total_count(Resource):
    def get(self):
        params = request.args.to_dict()
        total_count = ElsevierService.get_total_count(params)
        return {'total_count': total_count}, 200

@api.route('/chat_history')
class ChatHistory(Resource):
    def get(self):
        '''Get chat history'''
        chat_id = request.args.get('chat_id', None)
        chat_list = []
        print(chat_id)
        if not chat_id:
            return chat_list, 200
        main_chat = Chat.query.get(chat_id)
        chat_list.append(main_chat.__str__())
        for chat in main_chat.chats:
            chat_list.append(chat.__str__())
        return chat_list, 200