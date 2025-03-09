from frame_extract import extract_frame_from_vid
from edit_image import edit_fake_image
# from load_ytvid import download_youtube_video
import time
import cv2
from push_S3 import push_obj
from aryaapi import arya_api
from file_type_check import check_file_type
import os
import logging

logger = logging.getLogger(__name__)


def deepfake_to_S3(input_path, is_video=False):
    # is_video = False, means it is an image

    start_time = time.time()
    
    if is_video:
        captured_frame = extract_frame_from_vid(input_path)
        if captured_frame is None:
            return None
        # input_path = captured_frame  # Use the extracted frame for further processing
        edited_image = edit_fake_image(captured_frame)

    if not is_video: 
        captured_frame = cv2.imread(input_path)
        edited_image = edit_fake_image(captured_frame)
    logger.info(f"Edited fake image: ")

    end_time = time.time()
    duration = int(end_time - start_time)  # Convert to integer seconds
    minutes = duration // 60
    seconds = duration % 60

    # Generate filename with timestamp
    timestamp = time.strftime("%Y%m%d_%H%M%S")
    filename = f"EDITED_{timestamp}_{minutes}m{seconds}s.jpg"
    output_path = os.path.join("static", filename)
    
    cv2.imwrite(output_path, edited_image)
    print(f"Frame saved with stamp as {filename}")

    ## Push the processed image to Amazon S3
    public_url = push_obj(object_path=output_path, object_name=filename)

    return public_url



# def share_deepfake_img_vid(upload_url): 
#     # how to on my device download video in the url --> video_path locally (or S3 storage)
#     return None

def run():

    file_path = r"C:\Users\jingh\OneDrive - Nanyang Technological University\NTU_Computer Science\techfest_misinf\photos and vids\dog and human vid.mp4"

    if arya_api(file_path) == False: 
        # push this result to flask and 
        # go back to home page 
        # try other prompt: another detection 
        pass

    elif arya_api(file_path) == True: 

        if check_file_type(file_path) == 'Image': 
            created_url = deepfake_to_S3(file_path)

        elif check_file_type(file_path) == 'Video':
            created_url = deepfake_to_S3(file_path)
        # push this created_url to flask and to sharing site ----------------------DO------------------------------
        # after sharing, maintain at the same page: 
        # back to home 
        # try again 
        # share 
        else: 
            print("cannot check vid or image")
    else: 
        print("cannot detect real or fake")


if __name__ == "__main__":
    run()

