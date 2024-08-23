import os

basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    TESTING = False # testing with sample data

    DEFAULT_QUERY = 'crash' # default query for rating papers

    SECRET_KEY = os.environ.get('SECRET_KEY') # for session management

    ELS_API_KEY = os.environ.get('ELS_API_KEY') # Elsevier API key
    ELS_TOKEN = os.environ.get('ELS_TOKEN') # Elsevier token for usage outside campus

    LLM_API_KEY = os.environ.get('LLM_API_KEY') # Gemini API key
    
    LLM_MODEL_NAME = 'gemini-1.5-flash' # gemini-1.5-flash or gemini-1.5-pro

    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'app.db')

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SESSION_COOKIE_HTTPONLY = True

    REMEMBER_COOKIE_HTTPONLY = True

    SESSION_COOKIE_SAMESITE = "Lax"