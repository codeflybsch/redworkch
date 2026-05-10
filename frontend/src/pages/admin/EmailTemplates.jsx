import React, { useCallback, useEffect, useState } from "react";
import { Loader2, Save, Plus, Trash2, Edit3, X, FileText } from "lucide-react";
import api from "../../api";

const FALLBACK = {
  name: "", category: "Allgemein", subject: "", body: "", order: 0,
};

export default function EmailTemplates() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | {...} | "new"
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/admin/email-templates");
      setItems(r.data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const open = (t) => setEditing(t ? { ...t } : { ...FALLBACK, name: "Neue Vorlage" });

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      if (editing.id) {
        const { id, createdAt, ...rest } = editing;
        const r = await api.put(`/admin/email-templates/${id}`, rest);
        setItems((arr) => arr.map((x) => (x.id === id ? r.data : x)));
      } else {
        const r = await api.post("/admin/email-templates", editing);
        setItems((arr) => [...arr, r.data]);
      }
      setEditing(null);
    } finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!window.confirm("Vorlage wirklich löschen?")) return;
    await api.delete(`/admin/email-templates/${id}`);
    setItems((arr) => arr.filter((x) => x.id !== id));
  };

  return (
    <div data-testid="email-templates-page">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0f172a]">Antwortvorlagen</h1>
          <p className="text-[#64748b] mt-1">Vorgefertigte Antworten für Kontakt-Mails. Platzhalter: <code className="bg-slate-100 px-1.5 rounded">{"{{name}}"}</code></p>
        </div>
        <button onClick={() => open(null)} data-testid="new-template-btn" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#E63946] hover:bg-[#c5303d] text-white font-bold text-sm transition">
          <Plus size={15} /> Neue Vorlage
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden mt-6">
        {loading ? (
          <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto" /></div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-[#64748b]">Noch keine Vorlagen.</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-[#f8fafc] border-b border-slate-200">
              <tr>
                <th className="p-4 text-xs uppercase font-bold text-[#64748b]">Name</th>
                <th className="p-4 text-xs uppercase font-bold text-[#64748b]">Kategorie</th>
                <th className="p-4 text-xs uppercase font-bold text-[#64748b]">Betreff</th>
                <th className="p-4 text-right text-xs uppercase font-bold text-[#64748b]">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-semibold text-[#0f172a]">{t.name}</td>
                  <td className="p-4 text-sm">
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-xs font-bold">{t.category}</span>
                  </td>
                  <td className="p-4 text-sm text-[#64748b] truncate max-w-md">{t.subject}</td>
                  <td className="p-4 text-right">
                    <div className="inline-flex gap-2">
                      <button onClick={() => open(t)} data-testid={`edit-template-${t.id}`} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-[#1E88E5] hover:text-white flex items-center justify-center"><Edit3 size={14} /></button>
                      <button onClick={() => remove(t.id)} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-[#E63946] hover:text-white flex items-center justify-center"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#0f172a] text-white p-5 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={18} />
                <h2 className="text-lg font-extrabold">{editing.id ? "Vorlage bearbeiten" : "Neue Vorlage"}</h2>
              </div>
              <button onClick={() => setEditing(null)} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#64748b] mb-1.5">Name</label>
                  <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} data-testid="template-name" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-[#1E88E5] focus:outline-none text-sm bg-white text-[#0f172a]" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#64748b] mb-1.5">Kategorie</label>
                  <input value={editing.category || ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-[#1E88E5] focus:outline-none text-sm bg-white text-[#0f172a]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-[#64748b] mb-1.5">Betreff</label>
                <input value={editing.subject} onChange={(e) => setEditing({ ...editing, subject: e.target.value })} data-testid="template-subject" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-[#1E88E5] focus:outline-none text-sm bg-white text-[#0f172a]" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-[#64748b] mb-1.5">Nachricht</label>
                <textarea value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} data-testid="template-body" rows={12} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-[#1E88E5] focus:outline-none text-sm bg-white text-[#0f172a] resize-y font-mono" />
                <p className="text-[11px] text-[#94a3b8] mt-1">Tipp: <code>{"{{name}}"}</code> wird beim Senden mit dem Empfängernamen ersetzt.</p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setEditing(null)} className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0f172a] font-bold text-sm">Abbrechen</button>
                <button onClick={save} disabled={saving || !editing.name || !editing.subject} data-testid="save-template-btn" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#E63946] hover:bg-[#c5303d] disabled:opacity-50 text-white font-bold text-sm">
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
