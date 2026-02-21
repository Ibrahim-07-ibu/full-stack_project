from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from dependencies import get_db, get_current_user
from models.providers import Provider
from models.users import User

from schemas.provider_schema import ProviderCreate, ProviderUpdate, ProviderResponse

from pwd_utils import hash_password

router = APIRouter(prefix="/api/providers", tags=["Providers"])

@router.post("/create", response_model=ProviderResponse)
def create_provider(provider: ProviderCreate, db: Session = Depends(get_db)):
    normalized_email = provider.email.lower().strip()

    db_user = db.query(User).filter(User.email == normalized_email).first()

    if not db_user:
        db_user = User(
            name=provider.full_name,
            email=normalized_email,
            password=hash_password(provider.password),
            phone=provider.phone,
            address=provider.address,
            role="provider",
        )
        db.add(db_user)
        db.flush()
    else:
        db_user.role = "provider"

    existing_provider = db.query(Provider).filter(Provider.user_id == db_user.id).first()
    if existing_provider:
        raise HTTPException(status_code=400, detail="Provider already exists")

    provider_data = provider.model_dump()
    provider_data["email"] = normalized_email
    provider_data["password"] = hash_password(provider.password)

    new_provider = Provider(user_id=db_user.id, **provider_data)

    db.add(new_provider)
    db.commit()
    db.refresh(new_provider)

    return new_provider



@router.get("/all", response_model=list[ProviderResponse])
def get_providers(db: Session = Depends(get_db)):
    return db.query(Provider).all()


@router.get("/{provider_id}", response_model=ProviderResponse)
def get_provider(provider_id: int, db: Session = Depends(get_db)):
    provider = db.query(Provider).filter(Provider.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    return provider


@router.put("/update/{provider_id}", response_model=ProviderResponse)
def update_provider(
    provider_id: int, update: ProviderUpdate, db: Session = Depends(get_db)
):
    provider = db.query(Provider).filter(Provider.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    for key, value in update.model_dump(exclude_unset=True).items():
        setattr(provider, key, value)

    db.commit()
    db.refresh(provider)
    return provider


@router.delete("/delete/{provider_id}")
def delete_provider(provider_id: int, db: Session = Depends(get_db)):
    provider = db.query(Provider).filter(Provider.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    db.delete(provider)
    db.commit()
    return {"message": "Provider deleted successfully"}
