import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Save, Plus, Trash2, Edit3, X, Search, HelpCircle, ListOrdered, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import api from "../../api";

const EMPTY = { category: "Allgemein", question: "", answer: "", order: 0, published: true };

export default function FAQAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [sortMode, setSortMode] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/admin/faqs");
      setItems(r.data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category));
    return Array.from(set).sort();
  }, [items]);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return items.filter((i) => {
      if (cat && i.category !== cat) return false;
      if (!ql) return true;
      return (
        i.question.toLowerCase().includes(ql) ||
        i.answer.toLowerCase().includes(ql) ||
        i.category.toLowerCase().includes(ql)
      );
    }).slice(0, 500); // performance: render at most 500
  }, [items, q, cat]);

  const open = (it) => setEditing(it ? { ...it } : { ...EMPTY });
  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const { id, createdAt, ...rest } = editing;
      if (id) {
        const r = await api.put(`/admin/faqs/${id}`, rest);
        setItems((arr) => arr.map((x) => (x.id === id ? r.data : x)));
      } else {
        const r = await api.post("/admin/faqs", rest);
        setItems((arr) => [...arr, r.data]);
      }
      setEditing(null);
    } finally { setSaving(false); }
  };
  const remove = async (id) => {
    if (!window.confirm("FAQ wirklich löschen?")) return;
    await api.delete(`/admin/faqs/${id}`);
    setItems((arr) => arr.filter((x) => x.id !== id));
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const reordered = Array.from(filtered);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    // update items: for visible part, replace; rest stays as-is
    const visibleIds = new Set(filtered.map((x) => x.id));
    const others = items.filter((x) => !visibleIds.has(x.id));
    setItems([...reordered, ...others]);
    try {
      await api.post("/admin/faqs/reorder", { ids: reordered.map((i) => i.id) });
    } catch (e) { /* ignore */ }
  };

  return (
    <div data-testid="faqs-page">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0f172a]">FAQ verwalten</h1>
          <p className="text-[#64748b] mt-1">{items.length} Einträge insgesamt · {categories.length} Kategorien</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSortMode((s) => !s)}
            data-testid="faq-sort-toggle"
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm ${sortMode ? "bg-[#0f172a] text-white" : "bg-slate-100 hover:bg-slate-200 text-[#0f172a]"}`}
          >
            <ListOrdered size={15} /> {sortMode ? "Sortieren beenden" : "Sortieren"}
          </button>
          <button onClick={() => open(null)} data-testid="new-faq-btn" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#E63946] hover:bg-[#c5303d] text-white font-bold text-sm transition">
            <Plus size={15} /> Neue FAQ
          </button>
        </div>
      </div>

      <div className="flex gap-3 mt-4 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Suchen..." data-testid="faq-search" className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:border-[#1E88E5] focus:outline-none" />
        </div>
        <select value={cat} onChange={(e) => setCat(e.target.value)} data-testid="faq-category-filter" className="px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:border-[#1E88E5] focus:outline-none">
          <option value="">Alle Kategorien</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden mt-4">
        {loading ? (
          <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-[#64748b]">Keine Einträge gefunden.</div>
        ) : sortMode ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="faqs">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="p-3 space-y-1.5">
                  <p className="text-xs text-[#64748b] mb-2 px-2">💡 Tipp: Wähle oben eine Kategorie, dann sortiere die FAQs nur in dieser Kategorie. Bei vielen Einträgen für bessere Performance.</p>
                  {filtered.slice(0, 200).map((it, idx) => (
                    <Draggable key={it.id} draggableId={it.id} index={idx}>
                      {(prov, snap) => (
                        <div ref={prov.innerRef} {...prov.draggableProps} className={`flex items-center gap-2 bg-white border ${snap.isDragging ? "border-[#E63946] shadow-2xl" : "border-slate-200"} rounded-lg px-2 py-2`}>
                          <div {...prov.dragHandleProps} className="px-2 text-slate-400 hover:text-[#E63946] cursor-grab"><GripVertical size={16} /></div>
                          <span className="text-[10px] font-bold text-slate-400 w-8">#{idx + 1}</span>
                          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-slate-100 rounded font-bold text-[#0f172a] flex-shrink-0">{it.category}</span>
                          <span className="text-sm font-semibold text-[#0f172a] truncate">{it.question}</span>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  {filtered.length > 200 && <p className="text-xs text-center text-[#94a3b8] py-2">Nur die ersten 200 sortierbar – verfeinere via Kategorie-Filter.</p>}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f8fafc] border-b border-slate-200">
                <tr>
                  <th className="p-3 text-xs uppercase font-bold text-[#64748b]">Kategorie</th>
                  <th className="p-3 text-xs uppercase font-bold text-[#64748b]">Frage</th>
                  <th className="p-3 text-xs uppercase font-bold text-[#64748b] hidden md:table-cell">Antwort (Vorschau)</th>
                  <th className="p-3 text-xs uppercase font-bold text-[#64748b]">Pub.</th>
                  <th className="p-3 text-right text-xs uppercase font-bold text-[#64748b]">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((it) => (
                  <tr key={it.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-3 text-xs"><span className="px-2 py-0.5 bg-slate-100 rounded text-[#0f172a] font-bold">{it.category}</span></td>
                    <td className="p-3 text-sm font-semibold text-[#0f172a] max-w-md">{it.question}</td>
                    <td className="p-3 text-xs text-[#64748b] hidden md:table-cell max-w-md truncate">{it.answer}</td>
                    <td className="p-3 text-xs">{it.published ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-slate-400">—</span>}</td>
                    <td className="p-3 text-right">
                      <div className="inline-flex gap-1">
                        <button onClick={() => open(it)} data-testid={`edit-faq-${it.id}`} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-[#1E88E5] hover:text-white flex items-center justify-center"><Edit3 size={14} /></button>
                        <button onClick={() => remove(it.id)} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-[#E63946] hover:text-white flex items-center justify-center"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {items.length > filtered.length && (
              <div className="p-3 text-center text-xs text-[#94a3b8] bg-slate-50">{filtered.length} / {items.length} – verfeinere Suche für Rest</div>
            )}
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#0f172a] text-white p-5 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-2"><HelpCircle size={18} /><h2 className="text-lg font-extrabold">{editing.id ? "FAQ bearbeiten" : "Neue FAQ"}</h2></div>
              <button onClick={() => setEditing(null)} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#64748b] mb-1.5">Kategorie</label>
                <input value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} list="faq-cats" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-[#1E88E5] focus:outline-none text-sm" />
                <datalist id="faq-cats">{categories.map((c) => <option key={c} value={c} />)}</datalist>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-[#64748b] mb-1.5">Frage</label>
                <input value={editing.question} onChange={(e) => setEditing({ ...editing, question: e.target.value })} data-testid="faq-question" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-[#1E88E5] focus:outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-[#64748b] mb-1.5">Antwort</label>
                <textarea value={editing.answer} onChange={(e) => setEditing({ ...editing, answer: e.target.value })} data-testid="faq-answer" rows={8} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-[#1E88E5] focus:outline-none text-sm resize-y" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#64748b] mb-1.5">Reihenfolge</label>
                  <input type="number" value={editing.order || 0} onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm" />
                </div>
                <label className="flex items-center gap-2 select-none mt-7">
                  <input type="checkbox" checked={!!editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} className="w-4 h-4 accent-[#E63946]" />
                  <span className="text-sm font-semibold">Veröffentlicht</span>
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setEditing(null)} className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0f172a] font-bold text-sm">Abbrechen</button>
                <button onClick={save} disabled={saving || !editing.question || !editing.answer} data-testid="save-faq-btn" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#E63946] hover:bg-[#c5303d] disabled:opacity-50 text-white font-bold text-sm">
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Speichern
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
