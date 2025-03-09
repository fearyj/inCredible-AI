from flask import Flask, render_template
from flask_cors import CORS
from config import configure_app
from api import api_bp

def create_app():
    """Factory function to create and configure the Flask app."""
    app = Flask(__name__)

    # Configure CORS for API endpoints
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:5174"],  # Adjust for your frontend
            "methods": ["POST", "OPTIONS"],
            "allow_headers": ["Content-Type"]
        }
    })

    # Apply configuration (API keys, services)
    try:
        configure_app(app)
    except Exception as e:
        app.logger.error(f"Failed to configure app: {str(e)}")
        raise

    # Register blueprints
    app.register_blueprint(api_bp, url_prefix='/api')

    # Define root route for frontend
    @app.route('/')
    def index():
        """Render the main index page."""
        return render_template('index.html')

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, host='127.0.0.1', port=5001)