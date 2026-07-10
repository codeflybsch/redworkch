import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, FileSignature, Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import api from "../api";
import Logo from "../components/Logo";
import { serviceTypes, budgetRanges, timelineOptions } from "../mock";

const labelOf = (items, value) => items.find((item) => item.id === value)?.label || value;

export default function QuoteSignature() {
  const { token } = useParams();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signerName, setSignerName] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);

  useEffect(() => {
    api.get(`/quotes/sign/${token}`)
      .then((response) => { setQuote(response.data); setSignerName(response.data.fullName || ""); })
      .catch((requestError) => setError(requestError.response?.data?.detail || "Angebot konnte nicht geladen werden."))
      .finally(() => setLoading(false));
  }, [token]);

  const sign = async (event) => {
    event.preventDefault();
    setSubmitting(true); setError("");
    try {
      const signatureData = canvasRef.current?.toDataURL("image/png") || "";
      await api.post(`/quotes/sign/${token}`, { signerName, accepted, signatureData });
      setSuccess(true);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Die Signatur konnte nicht gespeichert werden.");
    } finally { setSubmitting(false); }
  };

  const pointFromEvent = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * (canvas.width / rect.width), y: (event.clientY - rect.top) * (canvas.height / rect.height) };
  };
  const startDrawing = (event) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const point = pointFromEvent(event);
    drawingRef.current = true;
    canvas.setPointerCapture?.(event.pointerId);
    context.beginPath(); context.moveTo(point.x, point.y);
  };
  const draw = (event) => {
    if (!drawingRef.current) return;
    const context = canvasRef.current.getContext("2d");
    const point = pointFromEvent(event);
    context.lineWidth = 3; context.lineCap = "round"; context.lineJoin = "round"; context.strokeStyle = "#0f172a";
    context.lineTo(point.x, point.y); context.stroke();
    setHasSignature(true);
  };
  const stopDrawing = () => { drawingRef.current = false; };
  const clearSignature = () => {
    const canvas = canvasRef.current;
    canvas?.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  if (loading) return <div className="grid min-h-screen place-items-center bg-slate-950 text-white"><Loader2 className="animate-spin" size={34} /></div>;
  if (error && !quote) return <div className="grid min-h-screen place-items-center bg-slate-950 p-5"><div className="max-w-lg rounded-3xl bg-white p-8 text-center"><FileSignature className="mx-auto text-red-500" size={40} /><h1 className="mt-4 text-2xl font-black">Signaturlink nicht verfügbar</h1><p className="mt-2 text-slate-600">{error}</p></div></div>;

  const alreadySigned = quote?.status === "signed" || quote?.signedAt;
  return <div className="min-h-screen bg-[#eef2f7] text-slate-950">
    <header className="border-b border-white/10 bg-slate-950 px-5 py-4 text-white"><div className="mx-auto flex max-w-5xl items-center justify-between"><Logo size="md" /><span className="flex items-center gap-2 text-xs font-bold text-emerald-300"><LockKeyhole size={15} /> Sichere Signatur</span></div></header>
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-7"><p className="text-xs font-black uppercase tracking-[.2em] text-[#E63946]">Digitales Angebot</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">Angebot prüfen und bestätigen</h1><p className="mt-2 text-slate-600">Bitte lesen Sie alle Angaben sorgfältig durch.</p></div>
      <div className="grid gap-7 lg:grid-cols-[1fr_360px]">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
          <div className="border-b bg-slate-50 p-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Angebot für</p><h2 className="mt-1 text-xl font-black">{quote.fullName}</h2><p className="text-sm text-slate-500">{quote.company || "Privatkunde"}</p></div><ShieldCheck className="text-emerald-600" size={32} /></div></div>
          <div className="space-y-6 p-6">
            <div className="grid gap-4 sm:grid-cols-3"><Info label="Leistung" value={labelOf(serviceTypes, quote.serviceType)} /><Info label="Budget" value={labelOf(budgetRanges, quote.budget)} /><Info label="Zeitrahmen" value={labelOf(timelineOptions, quote.timeline)} /></div>
            <DocumentBlock title="Projektbeschreibung" text={quote.projectDetails} />
            <DocumentBlock title="Angebotsbedingungen & nächste Schritte" text={quote.decisionReason} accent />
            <div className="rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-500"><b>Dokument-ID:</b> <span className="break-all font-mono">{quote.documentHash}</span><br />Diese Kennung dokumentiert den unveränderten Inhalt des vorliegenden Angebots.</div>
          </div>
        </section>

        <aside className="h-fit rounded-3xl bg-slate-950 p-6 text-white shadow-2xl lg:sticky lg:top-6">
          {success || alreadySigned ? <div className="py-5 text-center"><CheckCircle2 className="mx-auto text-emerald-400" size={50} /><h2 className="mt-4 text-2xl font-black">Erfolgreich unterschrieben</h2><p className="mt-2 text-sm leading-6 text-slate-400">Die Bestätigung wurde sicher gespeichert. Eine Bestätigung wird per E-Mail versendet.</p>{quote.signerName && <p className="mt-5 rounded-xl bg-white/5 p-3 text-sm font-bold">{quote.signerName}</p>}</div> : <form onSubmit={sign}>
            <FileSignature className="text-blue-400" size={30} /><h2 className="mt-4 text-xl font-black">Elektronisch unterschreiben</h2><p className="mt-2 text-sm leading-6 text-slate-400">Mit Ihrer Signatur bestätigen Sie das oben dargestellte Angebot.</p>
            <label className="mt-6 block text-xs font-bold uppercase tracking-wider text-slate-400">Vollständiger Name<input required minLength={3} value={signerName} onChange={(event) => setSignerName(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base normal-case tracking-normal text-white outline-none focus:border-blue-400" /></label>
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between"><label className="text-xs font-bold uppercase tracking-wider text-slate-400">Handschriftliche Unterschrift</label><button type="button" onClick={clearSignature} className="text-xs font-bold text-blue-300 hover:text-blue-200">Löschen</button></div>
              <div className="overflow-hidden rounded-xl border-2 border-dashed border-slate-500 bg-white">
                <canvas ref={canvasRef} width="600" height="180" onPointerDown={startDrawing} onPointerMove={draw} onPointerUp={stopDrawing} onPointerCancel={stopDrawing} onPointerLeave={stopDrawing} className="block h-36 w-full touch-none cursor-crosshair sm:h-40" aria-label="Unterschrift hier zeichnen" />
                {!hasSignature && <p className="pointer-events-none -mt-24 mb-[72px] text-center text-sm font-semibold text-slate-400">Hier mit Finger, Maus oder Stift unterschreiben</p>}
              </div>
            </div>
            <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-5"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-1 h-4 w-4 shrink-0" /><span>Ich habe das Angebot vollständig gelesen, akzeptiere die Bedingungen und möchte es rechtsverbindlich elektronisch unterschreiben.</span></label>
            {error && <p className="mt-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
            <button disabled={submitting || !accepted || !hasSignature || signerName.trim().length < 3} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 font-black hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40">{submitting ? <Loader2 className="animate-spin" size={18} /> : <FileSignature size={18} />} Angebot unterschreiben</button>
            <p className="mt-4 text-center text-[11px] leading-5 text-slate-500">Zeitpunkt, Dokument-ID und technische Signaturdaten werden zur Nachweisführung protokolliert.</p>
          </form>}
        </aside>
      </div>
    </main>
  </div>;
}

function Info({ label, value }) { return <div className="rounded-xl bg-slate-50 p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-1 break-words text-sm font-bold">{value || "–"}</p></div>; }
function DocumentBlock({ title, text, accent = false }) { return <div className={`rounded-2xl border p-5 ${accent ? "border-blue-200 bg-blue-50" : "border-slate-200"}`}><h3 className="text-xs font-black uppercase tracking-wider text-slate-500">{title}</h3><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{text || "–"}</p></div>; }
