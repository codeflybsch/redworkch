import React, { useCallback, useEffect, useState } from "react";
import { Loader2, Save, Plus, Trash2, GripVertical, ArrowUp, ArrowDown, CheckCircle2, AlertTriangle, Eye } from "lucide-react";
import api from "../../api";

const DEFAULT = {
  heroSubtitle: "", heroTagline: "", heroSlides: [],
  badgeEnabled: true, badgeNumber: "12", badgeUnit: "MONATE",
  badgeText1: "Premium", badgeText2: "Support",
  badgeFooter1: "für unsere Kunden", badgeFooter2: "inklusive",
  btnContactSmall: "Sie haben Fragen?", btnContactLarge: "Projekt besprechen",
  btnQuoteSmall: "Planen Sie ein Projekt?", btnQuoteLarge: "Beratung anfragen",
  partners: [], ratingStars: "★★★★★", ratingText: "", stats: [],
  homeMarqueeEnabled: false, homeMarqueeText: "", homeMarqueeSpeed: 34, homeMarqueeItems: [],
  accountMarqueeEnabled: false, accountMarqueeText: "", accountMarqueeSpeed: 38, accountMarqueeItems: [],
  navItems: [],
  // sections
  howWeWorkTitle: "", howWeWorkSubtitle: "", workSteps: [],
  featuresTitle: "", featuresSubtitle: "", features: [],
  whyUsTitle: "", whyUsSubtitle: "", reasons: [],
  servicesTitle: "", servicesSubtitle: "",
  projectsTitle: "", projectsSubtitle: "",
  hostingBadge: "Hosting & Server", hostingTitle: "Hosting- und Serverpakete", hostingSubtitle: "Alles, was Sie brauchen, sauber steuerbar über das Admin-Panel.",
  hostingTabs: [
    { key: "all", label: "Alle Pakete" },
    { key: "economic", label: "Basis Hosting" },
    { key: "business", label: "Business Hosting" },
  ],
  hostingHighlights: ["CHF 0.- Setup", "Transparent anpassbar", "Sofort online bestellbar"],
  hostingPackages: [
    {
      id: "starter",
      name: "Start",
      subtitle: "Privat",
      description: "Ideal für persönliche Websites und kleinere Projekte.",
      monthlyPrice: 9.9,
      yearlyPrice: 99,
      twentyFourPrice: 189,
      thirtySixPrice: 239,
      featured: false,
      enabled: true,
      order: 1,
      tag: "hosting",
      icon: "Rocket",
      accent: "from-sky-500/20 via-cyan-400/10 to-white/5",
      features: ["5 GB NVMe SSD", "LiteSpeed + cPanel", "Tägliche Backups", "SSL-Zertifikat inklusive", "24/7 Support"],
    },
    {
      id: "business",
      name: "Standard",
      subtitle: "Wachsend",
      description: "Für kleine Unternehmen und aktive Webauftritte.",
      monthlyPrice: 19.9,
      yearlyPrice: 199,
      twentyFourPrice: 379,
      thirtySixPrice: 479,
      featured: true,
      enabled: true,
      order: 2,
      tag: "hosting",
      icon: "ShieldCheck",
      accent: "from-violet-500/25 via-fuchsia-400/10 to-white/5",
      features: ["25 GB NVMe SSD", "Priority-Support", "WAF & DDoS-Schutz", "Mehrere Domains", "Staging-Umgebungen"],
    },
    {
      id: "premium",
      name: "Plus",
      subtitle: "Business",
      description: "Für hohe Auslastung und anspruchsvolle Unternehmensprojekte.",
      monthlyPrice: 39.9,
      yearlyPrice: 399,
      twentyFourPrice: 759,
      thirtySixPrice: 959,
      featured: false,
      enabled: true,
      order: 3,
      tag: "business",
      icon: "Crown",
      accent: "from-amber-500/20 via-orange-400/10 to-white/5",
      features: ["100 GB NVMe SSD", "Dedizierte Ressourcen", "Premium SLA", "Geo-Load-Balancing", "24/7 Lead-Support"],
    },
    {
      id: "enterprise",
      name: "Enterprise",
      subtitle: "Maximal",
      description: "Für große Plattformen, Teams und hohe Besucherzahlen.",
      monthlyPrice: 79.9,
      yearlyPrice: 799,
      twentyFourPrice: 1499,
      thirtySixPrice: 2099,
      featured: false,
      enabled: true,
      order: 4,
      tag: "business",
      icon: "Crown",
      accent: "from-slate-500/20 via-blue-400/10 to-white/5",
      features: ["200 GB NVMe SSD", "Dedizierte Ressourcen", "Priorisierter Support", "Mehrere Staging-Instanzen", "Individuelle Betreuung"],
    },
  ],
  promoSectionLabel: "", promoVideoUrl: "", promoVideoTitle: "", promoVideoSubtitle: "",
  // contact
  contactTitle: "", contactSubtitle: "", contactIntro: "",
  contactPhone: "", contactPhoneHours: "",
  contactEmail: "", contactEmailNote: "",
  contactWhatsapp: "", contactAddress: "", contactMapUrl: "",
  // faq
  faqTitle: "", faqSubtitle: "",
  // footer
  footerAbout: "", footerAddress: "", footerPhone: "", footerEmail: "",
  footerLinks: [], footerCopyright: "",
  footerSocial: { facebook: "", instagram: "", linkedin: "", twitter: "", youtube: "" },
};

