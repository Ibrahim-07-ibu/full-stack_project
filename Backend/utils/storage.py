import cloudinary
import cloudinary.uploader
import os
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

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
        cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
        api_key = os.getenv("CLOUDINARY_API_KEY")
        logger.info(f"Cloudinary upload attempt - cloud_name: {'SET' if cloud_name else 'MISSING'}, api_key: {'SET' if api_key else 'MISSING'}, folder: {folder}")
        
        upload_result = cloudinary.uploader.upload(file, folder=folder)
        url = upload_result.get("secure_url")
        logger.info(f"Cloudinary upload SUCCESS: {url}")
        return url
    except Exception as e:
        logger.error(f"Cloudinary Upload Error: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return None
