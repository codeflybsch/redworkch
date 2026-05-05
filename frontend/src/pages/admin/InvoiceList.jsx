import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Trash2, Edit3, Eye, Send, FileDown, CheckCircle2, AlertTriangle, Search, Receipt, Copy, RefreshCw, ArrowRightLeft, Repeat } from "lucide-react";
import { Link } from "react-router-dom";
import api, { tokenStorage, API } from "../../api";

const STATUS = {
  draft: { label: "Entwurf", color: "#94a3b8" },
  sent: { label: "Gesendet", color: "#1E88E5" },
  paid: { label: "Bezahlt", color: "#22C55E" },
  overdue: { label: "Überfällig", color: "#E63946" },
};

export default function InvoiceList({ kind = "invoice" }) {
  const isOffer = kind === "offer";
  const path = isOffer ? "offers" : "invoices";
  const label = isOffer ? "Offerten" : "Rechnungen";
  const newLabel = isOffer ? "Neue Offerte" : "Neue Rechnung";

  const [items, setItems] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, c] = await Promise.all([api.get(`/admin/${path}`), api.get("/admin/companies")]);
      setItems(r.data); setCompanies(c.data);
    } finally { setLoading(false); }
  }, [path]);
  useEffect(() => { load(); }, [load]);

  const compName = useMemo(() => Object.fromEntries(companies.map((c) => [c.id, c.name])), [companies]);

  const filtered = items.filter((i) => {
    const ql = q.trim().toLowerCase();
    if (!ql) return true;
    return (i.number || "").toLowerCase().includes(ql) || (i.clientName || "").toLowerCase().includes(ql);
  });

  const remove = async (id) => {
    if (!window.confirm("Wirklich löschen?")) return;
    await api.delete(`/admin/${path}/${id}`);
    setItems((arr) => arr.filter((x) => x.id !== id));
  };

  const openPreview = (id) => {
    const token = tokenStorage.get();
    const url = `${API}/admin/${path}/${id}/preview`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.text())
      .then((html) => {
        const w = window.open("", "_blank");
        if (w) { w.document.open(); w.document.write(html); w.document.close(); }
      });
  };

  const downloadPDF = (id, number) => {
    const token = tokenStorage.get();
    const url = `${API}/admin/${path}/${id}/pdf`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => {
        if (!r.ok) {
          let msg = `HTTP ${r.status}`;
          try { msg = (await r.json()).detail || msg; } catch (e) { /* ignore */ }
          throw new Error(msg);
        }
        return r.blob();
      })
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${isOffer ? "Offerte" : "Rechnung"}-${number}.pdf`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      })
      .catch((e) => setFeedback({ type: "err", text: `PDF-Fehler: ${e.message}` }));
  };

  const sendDoc = async (item) => {
    if (!item.clientEmail) {
      const email = window.prompt("Empfänger-E-Mail eingeben:");
      if (!email) return;
      item = { ...item, clientEmail: email };
    }
    if (!window.confirm(`${isOffer ? "Offerte" : "Rechnung"} an ${item.clientEmail} senden?`)) return;
    setBusyId(item.id);
    setFeedback(null);
    try {
      const r = await api.post(`/admin/${path}/${item.id}/send`, { toEmail: item.clientEmail });
      if (r.data.ok) {
        setFeedback({ type: "ok", text: `Gesendet an ${r.data.to}` });
        setItems((arr) => arr.map((x) => x.id === item.id ? { ...x, status: "sent" } : x));
      } else {
        setFeedback({ type: "err", text: `Fehler: ${r.data.error || "unbekannt"}` });
      }
    } catch (e) {
      setFeedback({ type: "err", text: e.response?.data?.detail || "Fehler beim Senden" });
    } finally { setBusyId(null); }
  };

  const markPaid = async (id) => {
    if (!window.confirm("Als bezahlt markieren?")) return;
    await api.post(`/admin/invoices/${id}/mark-paid`);
    setItems((arr) => arr.map((x) => x.id === id ? { ...x, status: "paid" } : x));
  };

  const duplicate = async (id) => {
    try {
      const r = await api.post(`/admin/invoices/${id}/duplicate`);
      setItems((arr) => [r.data, ...arr]);
      setFeedback({ type: "ok", text: `Dupliziert: ${r.data.number}` });
    } catch (e) { setFeedback({ type: "err", text: e.response?.data?.detail || "Fehler" }); }
  };

  const convertOfferToInvoice = async (id) => {
    if (!window.confirm("Offerte in eine Rechnung umwandeln?")) return;
    try {
      const r = await api.post(`/admin/offers/${id}/convert-to-invoice`);
      setFeedback({ type: "ok", text: `Rechnung erstellt: ${r.data.number}` });
    } catch (e) { setFeedback({ type: "err", text: e.response?.data?.detail || "Fehler" }); }
  };

  const runRecurring = async () => {
    if (!window.confirm("Alle fälligen wiederkehrenden Rechnungen jetzt erzeugen?")) return;
    setFeedback(null);
    try {
      const r = await api.post(`/admin/invoices/run-recurring`);
      if (r.data.count === 0) {
        setFeedback({ type: "ok", text: "Keine fälligen Wiederholungen gefunden." });
      } else {
        setFeedback({ type: "ok", text: `${r.data.count} neue Rechnung(en) erzeugt: ${r.data.created.join(", ")}` });
        load();
      }
    } catch (e) { setFeedback({ type: "err", text: e.response?.data?.detail || "Fehler" }); }
  };

  return (
    <div data-testid={`${path}-page`}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0f172a]">{label}</h1>
          <p className="text-[#64748b] mt-1">{items.length} {label.toLowerCase()} insgesamt</p>
        </div>
        <Link to={`/admin/${path}/new`} data-testid={`new-${path}-btn`} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#E63946] hover:bg-[#c5303d] text-white font-bold text-sm">
          <Plus size={15} /> {newLabel}
        </Link>
        {!isOffer && (
          <button onClick={runRecurring} data-testid="run-recurring-btn" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-sm">
            <RefreshCw size={15} /> Wiederholungen jetzt erzeugen
          </button>
        )}
      </div>

      {feedback && (
        <div className={`mt-4 flex items-start gap-2 text-sm rounded-lg p-3 ${feedback.type === "ok" ? "bg-emerald-50 border border-emerald-200 text-emerald-800" : "bg-red-50 border border-red-200 text-red-800"}`}>
          {feedback.type === "ok" ? <CheckCircle2 size={16} className="mt-0.5" /> : <AlertTriangle size={16} className="mt-0.5" />}
          <span>{feedback.text}</span>
        </div>
      )}

      <div className="relative mt-4 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nummer / Kundenname suchen..." className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:border-[#1E88E5] focus:outline-none" />
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden mt-4">
        {loading ? <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto" /></div> :
          filtered.length === 0 ? <div className="p-12 text-center text-[#64748b]"><Receipt size={36} className="mx-auto mb-2 text-slate-300" />Noch keine {label.toLowerCase()}.</div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#f8fafc] border-b border-slate-200"><tr>
                  <th className="p-3 text-xs uppercase font-bold text-[#64748b]">Nr.</th>
                  <th className="p-3 text-xs uppercase font-bold text-[#64748b]">Kunde</th>
                  <th className="p-3 text-xs uppercase font-bold text-[#64748b] hidden md:table-cell">Firma</th>
                  <th className="p-3 text-xs uppercase font-bold text-[#64748b] hidden md:table-cell">Datum</th>
                  <th className="p-3 text-xs uppercase font-bold text-[#64748b] text-right">Total</th>
                  <th className="p-3 text-xs uppercase font-bold text-[#64748b]">Status</th>
                  <th className="p-3 text-right text-xs uppercase font-bold text-[#64748b]">Aktionen</th>
                </tr></thead>
                <tbody>{filtered.map((it) => {
                  const st = STATUS[it.status] || STATUS.draft;
                  return (
                    <tr key={it.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3 text-xs font-mono text-[#0f172a]">{it.number}</td>
                      <td className="p-3"><div className="font-semibold text-[#0f172a] text-sm">{it.clientName}</div><div className="text-xs text-[#64748b] truncate max-w-[180px]">{it.clientEmail || ""}</div></td>
                      <td className="p-3 text-xs text-[#64748b] hidden md:table-cell">{compName[it.companyId] || "—"}</td>
                      <td className="p-3 text-xs text-[#64748b] hidden md:table-cell">{it.issueDate || new Date(it.createdAt).toLocaleDateString("de-CH")}</td>
                      <td className="p-3 text-right font-bold text-[#0f172a]">CHF {Number(it.total || 0).toFixed(2)}</td>
                      <td className="p-3"><span className="text-xs font-bold px-2.5 py-1 rounded-full text-white" style={{ background: st.color }}>{st.label}</span></td>
                      <td className="p-3 text-right">
                        <div className="inline-flex gap-1">
                          <button onClick={() => openPreview(it.id)} data-testid={`preview-${it.id}`} title="Vorschau" className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-[#0f172a] hover:text-white flex items-center justify-center"><Eye size={14} /></button>
                          <button onClick={() => downloadPDF(it.id, it.number)} data-testid={`pdf-${it.id}`} title="PDF" className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-[#1E88E5] hover:text-white flex items-center justify-center"><FileDown size={14} /></button>
                          <button onClick={() => sendDoc(it)} disabled={busyId === it.id} data-testid={`send-${it.id}`} title="Per E-Mail senden" className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-[#22C55E] hover:text-white flex items-center justify-center disabled:opacity-50">
                            {busyId === it.id ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                          </button>
                          <Link to={`/admin/${path}/${it.id}`} title="Bearbeiten" className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-[#A855F7] hover:text-white flex items-center justify-center"><Edit3 size={14} /></Link>
                          <button onClick={() => duplicate(it.id)} title="Duplizieren" data-testid={`dup-${it.id}`} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-[#06B6D4] hover:text-white flex items-center justify-center"><Copy size={14} /></button>
                          {isOffer && <button onClick={() => convertOfferToInvoice(it.id)} title="In Rechnung umwandeln" data-testid={`conv-${it.id}`} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-emerald-600 hover:text-white flex items-center justify-center"><ArrowRightLeft size={14} /></button>}
                          {!isOffer && it.recurring && <span title="Wiederkehrend" className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center"><Repeat size={14} /></span>}
                          {!isOffer && it.status !== "paid" && (
                            <button onClick={() => markPaid(it.id)} title="Als bezahlt markieren" className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-emerald-600 hover:text-white flex items-center justify-center"><CheckCircle2 size={14} /></button>
                          )}
                          <button onClick={() => remove(it.id)} title="Löschen" className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-[#E63946] hover:text-white flex items-center justify-center"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}</tbody>
              </table>
            </div>
          )}
      </div>
    </div>
  );
}
