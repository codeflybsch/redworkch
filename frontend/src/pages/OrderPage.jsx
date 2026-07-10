import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, CheckCircle2, CreditCard, Globe2, Mail, Phone, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import api from "../api";

const formatCHF = (value) =>
  new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const initialValues = {
  firstName: "",
  lastName: "",
  email: "",
  company: "",
  phone: "",
  domain: "",
  paymentMethod: "card",
  notes: "",
};

export default function OrderPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const selectedPlan = location.state?.selectedPlan;

  const [form, setForm] = useState(() => ({
    ...initialValues,
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  }));
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const total = useMemo(() => Number(selectedPlan?.price || 0), [selectedPlan]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (selectedPlan?.auctionId) {
        await api.post(`/domain-auctions/${selectedPlan.auctionId}/buy`, {
          paymentMethod: form.paymentMethod,
          notes: form.notes,
        });
      } else if (user?.role === "customer") {
        await api.post("/orders", {
          productName: selectedPlan?.planName || "Hosting Paket",
          duration: selectedPlan?.billingCycle || "monthly",
          amount: total,
          customerEmail: form.email,
          customerName: `${form.firstName} ${form.lastName}`.trim(),
        });
      }

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError("Die Bestellung konnte nicht abgeschlossen werden. Bitte versuchen Sie es später erneut.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-[24px] border border-white/10 bg-white/10 p-5 text-center shadow-2xl backdrop-blur-xl sm:rounded-[32px] sm:p-8">
          <h1 className="text-3xl font-black">Keine Paketauswahl gefunden</h1>
          <p className="mt-4 text-slate-300">Bitte wählen Sie zuerst ein Hosting-Paket aus.</p>
          <button
            type="button"
            onClick={() => navigate("/" )}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            <ArrowLeft size={16} /> Zurück zur Auswahl
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.15),_transparent_30%),linear-gradient(135deg,#020617_0%,#0f172a_45%,#111827_100%)] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/20"
        >
          <ArrowLeft size={16} /> Zurück
        </button>

        {submitted ? (
          <div className="rounded-[32px] border border-emerald-400/30 bg-emerald-500/10 p-8 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={28} className="text-emerald-300" />
              <h1 className="text-3xl font-black">Bestellung erfolgreich eingereicht</h1>
            </div>
            <p className="mt-4 max-w-2xl text-slate-300">
              Vielen Dank! Ihre Anfrage für {selectedPlan.planName} wurde entgegengenommen. Wir kontaktieren Sie umgehend mit den nächsten Schritten.
            </p>
            <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/50 p-5">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Bestellübersicht</p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-200">
                <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1">{selectedPlan.planName}</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{selectedPlan.billingLabel}</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{formatCHF(total)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <form onSubmit={handleSubmit} className="rounded-[32px] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
              <div className="mb-8">
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Hosting Bestellung</p>
                <h1 className="mt-3 text-3xl font-black sm:text-4xl">Ihre professionelle Hosting-Anmeldung</h1>
                <p className="mt-3 text-slate-300">Bitte füllen Sie die Details aus, damit wir Ihr Paket schnell und sicher einrichten können.</p>
              </div>

              {error && (
                <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-200">
                  <span className="flex items-center gap-2"><UserRound size={15} /> Vorname</span>
                  <input name="firstName" value={form.firstName} onChange={handleChange} required className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none ring-0 focus:border-cyan-400" />
                </label>
                <label className="space-y-2 text-sm text-slate-200">
                  <span className="flex items-center gap-2"><UserRound size={15} /> Nachname</span>
                  <input name="lastName" value={form.lastName} onChange={handleChange} required className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none ring-0 focus:border-cyan-400" />
                </label>
                <label className="space-y-2 text-sm text-slate-200">
                  <span className="flex items-center gap-2"><Mail size={15} /> E-Mail</span>
                  <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none ring-0 focus:border-cyan-400" />
                </label>
                <label className="space-y-2 text-sm text-slate-200">
                  <span className="flex items-center gap-2"><Phone size={15} /> Telefon</span>
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none ring-0 focus:border-cyan-400" />
                </label>
                <label className="space-y-2 text-sm text-slate-200 sm:col-span-2">
                  <span className="flex items-center gap-2"><Building2 size={15} /> Firma / Organisation</span>
                  <input name="company" value={form.company} onChange={handleChange} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none ring-0 focus:border-cyan-400" />
                </label>
                <label className="space-y-2 text-sm text-slate-200 sm:col-span-2">
                  <span className="flex items-center gap-2"><Globe2 size={15} /> gewünschte Domain</span>
                  <input name="domain" value={form.domain} onChange={handleChange} placeholder="beispiel.ch" className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none ring-0 focus:border-cyan-400" />
                </label>
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200">
                  <CreditCard size={16} /> Zahlungsart
                </div>
                <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none focus:border-cyan-400">
                  <option value="card">Kreditkarte / Stripe</option>
                  <option value="twint">TWINT</option>
                  <option value="bank">Banküberweisung</option>
                </select>
              </div>

              <label className="mt-6 block space-y-2 text-sm text-slate-200">
                <span>Zusätzliche Hinweise</span>
                <textarea name="notes" value={form.notes} onChange={handleChange} rows={4} className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none ring-0 focus:border-cyan-400" placeholder="Projektumfang, Domain-Details oder bevorzugte Einrichtung..." />
              </label>

              <button type="submit" disabled={submitting} className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70">
                {submitting ? "Wird gesendet..." : "Bestellung absenden"}
              </button>
            </form>

            <aside className="space-y-6">
              <div className="rounded-[32px] border border-white/10 bg-slate-950/70 p-6 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-cyan-300">
                  <ShieldCheck size={16} /> Paketübersicht
                </div>
                <h2 className="mt-4 text-2xl font-black">{selectedPlan.planName}</h2>
                <p className="mt-2 text-slate-300">{selectedPlan.billingLabel}</p>

                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span>Monatlicher Äquivalentpreis</span>
                    <span>{formatCHF(selectedPlan.monthlyEquivalent || total)}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-slate-300">
                    <span>Gesamtbetrag</span>
                    <span className="text-xl font-bold text-white">{formatCHF(total)}</span>
                  </div>
                </div>

                <div className="mt-6 space-y-3 text-sm text-slate-300">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="mt-0.5 text-emerald-300" />
                    <span>Provisionierung in weniger als 24 Stunden</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="mt-0.5 text-emerald-300" />
                    <span>Schweizer Support mit persönlicher Betreuung</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="mt-0.5 text-emerald-300" />
                    <span>SSL, Backups und Sicherheitsfunktionen inklusive</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[32px] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
                <h3 className="text-lg font-bold">Warum Kunden uns wählen</h3>
                <div className="mt-4 space-y-3 text-sm text-slate-300">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">⚡ Schnelle Bereitstellung und Migration</div>
                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">🔒 Verlässliche Sicherheit für Webshops und Business-Projekte</div>
                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">🇨🇭 Schweizer Qualität und transparente Preise</div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
