import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronDown, Server, ShoppingCart } from "lucide-react";
import api from "../api";

const BILLING_OPTIONS = [
  { key: "yearly", label: "1 Jahr", suffix: "/ 1 Jahr", note: "%10 Rabatt" },
  { key: "twentyFour", label: "2 Jahre", suffix: "/ 2 Jahre", note: "%15 Rabatt" },
  { key: "thirtySix", label: "3 Jahre", suffix: "/ 3 Jahre", note: "%20 Rabatt" },
  { key: "monthly", label: "Monatlich", suffix: "/ Monat", note: "Flexibel" },
];

const DEFAULT_GENERAL_FEATURES = [
  "cPanel Kontrollpanel",
  "LiteSpeed Web Server",
  "CloudLinux & CageFS",
  "Wöchentliche Backups",
  "PHP 5.3 - 8.5",
];

const DEFAULT_PACKAGES = [
  {
    id: "starter",
    name: "Beginn",
    description: "Ideal für persönliche Websites und Blogs.",
    yearlyPrice: 313,
    twentyFourPrice: 595,
    thirtySixPrice: 845,
    monthlyPrice: 29,
    tag: "economic",
    tagLabel: "Basis Hosting",
    featured: false,
    enabled: true,
    order: 1,
    features: ["2 GB SSD Disk", "50 GB Traffic", "1 vCPU", "1 GB RAM", "10 E-Mail-Konten", "2 Datenbanken", "Kostenloses SSL", "7/24 Support"],
    generalFeatures: DEFAULT_GENERAL_FEATURES,
  },
  {
    id: "personal",
    name: "Persönlich",
    description: "Für wachsende private Projekte mit mehr Leistung.",
    yearlyPrice: 529,
    twentyFourPrice: 1005,
    thirtySixPrice: 1428,
    monthlyPrice: 49,
    tag: "economic",
    tagLabel: "Basis Hosting",
    featured: false,
    enabled: true,
    order: 2,
    features: ["5 GB SSD Disk", "100 GB Traffic", "1 vCPU", "1 GB RAM", "25 E-Mail-Konten", "5 Datenbanken", "1 Domain", "Kostenloser Site-Umzug", "99.9% Uptime"],
    generalFeatures: DEFAULT_GENERAL_FEATURES,
  },
  {
    id: "standard",
    name: "Standard",
    description: "Für kleine Unternehmen und aktive Websites.",
    yearlyPrice: 853,
    twentyFourPrice: 1621,
    thirtySixPrice: 2303,
    monthlyPrice: 79,
    tag: "economic",
    tagLabel: "Basis Hosting",
    featured: false,
    enabled: true,
    order: 3,
    features: ["10 GB SSD Disk", "250 GB Traffic", "2 vCPU", "2 GB RAM", "50 E-Mail-Konten", "10 Datenbanken", "3 Domains", "LiteSpeed Beschleunigung", "7/24 Support"],
    generalFeatures: DEFAULT_GENERAL_FEATURES,
  },
  {
    id: "plus",
    name: "Plus",
    description: "Für trafficstarke Websites und Shops.",
    yearlyPrice: 1285,
    twentyFourPrice: 2441,
    thirtySixPrice: 3470,
    monthlyPrice: 119,
    tag: "economic",
    tagLabel: "Basis Hosting",
    featured: false,
    enabled: true,
    order: 4,
    features: ["20 GB SSD Disk", "500 GB Traffic", "2 vCPU", "2 GB RAM", "100 E-Mail-Konten", "20 Datenbanken", "5 Domains", "Kostenloses CDN", "Priorisierter Support"],
    generalFeatures: DEFAULT_GENERAL_FEATURES,
  },
  {
    id: "business",
    name: "Business",
    description: "Leistungsstarker Einstieg für Unternehmen.",
    yearlyPrice: 1717,
    twentyFourPrice: 3262,
    thirtySixPrice: 4636,
    monthlyPrice: 159,
    tag: "business",
    tagLabel: "Business Hosting",
    featured: false,
    enabled: true,
    order: 5,
    features: ["30 GB SSD Disk", "Unbegrenzter Traffic", "2 vCPU", "4 GB RAM", "100 E-Mail-Konten", "30 Datenbanken", "10 Domains", "Kostenloses CDN", "Priorität / 7/24 Support"],
    generalFeatures: DEFAULT_GENERAL_FEATURES,
  },
  {
    id: "professional",
    name: "Professionell",
    description: "Ausgewogene Leistung für professionelle Projekte.",
    yearlyPrice: 2473,
    twentyFourPrice: 4699,
    thirtySixPrice: 6677,
    monthlyPrice: 229,
    tag: "business",
    tagLabel: "Business Hosting",
    featured: true,
    enabled: true,
    order: 6,
    features: ["50 GB NVMe Disk", "Unbegrenzter Traffic", "3 vCPU", "6 GB RAM", "250 E-Mail-Konten", "50 Datenbanken", "25 Domains", "Dedicated IP Option", "Priorität / 7/24 Support"],
    generalFeatures: DEFAULT_GENERAL_FEATURES,
  },
  {
    id: "premium",
    name: "Premium",
    description: "Für E-Commerce und stark besuchte Websites.",
    yearlyPrice: 3769,
    twentyFourPrice: 7161,
    thirtySixPrice: 10176,
    monthlyPrice: 349,
    tag: "business",
    tagLabel: "Business Hosting",
    featured: false,
    enabled: true,
    order: 7,
    features: ["100 GB NVMe Disk", "Unbegrenzter Traffic", "4 vCPU", "8 GB RAM", "Unbegrenzte E-Mails", "Unbegrenzte Datenbanken", "50 Domains", "Dedicated IP", "VIP / 7/24 Support"],
    generalFeatures: DEFAULT_GENERAL_FEATURES,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Maximale Performance und Ressourcen.",
    yearlyPrice: 5929,
    twentyFourPrice: 11265,
    thirtySixPrice: 16008,
    monthlyPrice: 549,
    tag: "business",
    tagLabel: "Business Hosting",
    featured: false,
    enabled: true,
    order: 8,
    features: ["Unbegrenzter Speicher", "Unbegrenzter Traffic", "6 vCPU", "16 GB RAM", "Unbegrenzte E-Mails", "Unbegrenzte Datenbanken", "Unbegrenzte Domains", "Dedizierte IP", "VIP 7/24 Support"],
    generalFeatures: DEFAULT_GENERAL_FEATURES,
  },
];

