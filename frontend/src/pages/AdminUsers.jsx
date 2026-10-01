import { useEffect, useState } from "react";

import AdminNav from "../components/AdminNav.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api, { getApiError } from "../services/api.js";

export default function AdminUsers() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);

    api.get("/users/", { params: { page, limit: 10 } })
      .then(({ data }) => {
        if (active) setUsers(data);
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

  async function toggleStatus(user) {
    if (busyId !== null) return;

    setBusyId(user.id);
    setError("");
    setMessage("");

    try {
      await api.patch(`/users/${user.id}/status`, {
        is_active: !user.is_active,
      });

      setMessage("User status updated.");
      setRevision((value) => value + 1);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="container py-5">
      <h1 className="fw-bold mb-4">User Management</h1>
      <AdminNav />

      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success" role="status">{message}</div>}

      <div className="bg-white rounded-4 p-4 shadow-sm">
        {loading ? <p>Loading users...</p> : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      <span className={`badge ${
                        user.is_active ? "text-bg-success" : "text-bg-secondary"
                      }`}>
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      {user.id === currentUser.id ? (
                        <span className="small text-secondary">Your account</span>
                      ) : (
                        <button
                          className={`btn btn-sm ${
                            user.is_active ? "btn-outline-danger" : "btn-outline-success"
                          }`}
                          disabled={busyId !== null}
                          onClick={() => toggleStatus(user)}
                        >
                          {busyId === user.id
                            ? "Saving..."
                            : user.is_active ? "Deactivate" : "Activate"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && <p>No users on this page.</p>}
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
          disabled={users.length < 10 || loading || busyId !== null}
          onClick={() => setPage((value) => value + 1)}
        >
          Next
        </button>
      </div>
    </main>
  );
}