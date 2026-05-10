import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import api, { API } from "../api";

export default function FAQSection() {
  const [faqs, setFaqs] = useState([]);
  const [settings, setSettings] = useState({});
  const [activeCat, setActiveCat] = useState("");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    api.get("/faqs").then((r) => setFaqs(r.data)).catch(() => {});
    fetch(`${API}/site-settings`).then((r) => r.json()).then(setSettings).catch(() => {});
  }, []);

  const categories = useMemo(() => {
    const counts = {};
    faqs.forEach((f) => { counts[f.category] = (counts[f.category] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [faqs]);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    let list = faqs;
    if (activeCat) list = list.filter((f) => f.category === activeCat);
    if (ql) list = list.filter((f) => f.question.toLowerCase().includes(ql) || f.answer.toLowerCase().includes(ql));
    return list;
  }, [faqs, activeCat, q]);

  const visible = showAll || q || activeCat ? filtered.slice(0, 200) : filtered.slice(0, 12);

  return (
    <section id="faq" className="py-20 md:py-24 bg-gradient-to-b from-white to-[#f1f5fb]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6">
        <div className="text-center mb-10 max-w-3xl mx-auto">
          <h2 className="text-[28px] sm:text-[30px] md:text-[44px] font-extrabold text-[#0f172a]">
            <span className="section-title-hash">#</span> {settings.faqTitle || "Häufig gestellte Fragen"}
          </h2>
          <p className="text-[#E63946] font-bold tracking-wider text-sm mt-2">{faqs.length} ANTWORTEN</p>
          <p className="text-[#475569] mt-4 text-sm sm:text-base">{settings.faqSubtitle || "Antworten auf die häufigsten Fragen unserer Kundinnen und Kunden"}</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Frage durchsuchen..." data-testid="faq-public-search"
              className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-[#e2e8f0] focus:border-[#E63946] focus:outline-none bg-white text-sm"
            />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap mb-6">
          <button onClick={() => setActiveCat("")} className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${!activeCat ? "bg-[#E63946] text-white" : "bg-white text-[#0f172a] hover:bg-slate-100"}`}>Alle ({faqs.length})</button>
          {categories.slice(0, 12).map(([c, n]) => (
            <button key={c} onClick={() => setActiveCat(c)} data-testid={`cat-${c}`} className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${activeCat === c ? "bg-[#E63946] text-white" : "bg-white text-[#0f172a] hover:bg-slate-100"}`}>
              {c} ({n})
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {visible.map((f, i) => (
            <div key={f.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => setOpen(open === f.id ? null : f.id)}
                data-testid={`faq-q-${i}`}
                className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50 transition"
              >
                <span className="font-semibold text-[#0f172a] text-[15px] leading-snug">{f.question}</span>
                <ChevronDown size={18} className={`flex-shrink-0 text-[#64748b] mt-0.5 transition-transform ${open === f.id ? "rotate-180" : ""}`} />
              </button>
              {open === f.id && (
                <div className="px-5 pb-5 text-[#475569] text-sm leading-relaxed whitespace-pre-line border-t border-slate-100 bg-slate-50/50">
                  {f.answer}
                </div>
              )}
            </div>
          ))}
          {visible.length === 0 && (
            <div className="text-center py-12 text-[#64748b] bg-white rounded-2xl">Keine FAQ gefunden. Probiere einen anderen Suchbegriff.</div>
          )}
        </div>

        {!q && !activeCat && filtered.length > 12 && !showAll && (
          <div className="text-center mt-8">
            <button onClick={() => setShowAll(true)} className="px-6 py-3 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-sm">
              Alle {filtered.length} Fragen anzeigen
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
