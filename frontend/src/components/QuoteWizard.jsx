import React, { useCallback, useEffect, useState } from "react";
import {
  X, ChevronLeft, ChevronRight, Check, Loader2,
  Building2, ShoppingBag, User, Rocket, Layers, Sparkles, Search, Megaphone, Award,
  Mail, Phone, MessageCircle, CheckCircle2, ArrowRight,
} from "lucide-react";
import { useModals } from "../contexts/ModalContext";
import { serviceTypes, budgetRanges, timelineOptions } from "../mock";
import api from "../api";

const iconMap = {
  Building2, ShoppingBag, User, Rocket, Layers, Sparkles, Search, Megaphone, Award,
};

const steps = [
  { id: 1, label: "Service" },
  { id: 2, label: "Details" },
  { id: 3, label: "Budget" },
  { id: 4, label: "Kontakt" },
];

const INITIAL_DATA = {
  serviceType: "",
  projectDetails: "",
  budget: "",
  timeline: "",
  fullName: "",
  email: "",
  phone: "",
  company: "",
  contactMethod: "email",
  contactTime: "any",
};

const EMAIL_REGEX = /\S+@\S+\.\S+/;

function validateStep(step, data) {
  if (step === 1) return !!data.serviceType;
  if (step === 2) return data.projectDetails.trim().length >= 10;
  if (step === 3) return !!data.budget && !!data.timeline;
  if (step === 4) return data.fullName.trim() && EMAIL_REGEX.test(data.email);
  return false;
}

