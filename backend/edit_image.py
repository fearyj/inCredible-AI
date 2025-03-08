from PIL import Image, ImageDraw, ImageFont
import numpy as np
import cv2
import random

def edit_fake_image(captured_frame): 
    pil_image = Image.fromarray(cv2.cvtColor(captured_frame, cv2.COLOR_BGR2RGB))
    draw = ImageDraw.Draw(pil_image)

    # Define text and load a custom font (larger size for visibility)
    text = "DEEPFAKE!!"
    try:
        font = ImageFont.truetype("arial.ttf", 60)  # Adjust font and size as needed
    except:
        font = ImageFont.load_default().font_variant(size=60)  # Fallback

    # Get text dimensions
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]

    # Calculate position for centering the stamp
    image_width, image_height = pil_image.size
    # Increase stamp size to ensure text fits after rotation (account for diagonal expansion)
    stamp_width = int(text_width * 2.0)  # Increased from 1.5x to 2.0x
    stamp_height = int(text_height * 1.8)  # Increased from 1.2x to 1.8x
    stamp_x = (image_width - stamp_width) // 2
    stamp_y = (image_height - stamp_height) // 2

    # Create a new image for the stamp with transparency
    stamp_image = Image.new("RGBA", (stamp_width, stamp_height), (255, 255, 255, 0))
    stamp_draw = ImageDraw.Draw(stamp_image)

    # Draw a red rectangle with a black border (mimicking the stamp shape)
    stamp_draw.rectangle(
        [(0, 0), (stamp_width, stamp_height)],
        outline=(0, 0, 0, 255),  # Black border
        fill=(255, 0, 0, 200),   # Semi-transparent red fill
        width=4
    )

    # Simulate distressed texture (optional noise effect)
    for x in range(stamp_width):
        for y in range(stamp_height):
            if random.random() < 0.05:  # 5% chance to add noise
                stamp_draw.point((x, y), fill=(255, 0, 0, 50))  # Light red speckles

    # Calculate text position within the stamp (centered)
    text_x = (stamp_width - text_width) // 2
    text_y = (stamp_height - text_height) // 2

    # Draw the text in white with a slight black outline for effect
    stamp_draw.text((text_x - 1, text_y), text, font=font, fill=(0, 0, 0, 255))  # Black outline
    stamp_draw.text((text_x + 1, text_y), text, font=font, fill=(0, 0, 0, 255))
    stamp_draw.text((text_x, text_y - 1), text, font=font, fill=(0, 0, 0, 255))
    stamp_draw.text((text_x, text_y + 1), text, font=font, fill=(0, 0, 0, 255))
    stamp_draw.text((text_x, text_y), text, font=font, fill=(255, 255, 255, 255))  # White text

    # Rotate the stamp by 45 degrees, ensuring expansion
    stamp_image = stamp_image.rotate(45, expand=True, resample=Image.BICUBIC)

    # Adjust paste position based on rotated size
    rot_width, rot_height = stamp_image.size
    paste_x = (image_width - rot_width) // 2
    paste_y = (image_height - rot_height) // 2

    # Overlay the stamp onto the original image
    pil_image.paste(stamp_image, (paste_x, paste_y), stamp_image)

    # Convert the PIL image back to OpenCV format
    edited_image = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)

    return edited_image