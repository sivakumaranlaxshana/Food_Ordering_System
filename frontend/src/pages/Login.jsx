import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      const user = await login(email.trim(), password);
      navigate(user.role === "Admin" ? "/admin" : "/foods", {
        replace: true,
      });
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : "Login failed. Check your details and backend connection."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container py-5">
      <div className="row g-0 bg-white rounded-4 overflow-hidden shadow-sm">
        <div className="col-md-6 d-none d-md-block">
          <img
            src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1000&auto=format&fit=crop"
            alt="Fresh burger ready to enjoy"
            className="w-100 h-100"
            style={{ minHeight: 520, objectFit: "cover" }}
          />
        </div>

        <div className="col-md-6 p-4 p-lg-5">
          <p className="text-success small fw-bold">WELCOME TO LITTLE TABLE</p>
          <h1 className="fw-bold mb-2">Welcome back</h1>
          <p className="text-secondary mb-4">
            Sign in to order your favourites.
          </p>

          {error && <div className="alert alert-danger" role="alert">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="loginEmail" className="form-label">Email</label>
              <input
                id="loginEmail"
                type="email"
                className="form-control"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="loginPassword" className="form-label">Password</label>
              <input
                id="loginPassword"
                type="password"
                className="form-control"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            <button className="btn btn-success w-100 py-3" disabled={busy}>
              {busy ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="text-center mt-4 mb-0">
            New here? <Link to="/register" className="text-success">Create an account</Link>
          </p>
        </div>
      </div>
    </main>
  );
}