import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, Clock, Gavel, Globe2, Loader2, RefreshCw, TrendingUp, X } from "lucide-react";
import api from "../api";
import { useAuth } from "../contexts/AuthContext";

const formatCHF = (value) =>
  new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF", maximumFractionDigits: 0 }).format(value || 0);

export default function DomainAuctions() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  const loadAuctions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/domain-auctions");
      setAuctions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.detail || "Die Auktionen konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAuctions();
  }, [loadAuctions]);

  useEffect(() => {
    if (location.pathname === "/domains" || location.hash === "#domain-auctions") {
      const timer = window.setTimeout(() => document.getElementById("domain-auctions")?.scrollIntoView({ behavior: "smooth" }), 100);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [location.hash, location.pathname]);

  const openBid = (auction) => {
    if (!authLoading && user?.role !== "customer") {
      navigate("/login", { state: { from: "/domains" } });
      return;
    }
    setSuccess("");
    setSelected(auction);
    setAmount(Number(auction.currentBid) + 50);
  };

  const submitBid = async () => {
    const minimum = Number(selected.currentBid) + 50;
    if (!Number.isFinite(Number(amount)) || Number(amount) < minimum) {
      setError(`Das Mindestgebot beträgt ${formatCHF(minimum)}.`);
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const { data } = await api.post(`/domain-auctions/${selected.id}/bid`, { amount: Number(amount) });
      setAuctions((items) => items.map((item) => item.id === selected.id
        ? { ...item, currentBid: data.amount, bids: data.bids ?? Number(item.bids || 0) + 1 }
        : item));
      setSelected(null);
      setSuccess(`Ihr Gebot über ${formatCHF(data.amount)} wurde erfolgreich erfasst.`);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login", { state: { from: "/domains" } });
        return;
      }
      setError(err.response?.data?.detail || "Das Gebot konnte leider nicht gespeichert werden.");
    } finally {
      setSubmitting(false);
    }
  };

  const buyNow = (auction) => {
    if (!authLoading && user?.role !== "customer") {
      navigate("/login", { state: { from: "/domains" } });
      return;
    }
    navigate("/order", {
      state: {
        selectedPlan: {
          planName: `Domain ${auction.domain}`,
          billingCycle: "once",
          billingLabel: `Sofortkauf inkl. ${formatCHF(auction.transferFee)} Transfer`,
          price: Number(auction.buyNow) + Number(auction.transferFee || 0),
          monthlyEquivalent: Number(auction.buyNow) + Number(auction.transferFee || 0),
          auctionId: auction.id,
          domain: auction.domain,
        },
      },
    });
  };

  return (
    <section id="domain-auctions" className="relative overflow-hidden bg-slate-900 py-20 text-white sm:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.2),_transparent_35%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-emerald-300"><Gavel size={15} /> Auktionen</span>
            <h2 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">Exklusive Domains live erwerben.</h2>
            <p className="mt-4 text-lg leading-8 text-slate-300">Gebote werden direkt und verbindlich erfasst. Der Sofortkauf führt Sie nahtlos durch den regulären Bestellprozess.</p>
          </div>
          <button type="button" onClick={loadAuctions} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 font-semibold hover:bg-white/10 disabled:opacity-50">
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} /> Aktualisieren
          </button>
        </div>

        {(error || success) && (
          <div className={`mt-8 flex items-start gap-3 rounded-2xl border p-4 ${error ? "border-red-400/30 bg-red-400/10 text-red-100" : "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"}`}>
            <AlertCircle size={19} className="mt-0.5 shrink-0" /><span>{error || success}</span>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-64 items-center justify-center"><Loader2 className="animate-spin text-emerald-300" size={34} /></div>
        ) : auctions.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-slate-300">Zurzeit sind keine aktiven Auktionen vorhanden.</div>
        ) : (
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {auctions.map((auction, index) => (
              <motion.article key={auction.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} className="rounded-[30px] border border-white/10 bg-slate-950/70 p-6 shadow-2xl">
                <div className="flex items-start justify-between gap-4">
                  <div><p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-300">{auction.category}</p><h3 className="mt-3 text-2xl font-black"><Globe2 className="mr-2 inline text-emerald-300" size={22} />{auction.domain}</h3></div>
                  <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold capitalize text-emerald-300">● {auction.status}</span>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/5 p-4"><p className="text-xs text-slate-400">Aktuelles Gebot</p><p className="mt-1 text-xl font-black">{formatCHF(auction.currentBid)}</p></div>
                  <div className="rounded-2xl bg-white/5 p-4"><p className="text-xs text-slate-400">Sofort kaufen</p><p className="mt-1 text-xl font-black text-rose-400">{formatCHF(auction.buyNow)}</p></div>
                </div>
                <div className="mt-5 flex items-center justify-between text-sm text-slate-300"><span className="inline-flex items-center gap-2"><Clock size={15} />{auction.endsIn || "Live"}</span><span className="inline-flex items-center gap-2"><TrendingUp size={15} />{auction.bids || 0} Gebote</span></div>
                <p className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">Transfergebühr: {formatCHF(auction.transferFee)} · {auction.reference}</p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => openBid(auction)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold hover:bg-white/10">Gebot abgeben</button>
                  <button type="button" onClick={() => buyNow(auction)} className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-bold hover:bg-emerald-400">Sofort kaufen</button>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => setSelected(null)}>
          <div role="dialog" aria-modal="true" aria-labelledby="bid-title" className="relative max-h-[100dvh] w-full max-w-lg overflow-y-auto rounded-t-[28px] border border-white/10 bg-slate-950 p-5 shadow-2xl sm:max-h-[92vh] sm:rounded-[30px] sm:p-7" onClick={(event) => event.stopPropagation()}>
            <button type="button" aria-label="Schliessen" onClick={() => setSelected(null)} className="absolute right-4 top-4 text-slate-400 hover:text-white"><X size={22} /></button>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-300">Verbindliches Gebot</p>
            <h3 id="bid-title" className="mt-3 text-3xl font-black">{selected.domain}</h3>
            <p className="mt-2 text-slate-400">Aktuell {formatCHF(selected.currentBid)} · Mindestschritt CHF 50</p>
            <label htmlFor="domain-bid" className="mt-6 block text-sm font-bold">Ihr Gebot in CHF</label>
            <input id="domain-bid" type="number" min={Number(selected.currentBid) + 50} step="50" value={amount} onChange={(event) => setAmount(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-2xl font-black outline-none focus:border-emerald-400" />
            <button type="button" onClick={submitBid} disabled={submitting} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-4 font-black hover:bg-emerald-400 disabled:opacity-50">{submitting && <Loader2 className="animate-spin" size={18} />}Gebot abgeben</button>
          </div>
        </div>
      )}
    </section>
  );
}
