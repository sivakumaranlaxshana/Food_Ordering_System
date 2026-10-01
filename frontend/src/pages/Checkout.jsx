import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api.js";
import { useCart } from "../context/CartContext.jsx";

export default function Checkout() {
  const { cart, total, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);
  const [profileReady, setProfileReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);

  useEffect(() => {
    let active = true;

    api.get("/customers/me")
      .then(({ data }) => {
        if (!active) return;

        setForm({
          name: data.name,
          phone: data.phone,
          address: data.address,
        });
        setProfileReady(true);
      })
      .catch(() => {
        if (active) {
          setError("Customer profile could not be loaded. Login with a customer account.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  function change(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function placeOrder(event) {
    event.preventDefault();

    if (submitting.current || !profileReady || cart.length === 0) return;

    submitting.current = true;
    setBusy(true);
    setError("");

    try {
      await api.put("/customers/me", form);

      const response = await api.post("/orders/", {
        items: cart.map((item) => ({
          food_id: item.id,
          quantity: item.quantity,
        })),
      });

      clearCart();

      navigate(`/orders/${response.data.id}`, {
        replace: true,
        state: { placed: true },
      });
    } catch (err) {
      const detail = err.response?.data?.detail;

      setError(
        typeof detail === "string"
          ? detail
          : !err.response
            ? "Could not confirm the request. Check My Orders before trying again."
            : "Order failed. Check your details and available foods."
      );
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  if (loading) {
    return <main className="container py-5">Loading your details...</main>;
  }

  if (cart.length === 0) {
    return (
      <main className="container py-5 text-center">
        <h1 className="h3">Your cart is empty</h1>
        <Link to="/foods" className="btn btn-success mt-3">
          Browse Menu
        </Link>
      </main>
    );
  }

  return (
    <main className="container py-5">
      <p className="text-success small fw-bold">ONE STEP CLOSER TO YOUR MEAL</p>
      <h1 className="fw-bold mb-4">Checkout</h1>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <form onSubmit={placeOrder}>
        <div className="row g-4">
          <div className="col-lg-7">
            <div className="bg-white rounded-4 p-4 shadow-sm">
              <h2 className="h5 fw-bold mb-4">Customer details</h2>

              <div className="mb-3">
                <label htmlFor="checkoutName" className="form-label">Name</label>
                <input
                  id="checkoutName"
                  name="name"
                  className="form-control"
                  minLength={2}
                  maxLength={100}
                  required
                  value={form.name}
                  onChange={change}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="checkoutPhone" className="form-label">Phone</label>
                <input
                  id="checkoutPhone"
                  name="phone"
                  type="tel"
                  className="form-control"
                  maxLength={30}
                  required
                  value={form.phone}
                  onChange={change}
                />
              </div>

              <div>
                <label htmlFor="checkoutAddress" className="form-label">
                  Delivery address
                </label>
                <textarea
                  id="checkoutAddress"
                  name="address"
                  className="form-control"
                  rows={4}
                  maxLength={500}
                  required
                  value={form.address}
                  onChange={change}
                />
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="bg-white rounded-4 p-4 shadow-sm">
              <h2 className="h5 fw-bold mb-4">Your meal</h2>

              {cart.map((item) => (
                <div
                  className="d-flex justify-content-between gap-3 border-bottom pb-3 mb-3"
                  key={item.id}
                >
                  <span>{item.name} × {item.quantity}</span>
                  <strong>
                    Rs. {(Number(item.price) * item.quantity).toFixed(2)}
                  </strong>
                </div>
              ))}

              <div className="d-flex justify-content-between">
                <strong>Estimated total</strong>
                <strong>Rs. {total.toFixed(2)}</strong>
              </div>

              <p className="small text-secondary mt-3">
                Your order uses the latest available food prices.
              </p>

              <button
                className="btn btn-success w-100 py-3"
                disabled={busy || !profileReady}
              >
                {busy ? "Placing order..." : "Place Order"}
              </button>

              <Link to="/cart" className="d-block text-center text-success mt-3">
                Back to Cart
              </Link>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}