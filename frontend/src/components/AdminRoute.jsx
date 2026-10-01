import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

function AdminCheck({ children }) {
  const { isAdmin } = useAuth();

  return isAdmin ? children : <Navigate to="/foods" replace />;
}

export default function AdminRoute({ children }) {
  return (
    <ProtectedRoute>
      <AdminCheck>{children}</AdminCheck>
    </ProtectedRoute>
  );
}