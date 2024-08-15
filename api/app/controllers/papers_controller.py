from flask_restx import Namespace, Resource, fields
from app import db
from app.models.paper import Paper
from app.services.elsevier import ElsevierService
from app.services.gemini import GeminiService

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
        """List all papers"""
        papers = Paper.query.all()
        print(papers)
        return papers

    @api.expect(paper_model)
    @api.marshal_with(paper_model, code=201)
    def post(self):
        """Create a new paper"""
        data = api.payload
        paper = Paper(title=data['title'], author=data['author'], year=data['year'])
        db.session.add(paper)
        db.session.commit()
        return paper, 201
