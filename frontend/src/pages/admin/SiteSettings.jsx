import React, { useCallback, useEffect, useState } from "react";
import { Loader2, Save, Plus, Trash2, GripVertical, ArrowUp, ArrowDown, CheckCircle2, AlertTriangle, Eye } from "lucide-react";
import api from "../../api";

const DEFAULT = {
  heroSubtitle: "",
  heroTagline: "",
  heroSlides: [],
  badgeEnabled: true,
  badgeNumber: "12",
  badgeUnit: "MONATE",
  badgeText1: "kostenloser",
  badgeText2: "Support",
  badgeFooter1: "für unsere Kunden",
  badgeFooter2: "inklusive!",
  btnContactSmall: "",
  btnContactLarge: "",
  btnQuoteSmall: "",
  btnQuoteLarge: "",
  partners: [],
  ratingStars: "★★★★★",
  ratingText: "",
  stats: [],
};

const Field = ({ label, hint, children }) => (
  <label className="block">
    <span className="block text-xs font-bold uppercase tracking-wider text-[#64748b] mb-1.5">{label}</span>
    {children}
    {hint && <span className="block text-[11px] text-[#94a3b8] mt-1">{hint}</span>}
  </label>
);

const Input = (props) => (
  <input
    {...props}
    className={`w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-[#1E88E5] focus:outline-none text-sm bg-white text-[#0f172a] ${props.className || ""}`}
  />
);

const TextArea = (props) => (
  <textarea
    {...props}
    className={`w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-[#1E88E5] focus:outline-none text-sm bg-white text-[#0f172a] resize-y ${props.className || ""}`}
  />
);

