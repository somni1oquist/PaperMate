from flask import request, current_app as app
from flask_restx import Namespace, Resource, fields
from app.services.elsevier import ElsevierService
from app.services.gemini import GeminiService

api = Namespace('papers', description='Operations related to papers')

paper_model = api.model('Paper', {
    'doi': fields.String(required=True, description='DOI of the paper'),
    'title': fields.String(required=True, description='Title of the paper'),
    'abstract': fields.String(required=True, description='Abstract of the paper'),
    'author': fields.String(required=True, description='Author of the paper'),
    'publication': fields.String(required=True, description='Publication name'),
    'publish_date': fields.Date(required=True, description='Cover date'),
    'url': fields.String(required=True, description='URL to the paper'),
    'relevance': fields.Float(description='Relevance to query'),
    'synopsis': fields.String(description='Synopsis of the paper')
})

@api.route('/')
class PaperList(Resource):
    @api.marshal_list_with(paper_model)
    def get(self):
        '''List all papers based on default query'''
        papers = ElsevierService.fetch_papers({'query': app.config['DEFAULT_QUERY']})
        return papers, 200

@api.route('/rate/<string:query>')
class process(Resource):
    @api.marshal_list_with(paper_model, code=200)
    @api.doc(params={'query': 'The criteria to rate papers.'})
    def put(self, query):
        '''Rate papers based on relevance to a query'''
        db_papers = ElsevierService.fetch_papers({'query': query})
        papers = GeminiService.rate_papers(db_papers, query)
        return papers
    
@api.route('/export')
class Export(Resource):
    def post(self):
        '''Export papers to CSV'''
        # Export papers to CSV
        return 'CSV exported successfully'
    
@api.route('/search')
class PaperSearch(Resource):
    @api.marshal_list_with(paper_model)
    def get(self):
        '''Search papers based on query parameters'''
        # Extract query parameters
        # @TODO: Conform to UI specification
        query = request.args.get('query', app.config['DEFAULT_QUERY'])
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
        
        # Search through Elsevier API
        papers = ElsevierService.fetch_papers(query_params)
        if not papers:
            return 'No papers found, try other search query.', 404

        # Rate papers using Gemini API
        papers_rated = GeminiService.rate_papers(papers, query_params.get('query'))
        
        return papers_rated, 200