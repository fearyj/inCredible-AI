import boto3
from botocore.exceptions import NoCredentialsError, ClientError

def push_obj (object_path, object_name): 
    # AWS credentials (if not already set in environment variables)
    aws_access_key = 'AKIAYHJANJ6IC7WTOIWJ'
    aws_secret_key = 'HdhIU/gJHYF/eekg24g8PVMXFJOuvQaAgg77u1TZ'
    bucket_name = 'techfest2025'
    region = 'ap-southeast-1'  # Replace with your region

    # Create an S3 client
    s3_client = boto3.client('s3', aws_access_key_id=aws_access_key,
                            aws_secret_access_key=aws_secret_key, region_name=region)
    # Check if the bucket exists
    try:
        s3_client.head_bucket(Bucket=bucket_name)  # Check if the bucket exists
        print(f"Bucket {bucket_name} exists.")

        # Upload the image
        s3_client.upload_file(object_path, bucket_name, object_name)
        print("File uploaded successfully!")

        # Generate the public URL
        public_url = f"https://{bucket_name}.s3.{region}.amazonaws.com/{object_name}"
        print(f"Public URL: {public_url}")

    except ClientError as e:
        if e.response['Error']['Code'] == 'NoSuchBucket':
            print(f"Error: The bucket '{bucket_name}' does not exist.")
        else:
            print(f"Unexpected error: {e}")
    except FileNotFoundError:
        print(f"File {object_path} not found.")
    except NoCredentialsError:
        print("Credentials not available.")

    return public_url