const TabBtn = ({ active, onClick, children, testid }) => (
  <button
    type="button"
    onClick={onClick}
    data-testid={testid}
    className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
      active ? "bg-[#0f172a] text-white" : "bg-slate-100 text-[#0f172a] hover:bg-slate-200"
    }`}
  >
    {children}
  </button>
);

const TABS = [
  { id: "hero", label: "Hero & Slides" },
  { id: "badge", label: "Support-Badge" },
  { id: "buttons", label: "Buttons" },
  { id: "partners", label: "Partner & Bewertung" },
  { id: "stats", label: "Statistiken" },
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
      setData({ ...DEFAULT, ...r.data });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const update = (k, v) => setData((d) => ({ ...d, [k]: v }));

  const save = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      await api.put("/admin/site-settings", data);
      setFeedback({ type: "ok", text: "Einstellungen gespeichert. Lade die Startseite neu, um die Änderungen zu sehen." });
    } catch (e) {
      setFeedback({ type: "err", text: e?.response?.data?.detail || e.message || "Fehler beim Speichern" });
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(null), 6000);
    }
  };

  // ----- Helpers for arrays -----
  const moveItem = (arr, from, to) => {
    if (to < 0 || to >= arr.length) return arr;
    const next = [...arr];
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m);
    return next;
  };

  // Slides CRUD
  const slideUpdate = (i, field, v) => {
    const next = [...data.heroSlides];
    next[i] = { ...next[i], [field]: v };
    update("heroSlides", next);
  };
  const slideAdd = () => update("heroSlides", [...data.heroSlides, { highlight: "Neu", word: "Webdesign" }]);
  const slideRemove = (i) => update("heroSlides", data.heroSlides.filter((_, idx) => idx !== i));
  const slideMove = (i, dir) => update("heroSlides", moveItem(data.heroSlides, i, i + dir));

  // Partners CRUD
  const partnerUpdate = (i, v) => { const n = [...data.partners]; n[i] = v; update("partners", n); };
  const partnerAdd = () => update("partners", [...data.partners, "NEUER PARTNER"]);
  const partnerRemove = (i) => update("partners", data.partners.filter((_, idx) => idx !== i));
  const partnerMove = (i, dir) => update("partners", moveItem(data.partners, i, i + dir));

  // Stats CRUD
  const statUpdate = (i, field, v) => {
    const n = [...data.stats]; n[i] = { ...n[i], [field]: v }; update("stats", n);
  };
  const statAdd = () => update("stats", [...data.stats, { number: "100", suffix: "+", label: "Neue Statistik" }]);
  const statRemove = (i) => update("stats", data.stats.filter((_, idx) => idx !== i));
  const statMove = (i, dir) => update("stats", moveItem(data.stats, i, i + dir));

  if (loading) {
    return <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto" /></div>;
  }

  return (
    <div data-testid="site-settings-page">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0f172a]">Website-Inhalte</h1>
          <p className="text-[#64748b] mt-1">Hero-Slider, Texte, Buttons, Partner und Statistiken</p>
        </div>
        <div className="flex gap-2">
          <a href="/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0f172a] font-bold text-sm transition">
            <Eye size={15} /> Vorschau
          </a>
          <button
            onClick={save}
            disabled={saving}
            data-testid="save-settings-button"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#E63946] hover:bg-[#c5303d] disabled:opacity-50 text-white font-bold text-sm transition"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? "Speichern..." : "Speichern"}
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`mt-4 flex items-start gap-2 text-sm rounded-lg p-3 ${
          feedback.type === "ok" ? "bg-emerald-50 border border-emerald-200 text-emerald-800" : "bg-red-50 border border-red-200 text-red-800"
        }`}>
          {feedback.type === "ok" ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> : <AlertTriangle size={16} className="mt-0.5 shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}

      <div className="mt-6 flex gap-2 flex-wrap">
        {TABS.map((t) => (
          <TabBtn key={t.id} active={tab === t.id} onClick={() => setTab(t.id)} testid={`tab-${t.id}`}>
            {t.label}
          </TabBtn>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-card p-6 mt-4 space-y-5">
        {tab === "hero" && (
          <>
            <Field
              label="Hero Untertitel"
              hint="Markiere gelbe Highlights mit <y>...</y>. Zeilenumbrüche mit Enter."
            >
              <TextArea
                rows={4}
                value={data.heroSubtitle}
                onChange={(e) => update("heroSubtitle", e.target.value)}
                data-testid="hero-subtitle-input"
              />
            </Field>

            <Field label="Hero Tagline" hint="Erscheint in Gelb unter dem Untertitel.">
              <Input
                value={data.heroTagline}
                onChange={(e) => update("heroTagline", e.target.value)}
                data-testid="hero-tagline-input"
              />
            </Field>

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="block text-xs font-bold uppercase tracking-wider text-[#64748b]">
                  Hero-Slides ({data.heroSlides.length}) – wechseln alle 3,5 Sek.
                </span>
                <button onClick={slideAdd} data-testid="add-slide" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1E88E5] hover:bg-[#1976d2] text-white text-xs font-bold transition">
                  <Plus size={13} /> Neuer Slide
                </button>
              </div>
              <div className="space-y-2">
                {data.heroSlides.map((sl, i) => (
                  <div key={i} className="flex gap-2 items-center bg-slate-50 rounded-xl p-3" data-testid={`slide-row-${i}`}>
                    <GripVertical size={16} className="text-[#94a3b8]" />
                    <Input
                      placeholder="Highlight (blau)"
                      value={sl.highlight}
                      onChange={(e) => slideUpdate(i, "highlight", e.target.value)}
                      data-testid={`slide-highlight-${i}`}
                    />
                    <Input
                      placeholder="Word (weiß)"
                      value={sl.word}
                      onChange={(e) => slideUpdate(i, "word", e.target.value)}
                      data-testid={`slide-word-${i}`}
                    />
                    <button onClick={() => slideMove(i, -1)} className="w-8 h-8 rounded-lg bg-white hover:bg-slate-200 flex items-center justify-center"><ArrowUp size={14} /></button>
                    <button onClick={() => slideMove(i, +1)} className="w-8 h-8 rounded-lg bg-white hover:bg-slate-200 flex items-center justify-center"><ArrowDown size={14} /></button>
                    <button onClick={() => slideRemove(i)} data-testid={`remove-slide-${i}`} className="w-8 h-8 rounded-lg bg-white hover:bg-[#E63946] hover:text-white flex items-center justify-center"><Trash2 size={14} /></button>
                  </div>
                ))}
                {data.heroSlides.length === 0 && (
                  <div className="text-sm text-[#64748b] bg-slate-50 rounded-xl p-4 text-center">Noch keine Slides. Klicke auf "Neuer Slide".</div>
                )}
              </div>
            </div>
          </>
        )}

        {tab === "badge" && (
          <>
            <label className="flex items-center gap-3 select-none">
              <input
                type="checkbox"
                checked={data.badgeEnabled}
                onChange={(e) => update("badgeEnabled", e.target.checked)}
                data-testid="badge-enabled"
                className="w-4 h-4 accent-[#E63946]"
              />
              <span className="text-sm font-semibold text-[#0f172a]">Badge anzeigen</span>
            </label>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Zahl (z. B. 12)"><Input value={data.badgeNumber} onChange={(e) => update("badgeNumber", e.target.value)} /></Field>
              <Field label="Einheit (z. B. MONATE)"><Input value={data.badgeUnit} onChange={(e) => update("badgeUnit", e.target.value)} /></Field>
              <Field label="Text Zeile 1 (z. B. kostenloser)"><Input value={data.badgeText1} onChange={(e) => update("badgeText1", e.target.value)} /></Field>
              <Field label="Text Zeile 2 – gelb (z. B. Support)"><Input value={data.badgeText2} onChange={(e) => update("badgeText2", e.target.value)} /></Field>
              <Field label="Untertext 1"><Input value={data.badgeFooter1} onChange={(e) => update("badgeFooter1", e.target.value)} /></Field>
              <Field label="Untertext 2 (fett)"><Input value={data.badgeFooter2} onChange={(e) => update("badgeFooter2", e.target.value)} /></Field>
            </div>
          </>
        )}

        {tab === "buttons" && (
          <>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-[#E63946]">Roter Button (Kontakt)</p>
                <Field label="Klein (oben)"><Input value={data.btnContactSmall} onChange={(e) => update("btnContactSmall", e.target.value)} data-testid="btn-contact-small" /></Field>
                <Field label="Groß (unten)"><Input value={data.btnContactLarge} onChange={(e) => update("btnContactLarge", e.target.value)} data-testid="btn-contact-large" /></Field>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-[#1E88E5]">Blauer Button (Angebot)</p>
                <Field label="Klein (oben)"><Input value={data.btnQuoteSmall} onChange={(e) => update("btnQuoteSmall", e.target.value)} /></Field>
                <Field label="Groß (unten)"><Input value={data.btnQuoteLarge} onChange={(e) => update("btnQuoteLarge", e.target.value)} /></Field>
              </div>
            </div>
          </>
        )}

        {tab === "partners" && (
          <>
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="block text-xs font-bold uppercase tracking-wider text-[#64748b]">Partner ({data.partners.length})</span>
                <button onClick={partnerAdd} data-testid="add-partner" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1E88E5] hover:bg-[#1976d2] text-white text-xs font-bold">
                  <Plus size={13} /> Neuer Partner
                </button>
              </div>
              <div className="space-y-2">
                {data.partners.map((p, i) => (
                  <div key={i} className="flex gap-2 items-center bg-slate-50 rounded-xl p-3">
                    <GripVertical size={16} className="text-[#94a3b8]" />
                    <Input value={p} onChange={(e) => partnerUpdate(i, e.target.value)} data-testid={`partner-${i}`} />
                    <button onClick={() => partnerMove(i, -1)} className="w-8 h-8 rounded-lg bg-white hover:bg-slate-200 flex items-center justify-center"><ArrowUp size={14} /></button>
                    <button onClick={() => partnerMove(i, +1)} className="w-8 h-8 rounded-lg bg-white hover:bg-slate-200 flex items-center justify-center"><ArrowDown size={14} /></button>
                    <button onClick={() => partnerRemove(i)} className="w-8 h-8 rounded-lg bg-white hover:bg-[#E63946] hover:text-white flex items-center justify-center"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 grid md:grid-cols-2 gap-4">
              <Field label="Sterne (z. B. ★★★★★)"><Input value={data.ratingStars} onChange={(e) => update("ratingStars", e.target.value)} /></Field>
              <Field
                label="Bewertungstext"
                hint="Mit <b>...</b> kannst du Wörter fett markieren. z. B. Sehen Sie sich unsere <b>168 Bewertungen</b> an !"
              >
                <Input value={data.ratingText} onChange={(e) => update("ratingText", e.target.value)} data-testid="rating-text" />
              </Field>
            </div>
          </>
        )}

        {tab === "stats" && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="block text-xs font-bold uppercase tracking-wider text-[#64748b]">Statistiken ({data.stats.length})</span>
              <button onClick={statAdd} data-testid="add-stat" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1E88E5] hover:bg-[#1976d2] text-white text-xs font-bold">
                <Plus size={13} /> Neue Statistik
              </button>
            </div>
            <div className="space-y-2">
              {data.stats.map((st, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center bg-slate-50 rounded-xl p-3">
                  <div className="col-span-3"><Input placeholder="Zahl" value={st.number} onChange={(e) => statUpdate(i, "number", e.target.value)} data-testid={`stat-number-${i}`} /></div>
                  <div className="col-span-1"><Input placeholder="+" value={st.suffix} onChange={(e) => statUpdate(i, "suffix", e.target.value)} /></div>
                  <div className="col-span-6"><Input placeholder="Label" value={st.label} onChange={(e) => statUpdate(i, "label", e.target.value)} data-testid={`stat-label-${i}`} /></div>
                  <div className="col-span-2 flex gap-1 justify-end">
                    <button onClick={() => statMove(i, -1)} className="w-8 h-8 rounded-lg bg-white hover:bg-slate-200 flex items-center justify-center"><ArrowUp size={14} /></button>
                    <button onClick={() => statMove(i, +1)} className="w-8 h-8 rounded-lg bg-white hover:bg-slate-200 flex items-center justify-center"><ArrowDown size={14} /></button>
                    <button onClick={() => statRemove(i)} className="w-8 h-8 rounded-lg bg-white hover:bg-[#E63946] hover:text-white flex items-center justify-center"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
