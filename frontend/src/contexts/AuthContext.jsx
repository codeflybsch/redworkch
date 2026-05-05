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
      const r = await api.get("/admin/me");
      setUser(r.data);
    } catch {
      tokenStorage.remove();
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
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(() => {
    tokenStorage.remove();
    setUser(null);
    window.location.href = "/admin/login";
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
