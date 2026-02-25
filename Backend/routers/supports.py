from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from dependencies import get_db, get_current_user, get_current_admin
from models.supports import Support
from schemas.supports_schema import SupportCreate, SupportResponse
from models.users import User
from typing import List

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

@router.get("/all", response_model=List[SupportResponse])
def get_all_supports(
    db: Session = Depends(get_db),
    admin: bool = Depends(get_current_admin)
):
    supports = db.query(Support).all()
    response = []
    for s in supports:
        response.append({
            "id": s.id,
            "user_id": s.user_id,
            "user_name": s.user.name if s.user else "Unknown User",
            "subject": s.subject,
            "message": s.message
        })
    return response
