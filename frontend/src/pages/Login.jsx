import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, CheckCircle, AlertCircle, Loader } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { customerLogin } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validation
      if (!form.email.trim()) {
        setError("E-Mail ist erforderlich");
        setLoading(false);
        return;
      }
      if (!form.password.trim()) {
        setError("Passwort ist erforderlich");
        setLoading(false);
        return;
      }

      await customerLogin(form.email, form.password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const message = err.response?.data?.detail || err.message || "Anmeldung fehlgeschlagen";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-[40px] bg-white p-10 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-[#E63946] font-semibold">Anmelden</p>
          <h1 className="mt-3 text-3xl font-extrabold text-[#0f172a]">Willkommen zurück</h1>
          <p className="mt-4 text-slate-500">Melden Sie sich an, um auf Ihr Dashboard zuzugreifen.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Email */}
          <label className="block text-sm font-semibold text-[#0f172a]">
            E-Mail
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="email@domain.com"
              required
              disabled={loading}
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-[#0f172a] focus:border-[#E63946] focus:bg-white outline-none disabled:opacity-50 transition"
            />
          </label>

          {/* Password */}
          <label className="block text-sm font-semibold text-[#0f172a]">
            Passwort
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Ihr Passwort"
              required
              disabled={loading}
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-[#0f172a] focus:border-[#E63946] focus:bg-white outline-none disabled:opacity-50 transition"
            />
          </label>

          {/* Error Alert */}
          {error && (
            <div className="rounded-3xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-3">
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#E63946] px-6 py-3 text-sm font-semibold text-white hover:bg-[#c5303d] disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Wird angemeldet...
              </>
            ) : (
              <>
                Anmelden
                <ArrowRight size={18} />
              </>
            )}
          </button>

          {/* Links */}
          <div className="flex items-center justify-between pt-2">
            <Link
              to="/password-reset"
              className="text-sm text-[#E63946] hover:text-[#c5303d] transition"
            >
              Passwort vergessen?
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold text-[#0f172a] hover:text-[#E63946] transition"
            >
              Registrieren
            </Link>
          </div>
        </form>

        {/* Security Info Box */}
        <div className="mt-10 rounded-3xl bg-slate-100 p-6 text-sm text-slate-600">
          <div className="flex items-start gap-3">
            <CheckCircle size={18} className="text-[#22c55e] mt-1 flex-shrink-0" />
            <div>
              <p className="font-semibold text-[#0f172a]">Sicherer Zugang</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Verschlüsselte Verbindung (SSL/TLS)</li>
                <li>Sichere Token-basierte Authentifizierung</li>
                <li>Automatische Abmeldung nach Inaktivität</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}