export default function QuoteWizard() {
  const { quoteOpen, closeQuote, defaultService } = useModals();
  const [step, setStep] = useState(1);
  const [data, setData] = useState(INITIAL_DATA);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Reset state whenever modal opens
  useEffect(() => {
    if (quoteOpen) {
      setStep(1);
      setSuccess(false);
      setError("");
      setData({ ...INITIAL_DATA, serviceType: defaultService || "" });
    }
  }, [quoteOpen, defaultService]);

  // Lock body scroll
  useEffect(() => {
    if (quoteOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [quoteOpen]);

  const upd = useCallback((k, v) => setData((d) => ({ ...d, [k]: v })), []);

  const canNext = validateStep(step, data);

  const submit = useCallback(async () => {
    setSubmitting(true);
    setError("");
    try {
      await api.post("/quotes", data);
      setSuccess(true);
    } catch {
      setError("Fehler beim Senden. Bitte versuchen Sie es erneut.");
    } finally {
      setSubmitting(false);
    }
  }, [data]);

  if (!quoteOpen) return null;

  const progress = (step / 4) * 100;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm fade-in sm:items-center sm:p-4">
      <div className="relative flex max-h-[100dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[92vh] sm:rounded-3xl">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] px-5 pb-4 pt-5 text-white sm:px-8 sm:pb-5 sm:pt-7">
          <button
            onClick={closeQuote}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            aria-label="Schließen"
          >
            <X size={18} />
          </button>
          <p className="text-[#E63946] text-xs tracking-[0.2em] font-bold">REDWORK.CH</p>
          <h2 className="text-[24px] md:text-[30px] font-extrabold mt-1">
            Angebot in <span className="text-[#E63946]">4 Schritten</span> einholen
          </h2>
          <p className="text-white/70 text-sm mt-1">
            Wir melden uns in der Regel innerhalb eines Werktags mit einem präzisen, passgenauen Angebot.
          </p>

          {/* Progress steps */}
          <div className="mt-6">
            <div className="flex justify-between mb-2">
              {steps.map((s) => (
                <div key={s.id} className="flex-1 flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      step > s.id
                        ? "bg-[#22C55E] text-white"
                        : step === s.id
                        ? "bg-[#E63946] text-white ring-4 ring-[#E63946]/30"
                        : "bg-white/10 text-white/60"
                    }`}
                  >
                    {step > s.id ? <Check size={16} /> : s.id}
                  </div>
                  <span
                    className={`text-[11px] mt-1.5 font-medium tracking-wide ${
                      step >= s.id ? "text-white" : "text-white/50"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden mt-3">
              <div
                className="h-full bg-gradient-to-r from-[#E63946] to-[#E63946] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-[#f8fafc] p-4 sm:p-6 md:p-8">
          {success ? (
            <div className="text-center py-10">
              <div className="w-20 h-20 mx-auto bg-[#22C55E]/10 rounded-full flex items-center justify-center mb-5">
                <CheckCircle2 size={50} className="text-[#22C55E]" />
              </div>
              <h3 className="text-2xl font-extrabold text-[#0f172a]">Vielen Dank!</h3>
              <p className="text-[#475569] mt-3 max-w-md mx-auto">
                Ihre Anfrage wurde erfolgreich übermittelt. Unser Team meldet sich in der Regel innerhalb eines
                Werktags bei Ihnen.
              </p>
              <button
                onClick={closeQuote}
                className="mt-6 bg-[#0f172a] hover:bg-[#1e293b] text-white px-8 py-3 rounded-full font-semibold transition"
              >
                Schließen
              </button>
            </div>
          ) : (
            <>
              {step === 1 && (
                <div>
                  <h3 className="text-xl font-bold text-[#0f172a]">
                    Welche Art von Projekt planen Sie?
                  </h3>
                  <p className="text-[#475569] text-sm mt-1">Wählen Sie die Kategorie, die Ihrem Vorhaben am besten entspricht.</p>
                  <div className="mt-6 grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 md:grid-cols-3">
                    {serviceTypes.map((s) => {
                      const Icon = iconMap[s.icon] || Building2;
                      const active = data.serviceType === s.id;
                      return (
                        <button
                          key={s.id}
                          onClick={() => upd("serviceType", s.id)}
                          className={`relative p-4 rounded-2xl border-2 text-left transition-all ${
                            active
                              ? "border-[#E63946] bg-[#E63946]/5 shadow-lg"
                              : "border-[#e2e8f0] bg-white hover:border-[#E63946]/40 hover:-translate-y-0.5"
                          }`}
                        >
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                              active ? "bg-[#E63946] text-white" : "bg-[#f1f5f9] text-[#0f172a]"
                            }`}
                          >
                            <Icon size={22} />
                          </div>
                          <div className="font-semibold text-[#0f172a] text-sm mt-3 leading-tight">
                            {s.label}
                          </div>
                          {active && (
                            <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#E63946] text-white flex items-center justify-center">
                              <Check size={12} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h3 className="text-xl font-bold text-[#0f172a]">Erzählen Sie uns von Ihrem Projekt</h3>
                  <p className="text-[#475569] text-sm mt-1">Je präziser die Angaben, desto passgenauer wird unser Angebot.</p>
                  <textarea
                    rows={9}
                    value={data.projectDetails}
                    onChange={(e) => upd("projectDetails", e.target.value)}
                    placeholder="Beschreiben Sie Ihr Projekt: Ziele, Zielgruppe, gewünschte Funktionen, Beispiele die Ihnen gefallen, technische Anforderungen ..."
                    className="w-full mt-4 p-4 rounded-2xl border-2 border-[#e2e8f0] focus:border-[#E63946] outline-none text-[15px] resize-none transition"
                  />
                  <div className="flex items-center justify-between mt-2 text-xs text-[#94a3b8]">
                    <span>Mindestens 10 Zeichen</span>
                    <span>{data.projectDetails.length} Zeichen</span>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-7">
                  <div>
                    <h3 className="text-xl font-bold text-[#0f172a]">In welchem Rahmen bewegt sich Ihr Budget?</h3>
                    <div className="mt-4 grid grid-cols-1 gap-2.5 min-[380px]:grid-cols-2 md:grid-cols-3">
                      {budgetRanges.map((b) => {
                        const active = data.budget === b.id;
                        return (
                          <button
                            key={b.id}
                            onClick={() => upd("budget", b.id)}
                            className={`p-3 rounded-xl border-2 text-sm font-semibold transition ${
                              active
                                ? "border-[#1E88E5] bg-[#1E88E5] text-white"
                                : "border-[#e2e8f0] bg-white text-[#0f172a] hover:border-[#1E88E5]/40"
                            }`}
                          >
                            {b.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#0f172a]">Bis wann soll das Projekt umgesetzt sein?</h3>
                    <div className="mt-4 grid grid-cols-1 gap-2.5 min-[380px]:grid-cols-2 md:grid-cols-3">
                      {timelineOptions.map((t) => {
                        const active = data.timeline === t.id;
                        return (
                          <button
                            key={t.id}
                            onClick={() => upd("timeline", t.id)}
                            className={`p-3 rounded-xl border-2 text-sm font-semibold transition ${
                              active
                                ? "border-[#22C55E] bg-[#22C55E] text-white"
                                : "border-[#e2e8f0] bg-white text-[#0f172a] hover:border-[#22C55E]/40"
                            }`}
                          >
                            {t.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div>
                  <h3 className="text-xl font-bold text-[#0f172a]">Wie können wir Sie erreichen?</h3>
                  <p className="text-[#475569] text-sm mt-1">Ihre Angaben werden vertraulich behandelt und nur für die Projektvorbereitung verwendet.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                    <div>
                      <label className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">
                        Vor- und Nachname *
                      </label>
                      <input
                        value={data.fullName}
                        onChange={(e) => upd("fullName", e.target.value)}
                        placeholder="Max Mustermann"
                        className="w-full mt-1 p-3 rounded-xl border-2 border-[#e2e8f0] focus:border-[#E63946] outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">
                        E-Mail *
                      </label>
                      <input
                        type="email"
                        value={data.email}
                        onChange={(e) => upd("email", e.target.value)}
                        placeholder="max@firma.ch"
                        className="w-full mt-1 p-3 rounded-xl border-2 border-[#e2e8f0] focus:border-[#E63946] outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">Telefon</label>
                      <input
                        value={data.phone}
                        onChange={(e) => upd("phone", e.target.value)}
                        placeholder="+41 79 ..."
                        className="w-full mt-1 p-3 rounded-xl border-2 border-[#e2e8f0] focus:border-[#E63946] outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">Firma</label>
                      <input
                        value={data.company}
                        onChange={(e) => upd("company", e.target.value)}
                        placeholder="Firma AG"
                        className="w-full mt-1 p-3 rounded-xl border-2 border-[#e2e8f0] focus:border-[#E63946] outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="mt-5">
                    <label className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">
                      Bevorzugte Kontaktart
                    </label>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {[
                        { id: "email", label: "E-Mail", Icon: Mail },
                        { id: "phone", label: "Telefon", Icon: Phone },
                        { id: "whatsapp", label: "WhatsApp", Icon: MessageCircle },
                      ].map((m) => {
                        const active = data.contactMethod === m.id;
                        return (
                          <button
                            key={m.id}
                            onClick={() => upd("contactMethod", m.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 text-sm font-semibold transition ${
                              active
                                ? "border-[#0f172a] bg-[#0f172a] text-white"
                                : "border-[#e2e8f0] bg-white text-[#0f172a] hover:border-[#0f172a]/40"
                            }`}
                          >
                            <m.Icon size={15} />
                            {m.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">
                      {error}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="flex items-center justify-between gap-2 border-t border-[#e2e8f0] bg-white px-3 py-3 sm:gap-3 sm:px-6 sm:py-4 md:px-8">
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="flex items-center gap-1 px-5 py-2.5 rounded-full font-semibold text-[#64748b] hover:bg-[#f1f5f9] disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={18} /> Zurück
            </button>
            <span className="text-xs text-[#94a3b8] hidden md:block">
              Schritt <b className="text-[#0f172a]">{step}</b> von 4
            </span>
            {step < 4 ? (
              <button
                onClick={() => setStep((s) => Math.min(4, s + 1))}
                disabled={!canNext}
                className="flex items-center gap-1 px-6 py-2.5 rounded-full font-bold text-white bg-[#E63946] hover:bg-[#d22c39] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Weiter <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={!canNext || submitting}
                className="flex items-center gap-2 px-7 py-2.5 rounded-full font-bold text-white bg-[#22C55E] hover:bg-[#16a34a] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                Anfrage senden
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
