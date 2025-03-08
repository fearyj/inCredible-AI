import cv2
import subprocess
import random
import os
import json

def extract_random_frame_with_ytdlp(youtube_url, output_path="frame.jpg"):
    temp_video_path = "temp_video.mp4"
    
    try:
        print("Downloading video with yt-dlp...")
        # Download the lowest resolution version
        cmd = [
            "yt-dlp",
            "-f", "worst[ext=mp4]",  # Get the worst quality mp4
            "-o", temp_video_path,
            "--cookies-from-browser", "chrome",  # Replace "chrome" with your browser name
            youtube_url
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"yt-dlp error: {result.stderr}")
            raise Exception(f"Error downloading video: {result.stderr}")
            
        print("Video downloaded, extracting frame...")
        
        # Open the video file
        cap = cv2.VideoCapture(temp_video_path)
        
        if not cap.isOpened():
            raise Exception("Error opening video file")
        
        # Get total frames
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        # Choose a random frame
        random_frame = random.randint(0, total_frames-1) if total_frames > 0 else 0
        
        # Set the frame position
        cap.set(cv2.CAP_PROP_POS_FRAMES, random_frame)
        
        # Read the frame
        ret, frame = cap.read()
        
        # Release resources
        cap.release()
        
        if not ret:
            raise Exception("Could not read frame")
        
        # Save the frame
        print("Saving file...")
        cv2.imwrite(output_path, frame)
        
        print(f"Frame extracted and saved to {output_path}")
        return output_path
        
    finally:
        # Clean up temporary files
        if os.path.exists(temp_video_path):
            os.remove(temp_video_path)
            print("Temporary video file removed")

extract_random_frame_with_ytdlp("https://youtu.be/iyiOVUbsPcM?si=Kx_ZOMBo9iWsJJmF")