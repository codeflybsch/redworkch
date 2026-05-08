import React, { useMemo, useState } from "react";
import { Check, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useModals } from "../contexts/ModalContext";
import { motion } from "framer-motion";
import * as Slider from "@radix-ui/react-slider";

const BASE_HOSTING_PLANS = [
  {
    id: "starter",
    title: "Webhosting Starter",
    price: 3,
    period: "/Monat",
    description: "Einfaches Webhosting für kleine Websites mit grundlegenden Funktionen.",
    features: [
      "5 GB NVMe SSD",
      "LiteSpeed & cPanel",
      "Daily Backup",
      "Imunify360 Security",
      "99.99% Uptime SLA",
    ],
    accent: "bg-gradient-to-br from-sky-100 via-slate-50 to-white border border-sky-200 text-slate-950",
  },
  {
    id: "business",
    title: "Webhosting Premium",
    price: 4.90,
    period: "/Monat",
    description: "Erweiterte Hosting-Lösung für Business-Websites mit mehr Speicher und Support.",
    features: [
      "25 GB NVMe SSD",
      "LiteSpeed + cPanel",
      "Tägliche Backups",
      "Imunify360 und Firewall",
      "Kostenloses SSL + CDN ready",
    ],
    accent: "bg-gradient-to-br from-emerald-100 via-slate-50 to-white border border-emerald-200 text-slate-950",
    popular: true,
  },
  {
    id: "enterprise",
    title: "Webhosting Premium XL",
    price: 12.90,
    period: "/Monat",
    description: "Umfassende Hosting-Plattform für große Projekte mit maximaler Leistung.",
    features: [
      "100 GB NVMe SSD",
      "Dedizierter Ressourcenpool",
      "Premium SLA & 24/7 Support",
      "Multi-Domain & cPanel",
      "Anti-DDoS Schutz",
    ],
    accent: "bg-gradient-to-br from-amber-100 via-slate-50 to-white border border-amber-200 text-slate-950",
  },
];

const BASE_VPS_PLANS = [
  {
    id: "vps-start",
    title: "VPS Starter",
    price: 10,
    period: "/Monat",
    description: "Grundlegender VPS mit 1 vCPU, 2 GB RAM und NVMe-Speicher für einfache Projekte.",
    features: ["1 vCPU", "2 GB RAM", "40 GB NVMe", "1 IPv4-Adresse", "Linux/Windows verfügbar"],
    accent: "bg-gradient-to-br from-indigo-100 via-slate-50 to-white border border-indigo-200 text-slate-950",
  },
  {
    id: "vps-business",
    title: "VPS Business",
    price: 20,
    period: "/Monat",
    description: "Stabile VPS-Lösung mit 2 vCPU, 4 GB RAM und hohem I/O für Produktivsysteme.",
    features: ["2 vCPU", "4 GB RAM", "80 GB NVMe", "DDoS Basic", "Premium Support"],
    accent: "bg-gradient-to-br from-fuchsia-100 via-slate-50 to-white border border-fuchsia-200 text-slate-950",
    popular: true,
  },
  {
    id: "vps-enterprise",
    title: "VPS Enterprise",
    price: 40,
    period: "/Monat",
    description: "High-End VPS mit 4 vCPU, 8 GB RAM, NVMe SSD und dedizierten Netzwerkressourcen.",
    features: ["4 vCPU", "8 GB RAM", "160 GB NVMe", "Advanced DDoS", "Dedizierte IPs"],
    accent: "bg-gradient-to-br from-yellow-100 via-slate-50 to-white border border-yellow-200 text-slate-950",
  },
];

const CONFIG_OPTIONS = [
  { key: "cpu", label: "CPU-Cores", unit: "Kerne", step: 1, min: 1, max: 16, price: 8 },
  { key: "ram", label: "RAM", unit: "GB", step: 1, min: 2, max: 64, price: 6 },
  { key: "storage", label: "NVMe SSD", unit: "GB", step: 10, min: 20, max: 500, price: 0.45 },
  { key: "traffic", label: "Traffic", unit: "TB", step: 1, min: 1, max: 20, price: 4 },
  { key: "domains", label: "Domain-Limit", unit: "Domains", step: 1, min: 1, max: 20, price: 1.5 },
  { key: "emails", label: "E-Mail-Konten", unit: "Konten", step: 1, min: 5, max: 100, price: 0.6 },
  { key: "backup", label: "Backup", unit: "Monate", step: 1, min: 0, max: 12, price: 7 },
  { key: "ssl", label: "SSL-Zertifikat", unit: "", step: 1, min: 0, max: 1, price: 5 },
  { key: "litespeed", label: "LiteSpeed", unit: "", step: 1, min: 0, max: 1, price: 9 },
  { key: "extraIp", label: "Extra IPv4", unit: "IPs", step: 1, min: 0, max: 5, price: 4 },
];

