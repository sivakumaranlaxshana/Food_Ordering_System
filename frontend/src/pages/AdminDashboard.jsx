import { useEffect, useState } from "react";
import AdminNav from "../components/AdminNav.jsx";
import api, { getApiError } from "../services/api.js";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [popular, setPopular] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    Promise.all([
      api.get("/dashboard/"),
      api.get("/dashboard/popular-foods"),
    ])
      .then(([dashboard, foods]) => {
        if (!active) return;
        setStats(dashboard.data);
        setPopular(foods.data);
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
  }, [refresh]);

  const cards = stats
    ? [
        ["Total Foods", stats.total_foods, "🍽️"],
        ["Categories", stats.total_categories, "📂"],
        ["Customers", stats.total_customers, "👥"],
        ["Total Orders", stats.total_orders, "🛍️"],
        ["Pending Orders", stats.pending_orders, "⏳"],
        ["Delivered Orders", stats.delivered_orders, "✓"],
      ]
    : [];

  return (
    <main className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4 gap-3">
        <div>
          <p className="small text-success fw-bold">RESTAURANT OVERVIEW</p>
          <h1 className="fw-bold">Admin Dashboard</h1>
        </div>
        <button
          className="btn btn-outline-success"
          disabled={loading}
          onClick={() => setRefresh((value) => value + 1)}
        >
          Refresh
        </button>
      </div>

      <AdminNav />

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <p>Loading dashboard...</p>
      ) : !error && stats ? (
        <>
          <div className="row g-3">
            {cards.map(([label, value, icon]) => (
              <div className="col-sm-6 col-lg-4" key={label}>
                <div className="bg-white rounded-4 p-4 shadow-sm h-100">
                  <span className="fs-3" aria-hidden="true">{icon}</span>
                  <p className="text-secondary mt-3 mb-1">{label}</p>
                  <h2 className="fw-bold mb-0">{value}</h2>
                </div>
              </div>
            ))}
          </div>

          <div
            className="rounded-4 p-4 text-white my-4"
            style={{ background: "#174b3b" }}
          >
            <p className="mb-2">Delivered Order Revenue</p>
            <h2 className="fw-bold mb-0">
              Rs. {Number(stats.total_revenue).toLocaleString("en-LK", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h2>
          </div>

          <section className="bg-white rounded-4 p-4 shadow-sm">
            <h2 className="h5 fw-bold mb-3">Popular Foods</h2>
            <p className="small text-secondary">
              Quantity sold through delivered orders.
            </p>

            {popular.length === 0 ? (
              <p className="mb-0">No delivered food sales yet.</p>
            ) : (
              popular.map((food, index) => (
                <div
                  key={food.food_id}
                  className="d-flex justify-content-between gap-3 border-bottom py-3"
                >
                  <span>{index + 1}. {food.food_name}</span>
                  <strong>{food.ordered_quantity} sold</strong>
                </div>
              ))
            )}
          </section>
        </>
      ) : null}
    </main>
  );
}