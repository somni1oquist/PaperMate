from flask import Flask
from flask_migrate import Migrate, upgrade
from flask_restx import Api
from config import Config
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
api = Api()
migrate = Migrate()
cors = CORS()
def create_app(config=None):
    app = Flask(__name__)
    
    if config is None:
        app.config.from_object(Config)
    else:
        app.config.from_object(config)
   
    cors.init_app(app)
    db.init_app(app)
    migrate.init_app(app, db)
    api.init_app(app, version='1.0.1',
                 title='PaperMate API',
                 description='A REST API for searching and rating road safety literature')
    
    from app.controllers.papers_controller import api as papers_ns
    api.add_namespace(papers_ns, path='/papers')

    from app.models.paper import Paper

    with app.app_context():
        # Apply migrations
        upgrade()

    # Return error messages if any Errors occur
    @app.errorhandler(Exception)
    def handle_error(error):
        if app.config['DEBUG']:
            raise error
        return {'message': str(error)}, 500

    return app