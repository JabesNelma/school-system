#!/usr/bin/env python3
"""Entry point for the Flask application."""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from app import create_app

# Create app with appropriate config
config_name = os.environ.get('FLASK_ENV', 'development')
app = create_app(config_name)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)