const Field = ({ label, hint, children }) => (
  <label className="block">
    <span className="block text-xs font-bold uppercase tracking-wider text-[#64748b] mb-1.5">{label}</span>
    {children}
    {hint && <span className="block text-[11px] text-[#94a3b8] mt-1">{hint}</span>}
  </label>
);

const inpCls = "w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-[#1E88E5] focus:outline-none text-sm bg-white text-[#0f172a]";
const Input = (props) => <input {...props} className={`${inpCls} ${props.className || ""}`} />;
const TextArea = (props) => <textarea {...props} className={`${inpCls} resize-y ${props.className || ""}`} />;

const TABS = [
  { id: "hero", label: "Hero & Slides" },
  { id: "badge", label: "Badge" },
  { id: "buttons", label: "Buttons" },
  { id: "marquee", label: "Lauftext" },
  { id: "nav", label: "Navigation" },
  { id: "partners", label: "Partner / Bewertung" },
  { id: "stats", label: "Statistiken" },
  { id: "sections", label: "Bereiche" },
  { id: "faq", label: "FAQ-Header" },
  { id: "contact", label: "📞 Kontakt" },
  { id: "footer", label: "Footer" },
];

export default function SiteSettings() {
  const [data, setData] = useState(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [tab, setTab] = useState("hero");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/site-settings");
      setData({ ...DEFAULT, ...r.data, footerSocial: { ...DEFAULT.footerSocial, ...(r.data.footerSocial || {}) } });
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const update = (k, v) => setData((d) => ({ ...d, [k]: v }));
  const updNested = (k, sub, v) => setData((d) => ({ ...d, [k]: { ...(d[k] || {}), [sub]: v } }));

  const save = async () => {
    setSaving(true); setFeedback(null);
    try {
      await api.put("/admin/site-settings", data);
      setFeedback({ type: "ok", text: "Gespeichert. Lade die Startseite neu (F5), um die Änderungen zu sehen." });
    } catch (e) {
      setFeedback({ type: "err", text: e?.response?.data?.detail || e.message || "Fehler beim Speichern" });
    } finally { setSaving(false); setTimeout(() => setFeedback(null), 6000); }
  };

  const moveItem = (arr, from, to) => {
    if (to < 0 || to >= arr.length) return arr;
    const next = [...arr]; const [m] = next.splice(from, 1); next.splice(to, 0, m); return next;
  };

  // CRUD generic
  const arr = (key) => data[key] || [];
  const setArr = (key, fn) => update(key, fn(arr(key)));
  const itemUpdate = (key, i, patch) => setArr(key, (a) => a.map((x, idx) => idx === i ? (typeof x === "object" ? { ...x, ...patch } : patch.value ?? x) : x));
  const itemAdd = (key, val) => setArr(key, (a) => [...a, val]);
  const itemRemove = (key, i) => setArr(key, (a) => a.filter((_, idx) => idx !== i));
  const itemMove = (key, i, dir) => setArr(key, (a) => moveItem(a, i, i + dir));

  if (loading) return <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div data-testid="site-settings-page">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a]">Website-Inhalte</h1>
          <p className="text-[#64748b] mt-1 text-sm">Hier kannst du <b>jeden Bereich</b> der Website ändern: Hero, Sektionen, Kontakt, Footer.</p>
        </div>
        <div className="flex gap-2">
          <a href="/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0f172a] font-bold text-sm transition">
            <Eye size={15} /> Vorschau
          </a>
          <button onClick={save} disabled={saving} data-testid="save-settings-button" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#E63946] hover:bg-[#c5303d] disabled:opacity-50 text-white font-bold text-sm transition">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? "Speichern..." : "Speichern"}
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`mt-4 flex items-start gap-2 text-sm rounded-lg p-3 ${feedback.type === "ok" ? "bg-emerald-50 border border-emerald-200 text-emerald-800" : "bg-red-50 border border-red-200 text-red-800"}`}>
          {feedback.type === "ok" ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> : <AlertTriangle size={16} className="mt-0.5 shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}

      <div className="mt-6 flex gap-2 flex-wrap">
        {TABS.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)} data-testid={`tab-${t.id}`} className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${tab === t.id ? "bg-[#0f172a] text-white" : "bg-slate-100 text-[#0f172a] hover:bg-slate-200"}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-card p-4 sm:p-6 mt-4 space-y-5">
        {tab === "hero" && (
          <>
            <Field label="Hero-Untertitel" hint="<y>...</y> = gelb. Enter für neue Zeile."><TextArea rows={4} value={data.heroSubtitle} onChange={(e) => update("heroSubtitle", e.target.value)} data-testid="hero-subtitle-input" /></Field>
            <Field label="Hero-Tagline" hint="Erscheint in Gelb unter dem Untertitel."><Input value={data.heroTagline} onChange={(e) => update("heroTagline", e.target.value)} data-testid="hero-tagline-input" /></Field>
            <ArrayEditor label={`Hero-Slides (${arr("heroSlides").length}) – wechseln alle 3,5 Sek.`} items={arr("heroSlides")} onAdd={() => itemAdd("heroSlides", { highlight: "Neu", word: "Webauftritt" })} onRemove={(i) => itemRemove("heroSlides", i)} onMove={(i, d) => itemMove("heroSlides", i, d)} render={(it, i) => (
              <>
                <Input placeholder="Highlight (blau)" value={it.highlight} onChange={(e) => itemUpdate("heroSlides", i, { highlight: e.target.value })} />
                <Input placeholder="Wort (weiß)" value={it.word} onChange={(e) => itemUpdate("heroSlides", i, { word: e.target.value })} />
              </>
            )} />
          </>
        )}

        {tab === "badge" && (
          <>
            <label className="flex items-center gap-3 select-none">
              <input type="checkbox" checked={data.badgeEnabled} onChange={(e) => update("badgeEnabled", e.target.checked)} data-testid="badge-enabled" className="w-4 h-4 accent-[#E63946]" />
              <span className="text-sm font-semibold text-[#0f172a]">Badge anzeigen</span>
            </label>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Zahl"><Input value={data.badgeNumber} onChange={(e) => update("badgeNumber", e.target.value)} /></Field>
              <Field label="Einheit (z.B. MONATE)"><Input value={data.badgeUnit} onChange={(e) => update("badgeUnit", e.target.value)} /></Field>
              <Field label="Text Zeile 1"><Input value={data.badgeText1} onChange={(e) => update("badgeText1", e.target.value)} /></Field>
              <Field label="Text Zeile 2 (gelb)"><Input value={data.badgeText2} onChange={(e) => update("badgeText2", e.target.value)} /></Field>
              <Field label="Untertext 1"><Input value={data.badgeFooter1} onChange={(e) => update("badgeFooter1", e.target.value)} /></Field>
              <Field label="Untertext 2 (fett)"><Input value={data.badgeFooter2} onChange={(e) => update("badgeFooter2", e.target.value)} /></Field>
            </div>
          </>
        )}

        {tab === "buttons" && (
          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-[#E63946]">Roter Button (Kontakt)</p>
              <Field label="Klein (oben)"><Input value={data.btnContactSmall} onChange={(e) => update("btnContactSmall", e.target.value)} /></Field>
              <Field label="Groß (unten)"><Input value={data.btnContactLarge} onChange={(e) => update("btnContactLarge", e.target.value)} /></Field>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-[#1E88E5]">Blauer Button (Angebot)</p>
              <Field label="Klein (oben)"><Input value={data.btnQuoteSmall} onChange={(e) => update("btnQuoteSmall", e.target.value)} /></Field>
              <Field label="Groß (unten)"><Input value={data.btnQuoteLarge} onChange={(e) => update("btnQuoteLarge", e.target.value)} /></Field>
            </div>
          </div>
        )}

        {tab === "marquee" && (
          <div className="grid lg:grid-cols-2 gap-5">
            <Section title="Startseite">
              <label className="flex items-center gap-3 select-none">
                <input type="checkbox" checked={!!data.homeMarqueeEnabled} onChange={(e) => update("homeMarqueeEnabled", e.target.checked)} className="w-4 h-4 accent-[#E63946]" />
                <span className="text-sm font-semibold text-[#0f172a]">Lauftext auf der Startseite anzeigen</span>
              </label>
              <Field label="Geschwindigkeit" hint="Sekunden pro Durchlauf. Größer = langsamer. Empfehlung: 30-45.">
                <Input type="number" min="10" max="120" value={data.homeMarqueeSpeed || 34} onChange={(e) => update("homeMarqueeSpeed", Number(e.target.value))} />
              </Field>
              <Field label="Fallback-Text" hint="Wird genutzt, wenn keine einzelnen Lauftext-Einträge angelegt sind.">
                <TextArea rows={2} value={data.homeMarqueeText || ""} onChange={(e) => update("homeMarqueeText", e.target.value)} placeholder="Aktuelle Aktion, wichtige Mitteilung oder Hinweis..." />
              </Field>
              <ArrayEditor
                label={`Lauftext-Einträge (${arr("homeMarqueeItems").length})`}
                items={arr("homeMarqueeItems")}
                onAdd={() => itemAdd("homeMarqueeItems", { text: "Neue Mitteilung", image: "", href: "" })}
                onRemove={(i) => itemRemove("homeMarqueeItems", i)}
                onMove={(i, d) => itemMove("homeMarqueeItems", i, d)}
                render={(it, i) => (
                  <>
                    <Input placeholder="Text" value={it.text || ""} onChange={(e) => itemUpdate("homeMarqueeItems", i, { text: e.target.value })} />
                    <Input placeholder="Bild-URL optional" value={it.image || ""} onChange={(e) => itemUpdate("homeMarqueeItems", i, { image: e.target.value })} />
                    <Input placeholder="Link optional" value={it.href || ""} onChange={(e) => itemUpdate("homeMarqueeItems", i, { href: e.target.value })} className="sm:col-span-2" />
                  </>
                )}
              />
            </Section>
            <Section title="Mitgliedschaft / Kundenpanel">
              <label className="flex items-center gap-3 select-none">
                <input type="checkbox" checked={!!data.accountMarqueeEnabled} onChange={(e) => update("accountMarqueeEnabled", e.target.checked)} className="w-4 h-4 accent-[#E63946]" />
                <span className="text-sm font-semibold text-[#0f172a]">Lauftext im Kundenpanel anzeigen</span>
              </label>
              <Field label="Geschwindigkeit" hint="Sekunden pro Durchlauf. Größer = langsamer. Empfehlung: 34-50.">
                <Input type="number" min="10" max="120" value={data.accountMarqueeSpeed || 38} onChange={(e) => update("accountMarqueeSpeed", Number(e.target.value))} />
              </Field>
              <Field label="Fallback-Text" hint="Wird genutzt, wenn keine einzelnen Lauftext-Einträge angelegt sind.">
                <TextArea rows={2} value={data.accountMarqueeText || ""} onChange={(e) => update("accountMarqueeText", e.target.value)} placeholder="Wartungsfenster, Zahlungsinfo oder Kundenhinweis..." />
              </Field>
              <ArrayEditor
                label={`Lauftext-Einträge (${arr("accountMarqueeItems").length})`}
                items={arr("accountMarqueeItems")}
                onAdd={() => itemAdd("accountMarqueeItems", { text: "Neue Kundeninfo", image: "", href: "" })}
                onRemove={(i) => itemRemove("accountMarqueeItems", i)}
                onMove={(i, d) => itemMove("accountMarqueeItems", i, d)}
                render={(it, i) => (
                  <>
                    <Input placeholder="Text" value={it.text || ""} onChange={(e) => itemUpdate("accountMarqueeItems", i, { text: e.target.value })} />
                    <Input placeholder="Bild-URL optional" value={it.image || ""} onChange={(e) => itemUpdate("accountMarqueeItems", i, { image: e.target.value })} />
                    <Input placeholder="Link optional" value={it.href || ""} onChange={(e) => itemUpdate("accountMarqueeItems", i, { href: e.target.value })} className="sm:col-span-2" />
                  </>
                )}
              />
            </Section>
          </div>
        )}

        {tab === "nav" && (
          <ArrayEditor label={`Navigation (${arr("navItems").length})`} items={arr("navItems")} onAdd={() => itemAdd("navItems", { label: "neu", href: "#" })} onRemove={(i) => itemRemove("navItems", i)} onMove={(i, d) => itemMove("navItems", i, d)} render={(it, i) => (
            <>
              <Input placeholder="Label (z.B. start)" value={it.label} onChange={(e) => itemUpdate("navItems", i, { label: e.target.value })} />
              <Input placeholder="Anker (z.B. #top)" value={it.href} onChange={(e) => itemUpdate("navItems", i, { href: e.target.value })} />
            </>
          )} />
        )}

        {tab === "partners" && (
          <>
            <ArrayEditor label={`Partner (${arr("partners").length})`} items={arr("partners")} onAdd={() => itemAdd("partners", "NEUER PARTNER")} onRemove={(i) => itemRemove("partners", i)} onMove={(i, d) => itemMove("partners", i, d)} render={(it, i) => (
              <Input value={it} onChange={(e) => itemUpdate("partners", i, { value: e.target.value })} />
            )} />
            <div className="border-t border-slate-200 pt-4 grid md:grid-cols-2 gap-4">
              <Field label="Sterne"><Input value={data.ratingStars} onChange={(e) => update("ratingStars", e.target.value)} /></Field>
              <Field label="Bewertungstext" hint="<b>...</b> = fett"><Input value={data.ratingText} onChange={(e) => update("ratingText", e.target.value)} /></Field>
            </div>
          </>
        )}

        {tab === "stats" && (
          <ArrayEditor label={`Statistiken (${arr("stats").length})`} items={arr("stats")} onAdd={() => itemAdd("stats", { number: "100", suffix: "+", label: "Neu" })} onRemove={(i) => itemRemove("stats", i)} onMove={(i, d) => itemMove("stats", i, d)} render={(it, i) => (
            <>
              <Input placeholder="Zahl" value={it.number} onChange={(e) => itemUpdate("stats", i, { number: e.target.value })} />
              <Input placeholder="+" value={it.suffix} onChange={(e) => itemUpdate("stats", i, { suffix: e.target.value })} />
              <Input placeholder="Label" value={it.label} onChange={(e) => itemUpdate("stats", i, { label: e.target.value })} />
            </>
          )} />
        )}

        {tab === "sections" && (
          <div className="space-y-6">
            <Section title="Wie wir arbeiten">
              <Field label="Titel"><Input value={data.howWeWorkTitle} onChange={(e) => update("howWeWorkTitle", e.target.value)} /></Field>
              <Field label="Untertitel"><Input value={data.howWeWorkSubtitle} onChange={(e) => update("howWeWorkSubtitle", e.target.value)} /></Field>
            </Section>
            <Section title="Leistungen">
              <Field label="Titel"><Input value={data.servicesTitle} onChange={(e) => update("servicesTitle", e.target.value)} /></Field>
              <Field label="Untertitel"><Input value={data.servicesSubtitle} onChange={(e) => update("servicesSubtitle", e.target.value)} /></Field>
            </Section>
            <Section title="Stärken / Features">
              <Field label="Titel"><Input value={data.featuresTitle} onChange={(e) => update("featuresTitle", e.target.value)} /></Field>
              <Field label="Untertitel"><Input value={data.featuresSubtitle} onChange={(e) => update("featuresSubtitle", e.target.value)} /></Field>
            </Section>
            <Section title="Referenzprojekte">
              <Field label="Titel"><Input value={data.projectsTitle} onChange={(e) => update("projectsTitle", e.target.value)} /></Field>
              <Field label="Untertitel"><Input value={data.projectsSubtitle} onChange={(e) => update("projectsSubtitle", e.target.value)} /></Field>
            </Section>
            <Section title="Warum wir">
              <Field label="Titel"><Input value={data.whyUsTitle} onChange={(e) => update("whyUsTitle", e.target.value)} /></Field>
              <Field label="Untertitel"><Input value={data.whyUsSubtitle} onChange={(e) => update("whyUsSubtitle", e.target.value)} /></Field>
            </Section>
            <Section title="Promo-Video">
              <Field label="Sektion-Label"><Input value={data.promoSectionLabel} onChange={(e) => update("promoSectionLabel", e.target.value)} /></Field>
              <Field label="Video URL (YouTube/Vimeo Embed)"><Input value={data.promoVideoUrl} onChange={(e) => update("promoVideoUrl", e.target.value)} placeholder="https://www.youtube.com/embed/XXXX" /></Field>
              <Field label="Titel"><Input value={data.promoVideoTitle} onChange={(e) => update("promoVideoTitle", e.target.value)} /></Field>
              <Field label="Untertitel"><Input value={data.promoVideoSubtitle} onChange={(e) => update("promoVideoSubtitle", e.target.value)} /></Field>
            </Section>
          </div>
        )}

        {tab === "hosting" && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Badge / Etikett"><Input value={data.hostingBadge || ""} onChange={(e) => update("hostingBadge", e.target.value)} placeholder="Hosting & Server" /></Field>
              <Field label="Titel"><Input value={data.hostingTitle || ""} onChange={(e) => update("hostingTitle", e.target.value)} placeholder="Hosting- und Serverpakete" /></Field>
            </div>
            <Field label="Untertitel"><TextArea rows={3} value={data.hostingSubtitle || ""} onChange={(e) => update("hostingSubtitle", e.target.value)} placeholder="Alles, was Sie brauchen, sauber steuerbar über das Admin-Panel." /></Field>

            <ArrayEditor
              label={`Filter / Tabs (${arr("hostingTabs").length})`}
              items={arr("hostingTabs")}
              onAdd={() => itemAdd("hostingTabs", { key: "new", label: "Neuer Tab" })}
              onRemove={(i) => itemRemove("hostingTabs", i)}
              onMove={(i, d) => itemMove("hostingTabs", i, d)}
              render={(it, i) => (
                <>
                  <Input placeholder="Key" value={it.key || ""} onChange={(e) => itemUpdate("hostingTabs", i, { key: e.target.value })} />
                  <Input placeholder="Label" value={it.label || ""} onChange={(e) => itemUpdate("hostingTabs", i, { label: e.target.value })} />
                </>
              )}
            />

            <ArrayEditor
              label={`Highlights (${arr("hostingHighlights").length})`}
              items={arr("hostingHighlights")}
              onAdd={() => itemAdd("hostingHighlights", "Neuer Vorteil")}
              onRemove={(i) => itemRemove("hostingHighlights", i)}
              onMove={(i, d) => itemMove("hostingHighlights", i, d)}
              render={(it, i) => (
                <Input value={it} onChange={(e) => itemUpdate("hostingHighlights", i, { value: e.target.value })} />
              )}
            />

            <ArrayEditor
              label={`Hosting-Pakete (${arr("hostingPackages").length})`}
              items={arr("hostingPackages")}
              onAdd={() => itemAdd("hostingPackages", {
                id: `pkg-${Date.now()}`,
                name: "Neues Paket",
                subtitle: "Kurzbeschreibung",
                description: "Paketbeschreibung",
                monthlyPrice: 0,
                yearlyPrice: 0,
                twentyFourPrice: 0,
                thirtySixPrice: 0,
                featured: false,
                enabled: true,
                order: 0,
                tag: "economic",
                tagLabel: "Basis Hosting",
                icon: "Server",
                accent: "",
                features: ["10 GB SSD Disk", "250 GB Traffic", "2 vCPU", "2 GB RAM"],
                generalFeatures: ["cPanel Kontrollpanel", "LiteSpeed Web Server", "CloudLinux & CageFS", "PHP 5.3 - 8.5"],
              })}
              onRemove={(i) => itemRemove("hostingPackages", i)}
              onMove={(i, d) => itemMove("hostingPackages", i, d)}
              render={(it, i) => (
                <>
                  <Field label="Paket-ID"><Input placeholder="starter" value={it.id || ""} onChange={(e) => itemUpdate("hostingPackages", i, { id: e.target.value })} /></Field>
                  <Field label="Paketname"><Input placeholder="Standard" value={it.name || ""} onChange={(e) => itemUpdate("hostingPackages", i, { name: e.target.value })} /></Field>
                  <Field label="Kategorie-Key"><Input placeholder="economic oder business" value={it.tag || ""} onChange={(e) => itemUpdate("hostingPackages", i, { tag: e.target.value })} /></Field>
                  <Field label="Kategorie-Label"><Input placeholder="Basis Hosting" value={it.tagLabel || it.subtitle || ""} onChange={(e) => itemUpdate("hostingPackages", i, { tagLabel: e.target.value, subtitle: e.target.value })} /></Field>
                  <Field label="Monatlich CHF"><Input type="number" step="1" value={it.monthlyPrice ?? 0} onChange={(e) => itemUpdate("hostingPackages", i, { monthlyPrice: parseFloat(e.target.value) || 0 })} /></Field>
                  <Field label="1 Jahr CHF"><Input type="number" step="1" value={it.yearlyPrice ?? 0} onChange={(e) => itemUpdate("hostingPackages", i, { yearlyPrice: parseFloat(e.target.value) || 0 })} /></Field>
                  <Field label="2 Jahre CHF"><Input type="number" step="1" value={it.twentyFourPrice ?? 0} onChange={(e) => itemUpdate("hostingPackages", i, { twentyFourPrice: parseFloat(e.target.value) || 0 })} /></Field>
                  <Field label="3 Jahre CHF"><Input type="number" step="1" value={it.thirtySixPrice ?? 0} onChange={(e) => itemUpdate("hostingPackages", i, { thirtySixPrice: parseFloat(e.target.value) || 0 })} /></Field>
                  <Field label="Reihenfolge"><Input type="number" value={it.order ?? 0} onChange={(e) => itemUpdate("hostingPackages", i, { order: parseInt(e.target.value || "0", 10) })} /></Field>
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#0f172a]">
                    <input type="checkbox" checked={!!it.featured} onChange={(e) => itemUpdate("hostingPackages", i, { featured: e.target.checked })} />
                    Als Bestseller markieren
                  </label>
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#0f172a]">
                    <input type="checkbox" checked={it.enabled !== false} onChange={(e) => itemUpdate("hostingPackages", i, { enabled: e.target.checked })} />
                    Aktiv
                  </label>
                  <div className="sm:col-span-2">
                    <span className="block text-xs font-bold uppercase tracking-wider text-[#64748b] mb-1.5">Paket-Features</span>
                    <TextArea
                      rows={8}
                      placeholder={"10 GB SSD Disk\n250 GB Traffic\n2 vCPU\n2 GB RAM\n50 E-Mail-Konten"}
                      value={(it.features || []).join("\n")}
                      onChange={(e) => itemUpdate("hostingPackages", i, {
                        features: e.target.value.split("\n").map((line) => line.trim()).filter(Boolean),
                      })}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <span className="block text-xs font-bold uppercase tracking-wider text-[#64748b] mb-1.5">Allgemeine Features</span>
                    <TextArea
                      rows={5}
                      placeholder={"cPanel Kontrollpanel\nLiteSpeed Web Server\nCloudLinux & CageFS\nPHP 5.3 - 8.5"}
                      value={(it.generalFeatures || []).join("\n")}
                      onChange={(e) => itemUpdate("hostingPackages", i, {
                        generalFeatures: e.target.value.split("\n").map((line) => line.trim()).filter(Boolean),
                      })}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <span className="block text-xs font-bold uppercase tracking-wider text-[#64748b] mb-1.5">Beschreibung</span>
                    <TextArea
                      rows={3}
                      placeholder="Paketbeschreibung"
                      value={it.description || ""}
                      onChange={(e) => itemUpdate("hostingPackages", i, { description: e.target.value })}
                    />
                  </div>
                </>
              )}
            />
          </div>
        )}

        {tab === "faq" && (
          <Section title="FAQ Bereich-Header">
            <Field label="Titel"><Input value={data.faqTitle} onChange={(e) => update("faqTitle", e.target.value)} data-testid="faq-title-input" /></Field>
            <Field label="Untertitel"><Input value={data.faqSubtitle} onChange={(e) => update("faqSubtitle", e.target.value)} /></Field>
            <p className="text-xs text-[#64748b]">FAQ-Inhalte werden separat unter <b>Inhalte → FAQ</b> verwaltet.</p>
          </Section>
        )}

        {tab === "contact" && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
              💡 Diese Daten erscheinen im Kontakt-Bereich der Startseite.
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Titel (z.B. Kontakt)"><Input value={data.contactTitle} onChange={(e) => update("contactTitle", e.target.value)} data-testid="contact-title-input" /></Field>
              <Field label="Untertitel"><Input value={data.contactSubtitle} onChange={(e) => update("contactSubtitle", e.target.value)} /></Field>
            </div>
            <Field label="Einleitungstext"><TextArea rows={3} value={data.contactIntro} onChange={(e) => update("contactIntro", e.target.value)} /></Field>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="📞 Telefon"><Input value={data.contactPhone} onChange={(e) => update("contactPhone", e.target.value)} data-testid="contact-phone-input" placeholder="+41 44 000 00 00" /></Field>
              <Field label="Telefon-Zeiten"><Input value={data.contactPhoneHours} onChange={(e) => update("contactPhoneHours", e.target.value)} placeholder="Mo–Fr 8–18 Uhr" /></Field>
              <Field label="✉️ E-Mail"><Input value={data.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} data-testid="contact-email-input" placeholder="info@firma.ch" /></Field>
              <Field label="E-Mail-Hinweis"><Input value={data.contactEmailNote} onChange={(e) => update("contactEmailNote", e.target.value)} placeholder="Antwort innert 24 Stunden" /></Field>
              <Field label="💬 WhatsApp"><Input value={data.contactWhatsapp} onChange={(e) => update("contactWhatsapp", e.target.value)} data-testid="contact-whatsapp-input" placeholder="+41 79 000 00 00" /></Field>
              <Field label="📍 Adresse"><Input value={data.contactAddress} onChange={(e) => update("contactAddress", e.target.value)} data-testid="contact-address-input" placeholder="Bahnhofstrasse 1, 8001 Zürich" /></Field>
            </div>
            <Field label="🗺️ Karten-iframe URL" hint="OpenStreetMap embed-URL oder Google-Maps embed-URL.">
              <TextArea rows={3} value={data.contactMapUrl} onChange={(e) => update("contactMapUrl", e.target.value)} placeholder="https://www.openstreetmap.org/export/embed.html?bbox=..." />
            </Field>
          </div>
        )}

        {tab === "footer" && (
          <div className="space-y-4">
            <Field label="Über-Text"><TextArea rows={3} value={data.footerAbout} onChange={(e) => update("footerAbout", e.target.value)} /></Field>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Adresse"><Input value={data.footerAddress} onChange={(e) => update("footerAddress", e.target.value)} /></Field>
              <Field label="Telefon"><Input value={data.footerPhone} onChange={(e) => update("footerPhone", e.target.value)} /></Field>
              <Field label="E-Mail"><Input value={data.footerEmail} onChange={(e) => update("footerEmail", e.target.value)} /></Field>
              <Field label="Copyright-Text"><Input value={data.footerCopyright} onChange={(e) => update("footerCopyright", e.target.value)} /></Field>
            </div>
            <Section title="Social Media (URLs)">
              <div className="grid md:grid-cols-2 gap-3">
                <Field label="Facebook"><Input value={data.footerSocial.facebook || ""} onChange={(e) => updNested("footerSocial", "facebook", e.target.value)} /></Field>
                <Field label="Instagram"><Input value={data.footerSocial.instagram || ""} onChange={(e) => updNested("footerSocial", "instagram", e.target.value)} /></Field>
                <Field label="LinkedIn"><Input value={data.footerSocial.linkedin || ""} onChange={(e) => updNested("footerSocial", "linkedin", e.target.value)} /></Field>
                <Field label="X / Twitter"><Input value={data.footerSocial.twitter || ""} onChange={(e) => updNested("footerSocial", "twitter", e.target.value)} /></Field>
                <Field label="YouTube"><Input value={data.footerSocial.youtube || ""} onChange={(e) => updNested("footerSocial", "youtube", e.target.value)} /></Field>
              </div>
            </Section>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-200">
      <h3 className="text-sm font-extrabold text-[#0f172a]">{title}</h3>
      {children}
    </div>
  );
}

