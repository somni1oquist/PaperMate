from flask import Flask
from flask_restx import Api
from config import Config
from app.controllers.papers_controller import api as papers_ns

api = Api()
def create_app(config=None):
    app = Flask(__name__)
    
    if config is None:
        app.config.from_object(Config)
    else:
        app.config.from_object(config)

    api.init_app(app, version='1.0',
                 title='PaperMate API',
                 description='A REST API for managing road safety literature')
    api.add_namespace(papers_ns, path='/papers')

    return app