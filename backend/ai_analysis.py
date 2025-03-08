import logging

logger = logging.getLogger(__name__)

def analyze_with_gemini(text, model, fact_check_results=None):
    if not model:
        return 50, "Gemini analysis unavailable", ["Check primary sources"], []

    prompt = (
        f"Analyze '{text}' for misinformation{' with fact-checks: ' + str(fact_check_results) if fact_check_results else ''}. "
        "Return in this exact format:\n"
        "Falsehood: X%\n"
        "Reasoning: [100+ word explanation]\n"
        "Consequences:\n- Consequence 1\n- Consequence 2\n- Consequence 3\n"
        "Tips:\n- Tip 1\n- Tip 2\n- Tip 3"
    )

    try:
        response = model.generate_content(prompt)
        content = response.text.strip()

        falsehood_line = next((line for line in content.split('\n') if line.startswith("Falsehood:")), "Falsehood: 50%")
        falsehood = round(float(falsehood_line.split()[1].rstrip('%')))

        reasoning_start = content.find("Reasoning:") + len("Reasoning:")
        consequences_start = content.find("Consequences:")
        tips_start = content.find("Tips:")

        reasoning = content[reasoning_start:consequences_start].strip() if consequences_start != -1 else content[reasoning_start:].strip()
        
        consequences_section = content[consequences_start + len("Consequences:"):tips_start].strip() if tips_start != -1 else content[consequences_start:].strip()
        consequences = [line.strip('- ') for line in consequences_section.split('\n') if line.strip()][:3]

        tips_section = content[tips_start + len("Tips:"):].strip() if tips_start != -1 else ""
        tips = [line.strip('- ') for line in tips_section.split('\n') if line.strip()][:3]

        return falsehood, reasoning, tips, consequences
    except Exception as e:
        logger.error(f"Gemini analysis error: {str(e)}")
        return 50, f"Analysis failed: {str(e)}", ["Verify with multiple sources"], []