function ArrayEditor({ label, items, onAdd, onRemove, onMove, render }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <span className="block text-xs font-bold uppercase tracking-wider text-[#64748b]">{label}</span>
        <button onClick={onAdd} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1E88E5] hover:bg-[#1976d2] text-white text-xs font-bold"><Plus size={13} /> Hinzufügen</button>
      </div>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex flex-col sm:flex-row gap-2 sm:items-center bg-slate-50 rounded-xl p-3">
            <GripVertical size={16} className="text-[#94a3b8] flex-shrink-0 hidden sm:block" />
            <div className="flex-1 grid sm:grid-cols-2 gap-2">{render(it, i)}</div>
            <div className="flex gap-1 sm:gap-2 justify-end">
              <button onClick={() => onMove(i, -1)} className="w-8 h-8 rounded-lg bg-white hover:bg-slate-200 flex items-center justify-center"><ArrowUp size={14} /></button>
              <button onClick={() => onMove(i, +1)} className="w-8 h-8 rounded-lg bg-white hover:bg-slate-200 flex items-center justify-center"><ArrowDown size={14} /></button>
              <button onClick={() => onRemove(i)} className="w-8 h-8 rounded-lg bg-white hover:bg-[#E63946] hover:text-white flex items-center justify-center"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="text-sm text-[#64748b] bg-slate-50 rounded-xl p-4 text-center">Noch nichts. Klicke auf "Hinzufügen".</div>}
      </div>
    </div>
  );
}
