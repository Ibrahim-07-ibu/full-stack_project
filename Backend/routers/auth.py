from fastapi import APIRouter, Depends, HTTPException, status
from auth import create_access_token
from sqlalchemy.orm import Session
from dependencies import get_db
from models.users import User
from models.providers import Provider
from schemas.user_schema import UserRegister, UserLogin
from pwd_utils import hash_password, verify_password
import logging
import traceback

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(user: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new customer account.
    """
    logger.info(f"New registration attempt: {user.email}")
    
    try:
        # 1. Normalize and check for existing email
        normalized_email = user.email.lower().strip()
        if db.query(User).filter(User.email == normalized_email).first():
            logger.warning(f"Registration failed: Email {normalized_email} already exists")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="This email is already registered. Please login instead."
            )

        # 2. Check for existing phone
        if db.query(User).filter(User.phone == user.phone).first():
            logger.warning(f"Registration failed: Phone {user.phone} already exists")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="This phone number is already linked to an account."
            )

        # 3. Create User object (Role is anchored to 'user' for this endpoint)
        new_user = User(
            name=user.name.strip(),
            email=normalized_email,
            password=hash_password(user.password),
            phone=user.phone.strip(),
            address=user.address.strip(),
            role="user",
            is_active=True
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        logger.info(f"User registration success: ID {new_user.id}")

        return {
            "status": "success",
            "message": "Welcome to HomeBuddy! Your account has been created.",
            "data": {
                "user_id": new_user.id,
                "name": new_user.name,
                "email": new_user.email
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.exception("FATAL ERROR during registration")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="We encountered a problem setting up your account. Please try again later."
        )


@router.post("/login")
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    logger.info(f"Login attempt for: {user.email}")

    try:
        normalized_email = user.email.lower().strip()
        db_user = (
            db.query(User)
            .filter(User.email == normalized_email, User.role == "user")
            .first()
        )

        if not db_user:
            logger.warning(f"FAILED: User not found: {normalized_email}")
            raise HTTPException(
                status_code=401,
                detail=f"Account with email '{normalized_email}' not found",
            )

        if not verify_password(user.password, db_user.password):
            logger.warning(f"FAILED: Password mismatch for {normalized_email}")
            raise HTTPException(
                status_code=401,
                detail="Incorrect password. Please check and try again.",
            )

        access_token = create_access_token(
            data={"sub": str(db_user.id), "role": "user"}
        )
        logger.info(f"SUCCESS: Login successful for {normalized_email}")
        return {
            "message": "Login successful",
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": db_user.id,
            "name": db_user.name,
            "user_name": db_user.name,
            "full_name": db_user.name,
            "email": db_user.email,
            "role": "user",
        }
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        logger.error(f"CRITICAL ERROR IN LOGIN: {e}")
        raise HTTPException(
            status_code=500, detail="Internal Server Error during login processing"
        )


@router.post("/unified_login")
def unified_login(user: UserLogin, db: Session = Depends(get_db)):
    """
    Unified login for User, Provider, and Admin.
    """
    logger.info(f"Unified Login attempt for: {user.email}")

    try:
        normalized_email = user.email.lower().strip()
        db_user = db.query(User).filter(User.email == normalized_email).first()

        if not db_user:
            logger.warning(f"FAILED: User not found: {normalized_email}")
            raise HTTPException(
                status_code=401,
                detail="Account not found",
            )

        if not verify_password(user.password, db_user.password):
            logger.warning(f"FAILED: Password mismatch for {normalized_email}")
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password",
            )

        # Generate token with proper role
        access_token = create_access_token(
            data={"sub": str(db_user.id), "role": db_user.role}
        )

        # Determine redirect based on role
        redirect_path = "dashboard.html"
        if db_user.role == "provider":
            redirect_path = "provider-dashboard.html"
        elif db_user.role == "admin":
            redirect_path = "../admin/admin-dashboard.html"

        logger.info(f"SUCCESS: {db_user.role.upper()} login successful for {normalized_email}")

        return {
            "message": "Login successful",
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": db_user.id,
            "name": db_user.name,
            "user_name": db_user.name,
            "full_name": db_user.name,
            "email": db_user.email,
            "role": db_user.role,
            "redirect": redirect_path
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"CRITICAL ERROR IN UNIFIED LOGIN: {e}")
        raise HTTPException(
            status_code=500, detail="Internal Server Error during login"
        )

@router.post("/provider/login")
def login_provider(user: UserLogin, db: Session = Depends(get_db)):
    logger.info(f"Provider Login attempt for email: '{user.email}'")

    try:
        normalized_email = user.email.lower().strip()

        db_user = (
            db.query(User)
            .filter(User.email == normalized_email, User.role == "provider")
            .first()
        )

        if not db_user:
            logger.warning(f"Provider account not found for: '{normalized_email}'")
            raise HTTPException(status_code=401, detail="Provider account not found")

        if not verify_password(user.password, db_user.password):
            logger.warning(f"Password mismatch for provider: '{normalized_email}'")
            raise HTTPException(status_code=401, detail="Invalid email or password")

        db_provider = db.query(Provider).filter(Provider.user_id == db_user.id).first()

        access_token = create_access_token(
            data={"sub": str(db_user.id), "role": "provider"}
        )

        logger.info(f"Provider login successful: '{normalized_email}'")

        return {
            "message": "Login successful",
            "access_token": access_token,
            "token_type": "bearer",
            "provider_id": db_provider.id if db_provider else None,
            "user_id": db_user.id,
            "name": db_user.name,
            "user_name": db_user.name,
            "full_name": db_user.name,
        }

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        logger.error(f"CRITICAL ERROR IN PROVIDER LOGIN: {str(e)}")
        raise HTTPException(
            status_code=500, detail="Internal Server Error during provider login"
        )
