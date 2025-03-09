import logging
import re

logger = logging.getLogger(__name__)



def split_paragraph(paragraph):
    # Regular expression to split sentences by punctuation marks like ., !, or ?
    sentences = re.split(r'(?<=[.!?])\s+', paragraph)
    # Join sentences with newline characters
    return '\n'.join(sentences)


def generate_storyboard_image(text, falsehood, reasoning, consequences, openai_client):
    if not openai_client:
        logger.error("OpenAI API key missing")
        return "Storyboard generation unavailable", "Error: Missing API key"

    if falsehood < 50 or not consequences:
        return "https://via.placeholder.com/1024x1024.png?text=No+Storyboard", "No significant consequences detected."

    # Dynamic motives based on falsehood
    if falsehood >= 80:
        motive1 = "to cause widespread panic"
        motive2 = "to manipulate opinions"
    elif falsehood >= 60:
        motive1 = "to gain attention"
        motive2 = "to confuse the public"
    else:
        motive1 = "for amusement"
        motive2 = "to test gullibility"

    consequence_list = consequences + ["mass confusion", "silly arguments"]
    consequence1 = consequence_list[0] if len(consequence_list) > 0 else "mass confusion"
    consequence2 = consequence_list[1] if len(consequence_list) > 1 else "silly arguments"

    image_prompt = (
        f"Create a comical 4-panel storyboard about someone spreading the false claim '{text}'. "               
        f"Panel 1: A person planning to spread it {motive1}. "
        f"Panel 2: The person telling a crowd about '{text}' {motive2}. "
        f"Panel 3: Funny chaos as people react with {consequence1}. "
        f"Panel 4: The person watching as {consequence2} happens and others realize it’s fake. "
        "Ensure no text, labels, or words appear in the image."
    )

    try:
        response = openai_client.images.generate(
            model="dall-e-3",
            prompt=image_prompt,
            n=1,
            size="1024x1024"
        )
        image_url = response.data[0].url
        logger.info(f"Generated comical storyboard: {image_url}")

        analysis_response = openai_client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": f"""Analyze this 4-panel comical storyboard about spreading the false claim '{text}'. 
            Generate a description based on the image in this exact format:

            ### Generated Storyboard Prompt
            - **Panel 1**: [Brief, humorous description of the character's action based on the image]
            - **Panel 2**: [Brief, humorous description of spreading the claim to others]
            - **Panel 3**: [Brief, humorous description of the crowd's funny reaction]
            - **Panel 4**: [Brief, humorous description of the aftermath and realization]

            **Educational Note**: [Short, witty debunking of '{text}' and a nod to WHO/CDC]

            Keep it concise, funny, and based on what you see in the image! Ensure proper line breaks and bold formatting."""
                    },
                    {
                        "type": "image_url",
                        "image_url": {"url": image_url}
                    }
                ]
            }
        ],
        max_tokens=300
        )

        generated_prompt = analysis_response.choices[0].message.content
        # Ensure it's a string with \n separators (no split_paragraph needed if OpenAI handles it)
        storyboard_description = generated_prompt
        return image_url, storyboard_description
    
    except Exception as e:
        logger.error(f"Storyboard generation error: {str(e)}")
        return "https://via.placeholder.com/1024x1024.png?text=Storyboard+Failed", f"Error: {str(e)}"