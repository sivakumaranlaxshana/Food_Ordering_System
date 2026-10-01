from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class FoodCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(min_length=2, max_length=150)
    description: str | None = Field(default=None, max_length=1000)
    price: Decimal = Field(gt=0, max_digits=10, decimal_places=2)
    image: str | None = Field(default=None, max_length=500)
    is_available: bool = True
    category_id: int = Field(gt=0)


class FoodUpdate(FoodCreate):
    pass


class FoodResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None
    price: Decimal
    image: str | None
    is_available: bool
    category_id: int


class FoodListResponse(BaseModel):
    items: list[FoodResponse]
    total: int
    page: int
    limit: int
    total_pages: int