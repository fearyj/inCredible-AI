import requests
import logging

logger = logging.getLogger(__name__)

def fetch_web_sources(text, api_key, model):
    if not api_key:
        logger.error("SerpApi key missing")
        return [{"name": "N/A", "credibility": 0, "title": "SerpApi unavailable", "url": "#", "error": "Missing API key"}]
    
    try:
        params = {"q": text, "api_key": api_key, "num": 5}
        url = "https://serpapi.com/search"
        logger.info(f"Fetching web sources for query: {text}")
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        organic_results = data.get("organic_results", [])
        sources = []
        credible_domains = {
            "npr.org": 92, "reuters.com": 95, "bbc.com": 94, "apnews.com": 93,
            "nytimes.com": 88, "washingtonpost.com": 87, "theguardian.com": 89,
            "cnn.com": 80, "foxnews.com": 75, "scientificamerican.com": 90,
            "breitbart.com": 40, "infowars.com": 20, "dailymail.co.uk": 60,
            "snopes.com": 85
        }
        
        for result in organic_results[:3]:
            title = result.get("title", "No title")
            url = result.get("link", "#")
            domain = url.split("/")[2] if url != "#" else ""
            snippet = result.get("snippet", "No snippet available")
            
            prompt = (
                f"Evaluate the credibility of this source for the claim '{text}':\n"
                f"Title: {title}\nURL: {url}\nSnippet: {snippet}\n"
                "Return a credibility score (0-100) and a brief reason."
            )
            try:
                response = model.generate_content(prompt)
                content = response.text.strip()
                score_line = next((line for line in content.split('\n') if "score" in line.lower()), "Credibility Score: 70")
                score = int(score_line.split(":")[1].strip().rstrip('%').split('/')[0])
            except Exception as e:
                logger.error(f"Gemini source evaluation error: {str(e)}")
                score = credible_domains.get(domain, 70)
            
            sources.append({
                "name": domain,
                "credibility": score,
                "title": title,
                "url": url,
                "error": None
            })
        return sources
    except requests.RequestException as e:
        logger.error(f"SerpApi error: {str(e)}")
        return [{"name": "Error", "credibility": 0, "title": "Failed to fetch web sources", "url": "#", "error": str(e)}]