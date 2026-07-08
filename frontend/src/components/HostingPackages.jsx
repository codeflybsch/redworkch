import React, { useMemo, useState } from "react";
import { Check, ArrowRight, Loader2, X, Smartphone, CreditCard, Copy, ShieldCheck, Gavel, Clock, Globe2, TrendingUp, LockKeyhole } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useModals } from "../contexts/ModalContext";
import { motion, AnimatePresence } from "framer-motion";
import * as Slider from "@radix-ui/react-slider";
import { loadStripe } from "@stripe/stripe-js";
import api from "../api";

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
    accent: "bg-gradient-to-br from-blue-400 via-cyan-300 to-blue-100 border border-blue-300 text-slate-900",
    icon: "🚀",
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
    accent: "bg-gradient-to-br from-emerald-400 via-teal-300 to-green-100 border border-emerald-300 text-slate-900",
    icon: "⭐",
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
    accent: "bg-gradient-to-br from-orange-400 via-yellow-300 to-orange-100 border border-orange-300 text-slate-900",
    icon: "👑",
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
    accent: "bg-gradient-to-br from-violet-400 via-purple-300 to-violet-100 border border-violet-300 text-slate-900",
    icon: "⚡",
  },
  {
    id: "vps-business",
    title: "VPS Business",
    price: 20,
    period: "/Monat",
    description: "Stabile VPS-Lösung mit 2 vCPU, 4 GB RAM und hohem I/O für Produktivsysteme.",
    features: ["2 vCPU", "4 GB RAM", "80 GB NVMe", "DDoS Basic", "Premium Support"],
    accent: "bg-gradient-to-br from-pink-400 via-rose-300 to-pink-100 border border-pink-300 text-slate-900",
    icon: "🔥",
    popular: true,
  },
  {
    id: "vps-enterprise",
    title: "VPS Enterprise",
    price: 40,
    period: "/Monat",
    description: "High-End VPS mit 4 vCPU, 8 GB RAM, NVMe SSD und dedizierten Netzwerkressourcen.",
    features: ["4 vCPU", "8 GB RAM", "160 GB NVMe", "Advanced DDoS", "Dedizierte IPs"],
    accent: "bg-gradient-to-br from-indigo-400 via-blue-300 to-indigo-100 border border-indigo-300 text-slate-900",
    icon: "💎",
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
  { question: "Welche Zahlungsarten sind verfügbar?", answer: "Stripe für Karten/Apple Pay/Google Pay und TWINT per Zahlungsreferenz sind integriert. Nach Zahlungseingang kann die WHM-Provisionierung automatisch starten." },
  { question: "Wie funktioniert der VPS-Konfigurator?", answer: "Wählen Sie CPU, RAM, Speicher, Betriebssystem und weitere Optionen. Der Preis aktualisiert sich sofort." },
];

