from flask import Flask
from flask_migrate import Migrate, upgrade
from flask_restx import Api
from config import Config
from flask_sqlalchemy import SQLAlchemy
import random

db = SQLAlchemy()
api = Api()
migrate = Migrate()
def create_app(config=None):
    app = Flask(__name__)
    
    if config is None:
        app.config.from_object(Config)
    else:
        app.config.from_object(config)

    db.init_app(app)
    migrate.init_app(app, db)
    api.init_app(app, version='1.0',
                 title='PaperMate API',
                 description='A REST API for managing road safety literature')
    
    from app.controllers.papers_controller import api as papers_ns
    api.add_namespace(papers_ns, path='/papers')

    from app.models.paper import Paper

    with app.app_context():
        # Apply migrations
        upgrade()
        for i in range(20):
            db.session.add(Paper(title=f'Paper {i}', author=f'Author {i}', year=random.randint(2000, 2024)))
        db.session.commit()
    return app


