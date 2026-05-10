import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ArrowLeft, Save, AlertCircle, CheckCircle, Loader } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuth();

  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    company: user?.company || "",
    phone: user?.phone || ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user || user.role !== "customer") {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
        <div className="rounded-lg bg-white p-8 text-center">
          <h1 className="text-2xl font-bold text-[#0f172a]">Zugriff verweigert</h1>
          <p className="mt-4 text-slate-600">Bitte melden Sie sich als Kunde an.</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#E63946] px-6 py-3 text-sm font-semibold text-white hover:bg-[#c5303d]"
          >
            Zur Anmeldung
          </button>
        </div>
      </div>
    );
  }

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
    setSuccess("");
    setLoading(true);

    try {
      await updateProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        company: form.company,
        phone: form.phone
      });
      setSuccess("Profil erfolgreich aktualisiert!");
    } catch (err) {
      const message = err.response?.data?.detail || err.message || "Aktualisierung fehlgeschlagen";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft size={20} />
            Zurück
          </button>
          <h1 className="text-2xl font-bold text-[#0f172a]">Mein Profil</h1>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          
          {/* Account Info */}
          <div className="mb-8 pb-8 border-b">
            <h2 className="text-lg font-semibold text-[#0f172a] mb-4">Kontoinformationen</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">E-Mail</label>
                <p className="text-[#0f172a] font-medium">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Status</label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    ✓ Verifiziert
                  </span>
                </div>
              </div>
              {user.lastLogin && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Letzte Anmeldung</label>
                  <p className="text-slate-700">
                    {new Date(user.lastLogin).toLocaleDateString("de-DE", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Edit Profile Form */}
          <h2 className="text-lg font-semibold text-[#0f172a] mb-6">Profil aktualisieren</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Name Fields */}
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-[#0f172a]">
                Vorname
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-[#0f172a] focus:border-[#E63946] focus:bg-white outline-none disabled:opacity-50 transition"
                />
              </label>
              <label className="block text-sm font-semibold text-[#0f172a]">
                Nachname
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-[#0f172a] focus:border-[#E63946] focus:bg-white outline-none disabled:opacity-50 transition"
                />
              </label>
            </div>

            {/* Company & Phone */}
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-[#0f172a]">
                Firma (optional)
                <input
                  type="text"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-[#0f172a] focus:border-[#E63946] focus:bg-white outline-none disabled:opacity-50 transition"
                />
              </label>
              <label className="block text-sm font-semibold text-[#0f172a]">
                Telefon (optional)
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-[#0f172a] focus:border-[#E63946] focus:bg-white outline-none disabled:opacity-50 transition"
                />
              </label>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-3">
                <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Alert */}
            {success && (
              <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 flex items-start gap-3">
                <CheckCircle size={18} className="mt-0.5 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-[#E63946] px-6 py-3 text-sm font-semibold text-white hover:bg-[#c5303d] disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Wird gespeichert...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Speichern
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Logout */}
          <div className="mt-12 pt-8 border-t">
            <button
              onClick={() => {
                if (confirm("Sind Sie sicher, dass Sie sich abmelden möchten?")) {
                  logout();
                }
              }}
              className="text-sm text-slate-600 hover:text-red-600 transition"
            >
              Abmelden
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
