import mimetypes

def check_file_type(file_path):
    mime_type, _ = mimetypes.guess_type(file_path)
    
    if mime_type:
        if mime_type.startswith('image'):
            return "Image"
        elif mime_type.startswith('video'):
            return "Video"
    
    return "Unknown"