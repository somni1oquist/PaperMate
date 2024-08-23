import logging
from flask import Flask
from flask_migrate import Migrate, upgrade
from flask_restx import Api
from config import Config
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import random

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

    # Set up logging
    logging.basicConfig(filename='app.log', level=logging.INFO,
                        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

    logger = logging.getLogger(__name__)
    logger.info('Starting the PaperMate API')

    with app.app_context():
        # Apply migrations
        upgrade()

        # Return error messages if any Errors occur
        @app.errorhandler(Exception)
        def handle_error(error):
            logger.error(f'An error occurred: {type(error).__name__} - {str(error)}', exc_info=True)
            if app.config['DEBUG']:
                raise error
            return {'message': str(error)}, 500

        ''' Testing for logging function
        @app.route('/trigger-error')
        def trigger_error():
            try:
                raise ValueError("This is a test error")
            except Exception as e:
                logger.error(f'Error triggered in /trigger-error: {e}', exc_info=True)
                raise
        '''

    return app


