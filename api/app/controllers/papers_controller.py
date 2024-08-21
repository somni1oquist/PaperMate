from flask_restx import Namespace, Resource, fields
from app.services.elsevier import ElsevierService
from app.services.gemini import GeminiService
import pandas as pd
from flask import make_response

api = Namespace('papers', description='Operations related to papers')

paper_model = api.model('Paper', {
    'id': fields.Integer(readOnly=True, description='The unique identifier of a paper'),
    'title': fields.String(required=True, description='The title of the paper'),
    'author': fields.String(required=True, description='The author of the paper'),
    'year': fields.Integer(required=True, description='The publication year of the paper')
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
@api.param('id', 'The DOI of the paper')
class Paper(Resource):
    @api.marshal_with(paper_model)
    def get(self, id):
        '''Fetch paper detail by id'''
        paper = ElsevierService.fetch_paper(id)
        return paper
    
@api.route('/process')
class process(Resource):
    @api.marshal_list_with(paper_model)
    @api.doc(params={'query': 'The query to filter papers.'})
    def get(self, query):
        '''Filter papers based on query'''
        papers = GeminiService.filter_papers(query)
        return papers
    
    @api.marshal_list_with(paper_model)
    def put(self):
        '''Rate papers based on relevance'''
        papers = GeminiService.rate_papers()
        return papers

    @api.marshal_list_with(paper_model)
    def post(self):
        '''Mutate papers based on query'''
        papers = GeminiService.mutate_papers()
        return papers
    
@api.route('/export')
class Export(Resource):
    def post(self):
        '''Export relevant papers to CSV'''
        papers = ElsevierService.fetch_papers()

        # If papers are empty or not in the expected format, this may cause problems
        if not papers:
            return "No papers to export", 404
            
        # Convert the papers to a pandas DataFrame
        df = pd.DataFrame([paper.__dict__ for paper in papers])

        # Convert DataFrame to CSV
        csv_data = df.to_csv(index=False)

        # Create a response object and set the headers for downloading
        response = make_response(csv_data)
        response.headers['Content-Disposition'] = 'attachment; filename=top_20_papers.csv'
        response.headers['Content-Type'] = 'text/csv'
        return response
