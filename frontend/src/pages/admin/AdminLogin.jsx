import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Lock, User, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import Logo from "../../components/Logo";

export default function AdminLogin() {
  const { user, login, loading } = useAuth();
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setSubmitting(true);
    try {
      await login(username, password);
      nav("/admin", { replace: true });
    } catch (e) {
      setErr(e.response?.data?.detail || "Anmeldung fehlgeschlagen");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(230,57,70,0.15),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(30,136,229,0.15),transparent_50%)]" />

      <form
        onSubmit={submit}
        className="relative w-full max-w-md bg-[#111] border border-white/10 rounded-3xl p-8 shadow-2xl"
      >
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>
        <h1 className="text-white text-2xl font-extrabold text-center">Admin-Bereich</h1>
        <p className="text-white/60 text-sm text-center mt-1">Bitte melden Sie sich an</p>

        <div className="mt-7 space-y-4">
          <div>
            <label className="text-xs font-semibold text-white/60 uppercase">Benutzername</label>
            <div className="mt-1 relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full pl-10 pr-3 py-3 bg-black border-2 border-white/10 focus:border-[#E63946] outline-none rounded-xl text-white transition"
                autoComplete="username"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-white/60 uppercase">Passwort</label>
            <div className="mt-1 relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-3 bg-black border-2 border-white/10 focus:border-[#E63946] outline-none rounded-xl text-white transition"
                autoComplete="current-password"
              />
            </div>
          </div>
        </div>

        {err && (
          <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-red-950/40 border border-red-700/50 text-red-300 text-sm">
            <AlertCircle size={16} /> {err}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full flex items-center justify-center gap-2 bg-[#E63946] hover:bg-[#d22c39] disabled:opacity-50 text-white py-3 rounded-xl font-bold transition"
        >
          {submitting && <Loader2 size={18} className="animate-spin" />}
          Anmelden
        </button>

        <a href="/" className="block text-center mt-5 text-white/50 text-sm hover:text-white transition">
          ← Zur Website
        </a>
      </form>
    </div>
  );
}
