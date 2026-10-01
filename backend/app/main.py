from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Load all models so SQLAlchemy can resolve relationships.
from app.models.category import Category
from app.models.food import Food
from app.models.user import User
from app.models.customer import Customer
from app.models.order import Order
from app.models.order_item import OrderItem

from app.routers.auth import router as auth_router
from app.routers.categories import router as categories_router
from app.routers.foods import router as foods_router
from app.routers.orders import router as orders_router
from app.routers.customers import router as customers_router
from app.routers.users import router as users_router
from app.routers.dashboard import router as dashboard_router


app = FastAPI(title="Food Ordering API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(categories_router)
app.include_router(foods_router)
app.include_router(orders_router)
app.include_router(customers_router)
app.include_router(users_router)
app.include_router(dashboard_router)


@app.get("/")
def root():
    return {"message": "Food Ordering API is running"}