const FAQ_LIST = [
  { question: "Was ist im Webhosting enthalten?", answer: "Unsere Webhosting-Pakete umfassen NVMe-SSD, cPanel, SSL, tägliche Backups und Imunify360-Sicherheit." },
  { question: "Kann ich monatlich auf jährlich wechseln?", answer: "Ja, jährliche Abonnements bieten einen zusätzlichen Rabatt von 10%." },
  { question: "Welche Zahlungsarten sind verfügbar?", answer: "Stripe und PayPal sind integriert. Weitere Optionen können vom Backend hinzugefügt werden." },
  { question: "Wie funktioniert der VPS-Konfigurator?", answer: "Wählen Sie CPU, RAM, Speicher, Betriebssystem und weitere Optionen. Der Preis aktualisiert sich sofort." },
];

const TESTIMONIALS = [
  {
    name: "Max Müller",
    role: "E-Commerce Inhaber",
    content: "Seit dem Wechsel zu diesem Hosting läuft mein Online-Shop deutlich schneller. Die Unterstützung ist erstklassig.",
    avatar: "MM",
  },
  {
    name: "Anna Schmidt",
    role: "Webentwicklerin",
    content: "Die VPS-Optionen sind flexibel und leistungsstark. Perfekt für meine Projekte.",
    avatar: "AS",
  },
  {
    name: "Lukas Weber",
    role: "Startup-Gründer",
    content: "Kostengünstig und zuverlässig. Die monatlichen Backups geben mir Sicherheit.",
    avatar: "LW",
  },
];

