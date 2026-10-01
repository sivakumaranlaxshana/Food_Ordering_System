import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { user, loading, authError } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container text-center py-5" role="status">
        Checking your session...
      </div>
    );
  }

  if (authError) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">{authError}</div>
        <button
          className="btn btn-success"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
}