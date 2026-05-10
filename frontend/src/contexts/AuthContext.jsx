import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import api, { tokenStorage } from "../api";

const AuthContext = createContext();

/**
 * AuthProvider - Global authentication state management
 * Handles both customer and admin authentication
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch current user profile from backend
   */
  const fetchMe = useCallback(async () => {
    const token = tokenStorage.get();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      // Try customer endpoint first
      const response = await api.get("/auth/me");
      setUser({ ...response.data, role: "customer" });
      setError(null);
    } catch (err) {
      try {
        // Try admin endpoint
        const response = await api.get("/admin/me");
        setUser({ ...response.data, role: "admin" });
        setError(null);
      } catch {
        // Token invalid, clear it
        tokenStorage.remove();
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  /**
   * Admin login
   */
  const adminLogin = useCallback(async (username, password) => {
    try {
      const response = await api.post("/admin/login", { username, password });
      tokenStorage.set(response.data.access_token);
      setUser({ ...response.data.user, role: "admin" });
      setError(null);
      return response.data.user;
    } catch (err) {
      const message = err.response?.data?.detail || "Login failed";
      setError(message);
      throw err;
    }
  }, []);

  /**
   * Customer registration
   */
  const customerRegister = useCallback(async (data) => {
    try {
      const response = await api.post("/auth/register", data);
      tokenStorage.set(response.data.access_token);
      setUser({ ...response.data.user, role: "customer" });
      setError(null);
      return response.data.user;
    } catch (err) {
      const message = err.response?.data?.detail || "Registration failed";
      setError(message);
      throw err;
    }
  }, []);

  /**
   * Customer login
   */
  const customerLogin = useCallback(async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      tokenStorage.set(response.data.access_token);
      setUser({ ...response.data.user, role: "customer" });
      setError(null);
      return response.data.user;
    } catch (err) {
      const message = err.response?.data?.detail || "Login failed";
      setError(message);
      throw err;
    }
  }, []);

  /**
   * Customer logout
   */
  const logout = useCallback(() => {
    tokenStorage.remove();
    setUser(null);
    setError(null);
    window.location.href = "/";
  }, []);

  /**
   * Update customer profile
   */
  const updateProfile = useCallback(async (data) => {
    try {
      const response = await api.put("/auth/profile", data);
      setUser({ ...response.data, role: user?.role });
      setError(null);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.detail || "Profile update failed";
      setError(message);
      throw err;
    }
  }, [user?.role]);

  /**
   * Request password reset
   */
  const requestPasswordReset = useCallback(async (email) => {
    try {
      const response = await api.post("/auth/password-reset-request", { email });
      setError(null);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.detail || "Password reset request failed";
      setError(message);
      throw err;
    }
  }, []);

  /**
   * Reset password with token
   */
  const resetPassword = useCallback(async (token, newPassword) => {
    try {
      const response = await api.post("/auth/password-reset", { token, newPassword });
      setError(null);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.detail || "Password reset failed";
      setError(message);
      throw err;
    }
  }, []);

  const value = {
    // State
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isCustomer: user?.role === "customer",
    isAdmin: user?.role === "admin",
    
    // Methods
    adminLogin,
    customerRegister,
    customerLogin,
    logout,
    updateProfile,
    requestPasswordReset,
    resetPassword,
    fetchMe
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
