import React, { useMemo, useState } from "react";
import { Activity, AlertTriangle, BadgeCheck, CreditCard, Gavel, HardDrive, KeyRound, Lock, PlayCircle, Plus, RefreshCw, Search, Server, ShieldCheck, TerminalSquare, Users, Zap } from "lucide-react";

const servers = [
  { name: "WHM Frankfurt-01", host: "de-fr-01.redwork.ch", status: "online", load: "0.42", accounts: 128, disk: "61%", api: "WHM API aktiv" },
  { name: "WHM Zürich-01", host: "ch-zh-01.redwork.ch", status: "online", load: "0.31", accounts: 74, disk: "48%", api: "WHM API aktiv" },
  { name: "Backup Node", host: "backup.redwork.ch", status: "sync", load: "0.18", accounts: 202, disk: "72%", api: "Nur Sync" },
];

const whmActions = ["createacct", "suspendacct", "unsuspendacct", "removeacct", "listaccts", "create_user_session"];

const modules = [
  { title: "Stripe Checkout", icon: CreditCard, status: "Webhook ready", text: "checkout.session.completed startet die Provisionierungs-Queue." },
  { title: "TWINT Zahlung", icon: BadgeCheck, status: "Referenzprüfung", text: "TWINT-Referenzen werden Rechnungen und Bestellungen zugeordnet." },
  { title: "BullMQ Queue", icon: Zap, status: "Redis Jobs", text: "Provisionierung, E-Mail und WHM-Sync laufen getrennt und skalierbar." },
  { title: "JWT Security", icon: Lock, status: "Access + Refresh", text: "Admin und Kundenrollen sind für API-First Kommunikation vorbereitet." },
  { title: "Auktionen", icon: Gavel, status: "Live Gebote", text: "Auktionen, Sofortkauf, Gebote und Zahlungsfreigabe in einem Modul." },
  { title: "cPanel SSO", icon: KeyRound, status: "One Click Login", text: "Kunden können cPanel später direkt aus dem Dashboard öffnen." },
];

const logs = [
  { time: "21:04", type: "Provisioning", message: "Queue job prepared: hosting_account.create", state: "success" },
  { time: "21:03", type: "Stripe", message: "Webhook endpoint configured: checkout.session.completed", state: "success" },
  { time: "21:01", type: "WHM", message: "listaccts sync scheduled every 15 minutes", state: "info" },
  { time: "20:58", type: "Security", message: "Rate limiting and env based API keys required for production", state: "warning" },
];

