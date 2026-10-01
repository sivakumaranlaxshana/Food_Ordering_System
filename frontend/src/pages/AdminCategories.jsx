import { useEffect, useState } from "react";
import AdminNav from "../components/AdminNav.jsx";
import api, { getApiError } from "../services/api.js";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);

    api.get("/categories/")
      .then(({ data }) => {
        if (active) setCategories(data);
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
  }, [revision]);

  function reset() {
    setEditingId(null);
    setForm({ name: "", description: "" });
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
      };

      if (editingId !== null) {
        await api.put(`/categories/${editingId}`, data);
      } else {
        await api.post("/categories/", data);
      }

      setMessage("Category saved successfully.");
      reset();
      setRevision((value) => value + 1);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setBusy(false);
    }
  }

  async function remove(category) {
    if (busy || !window.confirm(`Delete "${category.name}"?`)) return;

    setBusy(true);
    setError("");
    setMessage("");

    try {
      await api.delete(`/categories/${category.id}`);
      if (editingId === category.id) reset();
      setMessage("Category deleted.");
      setRevision((value) => value + 1);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container py-5">
      <h1 className="fw-bold mb-4">Category Management</h1>
      <AdminNav />

      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success" role="status">{message}</div>}

      <div className="row g-4">
        <div className="col-lg-4">
          <form onSubmit={save} className="bg-white rounded-4 p-4 shadow-sm">
            <h2 className="h5 fw-bold mb-3">
              {editingId !== null ? "Edit Category" : "Add Category"}
            </h2>

            <label htmlFor="categoryName" className="form-label">Name</label>
            <input
              id="categoryName"
              className="form-control mb-3"
              minLength={2}
              maxLength={100}
              required
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
            />

            <label htmlFor="categoryDescription" className="form-label">
              Description
            </label>
            <textarea
              id="categoryDescription"
              className="form-control mb-3"
              rows={3}
              maxLength={500}
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
            />

            <button className="btn btn-success w-100" disabled={busy}>
              {busy ? "Saving..." : "Save Category"}
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
          <div className="bg-white rounded-4 p-4 shadow-sm">
            {loading ? <p>Loading categories...</p> : (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr><th>ID</th><th>Name</th><th>Description</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr key={category.id}>
                        <td>{category.id}</td>
                        <td>{category.name}</td>
                        <td>{category.description || "—"}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-outline-success btn-sm"
                              disabled={busy}
                              onClick={() => {
                                setEditingId(category.id);
                                setForm({
                                  name: category.name,
                                  description: category.description || "",
                                });
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-outline-danger btn-sm"
                              disabled={busy}
                              onClick={() => remove(category)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {categories.length === 0 && <p>No categories yet.</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}