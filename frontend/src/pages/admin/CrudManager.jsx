import React, { useCallback, useEffect, useState } from "react";
import { Plus, Edit2, Trash2, X, Loader2, Save } from "lucide-react";
import api from "../../api";

/**
 * Generic CRUD manager
 *
 * Props:
 *  - title: page title
 *  - resource: api path under /admin (e.g. "projects")
 *  - publicResource: api path for public list (e.g. "projects")
 *  - fields: [{ key, label, type: text|textarea|select|number, options?, required }]
 *  - columns: [{ key, label, render? }]
 *  - empty: empty form object
 */
export default function CrudManager({ title, resource, publicResource, fields, columns, empty }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get(`/${publicResource}`);
      setItems(r.data);
    } finally {
      setLoading(false);
    }
  }, [publicResource]);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => setForm({ ...empty });
  const openEdit = (item) => setForm({ ...item });
  const close = () => setForm(null);

  const submit = async () => {
    setSubmitting(true);
    try {
      const payload = { ...form };
      delete payload.id;
      delete payload.createdAt;
      if (payload.order != null) payload.order = Number(payload.order) || 0;
      if (payload.rating != null) payload.rating = Number(payload.rating) || 5;

      if (form.id) {
        await api.put(`/admin/${resource}/${form.id}`, payload);
      } else {
        await api.post(`/admin/${resource}`, payload);
      }
      await load();
      close();
    } catch (e) {
      alert(e.response?.data?.detail || "Fehler beim Speichern");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Wirklich löschen?")) return;
    await api.delete(`/admin/${resource}/${id}`);
    setItems((arr) => arr.filter((x) => x.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0f172a]">{title}</h1>
          <p className="text-[#64748b] mt-1">{items.length} Einträge</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-[#E63946] hover:bg-[#d22c39] text-white px-5 py-2.5 rounded-full font-bold transition"
        >
          <Plus size={18} /> Neu hinzufügen
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto" /></div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-[#64748b]">Noch keine Einträge.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f8fafc] border-b border-slate-200">
                <tr>
                  {columns.map((c) => (
                    <th key={c.key} className="p-4 text-xs uppercase font-bold text-[#64748b]">{c.label}</th>
                  ))}
                  <th className="p-4 text-right text-xs uppercase font-bold text-[#64748b]">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-b border-slate-100 hover:bg-slate-50">
                    {columns.map((c) => (
                      <td key={c.key} className="p-4 text-sm text-[#0f172a] align-top max-w-xs">
                        {c.render ? c.render(it) : <span className="line-clamp-2">{it[c.key]}</span>}
                      </td>
                    ))}
                    <td className="p-4 text-right">
                      <div className="inline-flex gap-2">
                        <button onClick={() => openEdit(it)} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-[#1E88E5] hover:text-white flex items-center justify-center transition"><Edit2 size={15} /></button>
                        <button onClick={() => remove(it.id)} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-[#E63946] hover:text-white flex items-center justify-center transition"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {form && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={close}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#0f172a] text-white p-5 rounded-t-2xl flex items-start justify-between sticky top-0 z-10">
              <h2 className="text-xl font-extrabold">{form.id ? "Bearbeiten" : "Neu erstellen"}</h2>
              <button onClick={close} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              {fields.map((f) => (
                <div key={f.key}>
                  <label className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
                    {f.label} {f.required && <span className="text-[#E63946]">*</span>}
                  </label>
                  {f.type === "textarea" ? (
                    <textarea
                      rows={f.rows || 4}
                      value={form[f.key] || ""}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      className="w-full mt-1 p-3 rounded-xl border-2 border-[#e2e8f0] focus:border-[#E63946] outline-none resize-none transition"
                    />
                  ) : f.type === "select" ? (
                    <select
                      value={form[f.key] || ""}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      className="w-full mt-1 p-3 rounded-xl border-2 border-[#e2e8f0] focus:border-[#E63946] outline-none transition"
                    >
                      <option value="">— wählen —</option>
                      {f.options.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={f.type || "text"}
                      value={form[f.key] ?? ""}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      className="w-full mt-1 p-3 rounded-xl border-2 border-[#e2e8f0] focus:border-[#E63946] outline-none transition"
                    />
                  )}
                  {f.hint && <p className="text-xs text-[#94a3b8] mt-1">{f.hint}</p>}
                </div>
              ))}
            </div>
            <div className="p-5 bg-slate-50 border-t border-slate-200 flex gap-3 justify-end sticky bottom-0">
              <button onClick={close} className="px-5 py-2.5 rounded-full font-semibold text-[#64748b] hover:bg-slate-200 transition">Abbrechen</button>
              <button
                onClick={submit}
                disabled={submitting}
                className="flex items-center gap-2 bg-[#22C55E] hover:bg-[#16a34a] text-white px-6 py-2.5 rounded-full font-bold disabled:opacity-50 transition"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
