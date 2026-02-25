from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from dependencies import get_db, get_current_user, get_current_provider, get_current_admin
from models.users import User
from models.services import Service
from models.bookings import Booking
from models.providers import Provider
from schemas.bookings_schema import BookingCreate
from models.reviews import Review
from utils.storage import upload_to_cloudinary
from datetime import date as date_type, time as time_type


router = APIRouter(prefix="/api/bookings", tags=["Bookings"])


@router.get("/all")
def get_all_bookings(
    db: Session = Depends(get_db), 
    admin: bool = Depends(get_current_admin)
):
    bookings = db.query(Booking).all()
    response = []
    for b in bookings:
        response.append({
            "id": b.id,
            "user_name": b.user.name if b.user else "Unknown",
            "service_name": b.service.name if b.service else "Unknown",
            "provider_name": b.provider.full_name if b.provider else "Not assigned",
            "date": str(b.date),
            "time": str(b.time),
            "status": b.status,
            "amount": b.service.price if b.service else 0,
            "address": f"{b.address}, {b.city} - {b.pincode}"
        })
    return response


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_booking(
    service_id: int = Form(...),
    address: str = Form(...),
    city: str = Form(...),
    pincode: str = Form(...),
    date: str = Form(...),
    time: str = Form(...),
    instructions: str = Form(None),
    issue_image: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    # Handle image upload if present
    img_url = None
    if issue_image and issue_image.filename:
        img_url = upload_to_cloudinary(issue_image.file, folder="homebuddy/bookings")
        # Log the result for debugging
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"Uploaded issue image URL: {img_url}")

    new_booking = Booking(
        user_id=current_user.id,
        service_id=service_id,
        address=address,
        city=city,
        pincode=pincode,
        date=date_type.fromisoformat(date),
        time=time_type.fromisoformat(time),
        instructions=instructions,
        issue_image=img_url,
        status="pending",
    )

    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    return {"message": "Booking created successfully", "booking_id": new_booking.id, "issue_image": img_url}