export default function HostingPackages() {
  const [hostingSection, setHostingSection] = useState("webhosting");
  const [pricingMode, setPricingMode] = useState("monthly");
  const [config, setConfig] = useState({
    cpu: 2,
    ram: 4,
    storage: 80,
    traffic: 2,
    domains: 5,
    emails: 20,
    backup: 1,
    ssl: 1,
    litespeed: 1,
    extraIp: 0,
    os: "Linux",
    controlPanel: "cPanel",
    location: "Frankfurt",
  });
  const { openQuote } = useModals();
  const navigate = useNavigate();

  const configuredTotal = useMemo(() => {
    const add = CONFIG_OPTIONS.reduce((sum, option) => sum + config[option.key] * option.price, 0);
    const base = 12;
    const total = base + add;
    return pricingMode === "yearly" ? Math.round(total * 12 * 0.9) : Math.round(total);
  }, [config, pricingMode]);

  const selectedSummary = useMemo(() => CONFIG_OPTIONS.filter((opt) => config[opt.key] > (opt.min || 0)).map((option) => ({
    label: option.label,
    value: `${config[option.key]} ${option.unit}`.trim(),
  })), [config]);

  return (
    <motion.section
      id="hosting"
      className="py-24 bg-slate-950 text-white overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid gap-10 lg:grid-cols-2 items-end">
          <div className="space-y-6">
            <span className="inline-flex rounded-full bg-[#E63946]/15 px-4 py-2 text-sm uppercase tracking-[0.3em] text-[#E63946] font-semibold">Hosting & Server</span>
            <h2 className="text-[38px] sm:text-[48px] lg:text-[62px] font-extrabold tracking-tight">Modernes Webhosting und VPS-Services für professionelle Anwender.</h2>
            <p className="max-w-2xl text-base leading-8 text-slate-300">Integrierte Webhosting- und VPS-Bereiche mit Premium-Design, dynamischer Konfiguration und deutscher Benutzerführung.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <motion.div
                className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <p className="text-sm uppercase tracking-[0.25em] text-slate-400 mb-2">SLA</p>
                <h3 className="text-2xl font-bold">99.99% Verfügbarkeit</h3>
                <p className="mt-3 text-sm text-slate-300">Monitoring, DDoS-Schutz und 24/7 Support inklusive.</p>
              </motion.div>
              <motion.div
                className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <p className="text-sm uppercase tracking-[0.25em] text-slate-400 mb-2">Zahlung</p>
                <h3 className="text-2xl font-bold">Stripe + PayPal</h3>
                <p className="mt-3 text-sm text-slate-300">Direkte Zahlungslösungen für nationale und internationale Kunden.</p>
              </motion.div>
            </div>
          </div>
          <div className="rounded-[40px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-[0_30px_120px_rgba(15,23,42,0.35)]">
            <div className="flex flex-col gap-4">
              <span className="text-sm uppercase tracking-[0.3em] text-[#E63946] font-semibold">Konfiguration</span>
              <div className="flex flex-wrap gap-3">
                {[{ key: "webhosting", label: "Webhosting" }, { key: "vps", label: "VPS / Server" }].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setHostingSection(item.key)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${hostingSection === item.key ? "bg-[#E63946] text-white" : "bg-white/10 text-slate-100 hover:bg-white/20"}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-900 p-6">
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-400 mb-2">Konfigurierter Preis</p>
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-extrabold">CHF{configuredTotal}</span>
                    <span className="text-sm text-slate-400">{pricingMode === "yearly" ? "/Jahr" : "/Monat"}</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-400">Der Betrag passt sich automatisch an Ihre Auswahl an.</p>
                </div>
                <div className="rounded-3xl bg-slate-900 p-6">
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-400 mb-2">Abrechnung</p>
                  <div className="flex gap-3">
                    {[
                      { key: "monthly", label: "Monatlich" },
                      { key: "yearly", label: "Jährlich" },
                    ].map((option) => (
                      <button
                        key={option.key}
                        onClick={() => setPricingMode(option.key)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${pricingMode === option.key ? "bg-white text-slate-950" : "bg-white/10 text-slate-200 hover:bg-white/20"}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-slate-400">Jahrespläne erhalten 10% Rabatt.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 grid gap-10">
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[40px] bg-white/5 p-8 shadow-[0_30px_120px_rgba(15,23,42,0.3)] border border-white/10">
              {hostingSection === "webhosting" ? (
                <>
                  <div className="flex flex-col gap-4 mb-8">
                    <span className="inline-flex rounded-full bg-[#E63946]/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-[#E63946]">Webhosting-Tarife</span>
                    <h3 className="text-3xl font-extrabold">Premium Webhosting-Pakete</h3>
                    <p className="text-slate-300">Wählen Sie aus hochverfügbaren Hosting-Paketen mit NVMe, LiteSpeed, Imunify360 und täglichen Backups.</p>
                  </div>
                  <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
                    {BASE_HOSTING_PLANS.map((plan) => (
                      <article key={plan.id} className={`rounded-[32px] border p-6 shadow-xl ${plan.accent}`}>
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <p className="text-sm uppercase tracking-[0.28em] text-slate-500">{plan.title}</p>
                            <h4 className="mt-3 text-2xl font-bold text-slate-950">CHF{plan.price}{plan.period}</h4>
                          </div>
                          {plan.popular && <span className="rounded-full bg-[#0f172a] px-3 py-1 text-xs font-semibold uppercase text-white">Beliebt</span>}
                        </div>
                        <p className="text-slate-600 mb-6">{plan.description}</p>
                        <ul className="space-y-3 mb-8">
                          {plan.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-3 text-slate-700">
                              <Check size={18} className="mt-1 text-[#E63946]" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <button
                          onClick={() => openQuote()}
                          className="w-full rounded-full bg-[#E63946] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#c5303d]"
                        >
                          Jetzt anfragen
                        </button>
                      </article>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-4 mb-8">
                    <span className="inline-flex rounded-full bg-[#ffffff1a] px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-300">VPS / Server</span>
                    <h3 className="text-3xl font-extrabold">VPS-Tarife mit hoher Leistung</h3>
                    <p className="text-slate-300">Wählen Sie aus leistungsstarken VPS-Angeboten mit NVMe, DDoS-Schutz und flexiblen Betriebssystem-Optionen.</p>
                  </div>
                  <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
                    {BASE_VPS_PLANS.map((server) => (
                      <article key={server.id} className={`rounded-[32px] border p-6 ${server.accent}`}>
                        <div className="mb-5">
                          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">{server.title}</p>
                          <h4 className="mt-3 text-2xl font-bold text-slate-950">CHF{server.price}{server.period}</h4>
                        </div>
                        <p className="text-slate-600 mb-6">{server.description}</p>
                        <ul className="space-y-3 mb-8 text-slate-700">
                          {server.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-3">
                              <Check size={18} className="mt-1 text-[#E63946]" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <button
                          onClick={() => navigate("/account")}
                          className="w-full rounded-full bg-[#E63946] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white hover:bg-[#c5303c]"
                        >
                          Bestellen
                        </button>
                      </article>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="rounded-[40px] bg-white/5 p-8 border border-white/10 shadow-[0_30px_120px_rgba(15,23,42,0.25)]">
              <span className="inline-flex rounded-full bg-[#E63946]/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-[#E63946]">Konfigurator</span>
              <h3 className="mt-4 text-3xl font-extrabold">Individueller Hosting-Konfigurator</h3>
              <p className="mt-3 text-slate-300">Erstellen Sie Ihre persönliche Lösung mit Live-Preisberechnung.</p>
              <div className="mt-8 space-y-6">
                {CONFIG_OPTIONS.map((option) => (
                  <motion.div
                    key={option.key}
                    className="grid gap-3 sm:grid-cols-[1fr_auto] items-center"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 * CONFIG_OPTIONS.indexOf(option), duration: 0.5 }}
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">{option.label}</p>
                      <p className="text-sm text-slate-400">Preis: CHF{option.price}{option.unit && ` / ${option.unit}`}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Slider.Root
                        className="relative flex items-center select-none touch-none w-[120px] h-5"
                        value={[config[option.key]]}
                        onValueChange={(value) => setConfig((prev) => ({ ...prev, [option.key]: value[0] }))}
                        max={option.max}
                        min={option.min}
                        step={option.step}
                      >
                        <Slider.Track className="bg-slate-700 relative grow rounded-full h-[3px]">
                          <Slider.Range className="absolute bg-[#E63946] rounded-full h-full" />
                        </Slider.Track>
                        <Slider.Thumb className="block w-4 h-4 bg-[#E63946] rounded-full shadow-[0_2px_10px] shadow-blackA7 hover:bg-[#c5303d] focus:outline-none focus:shadow-[0_0_0_5px] focus:shadow-blackA5" />
                      </Slider.Root>
                      <span className="min-w-[60px] text-center text-sm font-semibold">{config[option.key]}{option.unit && ` ${option.unit}`}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-8 rounded-3xl bg-slate-900 p-6 border border-white/10">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Zusammenfassung</p>
                  <p className="text-3xl font-extrabold">CHF{configuredTotal}{pricingMode === "yearly" ? "/Jahr" : "/Monat"}</p>
                </div>
                <div className="mt-5 grid gap-3 text-slate-300">
                  {selectedSummary.map((item) => (
                    <div key={item.label} className="flex items-center justify-between border-b border-white/10 pb-3">
                      <span>{item.label}</span>
                      <span className="font-semibold text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => openQuote()}
                  className="mt-8 w-full rounded-full bg-[#E63946] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white hover:bg-[#c5303d]"
                >
                  Angebot anfordern
                </button>
              </div>
            </div>
          </div>


        </div>

        <div className="mt-20 grid gap-6 lg:grid-cols-2">
          {FAQ_LIST.map((item) => (
            <motion.div
              key={item.question}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 * FAQ_LIST.indexOf(item), duration: 0.5 }}
            >
              <h4 className="text-xl font-semibold text-white">{item.question}</h4>
              <p className="mt-3 text-slate-300">{item.answer}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-20"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <div className="text-center mb-10">
            <span className="inline-flex rounded-full bg-[#E63946]/10 px-4 py-2 text-sm uppercase tracking-[0.3em] text-[#E63946] font-semibold">Kundenstimmen</span>
            <h3 className="mt-4 text-3xl font-extrabold">Was unsere Kunden sagen</h3>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 + 0.2 * index, duration: 0.6 }}
              >
                <p className="text-slate-300 mb-4">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#E63946] flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm text-slate-400">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="mt-20 rounded-[40px] bg-gradient-to-br from-[#0f172a]/90 to-[#111827]/80 p-10 shadow-[0_30px_120px_rgba(15,23,42,0.45)] border border-white/5">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Premium Hosting</p>
              <h3 className="mt-3 text-4xl font-extrabold">Jetzt professionelle Hosting-Lösungen buchen</h3>
              <p className="mt-4 text-slate-300 max-w-2xl">Schaffen Sie eine leistungsstarke Infrastruktur mit modernster Technik, schnellen Ladezeiten und professionellem Service.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => openQuote()}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#E63946] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white hover:bg-[#c5303d]"
              >
                Angebot anfordern
              </button>
              <button
                onClick={() => navigate("/account")}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white hover:bg-white/10"
              >
                Kundenbereich öffnen
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
