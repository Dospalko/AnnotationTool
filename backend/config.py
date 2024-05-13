class Config:
    SECRET_KEY = 'heslo'  # Change this to your secret key
    #SQLALCHEMY_DATABASE_URI = 'postgresql://postgres:heslo@db:5432/annotator'
    SQLALCHEMY_DATABASE_URI = 'postgresql://postgres:heslo@localhost/annotator'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

class DevelopmentConfig(Config):
    DEBUG = True

class TestingConfig(Config):
    TESTING = True

class ProductionConfig(Config):
    DEBUG = False
