import React, { useEffect, useState } from "react";
import { API } from "../api";
import { Check, ShieldCheck, CreditCard, Globe, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useModals } from "../contexts/ModalContext";

const FALLBACK_PLANS = [
  {
    id: "starter",
    title: "Kurumsal Starter Hosting",
    price: "CHF 24",
    period: "/ay",
    description: "Hızlı kurulum, esnek trafik, SSL ve proaktif altyapı izlemesi.",
    features: [
      "15 GB NVMe depolama",
      "99.99% SLA & sorunsuz çalışma süresi",
      "Ücretsiz SSL ve CDN entegrasyonu",
      "Günlük yedekleme ve restore opsiyonu",
      "Panel üzerinden kolay yönetim",
    ],
    accent: "bg-[#0ea5e9]/10 border-[#0ea5e9] text-[#0c74a9]",
  },
  {
    id: "business",
    title: "Business Hosting",
    price: "CHF 59",
    period: "/ay",
    description: "KOBİ'ler ve kurumsal siteler için güvenli performans ile ölçeklenebilir altyapı.",
    features: [
      "50 GB NVMe depolama",
      "Tüm trafik için otomatik ölçekleme",
      "Web uygulama güvenlik duvarı (WAF)",
      "Twint, Stripe ve PayPal ödeme altyapısı",
      "7/24 premium destek ve SLAs",
    ],
    accent: "bg-[#22c55e]/10 border-[#22c55e] text-[#166534]",
    popular: true,
  },
  {
    id: "enterprise",
    title: "Enterprise Sunucu Paketi",
    price: "CHF 129",
    period: "/ay",
    description: "Şirket ölçeğindeki projeler için özel sunucu performansı ve yönetilen servis.",
    features: [
      "200 GB NVMe depolama",
      "Dedike yönetilen sunucu ve altyapı",
      "Özel IP, çoklu domain ve özel SSL",
      "İleri seviye yedekleme & felaket kurtarma",
      "Öncelikli 24/7 teknik yönetim",
    ],
    accent: "bg-[#f97316]/10 border-[#f97316] text-[#9a3412]",
  },
];

function mapProductToPlan(item) {
  return {
    id: item.id,
    title: item.name,
    price: `CHF ${Number(item.unitPrice).toFixed(0)}`,
    period: item.unit ? `/${item.unit}` : "/ay",
    description: item.description || "Profesyonel hosting ve sunucu hizmetleri.",
    features: [
      item.description || "Profesyonel hosting ve sunucu hizmetleri.",
      "Gelişmiş güvenlik ve otomatik yedekleme",
      "Ödeme seçenekleri: TWINT, Stripe, PayPal",
      "Panel üzerinden esnek paket yönetimi",
    ],
    accent: "bg-[#1E88E5]/10 border-[#1E88E5] text-[#1E3A8A]",
    popular: item.categoryId ? false : false,
  };
}

export default function HostingPackages() {
  const [plans, setPlans] = useState(FALLBACK_PLANS);
  const { openQuote } = useModals();
  const navigate = useNavigate();

  useEffect(() => {
    const loadHostingPlans = async () => {
      try {
        const [categoriesRes, productsRes] = await Promise.all([
          fetch(`${API}/product-categories`),
          fetch(`${API}/products`),
        ]);
        if (!categoriesRes.ok || !productsRes.ok) throw new Error("api");

        const [categories, products] = await Promise.all([categoriesRes.json(), productsRes.json()]);
        const hostingCategory = categories.find((c) => /hosting|wartung|server|infrastruktur/i.test(c.name.toLowerCase()));
        let hostingProducts = [];

        if (hostingCategory) {
          hostingProducts = products.filter((item) => item.categoryId === hostingCategory.id && item.unitPrice >= 0);
        }
        if (hostingProducts.length === 0) {
          hostingProducts = products.filter((item) => /hosting|server|vps|sunucu/i.test(item.name.toLowerCase()) && item.unitPrice >= 0);
        }
        if (hostingProducts.length > 0) {
          setPlans(hostingProducts.map(mapProductToPlan));
        }
      } catch (error) {
        // keep fallback plans
      }
    };
    loadHostingPlans();
  }, []);

  return (
    <section id="hosting" className="py-24 bg-white overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <p className="text-[#E63946] uppercase tracking-[0.3em] font-semibold text-sm mb-3">Hosting Paketleri</p>
          <h2 className="text-[32px] sm:text-[42px] md:text-[52px] font-extrabold text-[#0f172a]">
            Kurumsal hosting ve sunucu paketleri ile altyapıyı tam kontrol edin.
          </h2>
          <p className="text-[#475569] text-base sm:text-lg mt-4 leading-relaxed">
            Performans, güvenlik ve ödeme yönetimini aynı panelde toplayan bir çözüm. Paketler admin panelinde düzenlenebilir, teklif ve faturalandırma süreçleri hızlıca hazırlanır.
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
            <h3 className="text-lg font-bold text-[#0f172a]">Ödeme Esnekliği</h3>
            <p className="mt-2 text-sm text-[#475569]">TWINT, Stripe ve PayPal ile yerel ve uluslararası ödeme akışlarını destekler.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 p-6 bg-slate-50">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#16A34A]/10 text-[#16A34A] mb-4">
              <ShieldCheck size={22} />
            </div>
            <h3 className="text-lg font-bold text-[#0f172a]">Güvenlik ve Uyumluluk</h3>
            <p className="mt-2 text-sm text-[#475569]">ISO uyumlu altyapı, SSL yönetimi ve 7/24 izleme ile kurumsal güvenlik sunar.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 p-6 bg-slate-50">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#F59E0B]/10 text-[#F59E0B] mb-4">
              <Globe size={22} />
            </div>
            <h3 className="text-lg font-bold text-[#0f172a]">Hızlı Yayına Alma</h3>
            <p className="mt-2 text-sm text-[#475569]">Paket seçimi sonrası hızlı devreye alma ve profesyonel altyapı hazırlığı sağlanır.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
