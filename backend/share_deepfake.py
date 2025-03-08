from flask import Flask, render_template, request, jsonify
import os
from aryaapi import arya_api
from flask_cors import CORS 
import logging 

app = Flask(__name__)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

#Configure CORS 
CORS(app, resources={
    r"/check_*":{
        "origins": ["http://localhost:5174"], 
        "methods":["POST", "OPTIONS"],
        "allow_headers":["Content-Type"]
    }
})

@app.route('/')
def index():
    return render_template('index.html')  # Load the main HTML file

@app.route('/analyze', methods=['POST'])
def analyze():
    if 'file' in request.files:  # If a file is uploaded
        file = request.files['file']
        filename = file.filename
        file_path = os.path.join("uploads", filename)
        file.save(file_path)  # Save file (optional)
        

        #process image received 
        if arya_api(file_path): 
            response = {"type": "file", 
                    "name": filename, 
                    "deepfake_result": True,
                    "message": "File received"}
        else: 
            response = {"type": "file", 
                    "name": filename, 
                    "deepfake_result": False,
                    "message": "File received"}


    elif 'url' in request.form:  # If a URL is sent
        url = request.form['url']
        response = {"type": "url", "name": url, "message": "URL received"}
    
    else:
        return jsonify({"error": "No file or URL received"}), 400

    print("Received Data:", response)  # Debugging
    return jsonify(response)  # Send response to frontend


@app.route('/result')
def result():
    return render_template('result.html')  # Load the result page

@app.route('/get_share_data/<platform>')
def get_share_data(platform):
    # Dynamic data from a database or another source
    data = {
        "text": "This is DEEPFAKE!",
        "image_url": "https://techfest2025.s3.ap-southeast-1.amazonaws.com/20250308_003314_2m0s.jpg"
    }

    # Render the same template and pass the platform as a variable
    return render_template('share.html', data=data, platform=platform)

@app.route('/choose_platform')
def choose_platform():
    data = {
        "text": "This is DEEPFAKE!",
        "image_url": "https://techfest2025.s3.ap-southeast-1.amazonaws.com/20250308_003314_2m0s.jpg"
    }

    return render_template('choose_platform.html', data=data)  # New page where users select Telegram or WhatsApp




if __name__ == '__main__':
    app.run(debug=True)