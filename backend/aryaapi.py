import requests
import uuid
import time
import base64 
import cv2
import json
import mimetypes
from convert_url import convert_url_to_base64
from get_orientation import get_image_orientation_from_url, get_video_orientation_from_url
from check_filetype import check_file_type_from_url

# def arya_api(file_path): 
def arya_api(obj_url): 
    timestamp = time.strftime("%Y%m%d_%H%M%S")  

    req_id_string = str(uuid.uuid1())
    print(req_id_string)

    try:
        # dealing with video 
        if check_file_type_from_url(obj_url) == "Video":
            print("Checked as video")

            file_base64 = convert_url_to_base64(obj_url)

            #check orientation
            orient_int = 2
            if get_video_orientation_from_url(obj_url) == 'Portrait': 
                orient_int = 1
            else: #Landscape or Square
                orient_int = 0

            print("This is a video, with orientation " + str(orient_int))
            doc_type_string = "video"

        elif check_file_type_from_url(obj_url) == "Image":
            print("Checked as image")

            file_base64 = convert_url_to_base64(obj_url)

            #check orientation
            orient_int = 2
            if get_image_orientation_from_url(obj_url) == 'Portrait': 
                orient_int = 1
            else: #Landscape or Square
                orient_int = 0

            print("This is an image, with orientation" + str(orient_int))
            doc_type_string = "image"

        else:
            raise ValueError(f"Cannot detect file type, the file type is {check_file_type_from_url(obj_url)}")
        
    except FileNotFoundError:
        print("Error: File not found.")
    except ValueError as e:
        print(f"Error: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")


    url = "https://ping.arya.ai/api/v1/deepfake-detection/image"
    payload = {"doc_base64": file_base64, "req_id": req_id_string, "isIOS": False, "doc_type": doc_type_string, "orientation":  orient_int,  }
    headers = {
      'token': '9f20f8c4f36139c7f12fe5e71ed6a14e',
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






def run(): 
    #test image -- from url to returning true / fake 
    #test video too 

    # image_url = "https://techfest2025.s3.ap-southeast-1.amazonaws.com/random_girl.jpg"
    vid_url = "https://techfest2025.s3.ap-southeast-1.amazonaws.com/doghuman.mp4"
    # print(f"The test result for image is {arya_api(image_url)}")
    print(f"The test result for video is {arya_api(vid_url)}")

if __name__ == "__main__":
    run()