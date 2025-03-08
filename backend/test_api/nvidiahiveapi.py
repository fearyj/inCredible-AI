import requests, base64

header_auth = f"Bearer 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"
invoke_url = "https://ai.api.nvidia.com/v1/cv/hive/deepfake-image-detection"
input_image_path = r"C:\Users\jingh\OneDrive - Nanyang Technological University\NTU_Computer Science\techfest_misinf\photos\random girl.jpg"

def upload_asset(path, desc):
  assets_url = "https://api.nvcf.nvidia.com/v2/nvcf/assets"
  headers = {
    "Content-Type": "application/json",
    "Authorization": header_auth,
    "accept": "application/json",
  }
  payload = {
    "contentType": "image/png",
    "description": desc
  }
  response = requests.post(assets_url, headers=headers, json=payload, timeout=30)
  print("assets response", response, flush=True)

  current_pre_signed_url = response.json()["uploadUrl"]

  asset_id = response.json()["assetId"]

  headers = {
    "Content-Type": "image/png",
    "x-amz-meta-nvcf-asset-description": desc,
  }

  input_data = open(path, "rb")
  response = requests.put(
    current_pre_signed_url,
    data=input_data,
    headers=headers,
    timeout=300,
  )
  return asset_id

with open(input_image_path, "rb") as f:
  image_b64 = base64.b64encode(f.read()).decode()

if len(image_b64) < 180_000:
  payload = {
    "input": [f"data:image/png;base64,{image_b64}"]
  }
  headers = {
    "Content-Type": "application/json",
    "Authorization": header_auth,
    "Accept": "application/json",
  }
else:
  asset_id = upload_asset(input_image_path, "Input Image")
  
  payload = {
    "input": [f"data:image/png;asset_id,{asset_id}"]
  }
  headers = {
    "Content-Type": "application/json",
    "NVCF-INPUT-ASSET-REFERENCES": asset_id,
    "Authorization": header_auth,
  }

response = requests.post(invoke_url, headers=headers, json=payload)
print(response.json())
