import { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    try {
      const token = localStorage.getItem("adminToken");
      const storedUser = localStorage.getItem("adminUser");
      if (token && storedUser) {
        return JSON.parse(storedUser);
      }
    } catch (e) {}
    return null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("adminToken");
      if (token) {
        try {
          const res = await API.get("/auth/profile");
          setAdmin(res.data);
          localStorage.setItem("adminUser", JSON.stringify(res.data));
        } catch (err) {
          console.error("Token verification failed", err);
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminUser");
          setAdmin(null);
        }
      } else {
        setAdmin(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await API.post("/auth/login", { email, password });
      const { token, admin: adminData } = res.data;
      
      localStorage.setItem("adminToken", token);
      localStorage.setItem("adminUser", JSON.stringify(adminData));
      setAdmin(adminData);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Login failed. Please check credentials.";
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await API.post("/auth/logout");
    } catch (err) {
      console.warn("Logout request failed on server, clearing locally anyway");
    } finally {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      setAdmin(null);
    }
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
