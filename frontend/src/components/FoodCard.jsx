import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useCart } from "../context/CartContext.jsx";

export default function FoodCard({ food }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [failedImage, setFailedImage] = useState("");

  const showImage = food.image && failedImage !== food.image;

  function handleAddToCart() {
    if (!food.is_available) return;

    addToCart(food);
    navigate("/cart");
  }

  return (
    <article className="card h-100 border-0 shadow-sm overflow-hidden">
      {showImage ? (
        <img
          src={food.image}
          alt={food.name}
          className="card-img-top"
          loading="lazy"
          onError={() => setFailedImage(food.image)}
          style={{ height: 210, objectFit: "cover" }}
        />
      ) : (
        <div
          className="d-flex align-items-center justify-content-center"
          style={{ height: 210, background: "#edf2e7" }}
        >
          <span className="display-4" aria-label="Food image unavailable">
            🍽️
          </span>
        </div>
      )}

      <div className="card-body d-flex flex-column">
        <div className="mb-3">
          <span
            className={`badge ${
              food.is_available
                ? "text-bg-success"
                : "text-bg-secondary"
            }`}
          >
            {food.is_available ? "Available" : "Unavailable"}
          </span>
        </div>

        <h2 className="h5 fw-bold">{food.name}</h2>

        <p className="text-secondary small flex-grow-1">
          {food.description || "Freshly prepared for you."}
        </p>

        <div className="d-flex justify-content-between align-items-center gap-2">
          <strong>
            Rs.{" "}
            {Number(food.price).toLocaleString("en-LK", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </strong>

          <button
            type="button"
            className="btn btn-success btn-sm"
            disabled={!food.is_available}
            onClick={handleAddToCart}
          >
            + Add
          </button>
        </div>
      </div>
    </article>
  );
}