import React, { useEffect, useState } from "react";
import { X, Loader2, CheckCircle2, Send } from "lucide-react";
import { useModals } from "../contexts/ModalContext";
import api from "../api";

const EMAIL_REGEX = /\S+@\S+\.\S+/;
const EMPTY = { fullName: "", email: "", phone: "", subject: "", message: "" };

export default function ContactModal() {
  const { contactOpen, closeContact } = useModals();
  const [data, setData] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (contactOpen) {
      setData(EMPTY);
      setSuccess(false);
      setError("");
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [contactOpen]);

  if (!contactOpen) return null;

  const valid =
    data.fullName.trim() &&
    EMAIL_REGEX.test(data.email) &&
    data.subject.trim() &&
    data.message.trim().length >= 10;

  const submit = async (e) => {
    e.preventDefault();
    if (!valid) return;
    setSubmitting(true);
    setError("");
    try {
      await api.post("/contacts", data);
      setSuccess(true);
    } catch {
      setError("Fehler beim Senden. Bitte versuchen Sie es erneut.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm fade-in sm:items-center sm:p-4">
      <div className="relative flex max-h-[100dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[92vh] sm:rounded-3xl">
        <div className="relative bg-gradient-to-br from-[#E63946] to-[#a8202e] px-5 pb-4 pt-5 text-white sm:px-7 sm:pb-5 sm:pt-6">
          <button
            onClick={closeContact}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition"
            aria-label="Schließen"
          >
            <X size={18} />
          </button>
          <p className="text-white/80 text-xs tracking-[0.2em] font-bold">KONTAKT</p>
          <h2 className="text-[24px] font-extrabold mt-1">Schreiben Sie uns</h2>
          <p className="text-white/85 text-sm mt-1">Wir melden uns in der Regel innerhalb eines Werktags.</p>
        </div>

        <div className="flex-1 overflow-y-auto bg-[#f8fafc] p-4 sm:p-6">
          {success ? (
            <div className="text-center py-10">
              <div className="w-20 h-20 mx-auto bg-[#22C55E]/10 rounded-full flex items-center justify-center mb-5">
                <CheckCircle2 size={50} className="text-[#22C55E]" />
              </div>
              <h3 className="text-2xl font-extrabold text-[#0f172a]">Nachricht gesendet!</h3>
              <p className="text-[#475569] mt-3">Vielen Dank. Wir melden uns persönlich und zeitnah bei Ihnen.</p>
              <button
                onClick={closeContact}
                className="mt-6 bg-[#0f172a] text-white px-8 py-3 rounded-full font-semibold"
              >
                Schließen
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#64748b] uppercase">Name *</label>
                  <input
                    value={data.fullName}
                    onChange={(e) => setData({ ...data, fullName: e.target.value })}
                    className="w-full mt-1 p-3 rounded-xl border-2 border-[#e2e8f0] focus:border-[#E63946] outline-none transition"
                    placeholder="Max Mustermann"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#64748b] uppercase">E-Mail *</label>
                  <input
                    type="email"
                    value={data.email}
                    onChange={(e) => setData({ ...data, email: e.target.value })}
                    className="w-full mt-1 p-3 rounded-xl border-2 border-[#e2e8f0] focus:border-[#E63946] outline-none transition"
                    placeholder="max@firma.ch"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#64748b] uppercase">Telefon</label>
                <input
                  value={data.phone}
                  onChange={(e) => setData({ ...data, phone: e.target.value })}
                  className="w-full mt-1 p-3 rounded-xl border-2 border-[#e2e8f0] focus:border-[#E63946] outline-none transition"
                  placeholder="+41 79 ..."
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#64748b] uppercase">Betreff *</label>
                <input
                  value={data.subject}
                  onChange={(e) => setData({ ...data, subject: e.target.value })}
                  className="w-full mt-1 p-3 rounded-xl border-2 border-[#e2e8f0] focus:border-[#E63946] outline-none transition"
                  placeholder="Worum geht es?"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#64748b] uppercase">Nachricht *</label>
                <textarea
                  rows={5}
                  value={data.message}
                  onChange={(e) => setData({ ...data, message: e.target.value })}
                  className="w-full mt-1 p-3 rounded-xl border-2 border-[#e2e8f0] focus:border-[#E63946] outline-none resize-none transition"
                  placeholder="Ihre Nachricht..."
                />
              </div>
              {error && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>
              )}
              <button
                type="submit"
                disabled={!valid || submitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-white bg-[#E63946] hover:bg-[#d22c39] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                Nachricht senden
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
