import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Save, Plus, Trash2, Edit3, X, Package, Server } from "lucide-react";
import api from "../../api";

const EMPTY_PROD = { name: "", description: "", unitPrice: 0, unit: "Monat", categoryId: "", sku: "", order: 0 };
const EMPTY_CAT = { name: "", description: "", order: 0 };
const HOSTING_FILTER = /hosting|server|vps|wartung|infrastruktur|administration|verwaltung/i;

const inp = "w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-[#1E88E5] focus:outline-none text-sm bg-white text-[#0f172a]";

export default function HostingPackagesAdmin() {
  const [cats, setCats] = useState([]);
  const [prods, setProds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProd, setEditingProd] = useState(null);
  const [editingCat, setEditingCat] = useState(null);

  const hostingCats = useMemo(() => cats.filter((c) => HOSTING_FILTER.test(c.name)), [cats]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        api.get("/admin/product-categories"),
        api.get("/admin/products"),
      ]);
      setCats(categoriesRes.data);
      setProds(productsRes.data.filter((product) => HOSTING_FILTER.test(product.name) || HOSTING_FILTER.test(categoriesRes.data.find((c) => c.id === product.categoryId)?.name || "")));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
    if (!window.confirm("Sind Sie sicher, dass Sie dieses Paket löschen möchten?")) return;
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
    if (!window.confirm("Sind Sie sicher, dass Sie diese Kategorie löschen möchten? Die Kategoriezuweisung von Produkten wird gelöscht.")) return;
    await api.delete(`/admin/product-categories/${id}`);
    setCats((arr) => arr.filter((x) => x.id !== id));
  };

  return (
    <div data-testid="hosting-packages-page">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0f172a]">Hosting- und Serverpakete</h1>
          <p className="text-[#64748b] mt-1">Verwalten Sie hier Hosting-, Server- und Infrastrukturpakete. Inhalte sind für Kunden professionell formatiert und direkt einsatzbereit.</p>
        </div>
        <button
          onClick={() => setEditingProd({ ...EMPTY_PROD })}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#E63946] hover:bg-[#c5303d] text-white font-bold text-sm"
        >
          <Plus size={15} /> Neues Hosting-Paket
        </button>
      </div>

      <div className="flex gap-2 mt-5">
        <button onClick={() => setEditingProd({ ...EMPTY_PROD })} className="px-4 py-2 rounded-lg text-sm font-bold inline-flex items-center gap-2 bg-[#0f172a] text-white"><Package size={14} /> Neues Hosting-Paket</button>
        <button onClick={() => setEditingCat({ ...EMPTY_CAT })} className="px-4 py-2 rounded-lg text-sm font-bold inline-flex items-center gap-2 bg-slate-100 text-[#0f172a]"><Server size={14} /> Neue Kategorie</button>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden mt-4">
        {loading ? (
          <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f8fafc] border-b border-slate-200"><tr>
                <th className="p-3 text-xs uppercase font-bold text-[#64748b]">Paket</th>
                <th className="p-3 text-xs uppercase font-bold text-[#64748b] hidden md:table-cell">Kategorie</th>
                <th className="p-3 text-xs uppercase font-bold text-[#64748b] text-right">Preis</th>
                <th className="p-3 text-xs uppercase font-bold text-[#64748b]">Einheit</th>
                <th className="p-3 text-right text-xs uppercase font-bold text-[#64748b]">Aktionen</th>
              </tr></thead>
              <tbody>
                {prods.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-3"><div className="font-semibold text-[#0f172a] text-sm">{p.name}</div>{p.description && <div className="text-xs text-[#64748b] truncate max-w-md">{p.description}</div>}</td>
                    <td className="p-3 text-xs hidden md:table-cell"><span className="px-2 py-0.5 bg-slate-100 rounded">{catName[p.categoryId] || "—"}</span></td>
                    <td className="p-3 text-right font-bold text-[#0f172a]">CHF {Number(p.unitPrice).toFixed(2)}</td>
                    <td className="p-3 text-xs text-[#64748b]">{p.unit}</td>
                    <td className="p-3 text-right"><div className="inline-flex gap-1">
                      <button onClick={() => setEditingProd({ ...p })} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-[#1E88E5] hover:text-white flex items-center justify-center"><Edit3 size={14} /></button>
                      <button onClick={() => removeProd(p.id)} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-[#E63946] hover:text-white flex items-center justify-center"><Trash2 size={14} /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-10 bg-white rounded-2xl shadow-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#0f172a]">Hosting-Kategorien</h2>
            <p className="text-[#64748b] mt-1">Erstellen oder bearbeiten Sie Kategorien für Hosting- und Serverpakete, um die Verwaltung zu vereinfachen.</p>
          </div>
          <button onClick={() => setEditingCat({ ...EMPTY_CAT })} className="inline-flex items-center gap-2 rounded-full bg-[#0f172a] px-5 py-3 text-sm font-bold text-white hover:bg-[#172a4a] transition">
            <Plus size={16} /> Neue Kategorie
          </button>
        </div>
        <div className="mt-6">
          {hostingCats.length === 0 ? (
            <div className="p-8 text-center text-[#64748b]">Es sind noch keine Hosting-Kategorien vorhanden. Erstellen Sie oben eine neue Kategorie.</div>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {hostingCats.map((c) => (
                <li key={c.id} className="rounded-3xl border border-slate-200 p-4 bg-slate-50 flex flex-col justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-[#0f172a]">{c.name}</h3>
                    <p className="text-sm text-[#64748b] mt-1">{c.description || "Keine Beschreibung."}</p>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditingCat({ ...c })} className="inline-flex items-center justify-center rounded-lg bg-[#1E88E5] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1669b2]">
                      <Edit3 size={14} /> Bearbeiten
                    </button>
                    <button onClick={() => removeCat(c.id)} className="inline-flex items-center justify-center rounded-lg bg-[#E63946] px-3 py-2 text-xs font-semibold text-white hover:bg-[#c5303d]">
                      <Trash2 size={14} /> Löschen
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {editingProd && (
        <Modal title={editingProd.id ? "Paket bearbeiten" : "Neues Paket"} onClose={() => setEditingProd(null)}>
          <Field label="Paketname *"><input value={editingProd.name} onChange={(e) => setEditingProd({ ...editingProd, name: e.target.value })} data-testid="product-name" className={inp} /></Field>
          <Field label="Beschreibung"><textarea value={editingProd.description || ""} onChange={(e) => setEditingProd({ ...editingProd, description: e.target.value })} rows={3} className={inp} /></Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Preis (CHF) *"><input type="number" step="0.01" value={editingProd.unitPrice} onChange={(e) => setEditingProd({ ...editingProd, unitPrice: e.target.value })} data-testid="product-price" className={inp} /></Field>
            <Field label="Einheit"><input value={editingProd.unit} onChange={(e) => setEditingProd({ ...editingProd, unit: e.target.value })} className={inp} /></Field>
            <Field label="SKU"><input value={editingProd.sku || ""} onChange={(e) => setEditingProd({ ...editingProd, sku: e.target.value })} className={inp} /></Field>
          </div>
          <Field label="Kategorie">
            <select value={editingProd.categoryId || ""} onChange={(e) => setEditingProd({ ...editingProd, categoryId: e.target.value })} className={inp}>
              <option value="">— Keine Auswahl —</option>
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
          <Field label="Kategoriename *"><input value={editingCat.name} onChange={(e) => setEditingCat({ ...editingCat, name: e.target.value })} data-testid="cat-name" className={inp} /></Field>
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
