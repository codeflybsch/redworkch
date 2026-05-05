import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Save, Plus, Trash2, Edit3, X, Package, Layers } from "lucide-react";
import api from "../../api";

const EMPTY_PROD = { name: "", description: "", unitPrice: 0, unit: "Stk.", categoryId: "", sku: "", order: 0 };
const EMPTY_CAT = { name: "", description: "", order: 0 };

const inp = "w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-[#1E88E5] focus:outline-none text-sm bg-white text-[#0f172a]";

export default function Products() {
  const [tab, setTab] = useState("products");
  const [cats, setCats] = useState([]);
  const [prods, setProds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProd, setEditingProd] = useState(null);
  const [editingCat, setEditingCat] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, p] = await Promise.all([
        api.get("/admin/product-categories"),
        api.get("/admin/products"),
      ]);
      setCats(c.data); setProds(p.data);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const catName = useMemo(() => Object.fromEntries(cats.map((c) => [c.id, c.name])), [cats]);

  const saveProd = async () => {
    const { id, createdAt, ...rest } = editingProd;
    rest.unitPrice = parseFloat(rest.unitPrice) || 0;
    rest.order = Number(rest.order) || 0;
    if (id) {
      const r = await api.put(`/admin/products/${id}`, rest);
      setProds((arr) => arr.map((x) => (x.id === id ? r.data : x)));
    } else {
      const r = await api.post("/admin/products", rest);
      setProds((arr) => [...arr, r.data]);
    }
    setEditingProd(null);
  };
  const removeProd = async (id) => {
    if (!window.confirm("Produkt löschen?")) return;
    await api.delete(`/admin/products/${id}`);
    setProds((arr) => arr.filter((x) => x.id !== id));
  };

  const saveCat = async () => {
    const { id, createdAt, ...rest } = editingCat;
    rest.order = Number(rest.order) || 0;
    if (id) {
      const r = await api.put(`/admin/product-categories/${id}`, rest);
      setCats((arr) => arr.map((x) => (x.id === id ? r.data : x)));
    } else {
      const r = await api.post("/admin/product-categories", rest);
      setCats((arr) => [...arr, r.data]);
    }
    setEditingCat(null);
  };
  const removeCat = async (id) => {
    if (!window.confirm("Kategorie löschen? Produkte verlieren die Zuordnung.")) return;
    await api.delete(`/admin/product-categories/${id}`);
    setCats((arr) => arr.filter((x) => x.id !== id));
  };

  return (
    <div data-testid="products-page">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0f172a]">Produkte & Katalog</h1>
          <p className="text-[#64748b] mt-1">Definiere Kategorien und Produkte / Dienstleistungen mit Festpreisen für Rechnungen und Offerten.</p>
        </div>
        <button
          onClick={() => tab === "products" ? setEditingProd({ ...EMPTY_PROD }) : setEditingCat({ ...EMPTY_CAT })}
          data-testid={tab === "products" ? "new-product-btn" : "new-cat-btn"}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#E63946] hover:bg-[#c5303d] text-white font-bold text-sm"
        >
          <Plus size={15} /> {tab === "products" ? "Neues Produkt" : "Neue Kategorie"}
        </button>
      </div>

      <div className="flex gap-2 mt-5">
        <button onClick={() => setTab("products")} className={`px-4 py-2 rounded-lg text-sm font-bold inline-flex items-center gap-2 ${tab === "products" ? "bg-[#0f172a] text-white" : "bg-slate-100 text-[#0f172a]"}`}><Package size={14} /> Produkte ({prods.length})</button>
        <button onClick={() => setTab("categories")} className={`px-4 py-2 rounded-lg text-sm font-bold inline-flex items-center gap-2 ${tab === "categories" ? "bg-[#0f172a] text-white" : "bg-slate-100 text-[#0f172a]"}`}><Layers size={14} /> Kategorien ({cats.length})</button>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden mt-4">
        {loading ? <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto" /></div> :
          tab === "products" ? (
            prods.length === 0 ? <div className="p-12 text-center text-[#64748b]">Noch keine Produkte angelegt.</div> : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#f8fafc] border-b border-slate-200"><tr>
                    <th className="p-3 text-xs uppercase font-bold text-[#64748b]">Name</th>
                    <th className="p-3 text-xs uppercase font-bold text-[#64748b] hidden md:table-cell">Kategorie</th>
                    <th className="p-3 text-xs uppercase font-bold text-[#64748b] text-right">Preis</th>
                    <th className="p-3 text-xs uppercase font-bold text-[#64748b]">Einheit</th>
                    <th className="p-3 text-right text-xs uppercase font-bold text-[#64748b]">Aktionen</th>
                  </tr></thead>
                  <tbody>{prods.map((p) => (
                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3"><div className="font-semibold text-[#0f172a] text-sm">{p.name}</div>{p.description && <div className="text-xs text-[#64748b] truncate max-w-md">{p.description}</div>}</td>
                      <td className="p-3 text-xs hidden md:table-cell"><span className="px-2 py-0.5 bg-slate-100 rounded">{catName[p.categoryId] || "—"}</span></td>
                      <td className="p-3 text-right font-bold text-[#0f172a]">CHF {Number(p.unitPrice).toFixed(2)}</td>
                      <td className="p-3 text-xs text-[#64748b]">{p.unit}</td>
                      <td className="p-3 text-right"><div className="inline-flex gap-1">
                        <button onClick={() => setEditingProd({ ...p })} data-testid={`edit-product-${p.id}`} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-[#1E88E5] hover:text-white flex items-center justify-center"><Edit3 size={14} /></button>
                        <button onClick={() => removeProd(p.id)} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-[#E63946] hover:text-white flex items-center justify-center"><Trash2 size={14} /></button>
                      </div></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )
          ) : (
            cats.length === 0 ? <div className="p-12 text-center text-[#64748b]">Noch keine Kategorien.</div> : (
              <ul className="divide-y divide-slate-100">{cats.map((c) => (
                <li key={c.id} className="p-4 flex items-center justify-between gap-4">
                  <div><div className="font-bold text-[#0f172a]">{c.name}</div><div className="text-xs text-[#64748b]">{c.description}</div></div>
                  <div className="inline-flex gap-1">
                    <button onClick={() => setEditingCat({ ...c })} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-[#1E88E5] hover:text-white flex items-center justify-center"><Edit3 size={14} /></button>
                    <button onClick={() => removeCat(c.id)} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-[#E63946] hover:text-white flex items-center justify-center"><Trash2 size={14} /></button>
                  </div>
                </li>
              ))}</ul>
            )
          )}
      </div>

      {editingProd && (
        <Modal title={editingProd.id ? "Produkt bearbeiten" : "Neues Produkt"} onClose={() => setEditingProd(null)}>
          <Field label="Name *"><input value={editingProd.name} onChange={(e) => setEditingProd({ ...editingProd, name: e.target.value })} data-testid="product-name" className={inp} /></Field>
          <Field label="Beschreibung"><textarea value={editingProd.description || ""} onChange={(e) => setEditingProd({ ...editingProd, description: e.target.value })} rows={3} className={inp} /></Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Einzelpreis (CHF) *"><input type="number" step="0.01" value={editingProd.unitPrice} onChange={(e) => setEditingProd({ ...editingProd, unitPrice: e.target.value })} data-testid="product-price" className={inp} /></Field>
            <Field label="Einheit"><input value={editingProd.unit} onChange={(e) => setEditingProd({ ...editingProd, unit: e.target.value })} className={inp} /></Field>
            <Field label="SKU"><input value={editingProd.sku || ""} onChange={(e) => setEditingProd({ ...editingProd, sku: e.target.value })} className={inp} /></Field>
          </div>
          <Field label="Kategorie">
            <select value={editingProd.categoryId || ""} onChange={(e) => setEditingProd({ ...editingProd, categoryId: e.target.value })} className={inp}>
              <option value="">— ohne —</option>
              {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button onClick={() => setEditingProd(null)} className="px-4 py-2.5 rounded-lg bg-slate-100 text-[#0f172a] font-bold text-sm">Abbrechen</button>
            <button onClick={saveProd} disabled={!editingProd.name} data-testid="save-product-btn" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#E63946] hover:bg-[#c5303d] disabled:opacity-50 text-white font-bold text-sm"><Save size={15} /> Speichern</button>
          </div>
        </Modal>
      )}

      {editingCat && (
        <Modal title={editingCat.id ? "Kategorie bearbeiten" : "Neue Kategorie"} onClose={() => setEditingCat(null)}>
          <Field label="Name *"><input value={editingCat.name} onChange={(e) => setEditingCat({ ...editingCat, name: e.target.value })} data-testid="cat-name" className={inp} /></Field>
          <Field label="Beschreibung"><textarea value={editingCat.description || ""} onChange={(e) => setEditingCat({ ...editingCat, description: e.target.value })} rows={2} className={inp} /></Field>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button onClick={() => setEditingCat(null)} className="px-4 py-2.5 rounded-lg bg-slate-100 text-[#0f172a] font-bold text-sm">Abbrechen</button>
            <button onClick={saveCat} disabled={!editingCat.name} data-testid="save-cat-btn" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#E63946] hover:bg-[#c5303d] disabled:opacity-50 text-white font-bold text-sm"><Save size={15} /> Speichern</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return <label className="block mb-3"><span className="block text-xs font-bold uppercase tracking-wider text-[#64748b] mb-1.5">{label}</span>{children}</label>;
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="bg-[#0f172a] text-white p-5 rounded-t-2xl flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-lg font-extrabold">{title}</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"><X size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
