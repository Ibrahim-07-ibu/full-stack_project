from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from db.database import get_db
from typing import Optional
from auth import verify_token
import logging
import traceback

logger = logging.getLogger(__name__)
# Note: User and Provider models are imported where needed or used for typing
from models.users import User
from models.providers import Provider

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = verify_token(token)
    if payload is None:
        logger.warning("Token verification failed")
        raise credentials_exception
        
    try:
        sub = payload.get("sub")
        if sub is None:
            logger.warning("Token payload missing 'sub'")
            raise credentials_exception
        user_id = int(sub)
    except (ValueError, TypeError) as e:
        logger.error(f"Invalid user_id in token: {sub}")
        raise credentials_exception
        
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if user is None:
            logger.warning(f"User not found for ID: {user_id}")
            raise credentials_exception
        return user
    except Exception as e:
        logger.error(f"Database error in get_current_user: {str(e)}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Auth Database Error: {str(e)}"
        )

def get_current_admin(
    token: str = Depends(oauth2_scheme)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = verify_token(token)
    if payload is None:
        raise credentials_exception
        
    role: str = payload.get("role")
    
    if role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return True

def get_current_provider(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = verify_token(token)
        if payload is None:
            logger.warning("Token verification failed for provider")
            raise credentials_exception
            
        sub = payload.get("sub")
        if sub is None:
            logger.warning("Token payload missing 'sub' for provider")
            raise credentials_exception
            
        user_id = int(sub)
        
        provider = db.query(Provider).filter(Provider.user_id == user_id).first()
        if provider is None:
            logger.warning(f"No provider found for user_id: {user_id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User is not a registered provider"
            )
        return provider
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"CRITICAL ERROR in get_current_provider: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Provider Authentication Error: {str(e)}"
        )
