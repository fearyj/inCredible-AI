import requests
import logging

logger = logging.getLogger(__name__)

def fetch_fact_check(text, api_key):
    if not api_key:
        logger.error("Google Fact Check API key missing")
        return None
    try:
        query = text.strip()
        url = f"https://factchecktools.googleapis.com/v1alpha1/claims:search?query={requests.utils.quote(query)}&key={api_key}"
        logger.info(f"Fetching fact check for query: {query}")
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        fact_checks = response.json().get("claims", [])
        logger.info(f"Fact Check API response: {fact_checks}")
        if not fact_checks:
            return None
        seen_urls = set()
        unique_checks = []
        for claim in fact_checks[:3]:
            review = claim.get("claimReview", [{}])[0]
            url = review.get("url", "#")
            if url not in seen_urls:
                seen_urls.add(url)
                unique_checks.append({
                    "publisher": review.get("publisher", {}).get("name", "Unknown"),
                    "rating": review.get("textualRating", "N/A"),
                    "url": url
                })
        return unique_checks if unique_checks else None
    except requests.RequestException as e:
        logger.error(f"Fact check API error: {str(e)}")
        return None