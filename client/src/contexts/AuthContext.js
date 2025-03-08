import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState({ message: "", details: null });

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch user data with token
  const fetchUser = async (token) => {
    try {
      const config = {
        headers: {
          "x-auth-token": token,
        },
      };
      const res = await axios.get("http://localhost:5002/api/auth/user", config);
      setUser(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching user:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        stack: err.stack,
      });
      localStorage.removeItem("token");
      setUser(null);
      setLoading(false);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      setError({ message: "", details: null });
      const res = await axios.post("http://localhost:5002/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      const errorDetails = {
        message: err.response?.data?.msg || "Login failed",
        status: err.response?.status,
        data: err.response?.data,
        stack: err.stack,
      };
      console.error("Login error:", errorDetails);
      setError(errorDetails);
      throw err;
    }
  };

  // Register function
  const register = async (name, email, password) => {
    try {
      setError({ message: "", details: null });
      const res = await axios.post("http://localhost:5002/api/auth/register", { name, email, password });
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      const errorDetails = {
        message: err.response?.data?.msg || "Registration failed",
        status: err.response?.status,
        data: err.response?.data,
        stack: err.stack,
      };
      console.error("Registration error:", errorDetails);
      setError(errorDetails);
      throw err;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}