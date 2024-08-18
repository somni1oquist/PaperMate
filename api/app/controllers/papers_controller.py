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
    'synopsis': fields.String(description='The paper synopsis'),
    'relevance': fields.Integer(description='The paper relevance'),
    'url': fields.String(description='The paper URL')
})

@api.route('/')
class PaperList(Resource):
    @api.marshal_list_with(paper_model)
    def get(self):
        '''List all papers'''
        papers = ElsevierService.fetch_papers()
        return papers

    @api.expect([paper_model])
    @api.marshal_list_with(paper_model, code=201)
    def post(self):
        '''Create papers in batch'''
        data = api.payload
        papers = ElsevierService.create_papers(data)
        return papers

@api.route('/<int:id>')
@api.param('id', 'ID of the paper')
class Paper(Resource):
    @api.marshal_with(paper_model)
    def get(self, id):
        '''Fetch paper detail by id'''
        paper = ElsevierService.fetch_paper(id)
        return paper
    
@api.route('/process/<string:query>')
class process(Resource):
    @api.marshal_list_with(paper_model)
    @api.doc(params={'query': 'The query to filter papers.'})
    def get(self, query):
        '''Filter papers based on query'''
        papers = GeminiService.filter_papers(query)
        return papers
    
    @api.marshal_list_with(paper_model)
    @api.doc(params={'query': 'The keywords to rate papers.'})
    def put(self, query):
        '''Rate papers based on relevance'''
        papers = GeminiService.rate_papers(query)
        return papers, 200

    def post(self, query):
        '''Mutate papers based on query'''
        papers = GeminiService.mutate_papers(query)
        return papers, 200
    
@api.route('/export')
class Export(Resource):
    def post(self):
        '''Export papers to CSV'''
        # Export papers to CSV
        return 'CSV exported successfully'
    
@api.route('/search')
class PaperSearch(Resource):
    def get(self):
        # Extract query parameters
        title = request.args.get('title', '')
        author = request.args.get('author', '')
        keyword = request.args.get('keyword', '')
        start_date = request.args.get('startDate', '')
        end_date = request.args.get('endDate', '')
        
        # Build query
        query_params = {
            'title': title,
            'author': author,
            'keyword': keyword,
            'startDate': start_date,
            'endDate': end_date
        }
        query = ' '.join([f"{k}:{v}" for k, v in query_params.items() if v])
        
        # Search through Elsevier API
        # elsevier_response = ElsevierService.search_papers(query)

        # Rate papers using Gemini API
        response = GeminiService.rate_papers(query)
        
        # Extract and format results
        # papers = response.get('papers', [])
        # results = [{'title': paper.get('title'),
        #             'abstract': paper.get('abstract'),
        #             'author': paper.get('author'),
        #             'journal': paper.get('journal'),
        #             'published_date': paper.get('published_date')}
        #            for paper in papers]
        
        return {'papers': []}, 200