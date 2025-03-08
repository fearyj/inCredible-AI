from flask import Flask, render_template, request, jsonify
import os
from aryaapi import arya_api  # Replace with your actual deepfake detection API
from flask_cors import CORS
import logging

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Ensure uploads directory exists
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Configure CORS to allow frontend origin
CORS(app, resources={
    r"/analyze": {
        "origins": ["http://localhost:5173"],  # Adjust if your frontend port differs
        "methods": ["POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

@app.route('/')
def index():
    return render_template('index.html')  # Assumes you have an index.html template

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        logger.info("Received request at /analyze")
        if 'file' in request.files:
            file = request.files['file']
            if file.filename == '':
                return jsonify({"error": "No file selected"}), 400
            
            filename = file.filename
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            file.save(file_path)
            logger.info(f"File saved: {file_path}")

            # Process file with arya_api (assumes boolean return)
            try:
                if arya_api(file_path):
                    response = {
                        "type": "file",
                        "name": filename,
                        "deepfake_result": True,
                        "message": "File received"
                    }
                else:
                    response = {
                        "type": "file",
                        "name": filename,
                        "deepfake_result": False,
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
                "message": "URL received"
            }

        else:
            return jsonify({"error": "No file or URL received"}), 400

        logger.info(f"Response sent: {response}")
        return jsonify(response)

    except Exception as e:
        logger.error(f"Error in /analyze: {e}")
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@app.route('/result')
def result():
    return render_template('result.html')  # Assumes you have a result.html template

@app.route('/get_share_data/<platform>')
def get_share_data(platform):
    data = {
        "text": "This is DEEPFAKE!",
        "image_url": "https://techfest2025.s3.ap-southeast-1.amazonaws.com/20250308_003314_2m0s.jpg"
    }
    return render_template('share.html', data=data, platform=platform)

@app.route('/choose_platform')
def choose_platform():
    data = {
        "text": "This is DEEPFAKE!",
        "image_url": "https://techfest2025.s3.ap-southeast-1.amazonaws.com/20250308_003314_2m0s.jpg"
    }
    return render_template('choose_platform.html', data=data)

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)