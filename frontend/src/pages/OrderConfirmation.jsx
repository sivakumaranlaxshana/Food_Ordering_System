import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import api from "../services/api.js";

export default function OrderConfirmation() {
  const { id } = useParams();
  const location = useLocation();

  const [order, setOrder] = useState(null);
  const [names, setNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOrder() {
      setLoading(true);
      setError("");

      try {
        const { data } = await api.get(`/orders/${id}`);

        if (!active) return;
        setOrder(data);

        const foodIds = [...new Set(data.items.map((item) => item.food_id))];
        const results = await Promise.allSettled(
          foodIds.map((foodId) => api.get(`/foods/${foodId}`))
        );

        if (!active) return;

        const foodNames = {};

        results.forEach((result, index) => {
          if (result.status === "fulfilled") {
            foodNames[foodIds[index]] = result.value.data.name;
          }
        });

        setNames(foodNames);
      } catch {
        if (active) setError("Could not load this order.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadOrder();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return <main className="container py-5">Loading order...</main>;
  }

  if (error || !order) {
    return (
      <main className="container py-5">
        <div className="alert alert-danger">{error || "Order not found."}</div>
        <Link to="/my-orders">My Orders</Link>
      </main>
    );
  }

  return (
    <main className="container py-5" style={{ maxWidth: 850 }}>
      <div className="bg-white rounded-4 p-4 p-md-5 shadow-sm">
        <div className="text-center mb-4">
          {location.state?.placed && (
            <div className="alert alert-success">
              Your order was placed successfully!
            </div>
          )}

          <div className="display-5 mb-3" aria-hidden="true">🍽️</div>
          <h1 className="fw-bold">Order #{order.id}</h1>
          <span className="badge text-bg-success">{order.status}</span>
          <p className="text-secondary small mt-3">
            {order.created_at.replace("T", " ")}
          </p>
        </div>

        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Food</th>
                <th>Qty</th>
                <th>Unit price</th>
                <th className="text-end">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td>{names[item.food_id] || `Food #${item.food_id}`}</td>
                  <td>{item.quantity}</td>
                  <td>Rs. {Number(item.unit_price).toFixed(2)}</td>
                  <td className="text-end">
                    Rs. {Number(item.subtotal).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="d-flex justify-content-between fs-5 fw-bold my-4">
          <span>Total</span>
          <span>Rs. {Number(order.total_amount).toFixed(2)}</span>
        </div>

        <div className="d-flex flex-wrap justify-content-center gap-3">
          <Link to="/my-orders" className="btn btn-success">
            My Orders
          </Link>
          <Link to="/foods" className="btn btn-outline-success">
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}