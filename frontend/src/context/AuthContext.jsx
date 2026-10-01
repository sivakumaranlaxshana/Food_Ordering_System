import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const token = sessionStorage.getItem("access_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");

        if (!cancelled) {
          setUser(response.data);
          setAuthError("");
        }
      } catch (error) {
        if (cancelled) return;

        const status = error.response?.status;

        if (status === 401 || status === 403) {
          sessionStorage.removeItem("access_token");
          setUser(null);
        } else {
          setAuthError(
            "Could not restore your session. Check the backend and refresh."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  async function login(email, password) {
    const form = new URLSearchParams();

    form.append("username", email);
    form.append("password", password);

    const response = await api.post("/auth/login", form, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    sessionStorage.setItem(
      "access_token",
      response.data.access_token
    );

    try {
      const profile = await api.get("/auth/me");

      setUser(profile.data);
      setAuthError("");

      return profile.data;
    } catch (error) {
      sessionStorage.removeItem("access_token");
      setUser(null);
      throw error;
    }
  }

  async function register(data) {
    const response = await api.post("/auth/register", data);
    return response.data;
  }

  function logout() {
    sessionStorage.removeItem("access_token");
    setUser(null);
    setAuthError("");
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        login,
        register,
        logout,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === "Admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}