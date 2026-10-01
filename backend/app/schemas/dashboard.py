from decimal import Decimal

from pydantic import BaseModel


class DashboardResponse(BaseModel):
    total_foods: int
    total_categories: int
    total_customers: int
    total_orders: int
    total_revenue: Decimal
    pending_orders: int
    delivered_orders: int


class PopularFoodResponse(BaseModel):
    food_id: int
    food_name: str
    ordered_quantity: int