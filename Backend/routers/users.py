from fastapi import APIRouter, Depends, HTTPException, status
from auth import create_access_token
from sqlalchemy.orm import Session
from dependencies import get_db, get_current_user
from models.users import User
from models.providers import Provider
from schemas.user_schema import UserRegister, UserLogin, UserProfileUpdate, UserOut
from pwd_utils import hash_password, verify_password
import logging
import traceback

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(user: UserRegister, db: Session = Depends(get_db)):
    logger.info(f"Registering user: {user.email}")
    try:
        normalized_email = user.email.lower().strip()
        if db.query(User).filter(User.email == normalized_email).first():
            logger.warning(f"Email already exists: {normalized_email}")
            raise HTTPException(status_code=400, detail="Email already registered")

        if db.query(User).filter(User.phone == user.phone).first():
            logger.warning(f"Phone already exists: {user.phone}")
            raise HTTPException(
                status_code=400, detail="Phone number already registered"
            )

        new_user = User(
            name=user.name,
            email=normalized_email,
            password=hash_password(user.password),
            phone=user.phone,
            address=user.address,
            role="user",
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        logger.info(f"User created successfully: {new_user.id}")

        return {
            "message": "User registered successfully",
            "user_id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
        }
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        logger.error(f"CRITICAL ERROR IN REGISTER: {str(e)}")
        raise HTTPException(
            status_code=500, detail="Internal Server Error during registration"
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
            "user_name": db_user.name,
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


@router.get("/users")
def get_all_users(db: Session = Depends(get_db)):
    return db.query(User).all()


@router.get("/profile", response_model=UserOut)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/profile", response_model=UserOut)
def update_profile(
    user_update: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    current_user.name = user_update.name
    current_user.email = user_update.email.lower().strip()
    current_user.phone = user_update.phone
    current_user.address = user_update.address

    db.commit()
    db.refresh(current_user)
    return current_user
