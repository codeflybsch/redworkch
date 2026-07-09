import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Loader2, RefreshCw, Wallet, X } from "lucide-react";
import api from "../../api";

const money = (value) => new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF" }).format(Number(value || 0));
const date = (value) => value ? new Intl.DateTimeFormat("de-CH").format(new Date(value)) : "-";

export default function WalletAdmin() {
  const [data, setData] = useState({ customers: [], transactions: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [feedback, setFeedback] = useState("");
  const [adjustments, setAdjustments] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData((await api.get("/admin/wallets")).data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const pending = useMemo(() => data.transactions.filter((tx) => tx.status === "pending"), [data.transactions]);
  const totalBalance = useMemo(() => data.customers.reduce((sum, customer) => sum + Number(customer.walletBalance || 0), 0), [data.customers]);

  const action = async (key, fn, message) => {
    setSaving(key);
    setFeedback("");
    try {
      await fn();
      setFeedback(message);
      await load();
    } catch (error) {
      setFeedback(error?.response?.data?.detail || "Aktion konnte nicht ausgeführt werden.");
    } finally {
      setSaving("");
    }
  };

  const updateAdjustment = (customerId, patch) => {
    setAdjustments((current) => ({ ...current, [customerId]: { ...(current[customerId] || { amount: "", note: "" }), ...patch } }));
  };

  if (loading) {
    return <div className="grid min-h-[360px] place-items-center"><Loader2 className="animate-spin text-[#E63946]" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-950">Guthaben</h1>
          <p className="mt-1 text-sm text-slate-500">Kundenguthaben, Aufladeanfragen und manuelle Korrekturen verwalten.</p>
        </div>
        <button onClick={load} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50">
          <RefreshCw size={16} /> Aktualisieren
        </button>
      </div>

      {feedback && <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700">{feedback}</div>}

      <div className="grid gap-4 md:grid-cols-3">
        <Stat title="Gesamtes Kundenguthaben" value={money(totalBalance)} />
        <Stat title="Offene Aufladeanfragen" value={pending.length} />
        <Stat title="Kunden" value={data.customers.length} />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-lg font-black text-slate-950">Offene Aufladeanfragen</h2>
        </div>
        {pending.length ? (
          <div className="divide-y divide-slate-100">
            {pending.map((tx) => (
              <div key={tx.id} className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <p className="font-black text-slate-950">{tx.customerName || tx.userEmail}</p>
                  <p className="mt-1 text-sm text-slate-500">{tx.userEmail} · {date(tx.createdAt)}{tx.note ? ` · ${tx.note}` : ""}</p>
                  <p className="mt-2 text-2xl font-black text-[#E63946]">{money(tx.amount)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    disabled={saving === `complete-${tx.id}`}
                    onClick={() => action(`complete-${tx.id}`, () => api.post(`/admin/wallets/transactions/${tx.id}/complete`), "Aufladung wurde gutgeschrieben.")}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {saving === `complete-${tx.id}` ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />} Gutschreiben
                  </button>
                  <button
                    disabled={saving === `reject-${tx.id}`}
                    onClick={() => action(`reject-${tx.id}`, () => api.post(`/admin/wallets/transactions/${tx.id}/reject`, { amount: 0, note: tx.note || "" }), "Aufladung wurde abgelehnt.")}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  >
                    <X size={16} /> Ablehnen
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-sm font-semibold text-slate-500">Keine offenen Aufladeanfragen.</div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-lg font-black text-slate-950">Kundenguthaben</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr><th className="px-5 py-3">Kunde</th><th>Guthaben</th><th>Betrag +/-</th><th>Notiz</th><th className="pr-5 text-right">Aktion</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.customers.map((customer) => {
                const current = adjustments[customer.id] || { amount: "", note: "" };
                return (
                  <tr key={customer.id} className="text-sm">
                    <td className="px-5 py-4"><p className="font-black text-slate-950">{customer.firstName} {customer.lastName}</p><p className="text-xs text-slate-500">{customer.email}</p></td>
                    <td className="font-black text-slate-950">{money(customer.walletBalance)}</td>
                    <td><input type="number" step="1" value={current.amount} onChange={(e) => updateAdjustment(customer.id, { amount: e.target.value })} placeholder="z.B. 50 oder -10" className="w-40 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#E63946]" /></td>
                    <td><input value={current.note} onChange={(e) => updateAdjustment(customer.id, { note: e.target.value })} placeholder="Interne Notiz" className="w-64 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#E63946]" /></td>
                    <td className="pr-5 text-right">
                      <button
                        disabled={saving === `adjust-${customer.id}` || !Number(current.amount)}
                        onClick={() => action(`adjust-${customer.id}`, () => api.post(`/admin/wallets/${customer.id}/adjust`, { amount: Number(current.amount), note: current.note }), "Guthaben wurde angepasst.")}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#E63946] px-4 py-2.5 text-sm font-black text-white hover:bg-[#c5303d] disabled:opacity-50"
                      >
                        {saving === `adjust-${customer.id}` ? <Loader2 className="animate-spin" size={16} /> : <Wallet size={16} />} Speichern
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">{title}</p>
      <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
    </div>
  );
}
