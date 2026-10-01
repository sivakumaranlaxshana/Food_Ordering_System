import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

const money = (amount) =>
  `Rs. ${Number(amount).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function Cart() {
  const {
    cart,
    cartCount,
    total,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

  return (
    <main className="container py-5">
      <p className="text-success small fw-bold">YOUR DELICIOUS PICKS</p>
      <h1 className="fw-bold mb-4">Your cart</h1>

      {cart.length === 0 ? (
        <div className="bg-white rounded-4 p-5 text-center shadow-sm">
          <div className="display-4 mb-3">🛒</div>
          <h2 className="h4">Your cart is empty</h2>
          <p className="text-secondary">Find something delicious in our menu.</p>
          <Link to="/foods" className="btn btn-success">
            Browse Menu
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-lg-8">
            {cart.map((item) => (
              <article
                className="bg-white rounded-4 p-3 mb-3 shadow-sm"
                key={item.id}
              >
                <div className="d-flex align-items-center flex-wrap gap-3">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                      style={{
                        width: 85,
                        height: 85,
                        objectFit: "cover",
                        borderRadius: 12,
                      }}
                    />
                  ) : (
                    <span className="fs-1" aria-hidden="true">🍽️</span>
                  )}

                  <div className="flex-grow-1">
                    <h2 className="h6 fw-bold">{item.name}</h2>
                    <p className="small text-secondary mb-1">
                      {money(item.price)} each
                    </p>
                    <button
                      className="btn btn-link text-danger p-0 small"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="d-flex align-items-center gap-3">
                    <button
                      className="btn btn-outline-success btn-sm"
                      disabled={item.quantity <= 1}
                      aria-label={`Decrease ${item.name} quantity`}
                      onClick={() => decreaseQuantity(item.id)}
                    >
                      −
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      className="btn btn-outline-success btn-sm"
                      disabled={item.quantity >= 1000}
                      aria-label={`Increase ${item.name} quantity`}
                      onClick={() => increaseQuantity(item.id)}
                    >
                      +
                    </button>
                  </div>

                  <strong>
                    {money(Number(item.price) * item.quantity)}
                  </strong>
                </div>
              </article>
            ))}
          </div>

          <div className="col-lg-4">
            <aside className="bg-white rounded-4 p-4 shadow-sm">
              <h2 className="h5 fw-bold">Order summary</h2>

              <div className="d-flex justify-content-between my-4">
                <span>Items</span>
                <span>{cartCount}</span>
              </div>

              <div className="d-flex justify-content-between border-top pt-3">
                <strong>Estimated total</strong>
                <strong>{money(total)}</strong>
              </div>

              <p className="small text-secondary mt-3">
                Final prices are confirmed when you place your order.
              </p>

              <Link to="/checkout" className="btn btn-success w-100 py-3">
                Proceed to Checkout →
              </Link>

              <Link
                to="/foods"
                className="d-block text-center text-success mt-3"
              >
                Continue shopping
              </Link>
            </aside>
          </div>
        </div>
      )}
    </main>
  );
}