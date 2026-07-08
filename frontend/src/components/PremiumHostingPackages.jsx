import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Crown, Rocket, ShieldCheck, Sparkles, Zap } from "lucide-react";

const billingOptions = [
  { key: "monthly", label: "Monatlich", description: "Flexibel" },
  { key: "yearly", label: "Jährlich", description: "Am attraktivsten" },
  { key: "twentyFour", label: "24 Monate", description: "Langfristig" },
  { key: "thirtySix", label: "36 Monate", description: "Maximaler Rabatt" },
];

const hostingPackages = [
  {
    id: "starter",
    name: "Starter Hosting",
    subtitle: "Für kleine Websites und persönliche Projekte",
    description: "Perfekt für Portfolios, Blogs und Einsteiger-Websites mit zuverlässiger Performance.",
    icon: Rocket,
    monthlyPrice: 9.9,
    yearlyPrice: 99,
    twentyFourPrice: 189,
    thirtySixPrice: 239,
    featured: false,
    enabled: true,
    order: 1,
    features: [
      "5 GB NVMe SSD",
      "LiteSpeed + cPanel",
      "Tägliche Backups",
      "SSL-Zertifikat inklusive",
      "24/7 Support",
    ],
    accent: "from-sky-500/20 via-cyan-400/10 to-white/5",
  },
  {
    id: "business",
    name: "Business Hosting",
    subtitle: "Für wachsende Unternehmen und Online-Shops",
    description: "Hochperformante Infrastruktur für anspruchsvolle Webprojekte und E-Commerce-Teams.",
    icon: ShieldCheck,
    monthlyPrice: 19.9,
    yearlyPrice: 199,
    twentyFourPrice: 379,
    thirtySixPrice: 479,
    featured: true,
    enabled: true,
    order: 2,
    features: [
      "25 GB NVMe SSD",
      "Priority-Support",
      "WAF & DDoS-Schutz",
      "Mehrere Domains",
      "Staging-Umgebungen",
    ],
    accent: "from-violet-500/25 via-fuchsia-400/10 to-white/5",
  },
  {
    id: "premium",
    name: "Premium Hosting",
    subtitle: "Für höchste Performance und maximale Sicherheit",
    description: "Unsere Premium-Lösung für anspruchsvolle Marken, SaaS-Plattformen und große Projekte.",
    icon: Crown,
    monthlyPrice: 39.9,
    yearlyPrice: 399,
    twentyFourPrice: 759,
    thirtySixPrice: 959,
    featured: false,
    enabled: true,
    order: 3,
    features: [
      "100 GB NVMe SSD",
      "Dedizierte Ressourcen",
      "Premium SLA",
      "Geo-Load-Balancing",
      "24/7 Lead-Support",
    ],
    accent: "from-amber-500/20 via-orange-400/10 to-white/5",
  },
];

