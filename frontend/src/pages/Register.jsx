import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, CheckCircle, UserPlus } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Register() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", company: "", phone: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { customerRegister } = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await customerRegister(form);
      setSuccess("Ihr Konto wurde erfolgreich erstellt. Sie werden weitergeleitet...");
      window.setTimeout(() => navigate("/dashboard", { replace: true }), 1200);
    } catch (err) {
      setError(err.response?.data?.detail || "Registrierung fehlgeschlagen.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
      <div className="w-full max-w-3xl rounded-[40px] bg-white p-10 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-[#E63946] font-semibold">Konto erstellen</p>
          <h1 className="mt-3 text-4xl font-extrabold text-[#0f172a]">Jetzt registrieren und Ihr Hostingkonto aktivieren</h1>
          <p className="mt-4 text-slate-500">Schnelle Registrierung, persönliches Dashboard und sichere Bezahlung mit Stripe, PayPal oder TWINT.</p>
        </div>

        <form onSubmit={submit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-[#0f172a]">
              Vorname
              <input
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                type="text"
                placeholder="Max"
                required
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-[#0f172a] focus:border-[#E63946] outline-none"
              />
            </label>
            <label className="block text-sm font-semibold text-[#0f172a]">
              Nachname
              <input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                type="text"
                placeholder="Mustermann"
                required
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-[#0f172a] focus:border-[#E63946] outline-none"
              />
            </label>
          </div>
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
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-[#0f172a]">
              Firma (optional)
              <input
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                type="text"
                placeholder="Muster GmbH"
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-[#0f172a] focus:border-[#E63946] outline-none"
              />
            </label>
            <label className="block text-sm font-semibold text-[#0f172a]">
              Telefon (optional)
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                type="tel"
                placeholder="+41 79 123 45 67"
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-[#0f172a] focus:border-[#E63946] outline-none"
              />
            </label>
          </div>
          <label className="block text-sm font-semibold text-[#0f172a]">
            Passwort
            <input
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              type="password"
              placeholder="Mindestens 8 Zeichen"
              required
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-[#0f172a] focus:border-[#E63946] outline-none"
            />
          </label>

          {error && <div className="rounded-3xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
          {success && <div className="rounded-3xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">{success}</div>}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#E63946] px-6 py-3 text-sm font-semibold text-white hover:bg-[#c5303d] disabled:opacity-50 transition"
            >
              {submitting ? "Registriere..." : "Konto erstellen"}
              <ArrowRight size={18} />
            </button>
            <Link to="/login" className="text-sm font-semibold text-[#0f172a] hover:text-[#E63946]">Bereits registriert? Anmelden</Link>
          </div>
        </form>

        <div className="mt-10 rounded-3xl bg-slate-100 p-6 text-sm text-slate-600">
          <div className="flex items-start gap-3">
            <CheckCircle size={18} className="text-[#22c55e] mt-1" />
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
