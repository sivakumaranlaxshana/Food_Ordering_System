from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.auth.dependencies import get_current_user, require_admin
from app.database.connection import get_db
from app.models.customer import Customer
from app.models.food import Food
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.user import User
from app.schemas.order import (
    OrderCreate,
    OrderResponse,
    OrderStatusUpdate,
)


router = APIRouter(prefix="/orders", tags=["Orders"])


def get_customer(user: User, db: Session) -> Customer:
    customer = db.scalar(
        select(Customer).where(Customer.user_id == user.id)
    )

    if customer is None:
        raise HTTPException(
            status_code=403,
            detail="Customer profile required",
        )

    return customer


@router.post("/", response_model=OrderResponse, status_code=201)
def create_order(
    data: OrderCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    customer = get_customer(user, db)
    food_ids = [item.food_id for item in data.items]

    try:
        # Lock foods while checking availability and capturing prices.
        foods = db.scalars(
            select(Food)
            .where(Food.id.in_(food_ids))
            .order_by(Food.id)
            .with_for_update()
        ).all()

        foods_by_id = {food.id: food for food in foods}
        total = Decimal("0.00")
        order_items = []

        for item in data.items:
            food = foods_by_id.get(item.food_id)

            if food is None:
                raise HTTPException(
                    status_code=404,
                    detail=f"Food {item.food_id} not found",
                )

            if not food.is_available:
                raise HTTPException(
                    status_code=409,
                    detail=f"{food.name} is unavailable",
                )

            if food.price <= 0:
                raise HTTPException(
                    status_code=409,
                    detail=f"{food.name} has an invalid price",
                )

            subtotal = food.price * item.quantity
            total += subtotal

            order_items.append(
                OrderItem(
                    food_id=food.id,
                    quantity=item.quantity,
                    unit_price=food.price,
                    subtotal=subtotal,
                )
            )

        if total > Decimal("9999999999.99"):
            raise HTTPException(
                status_code=422,
                detail="Order total exceeds the supported amount",
            )

        order = Order(
            customer_id=customer.id,
            total_amount=total,
            status="Pending",
            items=order_items,
        )

        db.add(order)
        db.commit()

    except Exception:
        db.rollback()
        raise

    db.refresh(order)
    return order


@router.get("/my", response_model=list[OrderResponse])
def my_orders(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    customer = get_customer(user, db)

    return db.scalars(
        select(Order)
        .where(Order.customer_id == customer.id)
        .options(selectinload(Order.items))
        .order_by(Order.created_at.desc(), Order.id.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    ).all()


@router.get("/admin", response_model=list[OrderResponse])
def all_orders(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    return db.scalars(
        select(Order)
        .options(selectinload(Order.items))
        .order_by(Order.created_at.desc(), Order.id.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    ).all()


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    statement = (
        select(Order)
        .where(Order.id == order_id)
        .options(selectinload(Order.items))
    )

    if user.role != "Admin":
        customer = get_customer(user, db)
        statement = statement.where(
            Order.customer_id == customer.id
        )

    order = db.scalar(statement)

    if order is None:
        raise HTTPException(
            status_code=404,
            detail="Order not found",
        )

    return order


@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    data: OrderStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    order = db.scalar(
        select(Order)
        .where(Order.id == order_id)
        .with_for_update()
    )

    if order is None:
        raise HTTPException(
            status_code=404,
            detail="Order not found",
        )

    allowed_transitions = {
        "Pending": {"Confirmed", "Cancelled"},
        "Confirmed": {"Preparing", "Cancelled"},
        "Preparing": {"Out for Delivery", "Cancelled"},
        "Out for Delivery": {"Delivered"},
        "Delivered": set(),
        "Cancelled": set(),
    }

    if data.status != order.status:
        allowed = allowed_transitions.get(order.status, set())

        if data.status not in allowed:
            raise HTTPException(
                status_code=409,
                detail=(
                    f"Cannot change status from "
                    f"{order.status} to {data.status}"
                ),
            )

    order.status = data.status

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise

    db.refresh(order)
    return order