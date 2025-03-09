import requests
import cv2
import os
from datetime import datetime
import tempfile
import numpy as np
from io import BytesIO
from convert_url import convert_url_to_temp_path

def get_video_orientation_from_url(video_url):
    temp_file_path = convert_url_to_temp_path(video_url)
    
    if not temp_file_path:
        return None
    
    try:
        # Open the video file with OpenCV
        cap = cv2.VideoCapture(temp_file_path)
        
        if not cap.isOpened():
            print("Error: Cannot open video file.")
            return None
            
        # Get frame width and height
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        # Release the video capture object
        cap.release()
        
        # Determine the orientation based on width and height
        if width > height:
            return "Landscape"
        elif height > width:
            return "Portrait"
        else:
            return "Square"
    
    finally:
        # Clean up the temporary file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)



def get_image_orientation_from_url(image_url):
    # Download the image from the URL
    response = requests.get(image_url)
    
    if response.status_code == 200:
        # Convert the image content to a numpy array
        image_data = np.asarray(bytearray(response.content), dtype=np.uint8)
        
        # Decode the image array into an actual image
        image = cv2.imdecode(image_data, cv2.IMREAD_COLOR)
        
        if image is None:
            print("Error: Cannot open image from URL.")
            return None
        
        # Get image dimensions
        height, width, _ = image.shape  

        # Determine the orientation based on width and height
        if width > height:
            return "Landscape"
        elif height > width:
            return "Portrait"
        else:
            return "Square"
    else:
        print(f"Failed to download image! HTTP status code: {response.status_code}")
        return None

