from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from dependencies import get_db, get_current_user, get_current_provider
from models.reviews import Review
from models.users import User
from models.providers import Provider
from models.bookings import Booking
from schemas.reviews_schema import ReviewCreate, ProviderProfileUpdate

router = APIRouter(prefix="/api/reviews", tags=["Reviews"])


@router.post("", status_code=status.HTTP_201_CREATED)
def create_review(
    review: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    new_review = Review(
        user_id=current_user.id,
        booking_id=review.booking_id,
        service_id=review.service_id,
        provider_id=review.provider_id,
        rating=review.rating,
        comment=review.comment,
    )

    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    return {"message": "Review submitted successfully", "review_id": new_review.id}


@router.get("/my/reviews")
def get_my_reviews(
    db: Session = Depends(get_db), current_provider: Provider = Depends(get_current_provider)
):

    provider = current_provider

    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    reviews = db.query(Review).filter(Review.provider_id == provider.id).all()

    response = []
    for r in reviews:
        response.append(
            {
                "id": r.id,
                "rating": r.rating,
                "comment": r.comment,
                "user_name": r.user.name if r.user else "Anonymous",
                "service_id": r.service_id,
                "service_name": r.service.name if r.service else "Service",
            }
        )
    return response


@router.get("/my/profile")
def get_provider_profile(
    db: Session = Depends(get_db), current_provider: Provider = Depends(get_current_provider)
):
    provider = current_provider
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    avg_rating_query = (
        db.query(Review.rating).filter(Review.provider_id == provider.id).all()
    )
    if avg_rating_query:
        avg = sum(r[0] for r in avg_rating_query) / len(avg_rating_query)
        total_reviews = len(avg_rating_query)
        satisfaction_rate = round(
            (len([r for r in avg_rating_query if r[0] >= 4]) / total_reviews) * 100
        )
    else:
        avg = 0.0
        total_reviews = 0
        satisfaction_rate = 100

    completed_orders = (
        db.query(Booking)
        .filter(Booking.provider_id == provider.id, Booking.status == "completed")
        .count()
    )

    total_assigned = (
        db.query(Booking)
        .filter(
            Booking.provider_id == provider.id,
            Booking.status.in_(["confirmed", "completed"]),
        )
        .count()
    )

    completion_rate = (
        round((completed_orders / total_assigned) * 100) if total_assigned > 0 else 100
    )

    from models.services import Service

    total_earned_query = (
        db.query(Service.price)
        .join(Booking, Booking.service_id == Service.id)
        .filter(Booking.provider_id == provider.id, Booking.status == "completed")
        .all()
    )
    total_earnings = sum(e[0] for e in total_earned_query)

    return {
        "profile": {
            "full_name": provider.full_name,
            "email": provider.email,
            "phone": provider.phone,
            "address": provider.address,
            "specialization": provider.specialization,
            "years_experience": provider.years_experience,
            "bio": provider.bio,
            "availability": provider.availability,
            "is_verified": provider.is_verified,
            "service_name": provider.service.name if provider.service else "Service",
            "price": provider.service.price if provider.service else 300,
        },
        "metrics": {
            "average_rating": round(avg, 1),
            "total_reviews": total_reviews,
            "completed_orders": completed_orders,
            "completion_rate": completion_rate,
            "satisfaction_rate": satisfaction_rate,
            "total_earnings": total_earnings,
        },
    }


@router.put("/my/profile")
def update_provider_profile(
    profile_update: ProviderProfileUpdate,
    db: Session = Depends(get_db),
    current_provider: Provider = Depends(get_current_provider),
):
    provider = current_provider
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    provider.full_name = profile_update.full_name
    provider.email = profile_update.email
    provider.phone = profile_update.phone
    provider.address = profile_update.address
    provider.specialization = profile_update.specialization
    provider.years_experience = profile_update.years_experience
    provider.bio = profile_update.bio
    provider.availability = profile_update.availability

    db.commit()
    db.refresh(provider)

    return {"message": "Profile updated successfully"}
