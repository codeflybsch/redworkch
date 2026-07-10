import React, { useEffect, useState } from "react";
import { Trash2, Eye, X, Phone, Mail, MessageCircle, Building, Loader2, CheckCircle2, XCircle, Send, FileSignature } from "lucide-react";
import api from "../../api";
import { serviceTypes, budgetRanges, timelineOptions } from "../../mock";

const STATUSES = [
  { id: "new", label: "Neu", color: "#E63946" },
  { id: "in_progress", label: "In Bearbeitung", color: "#F59E0B" },
  { id: "accepted", label: "Akzeptiert", color: "#2563EB" },
  { id: "signed", label: "Unterschrieben", color: "#7C3AED" },
  { id: "done", label: "Abgeschlossen", color: "#22C55E" },
  { id: "rejected", label: "Abgelehnt", color: "#94a3b8" },
];

const labelOf = (arr, id) => arr.find((x) => x.id === id)?.label || id;
const statusInfo = (id) => STATUSES.find((s) => s.id === id) || STATUSES[0];

export default function Quotes() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [decisionStatus, setDecisionStatus] = useState("");
  const [decisionReason, setDecisionReason] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [savingDecision, setSavingDecision] = useState(false);
  const [feedback, setFeedback] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get("/admin/quotes");
      setItems(r.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = filter === "all" ? items : items.filter((i) => i.status === filter);

  const updateStatus = async (id, status) => {
    await api.patch(`/admin/quotes/${id}`, { status });
    setItems((arr) => arr.map((q) => (q.id === id ? { ...q, status } : q)));
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  const openDetails = (quote) => {
    setSelected(quote);
    setDecisionReason(quote.decisionReason || "");
    setDecisionStatus("");
    setFeedback("");
  };

  const submitDecision = async () => {
    setSavingDecision(true);
    setFeedback("");
    try {
      const response = await api.post(`/admin/quotes/${selected.id}/decision`, {
        status: decisionStatus, reason: decisionReason, sendEmail,
      });
      const updated = response.data;
      setSelected(updated);
      setItems((current) => current.map((quote) => quote.id === updated.id ? updated : quote));
      setDecisionStatus("");
      setFeedback(updated.emailSent ? "Entscheidung gespeichert und E-Mail erfolgreich versendet." : `Entscheidung gespeichert. E-Mail konnte nicht versendet werden${updated.emailError ? `: ${updated.emailError}` : "."}`);
    } catch (error) {
      setFeedback(error.response?.data?.detail || "Entscheidung konnte nicht gespeichert werden.");
    } finally {
      setSavingDecision(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Diese Anfrage wirklich löschen?")) return;
    await api.delete(`/admin/quotes/${id}`);
    setItems((arr) => arr.filter((q) => q.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0f172a]">Angebot-Anfragen</h1>
          <p className="text-[#64748b] mt-1">{items.length} Anfragen insgesamt</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              filter === "all" ? "bg-[#0f172a] text-white" : "bg-white text-[#0f172a] hover:bg-slate-100"
            }`}
          >
            Alle ({items.length})
          </button>
          {STATUSES.map((s) => (
            <button
              key={s.id}
              onClick={() => setFilter(s.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                filter === s.id ? "text-white" : "bg-white text-[#0f172a] hover:bg-slate-100"
              }`}
              style={filter === s.id ? { background: s.color } : {}}
            >
              {s.label} ({items.filter((i) => i.status === s.id).length})
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#64748b]">
            <Loader2 className="animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-[#64748b]">Keine Anfragen vorhanden.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f8fafc] border-b border-slate-200">
                <tr>
                  <th className="p-4 text-xs uppercase font-bold text-[#64748b] tracking-wider">Name</th>
                  <th className="p-4 text-xs uppercase font-bold text-[#64748b] tracking-wider">Service</th>
                  <th className="p-4 text-xs uppercase font-bold text-[#64748b] tracking-wider">Budget</th>
                  <th className="p-4 text-xs uppercase font-bold text-[#64748b] tracking-wider">Datum</th>
                  <th className="p-4 text-xs uppercase font-bold text-[#64748b] tracking-wider">Status</th>
                  <th className="p-4 text-xs uppercase font-bold text-[#64748b] tracking-wider text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((q) => {
                  const st = statusInfo(q.status);
                  return (
                    <tr key={q.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="p-4">
                        <div className="font-semibold text-[#0f172a]">{q.fullName}</div>
                        <div className="text-xs text-[#64748b]">{q.email}</div>
                      </td>
                      <td className="p-4 text-sm">{labelOf(serviceTypes, q.serviceType)}</td>
                      <td className="p-4 text-sm">{labelOf(budgetRanges, q.budget)}</td>
                      <td className="p-4 text-sm text-[#64748b]">
                        {new Date(q.createdAt).toLocaleDateString("de-DE")}
                      </td>
                      <td className="p-4">
                        <span
                          className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
                          style={{ background: st.color }}
                        >
                          {st.label}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => openDetails(q)}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-[#1E88E5] hover:text-white text-[#0f172a] flex items-center justify-center transition"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => remove(q.id)}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-[#E63946] hover:text-white text-[#0f172a] flex items-center justify-center transition"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#0f172a] text-white p-6 rounded-t-2xl flex items-start justify-between sticky top-0">
              <div>
                <p className="text-[#FFC107] text-xs font-bold tracking-wider">ANFRAGE-DETAILS</p>
                <h2 className="text-2xl font-extrabold mt-1">{selected.fullName}</h2>
                <p className="text-white/70 text-sm">{new Date(selected.createdAt).toLocaleString("de-DE")}</p>
              </div>
              <button onClick={() => setSelected(null)} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <Info icon={Mail} label="E-Mail" value={selected.email} />
                <Info icon={Phone} label="Telefon" value={selected.phone || "—"} />
                <Info icon={Building} label="Firma" value={selected.company || "—"} />
                <Info icon={MessageCircle} label="Bevorzugter Kontakt" value={selected.contactMethod} />
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-bold text-[#64748b] uppercase tracking-wider">Service</p>
                <p className="font-semibold text-[#0f172a] mt-1">{labelOf(serviceTypes, selected.serviceType)}</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-[#64748b] uppercase tracking-wider">Budget</p>
                  <p className="font-semibold text-[#0f172a] mt-1">{labelOf(budgetRanges, selected.budget)}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-[#64748b] uppercase tracking-wider">Zeitrahmen</p>
                  <p className="font-semibold text-[#0f172a] mt-1">{labelOf(timelineOptions, selected.timeline)}</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-2">Projektdetails</p>
                <p className="text-sm text-[#0f172a] whitespace-pre-wrap leading-relaxed">{selected.projectDetails}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#64748b]">Projektentscheidung</p>
                    <p className="mt-1 text-sm text-slate-500">Entscheidung begründen und Kunden direkt informieren.</p>
                  </div>
                  <span className="w-fit rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background: statusInfo(selected.status).color }}>{statusInfo(selected.status).label}</span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <button onClick={() => { setDecisionStatus("accepted"); setFeedback(""); }} className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${decisionStatus === "accepted" ? "border-blue-500 bg-blue-50 text-blue-800" : "border-slate-200 hover:border-blue-300"}`}>
                    <CheckCircle2 size={22} /><span><b className="block">Projekt akzeptieren</b><small>Signaturlink erstellen</small></span>
                  </button>
                  <button onClick={() => { setDecisionStatus("rejected"); setFeedback(""); }} className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${decisionStatus === "rejected" ? "border-red-500 bg-red-50 text-red-800" : "border-slate-200 hover:border-red-300"}`}>
                    <XCircle size={22} /><span><b className="block">Anfrage ablehnen</b><small>Begründung mitteilen</small></span>
                  </button>
                </div>

                {decisionStatus && <div className="mt-5 rounded-xl bg-slate-50 p-4">
                  <label className="text-sm font-bold text-slate-800">{decisionStatus === "accepted" ? "Angebotsbedingungen und nächste Schritte" : "Begründung der Ablehnung"}
                    <textarea value={decisionReason} onChange={(event) => setDecisionReason(event.target.value)} rows={5} placeholder={decisionStatus === "accepted" ? "Beschreiben Sie Leistungsumfang, Preisrahmen und nächste Schritte..." : "Erklären Sie dem Kunden wertschätzend den Grund..."} className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white p-3 text-sm font-normal outline-none focus:border-blue-500" />
                  </label>
                  <label className="mt-3 flex items-center gap-3 text-sm font-semibold text-slate-700"><input type="checkbox" checked={sendEmail} onChange={(event) => setSendEmail(event.target.checked)} className="h-4 w-4" /> Kunden automatisch per E-Mail informieren</label>
                  <button onClick={submitDecision} disabled={savingDecision || decisionReason.trim().length < 10} className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40 ${decisionStatus === "accepted" ? "bg-blue-600 hover:bg-blue-700" : "bg-red-600 hover:bg-red-700"}`}>
                    {savingDecision ? <Loader2 className="animate-spin" size={18} /> : decisionStatus === "accepted" ? <FileSignature size={18} /> : <Send size={18} />}
                    {decisionStatus === "accepted" ? "Akzeptieren & Signaturlink senden" : "Ablehnen & Kunden informieren"}
                  </button>
                </div>}

                {feedback && <div className={`mt-4 rounded-xl px-4 py-3 text-sm font-semibold ${feedback.includes("erfolgreich") ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>{feedback}</div>}

                {selected.signatureUrl && <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50 p-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-violet-900"><FileSignature size={17} /> Online-Signaturlink</p>
                  <a href={selected.signatureUrl} target="_blank" rel="noreferrer" className="mt-2 block break-all text-xs font-semibold text-violet-700 underline">{selected.signatureUrl}</a>
                  {selected.signedAt && <p className="mt-3 text-xs font-bold text-emerald-700">Unterschrieben von {selected.signerName} am {new Date(selected.signedAt).toLocaleString("de-DE")}</p>}
                </div>}

                <div className="mt-5 border-t pt-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#64748b]">Interner Bearbeitungsstatus</p>
                  <div className="flex flex-wrap gap-2">
                    {STATUSES.filter((status) => ["new", "in_progress", "done"].includes(status.id)).map((status) => <button key={status.id} onClick={() => updateStatus(selected.id, status.id)} className={`rounded-full px-4 py-2 text-xs font-bold transition ${selected.status === status.id ? "text-white" : "bg-slate-100 text-[#0f172a] hover:bg-slate-200"}`} style={selected.status === status.id ? { background: status.color } : {}}>{status.label}</button>)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3 flex items-start gap-3">
      <Icon size={16} className="text-[#94a3b8] mt-0.5" />
      <div>
        <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">{label}</p>
        <p className="font-semibold text-[#0f172a] text-sm">{value}</p>
      </div>
    </div>
  );
}
