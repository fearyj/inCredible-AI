import requests
import uuid
import time
import base64 
import cv2
import json
import mimetypes


def arya_api(file_path): 
    timestamp = time.strftime("%Y%m%d_%H%M%S")  

    req_id_string = str(uuid.uuid1())
    print(req_id_string)

    try:
        # dealing with video 
        if check_file_type(file_path) == "Video":
            print("Checked as video")
            with open(file_path, "rb") as video_bin_file:
                file_base64 = base64.b64encode(video_bin_file.read()).decode("utf-8")
            #check orientation
            orient_int = 2
            if get_video_orientation(file_path) == 'Portrait': 
                orient_int = 1
            else: #Landscape or Square
                orient_int = 0
            print("This is a video, with orientation " + str(orient_int))
            doc_type_string = "video"

        elif check_file_type(file_path) == "Image":
            print("Checked as image")

            with open(file_path, "rb") as image_bin_file:
                file_base64 = base64.b64encode(image_bin_file.read()).decode("utf-8")
            #check orientation
            orient_int = 2
            if get_image_orientation(file_path) == 'Portrait': 
                orient_int = 1
            else: #Landscape or Square
                orient_int = 0
            print("This is an image, with orientation" + str(orient_int))
            doc_type_string = "image"

        else:
            raise ValueError("Cannot detect file type")
        
    except FileNotFoundError:
        print("Error: File not found.")
    except ValueError as e:
        print(f"Error: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")


    url = "https://ping.arya.ai/api/v1/deepfake-detection/image"
    payload = {"doc_base64": file_base64, "req_id": req_id_string, "isIOS": False, "doc_type": doc_type_string, "orientation":  orient_int,  }
    headers = {
      'token': 'ca23ac9da1666693a725e0bf1b83a11c',
      'content-type':'application/json' #sending payload in json format
    }
    response = requests.request("POST", url, json=payload, headers=headers)
    print(type(response))
    print(response.text)
    print(type(response.text))
    data = json.loads(response.text)
    if data["result"] == 'real': 
        return False
    elif data["result"] == 'fake': 
        return True


def get_image_orientation(image_path):
    # Load the image
    image = cv2.imread(image_path)
    
    if image is None:
        print("Error: Cannot open image file. Check the path or format.")
        return None
    
    # Get image dimensions
    height, width, _ = image.shape  

    if width > height:
        return "Landscape"
    elif height > width:
        return "Portrait"
    else:
        return "Square"


def get_video_orientation(video_path):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print("Error: Cannot open video file. Check the path or format.")
    else:
        print("Video file opened successfully!")

    # Get frame width and height
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    cap.release()

    if width > height:
        return "Landscape"
    elif height > width:
        return "Portrait"
    else:
        return "Square"


def check_file_type(file_path):
    mime_type, _ = mimetypes.guess_type(file_path)
    
    if mime_type:
        if mime_type.startswith('image'):
            return "Image"
        elif mime_type.startswith('video'):
            return "Video"
    
    return "Unknown"


"""
1. convert your image or video to a base64 string to upload it to the API
2. change doc_type according to video or image
3. orientation: 0 for landscape, 1 for portrait

"""
def run(): 
    image_path = r"C:\Users\jingh\OneDrive - Nanyang Technological University\NTU_Computer Science\techfest_misinf\photos and vids\random girl.jpg"
    print(arya_api(image_path))

if __name__ == "__main__":
    run()