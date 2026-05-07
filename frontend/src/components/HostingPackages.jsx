import React, { useEffect, useState } from "react";
import { API } from "../api";
import { Check, ShieldCheck, CreditCard, Globe, ArrowRight, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useModals } from "../contexts/ModalContext";

const FALLBACK_PLANS = [
  {
    id: "starter",
    title: "Starter Hosting",
    price: "CHF 17",
    period: "/Monat",
    description: "Kleine Website, schnelle Ladezeiten, SSL und tägliche Backups.",
    features: [
      "10 GB SSD Speicher",
      "99.99% Uptime SLA",
      "SSL + CDN-ready",
      "Twint / Stripe / PayPal Zahlungsoptionen",
      "12 Monate kostenloser Support",
    ],
    accent: "bg-[#0ea5e9]/10 border-[#0ea5e9] text-[#0c74a9]",
  },
  {
    id: "business",
    title: "Business Hosting",
    price: "CHF 49",
    period: "/Monat",
    description: "Professionelles Hosting für Markensites und Webshops mit modernem Support.",
    features: [
      "50 GB NVMe Speicher",
      "Tägliche Backups + Restore",
      "Managed Security & Firewall",
      "Stripe, PayPal & Twint Zahlungen",
      "Persönlicher Kundenbereich",
    ],
    accent: "bg-[#22c55e]/10 border-[#22c55e] text-[#166534]",
    popular: true,
  },
  {
    id: "enterprise",
    title: "Enterprise Hosting",
    price: "CHF 99",
    period: "/Monat",
    description: "Skalierbares Hosting mit SLA, Multi-Domain-Support und dediziertem Kundenmanager.",
    features: [
      "200 GB NVMe Speicher",
      "Premium SLA & Performance",
      "Dedizierter Account Manager",
      "Einrichtung von TWINT & PayPal Premium",
      "Priorisierter 24/7 Support",
    ],
    accent: "bg-[#f97316]/10 border-[#f97316] text-[#9a3412]",
  },
];

export default function HostingPackages() {
  const [plans, setPlans] = useState(FALLBACK_PLANS);
  const [ready, setReady] = useState(false);
  const { openQuote } = useModals();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API}/products`)
      .then((res) => {
        if (!res.ok) throw new Error("no products");
        return res.json();
      })
      .then((data) => {
        if (!data || !Array.isArray(data) || data.length === 0) throw new Error("empty");
        setPlans(
          data
            .filter((item) => item.unitPrice >= 0)
            .map((item) => ({
              id: item.id,
              title: item.name,
              price: `CHF ${Number(item.unitPrice).toFixed(0)}`,
              period: item.unit ? `/${item.unit}` : "/Monat",
              description: item.description || "Professionelles Hosting mit Sicherheits- und Supportservice.",
              features: [
                item.description || "Professionelles Hosting mit Sicherheits- und Supportservice.",
                "Stripe, Twint & PayPal verfügbar",
                "Sichere SSL- und Firewall-Optionen",
                "Verwaltung über den Kundenbereich",
              ],
              accent: "bg-[#1E88E5]/10 border-[#1E88E5] text-[#1E3A8A]",
              popular: item.categoryId ? false : false,
            }))
        );
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  return (
    <section id="hosting" className="py-24 bg-white overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <p className="text-[#E63946] uppercase tracking-[0.3em] font-semibold text-sm mb-3">Hosting Paketleri</p>
          <h2 className="text-[32px] sm:text-[42px] md:text-[52px] font-extrabold text-[#0f172a]">
            Güvenli, hızlı ve ödeme destekli hosting planları.
          </h2>
          <p className="text-[#475569] text-base sm:text-lg mt-4 leading-relaxed">
            Stripe, TWINT ve PayPal ile ödeme desteği gösteren, ayrıca profesyonel müşteri paneliyle yönetilen hosting satış sayfası. Satışa hazır paketler ve premium destek farkı.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.id} className={`rounded-[32px] border p-7 shadow-[0_20px_80px_rgba(15,23,42,0.08)] ${plan.accent}`}>
              <div className="flex items-center justify-between gap-3 mb-6">
                <div>
                  <div className="text-sm uppercase tracking-[0.22em] font-semibold text-[#64748b]">{plan.title}</div>
                  <p className="mt-2 text-sm text-[#475569]">{plan.description}</p>
                </div>
                {plan.popular && <span className="rounded-full bg-[#E63946] px-3 py-1 text-[11px] font-bold text-white uppercase">En çok tercih edilen</span>}
              </div>
              <div className="flex items-end gap-2">
                <div className="text-[42px] font-extrabold text-[#0f172a] leading-none">{plan.price}</div>
                <span className="text-sm text-[#64748b] pb-1">{plan.period}</span>
              </div>
              <div className="mt-6 space-y-4">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check size={18} className="mt-1 text-[#E63946]" />
                    <p className="text-sm text-[#475569] leading-relaxed">{feature}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-col gap-3">
                <button
                  onClick={() => navigate("/account")}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#E63946] px-5 py-3 text-sm font-bold text-white hover:bg-[#c5303d] transition-colors"
                >
                  Paket Seç
                  <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => openQuote()}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#0f172a] px-5 py-3 text-sm font-semibold text-[#0f172a] hover:bg-slate-100 transition-colors"
                >
                  Teklif Al
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 p-6 bg-slate-50">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#0E7490]/10 text-[#0E7490] mb-4">
              <CreditCard size={22} />
            </div>
            <h3 className="text-lg font-bold text-[#0f172a]">Ödeme Seçenekleri</h3>
            <p className="mt-2 text-sm text-[#475569]">Stripe, PayPal ve TWINT ile sorunsuz ödeme akışı ve güvenli fatura altyapısı.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 p-6 bg-slate-50">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#16A34A]/10 text-[#16A34A] mb-4">
              <ShieldCheck size={22} />
            </div>
            <h3 className="text-lg font-bold text-[#0f172a]">Profesyonel Destek</h3>
            <p className="mt-2 text-sm text-[#475569]">12 ay ücretsiz destek, SLA garantisi ve müşteriye özel yönetici paneli.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 p-6 bg-slate-50">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#F59E0B]/10 text-[#F59E0B] mb-4">
              <Globe size={22} />
            </div>
            <h3 className="text-lg font-bold text-[#0f172a]">Hemen Yayın</h3>
            <p className="mt-2 text-sm text-[#475569]">Tüm paketlerde hızlı setup, global CDN ve yüksek performanslı hosting altyapısı.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
