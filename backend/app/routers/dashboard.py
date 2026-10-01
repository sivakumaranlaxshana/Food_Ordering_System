from decimal import Decimal

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.auth.dependencies import require_admin
from app.database.connection import get_db
from app.models.category import Category
from app.models.customer import Customer
from app.models.food import Food
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.user import User
from app.schemas.dashboard import (
    DashboardResponse,
    PopularFoodResponse,
)


router = APIRouter(prefix="/dashboard", tags=["Admin Dashboard"])


@router.get("/", response_model=DashboardResponse)
def dashboard(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    total_foods = db.scalar(select(func.count(Food.id))) or 0
    total_categories = db.scalar(
        select(func.count(Category.id))
    ) or 0
    total_customers = db.scalar(
        select(func.count(Customer.id))
    ) or 0
    total_orders = db.scalar(select(func.count(Order.id))) or 0

    pending_orders = db.scalar(
        select(func.count(Order.id))
        .where(Order.status == "Pending")
    ) or 0

    delivered_orders = db.scalar(
        select(func.count(Order.id))
        .where(Order.status == "Delivered")
    ) or 0

    total_revenue = db.scalar(
        select(func.sum(Order.total_amount))
        .where(Order.status == "Delivered")
    )

    return {
        "total_foods": total_foods,
        "total_categories": total_categories,
        "total_customers": total_customers,
        "total_orders": total_orders,
        "total_revenue": (
            total_revenue
            if total_revenue is not None
            else Decimal("0.00")
        ),
        "pending_orders": pending_orders,
        "delivered_orders": delivered_orders,
    }


@router.get(
    "/popular-foods",
    response_model=list[PopularFoodResponse],
)
def popular_foods(
    limit: int = Query(default=5, ge=1, le=50),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    ordered_quantity = func.sum(OrderItem.quantity)

    rows = db.execute(
        select(
            Food.id.label("food_id"),
            Food.name.label("food_name"),
            ordered_quantity.label("ordered_quantity"),
        )
        .join(OrderItem, OrderItem.food_id == Food.id)
        .join(Order, Order.id == OrderItem.order_id)
        .where(Order.status == "Delivered")
        .group_by(Food.id, Food.name)
        .order_by(ordered_quantity.desc(), Food.id.asc())
        .limit(limit)
    ).mappings().all()

    return [dict(row) for row in rows]