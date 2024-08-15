from flask import Flask
from flask_restx import Api
from config import Config
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
api = Api()
def create_app(config=None):
    app = Flask(__name__)
    
    if config is None:
        app.config.from_object(Config)
    else:
        app.config.from_object(config)

    db.init_app(app)
    api.init_app(app, version='1.0',
                 title='PaperMate API',
                 description='A REST API for managing road safety literature')
    
    from app.controllers.papers_controller import api as papers_ns
    api.add_namespace(papers_ns, path='/papers')

    with app.app_context():
        db.create_all()

    return app