from getpass import getpass

from pydantic import EmailStr, TypeAdapter, ValidationError
from sqlalchemy import select

from app.auth.security import hash_password
from app.database.connection import SessionLocal

# Load all models for relationships.
from app.models.category import Category
from app.models.food import Food
from app.models.user import User
from app.models.customer import Customer
from app.models.order import Order
from app.models.order_item import OrderItem


def main():
    name = input("Admin name: ").strip()
    email_input = input("Admin email: ").strip()

    if not 2 <= len(name) <= 100:
        print("Name must contain 2 to 100 characters.")
        return

    try:
        email = str(
            TypeAdapter(EmailStr).validate_python(email_input)
        ).lower()
    except ValidationError:
        print("Enter a valid email address.")
        return

    if len(email) > 254:
        print("Email is too long.")
        return

    with SessionLocal() as db:
        existing_user = db.scalar(
            select(User).where(User.email == email)
        )

        if existing_user:
            print("Email already exists. Use a new admin email.")
            return

        password = getpass("Admin password: ")
        confirm_password = getpass("Confirm password: ")

        if not 8 <= len(password) <= 128:
            print("Password must contain 8 to 128 characters.")
            return

        if password != confirm_password:
            print("Passwords do not match.")
            return

        admin = User(
            name=name,
            email=email,
            hashed_password=hash_password(password),
            role="Admin",
            is_active=True,
        )

        try:
            db.add(admin)
            db.commit()
        except Exception:
            db.rollback()
            raise

        print("Admin account created successfully.")
        print("Email:", email)


if __name__ == "__main__":
    main()