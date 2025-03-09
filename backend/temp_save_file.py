import tempfile
import shutil

def save_file_temporarily(file_path):
    try:
        # Open the file specified by the file path in binary mode
        with open(file_path, "rb") as file:
            # Create a temporary file without specifying a suffix
            with tempfile.NamedTemporaryFile(delete=False) as temp_file:
                # Write the content from the provided file to the temporary file
                shutil.copyfileobj(file, temp_file)
                temp_file_path = temp_file.name
        
        print(f"File saved temporarily at: {temp_file_path}")
        return temp_file_path
    
    except Exception as e:
        print(f"Error while saving file temporarily: {e}")
        return None