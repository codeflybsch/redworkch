import React, { useCallback, useEffect, useState } from "react";
import { Loader2, Save, Plus, Trash2, Edit3, X, FileSignature } from "lucide-react";
import api from "../../api";

const EMPTY = { name: "", description: "", title: "", intro: "", notes: "", items: [] };
const inp = "w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-[#1E88E5] focus:outline-none text-sm bg-white text-[#0f172a]";

export default function InvoiceTemplates() {
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [t, p] = await Promise.all([api.get("/admin/invoice-templates"), api.get("/admin/products")]);
      setItems(t.data); setProducts(p.data);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    const { id, createdAt, ...rest } = editing;
    rest.items = (editing.items || []).map((it) => ({ description: it.description, quantity: Number(it.quantity) || 1, unitPrice: Number(it.unitPrice) || 0 }));
    if (id) {
      const r = await api.put(`/admin/invoice-templates/${id}`, rest);
      setItems((arr) => arr.map((x) => x.id === id ? r.data : x));
    } else {
      const r = await api.post("/admin/invoice-templates", rest);
      setItems((arr) => [...arr, r.data]);
    }
    setEditing(null);
  };
  const remove = async (id) => {
    if (!window.confirm("Vorlage löschen?")) return;
    await api.delete(`/admin/invoice-templates/${id}`);
    setItems((arr) => arr.filter((x) => x.id !== id));
  };

  const addItem = (preset = {}) => setEditing((d) => ({ ...d, items: [...(d.items || []), { description: "", quantity: 1, unitPrice: 0, ...preset }] }));
  const remItem = (idx) => setEditing((d) => ({ ...d, items: d.items.filter((_, i) => i !== idx) }));
  const updItem = (idx, patch) => setEditing((d) => ({ ...d, items: d.items.map((it, i) => i === idx ? { ...it, ...patch } : it) }));

  return (
    <div data-testid="invoice-templates-page">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0f172a]">Rechnungs-Vorlagen</h1>
          <p className="text-[#64748b] mt-1">Speichere häufig verwendete Positions-Sets, um neue Rechnungen oder Offerten in Sekunden zu erstellen.</p>
        </div>
        <button onClick={() => setEditing({ ...EMPTY })} data-testid="new-tpl-btn" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#E63946] hover:bg-[#c5303d] text-white font-bold text-sm">
          <Plus size={15} /> Neue Vorlage
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {loading ? <div className="col-span-full p-12 text-center"><Loader2 className="animate-spin mx-auto" /></div> :
          items.length === 0 ? <div className="col-span-full p-12 text-center text-[#64748b] bg-white rounded-2xl"><FileSignature size={32} className="mx-auto mb-2 text-slate-300" />Noch keine Vorlage.</div> :
          items.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl shadow-card p-5">
              <h3 className="font-extrabold text-[#0f172a]">{t.name}</h3>
              {t.description && <p className="text-xs text-[#64748b] mt-1">{t.description}</p>}
              <p className="text-xs text-[#94a3b8] mt-2">{t.items?.length || 0} Positionen · CHF {(t.items || []).reduce((s, it) => s + Number(it.quantity || 0) * Number(it.unitPrice || 0), 0).toFixed(2)}</p>
              <div className="flex gap-1 mt-4">
                <button onClick={() => setEditing({ ...t })} className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#1E88E5] hover:text-white font-bold inline-flex items-center justify-center gap-1"><Edit3 size={12} /> Bearbeiten</button>
                <button onClick={() => remove(t.id)} className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#E63946] hover:text-white font-bold inline-flex items-center gap-1"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#0f172a] text-white p-5 rounded-t-2xl flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2"><FileSignature size={18} /><h2 className="text-lg font-extrabold">{editing.id ? "Vorlage bearbeiten" : "Neue Vorlage"}</h2></div>
              <button onClick={() => setEditing(null)} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <Field label="Name *"><input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={inp} placeholder="z.B. Webdesign Standard-Paket" /></Field>
              <Field label="Beschreibung"><input value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className={inp} /></Field>
              <Field label="Standard-Titel"><input value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className={inp} placeholder="wird beim Anwenden vorgeschlagen" /></Field>
              <Field label="Standard-Notizen"><textarea value={editing.notes || ""} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} rows={2} className={inp} /></Field>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#64748b]">Positionen</label>
                  <div className="flex gap-2">
                    <select onChange={(e) => { if (e.target.value) { const p = products.find((x) => x.id === e.target.value); if (p) addItem({ description: p.name, unitPrice: p.unitPrice, quantity: 1 }); e.target.value = ""; } }} className="text-xs px-2 py-1 rounded border border-slate-200">
                      <option value="">Aus Katalog +</option>
                      {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <button onClick={() => addItem()} className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 font-bold">+ Leer</button>
                  </div>
                </div>
                <div className="space-y-2">
                  {(editing.items || []).map((it, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-start bg-slate-50 rounded-lg p-2">
                      <div className="col-span-12 sm:col-span-6"><textarea value={it.description} onChange={(e) => updItem(idx, { description: e.target.value })} placeholder="Beschreibung" rows={1} className={inp} /></div>
                      <div className="col-span-3 sm:col-span-2"><input type="number" step="0.5" value={it.quantity} onChange={(e) => updItem(idx, { quantity: e.target.value })} placeholder="Menge" className={inp} /></div>
                      <div className="col-span-6 sm:col-span-3"><input type="number" step="0.01" value={it.unitPrice} onChange={(e) => updItem(idx, { unitPrice: e.target.value })} placeholder="Preis" className={inp} /></div>
                      <div className="col-span-3 sm:col-span-1 flex justify-end"><button onClick={() => remItem(idx)} className="w-8 h-8 rounded bg-white hover:bg-[#E63946] hover:text-white flex items-center justify-center"><Trash2 size={13} /></button></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
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

function Field({ label, children }) {
  return <label className="block"><span className="block text-xs font-bold uppercase tracking-wider text-[#64748b] mb-1.5">{label}</span>{children}</label>;
}
