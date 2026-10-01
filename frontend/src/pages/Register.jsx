import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function change(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      await register(form);
      navigate("/login", { replace: true });
    } catch (err) {
      const detail = err.response?.data?.detail;

      setError(
        typeof detail === "string"
          ? detail
          : Array.isArray(detail)
            ? detail.map((item) => item.msg).join(". ")
            : "Registration failed. Check your backend connection."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container py-5">
      <div className="row g-0 bg-white rounded-4 overflow-hidden shadow-sm">
        <div className="col-lg-5 d-none d-lg-block">
          <img
            src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1000&auto=format&fit=crop"
            alt="Delicious pizza"
            className="w-100 h-100"
            style={{ minHeight: 650, objectFit: "cover" }}
          />
        </div>

        <div className="col-lg-7 p-4 p-lg-5">
          <p className="text-success small fw-bold">YOUR NEXT GREAT MEAL STARTS HERE</p>
          <h1 className="fw-bold">Create an account</h1>
          <p className="text-secondary">Register to order and track your meals.</p>

          {error && <div className="alert alert-danger" role="alert">{error}</div>}

          <form onSubmit={submit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="registerName" className="form-label">Name</label>
                <input
                  id="registerName"
                  name="name"
                  className="form-control"
                  autoComplete="name"
                  minLength={2}
                  maxLength={100}
                  required
                  value={form.name}
                  onChange={change}
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="registerEmail" className="form-label">Email</label>
                <input
                  id="registerEmail"
                  name="email"
                  type="email"
                  className="form-control"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={change}
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="registerPhone" className="form-label">Phone</label>
                <input
                  id="registerPhone"
                  name="phone"
                  type="tel"
                  className="form-control"
                  autoComplete="tel"
                  maxLength={30}
                  required
                  value={form.phone}
                  onChange={change}
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="registerPassword" className="form-label">Password</label>
                <input
                  id="registerPassword"
                  name="password"
                  type="password"
                  className="form-control"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  required
                  value={form.password}
                  onChange={change}
                />
              </div>

              <div className="col-12">
                <label htmlFor="registerAddress" className="form-label">Delivery address</label>
                <textarea
                  id="registerAddress"
                  name="address"
                  className="form-control"
                  autoComplete="street-address"
                  rows={3}
                  maxLength={500}
                  required
                  value={form.address}
                  onChange={change}
                />
              </div>
            </div>

            <button className="btn btn-success w-100 py-3 mt-4" disabled={busy}>
              {busy ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="mt-4 mb-0 text-center">
            Already registered? <Link to="/login" className="text-success">Login</Link>
          </p>
        </div>
      </div>
    </main>
  );
}