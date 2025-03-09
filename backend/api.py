import os
import random
import requests
import time
import logging
from openai import OpenAI
from bs4 import BeautifulSoup
import google.generativeai as genai
from requests.exceptions import RequestException
from flask import Blueprint, request, jsonify, render_template, current_app
from aryaapi import arya_api  # Replace with your deepfake detection API
from text_extraction import extract_text_from_image
from fact_check import fetch_fact_check
from web_search import fetch_web_sources
from ai_analysis import analyze_with_gemini
from storyboard import generate_storyboard_image
from config import configure_app



api_bp = Blueprint('api', __name__)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define upload and temp folders
UPLOAD_FOLDER = 'uploads'
TEMP_FOLDER = 'temp'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(TEMP_FOLDER, exist_ok=True)

# List to store debunked myths as dictionaries {myth: title, debunk_url: url}
DEBUNKED_MYTHS = []

from bs4 import BeautifulSoup
import requests
from urllib.parse import urljoin
import logging

logger = logging.getLogger(__name__)

def scrape_debunked_myths():
    global DEBUNKED_MYTHS
    url = "https://www.snopes.com/fact-check/rating/false/"
    DEBUNKED_MYTHS.clear()
    article_count = 0

    try:
        logger.info(f"Fetching {url}")
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        # Find the article list container
        article_list = soup.find('div', id='article-list', class_='list_cont_wrapper')
        if not article_list:
            logger.warning("Article list container (id=article-list, class=list_cont_wrapper) not found.")
            return False

        # Find all article wrappers
        articles = article_list.find_all('div', class_='article_wrapper')
        if not articles:
            logger.warning("No articles found with class 'article_wrapper'. Inspecting all divs...")
            articles = article_list.find_all('div')  # Fallback

        # Loop to collect up to 3 articles
        for article in articles:
            if article_count >= 3:
                break
            
            # Find the title within h3
            title_tag = article.find('h3', class_='article_title')
            # Find the URL within the <a> tag
            link_tag = article.find('a', class_='outer_article_link_wrapper')

            if title_tag and title_tag.text.strip() and link_tag and 'href' in link_tag.attrs:
                title = title_tag.text.strip().replace('$0', '').strip()
                debunk_url = link_tag['href']
                # Ensure URL is absolute
                if not debunk_url.startswith('http'):
                    debunk_url = urljoin(url, debunk_url)
                DEBUNKED_MYTHS.append({
                    "myth": title,
                    "debunk_url": debunk_url
                })
                article_count += 1
            else:
                logger.debug(f"Skipping article: No valid title or link found in {article}")

        if article_count == 0:
            logger.warning("No articles found in the article list after all attempts.")
            return False
        logger.info(f"Found {len(DEBUNKED_MYTHS)} articles on the page")
        return True
    except requests.RequestException as e:
        logger.error(f"Error fetching {url}: {e}")
        return False
    except Exception as e:
        logger.error(f"Error parsing page: {e}")
        return False
    
def process_input(text):
    """Process input text and return analysis results."""
    if not text or len(text.strip()) < 10:
        raise ValueError("Text must be at least 10 characters")
    
    serpapi_key = current_app.config['SERPAPI_KEY'] 
    GoogleFact_key = current_app.config['GOOGLE_FACT_CHECK_API_KEY'] 
    OpenAPI_key = current_app.config['OPENAI_API_KEY'] 

    fact_check_results = fetch_fact_check(text, GoogleFact_key)
    falsehood, reasoning, tips, consequences = analyze_with_gemini(text, genai.GenerativeModel('gemini-2.0-flash'), fact_check_results)
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
        if "image" not in request.files:
            return jsonify({"error": "No image provided"}), 400
        
        image = request.files["image"]
        image_path = os.path.join(TEMP_FOLDER, image.filename)
        image.save(image_path)

        extracted_text = extract_text_from_image(image_path)
        os.remove(image_path)
        if not extracted_text.strip():
            return jsonify({"error": "No text extracted from image"}), 400
        
        result = process_input(extracted_text)
        return jsonify(result)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logger.error(f"Image processing error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
    
@api_bp.route('/get-debunked-myths', methods=['GET'])
def get_debunked_myths():
    """
    Endpoint to retrieve 3 debunked myths and their debunking URLs from the scraped data.
    """
    try:
        logger = current_app.logger
        if not DEBUNKED_MYTHS:
            logger.info("Scraping debunked myths...")
            success = scrape_debunked_myths()
            if not success or not DEBUNKED_MYTHS:
                logger.warning(f"Scraping failed or no myths found.")
                return jsonify({
                    "status": "error",
                    "message": "Not enough debunked myths available. Try again later.",
                    "myths": []
                }), 200

        # Use the scraped myths (limited to 3 by scrape_debunked_myths)
        selected_myths = DEBUNKED_MYTHS  # Since scrape_debunked_myths now gets 3 or fewer
        if len(selected_myths) < 3:
            logger.warning(f"Only {len(selected_myths)} myths found instead of 3.")
            return jsonify({
                "status": "error",
                "message": f"Only {len(selected_myths)} debunked myths available.",
                "myths": selected_myths
            }), 200

        response = {
            "status": "success",
            "myths": selected_myths
        }
        return jsonify(response), 200
    except Exception as e:
        logger.error(f"Error in get_debunked_myths: {e}")
        return jsonify({
            "status": "error",
            "message": "Internal server error",
            "myths": []
        }), 500