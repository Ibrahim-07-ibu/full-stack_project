import cloudinary
import cloudinary.uploader
import os
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

cloudinary.config( 
  cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"), 
  api_key = os.getenv("CLOUDINARY_API_KEY"), 
  api_secret = os.getenv("CLOUDINARY_API_SECRET"),
  secure = True
)

def upload_to_cloudinary(file, folder="homebuddy/providers"):

    try:
        cloudinary.config( 
            cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"), 
            api_key = os.getenv("CLOUDINARY_API_KEY"), 
            api_secret = os.getenv("CLOUDINARY_API_SECRET"),
            secure = True
        )
        
        if not os.getenv("CLOUDINARY_CLOUD_NAME"):
            logger.error("Cloudinary is not configured. Missing CLOUDINARY_CLOUD_NAME.")
            return None

        logger.info(f"Cloudinary upload attempt for folder: {folder}")
        
        if hasattr(file, 'seek'):
            file.tell() 
            file.seek(0)
            
        upload_result = cloudinary.uploader.upload(file, folder=folder)
        url = upload_result.get("secure_url")
        
        if url:
            logger.info(f"Cloudinary upload SUCCESS: {url}")
            return url
        else:
            logger.error("Cloudinary upload failed: No secure_url in response.")
            return None
            
    except Exception as e:
        logger.error(f"Cloudinary Upload Error: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return None
