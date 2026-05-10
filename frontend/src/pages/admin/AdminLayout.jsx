import React, { useEffect, useState } from "react";
import { NavLink, Outlet, Navigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Inbox, FolderKanban, FileText, MessageSquareQuote,
  Wrench, LogOut, Mail, Loader2, ExternalLink, Settings, HelpCircle,
  Receipt, FileSignature, Building2, Package, Server, Menu, X,
  Users, ShoppingCart, MessageSquare, Zap, Gavel,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import Logo from "../../components/Logo";

const groups = [
  {
    label: "Übersicht",
    links: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
      { to: "/admin/site", label: "Website-Inhalte", icon: Settings },
    ],
  },
  {
    label: "Kundenverwaltung",
    links: [
      { to: "/admin/customers", label: "Kunden", icon: Users },
      { to: "/admin/orders", label: "Bestellungen", icon: ShoppingCart },
      { to: "/admin/platform", label: "SaaS / WHM Control", icon: Zap },
      { to: "/admin/tickets", label: "Support-Tickets", icon: MessageSquare },
    ],
  },
  {
    label: "Anfragen",
    links: [
      { to: "/admin/quotes", label: "Angebot-Anfragen", icon: Inbox },
      { to: "/admin/contacts", label: "Kontakt-Nachrichten", icon: Mail },
    ],
  },
  {
    label: "Inhalte",
    links: [
      { to: "/admin/projects", label: "Projekte", icon: FolderKanban },
      { to: "/admin/blogs", label: "Blog", icon: FileText },
      { to: "/admin/testimonials", label: "Bewertungen", icon: MessageSquareQuote },
      { to: "/admin/services", label: "Dienstleistungen", icon: Wrench },
      { to: "/admin/faqs", label: "FAQ", icon: HelpCircle },
      { to: "/admin/templates", label: "Antwortvorlagen", icon: FileText },
    ],
  },
  {
    label: "Buchhaltung",
    links: [
      { to: "/admin/companies", label: "Firmen / Logos", icon: Building2 },
      { to: "/admin/hosting", label: "Hosting-Pakete", icon: Server },
      { to: "/admin/products", label: "Produkte / Katalog", icon: Package },
      { to: "/admin/platform", label: "Domain Auktionen", icon: Gavel },
      { to: "/admin/invoices", label: "Rechnungen", icon: Receipt },
      { to: "/admin/offers", label: "Offerten", icon: FileSignature },
      { to: "/admin/invoice-templates", label: "Rechnungs-Vorlagen", icon: FileText },
    ],
  },
];

export default function AdminLayout() {
  const { user, logout, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => { setOpen(false); }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/admin/login" replace />;

  const Sidebar = (
    <aside className="w-64 bg-[#0a0a0a] text-white min-h-screen flex flex-col flex-shrink-0">
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <div>
          <Logo size="md" />
          <p className="text-white/50 text-[11px] mt-1 tracking-wider">ADMIN PANEL</p>
        </div>
        <button onClick={() => setOpen(false)} className="lg:hidden text-white/70 hover:text-white" aria-label="Schließen">
          <X size={22} />
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {groups.map((g) => (
          <div key={g.label}>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35 px-2 mb-1.5">{g.label}</p>
            <div className="space-y-0.5">
              {g.links.map((l) => {
                const Icon = l.icon;
                return (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.end}
                    data-testid={`nav-${l.to.replace(/\//g, "-")}`}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                        isActive
                          ? "bg-[#E63946] text-white shadow-lg"
                          : "text-white/75 hover:bg-white/5 hover:text-white"
                      }`
                    }
                  >
                    <Icon size={17} />
                    {l.label}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-white/10 space-y-1">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/75 hover:bg-white/5 hover:text-white transition"
        >
          <ExternalLink size={16} /> Website ansehen
        </a>
        <button
          onClick={logout}
          data-testid="logout-btn"
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/75 hover:bg-red-950/30 hover:text-red-300 transition"
        >
          <LogOut size={16} /> Abmelden
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#f1f5fb] flex">
      {/* Desktop sidebar */}
      <div className="hidden lg:block sticky top-0 h-screen">{Sidebar}</div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative h-full overflow-y-auto">{Sidebar}</div>
        </div>
      )}

      <main className="flex-1 min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 shadow-sm">
          <button
            onClick={() => setOpen(true)}
            data-testid="open-sidebar"
            className="w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0f172a] flex items-center justify-center"
            aria-label="Menü öffnen"
          >
            <Menu size={20} />
          </button>
          <Logo size="sm" inverted />
          <span className="ml-auto text-xs text-[#64748b]">Admin</span>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 max-w-full overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
