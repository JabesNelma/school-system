"""Flask application factory."""
from flask import Flask
from config import config
from app.extensions import db, migrate, jwt, cors

def create_app(config_name='default'):
    """Create and configure the Flask application."""
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # Allow cross-origin requests from approved origins
    # Using specific origins instead of wildcard allows credentials
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": [
            "https://school-system-copeunqus-jabes-nelmas-projects.vercel.app",
            "http://localhost:3000",
            "https://school-system-henna.vercel.app"
        ]}},
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
        supports_credentials=True
    )
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.public import public_bp
    from app.routes.admin import admin_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(public_bp, url_prefix='/api/public')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    
    # Health check route
    @app.route('/api/health')
    def health_check():
        return {'status': 'healthy', 'message': 'School Information System API is running'}
    
    # Create tables and seed data
    with app.app_context():
        db.create_all()
        from app.utils.seed import seed_admin_user
        seed_admin_user()
    
    return app