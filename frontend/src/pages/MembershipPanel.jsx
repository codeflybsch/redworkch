import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Wallet, FileText, HelpCircle, ArrowRight, CreditCard, Star, CheckCircle } from "lucide-react";
import { useModals } from "../contexts/ModalContext";
import MarqueeBanner from "../components/MarqueeBanner";

const DEMO_ACCOUNT = {
  name: "RedWork Kunde",
  email: "kunde@example.com",
  plan: "Business Hosting",
  nextBilling: "CHF 49 / Monat",
  status: "Aktiv",
  activeSince: "01.04.2026",
  supportLevel: "Premium 24/7 Support",
  assignedManager: "Elif Meier",
};

export default function MembershipPanel() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const { openQuote } = useModals();

  const handleLogin = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setLoginError("Bitte geben Sie E-Mail und Passwort ein.");
      return;
    }
    setLoggedIn(true);
    setLoginError("");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <MarqueeBanner target="account" />
      <section className="bg-[#0f172a] text-white pb-20 pt-20">
        <div className="max-w-[1200px] mx-auto px-6 grid gap-8 lg:grid-cols-2 items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-[#E63946] mb-4">Kundenbereich</p>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">Professionelles Hosting-Management und Zahlungsportal</h1>
            <p className="mt-6 text-lg text-[#cbd5e1] max-w-xl">
              Verwalten Sie Ihre Hosting-Pakete, Rechnungen und Supportanfragen in einem modernen, deutschen Kundenportal mit Stripe-, PayPal- und TWINT-Zahlung.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                { icon: ShieldCheck, title: "Sicherheit & SLA" },
                { icon: Wallet, title: "Flexible Zahlung" },
                { icon: FileText, title: "Digitale Rechnungen" },
                { icon: HelpCircle, title: "Support 24/7" },
              ].map((item) => (
                <div key={item.title} className="rounded-3xl bg-white/5 border border-white/10 p-4">
                  <item.icon size={22} className="text-[#E63946] mb-2" />
                  <div className="font-semibold">{item.title}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[40px] border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3 mb-6">
              <div>
                <div className="text-sm uppercase tracking-[0.24em] text-[#cbd5e1]">Anmeldung</div>
                <div className="text-3xl font-extrabold">Kundenlogin</div>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#E63946] px-4 py-2 text-xs uppercase font-bold text-white">
                <Star size={16} /> Premium
              </div>
            </div>
            <p className="text-sm text-[#cbd5e1]">Geben Sie Ihre Zugangsdaten ein, um schnell auf Ihr Hosting- und Rechnungs-Dashboard zuzugreifen.</p>
          </div>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-6 py-14">
        {loggedIn ? (
          <div className="space-y-8">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-[32px] bg-white p-8 shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#0ea5e9]/10 text-[#0e7490] mb-4"><ShieldCheck size={20} /></div>
                <h2 className="text-xl font-bold text-[#0f172a]">Kontenübersicht</h2>
                <div className="mt-4 space-y-3 text-sm text-[#475569]">
                  <div><span className="font-semibold text-[#0f172a]">Name:</span> {DEMO_ACCOUNT.name}</div>
                  <div><span className="font-semibold text-[#0f172a]">E-Mail:</span> {DEMO_ACCOUNT.email}</div>
                  <div><span className="font-semibold text-[#0f172a]">Plan:</span> {DEMO_ACCOUNT.plan}</div>
                  <div><span className="font-semibold text-[#0f172a]">Status:</span> {DEMO_ACCOUNT.status}</div>
                </div>
              </div>
              <div className="rounded-[32px] bg-white p-8 shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#22c55e]/10 text-[#166534] mb-4"><Wallet size={20} /></div>
                <h2 className="text-xl font-bold text-[#0f172a]">Zahlung & Abrechnung</h2>
                <div className="mt-4 space-y-3 text-sm text-[#475569]">
                  <div><span className="font-semibold text-[#0f172a]">Nächste Zahlung:</span> {DEMO_ACCOUNT.nextBilling}</div>
                  <div><span className="font-semibold text-[#0f172a]">Zahlart:</span> Stripe, PayPal, TWINT</div>
                  <div><span className="font-semibold text-[#0f172a]">Account Manager:</span> {DEMO_ACCOUNT.assignedManager}</div>
                </div>
              </div>
              <div className="rounded-[32px] bg-white p-8 shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#f59e0b]/10 text-[#b45309] mb-4"><HelpCircle size={20} /></div>
                <h2 className="text-xl font-bold text-[#0f172a]">Supportstatus</h2>
                <div className="mt-4 space-y-3 text-sm text-[#475569]">
                  <div>Antwortzeit: 1-2 Stunden</div>
                  <div>Premium Support: {DEMO_ACCOUNT.supportLevel}</div>
                  <div>Planbeginn: {DEMO_ACCOUNT.activeSince}</div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-[32px] bg-white p-8 shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#0f172a] text-white"><FileText size={20} /></div>
                  <div>
                      <h3 className="text-xl font-bold text-[#0f172a]">Letzte Rechnungen</h3>
                      <p className="text-sm text-[#64748b]">Alle Rechnungen an einem Ort, als PDF verfügbar.</p>
                  </div>
                </div>
                <div className="space-y-4 text-sm text-[#475569]">
                  {[
                    { id: 1, label: "April 2026", amount: "CHF 49.00", status: "Bezahlt" },
                    { id: 2, label: "März 2026", amount: "CHF 49.00", status: "Bezahlt" },
                    { id: 3, label: "Februar 2026", amount: "CHF 49.00", status: "Bezahlt" },
                  ].map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between gap-3 rounded-3xl bg-slate-50 p-4">
                      <div>
                        <div className="font-semibold text-[#0f172a]">{invoice.label}</div>
                        <div className="text-xs text-[#64748b]">{invoice.status}</div>
                      </div>
                      <div className="text-sm font-bold text-[#0f172a]">{invoice.amount}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[32px] bg-white p-8 shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#22c55e] text-white"><CreditCard size={20} /></div>
                  <div>
                      <h3 className="text-xl font-bold text-[#0f172a]">Zahlungsmethoden</h3>
                      <p className="text-sm text-[#64748b]">Unterstützt: Kreditkarte, PayPal und TWINT.</p>
                  </div>
                </div>
                <div className="space-y-4 text-sm text-[#475569]">
                  {[
                    "Kreditkarte / Stripe",
                    "PayPal-Zahlungen",
                    "TWINT-Einfachzahlung",
                    "Rechnungsverwaltung mit einem Klick",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle size={18} className="text-[#E63946]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[32px] bg-[#0f172a] p-8 text-white shadow-[0_20px_80px_rgba(15,23,42,0.18)]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="text-sm uppercase tracking-[0.24em] text-[#94a3b8]">Schneller Zugriff</div>
                  <h2 className="text-2xl font-bold mt-2">Wählen Sie jetzt Ihr neues Paket oder senden Sie eine Supportanfrage.</h2>
                </div>
                <button onClick={openQuote} className="inline-flex items-center gap-2 rounded-full bg-[#E63946] px-5 py-3 text-sm font-bold text-white hover:bg-[#c5303d] transition-colors">
                  Support-Anfrage senden
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr]">
            <div className="rounded-[40px] bg-white p-10 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
              <h2 className="text-3xl font-extrabold text-[#0f172a] mb-4">Kundenlogin</h2>
              <p className="text-sm text-[#64748b] leading-relaxed mb-8">Verwalten Sie hier Ihre Hosting-Abonnements und Rechnungen. Nutzen Sie Ihr Benutzerkonto zum Zugriff auf das Kundenportal.</p>
              <form onSubmit={handleLogin} className="space-y-5">
                <label className="block text-sm font-semibold text-[#0f172a]">E-Mail</label>
                <input
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  type="email"
                  placeholder="email@domain.com"
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-[#0f172a] focus:border-[#0f172a] focus:outline-none"
                />
                <label className="block text-sm font-semibold text-[#0f172a]">Passwort</label>
                <input
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  type="password"
                  placeholder="********"
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-[#0f172a] focus:border-[#0f172a] focus:outline-none"
                />
                {loginError && <div className="text-sm text-[#dc2626]">{loginError}</div>}
                <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#E63946] px-6 py-3 text-sm font-bold text-white hover:bg-[#c5303d] transition-colors">
                  Anmelden
                  <ArrowRight size={18} />
                </button>
                <div className="text-center mt-6">
                  <p className="text-sm text-[#64748b]">Noch kein Konto? <Link to="/register" className="text-[#E63946] font-semibold hover:underline">Jetzt registrieren</Link></p>
                </div>
              </form>
            </div>

            <div className="rounded-[40px] bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-10 text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
              <div className="mb-6">
                <h3 className="text-xl font-bold">Schnelle Demo</h3>
                <p className="mt-3 text-sm text-[#cbd5e1]">Sehen Sie, wie das Panel funktioniert, mit unserer Demo-Version.</p>
              </div>
              <div className="space-y-4 text-sm text-[#cbd5e1]">
                <div className="rounded-3xl bg-white/5 p-4">
                  <div className="font-semibold text-white">Plan</div>
                  <div>{DEMO_ACCOUNT.plan}</div>
                </div>
                <div className="rounded-3xl bg-white/5 p-4">
                  <div className="font-semibold text-white">Support</div>
                  <div>{DEMO_ACCOUNT.supportLevel}</div>
                </div>
                <div className="rounded-3xl bg-white/5 p-4">
                  <div className="font-semibold text-white">Zahlung</div>
                  <div>Stripe, PayPal & TWINT</div>
                </div>
                <div className="rounded-3xl bg-white/5 p-4 flex items-center gap-3">
                  <CheckCircle size={18} className="text-[#22c55e]" />
                  <span>Professionelle Kundenportal-Erfahrung.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
