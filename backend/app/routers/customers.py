from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.connection import get_db
from app.models.customer import Customer
from app.models.user import User
from app.schemas.customer import CustomerResponse, CustomerUpdate


router = APIRouter(prefix="/customers", tags=["Customers"])


def find_profile(user: User, db: Session) -> Customer:
    customer = db.scalar(
        select(Customer).where(Customer.user_id == user.id)
    )

    if customer is None:
        raise HTTPException(
            status_code=404,
            detail="Customer profile not found",
        )

    return customer


@router.get("/me", response_model=CustomerResponse)
def my_profile(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return find_profile(user, db)


@router.put("/me", response_model=CustomerResponse)
def update_profile(
    data: CustomerUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    customer = find_profile(user, db)

    customer.name = data.name
    customer.phone = data.phone
    customer.address = data.address

    # Keep the account name and customer name consistent.
    user.name = data.name

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise

    db.refresh(customer)
    return customer