export default function SaaSPlatform() {
  const [query, setQuery] = useState("");
  const filteredServers = useMemo(() => servers.filter((s) => `${s.name} ${s.host}`.toLowerCase().includes(query.toLowerCase())), [query]);

  return (
    <div className="min-h-screen text-slate-950">
      <div className="rounded-[34px] bg-gradient-to-br from-slate-950 via-slate-900 to-black p-6 sm:p-8 text-white shadow-[0_30px_120px_rgba(15,23,42,0.35)] overflow-hidden relative">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[#E63946]/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-red-200"><Server size={15} /> SaaS Hosting Control Center</span>
            <h1 className="mt-5 max-w-4xl text-4xl sm:text-5xl font-black tracking-tight">WHMCS-Level Plattform für Hosting, Webdesign, Domains und Provisionierung</h1>
            <p className="mt-4 max-w-3xl text-slate-300 leading-7">Ein modernes Adminpanel als zentrale Steuerung für Kunden, Pakete, WHM/cPanel Server, Stripe/TWINT Zahlungen, Domain-Auktionen, Rechnungen, Tickets und Systemlogs.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:w-[520px]">
            {[{k:'Kunden',v:'1.542',i:Users},{k:'Hosting',v:'3.287',i:HardDrive},{k:'MRR',v:'CHF 45k',i:Activity},{k:'Uptime',v:'99.99%',i:ShieldCheck}].map((item)=>{const Icon=item.i;return <div key={item.k} className="rounded-2xl border border-white/10 bg-white/5 p-4"><Icon size={20} className="text-red-300"/><p className="mt-3 text-2xl font-black">{item.v}</p><p className="text-xs text-slate-400">{item.k}</p></div>})}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {modules.map((m) => { const Icon = m.icon; return (
          <div key={m.title} className="rounded-[28px] bg-white p-6 shadow-card border border-slate-100 hover:-translate-y-1 transition">
            <div className="flex items-start justify-between gap-4"><div className="w-12 h-12 rounded-2xl bg-slate-950 text-white flex items-center justify-center"><Icon size={22}/></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{m.status}</span></div>
            <h3 className="mt-5 text-xl font-black">{m.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{m.text}</p>
          </div>
        )})}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[32px] bg-white p-6 shadow-card border border-slate-100">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div><h2 className="text-2xl font-black">WHM / cPanel Server</h2><p className="text-sm text-slate-500 mt-1">Multi-Server Architektur mit API-Status und Account-Sync.</p></div>
            <div className="flex gap-2"><div className="relative"><Search size={16} className="absolute left-3 top-3 text-slate-400"/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Server suchen" className="rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-sm outline-none focus:border-slate-900"/></div><button className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white inline-flex items-center gap-2"><Plus size={15}/> Server</button></div>
          </div>
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100">
            <table className="w-full text-sm"><thead className="bg-slate-50 text-left text-slate-500"><tr><th className="p-4">Server</th><th className="p-4">Status</th><th className="p-4">Accounts</th><th className="p-4">Disk</th><th className="p-4">API</th></tr></thead><tbody>{filteredServers.map((s)=><tr key={s.host} className="border-t border-slate-100"><td className="p-4"><b>{s.name}</b><p className="text-xs text-slate-500">{s.host} · Load {s.load}</p></td><td className="p-4"><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{s.status}</span></td><td className="p-4 font-bold">{s.accounts}</td><td className="p-4"><div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-[#E63946]" style={{width:s.disk}} /></div><p className="mt-1 text-xs text-slate-500">{s.disk}</p></td><td className="p-4 text-slate-600">{s.api}</td></tr>)}</tbody></table>
          </div>
        </section>

        <section className="rounded-[32px] bg-slate-950 p-6 text-white shadow-card">
          <div className="flex items-center justify-between"><div><h2 className="text-2xl font-black">Provisioning Flow</h2><p className="text-sm text-slate-400 mt-1">Stripe → Queue → WHM → E-Mail</p></div><RefreshCw size={22} className="text-slate-500"/></div>
          <div className="mt-6 space-y-4">
            {[['1','checkout.session.completed','Stripe Webhook validieren'],['2','BullMQ Job','Hosting Account erstellen'],['3','WHM createacct','cPanel User + Package provisionieren'],['4','Invoice + Mail','Zugangsdaten sicher zustellen']].map((step)=><div key={step[0]} className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"><div className="w-9 h-9 rounded-full bg-[#E63946] flex items-center justify-center font-black">{step[0]}</div><div><p className="font-black">{step[1]}</p><p className="text-sm text-slate-400">{step[2]}</p></div></div>)}
          </div>
        </section>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-[32px] bg-white p-6 shadow-card border border-slate-100"><h2 className="text-2xl font-black mb-4">WHM API Funktionen</h2><div className="grid gap-3 sm:grid-cols-2">{whmActions.map((a)=><div key={a} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 flex items-center gap-3"><TerminalSquare size={18} className="text-[#E63946]"/><span className="font-mono text-sm font-bold">{a}</span></div>)}</div></section>
        <section className="rounded-[32px] bg-white p-6 shadow-card border border-slate-100"><h2 className="text-2xl font-black mb-4">System Logs</h2><div className="space-y-3">{logs.map((l)=><div key={l.time+l.message} className="rounded-2xl border border-slate-100 p-4 flex gap-3"><div className={`mt-1 ${l.state==='warning'?'text-amber-500':'text-emerald-600'}`}>{l.state==='warning'?<AlertTriangle size={18}/>:<PlayCircle size={18}/>}</div><div><p className="text-xs text-slate-400">{l.time} · {l.type}</p><p className="font-semibold text-sm">{l.message}</p></div></div>)}</div></section>
      </div>
    </div>
  );
}
