import requests
import base64
import tempfile
import os

def convert_url_to_base64(obj_url):
    try:
        # Download the file from the URL
        response = requests.get(obj_url)
        if response.status_code == 200:
            # Convert the content to base64
            file_base64 = base64.b64encode(response.content).decode("utf-8")
            return file_base64
        else:
            print(f"Failed to download file: HTTP {response.status_code}")
            return None  # Return None in case of download failure

    except requests.exceptions.RequestException as e:
        # Handle any exceptions that occur during the request
        print(f"Error during the file download: {e}")
        return None  # Return None if an error occurs

    except Exception as e:
        # Handle other unforeseen exceptions
        print(f"An unexpected error occurred: {e}")
        return None  # Return None for any other exceptions
    

def convert_url_to_temp_path(video_url):
        # Create a temporary file to store the video
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            # Download the video from the URL
            response = requests.get(video_url, stream=True)
            if response.status_code != 200:
                print(f"Failed to download video! HTTP status code: {response.status_code}")
                return None
                
            # Write content to the temporary file
            temp_file.write(response.content)
            temp_file_path = temp_file.name
        
        return temp_file_path
