import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell, BookOpen, Box, BriefcaseBusiness, CalendarDays, Check, ChevronDown,
  ChevronRight, Code2, CreditCard, FileText, Gift, Globe2, Headphones,
  Home, KeyRound, Loader2, LogOut, Menu, Package, Receipt, Search,
  Server, Share2, ShieldCheck, ShoppingCart, TicketCheck, UserRound,
  Wallet, X, Zap
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import api from "../api";
import MarqueeBanner from "../components/MarqueeBanner";

const money = (value) => new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF" }).format(Number(value || 0));
const date = (value) => value ? new Intl.DateTimeFormat("de-CH").format(new Date(value)) : "-";

const statusText = {
  paid: "Bezahlt",
  sent: "Offen",
  overdue: "Überfällig",
  draft: "Entwurf",
  active: "Aktiv",
  pending: "Ausstehend",
  open: "Offen",
  in_progress: "In Bearbeitung",
  answered: "Beantwortet",
  closed: "Geschlossen",
};

const navGroups = [
  {
    title: "",
    items: [{ id: "overview", label: "Kundenpanel", icon: Home }],
  },
  {
    title: "Kaufen",
    items: [{ id: "new-service", label: "Neues Produkt/Service", icon: ShoppingCart, expandable: true }],
  },
  {
    title: "Meine Services",
    items: [
      { id: "services", label: "Produkte/Services", icon: Server },
      { id: "domains", label: "Domains", icon: Globe2 },
      { id: "orders", label: "Bestellungen", icon: BriefcaseBusiness },
      { id: "invoices", label: "Rechnungen", icon: Receipt },
    ],
  },
  {
    title: "Konto",
    items: [
      { id: "account", label: "Mein Konto", icon: UserRound, expandable: true },
      { id: "wallet", label: "Guthaben", icon: Wallet },
      { id: "referrals", label: "Partnerprogramm", icon: Share2 },
    ],
  },
  {
    title: "Support",
    items: [
      { id: "support", label: "Support-Tickets", icon: Headphones },
      { id: "knowledge", label: "Wissensdatenbank", icon: BookOpen },
      { id: "notifications", label: "Benachrichtigungen", icon: Bell },
    ],
  },
  {
    title: "Entwickler",
    items: [{ id: "api", label: "API-Schlüssel", icon: Code2 }],
  },
];

function Card({ children, className = "" }) {
  return <section className={`rounded-2xl border border-slate-200 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.05)] ${className}`}>{children}</section>;
}