@router.get("/accepted")
def get_accepted_bookings(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return (
        db.query(Booking)
        .filter(Booking.user_id == current_user.id, Booking.status == "confirmed")
        .all()
    )


from sqlalchemy.orm import Session, joinedload

@router.get("/my")
def get_my_bookings(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    try:
        bookings = (
            db.query(Booking)
            .options(
                joinedload(Booking.review),
                joinedload(Booking.service)
            )
            .filter(Booking.user_id == current_user.id)
            .all()
        )

        response = []

        for b in bookings:
            booking_data = {
                "id": b.id,
                "service_id": b.service_id,
                "service_name": b.service.name if b.service else "Unknown",
                "address": b.address,
                "city": b.city,
                "pincode": b.pincode,
                "date": str(b.date),
                "time": str(b.time),
                "instructions": b.instructions,
                "status": b.status,
                "provider_id": b.provider_id,
                "provider": None,
                "issue_image": b.issue_image,  
            }

            if b.provider_id and b.status in ["confirmed", "completed"]:
                provider = db.query(Provider).filter(
                    Provider.id == b.provider_id
                ).first()

                if provider:
                    booking_data["provider"] = {
                        "full_name": provider.full_name,
                        "email": provider.email,
                        "phone": provider.phone,
                    }

            if b.review:
                booking_data["review"] = {
                    "rating": b.review.rating,
                    "comment": b.review.comment,
                }

            response.append(booking_data)

        return response

    except Exception as e:
        import traceback
        print(" ERROR in /api/bookings/my")
        print(str(e))
        print(traceback.format_exc())

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@router.get("/{booking_id}")
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = (
        db.query(Booking)
        .filter(Booking.id == booking_id, Booking.user_id == current_user.id)
        .first()
    )

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    return {
        "id": booking.id,
        "service_id": booking.service_id,
        "service_name": booking.service.name if booking.service else "Unknown",
        "provider_id": booking.provider_id,
        "provider_name": (
            booking.provider.full_name if booking.provider else "Not Assigned"
        ),
        "address": booking.address,
        "city": booking.city,
        "pincode": booking.pincode,
        "date": booking.date,
        "time": booking.time,
        "instructions": booking.instructions,
        "status": booking.status,
    }


@router.delete("/{booking_id}")
def delete_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = (
        db.query(Booking)
        .filter(Booking.id == booking_id, Booking.user_id == current_user.id)
        .first()
    )

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    db.delete(booking)
    db.commit()
    return {"message": "Booking cancelled successfully"}


#  USER → GET WHO ACCEPTED THE ORDER
@router.get("/my/accepted")
def get_who_accepted_my_booking(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    results = (
        db.query(Booking, Provider)
        .join(Provider, Booking.provider_id == Provider.id)
        .filter(Booking.user_id == current_user.id, Booking.status == "confirmed")
        .all()
    )

    response = []
    for booking, provider in results:
        response.append(
            {
                "booking_id": booking.id,
                "service_id": booking.service_id,
                "date": booking.date,
                "time": booking.time,
                "status": booking.status,
                "provider": {
                    "provider_id": provider.id,
                    "experience": provider.years_experience,
                    "location": provider.address,
                    "bio": provider.bio,
                },
            }
        )

    return response


#  PROVIDER → PUT CONFIRMED → COMPLETED
@router.put("/provider/{booking_id}/complete")
def provider_complete_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_provider: Provider = Depends(get_current_provider),
):
    booking = (
        db.query(Booking)
        .filter(
            Booking.id == booking_id,
            Booking.provider_id == current_provider.id,
            Booking.status == "confirmed",
        )
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=404, detail="Confirmed booking not found for this provider"
        )

    booking.status = "completed"
    db.commit()
    db.refresh(booking)

    return {
        "message": "Booking marked as completed by provider",
        "booking_id": booking.id,
        "status": booking.status,
    }


#  PROVIDER → GET USERS WITH PENDING REQUESTS
@router.get("/provider/pending")
def get_provider_pending_bookings(
    db: Session = Depends(get_db),
    current_provider: Provider = Depends(get_current_provider),
):
    try:
        # Filter bookings by the provider's specific service specialty
        bookings = (
            db.query(Booking)
            .filter(
                Booking.status == "pending",
                Booking.service_id == current_provider.service_id
            )
            .all()
        )

        response = []
        for b in bookings:
            response.append(
                {
                    "id": b.id,
                    "service_id": b.service_id,
                    "service_name": b.service.name if b.service else "Unknown",
                    "date": str(b.date),
                    "time": str(b.time),
                    "instructions": b.instructions,
                    "issue_image": b.issue_image,
                    "status": b.status,
                    "address": b.address,
                    "city": b.city,
                    "pincode": b.pincode,
                    "user_name": b.user.name if b.user else "Unknown",
                    "user_phone": b.user.phone if b.user else "N/A",
                }
            )
        return response
    except Exception as e:
        import traceback
        logger.error(f"ERROR in /api/bookings/provider/pending: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


#  PROVIDER → PUT PENDING → CONFIRMED
@router.put("/provider/{booking_id}/confirm")
def confirm_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_provider: Provider = Depends(get_current_provider),
):
    booking = (
        db.query(Booking)
        .filter(Booking.id == booking_id, Booking.status == "pending")
        .first()
    )

    if not booking:
        raise HTTPException(status_code=404, detail="Pending booking not found")

    booking.provider_id = current_provider.id
    booking.status = "confirmed"
    db.commit()

    return {
        "message": "Booking confirmed successfully",
        "booking_id": booking.id,
        "status": booking.status,
    }


# PROVIDER → PUT PENDING → REJECTED
@router.put("/provider/{booking_id}/reject")
def reject_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_provider: Provider = Depends(get_current_provider),
):
    booking = (
        db.query(Booking)
        .filter(Booking.id == booking_id, Booking.status == "pending")
        .first()
    )

    if not booking:
        raise HTTPException(status_code=404, detail="Pending booking not found")

    booking.status = "rejected"
    db.commit()

    return {
        "message": "Booking rejected successfully",
        "booking_id": booking.id,
        "status": booking.status,
    }


#  PROVIDER → GET CONFIRMED BOOKINGS
@router.get("/provider/confirmed")
def get_provider_confirmed_bookings(
    db: Session = Depends(get_db),
    current_provider: Provider = Depends(get_current_provider),
):
    bookings = (
        db.query(Booking)
        .filter(
            Booking.provider_id == current_provider.id, Booking.status == "confirmed"
        )
        .all()
    )

    response = []
    for b in bookings:
        response.append(
            {
                "id": b.id,
                "service_id": b.service_id,
                "service_name": b.service.name if b.service else "Unknown",
                "date": str(b.date),
                "time": str(b.time),
                "address": b.address,
                "city": b.city,
                "pincode": b.pincode,
                "status": b.status,
                "user_name": b.user.name if b.user else "Unknown",
                "user_phone": b.user.phone if b.user else "N/A",
            }
        )
    return response


#  PROVIDER → GET COMPLETED BOOKINGS
@router.get("/provider/completed")
def get_provider_completed_bookings(
    db: Session = Depends(get_db),
    current_provider: Provider = Depends(get_current_provider),
):
    bookings = (
        db.query(Booking)
        .filter(
            Booking.provider_id == current_provider.id, Booking.status == "completed"
        )
        .all()
    )

    response = []
    for b in bookings:
        booking_info = {
            "id": b.id,
            "service_id": b.service_id,
            "service_name": b.service.name if b.service else "Unknown",
            "date": str(b.date),
            "time": str(b.time),
            "instructions": b.instructions,
            "status": b.status,
            "address": b.address,
            "city": b.city,
            "pincode": b.pincode,
            "review": (
                {"rating": b.review.rating, "comment": b.review.comment}
                if b.review
                else None
            ),
        }
        response.append(booking_info)

    return response


#  PROVIDER → GET STATISTICS
@router.get("/provider/statistics")
def get_provider_statistics(
    db: Session = Depends(get_db),
    current_provider: Provider = Depends(get_current_provider),
):
    try:
        # Only count pending bookings that match this provider's service
        pending = (
            db.query(Booking)
            .filter(
                Booking.status == "pending",
                Booking.service_id == current_provider.service_id
            )
            .count()
        )
        accepted = (
            db.query(Booking)
            .filter(
                Booking.provider_id == current_provider.id, Booking.status == "confirmed"
            )
            .count()
        )
        completed = (
            db.query(Booking)
            .filter(
                Booking.provider_id == current_provider.id, Booking.status == "completed"
            )
            .count()
        )

        total_earned = (
            db.query(Service.price)
            .join(Booking, Booking.service_id == Service.id)
            .filter(
                Booking.provider_id == current_provider.id, Booking.status == "completed"
            )
            .all()
        )

        earnings = sum(e[0] for e in total_earned)

        from models.reviews import Review

        ratings = (
            db.query(Review.rating).filter(Review.provider_id == current_provider.id).all()
        )
        if ratings:
            avg_rating = round(sum(r[0] for r in ratings) / len(ratings), 1)
            total_reviews = len(ratings)
            satisfaction_rate = round(
                (len([r for r in ratings if r[0] >= 4]) / total_reviews) * 100
            )
        else:
            avg_rating = 0.0
            total_reviews = 0
            satisfaction_rate = 100

        total_assigned = (
            db.query(Booking)
            .filter(
                Booking.provider_id == current_provider.id,
                Booking.status.in_(["confirmed", "completed"]),
            )
            .count()
        )

        completion_rate = (
            round((completed / total_assigned) * 100) if total_assigned > 0 else 100
        )

        return {
            "pending": pending,
            "accepted": accepted,
            "completed": completed,
            "earnings": earnings,
            "rating": avg_rating,
            "total_reviews": total_reviews,
            "completion_rate": completion_rate,
            "satisfaction_rate": satisfaction_rate,
        }
    except Exception as e:
        import traceback
        logger.error(f"ERROR in /api/bookings/provider/statistics: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
