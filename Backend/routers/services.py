from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from dependencies import get_db
from models.services import Service
from schemas.services_schema import ServiceCreate, ServiceResponse
from typing import List

router = APIRouter(prefix="/api/services", tags=["Services"])


@router.post("", status_code=status.HTTP_201_CREATED, response_model=ServiceResponse)
def create_service(service: ServiceCreate, db: Session = Depends(get_db)):
    new_service = Service(
        name=service.name, price=service.price, description=service.description
    )

    db.add(new_service)
    db.commit()
    db.refresh(new_service)

    return new_service


@router.get("", response_model=List[ServiceResponse])
def get_all_services(db: Session = Depends(get_db)):
    return db.query(Service).all()


@router.get("/{service_id}", response_model=ServiceResponse)
def get_service(service_id: int, db: Session = Depends(get_db)):
    service = db.query(Service).filter(Service.id == service_id).first()

    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    return service
