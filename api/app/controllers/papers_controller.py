import json
from flask import request, current_app as app
from flask_restx import Namespace, Resource, fields
from app.models.paper import Paper
from app.services.elsevier import ElsevierService
from app.services.gemini import GeminiService
import pandas as pd
from flask import make_response

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
        gemini = GeminiService()
        papers = gemini.analyse_papers(query)
        return papers
    
@api.route('/mutate/<string:query>')
class Mutate(Resource):
    @api.marshal_list_with(paper_model, code=200)
    @api.doc(params={'query': 'The criteria to mutate papers.'})
    def put(self, query):
        '''Mutate papers based on a query'''
        chat_id = request.args.get('chat', None)
        gemini = GeminiService()
        papers = gemini.mutate_papers(query, chat_id) # Should contain only doi and mutation
        return ElsevierService.update_papers_by_doi(papers)
    
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
        gemini = GeminiService()
        papers_rated = gemini.analyse_papers(query_params.get('query'))
        
        return papers_rated, 200