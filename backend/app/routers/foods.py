from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.auth.dependencies import require_admin
from app.database.connection import get_db
from app.models.category import Category
from app.models.food import Food
from app.models.order_item import OrderItem
from app.models.user import User
from app.schemas.food import (
    FoodCreate,
    FoodUpdate,
    FoodResponse,
    FoodListResponse,
)


router = APIRouter(prefix="/foods", tags=["Foods"])


def find_food(food_id: int, db: Session) -> Food:
    food = db.get(Food, food_id)

    if food is None:
        raise HTTPException(status_code=404, detail="Food not found")

    return food


def check_category(category_id: int, db: Session):
    if db.get(Category, category_id) is None:
        raise HTTPException(
            status_code=404,
            detail="Category not found",
        )


@router.get("/", response_model=FoodListResponse)
def list_foods(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    search: str | None = Query(default=None, max_length=150),
    category_id: int | None = Query(default=None, gt=0),
    is_available: bool | None = None,
    sort: Literal["price", "name", "id"] = "name",
    order: Literal["asc", "desc"] = "asc",
    db: Session = Depends(get_db),
):
    filters = []

    if search and search.strip():
        filters.append(
            Food.name.contains(search.strip(), autoescape=True)
        )

    if category_id is not None:
        filters.append(Food.category_id == category_id)

    if is_available is not None:
        filters.append(Food.is_available == is_available)

    total = db.scalar(
        select(func.count(Food.id)).where(*filters)
    ) or 0

    sort_columns = {
        "price": Food.price,
        "name": Food.name,
        "id": Food.id,
    }

    sort_column = sort_columns[sort]
    ordering = (
        sort_column.asc()
        if order == "asc"
        else sort_column.desc()
    )

    foods = db.scalars(
        select(Food)
        .where(*filters)
        .order_by(ordering, Food.id.asc())
        .offset((page - 1) * limit)
        .limit(limit)
    ).all()

    return {
        "items": foods,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit,
    }


@router.get("/{food_id}", response_model=FoodResponse)
def get_food(food_id: int, db: Session = Depends(get_db)):
    return find_food(food_id, db)


@router.post("/", response_model=FoodResponse, status_code=201)
def create_food(
    data: FoodCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    check_category(data.category_id, db)

    food = Food(**data.model_dump())
    db.add(food)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Food could not be saved; check the category",
        )

    db.refresh(food)
    return food


@router.put("/{food_id}", response_model=FoodResponse)
def update_food(
    food_id: int,
    data: FoodUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    food = find_food(food_id, db)
    check_category(data.category_id, db)

    for field, value in data.model_dump().items():
        setattr(food, field, value)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Food could not be updated; check the category",
        )

    db.refresh(food)
    return food


@router.delete("/{food_id}", status_code=204)
def delete_food(
    food_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    food = find_food(food_id, db)

    ordered_item_id = db.scalar(
        select(OrderItem.id)
        .where(OrderItem.food_id == food_id)
        .limit(1)
    )

    if ordered_item_id is not None:
        raise HTTPException(
            status_code=409,
            detail=(
                "Food has order history. "
                "Mark it unavailable instead of deleting it."
            ),
        )

    db.delete(food)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Food is in use and cannot be deleted",
        )

    return Response(status_code=204)