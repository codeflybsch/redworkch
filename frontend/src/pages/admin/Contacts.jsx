import React, { useCallback, useEffect, useState } from "react";
import { Trash2, Eye, X, Mail, Phone, Loader2, Send, AlertTriangle, CheckCircle2, Reply, Info } from "lucide-react";
import api from "../../api";

const STATUSES = [
  { id: "new", label: "Neu", color: "#E63946" },
  { id: "in_progress", label: "Gelesen", color: "#F59E0B" },
  { id: "done", label: "Beantwortet", color: "#22C55E" },
];

const statusInfo = (id) => STATUSES.find((s) => s.id === id) || STATUSES[0];

export default function Contacts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [replies, setReplies] = useState([]);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [replySubject, setReplySubject] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: "ok"|"err", text: string }
  const [emailCfg, setEmailCfg] = useState({ configured: false, from: null });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/admin/contacts");
      setItems(r.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    api.get("/admin/email-config").then((r) => setEmailCfg(r.data)).catch(() => {});
  }, [load]);

  const openContact = async (q) => {
    setSelected(q);
    setReplySubject(q.subject?.startsWith("Re:") ? q.subject : `Re: ${q.subject || ""}`);
    setReplyMessage("");
    setFeedback(null);
    setReplies([]);
    setRepliesLoading(true);
    try {
      const r = await api.get(`/admin/contacts/${q.id}/replies`);
      setReplies(r.data);
    } catch (e) {
      // ignore
    } finally {
      setRepliesLoading(false);
    }
    if (q.status === "new") {
      try {
        await api.patch(`/admin/contacts/${q.id}`, { status: "in_progress" });
        setItems((arr) => arr.map((it) => (it.id === q.id ? { ...it, status: "in_progress" } : it)));
      } catch (e) {
        // ignore
      }
    }
  };

  const closeModal = () => {
    setSelected(null);
    setReplies([]);
    setFeedback(null);
  };

  const updateStatus = async (id, status) => {
    await api.patch(`/admin/contacts/${id}`, { status });
    setItems((arr) => arr.map((q) => (q.id === id ? { ...q, status } : q)));
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  const remove = async (id) => {
    if (!window.confirm("Wirklich löschen?")) return;
    await api.delete(`/admin/contacts/${id}`);
    setItems((arr) => arr.filter((q) => q.id !== id));
    if (selected?.id === id) closeModal();
  };

  const sendReply = async () => {
    if (!selected) return;
    if (!replySubject.trim() || !replyMessage.trim()) {
      setFeedback({ type: "err", text: "Bitte Betreff und Nachricht ausfüllen." });
      return;
    }
    setSending(true);
    setFeedback(null);
    try {
      const r = await api.post(`/admin/contacts/${selected.id}/reply`, {
        subject: replySubject,
        message: replyMessage,
      });
      const newReply = r.data;
      setReplies((arr) => [...arr, newReply]);
      setReplyMessage("");
      if (newReply.emailSent) {
        setFeedback({ type: "ok", text: "Antwort erfolgreich per E-Mail gesendet." });
        setItems((arr) => arr.map((it) => (it.id === selected.id ? { ...it, status: "done" } : it)));
        setSelected({ ...selected, status: "done" });
      } else {
        setFeedback({
          type: "err",
          text: `Antwort gespeichert, aber E-Mail konnte nicht gesendet werden: ${newReply.emailError || "SMTP nicht konfiguriert"}.`,
        });
        setItems((arr) => arr.map((it) => (it.id === selected.id ? { ...it, status: "in_progress" } : it)));
        setSelected({ ...selected, status: "in_progress" });
      }
    } catch (e) {
      const detail = e?.response?.data?.detail || e?.message || "Unbekannter Fehler";
      setFeedback({ type: "err", text: `Fehler beim Senden: ${detail}` });
    } finally {
      setSending(false);
    }
  };

  const removeReply = async (rid) => {
    if (!selected) return;
    if (!window.confirm("Antwort wirklich löschen?")) return;
    await api.delete(`/admin/contacts/${selected.id}/replies/${rid}`);
    setReplies((arr) => arr.filter((r) => r.id !== rid));
  };

  return (
    <div data-testid="contacts-page">
      <h1 className="text-3xl font-extrabold text-[#0f172a]">Kontakt-Nachrichten</h1>
      <p className="text-[#64748b] mt-1">{items.length} Nachrichten insgesamt</p>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden mt-6">
        {loading ? (
          <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto" /></div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-[#64748b]">Noch keine Nachrichten.</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-[#f8fafc] border-b border-slate-200">
              <tr>
                <th className="p-4 text-xs uppercase font-bold text-[#64748b]">Name</th>
                <th className="p-4 text-xs uppercase font-bold text-[#64748b]">Betreff</th>
                <th className="p-4 text-xs uppercase font-bold text-[#64748b]">Datum</th>
                <th className="p-4 text-xs uppercase font-bold text-[#64748b]">Status</th>
                <th className="p-4 text-right text-xs uppercase font-bold text-[#64748b]">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {items.map((q) => {
                const st = statusInfo(q.status);
                return (
                  <tr key={q.id} className="border-b border-slate-100 hover:bg-slate-50" data-testid={`contact-row-${q.id}`}>
                    <td className="p-4">
                      <div className="font-semibold text-[#0f172a]">{q.fullName}</div>
                      <div className="text-xs text-[#64748b]">{q.email}</div>
                    </td>
                    <td className="p-4 text-sm">{q.subject}</td>
                    <td className="p-4 text-sm text-[#64748b]">{new Date(q.createdAt).toLocaleDateString("de-DE")}</td>
                    <td className="p-4">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full text-white" style={{ background: st.color }}>
                        {st.label}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => openContact(q)}
                          data-testid={`view-contact-${q.id}`}
                          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-[#1E88E5] hover:text-white flex items-center justify-center transition"
                          title="Details & Antworten"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => remove(q.id)}
                          data-testid={`delete-contact-${q.id}`}
                          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-[#E63946] hover:text-white flex items-center justify-center transition"
                          title="Löschen"
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
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={closeModal}>
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            data-testid="contact-detail-modal"
          >
            <div className="bg-[#0f172a] text-white p-6 rounded-t-2xl flex items-start justify-between sticky top-0 z-10">
              <div>
                <p className="text-[#FFC107] text-xs font-bold tracking-wider">NACHRICHT</p>
                <h2 className="text-2xl font-extrabold mt-1">{selected.subject}</h2>
                <p className="text-white/70 text-sm">{new Date(selected.createdAt).toLocaleString("de-DE")}</p>
              </div>
              <button
                onClick={closeModal}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
                data-testid="close-contact-modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="font-bold text-[#0f172a]">{selected.fullName}</p>
                <a href={`mailto:${selected.email}`} className="text-sm text-[#1E88E5] flex items-center gap-1 mt-1"><Mail size={13} /> {selected.email}</a>
                {selected.phone && <a href={`tel:${selected.phone}`} className="text-sm text-[#1E88E5] flex items-center gap-1 mt-0.5"><Phone size={13} /> {selected.phone}</a>}
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-bold text-[#64748b] uppercase mb-2">Original-Nachricht</p>
                <p className="text-sm text-[#0f172a] whitespace-pre-wrap leading-relaxed">{selected.message}</p>
              </div>

              {/* Status */}
              <div>
                <p className="text-xs font-bold text-[#64748b] uppercase mb-2">Status</p>
                <div className="flex gap-2 flex-wrap">
                  {STATUSES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => updateStatus(selected.id, s.id)}
                      data-testid={`status-${s.id}`}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition ${selected.status === s.id ? "text-white" : "bg-slate-100 text-[#0f172a]"}`}
                      style={selected.status === s.id ? { background: s.color } : {}}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Thread / replies */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-[#64748b] uppercase">Konversation ({replies.length})</p>
                </div>

                {repliesLoading ? (
                  <div className="py-6 text-center"><Loader2 className="animate-spin mx-auto text-[#64748b]" size={18} /></div>
                ) : replies.length === 0 ? (
                  <div className="text-sm text-[#64748b] bg-slate-50 rounded-xl p-4 text-center">
                    Noch keine Antwort gesendet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {replies.map((r) => (
                      <div key={r.id} className="border border-slate-200 rounded-xl p-4 bg-white" data-testid={`reply-${r.id}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-[#0f172a]">{r.sentBy}</span>
                              <span className="text-xs text-[#64748b]">{new Date(r.createdAt).toLocaleString("de-DE")}</span>
                              {r.emailSent ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                                  <CheckCircle2 size={11} /> Gesendet
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                                  <AlertTriangle size={11} /> Nicht gesendet
                                </span>
                              )}
                            </div>
                            <div className="mt-2 text-sm font-semibold text-[#0f172a]">{r.subject}</div>
                            <p className="text-sm text-[#334155] mt-1 whitespace-pre-wrap leading-relaxed">{r.message}</p>
                            {r.emailError && (
                              <p className="text-xs text-[#E63946] mt-2">Fehler: {r.emailError}</p>
                            )}
                          </div>
                          <button
                            onClick={() => removeReply(r.id)}
                            data-testid={`delete-reply-${r.id}`}
                            className="shrink-0 w-8 h-8 rounded-lg bg-slate-100 hover:bg-[#E63946] hover:text-white flex items-center justify-center transition"
                            title="Antwort löschen"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reply form */}
              <div className="border-t border-slate-200 pt-5">
                <p className="text-xs font-bold text-[#64748b] uppercase mb-3 flex items-center gap-2">
                  <Reply size={13} /> Antwort an {selected.email}
                </p>

                {!emailCfg.configured && (
                  <div className="mb-3 flex items-start gap-2 text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-3">
                    <Info size={14} className="mt-0.5 shrink-0" />
                    <span>
                      SMTP ist nicht konfiguriert. Antworten werden gespeichert, aber nicht per E-Mail versendet.
                      Setze <code className="font-mono">SMTP_HOST</code>, <code className="font-mono">SMTP_USER</code>, <code className="font-mono">SMTP_PASSWORD</code> und <code className="font-mono">SMTP_FROM</code> in <code className="font-mono">backend/.env</code>.
                    </span>
                  </div>
                )}

                <input
                  type="text"
                  value={replySubject}
                  onChange={(e) => setReplySubject(e.target.value)}
                  placeholder="Betreff"
                  data-testid="reply-subject-input"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-[#1E88E5] focus:outline-none text-sm bg-white text-[#0f172a]"
                />
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder={`Hallo ${selected.fullName?.split(" ")[0] || ""},\n\nvielen Dank für Ihre Nachricht...`}
                  rows={7}
                  data-testid="reply-message-input"
                  className="mt-3 w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-[#1E88E5] focus:outline-none text-sm bg-white text-[#0f172a] resize-y"
                />

                {feedback && (
                  <div
                    data-testid="reply-feedback"
                    className={`mt-3 flex items-start gap-2 text-xs rounded-lg p-3 ${
                      feedback.type === "ok"
                        ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                        : "bg-red-50 border border-red-200 text-red-800"
                    }`}
                  >
                    {feedback.type === "ok" ? <CheckCircle2 size={14} className="mt-0.5 shrink-0" /> : <AlertTriangle size={14} className="mt-0.5 shrink-0" />}
                    <span>{feedback.text}</span>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
                  <p className="text-xs text-[#64748b]">
                    {emailCfg.configured && emailCfg.from ? <>Wird gesendet von <span className="font-semibold text-[#0f172a]">{emailCfg.from}</span></> : "Nur lokale Speicherung"}
                  </p>
                  <button
                    onClick={sendReply}
                    disabled={sending || !replyMessage.trim() || !replySubject.trim()}
                    data-testid="send-reply-button"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#E63946] hover:bg-[#c5303d] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm transition"
                  >
                    {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                    {sending ? "Senden..." : "Antwort senden"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
