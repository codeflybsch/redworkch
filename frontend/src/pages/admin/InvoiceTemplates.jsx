import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Save, Plus, Trash2, Edit3, X, FileSignature, Search, Copy, ArrowRight, Package } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../api";

const EMPTY = { name: "", description: "", title: "", intro: "", notes: "", items: [] };
const inp = "w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-[#1E88E5] focus:outline-none text-sm bg-white text-[#0f172a]";

export default function InvoiceTemplates() {
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [q, setQ] = useState("");
  const [feedback, setFeedback] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [t, p] = await Promise.all([api.get("/admin/invoice-templates"), api.get("/admin/products")]);
      setItems(t.data); setProducts(p.data);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    if (!ql) return items;
    return items.filter((it) => it.name.toLowerCase().includes(ql) || (it.description || "").toLowerCase().includes(ql));
  }, [items, q]);

  const totalOf = (tpl) => (tpl.items || []).reduce((s, it) => s + Number(it.quantity || 0) * Number(it.unitPrice || 0), 0);

  const save = async () => {
    const { id, createdAt, ...rest } = editing;
    rest.items = (editing.items || []).map((it) => ({ description: it.description, quantity: Number(it.quantity) || 1, unitPrice: Number(it.unitPrice) || 0 }));
    try {
      if (id) {
        const r = await api.put(`/admin/invoice-templates/${id}`, rest);
        setItems((arr) => arr.map((x) => x.id === id ? r.data : x));
      } else {
        const r = await api.post("/admin/invoice-templates", rest);
        setItems((arr) => [...arr, r.data]);
      }
      setEditing(null);
      setFeedback({ type: "ok", text: "Vorlage gespeichert" });
      setTimeout(() => setFeedback(null), 3000);
    } catch (e) {
      setFeedback({ type: "err", text: e.response?.data?.detail || "Fehler" });
    }
  };
  const remove = async (id) => {
    if (!window.confirm("Vorlage löschen?")) return;
    await api.delete(`/admin/invoice-templates/${id}`);
    setItems((arr) => arr.filter((x) => x.id !== id));
  };
  const duplicate = async (tpl) => {
    const { id, createdAt, ...rest } = tpl;
    rest.name = `${tpl.name} (Kopie)`;
    const r = await api.post("/admin/invoice-templates", rest);
    setItems((arr) => [...arr, r.data]);
    setFeedback({ type: "ok", text: `Dupliziert: ${r.data.name}` });
    setTimeout(() => setFeedback(null), 3000);
  };

  const addItem = (preset = {}) => setEditing((d) => ({ ...d, items: [...(d.items || []), { description: "", quantity: 1, unitPrice: 0, ...preset }] }));
  const remItem = (idx) => setEditing((d) => ({ ...d, items: d.items.filter((_, i) => i !== idx) }));
  const updItem = (idx, patch) => setEditing((d) => ({ ...d, items: d.items.map((it, i) => i === idx ? { ...it, ...patch } : it) }));

  return (
    <div data-testid="invoice-templates-page">
      <div className="bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] rounded-2xl p-6 sm:p-8 text-white">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#E63946] flex items-center justify-center"><FileSignature size={20} /></div>
              <h1 className="text-2xl sm:text-3xl font-extrabold">Rechnungs-Vorlagen</h1>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              Speichere fertige Positions-Sets für deine häufigsten Rechnungen und Offerten.
              Im <Link to="/admin/invoices/new" className="text-[#FFC107] font-bold underline">Rechnungs-Editor</Link> oder <Link to="/admin/offers/new" className="text-[#FFC107] font-bold underline">Offerten-Editor</Link> kannst du jede Vorlage mit einem Klick laden und Zeit sparen.
            </p>
          </div>
          <button onClick={() => setEditing({ ...EMPTY })} data-testid="new-tpl-btn" className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#E63946] hover:bg-[#c5303d] text-white font-bold text-sm shadow-lg">
            <Plus size={16} /> Neue Vorlage
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <Stat label="Vorlagen" value={items.length} />
          <Stat label="Positionen ges." value={items.reduce((s, t) => s + (t.items?.length || 0), 0)} />
          <Stat label="Ø Wert (CHF)" value={items.length ? Math.round(items.reduce((s, t) => s + totalOf(t), 0) / items.length) : 0} />
          <Stat label="Katalog-Produkte" value={products.length} />
        </div>
      </div>

      {feedback && (
        <div className={`mt-4 text-sm rounded-lg p-3 ${feedback.type === "ok" ? "bg-emerald-50 border border-emerald-200 text-emerald-800" : "bg-red-50 border border-red-200 text-red-800"}`}>{feedback.text}</div>
      )}

      <div className="relative mt-6 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Vorlagen durchsuchen..." className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:border-[#1E88E5] focus:outline-none" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {loading ? <div className="col-span-full p-12 text-center"><Loader2 className="animate-spin mx-auto" /></div> :
          filtered.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl shadow-card p-12 text-center">
              <FileSignature size={40} className="mx-auto mb-3 text-slate-300" />
              <p className="text-[#64748b] text-sm">Noch keine Vorlage. Lege deine erste an, um Rechnungen ⚡️ schneller zu erstellen.</p>
              <button onClick={() => setEditing({ ...EMPTY })} className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-lg bg-[#E63946] text-white font-bold text-sm"><Plus size={15} /> Erste Vorlage erstellen</button>
            </div>
          ) : filtered.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl shadow-card overflow-hidden group hover:-translate-y-1 transition-transform">
              <div className="bg-gradient-to-br from-[#1E88E5]/10 to-[#E63946]/10 p-5 border-b border-slate-100">
                <h3 className="font-extrabold text-[#0f172a] text-lg leading-snug truncate">{t.name}</h3>
                {t.description && <p className="text-xs text-[#64748b] mt-1 line-clamp-2">{t.description}</p>}
              </div>

              <div className="p-5">
                <ul className="space-y-1.5 mb-4 max-h-32 overflow-hidden">
                  {(t.items || []).slice(0, 4).map((it, i) => (
                    <li key={i} className="flex items-start justify-between gap-2 text-xs text-[#475569]">
                      <span className="truncate flex-1">• {(it.description || "—").split("\n")[0]}</span>
                      <span className="font-bold text-[#0f172a] whitespace-nowrap">{(Number(it.quantity || 1) * Number(it.unitPrice || 0)).toFixed(0)}</span>
                    </li>
                  ))}
                  {(t.items || []).length > 4 && <li className="text-xs text-[#94a3b8]">+ {t.items.length - 4} weitere</li>}
                </ul>

                <div className="flex items-end justify-between mt-4 pt-3 border-t border-slate-100">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-[#94a3b8]">Total</p>
                    <p className="text-xl font-extrabold text-[#0f172a]">CHF {totalOf(t).toFixed(0)}</p>
                  </div>
                  <p className="text-xs font-semibold text-[#64748b]">{t.items?.length || 0} Pos.</p>
                </div>
              </div>

              <div className="bg-slate-50 px-3 py-2.5 border-t border-slate-100 flex items-center gap-1">
                <Link to="/admin/invoices/new" state={{ templateId: t.id }} title="Als Rechnung nutzen" className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-[#22C55E] hover:bg-[#16a34a] text-white text-xs font-bold">
                  → Rechnung <ArrowRight size={11} />
                </Link>
                <Link to="/admin/offers/new" state={{ templateId: t.id }} title="Als Offerte nutzen" className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-[#1E88E5] hover:bg-[#1976d2] text-white text-xs font-bold">
                  → Offerte <ArrowRight size={11} />
                </Link>
                <button onClick={() => setEditing({ ...t })} title="Bearbeiten" className="w-8 h-8 rounded-lg bg-white hover:bg-[#A855F7] hover:text-white flex items-center justify-center"><Edit3 size={13} /></button>
                <button onClick={() => duplicate(t)} title="Duplizieren" className="w-8 h-8 rounded-lg bg-white hover:bg-[#06B6D4] hover:text-white flex items-center justify-center"><Copy size={13} /></button>
                <button onClick={() => remove(t.id)} title="Löschen" className="w-8 h-8 rounded-lg bg-white hover:bg-[#E63946] hover:text-white flex items-center justify-center"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-[#0f172a] to-[#1e293b] text-white p-5 rounded-t-2xl flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2"><FileSignature size={18} /><h2 className="text-lg font-extrabold">{editing.id ? "Vorlage bearbeiten" : "Neue Vorlage erstellen"}</h2></div>
              <button onClick={() => setEditing(null)} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <Field label="Name *" hint="Eindeutiger Name, z.B. 'Webdesign Standard-Paket'"><input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} data-testid="tpl-name" className={inp} /></Field>
              <Field label="Beschreibung (intern)"><input value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className={inp} /></Field>

              <details className="bg-slate-50 rounded-xl p-3 group">
                <summary className="cursor-pointer text-sm font-bold text-[#0f172a]">▸ Erweitert: Standard-Titel & Notizen</summary>
                <div className="mt-3 space-y-3">
                  <Field label="Standard-Titel"><input value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className={inp} placeholder="z.B. Webdesign-Projekt – Phase 1" /></Field>
                  <Field label="Standard-Einleitung"><textarea value={editing.intro || ""} onChange={(e) => setEditing({ ...editing, intro: e.target.value })} rows={2} className={inp} /></Field>
                  <Field label="Standard-Notizen"><textarea value={editing.notes || ""} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} rows={2} className={inp} /></Field>
                </div>
              </details>

              <div>
                <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#64748b]">Positionen ({(editing.items || []).length})</label>
                  <div className="flex gap-2">
                    <select onChange={(e) => { if (e.target.value) { const p = products.find((x) => x.id === e.target.value); if (p) addItem({ description: p.name, unitPrice: p.unitPrice, quantity: 1 }); e.target.value = ""; } }} className="text-xs px-2 py-1.5 rounded border border-slate-200 bg-white">
                      <option value="">📦 Aus Katalog +</option>
                      {products.map((p) => <option key={p.id} value={p.id}>{p.name} — CHF {Number(p.unitPrice).toFixed(0)}</option>)}
                    </select>
                    <button onClick={() => addItem()} className="text-xs px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 font-bold inline-flex items-center gap-1"><Plus size={11} /> Leere</button>
                  </div>
                </div>
                <div className="space-y-2">
                  {(editing.items || []).length === 0 && (
                    <div className="text-center py-8 bg-slate-50 rounded-xl text-[#64748b] text-sm"><Package size={28} className="mx-auto mb-2 text-slate-300" />Noch keine Position. Wähle aus dem Katalog oder lege eine leere an.</div>
                  )}
                  {(editing.items || []).map((it, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-start bg-slate-50 rounded-lg p-2.5">
                      <div className="col-span-12 sm:col-span-6"><textarea value={it.description} onChange={(e) => updItem(idx, { description: e.target.value })} placeholder="Beschreibung" rows={2} className={inp} /></div>
                      <div className="col-span-3 sm:col-span-2"><input type="number" step="0.5" value={it.quantity} onChange={(e) => updItem(idx, { quantity: e.target.value })} placeholder="Menge" className={inp} /></div>
                      <div className="col-span-6 sm:col-span-3"><input type="number" step="0.01" value={it.unitPrice} onChange={(e) => updItem(idx, { unitPrice: e.target.value })} placeholder="Preis" className={inp} /></div>
                      <div className="col-span-3 sm:col-span-1 flex justify-end"><button onClick={() => remItem(idx)} className="w-9 h-9 rounded bg-white hover:bg-[#E63946] hover:text-white flex items-center justify-center"><Trash2 size={13} /></button></div>
                    </div>
                  ))}
                </div>
                {(editing.items || []).length > 0 && (
                  <div className="text-right text-sm font-bold text-[#0f172a] mt-2">
                    Total: CHF {(editing.items || []).reduce((s, it) => s + Number(it.quantity || 0) * Number(it.unitPrice || 0), 0).toFixed(2)}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 sticky bottom-0 bg-white">
                <button onClick={() => setEditing(null)} className="px-4 py-2.5 rounded-lg bg-slate-100 text-[#0f172a] font-bold text-sm">Abbrechen</button>
                <button onClick={save} disabled={!editing.name} data-testid="save-tpl-btn" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#E63946] hover:bg-[#c5303d] disabled:opacity-50 text-white font-bold text-sm"><Save size={15} /> Speichern</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, hint, children }) {
  return <label className="block"><span className="block text-xs font-bold uppercase tracking-wider text-[#64748b] mb-1.5">{label}</span>{children}{hint && <span className="block text-[11px] text-[#94a3b8] mt-1">{hint}</span>}</label>;
}
function Stat({ label, value }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/10">
      <p className="text-[10px] uppercase tracking-wider text-white/60 font-bold">{label}</p>
      <p className="text-xl font-extrabold mt-0.5">{value}</p>
    </div>
  );
}
