import logging

logger = logging.getLogger(__name__)

def extract_text_from_image(image_path, textract):
    if not textract:
        logger.error("AWS credentials missing")
        return "Text extraction unavailable"
    try:
        with open(image_path, "rb") as image_file:
            response = textract.detect_document_text(Document={"Bytes": image_file.read()})
        return " ".join([item["Text"] for item in response["Blocks"] if item["BlockType"] == "LINE"])
    except Exception as e:
        logger.error(f"Text extraction error: {str(e)}")
        return f"Error extracting text: {str(e)}"