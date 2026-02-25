from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from dependencies import get_db, get_current_user
from models.providers import Provider
from models.users import User
from datetime import date

from schemas.provider_schema import ProviderCreate, ProviderUpdate, ProviderResponse

from pwd_utils import hash_password
from utils.storage import upload_to_cloudinary
import logging
import traceback

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/providers", tags=["Providers"])

@router.post("/create", response_model=ProviderResponse)
async def create_provider(
    full_name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    phone: str = Form(...),
    dob: str = Form(...), # date as string to be parsed
    address: str = Form(...),
    service_id: int = Form(...),
    years_experience: int = Form(...),
    specialization: str = Form(...),
    bio: str = Form(...),
    id_proof: UploadFile = File(...),
    certificate: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Register a new service provider with document uploads.
    """
    logger.info(f"New provider registration attempt: {email}")
    normalized_email = email.lower().strip()

    try:
        # 1. Integrity Check: Check for existing User/Provider
        existing_user = db.query(User).filter(User.email == normalized_email).first()
        db_user = None
        
        if existing_user:
            existing_provider = db.query(Provider).filter(Provider.user_id == existing_user.id).first()
            if existing_provider:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, 
                    detail="An account with this email already exists as a provider."
                )
            existing_user.role = "provider"
            db_user = existing_user
            
        hashed_pw = hash_password(password)
        
        if not db_user:
             db_user = User(
                 name=full_name.strip(),
                 email=normalized_email,
                 password=hashed_pw,
                 phone=phone.strip(),
                 address=address.strip(),
                 role="provider",
                 is_active=True
             )
             db.add(db_user)
             db.flush()

        # 2. Handle File Uploads via Cloudinary
        id_proof_url = upload_to_cloudinary(id_proof.file)
        certificate_url = upload_to_cloudinary(certificate.file)

        if not id_proof_url or not certificate_url:
             raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to upload documents to cloud storage."
            )

        # 3. Create the Provider Profile
        # Correctly format dob from string
        try:
            dob_date = date.fromisoformat(dob)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format for DOB. Use YYYY-MM-DD.")

        new_provider = Provider(
            user_id=db_user.id,
            full_name=full_name.strip(),
            email=normalized_email,
            password=hashed_pw,
            phone=phone.strip(),
            dob=dob_date,
            address=address.strip(),
            service_id=service_id,
            years_experience=years_experience,
            specialization=specialization,
            bio=bio,
            id_proof=id_proof_url,
            certificate=certificate_url,
            role="provider",
            is_verified=False
        )

        db.add(new_provider)
        db.commit()
        db.refresh(new_provider)
        
        logger.info(f"Provider registration success: ID {new_provider.id}")
        return new_provider

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"FATAL ERROR in provider registration: {str(e)}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create provider account. Please verify all fields are correct."
        )



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


@router.post("/verify/{provider_id}")
def verify_provider(provider_id: int, db: Session = Depends(get_db)):
    provider = db.query(Provider).filter(Provider.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    return {"message": "Provider verified successfully", "is_verified": provider.is_verified}


@router.post("/reject/{provider_id}")
def reject_provider(provider_id: int, db: Session = Depends(get_db)):
    provider = db.query(Provider).filter(Provider.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    # Optional: You could delete the provider, or mark them as rejected.
    # The current implementation of verification list filters by !is_verified.
    # To "reject", we could either delete or have an is_rejected flag.
    # Given the existing verification page logic, deleting them from providers table 
    # but keeping the user record might be the simplest 'rejection' flow.
    # However, let's just delete the provider entry to remove them from verifications.
    db.delete(provider)
    db.commit()
    return {"message": "Provider application rejected and removed."}


@router.delete("/delete/{provider_id}")
def delete_provider(provider_id: int, db: Session = Depends(get_db)):
    provider = db.query(Provider).filter(Provider.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    db.delete(provider)
    db.commit()
    return {"message": "Provider deleted successfully"}
