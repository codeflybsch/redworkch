import React, { useState } from "react";
import { ShieldCheck, Wallet, FileText, HelpCircle, ArrowRight, CreditCard, Star, CheckCircle } from "lucide-react";
import { useModals } from "../contexts/ModalContext";

const DEMO_ACCOUNT = {
  name: "RedWork Müşteri",
  email: "kunde@example.com",
  plan: "Business Hosting",
  nextBilling: "CHF 49 / Monat",
  status: "Aktif",
  activeSince: "01.04.2026",
  supportLevel: "Premium 24/7 Destek",
  assignedManager: "Elif Yılmaz",
};

export default function MembershipPanel() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const { openQuote } = useModals();

  const handleLogin = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setLoginError("Lütfen e-posta ve şifre girin.");
      return;
    }
    setLoggedIn(true);
    setLoginError("");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <section className="bg-[#0f172a] text-white pb-20 pt-20">
        <div className="max-w-[1200px] mx-auto px-6 grid gap-8 lg:grid-cols-2 items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-[#E63946] mb-4">Müşteri Paneli</p>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">Profesyonel Hosting Yönetimi ve Ödeme Paneli</h1>
            <p className="mt-6 text-lg text-[#cbd5e1] max-w-xl">
              Hosting paketlerinizi yönetebileceğiniz, fatura geçmişinizi görebileceğiniz ve Stripe, PayPal / TWINT destekli ödeme seçeneklerini tek bir panelde bulabileceğiniz modern bir kullanıcı alanı.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                { icon: ShieldCheck, title: "Güvenlik ve SLA" },
                { icon: Wallet, title: "Esnek Ödeme" },
                { icon: FileText, title: "Dijital Fatura" },
                { icon: HelpCircle, title: "7/24 Destek" },
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
                <div className="text-sm uppercase tracking-[0.24em] text-[#cbd5e1]">Panel Giriş</div>
                <div className="text-3xl font-extrabold">Üye girişi</div>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#E63946] px-4 py-2 text-xs uppercase font-bold text-white">
                <Star size={16} /> Premium
              </div>
            </div>
            <p className="text-sm text-[#cbd5e1]">Üyelik bilgilerinizi girerek hazırlanan paneli hemen deneyebilir, hosting durumunuza hızlı erişebilirsiniz.</p>
          </div>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-6 py-14">
        {loggedIn ? (
          <div className="space-y-8">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-[32px] bg-white p-8 shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#0ea5e9]/10 text-[#0e7490] mb-4"><ShieldCheck size={20} /></div>
                <h2 className="text-xl font-bold text-[#0f172a]">Hesap Özeti</h2>
                <div className="mt-4 space-y-3 text-sm text-[#475569]">
                  <div><span className="font-semibold text-[#0f172a]">Ad:</span> {DEMO_ACCOUNT.name}</div>
                  <div><span className="font-semibold text-[#0f172a]">E-posta:</span> {DEMO_ACCOUNT.email}</div>
                  <div><span className="font-semibold text-[#0f172a]">Plan:</span> {DEMO_ACCOUNT.plan}</div>
                  <div><span className="font-semibold text-[#0f172a]">Durum:</span> {DEMO_ACCOUNT.status}</div>
                </div>
              </div>
              <div className="rounded-[32px] bg-white p-8 shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#22c55e]/10 text-[#166534] mb-4"><Wallet size={20} /></div>
                <h2 className="text-xl font-bold text-[#0f172a]">Ödeme ve Faturalama</h2>
                <div className="mt-4 space-y-3 text-sm text-[#475569]">
                  <div><span className="font-semibold text-[#0f172a]">Bir sonraki ödeme:</span> {DEMO_ACCOUNT.nextBilling}</div>
                  <div><span className="font-semibold text-[#0f172a]">Ödeme:</span> Stripe, PayPal, TWINT</div>
                  <div><span className="font-semibold text-[#0f172a]">Hesap Yöneticisi:</span> {DEMO_ACCOUNT.assignedManager}</div>
                </div>
              </div>
              <div className="rounded-[32px] bg-white p-8 shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#f59e0b]/10 text-[#b45309] mb-4"><HelpCircle size={20} /></div>
                <h2 className="text-xl font-bold text-[#0f172a]">Destek Durumu</h2>
                <div className="mt-4 space-y-3 text-sm text-[#475569]">
                  <div>Çözüm süresi: 1-2 saat</div>
                  <div>Premium destek: {DEMO_ACCOUNT.supportLevel}</div>
                  <div>Plan başlangıç: {DEMO_ACCOUNT.activeSince}</div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-[32px] bg-white p-8 shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#0f172a] text-white"><FileText size={20} /></div>
                  <div>
                    <h3 className="text-xl font-bold text-[#0f172a]">Son Faturalar</h3>
                    <p className="text-sm text-[#64748b]">Tüm faturalarınız tek yerde, PDF indirilebilir.</p>
                  </div>
                </div>
                <div className="space-y-4 text-sm text-[#475569]">
                  {[
                    { id: 1, label: "Nisan 2026", amount: "CHF 49.00", status: "Ödendi" },
                    { id: 2, label: "Mart 2026", amount: "CHF 49.00", status: "Ödendi" },
                    { id: 3, label: "Şubat 2026", amount: "CHF 49.00", status: "Ödendi" },
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
                    <h3 className="text-xl font-bold text-[#0f172a]">Ödeme Metotları</h3>
                    <p className="text-sm text-[#64748b]">Kredi kartı, PayPal ve TWINT destekleri.</p>
                  </div>
                </div>
                <div className="space-y-4 text-sm text-[#475569]">
                  {[
                    "Kredi Kartı / Stripe",
                    "PayPal Ödemeleri",
                    "TWINT Kolay Ödeme",
                    "Tek Tıkla Fatura Yönetimi",
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
                  <div className="text-sm uppercase tracking-[0.24em] text-[#94a3b8]">Hızlı erişim</div>
                  <h2 className="text-2xl font-bold mt-2">Hemen yeni paketinizi seçin veya destek talebi gönderin.</h2>
                </div>
                <button onClick={openQuote} className="inline-flex items-center gap-2 rounded-full bg-[#E63946] px-5 py-3 text-sm font-bold text-white hover:bg-[#c5303d] transition-colors">
                  Destek Talebi Aç
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr]">
            <div className="rounded-[40px] bg-white p-10 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
              <h2 className="text-3xl font-extrabold text-[#0f172a] mb-4">Üyelik girişi</h2>
              <p className="text-sm text-[#64748b] leading-relaxed mb-8">Hosting aboneliklerinizi ve faturalarınızı burada yönetebilirsiniz. Demo hesap ile kolaylıkla test edebilirsiniz.</p>
              <form onSubmit={handleLogin} className="space-y-5">
                <label className="block text-sm font-semibold text-[#0f172a]">E-posta</label>
                <input
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  type="email"
                  placeholder="email@domain.com"
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-[#0f172a] focus:border-[#0f172a] focus:outline-none"
                />
                <label className="block text-sm font-semibold text-[#0f172a]">Şifre</label>
                <input
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  type="password"
                  placeholder="********"
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-[#0f172a] focus:border-[#0f172a] focus:outline-none"
                />
                {loginError && <div className="text-sm text-[#dc2626]">{loginError}</div>}
                <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#E63946] px-6 py-3 text-sm font-bold text-white hover:bg-[#c5303d] transition-colors">
                  Giriş Yap
                  <ArrowRight size={18} />
                </button>
              </form>
            </div>

            <div className="rounded-[40px] bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-10 text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
              <div className="mb-6">
                <h3 className="text-xl font-bold">Quick Demo</h3>
                <p className="mt-3 text-sm text-[#cbd5e1]">Demo kullanarak panelin nasıl çalıştığını görebilirsiniz.</p>
              </div>
              <div className="space-y-4 text-sm text-[#cbd5e1]">
                <div className="rounded-3xl bg-white/5 p-4">
                  <div className="font-semibold text-white">Plan</div>
                  <div>{DEMO_ACCOUNT.plan}</div>
                </div>
                <div className="rounded-3xl bg-white/5 p-4">
                  <div className="font-semibold text-white">Destek</div>
                  <div>{DEMO_ACCOUNT.supportLevel}</div>
                </div>
                <div className="rounded-3xl bg-white/5 p-4">
                  <div className="font-semibold text-white">Ödeme</div>
                  <div>Stripe, PayPal & TWINT</div>
                </div>
                <div className="rounded-3xl bg-white/5 p-4 flex items-center gap-3">
                  <CheckCircle size={18} className="text-[#22c55e]" />
                  <span>Profesyonel bir müşteri paneli deneyimi.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