const formatCHF = (value) =>
  new Intl.NumberFormat("de-CH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const monthlyEquivalent = (price, cycle) => {
  const months = { monthly: 1, yearly: 12, twentyFour: 24, thirtySix: 36 }[cycle] || 12;
  return Math.max(1, Math.round(Number(price || 0) / months));
};

export default function PremiumHostingPackages() {
  const [settings, setSettings] = useState({});
  const [activeFilter, setActiveFilter] = useState("all");
  const [billingByPlan, setBillingByPlan] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/site-settings").then((r) => setSettings(r.data || {})).catch(() => {});
  }, []);

  const hostingTabs = settings.hostingTabs?.length ? settings.hostingTabs : [
    { key: "all", label: "Alle Pakete" },
    { key: "economic", label: "Basis Hosting" },
    { key: "business", label: "Business Hosting" },
  ];

  const storedPackages = settings.hostingPackages?.length ? settings.hostingPackages : [];
  const hasProfessionalSchema = storedPackages.length >= 6 || storedPackages.some((plan) => Array.isArray(plan.generalFeatures));
  const hostingPackages = hasProfessionalSchema ? storedPackages : DEFAULT_PACKAGES;

  const visiblePackages = useMemo(
    () => hostingPackages
      .filter((plan) => plan.enabled !== false)
      .filter((plan) => activeFilter === "all" ? true : (plan.tag || "all") === activeFilter)
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0)),
    [hostingPackages, activeFilter]
  );

  const title = settings.hostingTitle || "Professionelle Hosting-Pakete";
  const subtitle = settings.hostingSubtitle || "Schnelle, sichere und skalierbare Hosting-Lösungen für Websites, Unternehmen und E-Commerce-Projekte.";

  const selectedCycle = (plan) => billingByPlan[plan.id] || "yearly";
  const selectedPrice = (plan) => {
    const cycle = selectedCycle(plan);
    return Number(plan[`${cycle}Price`] ?? plan.yearlyPrice ?? plan.monthlyPrice ?? 0);
  };

  const handleOrder = (plan) => {
    const cycle = selectedCycle(plan);
    const option = BILLING_OPTIONS.find((item) => item.key === cycle) || BILLING_OPTIONS[0];
    navigate("/order", {
      state: {
        selectedPlan: {
          planName: plan.name,
          billingCycle: cycle,
          billingLabel: option.label,
          price: selectedPrice(plan),
          monthlyEquivalent: monthlyEquivalent(selectedPrice(plan), cycle),
        },
      },
    });
  };

  return (
    <section id="hosting" className="bg-[#eef3f8] py-16 sm:py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#1d2a55]">{settings.hostingBadge || "Hosting & Server"}</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-[#111a3a] sm:text-5xl">{title}</h2>
          <p className="mt-4 text-sm leading-7 text-[#5f6e86] sm:text-base">{subtitle}</p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {hostingTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveFilter(tab.key)}
              className={`h-11 rounded-lg border px-5 text-sm font-extrabold transition ${
                activeFilter === tab.key
                  ? "border-[#17224d] bg-[#17224d] text-white shadow-lg"
                  : "border-[#d7e0ec] bg-white text-[#17224d] hover:border-[#17224d]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visiblePackages.map((plan) => {
            const cycle = selectedCycle(plan);
            const option = BILLING_OPTIONS.find((item) => item.key === cycle) || BILLING_OPTIONS[0];
            const total = selectedPrice(plan);
            const monthly = monthlyEquivalent(total, cycle);
            const generalFeatures = plan.generalFeatures?.length ? plan.generalFeatures : DEFAULT_GENERAL_FEATURES;

            return (
              <article
                key={plan.id}
                className={`relative flex min-h-[620px] flex-col rounded-xl border bg-white p-5 shadow-[0_16px_40px_rgba(17,26,58,0.08)] transition hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(17,26,58,0.14)] ${
                  plan.featured ? "border-[#08c7df] ring-2 ring-[#08c7df]" : "border-[#d9e2ee]"
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#08c7df] px-4 py-1 text-[11px] font-black text-[#111a3a]">
                    Bestseller
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#dff8ff] text-[#08a8c0]">
                    <Server size={18} />
                  </span>
                  <h3 className="text-lg font-black text-[#111a3a]">{plan.name}</h3>
                </div>

                <p className="mt-4 min-h-[44px] text-sm leading-6 text-[#5f6e86]">{plan.description}</p>

                <div className="mt-4">
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black tracking-tight text-[#111a3a]">{formatCHF(total)}</span>
                    <span className="pb-1 text-sm font-black text-[#111a3a]">CHF</span>
                  </div>
                  <p className="mt-1 text-sm text-[#5f6e86]">{option.suffix}</p>
                  <p className="text-xs font-extrabold text-[#009bb8]">({formatCHF(monthly)} CHF/Monat)</p>
                </div>

                <label className="mt-4 block">
                  <span className="sr-only">Abrechnung wählen</span>
                  <div className="relative">
                    <select
                      value={cycle}
                      onChange={(event) => setBillingByPlan((current) => ({ ...current, [plan.id]: event.target.value }))}
                      className="h-11 w-full appearance-none rounded-lg border border-[#d7e0ec] bg-white px-3 pr-9 text-sm font-semibold text-[#17224d] outline-none transition focus:border-[#08c7df]"
                    >
                      {BILLING_OPTIONS.map((item) => (
                        <option key={item.key} value={item.key}>{item.label} ({item.note})</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#5f6e86]" />
                  </div>
                </label>

                <ul className="mt-5 space-y-0">
                  {(plan.features || []).map((feature) => (
                    <li key={feature} className="flex items-start gap-2 border-b border-[#e8eef5] py-2 text-sm text-[#26344f]">
                      <Check size={15} className="mt-0.5 shrink-0 text-[#18b66a]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-6">
                  <div className="border-t border-[#dbe4ef] pt-4">
                    <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#5f6e86]">Allgemeine Features</p>
                    <ul className="space-y-2">
                      {generalFeatures.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-xs text-[#26344f]">
                          <Check size={13} className="mt-0.5 shrink-0 text-[#18b66a]" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-[18px] font-black">
                    <span className="text-[#ff7a21]">cPanel</span>
                    <span className="text-[#2a70b8]">LiteSpeed</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOrder(plan)}
                    className={`mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-black text-white transition ${
                      plan.featured ? "bg-[#08c7df] hover:bg-[#06b5ca]" : "bg-[#17224d] hover:bg-[#23346f]"
                    }`}
                  >
                    <ShoppingCart size={16} /> In den Warenkorb
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <p className="mt-8 text-center text-sm text-[#5f6e86]">
          Sie sind nicht sicher, welches Paket passt? <button onClick={() => navigate("/account")} className="font-bold text-[#08a8c0] hover:underline">Kontakt aufnehmen</button>, wir beraten Sie gerne.
        </p>
      </div>
    </section>
  );
}
