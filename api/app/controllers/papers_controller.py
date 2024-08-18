from flask_restx import Namespace, Resource, fields
from app.services.elsevier import ElsevierService
from app.services.gemini import GeminiService
import pandas as pd
from flask import make_response, jsonify

api = Namespace('papers', description='Operations related to papers')

paper_model = api.model('Paper', {
    'id': fields.Integer(readOnly=True, description='The unique identifier of a paper'),
    'title': fields.String(required=True, description='The title of the paper'),
    'author': fields.String(required=True, description='The author of the paper'),
    'year': fields.Integer(required=True, description='The publication year of the paper')
    # 'score': fields.Float(description='The relevance score of the paper')
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
        try:
            '''Export the top 20 relevant papers to CSV'''
            print("Fetching top 20 relevant papers...")
            papers = ElsevierService.fetch_papers() # GeminiService.get_top_20_relevant_papers
            print(f"Papers fetched: {papers}")

            # If papers are empty or not in the expected format, this may cause problems
            if not papers:
                print("No papers found.")
                return "No papers to export", 404
            
            # Convert the papers to a pandas DataFrame
            df = pd.DataFrame([paper.__dict__ for paper in papers])
            print(f"DataFrame created: {df}")

            # Convert DataFrame to CSV
            csv_data = df.to_csv(index=False)
            print("CSV data created.")

            # Create a response object and set the headers for downloading
            response = make_response(csv_data)
            response.headers['Content-Disposition'] = 'attachment; filename=top_20_papers.csv'
            response.headers['Content-Type'] = 'text/csv'
            return response
        except Exception as e:
            print(f"An error occurred: {str(e)}")
            return "Internal Server Error", 500