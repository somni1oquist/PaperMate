import os

basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    BATCH_SIZE = 5

    SECRET_KEY = os.environ.get('SECRET_KEY') # for session management
    
    LLM_MODEL_NAME = 'gemini-1.5-flash' # # The default model is gemini-1.5-flash, and users can override it through the UI to gemini-1.5-pro

    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'app.db')

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SESSION_COOKIE_HTTPONLY = True

    REMEMBER_COOKIE_HTTPONLY = True

    SESSION_COOKIE_SAMESITE = "Lax"