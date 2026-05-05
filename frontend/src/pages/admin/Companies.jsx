import React, { useCallback, useEffect, useState } from "react";
import { Loader2, Save, Plus, Trash2, Edit3, X, Building2, Star } from "lucide-react";
import api from "../../api";

const EMPTY = {
  name: "", street: "", zip: "", city: "", country: "CH", vat: "", email: "", phone: "",
  iban: "", logoBase64: "", invoicePrefix: "RW-", nextInvoiceNumber: 1, nextOfferNumber: 1,
  paymentTerms: "Zahlbar innert 30 Tagen via beigefügtem QR-Code.",
  defaultVatRate: 8.1, currency: "CHF", language: "de", isDefault: false, order: 0,
};

export default function Companies() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/admin/companies");
      setItems(r.data);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const { id, createdAt, ...rest } = editing;
      // ensure numbers
      rest.nextInvoiceNumber = Number(rest.nextInvoiceNumber) || 1;
      rest.nextOfferNumber = Number(rest.nextOfferNumber) || 1;
      rest.defaultVatRate = parseFloat(rest.defaultVatRate) || 8.1;
      if (id) {
        const r = await api.put(`/admin/companies/${id}`, rest);
        setItems((arr) => arr.map((x) => (x.id === id ? r.data : x)));
      } else {
        const r = await api.post("/admin/companies", rest);
        setItems((arr) => [...arr, r.data]);
      }
      setEditing(null);
    } catch (e) { alert(e.response?.data?.detail || "Fehler"); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!window.confirm("Firma wirklich löschen?")) return;
    await api.delete(`/admin/companies/${id}`);
    setItems((arr) => arr.filter((x) => x.id !== id));
  };

  const setDefault = async (id) => {
    await api.post(`/admin/companies/${id}/set-default`);
    setItems((arr) => arr.map((x) => ({ ...x, isDefault: x.id === id })));
  };

  const handleLogo = (file, setter) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setter(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div data-testid="companies-page">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0f172a]">Firmen / Mandanten</h1>
          <p className="text-[#64748b] mt-1">Mehrere Firmen mit eigenem Logo und IBAN für Rechnungen / Offerten.</p>
        </div>
        <button onClick={() => setEditing({ ...EMPTY })} data-testid="new-company-btn" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#E63946] hover:bg-[#c5303d] text-white font-bold text-sm">
          <Plus size={15} /> Neue Firma
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {loading ? (
          <div className="col-span-full p-12 text-center"><Loader2 className="animate-spin mx-auto" /></div>
        ) : items.length === 0 ? (
          <div className="col-span-full p-12 text-center text-[#64748b] bg-white rounded-2xl">Noch keine Firma angelegt.</div>
        ) : items.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl shadow-card p-5 relative">
            {c.isDefault && (
              <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-1 rounded-full"><Star size={11} /> Standard</span>
            )}
            <div className="flex items-center gap-3 mb-3">
              {c.logoBase64 ? (
                <img src={c.logoBase64} alt="logo" className="w-12 h-12 object-contain bg-slate-50 rounded-lg p-1" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center"><Building2 size={20} className="text-[#64748b]" /></div>
              )}
              <div className="min-w-0">
                <div className="font-extrabold text-[#0f172a] truncate">{c.name}</div>
                <div className="text-xs text-[#64748b] truncate">{c.zip} {c.city}</div>
              </div>
            </div>
            <div className="text-xs text-[#64748b] space-y-0.5 mb-3 break-all">
              <div><b>IBAN:</b> {c.iban || "—"}</div>
              <div><b>MwSt:</b> {c.vat || "—"}</div>
              <div><b>Präfix:</b> {c.invoicePrefix} · Nächste RG: {c.nextInvoiceNumber}</div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {!c.isDefault && (
                <button onClick={() => setDefault(c.id)} className="text-xs px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold">Als Standard</button>
              )}
              <button onClick={() => setEditing({ ...c })} data-testid={`edit-company-${c.id}`} className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#1E88E5] hover:text-white font-bold inline-flex items-center gap-1"><Edit3 size={12} /> Bearbeiten</button>
              <button onClick={() => remove(c.id)} className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#E63946] hover:text-white font-bold inline-flex items-center gap-1"><Trash2 size={12} /></button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#0f172a] text-white p-5 rounded-t-2xl flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2"><Building2 size={18} /><h2 className="text-lg font-extrabold">{editing.id ? "Firma bearbeiten" : "Neue Firma"}</h2></div>
              <button onClick={() => setEditing(null)} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid md:grid-cols-2 gap-3">
                <Field label="Firmenname *"><input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} data-testid="company-name" className={inp} /></Field>
                <Field label="MwSt-Nr"><input value={editing.vat} onChange={(e) => setEditing({ ...editing, vat: e.target.value })} className={inp} /></Field>
                <Field label="Strasse"><input value={editing.street} onChange={(e) => setEditing({ ...editing, street: e.target.value })} className={inp} /></Field>
                <div className="grid grid-cols-3 gap-2">
                  <Field label="PLZ"><input value={editing.zip} onChange={(e) => setEditing({ ...editing, zip: e.target.value })} className={inp} /></Field>
                  <div className="col-span-2"><Field label="Ort"><input value={editing.city} onChange={(e) => setEditing({ ...editing, city: e.target.value })} className={inp} /></Field></div>
                </div>
                <Field label="E-Mail"><input value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} className={inp} /></Field>
                <Field label="Telefon"><input value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} className={inp} /></Field>
                <Field label="IBAN *"><input value={editing.iban} onChange={(e) => setEditing({ ...editing, iban: e.target.value })} data-testid="company-iban" className={inp} placeholder="CH4431999123000889012" /></Field>
                <Field label="Land"><input value={editing.country} onChange={(e) => setEditing({ ...editing, country: e.target.value })} className={inp} /></Field>
              </div>

              <Field label="Logo (PNG / JPG, max. 1 MB)">
                <div className="flex items-center gap-3">
                  {editing.logoBase64 && <img src={editing.logoBase64} alt="logo preview" className="w-16 h-16 object-contain bg-slate-50 rounded-lg p-1 border border-slate-200" />}
                  <label className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0f172a] text-sm font-bold cursor-pointer">
                    {editing.logoBase64 ? "Logo ersetzen" : "Logo hochladen"}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogo(e.target.files?.[0], (b64) => setEditing((d) => ({ ...d, logoBase64: b64 })))} data-testid="company-logo-upload" />
                  </label>
                  {editing.logoBase64 && <button onClick={() => setEditing((d) => ({ ...d, logoBase64: "" }))} className="text-xs text-[#E63946] font-bold">Entfernen</button>}
                </div>
              </Field>

              <div className="grid md:grid-cols-3 gap-3">
                <Field label="Rechnungs-Präfix"><input value={editing.invoicePrefix} onChange={(e) => setEditing({ ...editing, invoicePrefix: e.target.value })} className={inp} /></Field>
                <Field label="Nächste Rechnungsnummer"><input type="number" value={editing.nextInvoiceNumber} onChange={(e) => setEditing({ ...editing, nextInvoiceNumber: e.target.value })} className={inp} /></Field>
                <Field label="Nächste Offerten-Nummer"><input type="number" value={editing.nextOfferNumber} onChange={(e) => setEditing({ ...editing, nextOfferNumber: e.target.value })} className={inp} /></Field>
                <Field label="Standard-MwSt %"><input type="number" step="0.1" value={editing.defaultVatRate} onChange={(e) => setEditing({ ...editing, defaultVatRate: e.target.value })} className={inp} /></Field>
                <Field label="Währung"><input value={editing.currency} onChange={(e) => setEditing({ ...editing, currency: e.target.value })} className={inp} /></Field>
                <Field label="Sprache"><select value={editing.language} onChange={(e) => setEditing({ ...editing, language: e.target.value })} className={inp}><option value="de">Deutsch</option><option value="fr">Französisch</option><option value="it">Italienisch</option><option value="en">Englisch</option></select></Field>
              </div>
              <Field label="Zahlungsbedingungen"><textarea value={editing.paymentTerms} onChange={(e) => setEditing({ ...editing, paymentTerms: e.target.value })} rows={2} className={inp} /></Field>

              <label className="flex items-center gap-2 select-none">
                <input type="checkbox" checked={!!editing.isDefault} onChange={(e) => setEditing({ ...editing, isDefault: e.target.checked })} className="w-4 h-4 accent-[#E63946]" />
                <span className="text-sm font-semibold">Als Standard-Firma verwenden</span>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button onClick={() => setEditing(null)} className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0f172a] font-bold text-sm">Abbrechen</button>
                <button onClick={save} disabled={saving || !editing.name} data-testid="save-company-btn" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#E63946] hover:bg-[#c5303d] disabled:opacity-50 text-white font-bold text-sm">
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

const inp = "w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-[#1E88E5] focus:outline-none text-sm bg-white text-[#0f172a]";
function Field({ label, children }) {
  return <label className="block"><span className="block text-xs font-bold uppercase tracking-wider text-[#64748b] mb-1.5">{label}</span>{children}</label>;
}
