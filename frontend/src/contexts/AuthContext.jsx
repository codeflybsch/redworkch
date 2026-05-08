import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import api, { tokenStorage } from "../api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    const token = tokenStorage.get();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      // Try customer first
      const r = await api.get("/auth/me");
      setUser({ ...r.data, role: "customer" });
    } catch {
      try {
        // Try admin
        const r = await api.get("/admin/me");
        setUser({ ...r.data, role: "admin" });
      } catch {
        tokenStorage.remove();
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = useCallback(async (username, password) => {
    const res = await api.post("/admin/login", { username, password });
    tokenStorage.set(res.data.access_token);
    setUser({ ...res.data.user, role: "admin" });
    return { ...res.data.user, role: "admin" };
  }, []);

  const customerLogin = useCallback(async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    tokenStorage.set(res.data.access_token);
    setUser({ ...res.data.user, role: "customer" });
    return { ...res.data.user, role: "customer" };
  }, []);

  const customerRegister = useCallback(async (data) => {
    const res = await api.post("/auth/register", data);
    tokenStorage.set(res.data.access_token);
    setUser({ ...res.data.user, role: "customer" });
    return { ...res.data.user, role: "customer" };
  }, []);

  const logout = useCallback(() => {
    tokenStorage.remove();
    setUser(null);
    window.location.href = "/";
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, customerLogin, customerRegister, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
