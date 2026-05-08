import React, { useCallback, useEffect, useState } from "react";
import { Inbox, Mail, FolderKanban, FileText, MessageSquareQuote, Wrench, AlertCircle, Receipt, FileSignature, HelpCircle, Package, Building2 } from "lucide-react";
import api from "../../api";
import { Link } from "react-router-dom";

const cards = [
  { key: "newQuotes", total: "quotes", label: "Angebot-Anfragen", icon: Inbox, color: "#E63946", to: "/admin/quotes" },
  { key: "newContacts", total: "contacts", label: "Kontakt-Nachrichten", icon: Mail, color: "#1E88E5", to: "/admin/contacts" },
  { key: "invoices", label: "Rechnungen", icon: Receipt, color: "#22C55E", to: "/admin/invoices" },
  { key: "offers", label: "Offerten", icon: FileSignature, color: "#06B6D4", to: "/admin/offers" },
  { key: "projects", label: "Projekte", icon: FolderKanban, color: "#22C55E", to: "/admin/projects" },
  { key: "blogs", label: "Blog-Beiträge", icon: FileText, color: "#F59E0B", to: "/admin/blogs" },
  { key: "testimonials", label: "Bewertungen", icon: MessageSquareQuote, color: "#A855F7", to: "/admin/testimonials" },
  { key: "services", label: "Dienstleistungen", icon: Wrench, color: "#06B6D4", to: "/admin/services" },
  { key: "faqs", label: "FAQ-Einträge", icon: HelpCircle, color: "#A855F7", to: "/admin/faqs" },
  { key: "products", label: "Produkte / Katalog", icon: Package, color: "#F97316", to: "/admin/products" },
  { key: "hosting", label: "Hosting-Pakete", icon: Package, color: "#22C55E", to: "/admin/hosting" },
  { key: "companies", label: "Firmen", icon: Building2, color: "#0f172a", to: "/admin/companies" },
];

export default function Dashboard() {
  const [stats, setStats] = useState({});

  const loadStats = useCallback(async () => {
    try {
      const r = await api.get("/admin/stats");
      setStats(r.data);
    } catch (e) { /* ignore */ }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  return (
    <div data-testid="dashboard-page">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a]">Dashboard</h1>
      <p className="text-[#64748b] mt-1">Überblick über alle Aktivitäten</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 mt-8">
        {cards.map((c) => {
          const Icon = c.icon;
          const value = stats[c.key] ?? "—";
          const total = c.total ? stats[c.total] : null;
          return (
            <Link
              key={c.key}
              to={c.to}
              data-testid={`dash-${c.key}`}
              className="bg-white rounded-2xl p-5 sm:p-6 shadow-card hover:-translate-y-1 transition-transform"
            >
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${c.color}15`, color: c.color }}>
                  <Icon size={22} />
                </div>
                {c.total && stats[c.key] > 0 && (
                  <span className="bg-[#E63946] text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <AlertCircle size={11} /> NEU
                  </span>
                )}
              </div>
              <div className="mt-4">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#0f172a]">
                  {value}
                  {total !== null && total !== undefined && <span className="text-[#94a3b8] text-sm font-medium"> / {total}</span>}
                </div>
                <p className="text-sm text-[#64748b] mt-1">{c.label}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
