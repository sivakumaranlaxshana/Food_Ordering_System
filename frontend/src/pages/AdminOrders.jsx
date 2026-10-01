import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import AdminNav from "../components/AdminNav.jsx";
import api, { getApiError } from "../services/api.js";

const transitions = {
  Pending: ["Confirmed", "Cancelled"],
  Confirmed: ["Preparing", "Cancelled"],
  Preparing: ["Out for Delivery", "Cancelled"],
  "Out for Delivery": ["Delivered"],
  Delivered: [],
  Cancelled: [],
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState({});
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);

    api.get("/orders/admin", { params: { page, limit: 10 } })
      .then(({ data }) => {
        if (!active) return;

        setOrders(data);
        setSelected(Object.fromEntries(
          data.map((order) => [order.id, order.status])
        ));
      })
      .catch((err) => {
        if (active) setError(getApiError(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, revision]);

  async function saveStatus(order) {
    if (busyId !== null) return;

    setBusyId(order.id);
    setError("");
    setMessage("");

    try {
      await api.patch(`/orders/${order.id}/status`, {
        status: selected[order.id],
      });

      setMessage(`Order #${order.id} updated.`);
      setRevision((value) => value + 1);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="container py-5">
      <h1 className="fw-bold mb-4">Order Management</h1>
      <AdminNav />

      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success" role="status">{message}</div>}

      <button
        className="btn btn-outline-success mb-3"
        disabled={loading || busyId !== null}
        onClick={() => {
          setError("");
          setRevision((value) => value + 1);
        }}
      >
        Refresh Orders
      </button>

      <div className="bg-white rounded-4 p-4 shadow-sm">
        {loading ? <p>Loading orders...</p> : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Update</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>#{order.customer_id}</td>
                    <td>Rs. {Number(order.total_amount).toFixed(2)}</td>
                    <td><span className="badge text-bg-secondary">{order.status}</span></td>
                    <td>
                      <div className="d-flex gap-2">
                        <select
                          className="form-select form-select-sm"
                          style={{ minWidth: 155 }}
                          aria-label={`Status for order ${order.id}`}
                          value={selected[order.id] || order.status}
                          disabled={busyId !== null}
                          onChange={(event) => setSelected((current) => ({
                            ...current,
                            [order.id]: event.target.value,
                          }))}
                        >
                          <option value={order.status}>{order.status}</option>
                          {(transitions[order.status] || []).map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>

                        <button
                          className="btn btn-success btn-sm"
                          disabled={
                            busyId !== null ||
                            selected[order.id] === order.status
                          }
                          onClick={() => saveStatus(order)}
                        >
                          {busyId === order.id ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </td>
                    <td>
                      <Link to={`/orders/${order.id}`} className="btn btn-outline-success btn-sm">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && <p>No orders on this page.</p>}
          </div>
        )}
      </div>

      <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
        <button
          className="btn btn-outline-success"
          disabled={page === 1 || loading || busyId !== null}
          onClick={() => setPage((value) => value - 1)}
        >
          Previous
        </button>
        <span>Page {page}</span>
        <button
          className="btn btn-outline-success"
          disabled={orders.length < 10 || loading || busyId !== null}
          onClick={() => setPage((value) => value + 1)}
        >
          Next
        </button>
      </div>
    </main>
  );
}