function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="flex min-h-[210px] flex-col items-center justify-center px-6 py-10 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-300"><Icon size={28} /></div>
      <h3 className="mt-4 text-base font-black text-slate-950">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{text}</p>
      {action}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-4">
        <div className={`grid h-12 w-12 place-items-center rounded-xl text-white ${color}`}><Icon size={23} /></div>
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
        </div>
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [active, setActive] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [mobileNav, setMobileNav] = useState(false);
  const [notice, setNotice] = useState("");
  const [walletAmount, setWalletAmount] = useState("100");
  const [walletNote, setWalletNote] = useState("");
  const [walletSubmitting, setWalletSubmitting] = useState(false);
  const [address, setAddress] = useState({
    street: user?.street || "",
    postalCode: user?.postalCode || "",
    city: user?.city || "",
    country: user?.country || "Schweiz",
  });

  const load = useCallback(async () => {
    try {
      setData((await api.get("/dashboard")).data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const invoices = useMemo(() => data?.invoices || [], [data?.invoices]);
  const activeOrders = useMemo(() => data?.activeOrders || [], [data?.activeOrders]);
  const openTickets = useMemo(() => data?.openTickets || [], [data?.openTickets]);
  const walletTransactions = useMemo(() => data?.wallet?.transactions || [], [data?.wallet?.transactions]);
  const openInvoices = useMemo(() => invoices.filter((invoice) => invoice.status !== "paid"), [invoices]);
  const paidInvoices = useMemo(() => invoices.filter((invoice) => invoice.status === "paid"), [invoices]);
  const outstanding = openInvoices.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);
  const accountBalance = Number(data?.wallet?.balance ?? data?.referral?.earned ?? 0);
  const backupCodes = user?.twoFactorBackupCodes || [];
  const referralUrl = `${window.location.origin}/register?ref=${data?.referral?.code || ""}`;

  const navigate = (id) => {
    setActive(id);
    setMobileNav(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveAddress = async (event) => {
    event.preventDefault();
    setNotice("");
    try {
      await api.put("/auth/profile", address);
      setNotice("Adresse wurde erfolgreich gespeichert.");
    } catch {
      setNotice("Adresse konnte nicht gespeichert werden.");
    }
  };

  const copyReferral = async () => {
    await navigator.clipboard.writeText(referralUrl);
    setNotice("Empfehlungslink wurde kopiert.");
  };

  const downloadInvoice = async (invoice) => {
    const response = await api.get(`/invoices/${invoice.id}/pdf`, { responseType: "blob" });
    const url = URL.createObjectURL(response.data);
    window.open(url, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(url), 30000);
  };

  const requestWalletTopUp = async (event) => {
    event.preventDefault();
    setNotice("");
    setWalletSubmitting(true);
    try {
      await api.post("/wallet/top-up", { amount: Number(walletAmount), note: walletNote });
      setNotice("Ihre Guthaben-Aufladung wurde an das Admin-Team gesendet.");
      setWalletAmount("100");
      setWalletNote("");
      await load();
    } catch (error) {
      setNotice(error?.response?.data?.detail || "Die Guthaben-Aufladung konnte nicht gesendet werden.");
    } finally {
      setWalletSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f5f7fb] text-slate-900">
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin text-[#E63946]" size={34} />
          <p className="mt-4 text-sm font-semibold text-slate-500">Ihr Kundenpanel wird geladen</p>
        </div>
      </div>
    );
  }

  const firstName = user?.firstName || "Kunde";
  const customerSince = date(user?.createdAt);
  const latestInvoice = openInvoices[0];

  const Sidebar = (
    <aside className="flex h-full w-[280px] flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#E63946] text-lg font-black text-white">
          {firstName?.[0] || "K"}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-slate-950">{user?.firstName} {user?.lastName}</p>
          <p className="truncate text-xs text-slate-500">{user?.email}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-5">
        {navGroups.map((group) => (
          <div key={group.title || "main"} className="mt-4 first:mt-0">
            {group.title && <p className="mb-2 px-2 text-[11px] font-black uppercase tracking-wide text-slate-400">{group.title}</p>}
            <div className="space-y-1">
              {group.items.map(({ id, label, icon: Icon, expandable }) => (
                <button
                  key={id}
                  onClick={() => navigate(id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-black transition ${
                    active === id
                      ? "bg-[#E63946] text-white shadow-[0_10px_24px_rgba(230,57,70,0.28)]"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                  }`}
                >
                  <Icon size={18} />
                  <span className="min-w-0 flex-1 truncate">{label}</span>
                  {expandable && <ChevronDown size={17} className="text-slate-400" />}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <button onClick={() => logout()} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-slate-500 transition hover:bg-red-50 hover:text-red-600">
          <LogOut size={17} /> Abmelden
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <MarqueeBanner target="account" />

      <div className="flex min-h-screen">
        <div className="hidden lg:block lg:sticky lg:top-0 lg:h-screen">{Sidebar}</div>

        {mobileNav && (
          <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm lg:hidden" onClick={() => setMobileNav(false)}>
            <div className="h-full overflow-y-auto" onClick={(event) => event.stopPropagation()}>
              <div className="relative h-full">
                {Sidebar}
                <button onClick={() => setMobileNav(false)} className="absolute right-3 top-3 rounded-xl bg-slate-100 p-2 text-slate-700"><X size={18} /></button>
              </div>
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
            <div className="flex min-h-[86px] flex-wrap items-center gap-3 px-4 py-4 sm:px-6 xl:px-8">
              <button onClick={() => setMobileNav(true)} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white lg:hidden">
                <Menu size={19} />
              </button>
              <div className="min-w-0">
                <h1 className="text-2xl font-black tracking-tight text-slate-950">Mein Panel</h1>
                <p className="text-sm text-slate-500">Kontoübersicht und Schnellaktionen</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Link to="/support" className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50 sm:inline-flex">
                  <Headphones size={16} /> Support
                </Link>
                <button onClick={() => navigate("wallet")} className="inline-flex items-center gap-2 rounded-xl bg-[#E63946] px-4 py-2.5 text-sm font-black text-white shadow-[0_10px_24px_rgba(230,57,70,0.25)] transition hover:bg-[#c5303d]">
                  <Wallet size={16} /> Guthaben aufladen
                </button>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1680px] px-4 py-6 sm:px-6 xl:px-8">
            {notice && (
              <div className="mb-5 flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
                <span className="inline-flex items-center gap-2"><Check size={16} /> {notice}</span>
                <button onClick={() => setNotice("")}><X size={16} /></button>
              </div>
            )}

            {active === "overview" && (
              <div className="space-y-5">
                <Card className="overflow-hidden border-red-100 bg-gradient-to-r from-red-50 via-white to-slate-50 p-5 sm:p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h2 className="text-2xl font-black tracking-tight text-slate-950">Hallo, {firstName}</h2>
                      <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
                        <CalendarDays size={15} /> Kunde seit {customerSince}
                      </p>
                    </div>
                    {latestInvoice && (
                      <button onClick={() => navigate("invoices")} className="inline-flex items-center justify-center gap-2 rounded-full bg-red-50 px-4 py-2.5 text-sm font-black text-red-700 hover:bg-red-100">
                        <Receipt size={16} /> {openInvoices.length} offene Rechnung{openInvoices.length === 1 ? "" : "en"} <ChevronRight size={16} />
                      </button>
                    )}
                  </div>
                </Card>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard icon={Server} label="Aktive Services" value={activeOrders.length} color="bg-blue-600" />
                  <StatCard icon={TicketCheck} label="Offene Tickets" value={openTickets.length} color="bg-violet-600" />
                  <StatCard icon={Receipt} label="Offene Rechnungen" value={openInvoices.length} color="bg-red-500" />
                  <StatCard icon={Wallet} label="Kontoguthaben" value={money(accountBalance)} color="bg-emerald-500" />
                </div>

                <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
                  <Card>
                    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                      <h3 className="inline-flex items-center gap-2 font-black"><ShoppingCart size={18} className="text-[#E63946]" /> Letzte Bestellungen</h3>
                      <button onClick={() => navigate("orders")} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-600 hover:bg-slate-50">Alle <ChevronRight size={15} /></button>
                    </div>
                    {activeOrders.length ? (
                      <div className="divide-y divide-slate-100">
                        {activeOrders.slice(0, 4).map((order) => (
                          <div key={order.id} className="flex items-center gap-4 px-5 py-4">
                            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600"><Package size={18} /></div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-black">{order.productName || "Hosting-Paket"}</p>
                              <p className="text-xs text-slate-500">Bestellung #{String(order.id).slice(0, 8)}</p>
                            </div>
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">{statusText[order.status] || "Aktiv"}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        icon={ShoppingCart}
                        title="Noch keine Bestellung vorhanden"
                        text="Starten Sie mit Ihrem ersten Hosting- oder Domain-Service."
                        action={<Link to="/#hosting" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#E63946] px-5 py-3 text-sm font-black text-white"><ShoppingCart size={18} /> Produkte ansehen</Link>}
                      />
                    )}
                  </Card>

                  <Card>
                    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                      <h3 className="inline-flex items-center gap-2 font-black"><FileText size={18} className="text-[#E63946]" /> Letzte Rechnungen</h3>
                      <button onClick={() => navigate("invoices")} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-600 hover:bg-slate-50">Alle <ChevronRight size={15} /></button>
                    </div>
                    {invoices.length ? (
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[520px] text-left">
                          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                            <tr><th className="px-5 py-3">Rechnung</th><th>Betrag</th><th>Status</th></tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {invoices.slice(0, 5).map((invoice) => (
                              <tr key={invoice.id} className="text-sm">
                                <td className="px-5 py-4"><p className="font-black">{invoice.number}</p><p className="text-xs text-slate-500">{date(invoice.createdAt)}</p></td>
                                <td className="font-black">{money(invoice.total)}</td>
                                <td><span className={`rounded-full px-3 py-1 text-xs font-black ${invoice.status === "paid" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{statusText[invoice.status] || invoice.status}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <EmptyState icon={FileText} title="Keine Rechnungen vorhanden" text="Ihre Rechnungen erscheinen automatisch hier." />
                    )}
                  </Card>
                </div>

                <Card>
                  <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                    <h3 className="inline-flex items-center gap-2 font-black"><Zap size={18} className="text-[#E63946]" /> Schnellaktionen</h3>
                  </div>
                  <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
                    {[
                      { id: "new-service", icon: ShoppingCart, title: "Neue Bestellung", text: "Neuen Service kaufen" },
                      { id: "domains", icon: Globe2, title: "Domain prüfen", text: "Neue Domain suchen" },
                      { id: "support", icon: Headphones, title: "Support-Ticket", text: "Neue Anfrage eröffnen" },
                      { id: "wallet", icon: Wallet, title: "Guthaben aufladen", text: "Konto aufladen" },
                      { id: "invoices", icon: FileText, title: "Rechnungen", text: "Rechnungen anzeigen" },
                      { id: "referrals", icon: Share2, title: "Partnerprogramm", text: "Empfehlungen verwalten" },
                    ].map((item) => (
                      <button key={item.id} onClick={() => navigate(item.id)} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-red-200 hover:bg-red-50">
                        <div className="grid h-11 w-11 place-items-center rounded-xl bg-white text-[#E63946] shadow-sm"><item.icon size={20} /></div>
                        <div><p className="font-black text-slate-950">{item.title}</p><p className="text-xs text-slate-500">{item.text}</p></div>
                      </button>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {active === "new-service" && (
              <Card className="p-8 text-center">
                <ShoppingCart className="mx-auto text-[#E63946]" size={38} />
                <h2 className="mt-4 text-2xl font-black">Neues Produkt oder Service bestellen</h2>
                <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">Wählen Sie ein Hosting-Paket, eine Domain oder einen zusätzlichen Service aus.</p>
                <Link to="/#hosting" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#E63946] px-5 py-3 text-sm font-black text-white">Hosting-Pakete ansehen <ChevronRight size={17} /></Link>
              </Card>
            )}

            {active === "services" && (
              <Card>
                <div className="border-b border-slate-200 p-5"><h2 className="text-xl font-black">Produkte und Services</h2><p className="text-sm text-slate-500">Aktive Hosting-, Domain- und Serviceleistungen</p></div>
                {activeOrders.length ? <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">{activeOrders.map((order) => <ServiceCard key={order.id} order={order} />)}</div> : <EmptyState icon={Server} title="Keine aktiven Services" text="Nach Ihrer ersten Bestellung erscheint Ihr Service hier." />}
              </Card>
            )}

            {active === "domains" && (
              <Card className="p-8 text-center">
                <Globe2 className="mx-auto text-blue-600" size={38} />
                <h2 className="mt-4 text-2xl font-black">Domains verwalten</h2>
                <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">Ihre registrierten Domains und Domain-Auktionen werden hier zusammengeführt.</p>
                <Link to="/domains" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white">Domain-Angebote öffnen <ChevronRight size={17} /></Link>
              </Card>
            )}

            {active === "orders" && (
              <Card>
                <div className="border-b border-slate-200 p-5"><h2 className="text-xl font-black">Bestellungen</h2><p className="text-sm text-slate-500">Alle aktiven und vergangenen Bestellungen</p></div>
                {activeOrders.length ? <div className="divide-y divide-slate-100">{activeOrders.map((order) => <OrderRow key={order.id} order={order} />)}</div> : <EmptyState icon={BriefcaseBusiness} title="Keine Bestellungen vorhanden" text="Ihre Bestellungen erscheinen nach dem Kauf automatisch hier." />}
              </Card>
            )}

            {active === "invoices" && (
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-3">
                  <StatCard icon={Receipt} label="Offener Betrag" value={money(outstanding)} color="bg-red-500" />
                  <StatCard icon={FileText} label="Offene Rechnungen" value={openInvoices.length} color="bg-[#E63946]" />
                  <StatCard icon={Check} label="Bezahlte Rechnungen" value={paidInvoices.length} color="bg-emerald-500" />
                </div>
                <Card>
                  <div className="border-b border-slate-200 p-5"><h2 className="text-xl font-black">Rechnungen</h2><p className="text-sm text-slate-500">Aktuelle und vergangene Rechnungen</p></div>
                  {invoices.length ? (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[760px] text-left">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                          <tr><th className="px-5 py-3">Rechnung</th><th>Datum</th><th>Fällig</th><th>Betrag</th><th>Status</th><th className="pr-5 text-right">Aktion</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {invoices.map((invoice) => (
                            <tr key={invoice.id} className="text-sm hover:bg-slate-50">
                              <td className="px-5 py-4 font-black">{invoice.number}</td>
                              <td>{date(invoice.createdAt)}</td>
                              <td>{date(invoice.dueDate)}</td>
                              <td className="font-black">{money(invoice.total)}</td>
                              <td><span className={`rounded-full px-3 py-1 text-xs font-black ${invoice.status === "paid" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{statusText[invoice.status] || invoice.status}</span></td>
                              <td className="pr-5 text-right"><button onClick={() => downloadInvoice(invoice)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black hover:bg-slate-50">PDF öffnen</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : <EmptyState icon={Receipt} title="Keine Rechnungen vorhanden" text="Ihre Rechnungen werden automatisch archiviert." />}
                </Card>
              </div>
            )}

            {active === "support" && (
              <Card>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5">
                  <div><h2 className="text-xl font-black">Support-Tickets</h2><p className="text-sm text-slate-500">Anfragen und Antworten im Überblick</p></div>
                  <Link to="/support" className="rounded-xl bg-[#E63946] px-4 py-2.5 text-sm font-black text-white">Neues Ticket</Link>
                </div>
                {openTickets.length ? <div className="divide-y divide-slate-100">{openTickets.map((ticket) => <Link key={ticket.id} to={`/tickets/${ticket.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50"><div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600"><Headphones size={18} /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-black">{ticket.subject}</p><p className="text-xs text-slate-500">Aktualisiert {date(ticket.updatedAt)}</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{statusText[ticket.status] || ticket.status}</span></Link>)}</div> : <EmptyState icon={TicketCheck} title="Keine offenen Tickets" text="Wenn Sie Hilfe benötigen, können Sie jederzeit ein neues Ticket eröffnen." />}
              </Card>
            )}

            {active === "wallet" && (
              <WalletPanel
                balance={accountBalance}
                amount={walletAmount}
                note={walletNote}
                submitting={walletSubmitting}
                transactions={walletTransactions}
                onAmount={setWalletAmount}
                onNote={setWalletNote}
                onSubmit={requestWalletTopUp}
              />
            )}
            {active === "knowledge" && <InfoPanel icon={BookOpen} title="Wissensdatenbank" text="Hilfedokumente und Anleitungen werden hier bereitgestellt." />}
            {active === "notifications" && <InfoPanel icon={Bell} title="Benachrichtigungen" text="Wichtige Systemmeldungen und Hinweise erscheinen hier." />}
            {active === "api" && <InfoPanel icon={KeyRound} title="API-Schlüssel" text="API-Zugänge für Entwickler werden nach Freigabe in diesem Bereich verwaltet." />}

            {active === "referrals" && (
              <Card className="p-6">
                <Gift className="text-emerald-600" />
                <h2 className="mt-4 text-2xl font-black">Partnerprogramm</h2>
                <p className="mt-2 text-sm text-slate-500">Teilen Sie Ihren persönlichen Empfehlungslink und erhalten Sie Guthaben für erfolgreiche Empfehlungen.</p>
                <div className="mt-5 flex flex-col gap-2 rounded-2xl bg-slate-50 p-3 sm:flex-row">
                  <input readOnly value={referralUrl} className="min-w-0 flex-1 bg-transparent px-2 text-sm text-slate-600 outline-none" />
                  <button onClick={copyReferral} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white">Link kopieren</button>
                </div>
              </Card>
            )}

            {active === "account" && (
              <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
                <Card className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-950 text-lg font-black text-white">{user?.firstName?.[0]}{user?.lastName?.[0]}</div>
                    <div><h2 className="text-lg font-black">{user?.firstName} {user?.lastName}</h2><p className="text-sm text-slate-500">{user?.email}</p></div>
                  </div>
                  <div className="mt-6 space-y-3 border-t border-slate-200 pt-5 text-sm">
                    <Row label="Konto" value="Verifiziert" />
                    <Row label="Firma" value={user?.company || "Privatkunde"} />
                    <Row label="Telefon" value={user?.phone || "Nicht hinterlegt"} />
                  </div>
                  <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4">
                    <p className="text-xs font-black uppercase tracking-wide text-red-700">2FA-Backup-Codes</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">{backupCodes.length ? backupCodes.map((code) => <div key={code} className="rounded-xl bg-white px-3 py-2 font-mono text-xs font-black tracking-wide">{code}</div>) : <p className="text-sm text-slate-500">Keine Codes verfügbar.</p>}</div>
                  </div>
                </Card>
                <Card>
                  <div className="border-b border-slate-200 p-5"><h2 className="text-xl font-black">Rechnungsadresse</h2><p className="text-sm text-slate-500">Diese Adresse wird für Rechnungen und Verträge verwendet.</p></div>
                  <form onSubmit={saveAddress} className="grid gap-4 p-5 sm:grid-cols-2">
                    <Field label="Strasse und Hausnummer" className="sm:col-span-2"><input required value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} placeholder="Musterstrasse 12" /></Field>
                    <Field label="PLZ"><input required value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} placeholder="8001" /></Field>
                    <Field label="Ort"><input required value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} placeholder="Zürich" /></Field>
                    <Field label="Land" className="sm:col-span-2"><input required value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} /></Field>
                    <button className="sm:col-span-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white">Adresse speichern</button>
                  </form>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function ServiceCard({ order }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5">
      <div className="flex items-start justify-between">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-600"><Server size={20} /></div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">{statusText[order.status] || "Aktiv"}</span>
      </div>
      <h3 className="mt-4 text-lg font-black">{order.productName || "Hosting-Paket"}</h3>
      <p className="mt-1 text-xs text-slate-500">Bestellung #{String(order.id).slice(0, 8)}</p>
      <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-500">Aktiv seit {date(order.activatedAt || order.createdAt)}</p>
    </div>
  );
}

function OrderRow({ order }) {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-[#E63946]"><Box size={18} /></div>
      <div className="min-w-0 flex-1"><p className="truncate text-sm font-black">{order.productName || "Hosting-Paket"}</p><p className="text-xs text-slate-500">{date(order.createdAt)}</p></div>
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{statusText[order.status] || order.status}</span>
    </div>
  );
}

function WalletPanel({ balance, amount, note, submitting, transactions, onAmount, onNote, onSubmit }) {
  return (
    <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-[#E63946] p-6 text-white">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/12"><Wallet size={24} /></div>
          <p className="mt-6 text-sm font-bold text-white/70">Aktuelles Kontoguthaben</p>
          <p className="mt-1 text-4xl font-black tracking-tight">{money(balance)}</p>
          <p className="mt-3 text-sm leading-6 text-white/70">Aufladungen werden zuerst als Anfrage gespeichert und nach Prüfung im Admin-Panel gutgeschrieben.</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4 p-5">
          <Field label="Betrag in CHF">
            <input type="number" min="10" step="1" value={amount} onChange={(e) => onAmount(e.target.value)} placeholder="100" />
          </Field>
          <Field label="Notiz optional">
            <input value={note} onChange={(e) => onNote(e.target.value)} placeholder="z.B. Banküberweisung folgt heute" />
          </Field>
          <button disabled={submitting} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#E63946] px-5 py-3 text-sm font-black text-white transition hover:bg-[#c5303d] disabled:opacity-60">
            {submitting ? <Loader2 className="animate-spin" size={17} /> : <CreditCard size={17} />}
            Aufladung beantragen
          </button>
        </form>
      </Card>

      <Card>
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-xl font-black">Guthaben-Verlauf</h2>
          <p className="text-sm text-slate-500">Ihre letzten Aufladungen und Admin-Anpassungen</p>
        </div>
        {transactions.length ? (
          <div className="divide-y divide-slate-100">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-black">{tx.type === "top_up_request" ? "Aufladeanfrage" : tx.type === "admin_debit" ? "Guthaben-Abzug" : "Guthaben-Gutschrift"}</p>
                  <p className="text-xs text-slate-500">{date(tx.createdAt)}{tx.note ? ` · ${tx.note}` : ""}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${tx.status === "completed" ? "bg-emerald-50 text-emerald-700" : tx.status === "rejected" ? "bg-slate-100 text-slate-500" : "bg-red-50 text-red-700"}`}>
                    {tx.status === "completed" ? "Abgeschlossen" : tx.status === "rejected" ? "Abgelehnt" : "Ausstehend"}
                  </span>
                  <span className="min-w-[96px] text-right text-sm font-black">{money(tx.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={Wallet} title="Noch keine Guthaben-Bewegung" text="Ihre Aufladeanfragen und Gutschriften erscheinen hier." />
        )}
      </Card>
    </div>
  );
}

function InfoPanel({ icon: Icon, title, text }) {
  return (
    <Card className="p-8 text-center">
      <Icon className="mx-auto text-[#E63946]" size={38} />
      <h2 className="mt-4 text-2xl font-black">{title}</h2>
      <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-500">{text}</p>
    </Card>
  );
}

function Row({ label, value }) {
  return <div className="flex justify-between gap-4"><span className="text-slate-500">{label}</span><span className="font-bold text-slate-900">{value}</span></div>;
}

function Field({ label, children, className = "" }) {
  return (
    <label className={`block text-sm font-bold text-slate-800 ${className}`}>
      <span>{label}</span>
      {React.cloneElement(children, {
        className: "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal outline-none transition focus:border-slate-900",
      })}
    </label>
  );
}
