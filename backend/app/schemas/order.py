from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    model_validator,
)


OrderStatus = Literal[
    "Pending",
    "Confirmed",
    "Preparing",
    "Out for Delivery",
    "Delivered",
    "Cancelled",
]


class OrderItemCreate(BaseModel):
    food_id: int = Field(gt=0)
    quantity: int = Field(ge=1, le=1000)


class OrderCreate(BaseModel):
    items: list[OrderItemCreate] = Field(
        min_length=1,
        max_length=100,
    )

    @model_validator(mode="after")
    def reject_duplicate_foods(self):
        food_ids = [item.food_id for item in self.items]

        if len(food_ids) != len(set(food_ids)):
            raise ValueError(
                "Send each food only once with its total quantity"
            )

        return self


class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    food_id: int
    quantity: int
    unit_price: Decimal
    subtotal: Decimal


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_id: int
    total_amount: Decimal
    status: OrderStatus
    created_at: datetime
    items: list[OrderItemResponse]


class OrderStatusUpdate(BaseModel):
    status: OrderStatus