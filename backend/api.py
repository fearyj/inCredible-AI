from flask import Blueprint, request, jsonify, render_template, current_app
import os
from aryaapi import arya_api # Replace with your deepfake detection API
from text_extraction import extract_text_from_image
from fact_check import fetch_fact_check
from web_search import fetch_web_sources
from ai_analysis import analyze_with_gemini
from storyboard import generate_storyboard_image
from config import configure_app
import google.generativeai as genai
from openai import OpenAI


api_bp = Blueprint('api', __name__)

# Define upload and temp folders
UPLOAD_FOLDER = 'uploads'
TEMP_FOLDER = 'temp'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(TEMP_FOLDER, exist_ok=True)

def process_input(text):
    """Process input text and return analysis results."""
    if not text or len(text.strip()) < 10:
        raise ValueError("Text must be at least 10 characters")
    
    serpapi_key = current_app.config['SERPAPI_KEY'] 
    GoogleFact_key = current_app.config['GOOGLE_FACT_CHECK_API_KEY'] 
    OpenAPI_key = current_app.config['OPENAI_API_KEY'] 

    fact_check_results = fetch_fact_check(text,GoogleFact_key)
    falsehood, reasoning, tips, consequences = analyze_with_gemini(text,genai.GenerativeModel('gemini-2.0-flash'),fact_check_results)
    sources = fetch_web_sources(text, serpapi_key, genai.GenerativeModel('gemini-2.0-flash'))
    summary = reasoning[:200] if reasoning else "No summary available"
    storyboard_image_url, storyboard_description = generate_storyboard_image(text, falsehood, reasoning, consequences, OpenAI(api_key=OpenAPI_key))

    return {
        "falsehood_percentage": falsehood,
        "sources": sources,
        "fact_checks": fact_check_results or [],
        "reasoning": reasoning,
        "summary": summary,
        "storyboard_image": storyboard_image_url,
        "storyboard_description": storyboard_description,
        "tips": tips
    }
    
@api_bp.route('/analyze', methods=['POST'])
def analyze():
    """Analyze a file or URL for deepfake detection."""
    try:
        # Use current_app to access the Flask app instance
        logger = current_app.logger
        logger.info("Received request at /api/analyze")

        if 'file' in request.files:
            file = request.files['file']
            if file.filename == '':
                return jsonify({"error": "No file selected"}), 400
            
            filename = file.filename
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            file.save(file_path)
            logger.info(f"File saved: {file_path}")

            try:
                is_deepfake = arya_api(file_path)  # Assumes boolean return
                response = {
                    "type": "file",
                    "name": filename,
                    "deepfake_result": is_deepfake,
                    "message": "File received"
                }
            except Exception as e:
                logger.error(f"Error processing file with arya_api: {e}")
                return jsonify({"error": f"Failed to analyze file: {str(e)}"}), 500
            finally:
                if os.path.exists(file_path):
                    os.remove(file_path)
                    logger.info(f"Cleaned up file: {file_path}")

        elif 'url' in request.form:
            url = request.form['url']
            logger.info(f"Received URL: {url}")
            response = {
                "type": "url",
                "name": url,
                "message": "URL received"  # TODO: Add URL analysis
            }
        else:
            return jsonify({"error": "No file or URL received"}), 400

        logger.info(f"Response sent: {response}")
        return jsonify(response)

    except Exception as e:
        logger.error(f"Error in /api/analyze: {e}")
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@api_bp.route('/result')
def result():
    """Render the result page."""
    return render_template('result.html')

@api_bp.route('/get_share_data/<platform>')
def get_share_data(platform):
    """Provide data for sharing on a specified platform."""
    data = {
        "text": "This is DEEPFAKE!",
        "image_url": "https://techfest2025.s3.ap-southeast-1.amazonaws.com/20250308_003314_2m0s.jpg"
    }
    return render_template('share.html', data=data, platform=platform)

@api_bp.route('/choose_platform')
def choose_platform():
    """Render the platform selection page for sharing."""
    data = {
        "text": "This is DEEPFAKE!",
        "image_url": "https://techfest2025.s3.ap-southeast-1.amazonaws.com/20250308_003314_2m0s.jpg"
    }
    return render_template('choose_platform.html', data=data)

@api_bp.route("/check_text", methods=["POST"])
def check_text():
    """Process text input for analysis."""
    try:
        logger = current_app.logger
        data = request.get_json()
        if not data or "text" not in data:
            return jsonify({"error": "No text provided"}), 400
        
        # Use process_input function
        result = process_input(data["text"])
        return jsonify(result)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logger.error(f"Text processing error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@api_bp.route("/check_image", methods=["POST"])
def check_image():
    """Extract text from an image and process it."""
    try:
        logger = current_app.logger
        if "image" not in request.files:  # Fixed logic
            return jsonify({"error": "No image provided"}), 400
        
        image = request.files["image"]
        image_path = os.path.join(TEMP_FOLDER, image.filename)
        image.save(image_path)

        # Use AWS Textract for text extraction
        extracted_text = extract_text_from_image(image_path)
        
        os.remove(image_path)
        if not extracted_text.strip():
            return jsonify({"error": "No text extracted from image"}), 400
        
        # Process the extracted text
        result = process_input(extracted_text)  # Call process_input
        return jsonify(result)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logger.error(f"Image processing error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
    
