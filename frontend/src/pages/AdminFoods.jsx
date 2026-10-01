import { useEffect, useState } from "react";
import AdminNav from "../components/AdminNav.jsx";
import api, { getApiError } from "../services/api.js";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  image: "",
  category_id: "",
  is_available: true,
};

const imageChoices = [
  ["Pizza", "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop"],
  ["Burger", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop"],
  ["Rice", "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&auto=format&fit=crop"],
  ["Dessert", "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop"],
];

export default function AdminFoods() {
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState(null);
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [failedImage, setFailedImage] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.all([
      api.get("/foods/", { params: { page, limit: 8, sort: "id", order: "desc" } }),
      api.get("/categories/"),
    ])
      .then(([foodResponse, categoryResponse]) => {
        if (!active) return;
        setFoods(foodResponse.data.items);
        setTotalPages(foodResponse.data.total_pages);
        setCategories(categoryResponse.data);
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

  function change(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function reset() {
    setForm({ ...emptyForm });
    setEditingId(null);
  }

  async function save(event) {
    event.preventDefault();
    if (busy) return;

    setBusy(true);
    setError("");
    setMessage("");

    try {
      const data = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: String(form.price),
        image: form.image.trim() || null,
        category_id: Number(form.category_id),
        is_available: form.is_available,
      };

      if (editingId !== null) {
        await api.put(`/foods/${editingId}`, data);
      } else {
        await api.post("/foods/", data);
      }

      setMessage("Food saved successfully.");
      reset();
      setPage(1);
      setRevision((value) => value + 1);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setBusy(false);
    }
  }

  async function remove(food) {
    if (busy || !window.confirm(`Delete "${food.name}"?`)) return;

    setBusy(true);
    setError("");
    setMessage("");

    try {
      await api.delete(`/foods/${food.id}`);
      if (editingId === food.id) reset();
      setMessage("Food deleted.");
      setPage(1);
      setRevision((value) => value + 1);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container py-5">
      <h1 className="fw-bold mb-4">Food Management</h1>
      <AdminNav />

      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success" role="status">{message}</div>}

      <div className="row g-4">
        <div className="col-lg-4">
          <form className="bg-white rounded-4 p-4 shadow-sm" onSubmit={save}>
            <h2 className="h5 fw-bold mb-3">
              {editingId !== null ? "Edit Food" : "Add Food"}
            </h2>

            <label htmlFor="adminFoodName" className="form-label">Food name</label>
            <input
              id="adminFoodName"
              name="name"
              className="form-control mb-3"
              minLength={2}
              maxLength={150}
              required
              value={form.name}
              onChange={change}
            />

            <label htmlFor="adminFoodCategory" className="form-label">Category</label>
            <select
              id="adminFoodCategory"
              name="category_id"
              className="form-select mb-3"
              required
              value={form.category_id}
              onChange={change}
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option value={category.id} key={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {!loading && categories.length === 0 && (
              <p className="small text-danger">Create a category first.</p>
            )}

            <label htmlFor="adminFoodPrice" className="form-label">Price — Rs.</label>
            <input
              id="adminFoodPrice"
              name="price"
              type="number"
              className="form-control mb-3"
              min="0.01"
              max="99999999.99"
              step="0.01"
              required
              value={form.price}
              onChange={change}
            />

            <label htmlFor="adminFoodDescription" className="form-label">Description</label>
            <textarea
              id="adminFoodDescription"
              name="description"
              className="form-control mb-3"
              rows={3}
              maxLength={1000}
              value={form.description}
              onChange={change}
            />

            <label htmlFor="adminFoodImage" className="form-label">Image URL</label>
            <input
              id="adminFoodImage"
              name="image"
              type="url"
              className="form-control mb-2"
              maxLength={500}
              placeholder="https://..."
              value={form.image}
              onChange={change}
            />

            <div className="d-flex flex-wrap gap-2 mb-3">
              {imageChoices.map(([label, url]) => (
                <button
                  key={label}
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setForm((current) => ({ ...current, image: url }))}
                >
                  {label} image
                </button>
              ))}
            </div>

            {form.image && (
              failedImage === form.image ? (
                <p className="small text-danger">
                  Image could not load. Try a different URL.
                </p>
              ) : (
                <img
                  src={form.image}
                  alt="Food preview"
                  className="w-100 rounded-3 mb-3"
                  onError={() => setFailedImage(form.image)}
                  style={{ height: 170, objectFit: "cover" }}
                />
              )
            )}

            <div className="form-check mb-3">
              <input
                id="adminFoodAvailable"
                name="is_available"
                type="checkbox"
                className="form-check-input"
                checked={form.is_available}
                onChange={change}
              />
              <label className="form-check-label" htmlFor="adminFoodAvailable">
                Available for ordering
              </label>
            </div>

            <button
              className="btn btn-success w-100"
              disabled={busy || loading || categories.length === 0}
            >
              {busy ? "Saving..." : "Save Food"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                className="btn btn-outline-secondary w-100 mt-2"
                disabled={busy}
                onClick={reset}
              >
                Cancel Edit
              </button>
            )}
          </form>
        </div>

        <div className="col-lg-8">
          {loading ? <p>Loading foods...</p> : (
            <>
              <div className="row g-3">
                {foods.map((food) => (
                  <div className="col-md-6" key={food.id}>
                    <article className="card h-100 border-0 shadow-sm overflow-hidden">
                      {food.image ? (
                        <img
                          src={food.image}
                          alt={food.name}
                          className="card-img-top"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                          style={{ height: 170, objectFit: "cover" }}
                        />
                      ) : (
                        <div className="text-center p-4 fs-1">🍽️</div>
                      )}

                      <div className="card-body">
                        <h2 className="h5">{food.name}</h2>
                        <p className="mb-2">Rs. {Number(food.price).toFixed(2)}</p>

                        <span className={`badge ${
                          food.is_available ? "text-bg-success" : "text-bg-secondary"
                        }`}>
                          {food.is_available ? "Available" : "Unavailable"}
                        </span>

                        <div className="d-flex gap-2 mt-3">
                          <button
                            className="btn btn-outline-success btn-sm"
                            disabled={busy}
                            onClick={() => {
                              setEditingId(food.id);
                              setForm({
                                name: food.name,
                                description: food.description || "",
                                price: String(food.price),
                                image: food.image || "",
                                category_id: String(food.category_id),
                                is_available: food.is_available,
                              });
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                          >
                            Edit
                          </button>

                          <button
                            className="btn btn-outline-danger btn-sm"
                            disabled={busy}
                            onClick={() => remove(food)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  </div>
                ))}
              </div>

              {foods.length === 0 && (
                <div className="bg-white rounded-4 p-4">
                  No foods yet. Add your first food using the form.
                </div>
              )}

              <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
                <button
                  className="btn btn-outline-success"
                  disabled={page <= 1 || busy}
                  onClick={() => setPage((value) => value - 1)}
                >
                  Previous
                </button>
                <span>Page {page}</span>
                <button
                  className="btn btn-outline-success"
                  disabled={page >= totalPages || busy}
                  onClick={() => setPage((value) => value + 1)}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}