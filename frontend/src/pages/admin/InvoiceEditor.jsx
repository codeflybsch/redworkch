import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Loader2, Save, Plus, Trash2, ArrowLeft, Eye, Send, FileDown, Package } from "lucide-react";
import api, { tokenStorage, API } from "../../api";

const EMPTY = {
  companyId: "", title: "", intro: "", notes: "",
  clientName: "", clientStreet: "", clientZip: "", clientCity: "", clientCountry: "CH", clientEmail: "",
  issueDate: new Date().toISOString().slice(0, 10), dueDate: "",
  items: [], vatRate: null, currency: "CHF", reference: "", status: "draft",
  recurring: false, recurringInterval: "monthly", recurringNextDate: "", recurringEndDate: "",
};

const inp = "w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-[#1E88E5] focus:outline-none text-sm bg-white text-[#0f172a]";

export default function InvoiceEditor({ mode = "invoice" }) {
  const isOffer = mode === "offer";
  const path = isOffer ? "offers" : "invoices";
  const label = isOffer ? "Offerte" : "Rechnung";

  const { id } = useParams();
  const nav = useNavigate();

  const [doc, setDoc] = useState(EMPTY);
  const [companies, setCompanies] = useState([]);
  const [products, setProducts] = useState([]);
  const [cats, setCats] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [productPickerOpen, setProductPickerOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [co, pr, ca, tp] = await Promise.all([
        api.get("/admin/companies"),
        api.get("/admin/products"),
        api.get("/admin/product-categories"),
        api.get("/admin/invoice-templates"),
      ]);
      setCompanies(co.data); setProducts(pr.data); setCats(ca.data); setTemplates(tp.data);
      if (id) {
        const r = await api.get(`/admin/invoices/${id}`);
        setDoc({ ...EMPTY, ...r.data });
      } else {
        const def = co.data.find((c) => c.isDefault) || co.data[0];
        if (def) setDoc((d) => ({ ...d, companyId: def.id, vatRate: def.defaultVatRate, currency: def.currency || "CHF" }));
      }
    } finally { setLoading(false); }
  }, [id]);
  useEffect(() => { load(); }, [load]);

  const totals = useMemo(() => {
    const subtotal = doc.items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0), 0);
    const vat = subtotal * ((Number(doc.vatRate) || 0) / 100);
    return { subtotal: subtotal.toFixed(2), vat: vat.toFixed(2), total: (subtotal + vat).toFixed(2) };
  }, [doc.items, doc.vatRate]);

  const addItem = (preset = {}) => setDoc((d) => ({ ...d, items: [...d.items, { description: "", quantity: 1, unitPrice: 0, ...preset }] }));
  const updItem = (idx, patch) => setDoc((d) => ({ ...d, items: d.items.map((it, i) => i === idx ? { ...it, ...patch } : it) }));
  const remItem = (idx) => setDoc((d) => ({ ...d, items: d.items.filter((_, i) => i !== idx) }));

  const addFromProduct = (p) => addItem({ productId: p.id, description: p.name + (p.description ? `\n${p.description}` : ""), unitPrice: Number(p.unitPrice), quantity: 1 });

  const save = async () => {
    if (!doc.clientName.trim()) { setFeedback({ type: "err", text: "Bitte Kundenname eingeben" }); return; }
    if (doc.items.length === 0) { setFeedback({ type: "err", text: "Bitte mindestens eine Position hinzufügen" }); return; }
    setSaving(true); setFeedback(null);
    try {
      const payload = { ...doc };
      // sanitize numbers
      payload.items = doc.items.map((it) => ({ description: it.description, quantity: Number(it.quantity) || 0, unitPrice: Number(it.unitPrice) || 0, productId: it.productId || "" }));
      payload.vatRate = doc.vatRate === null || doc.vatRate === "" ? null : Number(doc.vatRate);
      delete payload.id; delete payload.createdAt; delete payload.number;
      delete payload.subtotal; delete payload.vatAmount; delete payload.total;
      delete payload.sentAt; delete payload.paidAt; delete payload.type;

      let saved;
      if (id) {
        const r = await api.put(`/admin/${path}/${id}`, payload);
        saved = r.data;
      } else {
        const r = await api.post(`/admin/${path}`, payload);
        saved = r.data;
        nav(`/admin/${path}/${saved.id}`, { replace: true });
      }
      setDoc({ ...EMPTY, ...saved });
      setFeedback({ type: "ok", text: `${label} gespeichert (${saved.number})` });
    } catch (e) {
      setFeedback({ type: "err", text: e.response?.data?.detail || "Fehler beim Speichern" });
    } finally { setSaving(false); }
  };

  const previewWithToken = async (action) => {
    const token = tokenStorage.get();
    const url = `${API}/admin/${path}/${id}/${action}`;
    try {
      const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (action === "preview") {
        const html = await r.text();
        const w = window.open("", "_blank");
        if (w) { w.document.open(); w.document.write(html); w.document.close(); }
      } else {
        if (!r.ok) {
          let msg = `HTTP ${r.status}`; try { msg = (await r.json()).detail || msg; } catch (e) { /* ignore */ }
          throw new Error(msg);
        }
        const blob = await r.blob();
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${label}-${doc.number || id}.pdf`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      }
    } catch (e) { setFeedback({ type: "err", text: e.message || "Fehler" }); }
  };

  const sendDoc = async () => {
    if (!doc.clientEmail) { setFeedback({ type: "err", text: "Bitte erst Kundennachricht E-Mail eintragen und speichern." }); return; }
    if (!window.confirm(`${label} an ${doc.clientEmail} senden?`)) return;
    setSaving(true);
    try {
      const r = await api.post(`/admin/${path}/${id}/send`, { toEmail: doc.clientEmail });
      if (r.data.ok) {
        setFeedback({ type: "ok", text: `Gesendet an ${r.data.to}` });
        setDoc((d) => ({ ...d, status: "sent" }));
      } else setFeedback({ type: "err", text: `Fehler: ${r.data.error}` });
    } catch (e) { setFeedback({ type: "err", text: e.response?.data?.detail || "Fehler" }); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  if (companies.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-8 text-center">
        <h2 className="text-xl font-bold text-[#0f172a]">Bitte zuerst eine Firma anlegen</h2>
        <p className="text-[#64748b] mt-2">Du brauchst mindestens eine Firma mit IBAN, um Rechnungen zu erstellen.</p>
        <Link to="/admin/companies" className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-lg bg-[#E63946] text-white font-bold text-sm">Zur Firmenverwaltung</Link>
      </div>
    );
  }

  return (
    <div data-testid="invoice-editor">
      <div className="flex items-center gap-3 flex-wrap">
        <Link to={`/admin/${path}`} className="text-[#64748b] hover:text-[#0f172a] inline-flex items-center gap-1 text-sm"><ArrowLeft size={15} /> Zurück</Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a]">{id ? `${label} bearbeiten` : `Neue ${label}`}</h1>
        {doc.number && <span className="text-xs font-mono px-2 py-1 bg-slate-100 rounded">{doc.number}</span>}
      </div>

      {feedback && (
        <div className={`mt-3 text-sm rounded-lg p-3 ${feedback.type === "ok" ? "bg-emerald-50 border border-emerald-200 text-emerald-800" : "bg-red-50 border border-red-200 text-red-800"}`}>
          {feedback.text}
        </div>
      )}

      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {!id && templates.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-3 flex-wrap">
              <span className="text-sm font-bold text-[#0f172a]">⚡️ Vorlage laden:</span>
              <select
                onChange={(e) => {
                  const tpl = templates.find((t) => t.id === e.target.value);
                  if (tpl) {
                    setDoc((d) => ({
                      ...d,
                      title: tpl.title || d.title,
                      notes: tpl.notes || d.notes,
                      intro: tpl.intro || d.intro,
                      items: [...(d.items || []), ...(tpl.items || []).map((it) => ({ ...it }))],
                    }));
                    setFeedback({ type: "ok", text: `Vorlage "${tpl.name}" geladen` });
                  }
                  e.target.value = "";
                }}
                data-testid="load-tpl-select"
                className="text-sm px-3 py-1.5 rounded-lg border border-blue-300 bg-white text-[#0f172a] font-semibold flex-1 min-w-[200px]"
              >
                <option value="">— Vorlage wählen —</option>
                {templates.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.items?.length || 0} Pos.)</option>)}
              </select>
            </div>
          )}

          <Card title="Firma & Dokument-Daten">
            <div className="grid md:grid-cols-2 gap-3">
              <Field label="Eigene Firma">
                <select value={doc.companyId || ""} onChange={(e) => setDoc({ ...doc, companyId: e.target.value })} data-testid="select-company" className={inp}>
                  {companies.map((c) => <option key={c.id} value={c.id}>{c.name}{c.isDefault ? " (Standard)" : ""}</option>)}
                </select>
              </Field>
              <Field label="Titel"><input value={doc.title || ""} onChange={(e) => setDoc({ ...doc, title: e.target.value })} placeholder={`${label} für Webdesign-Projekt`} className={inp} /></Field>
              <Field label="Datum"><input type="date" value={doc.issueDate || ""} onChange={(e) => setDoc({ ...doc, issueDate: e.target.value })} className={inp} /></Field>
              {!isOffer && <Field label="Fällig bis"><input type="date" value={doc.dueDate || ""} onChange={(e) => setDoc({ ...doc, dueDate: e.target.value })} className={inp} /></Field>}
              <Field label="MwSt %"><input type="number" step="0.1" value={doc.vatRate ?? ""} onChange={(e) => setDoc({ ...doc, vatRate: e.target.value === "" ? null : Number(e.target.value) })} placeholder="aus Firma" className={inp} /></Field>
              <Field label="Währung"><input value={doc.currency || "CHF"} onChange={(e) => setDoc({ ...doc, currency: e.target.value })} className={inp} /></Field>
              <Field label="Referenz / Bestellnr."><input value={doc.reference || ""} onChange={(e) => setDoc({ ...doc, reference: e.target.value })} className={inp} /></Field>
            </div>
            <Field label="Einleitung (optional)"><textarea value={doc.intro || ""} onChange={(e) => setDoc({ ...doc, intro: e.target.value })} rows={2} className={inp} /></Field>
          </Card>

          <Card title="Kunde">
            <div className="grid md:grid-cols-2 gap-3">
              <Field label="Name *"><input value={doc.clientName} onChange={(e) => setDoc({ ...doc, clientName: e.target.value })} data-testid="client-name" className={inp} /></Field>
              <Field label="E-Mail"><input type="email" value={doc.clientEmail || ""} onChange={(e) => setDoc({ ...doc, clientEmail: e.target.value })} data-testid="client-email" className={inp} /></Field>
              <Field label="Strasse"><input value={doc.clientStreet || ""} onChange={(e) => setDoc({ ...doc, clientStreet: e.target.value })} className={inp} /></Field>
              <div className="grid grid-cols-3 gap-2">
                <Field label="PLZ"><input value={doc.clientZip || ""} onChange={(e) => setDoc({ ...doc, clientZip: e.target.value })} className={inp} /></Field>
                <div className="col-span-2"><Field label="Ort"><input value={doc.clientCity || ""} onChange={(e) => setDoc({ ...doc, clientCity: e.target.value })} className={inp} /></Field></div>
              </div>
            </div>
          </Card>

          <Card title="Positionen" right={(
            <div className="flex gap-2">
              <button onClick={() => setProductPickerOpen(true)} data-testid="open-product-picker" className="px-3 py-1.5 rounded-lg bg-[#1E88E5] hover:bg-[#1976d2] text-white text-xs font-bold inline-flex items-center gap-1"><Package size={12} /> Aus Katalog</button>
              <button onClick={() => addItem()} data-testid="add-item" className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0f172a] text-xs font-bold inline-flex items-center gap-1"><Plus size={12} /> Leere Position</button>
            </div>
          )}>
            {doc.items.length === 0 ? (
              <p className="text-sm text-[#64748b] text-center py-6">Noch keine Position. Klick auf <b>Aus Katalog</b> für vorgefertigte Produkte.</p>
            ) : (
              <div className="space-y-3">
                {doc.items.map((it, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-start bg-slate-50 rounded-xl p-3" data-testid={`item-row-${idx}`}>
                    <div className="col-span-12 sm:col-span-6">
                      <textarea value={it.description} onChange={(e) => updItem(idx, { description: e.target.value })} placeholder="Beschreibung" rows={2} className={inp} />
                    </div>
                    <div className="col-span-3 sm:col-span-2">
                      <input type="number" step="0.5" value={it.quantity} onChange={(e) => updItem(idx, { quantity: e.target.value })} placeholder="Menge" className={inp} />
                    </div>
                    <div className="col-span-5 sm:col-span-2">
                      <input type="number" step="0.01" value={it.unitPrice} onChange={(e) => updItem(idx, { unitPrice: e.target.value })} placeholder="Preis" className={inp} />
                    </div>
                    <div className="col-span-3 sm:col-span-1 text-right text-sm font-bold text-[#0f172a] py-2">
                      {((Number(it.quantity) || 0) * (Number(it.unitPrice) || 0)).toFixed(2)}
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button onClick={() => remItem(idx)} className="w-9 h-9 rounded-lg bg-white hover:bg-[#E63946] hover:text-white flex items-center justify-center"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="Anmerkungen / Hinweise">
            <textarea value={doc.notes || ""} onChange={(e) => setDoc({ ...doc, notes: e.target.value })} rows={3} className={inp} placeholder="Zusätzliche Informationen, die auf der Rechnung erscheinen sollen." />
          </Card>

          {!isOffer && (
            <Card title="🔁 Wiederkehrende Rechnung (Abo)">
              <label className="flex items-center gap-2 select-none mb-3">
                <input type="checkbox" checked={!!doc.recurring} onChange={(e) => setDoc({ ...doc, recurring: e.target.checked })} data-testid="recurring-toggle" className="w-4 h-4 accent-[#E63946]" />
                <span className="text-sm font-semibold">Diese Rechnung automatisch wiederholen</span>
              </label>
              {doc.recurring && (
                <div className="grid md:grid-cols-3 gap-3">
                  <Field label="Intervall">
                    <select value={doc.recurringInterval || "monthly"} onChange={(e) => setDoc({ ...doc, recurringInterval: e.target.value })} className={inp}>
                      <option value="monthly">Monatlich</option>
                      <option value="quarterly">Vierteljährlich</option>
                      <option value="yearly">Jährlich</option>
                    </select>
                  </Field>
                  <Field label="Nächstes Erstelldatum"><input type="date" value={doc.recurringNextDate || ""} onChange={(e) => setDoc({ ...doc, recurringNextDate: e.target.value })} className={inp} /></Field>
                  <Field label="Endet am (optional)"><input type="date" value={doc.recurringEndDate || ""} onChange={(e) => setDoc({ ...doc, recurringEndDate: e.target.value })} className={inp} /></Field>
                </div>
              )}
              {doc.recurring && (
                <p className="text-xs text-[#64748b] mt-2">💡 Die Rechnung wird als Vorlage verwendet. Beim Auslösen (Button "Wiederholungen jetzt erzeugen" in der Rechnungsliste) werden automatisch neue Rechnungen mit dem heutigen Datum erstellt.</p>
              )}
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-card p-5 sticky top-4">
            <h3 className="text-lg font-extrabold text-[#0f172a]">Zusammenfassung</h3>
            <div className="text-sm space-y-1.5 mt-3">
              <Row label="Zwischensumme" value={`${doc.currency || "CHF"} ${totals.subtotal}`} />
              <Row label={`MwSt (${doc.vatRate ?? "—"}%)`} value={`${doc.currency || "CHF"} ${totals.vat}`} />
              <div className="border-t border-slate-200 mt-2 pt-2 flex justify-between font-extrabold text-[#0f172a] text-base">
                <span>Total</span><span>{doc.currency || "CHF"} {totals.total}</span>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <button onClick={save} disabled={saving} data-testid="save-doc-btn" className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#22C55E] hover:bg-[#16a34a] disabled:opacity-50 text-white font-bold text-sm">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Speichern
              </button>
              {id && (
                <>
                  <button onClick={() => previewWithToken("preview")} data-testid="preview-btn" className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0f172a] font-bold text-sm"><Eye size={14} /> Vorschau</button>
                  <button onClick={() => previewWithToken("pdf")} data-testid="pdf-btn" className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#1E88E5] hover:bg-[#1976d2] text-white font-bold text-sm"><FileDown size={14} /> PDF herunterladen</button>
                  <button onClick={sendDoc} disabled={!doc.clientEmail} data-testid="send-btn" className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#E63946] hover:bg-[#c5303d] disabled:opacity-50 text-white font-bold text-sm"><Send size={14} /> An Kunde senden</button>
                  {!doc.clientEmail && <p className="text-[11px] text-amber-700 text-center">Erst Kunden-E-Mail eintragen und speichern</p>}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {productPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setProductPickerOpen(false)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#0f172a] text-white p-4 rounded-t-2xl flex items-center justify-between sticky top-0 z-10">
              <h2 className="text-lg font-extrabold">Aus Katalog wählen</h2>
              <button onClick={() => setProductPickerOpen(false)} className="text-white/70 hover:text-white">✕</button>
            </div>
            <div className="p-4">
              {cats.length > 0 && (
                <div className="space-y-4">
                  {cats.map((c) => {
                    const list = products.filter((p) => p.categoryId === c.id);
                    if (list.length === 0) return null;
                    return (
                      <div key={c.id}>
                        <h3 className="text-sm font-extrabold text-[#0f172a] uppercase tracking-wider mb-2">{c.name}</h3>
                        <div className="space-y-1">
                          {list.map((p) => (
                            <button key={p.id} onClick={() => { addFromProduct(p); setProductPickerOpen(false); }} data-testid={`pick-${p.id}`} className="w-full flex items-center justify-between gap-4 bg-slate-50 hover:bg-slate-100 px-3 py-2.5 rounded-lg text-left">
                              <div className="min-w-0"><div className="text-sm font-semibold text-[#0f172a]">{p.name}</div><div className="text-xs text-[#64748b] truncate">{p.description}</div></div>
                              <div className="text-sm font-bold text-[#0f172a] whitespace-nowrap">CHF {Number(p.unitPrice).toFixed(2)} / {p.unit}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Items without category */}
              {products.filter((p) => !p.categoryId).length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-extrabold text-[#0f172a] uppercase tracking-wider mb-2">Weitere</h3>
                  <div className="space-y-1">
                    {products.filter((p) => !p.categoryId).map((p) => (
                      <button key={p.id} onClick={() => { addFromProduct(p); setProductPickerOpen(false); }} className="w-full flex items-center justify-between gap-4 bg-slate-50 hover:bg-slate-100 px-3 py-2.5 rounded-lg text-left">
                        <div><div className="text-sm font-semibold text-[#0f172a]">{p.name}</div></div>
                        <div className="text-sm font-bold text-[#0f172a]">CHF {Number(p.unitPrice).toFixed(2)}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {products.length === 0 && (
                <div className="text-center py-8 text-[#64748b]">Keine Produkte im Katalog. <Link to="/admin/products" className="text-[#1E88E5] font-bold">Jetzt anlegen</Link>.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ title, right, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-5">
      <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
        <h3 className="text-base font-extrabold text-[#0f172a]">{title}</h3>
        {right}
      </div>
      {children}
    </div>
  );
}
function Field({ label, children }) {
  return <label className="block mb-2"><span className="block text-[11px] font-bold uppercase tracking-wider text-[#64748b] mb-1">{label}</span>{children}</label>;
}
function Row({ label, value }) { return <div className="flex justify-between"><span className="text-[#64748b]">{label}</span><span className="font-semibold text-[#0f172a]">{value}</span></div>; }
