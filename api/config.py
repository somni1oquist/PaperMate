import os

basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY')

    DEFAULT_QUERY = 'road safety'

    LLM_API_KEY = os.environ.get('LLM_API_KEY')
    
    LLM_MODEL_NAME = 'gemini-1.5-flash' # gemini-1.5-flash or gemini-1.5-pro

    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SESSION_COOKIE_HTTPONLY = True

    REMEMBER_COOKIE_HTTPONLY = True

    SESSION_COOKIE_SAMESITE = "Lax"

class UAT_Config(Config):
    SECRET_KEY = os.environ.get('SECRET_KEY')

    SESSION_COOKIE_HTTPONLY = True

    REMEMBER_COOKIE_HTTPONLY = True

    SESSION_COOKIE_SAMESITE = "Lax"