import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../api";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  Activity, ArrowRight, Building2, Check, ChevronRight, CircleHelp, Copy,
  CreditCard, Download, FileClock, FileText, Gift, Globe2, Home, LogOut,
  Mail, MapPin, Menu, MessageSquarePlus, Package, Receipt, Send, Server,
  ShieldCheck, Sparkles, TicketCheck, UserRound, Wallet, X
} from "lucide-react";

const tabs = [
  { id: "overview", label: "Übersicht", icon: Home },
  { id: "services", label: "Produkte & Hosting", icon: Server },
  { id: "invoices", label: "Rechnungen", icon: Receipt },
  { id: "support", label: "Support", icon: CircleHelp },
  { id: "referrals", label: "Freunde einladen", icon: Gift },
  { id: "account", label: "Konto & Adresse", icon: UserRound },
];

const money = (value) => new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF" }).format(Number(value || 0));
const date = (value) => value ? new Intl.DateTimeFormat("de-CH").format(new Date(value)) : "–";
const statusText = { paid: "Bezahlt", sent: "Offen", overdue: "Überfällig", draft: "Entwurf", active: "Aktiv", open: "Offen", in_progress: "In Bearbeitung", answered: "Beantwortet" };

function Panel({ children, className = "" }) {
  return <section className={`rounded-3xl border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,.06)] ${className}`}>{children}</section>;
}

