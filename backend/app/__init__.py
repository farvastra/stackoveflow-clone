from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from .config import Configuration
from datetime import timedelta
import os

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Configuration)

    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-default-secret-key')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    # CORS(app, resources={r"/api/*": {"origins": ["https://stackoveflow-clone.onrender.com"]}}, supports_credentials=True)
    CORS(app, origins=[
    "http://localhost:3000", 
    "https://stackoveflow-clone.onrender.com"
    ], supports_credentials=True)
    CORS(app, resources={r"/*": {"origins": "*"}})  
    
    # Simple test routes
    @app.route("/")
    def home():
        return {"message": "Welcome to the Q&A API!"}, 200

    # Register blueprints
    from .routes.auth_routes import auth_bp
    from .routes.question_routes import question_bp
    from .routes.comment_routes import comment_bp
    from .routes.topic_routes import topic_bp
    from .routes.save_routes import save_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(question_bp, url_prefix="/api/questions")
    app.register_blueprint(comment_bp, url_prefix="/api/comments")
    app.register_blueprint(topic_bp, url_prefix="/api/topics")
    app.register_blueprint(save_bp, url_prefix="/api/saves")

    return app
