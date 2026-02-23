from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from dependencies import get_db, get_current_user
from models.supports import Support
from schemas.supports_schema import SupportCreate
from models.users import User

router = APIRouter(prefix="/api/supports", tags=["Supports"])


@router.post("")
def create_support_root(
    support: SupportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    new_support = Support(
        user_id=current_user.id, subject=support.subject, message=support.message
    )

    db.add(new_support)
    db.commit()
    db.refresh(new_support)
    return {"message": "Support ticket created successfully", "support_id": new_support.id}


@router.post("/create")
def create_support(
    support: SupportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    new_support = Support(
        user_id=current_user.id, subject=support.subject, message=support.message
    )

    db.add(new_support)
    db.commit()
    db.refresh(new_support)
    return new_support