function Empty({ icon: Icon, title, text, action }) {
  return <div className="flex flex-col items-center px-6 py-14 text-center"><div className="mb-4 rounded-2xl bg-slate-100 p-4 text-slate-500"><Icon size={26} /></div><h3 className="font-bold text-slate-900">{title}</h3><p className="mt-1 max-w-sm text-sm text-slate-500">{text}</p>{action}</div>;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [active, setActive] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [mobileNav, setMobileNav] = useState(false);
  const [payInvoice, setPayInvoice] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [notice, setNotice] = useState("");
  const [address, setAddress] = useState({ street: user?.street || "", postalCode: user?.postalCode || "", city: user?.city || "", country: user?.country || "Schweiz" });

  const load = useCallback(async () => {
    try { setData((await api.get("/dashboard")).data); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const handleRealtime = (event) => {
      const payload = event.detail || {};
      const ticket = payload.ticket || {};
      if (ticket.userId && String(ticket.userId) === String(user?.id)) {
        load();
      }
    };

    window.addEventListener("support-realtime", handleRealtime);
    return () => window.removeEventListener("support-realtime", handleRealtime);
  }, [load, user?.id]);

  const openInvoices = useMemo(() => data?.invoices?.filter(i => i.status !== "paid") || [], [data]);
  const paidInvoices = useMemo(() => data?.invoices?.filter(i => i.status === "paid") || [], [data]);
  const latestSupport = useMemo(() => (data?.openTickets || []).slice(0, 2), [data]);
  const supportNewMessages = data?.support?.newMessages || 0;
  const supportHasNewMessages = supportNewMessages > 0;
  const outstanding = openInvoices.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);
  const referralUrl = `${window.location.origin}/register?ref=${data?.referral?.code || ""}`;

  const downloadInvoice = async (invoice) => {
    const response = await api.get(`/invoices/${invoice.id}/pdf`, { responseType: "blob" });
    const url = URL.createObjectURL(response.data);
    window.open(url, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(url), 30000);
  };
  const saveAddress = async (event) => {
    event.preventDefault(); setNotice("");
    try { await api.put("/auth/profile", address); setNotice("Adresse wurde erfolgreich gespeichert."); }
    catch { setNotice("Adresse konnte nicht gespeichert werden."); }
  };
  const invite = async (event) => {
    event.preventDefault(); setNotice("");
    try { await api.post("/referrals/invite", { email: inviteEmail }); setInviteEmail(""); setNotice("Einladung wurde versendet."); await load(); }
    catch (error) { setNotice(error.response?.data?.detail || "Einladung konnte nicht versendet werden."); }
  };
  const copyLink = async () => { await navigator.clipboard.writeText(referralUrl); setNotice("Empfehlungslink kopiert."); };

  if (loading) return <div className="grid min-h-screen place-items-center bg-slate-950 text-white"><div className="text-center"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-red-500" /><p className="mt-4 text-sm text-slate-400">Kundenportal wird geladen</p></div></div>;

  const navigate = (id) => { setActive(id); setMobileNav(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const Nav = () => <>{tabs.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => navigate(id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${active === id ? "bg-white text-slate-950 shadow-lg" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}><Icon size={18} /><span className="flex-1">{label}</span>{active === id && <ChevronRight size={16} />}</button>)}</>;

  return <div className="min-h-screen bg-[#f4f6f9] pt-[68px] text-slate-950">
    <Header scrolled />
    <aside className="fixed bottom-0 left-0 top-[68px] z-40 hidden w-72 flex-col bg-[#0b1120] p-5 lg:flex">
      <Link to="/" className="flex items-center gap-3 px-2 py-3 text-white"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#E63946] font-black">R</div><div><div className="text-lg font-black tracking-tight">redwork.ch</div><div className="text-[10px] uppercase tracking-[.2em] text-slate-500">Customer Portal</div></div></Link>
      <nav className="mt-8 space-y-1"><Nav /></nav>
      <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-red-500/15 font-bold text-red-400">{user?.firstName?.[0]}{user?.lastName?.[0]}</div><div className="min-w-0"><p className="truncate text-sm font-bold text-white">{user?.firstName} {user?.lastName}</p><p className="truncate text-xs text-slate-500">{user?.email}</p></div></div><button onClick={logout} className="mt-4 flex w-full items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white"><LogOut size={15} /> Sicher abmelden</button></div>
    </aside>

    <div className="lg:pl-72">
      <header className="sticky top-[68px] z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl"><div className="flex h-20 items-center justify-between px-5 sm:px-8 lg:px-10"><div className="flex items-center gap-3"><button onClick={() => setMobileNav(true)} className="rounded-xl border p-2 lg:hidden"><Menu size={20} /></button><div><p className="text-xs font-bold uppercase tracking-widest text-[#E63946]">Mein Bereich</p><h1 className="text-xl font-black sm:text-2xl">{tabs.find(t => t.id === active)?.label}</h1></div></div><div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 sm:flex"><ShieldCheck size={16} /> Konto geschützt</div></div></header>
      {mobileNav && <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileNav(false)}><div className="h-full w-80 bg-[#0b1120] p-5" onClick={e => e.stopPropagation()}><div className="mb-8 flex items-center justify-between text-white"><b>redwork.ch</b><button onClick={() => setMobileNav(false)}><X /></button></div><Nav /></div></div>}

      <main className="mx-auto max-w-[1500px] p-5 sm:p-8 lg:p-10">
        {notice && <div className="mb-6 flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800"><span className="flex items-center gap-2"><Check size={17} />{notice}</span><button onClick={() => setNotice("")}><X size={16} /></button></div>}

        {active === "overview" && <div className="space-y-7">
          <div className="relative overflow-hidden rounded-[2rem] bg-[#0b1120] p-7 text-white sm:p-10">
            <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-red-500/20 blur-3xl" />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
              <div><span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300"><Sparkles size={14} className="text-amber-400" /> Alles an einem Ort</span><h2 className="mt-5 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">Guten Tag, {user?.firstName}.<br /><span className="text-slate-400">Ihre digitale Infrastruktur läuft.</span></h2><p className="mt-4 max-w-xl text-sm leading-6 text-slate-400">Verwalten Sie Hosting, Rechnungen und Support zentral in Ihrem Kundenportal.</p></div>
              <div className="space-y-3">
                {latestSupport.length > 0 && <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 backdrop-blur-sm">
                  <div className="mb-2 flex items-center justify-between px-1"><p className="text-[10px] font-black uppercase tracking-[.16em] text-slate-400">Letzte Support-Aktivität</p><button onClick={() => navigate("support")} className="text-[10px] font-bold text-red-300 hover:text-white">Alle anzeigen</button></div>
                  <div className="space-y-1.5">{latestSupport.map((ticket) => <Link key={ticket.id} to={`/tickets/${ticket.id}`} className="flex min-w-0 items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-white/10"><span className={`h-2.5 w-2.5 shrink-0 rounded-full ${ticket.status === "answered" ? "bg-emerald-400" : ticket.status === "in_progress" ? "bg-amber-400" : "bg-blue-400"}`} /><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-white">{ticket.subject}</p><p className="mt-0.5 text-[10px] text-slate-400">{statusText[ticket.status] || ticket.status} · {date(ticket.updatedAt)}</p></div><ChevronRight size={14} className="shrink-0 text-slate-500" /></Link>)}</div>
                </div>}
                <button onClick={() => navigate("support")} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#E63946] px-5 py-3 text-sm font-bold hover:bg-[#cf303c]"><MessageSquarePlus size={18} /> Support kontaktieren</button>
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[
            [Package, "Aktive Produkte", data.activeOrders.length, "text-indigo-600 bg-indigo-50"],
            [Wallet, "Offener Betrag", money(outstanding), "text-red-600 bg-red-50"],
            [TicketCheck, "Offene Tickets", data.openTickets.length, "text-amber-600 bg-amber-50"],
            [Gift, "Empfehlungsguthaben", money(data.referral?.earned), "text-emerald-600 bg-emerald-50"]
          ].map(([Icon, label, value, color]) => <Panel key={label} className="p-5"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-3 text-2xl font-black">{value}</p></div><span className={`rounded-xl p-3 ${color}`}><Icon size={20} /></span></div></Panel>)}</div>
          <div className="grid gap-7 xl:grid-cols-[1.6fr_1fr]">
            <Panel><div className="flex items-center justify-between border-b p-6"><div><h3 className="font-black">Aktive Produkte</h3><p className="text-sm text-slate-500">Hosting, Domains und Services</p></div><button onClick={() => navigate("services")} className="text-sm font-bold text-[#E63946]">Alle anzeigen</button></div>{data.activeOrders.length ? <div className="divide-y">{data.activeOrders.slice(0, 3).map(order => <div key={order.id} className="flex items-center gap-4 p-6"><span className="rounded-xl bg-indigo-50 p-3 text-indigo-600"><Globe2 size={21} /></span><div className="min-w-0 flex-1"><p className="truncate font-bold">{order.productName || "Hosting-Paket"}</p><p className="text-xs text-slate-500">Bestellung #{order.id.slice(0, 8)}</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Aktiv</span></div>)}</div> : <Empty icon={Package} title="Noch keine aktiven Produkte" text="Wählen Sie ein Hosting-Paket, das zu Ihrem Projekt passt." action={<Link to="/products" className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white">Produkte entdecken</Link>} />}</Panel>
            <Panel className="p-6"><div className="flex items-center gap-3"><span className="rounded-xl bg-slate-100 p-3"><Activity size={20} /></span><div><h3 className="font-black">Letzte Aktivitäten</h3><p className="text-sm text-slate-500">Aktuelles aus Ihrem Konto</p></div></div><div className="mt-6 space-y-5">{data.recentActivities.length ? data.recentActivities.map((item, index) => <div key={index} className="flex gap-3"><span className="mt-1.5 h-2 w-2 rounded-full bg-[#E63946]" /><div><p className="text-sm font-semibold">{item.message}</p><p className="mt-1 text-xs text-slate-400">{date(item.date)}</p></div></div>) : <p className="text-sm text-slate-500">Noch keine Aktivitäten vorhanden.</p>}</div></Panel>
          </div>
        </div>}

        {active === "services" && <Panel><div className="flex flex-col gap-4 border-b p-6 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-black">Produkte & Hosting</h2><p className="text-sm text-slate-500">Ihre aktiven Dienste und Laufzeiten</p></div><Link to="/products" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white">Neues Produkt <ArrowRight size={16} /></Link></div>{data.activeOrders.length ? <div className="grid gap-5 p-6 md:grid-cols-2 xl:grid-cols-3">{data.activeOrders.map(order => <div key={order.id} className="rounded-2xl border p-5"><div className="flex justify-between"><span className="rounded-xl bg-indigo-50 p-3 text-indigo-600"><Server /></span><span className="h-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Aktiv</span></div><h3 className="mt-5 text-lg font-black">{order.productName || "Hosting-Paket"}</h3><p className="mt-1 text-xs text-slate-500">#{order.id}</p><div className="mt-5 border-t pt-4 text-sm text-slate-600">Aktiv seit {date(order.activatedAt || order.createdAt)}</div></div>)}</div> : <Empty icon={Server} title="Keine aktiven Dienste" text="Nach Ihrer ersten Bestellung erscheint Ihr Service hier." />}</Panel>}

        {active === "invoices" && <div className="space-y-7"><div className="grid gap-4 sm:grid-cols-3"><Panel className="p-5"><p className="text-xs font-bold uppercase text-slate-500">Offen</p><p className="mt-2 text-2xl font-black">{money(outstanding)}</p></Panel><Panel className="p-5"><p className="text-xs font-bold uppercase text-slate-500">Offene Rechnungen</p><p className="mt-2 text-2xl font-black">{openInvoices.length}</p></Panel><Panel className="p-5"><p className="text-xs font-bold uppercase text-slate-500">Bezahlte Rechnungen</p><p className="mt-2 text-2xl font-black">{paidInvoices.length}</p></Panel></div><Panel><div className="border-b p-6"><h2 className="text-xl font-black">Rechnungen & Zahlungen</h2><p className="text-sm text-slate-500">Aktuelle und vergangene Rechnungen anzeigen</p></div>{data.invoices.length ? <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-6 py-4">Rechnung</th><th>Datum</th><th>Fällig</th><th>Betrag</th><th>Status</th><th className="pr-6 text-right">Aktion</th></tr></thead><tbody className="divide-y">{data.invoices.map(invoice => <tr key={invoice.id} className="hover:bg-slate-50"><td className="px-6 py-5 font-bold">{invoice.number}</td><td className="text-sm text-slate-500">{date(invoice.createdAt)}</td><td className="text-sm text-slate-500">{date(invoice.dueDate)}</td><td className="font-bold">{money(invoice.total)}</td><td><span className={`rounded-full px-3 py-1 text-xs font-bold ${invoice.status === "paid" ? "bg-emerald-50 text-emerald-700" : invoice.status === "overdue" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{statusText[invoice.status] || invoice.status}</span></td><td className="pr-6 text-right"><div className="flex justify-end gap-2"><button title="PDF anzeigen" onClick={() => downloadInvoice(invoice)} className="rounded-lg border p-2 hover:bg-slate-100"><Download size={16} /></button>{invoice.status !== "paid" && <button onClick={() => setPayInvoice(invoice)} className="rounded-lg bg-slate-950 px-4 py-2 text-xs font-bold text-white">Bezahlen</button>}</div></td></tr>)}</tbody></table></div> : <Empty icon={FileText} title="Keine Rechnungen vorhanden" text="Ihre Rechnungen werden automatisch hier archiviert." />}</Panel></div>}

        {active === "support" && <div className="grid gap-7 xl:grid-cols-[1fr_380px]"><Panel><div className="flex items-center justify-between border-b p-6"><div><div className="flex items-center gap-3"><h2 className="text-xl font-black">Support-Tickets</h2>{supportHasNewMessages && <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-600">{supportNewMessages} neue Nachricht{supportNewMessages > 1 ? "en" : ""}</span>}</div><p className="text-sm text-slate-500">Anfragen und Antworten im Überblick</p>{supportHasNewMessages && <p className="mt-1 text-xs font-semibold text-red-600">Sie haben neue Nachricht</p>}</div><Link to="/support" className="rounded-xl bg-[#E63946] px-4 py-3 text-sm font-bold text-white">Neues Ticket</Link></div>{data.openTickets.length ? <div className="divide-y">{data.openTickets.map(ticket => <Link to={`/tickets/${ticket.id}`} key={ticket.id} className="flex items-center gap-4 p-6 hover:bg-slate-50"><span className={`rounded-xl p-3 ${ticket.lastStaffReplyAt && (!ticket.lastCustomerSeenAt || new Date(ticket.lastStaffReplyAt).getTime() > new Date(ticket.lastCustomerSeenAt).getTime()) ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}><CircleHelp size={20} /></span><div className="min-w-0 flex-1"><p className="truncate font-bold">{ticket.subject}</p><p className="mt-1 text-xs text-slate-500">#{ticket.id.slice(0, 8)} · Aktualisiert {date(ticket.updatedAt)}</p></div><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">{statusText[ticket.status] || ticket.status}</span><ChevronRight size={18} className="text-slate-400" /></Link>)}</div> : <Empty icon={TicketCheck} title="Alles erledigt" text="Sie haben aktuell keine offenen Support-Tickets." action={<Link to="/support" className="mt-5 text-sm font-bold text-[#E63946]">Ticket erstellen</Link>} />}</Panel><Panel className="h-fit p-6"><div className="rounded-2xl bg-slate-950 p-6 text-white"><CircleHelp className="text-red-400" /><h3 className="mt-5 text-xl font-black">Wie können wir helfen?</h3><p className="mt-2 text-sm leading-6 text-slate-400">Unser Support-Team beantwortet technische und kaufmännische Fragen zentral über Tickets.</p><Link to="/support" className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-950">Anfrage starten <ArrowRight size={16} /></Link></div></Panel></div>}

        {active === "referrals" && <div className="space-y-7"><div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0b1120] to-[#18243b] p-7 text-white sm:p-10"><div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-center"><div><span className="inline-flex rounded-full bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-300">{money(data.referral?.rewardPerFriend)} pro erfolgreicher Empfehlung</span><h2 className="mt-5 text-3xl font-black sm:text-4xl">Freunde einladen.<br /><span className="text-slate-400">Gemeinsam profitieren.</span></h2><p className="mt-4 max-w-xl text-sm leading-6 text-slate-400">Sobald eine eingeladene Person einen qualifizierten Service aktiviert, wird Ihre Prämie dem Kundenkonto gutgeschrieben.</p></div><div className="rounded-2xl border border-white/10 bg-white/5 p-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Ihr Empfehlungsguthaben</p><p className="mt-2 text-4xl font-black">{money(data.referral?.earned)}</p><p className="mt-2 text-xs text-slate-400">{data.referral?.pending || 0} Einladung(en) ausstehend</p></div></div></div><div className="grid gap-7 xl:grid-cols-2"><Panel className="p-6"><Mail className="text-[#E63946]" /><h3 className="mt-4 text-lg font-black">Direkt per E-Mail einladen</h3><p className="mt-1 text-sm text-slate-500">Wir versenden eine persönliche Einladung mit Ihrem Code.</p><form onSubmit={invite} className="mt-6 flex flex-col gap-3 sm:flex-row"><input type="email" required value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="freund@beispiel.ch" className="min-w-0 flex-1 rounded-xl border px-4 py-3 outline-none focus:border-slate-900" /><button className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white"><Send size={16} /> Einladen</button></form></Panel><Panel className="p-6"><Gift className="text-emerald-600" /><h3 className="mt-4 text-lg font-black">Empfehlungslink teilen</h3><p className="mt-1 text-sm text-slate-500">Ihr persönlicher Code: <b>{data.referral?.code}</b></p><div className="mt-6 flex gap-2 rounded-xl bg-slate-100 p-2"><input readOnly value={referralUrl} className="min-w-0 flex-1 bg-transparent px-2 text-sm text-slate-600 outline-none" /><button onClick={copyLink} className="rounded-lg bg-white p-2.5 shadow-sm"><Copy size={16} /></button></div></Panel></div>{data.referrals?.length > 0 && <Panel><div className="border-b p-6"><h3 className="font-black">Ihre Einladungen</h3></div><div className="divide-y">{data.referrals.map(ref => <div key={ref.id} className="flex items-center gap-4 p-5"><span className="rounded-full bg-slate-100 p-2"><Mail size={16} /></span><div className="flex-1"><p className="font-semibold">{ref.email}</p><p className="text-xs text-slate-500">Eingeladen am {date(ref.createdAt)}</p></div><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">Ausstehend</span></div>)}</div></Panel>}</div>}

        {active === "account" && <div className="grid gap-7 xl:grid-cols-[1fr_1.2fr]"><Panel className="h-fit p-6"><div className="flex items-center gap-4"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-950 text-lg font-black text-white">{user?.firstName?.[0]}{user?.lastName?.[0]}</div><div><h2 className="text-lg font-black">{user?.firstName} {user?.lastName}</h2><p className="text-sm text-slate-500">{user?.email}</p></div></div><div className="mt-6 space-y-3 border-t pt-6 text-sm"><div className="flex justify-between"><span className="text-slate-500">Konto</span><span className="font-bold text-emerald-600">Verifiziert</span></div><div className="flex justify-between"><span className="text-slate-500">Firma</span><span className="font-semibold">{user?.company || "Privatkunde"}</span></div><div className="flex justify-between"><span className="text-slate-500">Telefon</span><span className="font-semibold">{user?.phone || "Nicht hinterlegt"}</span></div></div><Link to="/profile" className="mt-6 flex items-center justify-center rounded-xl border px-4 py-3 text-sm font-bold hover:bg-slate-50">Persönliche Daten bearbeiten</Link></Panel><Panel><div className="border-b p-6"><div className="flex items-center gap-3"><span className="rounded-xl bg-red-50 p-3 text-[#E63946]"><MapPin size={20} /></span><div><h2 className="text-lg font-black">Rechnungsadresse</h2><p className="text-sm text-slate-500">Wird für neue Rechnungen und Verträge verwendet</p></div></div></div><form onSubmit={saveAddress} className="grid gap-5 p-6 sm:grid-cols-2"><label className="sm:col-span-2 text-sm font-bold">Strasse und Hausnummer<input required value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} placeholder="Musterstrasse 12" className="mt-2 w-full rounded-xl border px-4 py-3 font-normal outline-none focus:border-slate-900" /></label><label className="text-sm font-bold">PLZ<input required value={address.postalCode} onChange={e => setAddress({ ...address, postalCode: e.target.value })} placeholder="8001" className="mt-2 w-full rounded-xl border px-4 py-3 font-normal outline-none focus:border-slate-900" /></label><label className="text-sm font-bold">Ort<input required value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} placeholder="Zürich" className="mt-2 w-full rounded-xl border px-4 py-3 font-normal outline-none focus:border-slate-900" /></label><label className="sm:col-span-2 text-sm font-bold">Land<input required value={address.country} onChange={e => setAddress({ ...address, country: e.target.value })} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal outline-none focus:border-slate-900" /></label><button className="sm:col-span-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white">Adresse speichern</button></form></Panel></div>}
      </main>
      <Footer />
    </div>

    {payInvoice && <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm" onClick={() => setPayInvoice(null)}><div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-[#E63946]">Sichere Zahlung</p><h3 className="mt-1 text-2xl font-black">{money(payInvoice.total)}</h3><p className="text-sm text-slate-500">Rechnung {payInvoice.number}</p></div><button onClick={() => setPayInvoice(null)} className="rounded-full bg-slate-100 p-2"><X size={18} /></button></div><div className="mt-6 rounded-2xl border bg-slate-50 p-5"><div className="flex items-center gap-3"><CreditCard className="text-slate-700" /><div><p className="font-bold">Banküberweisung</p><p className="text-xs text-slate-500">Zahlbar mit dem QR-Teil der Rechnung</p></div></div><div className="mt-5 grid gap-3 text-sm"><div className="flex justify-between"><span className="text-slate-500">Referenz</span><b>{payInvoice.number}</b></div><div className="flex justify-between"><span className="text-slate-500">Fällig am</span><b>{date(payInvoice.dueDate)}</b></div></div></div><button onClick={() => downloadInvoice(payInvoice)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white"><FileText size={17} /> QR-Rechnung öffnen</button><p className="mt-4 text-center text-xs leading-5 text-slate-400">Online-Kartenzahlung wird nach Aktivierung des Zahlungsanbieters verfügbar. Der QR-Zahlteil ist bereits vollständig nutzbar.</p></div></div>}
  </div>;
}
