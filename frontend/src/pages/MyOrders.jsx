import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");

    api.get("/orders/my", { params: { page, limit: 10 } })
      .then(({ data }) => {
        if (active) setOrders(data);
      })
      .catch(() => {
        if (active) setError("Could not load your orders. Check your login and backend.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, refresh]);

  function badge(status) {
    if (status === "Cancelled") return "text-bg-danger";
    if (status === "Delivered") return "text-bg-success";
    if (status === "Pending") return "text-bg-warning";
    return "text-bg-primary";
  }

  return (
    <main className="container py-5">
      <div className="d-flex justify-content-between align-items-center gap-3 mb-4">
        <div>
          <p className="text-success small fw-bold">YOUR MEAL HISTORY</p>
          <h1 className="fw-bold mb-0">My Orders</h1>
        </div>

        <button
          className="btn btn-outline-success"
          disabled={loading}
          onClick={() => setRefresh((current) => current + 1)}
        >
          Refresh
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <p role="status">Loading orders...</p>
      ) : !error ? (
        <>
          {orders.length === 0 && (
            <div className="bg-white rounded-4 p-5 text-center">
              <h2 className="h4">No orders on this page</h2>
              <Link to="/foods" className="btn btn-success mt-3">
                Browse Menu
              </Link>
            </div>
          )}

          {orders.map((order) => (
            <article className="bg-white rounded-4 p-4 shadow-sm mb-3" key={order.id}>
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                <div>
                  <h2 className="h5 fw-bold">Order #{order.id}</h2>
                  <p className="small text-secondary mb-2">
                    {order.created_at.replace("T", " ")}
                  </p>
                  <span className={`badge ${badge(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="text-end">
                  <strong className="d-block mb-2">
                    Rs. {Number(order.total_amount).toFixed(2)}
                  </strong>
                  <Link to={`/orders/${order.id}`} className="btn btn-outline-success btn-sm">
                    View Summary
                  </Link>
                </div>
              </div>
            </article>
          ))}

          <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
            <button
              className="btn btn-outline-success"
              disabled={page === 1}
              onClick={() => setPage((current) => current - 1)}
            >
              Previous
            </button>
            <span>Page {page}</span>
            <button
              className="btn btn-outline-success"
              disabled={orders.length < 10}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </button>
          </div>
        </>
      ) : null}
    </main>
  );
}