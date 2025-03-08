from frame_extract import extract_frame_from_vid
from edit_image import edit_fake_image
# from load_ytvid import download_youtube_video
import time
import cv2
from push_S3 import push_obj
from aryaapi import arya_api
from file_type_check import check_file_type


def deepfake_vid_to_S3_image(video_path): 
    # youtube_url = "https://youtu.be/iyiOVUbsPcM?si=LYZMV--IS2ZlSGRz"
    # video_path = download_youtube_video(youtube_url)
    start_time = time.time()
    captured_frame = extract_frame_from_vid(video_path)

    if captured_frame is not None: 
        
        edited_image = edit_fake_image(captured_frame)
        end_time = time.time()

        duration = int(end_time - start_time)  # Convert to integer seconds
        minutes = duration // 60
        seconds = duration % 60
        # Format output
        # Save the frame with the stamp

        timestamp = time.strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{minutes}m{seconds}s.jpg"
        output_path = "static\\" + filename
        cv2.imwrite(output_path, edited_image)
        print(f"Frame saved with stamp as {filename}")

        ## pushing object to Amazon S3
        # public_url = push_obj(object_path = filename, object_name = filename)
        public_url = "https://techfest2025.s3.ap-southeast-1.amazonaws.com/20250308_003314_2m0s.jpg"
    
        return public_url
    return None

def deepfake_img_to_S3_image(image_path): 

    start_time = time.time()
        
    edited_image = edit_fake_image(image_path)
    end_time = time.time()

    duration = int(end_time - start_time)  # Convert to integer seconds
    minutes = duration // 60
    seconds = duration % 60
    # Format output
    # Save the frame with the stamp

    timestamp = time.strftime("%Y%m%d_%H%M%S")
    filename = f"{timestamp}_{minutes}m{seconds}s.jpg"
    output_path = "static\\" + filename
    cv2.imwrite(output_path, edited_image)
    print(f"Frame saved with stamp as {filename}")

    ## pushing object to Amazon S3
    # public_url = push_obj(object_path = filename, object_name = filename)
    public_url = "https://techfest2025.s3.ap-southeast-1.amazonaws.com/20250308_003314_2m0s.jpg"

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
            created_url = deepfake_img_to_S3_image(file_path)

        elif check_file_type(file_path) == 'Video':
            created_url = deepfake_vid_to_S3_image(file_path)
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

