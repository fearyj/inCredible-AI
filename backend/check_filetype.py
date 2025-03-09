import mimetypes
import requests

def check_file_type_from_url(url):
    try:
        # Send a HEAD request to fetch the content type without downloading the full content
        response = requests.head(url)
        
        # Debugging: print response status and headers
        print(f"Response status code: {response.status_code}")
        print(f"Response headers: {response.headers}")
        
        if response.status_code == 200:
            # Extract mime type from the response headers
            mime_type = response.headers.get('Content-Type')
            
            # Debugging: print the MIME type
            print(f"Content-Type: {mime_type}")
            
            if mime_type and mime_type.startswith('image'):
                return "Image"
            elif mime_type and mime_type.startswith('video'):
                return "Video"
            
            # If MIME type is not specific, fall back to checking file extension
            file_extension = url.split('.')[-1].lower()
            print(f"File extension: {file_extension}")
            
            if file_extension in ['jpg', 'jpeg', 'png', 'gif', 'bmp']:
                return "Image"
            elif file_extension in ['mp4', 'avi', 'mkv', 'mov', 'flv']:
                return "Video"
        
        print("Failed to retrieve or invalid content type")
        return "Unknown"
    
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return "Unknown"