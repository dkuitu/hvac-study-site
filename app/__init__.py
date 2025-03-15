from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from config import config
import datetime

from app.models.database import db

def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    config[config_name].init_app(app)
    
    # Initialize extensions
    CORS(app)
    db.init_app(app)
    Migrate(app, db)
    
    # Add template context processors
    @app.context_processor
    def inject_now():
        return {'current_year': datetime.datetime.now().year}
    
    # Register blueprints
    from app.api import api as api_blueprint
    app.register_blueprint(api_blueprint, url_prefix='/api')
    
    from app.admin import admin as admin_blueprint
    app.register_blueprint(admin_blueprint, url_prefix='/admin')
    
    # Register main blueprint
    from app.routes import main as main_blueprint
    app.register_blueprint(main_blueprint)
    
    # Create database tables
    with app.app_context():
        db.create_all()
    
    return app