const DOMAIN_AUCTIONS = [
  { domain: "premium-digital.ch", category: "Premium", currentBid: 5000, buyNow: 5049, bids: 18, endsIn: "02:14:33", status: "Live", transferFee: 49, reference: "DOM-062AA4E8" },
  { domain: "basel-web.ch", category: "Lokal", currentBid: 890, buyNow: 1290, bids: 9, endsIn: "05:42:10", status: "Live", transferFee: 49, reference: "DOM-BS890" },
  { domain: "swiss-hosting.ch", category: "Hosting", currentBid: 2400, buyNow: 3200, bids: 27, endsIn: "11:08:45", status: "Live", transferFee: 49, reference: "DOM-SH2400" },
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
  const [loadingCheckout, setLoadingCheckout] = useState(null);
  const [paymentModal, setPaymentModal] = useState(null);
  const [bidModal, setBidModal] = useState(null);
  const [bidAmount, setBidAmount] = useState(0);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState(null);
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

  const handlePaymentMethod = (planId, price) => {
    setSelectedPlanForPayment({ planId, price });
    setPaymentModal(true);
  };

  const handleCheckout = (planId, price) => {
    handlePaymentMethod(planId, price);
  };

  const handleStripeCheckout = async (planId, price) => {
    setLoadingCheckout(planId);
    try {
      const publishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;
      if (!publishableKey) {
        alert("Stripe Public Key fehlt. Bitte .env prüfen oder TWINT verwenden.");
        return;
      }
      const stripe = await loadStripe(publishableKey);
      const response = await api.post("/checkout/create-checkout-session", {
        planId,
        price: Math.round(price * 100),
        planType: hostingSection,
        currency: "chf",
      });

      const { sessionId } = response.data;
      const result = await stripe.redirectToCheckout({ sessionId });

      if (result.error) {
        alert("Fehler: " + result.error.message);
      }
    } catch (error) {
      alert("Checkout fehlgeschlagen: " + (error.response?.data?.detail || error.message));
    } finally {
      setLoadingCheckout(null);
    }
  };

  const handleTwintCheckout = () => {
    const message = `TWINT Zahlung für ${selectedPlanForPayment.planId} / Referenz RW-${String(selectedPlanForPayment.planId).toUpperCase()}-${Date.now().toString().slice(-5)} / CHF ${selectedPlanForPayment.price}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`sms:0766106108?body=${encodedMessage}`);
  };

  const twintReference = selectedPlanForPayment ? `RW-${String(selectedPlanForPayment.planId).toUpperCase()}-${Math.round(selectedPlanForPayment.price * 100)}` : "RW-HOSTING";

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
      className="py-16 sm:py-24 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6">
        <motion.div
          className="grid gap-10 lg:grid-cols-2 items-start"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
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
                <h3 className="text-2xl font-bold">Stripe + TWINT</h3>
                <p className="mt-3 text-sm text-slate-300">Kreditkarte über Stripe oder Schweizer TWINT-Zahlung mit Referenznummer.</p>
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
        </motion.div>

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
                          onClick={() => handleCheckout(plan.id, plan.price)}
                          disabled={loadingCheckout === plan.id}
                          className="w-full rounded-full bg-[#E63946] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#c5303d] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {loadingCheckout === plan.id ? <Loader2 size={16} className="animate-spin" /> : "Jetzt kaufen"}
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
                    {BASE_VPS_PLANS.map((server, index) => (
                      <motion.article
                        key={server.id}
                        className={`rounded-[32px] border p-6 ${server.accent} relative overflow-hidden`}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 * index, duration: 0.6 }}
                        whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                      >
                        <div className="absolute top-4 right-4 text-2xl">{server.icon}</div>
                        <div className="mb-5">
                          <p className="text-sm uppercase tracking-[0.25em] text-slate-600">{server.title}</p>
                          <h4 className="mt-3 text-3xl font-bold text-slate-950">CHF{server.price}{server.period}</h4>
                        </div>
                        <p className="text-slate-700 mb-6">{server.description}</p>
                        <ul className="space-y-3 mb-8 text-slate-800">
                          {server.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-3">
                              <Check size={18} className="mt-1 text-green-600" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <button
                          onClick={() => handlePaymentMethod(server.id, server.price)}
                          disabled={loadingCheckout === server.id}
                          className="w-full rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                        >
                          {loadingCheckout === server.id ? <Loader2 size={16} className="animate-spin" /> : "Jetzt kaufen"}
                        </button>
                      </motion.article>
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
                  onClick={() => handleCheckout("custom-" + hostingSection, configuredTotal)}
                  disabled={loadingCheckout === "custom-" + hostingSection}
                  className="mt-8 w-full rounded-full bg-[#E63946] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white hover:bg-[#c5303d] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loadingCheckout === "custom-" + hostingSection ? <Loader2 size={16} className="animate-spin" /> : "Jetzt kaufen"}
                </button>
              </div>
            </div>
          </div>


        </div>

        <motion.div
          id="domains"
          className="mt-20 rounded-[44px] border border-white/10 bg-black/30 p-6 sm:p-10 shadow-[0_30px_140px_rgba(0,0,0,0.35)]"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.7 }}
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-emerald-300 font-bold"><Gavel size={15} /> Domain Auktionen</span>
              <h3 className="mt-5 text-4xl sm:text-5xl font-extrabold">Premium-Domains live kaufen oder ersteigern</h3>
              <p className="mt-4 max-w-3xl text-slate-300 leading-7">Registrierte Kunden können Auktionen live verfolgen, Gebote abgeben und Domains per Stripe oder TWINT bezahlen. Die Vertragsübernahme wird automatisch als Position berechnet.</p>
            </div>
            <button onClick={() => navigate("/register")} className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-slate-950 hover:bg-slate-100">Kostenlos registrieren <ArrowRight size={16} /></button>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {DOMAIN_AUCTIONS.map((auction) => (
              <article key={auction.domain} className="rounded-[34px] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-black p-6 shadow-2xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{auction.category}</p>
                    <h4 className="mt-3 text-2xl font-extrabold text-white"><Globe2 size={22} className="inline mr-2 text-emerald-300" />{auction.domain}</h4>
                  </div>
                  <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">● {auction.status}</span>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-xs text-slate-400">Aktuelles Gebot</p>
                    <p className="mt-1 text-2xl font-black">CHF {auction.currentBid.toLocaleString("de-CH")}</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-xs text-slate-400">Sofort kaufen</p>
                    <p className="mt-1 text-2xl font-black text-[#ff4d57]">CHF {auction.buyNow.toLocaleString("de-CH")}</p>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between text-sm text-slate-300">
                  <span className="inline-flex items-center gap-2"><Clock size={15} /> {auction.endsIn}</span>
                  <span className="inline-flex items-center gap-2"><TrendingUp size={15} /> {auction.bids} Gebote</span>
                </div>
                <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">Vertragsübernahme pauschal: CHF {auction.transferFee}. Referenz: {auction.reference}</div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button onClick={() => { setBidAmount(auction.currentBid + 50); setBidModal(auction); }} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold hover:bg-white/10">Gebot abgeben</button>
                  <button onClick={() => { setSelectedPlanForPayment({ planId: auction.domain, price: auction.buyNow }); setPaymentModal(true); }} className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-600">Kaufen</button>
                </div>
              </article>
            ))}
          </div>
        </motion.div>

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
                onClick={() => {
                  document.getElementById("hosting")?.scrollIntoView({ behavior: "smooth" });
                  setHostingSection("webhosting");
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#E63946] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white hover:bg-[#c5303d]"
              >
                Jetzt starten
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

      <AnimatePresence>
        {paymentModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPaymentModal(false)}
          >
            <motion.div
              className="relative max-h-[100dvh] w-full max-w-3xl overflow-y-auto rounded-t-[28px] bg-white p-5 shadow-2xl sm:max-h-[92vh] sm:rounded-[34px] sm:p-7"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setPaymentModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
              <div className="mb-7">
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-600"><LockKeyhole size={13} /> Sichere Zahlung</div>
                <h3 className="mt-4 text-3xl font-black text-slate-950">Zahlung bestätigen</h3>
                <p className="text-slate-600 mt-2">{selectedPlanForPayment?.planId} · Gesamtbetrag <b>CHF {selectedPlanForPayment?.price}</b></p>
              </div>
              <div className="rounded-[28px] bg-slate-950 p-5 text-white border border-slate-800 mb-5">
                <div className="flex justify-between text-slate-400"><span>Produkt</span><span>{selectedPlanForPayment?.planId}</span></div>
                <div className="mt-3 flex justify-between text-slate-400"><span>Setup / Vertrag</span><span>CHF 0.00</span></div>
                <div className="mt-4 border-t border-white/10 pt-4 flex justify-between items-end"><span className="font-bold">Gesamt</span><span className="text-3xl font-black text-[#ff4d57]">CHF {selectedPlanForPayment?.price}</span></div>
              </div>
              <div className="grid gap-4">
                <button
                  onClick={() => handleStripeCheckout(selectedPlanForPayment.planId, selectedPlanForPayment.price)}
                  disabled={loadingCheckout === selectedPlanForPayment.planId}
                  className="w-full flex items-center justify-center gap-3 rounded-2xl bg-[#635bff] px-6 py-4 text-white font-extrabold hover:bg-[#5147e8] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {loadingCheckout === selectedPlanForPayment.planId ? <Loader2 size={20} className="animate-spin" /> : <CreditCard size={20} />}
                  Mit Stripe bezahlen
                </button>
                <div className="rounded-[26px] border border-emerald-500/30 bg-gradient-to-br from-emerald-950/90 to-slate-950 p-5 text-white">
                  <div className="flex items-center gap-3 text-lg font-black"><Smartphone size={24} className="text-emerald-300" /> Zahlung via TWINT</div>
                  <p className="mt-4 text-sm text-slate-400">TWINT Nummer</p>
                  <div className="mt-2 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4 font-mono text-2xl font-black tracking-widest">076 610 61 08 <Copy size={18} /></div>
                  <p className="mt-4 text-sm text-slate-400">Referenz / Notiz hinzufügen</p>
                  <div className="mt-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 font-mono text-lg font-black">{twintReference}</div>
                  <div className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">Bitte fügen Sie die Referenz als Notiz zu Ihrer TWINT-Zahlung hinzu, damit die Zahlung automatisch zugeordnet werden kann.</div>
                  <button onClick={handleTwintCheckout} className="mt-4 w-full rounded-2xl bg-emerald-500 px-5 py-3 font-extrabold text-white hover:bg-emerald-600">TWINT Zahlungsnotiz öffnen</button>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-50 p-4 text-sm text-emerald-900"><ShieldCheck size={18} /> Nach Zahlungseingang erhalten Sie Zugangsdaten, Rechnung und Provisionierungsstatus per E-Mail.</div>
              </div>
            </motion.div>
          </motion.div>
        )}
        {bidModal && (
          <motion.div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setBidModal(null)}>
            <motion.div className="relative max-h-[100dvh] w-full max-w-lg overflow-y-auto rounded-t-[28px] border border-white/10 bg-slate-950 p-5 text-white shadow-2xl sm:max-h-[92vh] sm:rounded-[32px] sm:p-7" initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setBidModal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={22} /></button>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300"><Gavel size={14} /> Live Auktion</div>
              <h3 className="mt-4 text-3xl font-black">{bidModal.domain}</h3>
              <p className="mt-2 text-slate-400">Aktuelles Gebot: CHF {bidModal.currentBid.toLocaleString("de-CH")} · {bidModal.bids} Gebote</p>
              <label className="mt-6 block text-sm font-bold text-slate-300">Ihr Gebot in CHF</label>
              <input type="number" min={bidModal.currentBid + 50} value={bidAmount || bidModal.currentBid + 50} onChange={(e) => setBidAmount(Number(e.target.value))} className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-2xl font-black outline-none focus:border-emerald-400" />
              <div className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">Teilnahme erst nach Registrierung/Login. Nach Auktionsgewinn wird automatisch eine Rechnung mit Zahlungsoption Stripe oder TWINT erstellt.</div>
              <button onClick={() => { const price = Math.max(Number(bidAmount || 0), bidModal.currentBid + 50) + bidModal.transferFee; setSelectedPlanForPayment({ planId: `Gebot ${bidModal.domain}`, price }); setBidModal(null); setPaymentModal(true); }} className="mt-5 w-full rounded-2xl bg-emerald-500 px-5 py-4 font-black text-white hover:bg-emerald-600">Gebot bestätigen und Zahlungsoption wählen</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
