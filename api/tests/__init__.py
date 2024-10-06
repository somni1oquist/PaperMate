from flask import Flask

def create_app(config_name):
    app = Flask(__name__)
    
    if config_name == 'testing':
        app.config.from_object('config.TestingConfig')
        
    # Other environment configurations
    
    return app
