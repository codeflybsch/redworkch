import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, CheckCircle, AlertCircle, Loader } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { customerRegister } = useAuth();
  
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    passwordConfirm: "",
    company: "",
    phone: ""
  });
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!form.firstName.trim()) return "Vorname ist erforderlich";
    if (!form.lastName.trim()) return "Nachname ist erforderlich";
    if (!form.email.trim()) return "E-Mail ist erforderlich";
    if (!form.email.includes("@")) return "Ungültige E-Mail-Adresse";
    if (form.password.length < 8) return "Passwort muss mindestens 8 Zeichen lang sein";
    if (form.password !== form.passwordConfirm) return "Passwörter stimmen nicht überein";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    // Validation
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setLoading(true);
    try {
      await customerRegister({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        company: form.company,
        phone: form.phone
      });
      
      setSuccess("Konto erfolgreich erstellt! Weiterleitung...");
      window.setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 1500);
    } catch (err) {
      const message = err.response?.data?.detail || err.message || "Registrierung fehlgeschlagen";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl rounded-[40px] bg-white p-10 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
        
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-[#E63946] font-semibold">Konto erstellen</p>
          <h1 className="mt-3 text-4xl font-extrabold text-[#0f172a]">
            Jetzt registrieren und Ihr Hostingkonto aktivieren
          </h1>
          <p className="mt-4 text-slate-500">
            Schnelle Registrierung, persönliches Dashboard und sichere Bezahlung mit Stripe, PayPal oder TWINT.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Name Fields */}
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-[#0f172a]">
              Vorname *
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="Max"
                required
                disabled={loading}
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-[#0f172a] focus:border-[#E63946] focus:bg-white outline-none disabled:opacity-50 transition"
              />
            </label>
            <label className="block text-sm font-semibold text-[#0f172a]">
              Nachname *
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Mustermann"
                required
                disabled={loading}
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-[#0f172a] focus:border-[#E63946] focus:bg-white outline-none disabled:opacity-50 transition"
              />
            </label>
          </div>

          {/* Email */}
          <label className="block text-sm font-semibold text-[#0f172a]">
            E-Mail *
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

          {/* Company & Phone */}
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-[#0f172a]">
              Firma (optional)
              <input
                type="text"
                name="company"
                value={form.company}
                onChange={handleChange}
                placeholder="Muster GmbH"
                disabled={loading}
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-[#0f172a] focus:border-[#E63946] focus:bg-white outline-none disabled:opacity-50 transition"
              />
            </label>
            <label className="block text-sm font-semibold text-[#0f172a]">
              Telefon (optional)
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+41 79 123 45 67"
                disabled={loading}
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-[#0f172a] focus:border-[#E63946] focus:bg-white outline-none disabled:opacity-50 transition"
              />
            </label>
          </div>

          {/* Password Fields */}
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-[#0f172a]">
              Passwort *
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Mindestens 8 Zeichen"
                required
                disabled={loading}
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-[#0f172a] focus:border-[#E63946] focus:bg-white outline-none disabled:opacity-50 transition"
              />
            </label>
            <label className="block text-sm font-semibold text-[#0f172a]">
              Passwort wiederholen *
              <input
                type="password"
                name="passwordConfirm"
                value={form.passwordConfirm}
                onChange={handleChange}
                placeholder="Passwort wiederholen"
                required
                disabled={loading}
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-[#0f172a] focus:border-[#E63946] focus:bg-white outline-none disabled:opacity-50 transition"
              />
            </label>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="rounded-3xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-3">
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="rounded-3xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 flex items-start gap-3">
              <CheckCircle size={18} className="mt-0.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-4">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#E63946] px-8 py-3 text-sm font-semibold text-white hover:bg-[#c5303d] disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Wird registriert...
                </>
              ) : (
                <>
                  Konto erstellen
                  <ArrowRight size={18} />
                </>
              )}
            </button>
            <Link
              to="/login"
              className="text-sm font-semibold text-[#0f172a] hover:text-[#E63946] transition"
            >
              Bereits registriert? Anmelden
            </Link>
          </div>
        </form>

        {/* Benefits Box */}
        <div className="mt-10 rounded-3xl bg-slate-100 p-6 text-sm text-slate-600">
          <div className="flex items-start gap-3">
            <CheckCircle size={18} className="text-[#22c55e] mt-1 flex-shrink-0" />
            <div>
              <p className="font-semibold text-[#0f172a]">Vorteile für Kunden</p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>Mein Account für Hosting-Pakete, Rechnungen und Support</li>
                <li>Sichere Anmeldung mit persönlichem Zugang</li>
                <li>Direkter Zugriff auf die Hosting-Auswahl</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
