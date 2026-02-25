import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv

load_dotenv()

# Configuration 
cloudinary.config( 
  cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"), 
  api_key = os.getenv("CLOUDINARY_API_KEY"), 
  api_secret = os.getenv("CLOUDINARY_API_SECRET"),
  secure = True
)

def upload_to_cloudinary(file, folder="homebuddy/providers"):
    """
    Uploads a file to Cloudinary and returns the secure URL.
    :param file: The file object or path to upload.
    :param folder: The folder name in Cloudinary.
    :return: Secure URL of the uploaded file.
    """
    try:
        # If it's an UploadFile object (FastAPI), we use .file
        upload_result = cloudinary.uploader.upload(file, folder=folder)
        return upload_result.get("secure_url")
    except Exception as e:
        print(f"Cloudinary Upload Error: {e}")
        return None
