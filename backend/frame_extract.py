import time
import cv2
from ultralytics import YOLO
import sys
import os
import logging


def extract_frame_from_vid(video_path): 

    cap = cv2.VideoCapture(video_path)

    frame_count = 0
    saved = False  # Flag to check if we captured a frame

    # Suppress lower-priority log messages
    logging.getLogger().setLevel(logging.ERROR)
    model = YOLO("yolov8n.pt", verbose=False)


    captured_frame = None  # Variable to hold the captured frame

    while cap.isOpened():
        # ret: whether the frame was successfully read 
        # frame: actual frame content
        ret, frame = cap.read()
        if not ret:
            break  # Exit if no more frames

        frame_count += 1

        # Run YOLO object detection
        results = model.predict(frame, verbose=False)

        # Check if a person ('class 0' in COCO dataset) is detected
        for result in results:
            for box in result.boxes:
                if int(box.cls) == 0:  # Class '0' corresponds to 'person'
                    captured_frame = frame  # Store the captured frame
                    print(f"Frame {frame_count} captured with a human!")
                    saved = True
                    break

            if saved:
                break  # Stop processing once a frame is saved

        if saved:
            break  # Exit the loop after saving the first frame

    cap.release()
    cv2.destroyAllWindows()


    return captured_frame

if __name__ == "__main__":
    video_path = r"C:\Users\jingh\OneDrive - Nanyang Technological University\NTU_Computer Science\techfest_misinf\photos and vids\dog and human vid.mp4"
    print(extract_frame_from_vid(video_path))


    



    