const formatCHF = (value) =>
  new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export default function PremiumHostingPackages() {
  const [billingCycle, setBillingCycle] = useState("yearly");
  const navigate = useNavigate();

  const visiblePackages = useMemo(
    () => hostingPackages.filter((plan) => plan.enabled).sort((a, b) => a.order - b.order),
    []
  );

  const getCycleDetails = (plan) => {
    const cycleMap = {
      monthly: { total: plan.monthlyPrice, months: 1, label: "Monat" },
      yearly: { total: plan.yearlyPrice, months: 12, label: "Jahr" },
      twentyFour: { total: plan.twentyFourPrice, months: 24, label: "24 Monate" },
      thirtySix: { total: plan.thirtySixPrice, months: 36, label: "36 Monate" },
    };

    const selected = cycleMap[billingCycle];
    const monthlyEquivalent = selected.total / selected.months;
    const savings = Math.max(0, Math.round(((plan.monthlyPrice - monthlyEquivalent) / plan.monthlyPrice) * 100));

    return {
      total: selected.total,
      monthlyEquivalent,
      label: selected.label,
      savings,
      totalLabel: `${formatCHF(selected.total)} / ${selected.label}`,
      monthlyLabel: `${formatCHF(monthlyEquivalent)} / Monat`,
    };
  };

  const handleOrder = (plan) => {
    const cycleDetails = getCycleDetails(plan);
    navigate("/order", {
      state: {
        selectedPlan: {
          planName: plan.name,
          billingCycle,
          billingLabel: cycleDetails.label,
          price: cycleDetails.total,
          monthlyEquivalent: cycleDetails.monthlyEquivalent,
        },
      },
    });
  };

  return (
    <section id="hosting" className="relative overflow-hidden bg-slate-950 py-20 text-white sm:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.14),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.18),_transparent_30%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-slate-200">
            <Zap size={14} /> Premium Webhosting-Pakete
          </div>
          <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
            Schweizer Qualität für jede Wachstumsstufe.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            Professionelle Hosting-Tarife mit live anpassbaren Preisen, transparenten Rabatten und erstklassigem Support für anspruchsvolle Projekte.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 rounded-full border border-white/10 bg-white/10 p-2 backdrop-blur">
          {billingOptions.map((option) => {
            const isActive = billingCycle === option.key;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => setBillingCycle(option.key)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive ? "bg-white text-slate-950 shadow-lg" : "text-slate-200 hover:bg-white/10"
                }`}
              >
                <span>{option.label}</span>
                <span className="ml-2 hidden text-xs opacity-70 sm:inline">{option.description}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-300">
          <div className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-2">
            <span className="font-semibold text-emerald-300">Bis zu 40% sparen</span> bei längeren Verträgen
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
            <span className="font-semibold text-white">CHF 0.- Setup</span> auf alle Pakete
          </div>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {visiblePackages.map((plan, index) => {
            const cycleDetails = getCycleDetails(plan);
            const Icon = plan.icon;
            return (
              <motion.article
                key={plan.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.45 }}
                whileHover={{ y: -8, scale: 1.01, transition: { duration: 0.2 } }}
                className={`relative rounded-[32px] border border-white/10 bg-gradient-to-br ${plan.accent} p-6 shadow-2xl backdrop-blur-xl ${
                  plan.featured ? "ring-2 ring-cyan-400/60" : ""
                }`}
              >
                {plan.featured && (
                  <div className="absolute right-4 top-4 rounded-full bg-cyan-400/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200">
                    Empfohlen
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-cyan-200">
                    <Icon size={22} />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{plan.subtitle}</p>
                    <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-7 text-slate-300">{plan.description}</p>

                <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                  <div className="text-4xl font-black text-white">{cycleDetails.monthlyLabel}</div>
                  <div className="mt-1 text-sm text-slate-400">{cycleDetails.totalLabel}</div>
                  {cycleDetails.savings > 0 && (
                    <div className="mt-3 inline-flex rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-300">
                      <Sparkles size={14} className="mr-2 mt-0.5" /> {cycleDetails.savings}% sparen
                    </div>
                  )}
                </div>

                <ul className="mt-6 space-y-3 text-sm text-slate-200">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check size={16} className="mt-0.5 shrink-0 text-cyan-300" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => handleOrder(plan)}
                  className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold uppercase tracking-[0.22em] transition ${
                    plan.featured
                      ? "bg-cyan-400 text-slate-950 hover:bg-cyan-300"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  Jetzt bestellen <ArrowRight size={16} />
                </button>
              </motion.article>
            );
          })}
        </div>

        <div className="mt-10 rounded-[28px] border border-white/10 bg-white/5 p-6 text-sm text-slate-300 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white">Admin-ready für spätere Dashboard-verwaltung</h3>
              <p className="mt-2 max-w-2xl">
                Jedes Paket ist als wiederverwendbare Datenstruktur aufgebaut und kann später mit Namen, Preisen, Features, Icons, Empfehlungen und Aktivstatus aus einem Admin-Panel verwaltet werden.
              </p>
            </div>
            <div className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 font-semibold text-cyan-200">
              Skalierbar · Wartbar · Premium
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
