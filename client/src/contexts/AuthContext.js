import { createContext, useContext, useState, useEffect } from "react";

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
      const response = await fetch("http://localhost:5002/api/auth/user", {
        headers: {
          "x-auth-token": token,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setUser(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching user:", {
        message: err.message,
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
      const response = await fetch("http://localhost:5002/api/auth/login", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Login failed');
      }
      
      const data = await response.json();
      localStorage.setItem("token", data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      const errorDetails = {
        message: err.message,
      };
      setError({
        message: "Login failed. Please check your credentials and try again.",
        details: errorDetails,
      });
      throw err;
    }
  };

  // Register function
  const register = async (name, email, password) => {
    try {
      setError({ message: "", details: null });
      const response = await fetch("http://localhost:5002/api/auth/register", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Registration failed');
      }
      
      const data = await response.json();
      localStorage.setItem("token", data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      const errorDetails = {
        message: err.message,
      };
      setError({
        message: "Registration failed. Please try again.",
        details: errorDetails,
      });
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