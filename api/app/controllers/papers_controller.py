from flask import request
from flask_restx import Namespace, Resource, fields
from app.services.elsevier import ElsevierService
from app.services.gemini import GeminiService

api = Namespace('papers', description='Operations related to papers')

paper_model = api.model('Paper', {
    'doi': fields.String(required=True, description='The paper DOI'),
    'publication': fields.String(required=True, description='The paper publication'),
    'title': fields.String(required=True, description='The paper title'),
    'author': fields.String(required=True, description='The paper author'),
    'publish_date': fields.Date(required=True, description='The paper publication date'),
    'abstract': fields.String(required=True, description='The paper abstract'),
    'synopsis': fields.String(description='The paper synopsis', default=None),
    'relevance': fields.Integer(description='The paper relevance', default=None),
    'url': fields.String(description='The paper URL')
})

@api.route('/')
class PaperList(Resource):
    @api.marshal_list_with(paper_model)
    def get(self):
        '''List all papers in database'''
        db_papers = ElsevierService.fetch_papers()
        return db_papers

    @api.expect([paper_model])
    @api.marshal_list_with(paper_model, code=201)
    def post(self):
        '''Create papers in batch'''
        data = api.payload
        papers = ElsevierService.create_papers(data)
        return papers
    
    def delete(self):
        '''Delete all papers in database'''
        result = ElsevierService.delete_papers()
        return result, 200

@api.route('/process/<string:query>')
class process(Resource):
    @api.marshal_list_with(paper_model, code=200)
    @api.doc(params={'query': 'The criteria to rate papers.'})
    def put(self, query):
        '''Rate all papers in database based on relevance'''
        db_papers = ElsevierService.fetch_papers()
        papers = GeminiService.rate_papers(db_papers, query)
        return papers

    # def post(self, query):
    #     '''Mutate all papers in database based on query'''
    #     db_papers = ElsevierService.fetch_papers()
    #     papers = GeminiService.mutate_papers(db_papers, query)
    #     return papers, 200
    
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
        title = request.args.get('title', '')
        author = request.args.get('author', '')
        keyword = request.args.get('keyword', '')
        from_date = request.args.get('fromDate', '')
        to_date = request.args.get('toDate', '')
        
        # Build query
        query_params = {
            'title': title,
            'author': author,
            'keyword': keyword,
            'fromDate': from_date,
            'toDate': to_date
        }
        # query = ' '.join([f"{k}:{v}" for k, v in query_params.items() if v])
        
        # Search through Elsevier API
        papers = ElsevierService.fetch_papers(query_params)
        if not papers:
            return 'No papers found, try other search query.', 404

        # Rate papers using Gemini API
        papers_rated = GeminiService.rate_papers(papers, query_params.get('keyword'))
        
        return papers_rated, 200