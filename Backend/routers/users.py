from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from dependencies import get_db, get_current_user, get_current_admin
from models.users import User
from models.providers import Provider
from schemas.user_schema import UserProfileUpdate, UserOut
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["Users"])


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
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/toggle-status/{user_id}")
def toggle_user_status(
    user_id: int,
    db: Session = Depends(get_db),
    admin: bool = Depends(get_current_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = not user.is_active
    db.commit()
    return {"message": "User status updated", "is_active": user.is_active}


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: bool = Depends(get_current_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Also delete provider profile if exists
    provider = db.query(Provider).filter(Provider.user_id == user.id).first()
    if provider:
        db.delete(provider)
        
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}
