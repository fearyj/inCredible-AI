from __future__ import print_statement
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# Configure API key authorization: api_key
swagger_client.configuration.api_key['X-Deepware-Authentication'] = 'YOUR_API_KEY'
# Uncomment below to setup prefix (e.g. Bearer) for API key, if needed
# swagger_client.configuration.api_key_prefix['X-Deepware-Authentication'] = 'Bearer'

# create an instance of the API class
api_instance = swagger_client.ScannerApi()
video_URL = "https://www.youtube.com/watch?v=iyiOVUbsPcM" # String |  (optional)

try: 
    # Start a scan process by Youtube URL
    api_response = api_instance.urlscan(video_URL=video_URL)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ScannerApi->urlscan: %s" % e)
            