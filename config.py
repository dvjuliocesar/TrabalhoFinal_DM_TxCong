import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Configurações base da aplicação"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    DEBUG = FLASK_ENV == 'development'
    MAX_CONTENT_LENGTH = int(os.getenv('MAX_CONTENT_LENGTH', 104857600))
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', 'uploads')
    ALLOWED_EXTENSIONS = {'csv'}

    # Snowflake
    SNOWFLAKE_ENABLED = os.getenv('SNOWFLAKE_ENABLED', 'false').lower() == 'true'
    SNOWFLAKE_ACCOUNT = os.getenv('SNOWFLAKE_ACCOUNT')
    SNOWFLAKE_USER = os.getenv('SNOWFLAKE_USER')
    SNOWFLAKE_PASSWORD = os.getenv('SNOWFLAKE_PASSWORD')
    SNOWFLAKE_WAREHOUSE = os.getenv('SNOWFLAKE_WAREHOUSE', 'DBT_WAREHOUSE')
    SNOWFLAKE_DATABASE = os.getenv('SNOWFLAKE_DATABASE', 'TRIBUNAL_DATA')
    SNOWFLAKE_SCHEMA = os.getenv('SNOWFLAKE_SCHEMA', 'PUBLIC')

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}