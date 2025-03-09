import os
from dotenv import load_dotenv
import logging
import boto3
import google.generativeai as genai
from openai import OpenAI

def configure_app(app):
    """Configure the Flask app with environment variables and services."""
    # Load environment variables from .env
    load_dotenv()

    # Configure logging
    logging.basicConfig(level=logging.INFO)
    app.logger = logging.getLogger(__name__)

    # Load API keys from environment variables
    app.config['SERPAPI_KEY'] = os.getenv("SERPAPI_KEY")
    app.config['GOOGLE_FACT_CHECK_API_KEY'] = os.getenv("GOOGLE_FACT_CHECK_API_KEY")
    app.config['OPENAI_API_KEY'] = os.getenv("OPENAI_API_KEY")
    app.config['GEMINI_API_KEY'] = os.getenv("GEMINI_API_KEY")
    app.config['ARYA_API_KEY'] = os.getenv("ARYA_API_KEY")
    app.config['AWS_ACCESS_KEY'] = os.getenv("AWS_ACCESS_KEY_ID")
    app.config['AWS_SECRET_KEY'] = os.getenv("AWS_SECRET_ACCESS_KEY")
    app.config['AWS_REGION'] = os.getenv("AWS_REGION")

    # Validate required keys
    required_keys = ['OPENAI_API_KEY', 'GEMINI_API_KEY', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY']
    for key in required_keys:
        if not os.getenv(key):
            app.logger.error(f"Required environment variable {key} is missing")
            raise ValueError(f"Missing required environment variable: {key}")

    # Initialize services
    if app.config['GEMINI_API_KEY']:
        genai.configure(api_key=app.config['GEMINI_API_KEY'])
        app.model = genai.GenerativeModel('gemini-2.0-flash')  # Adjust model as needed
    else:
        app.logger.error("Gemini API key missing")

    if app.config['OPENAI_API_KEY']:
        app.openai_client = OpenAI(api_key=app.config['OPENAI_API_KEY'])
    else:
        app.logger.error("OpenAI API key missing")

    if app.config['AWS_ACCESS_KEY'] and app.config['AWS_SECRET_KEY']:
        app.textract = boto3.client(
            "textract",
            aws_access_key_id=app.config['AWS_ACCESS_KEY'],
            aws_secret_access_key=app.config['AWS_SECRET_KEY'],
            region_name=app.config['AWS_REGION']
        )
    else:
        app.logger.error("AWS credentials missing")