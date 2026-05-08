import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, CheckCircle, LogIn } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { customerLogin } = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await customerLogin(form.email, form.password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || "Anmeldung fehlgeschlagen.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-[40px] bg-white p-10 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-[#E63946] font-semibold">Anmelden</p>
          <h1 className="mt-3 text-3xl font-extrabold text-[#0f172a]">Willkommen zurück</h1>
          <p className="mt-4 text-slate-500">Melden Sie sich an, um auf Ihr Dashboard zuzugreifen.</p>
        </div>

        <form onSubmit={submit} className="space-y-6">
          <label className="block text-sm font-semibold text-[#0f172a]">
            E-Mail
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              type="email"
              placeholder="email@domain.com"
              required
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-[#0f172a] focus:border-[#E63946] outline-none"
            />
          </label>
          <label className="block text-sm font-semibold text-[#0f172a]">
            Passwort
            <input
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              type="password"
              placeholder="Ihr Passwort"
              required
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-[#0f172a] focus:border-[#E63946] outline-none"
            />
          </label>

          {error && <div className="rounded-3xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

          <div className="flex flex-col gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#E63946] px-6 py-3 text-sm font-semibold text-white hover:bg-[#c5303d] disabled:opacity-50 transition"
            >
              {submitting ? "Anmelden..." : "Anmelden"}
              <ArrowRight size={18} />
            </button>
            <div className="flex items-center justify-between">
              <Link to="/password-reset" className="text-sm text-[#E63946] hover:underline">Passwort vergessen?</Link>
              <Link to="/register" className="text-sm font-semibold text-[#0f172a] hover:text-[#E63946]">Registrieren</Link>
            </div>
          </div>
        </form>

        <div className="mt-10 rounded-3xl bg-slate-100 p-6 text-sm text-slate-600">
          <div className="flex items-start gap-3">
            <CheckCircle size={18} className="text-[#22c55e] mt-1" />
            <div>
              <p className="font-semibold text-[#0f172a]">Sicherer Zugang</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Verschlüsselte Verbindung</li>
                <li>Automatische Abmeldung nach Inaktivität</li>
                <li>Zugang zu Ihren Hosting-Diensten</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}