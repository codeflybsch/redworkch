import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../api";
import {
  Server,
  FileText,
  MessageSquare,
  CreditCard,
  Calendar,
  Settings,
  LogOut,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Plus
} from "lucide-react";

export default function Kundendashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // For now, mock data - in real app would fetch from API
        setStats({
          activePackages: 2,
          openTickets: 1,
          pendingInvoices: 1,
          nextRenewal: "2026-06-15"
        });
        setSubscriptions([
          {
            id: "sub-001",
            name: "Professional Hosting",
            status: "active",
            domain: "example.com",
            startDate: "2025-01-15",
            renewalDate: "2026-01-15",
            price: 49.99,
            period: "year"
          },
          {
            id: "sub-002",
            name: "SSL Certificate",
            status: "active",
            domain: "example.com",
            startDate: "2025-01-15",
            renewalDate: "2026-01-15",
            price: 79.99,
            period: "year"
          }
        ]);
        setInvoices([
          {
            id: "INV-2026-001",
            date: "2026-04-01",
            amount: 129.98,
            status: "paid",
            description: "Hosting & SSL - Januar 2026"
          },
          {
            id: "INV-2026-002",
            date: "2026-05-01",
            amount: 129.98,
            status: "pending",
            description: "Hosting & SSL - Mai 2026"
          }
        ]);
        setTickets([
          {
            id: "TKT-001",
            subject: "SSL-Zertifikat erneuern",
            status: "open",
            created: "2026-05-08",
            lastUpdated: "2026-05-08"
          }
        ]);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (!user || user.role !== "customer") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-lg mb-4">Zugriff verweigert</p>
          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition"
          >
            Zur Anmeldung
          </button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const badges = {
      active: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      open: "bg-orange-100 text-orange-800",
      paid: "bg-green-100 text-green-800",
      overdue: "bg-red-100 text-red-800"
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status) => {
    const icons = {
      active: <CheckCircle size={16} />,
      pending: <Clock size={16} />,
      open: <AlertCircle size={16} />,
      paid: <CheckCircle size={16} />,
      overdue: <AlertCircle size={16} />
    };
    return icons[status];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Kundendashboard</h1>
            <p className="text-slate-400 text-sm mt-1">
              Willkommen, {user.firstName} {user.lastName}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/profile")}
              className="inline-flex items-center gap-2 text-slate-300 hover:text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition"
            >
              <Settings size={20} />
              Profil
            </button>
            <button
              onClick={() => {
                if (confirm("Sind Sie sicher, dass Sie sich abmelden möchten?")) {
                  logout();
                }
              }}
              className="inline-flex items-center gap-2 text-slate-300 hover:text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition"
            >
              <LogOut size={20} />
              Abmelden
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Active Packages */}
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold opacity-90">Aktive Pakete</h3>
                <Server size={24} className="opacity-75" />
              </div>
              <div className="text-3xl font-bold">{stats.activePackages}</div>
              <p className="text-xs opacity-75 mt-2">Hosting-Abonnements</p>
            </div>

            {/* Open Tickets */}
            <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold opacity-90">Offene Tickets</h3>
                <MessageSquare size={24} className="opacity-75" />
              </div>
              <div className="text-3xl font-bold">{stats.openTickets}</div>
              <p className="text-xs opacity-75 mt-2">Support-Anfragen</p>
            </div>

            {/* Pending Invoices */}
            <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold opacity-90">Offene Rechnungen</h3>
                <FileText size={24} className="opacity-75" />
              </div>
              <div className="text-3xl font-bold">{stats.pendingInvoices}</div>
              <p className="text-xs opacity-75 mt-2">CHF {invoices.find(i => i.status === "pending")?.amount || "0.00"}</p>
            </div>

            {/* Next Renewal */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold opacity-90">Nächste Verlängerung</h3>
                <Calendar size={24} className="opacity-75" />
              </div>
              <div className="text-lg font-bold">{new Date(stats.nextRenewal).toLocaleDateString("de-DE")}</div>
              <p className="text-xs opacity-75 mt-2">Automatische Verlängerung</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-700">
          {[
            { id: "overview", label: "Übersicht", icon: <Server size={18} /> },
            { id: "subscriptions", label: "Abonnements", icon: <CreditCard size={18} /> },
            { id: "invoices", label: "Rechnungen", icon: <FileText size={18} /> },
            { id: "tickets", label: "Support-Tickets", icon: <MessageSquare size={18} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm transition border-b-2 ${
                activeTab === tab.id
                  ? "text-blue-400 border-blue-400"
                  : "text-slate-400 border-transparent hover:text-slate-300"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
            <p className="text-slate-400 mt-4">Daten werden geladen...</p>
          </div>
        ) : (
          <>
            {/* Overview */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                  <h2 className="text-lg font-bold text-white mb-4">Schnelle Aktionen</h2>
                  <div className="space-y-3">
                    <button className="w-full flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition font-semibold">
                      <Plus size={18} />
                      Neues Paket kaufen
                    </button>
                    <button className="w-full flex items-center gap-3 bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-lg transition font-semibold">
                      <MessageSquare size={18} />
                      Support kontaktieren
                    </button>
                    <button className="w-full flex items-center gap-3 bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-lg transition font-semibold">
                      <Download size={18} />
                      Alle Rechnungen
                    </button>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-lg p-6">
                  <h2 className="text-lg font-bold text-white mb-4">Letzte Aktivität</h2>
                  <div className="space-y-4">
                    {invoices.slice(0, 3).map(inv => (
                      <div key={inv.id} className="flex items-center justify-between pb-4 border-b border-slate-700 last:border-0 last:pb-0">
                        <div>
                          <p className="text-white font-semibold">{inv.description}</p>
                          <p className="text-xs text-slate-400 mt-1">{new Date(inv.date).toLocaleDateString("de-DE")}</p>
                        </div>
                        <span className="text-white font-bold">CHF {inv.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Subscriptions */}
            {activeTab === "subscriptions" && (
              <div className="space-y-4">
                {subscriptions.length === 0 ? (
                  <div className="text-center py-12 bg-slate-800 border border-slate-700 rounded-lg">
                    <Server size={48} className="mx-auto text-slate-400 mb-4" />
                    <p className="text-slate-400 text-lg">Keine aktiven Abonnements</p>
                    <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition font-semibold">
                      Paket jetzt kaufen
                    </button>
                  </div>
                ) : (
                  subscriptions.map(sub => (
                    <div key={sub.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-white">{sub.name}</h3>
                          <p className="text-slate-400 text-sm">{sub.domain}</p>
                        </div>
                        <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(sub.status)}`}>
                          {getStatusIcon(sub.status)}
                          {sub.status === "active" ? "Aktiv" : "Inaktiv"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-slate-700">
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Preis</p>
                          <p className="text-white font-semibold">CHF {sub.price.toFixed(2)}/{sub.period === "month" ? "Monat" : "Jahr"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Startdatum</p>
                          <p className="text-white font-semibold">{new Date(sub.startDate).toLocaleDateString("de-DE")}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Verlängerung</p>
                          <p className="text-white font-semibold">{new Date(sub.renewalDate).toLocaleDateString("de-DE")}</p>
                        </div>
                        <div className="text-right">
                          <button className="text-blue-400 hover:text-blue-300 transition font-semibold text-sm flex items-center gap-1 ml-auto">
                            Verwalten
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Invoices */}
            {activeTab === "invoices" && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700 bg-slate-800">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300">Rechnungsnummer</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300">Datum</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300">Beschreibung</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300">Betrag</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300">Aktion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map(inv => (
                      <tr key={inv.id} className="border-b border-slate-700 hover:bg-slate-800 transition">
                        <td className="px-6 py-4 text-sm font-semibold text-white">{inv.id}</td>
                        <td className="px-6 py-4 text-sm text-slate-400">{new Date(inv.date).toLocaleDateString("de-DE")}</td>
                        <td className="px-6 py-4 text-sm text-slate-300">{inv.description}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-white">CHF {inv.amount.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(inv.status)}`}>
                            {getStatusIcon(inv.status)}
                            {inv.status === "paid" ? "Bezahlt" : "Ausstehend"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-blue-400 hover:text-blue-300 transition font-semibold text-sm flex items-center gap-1">
                            <Download size={16} />
                            PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Support Tickets */}
            {activeTab === "tickets" && (
              <div className="space-y-4">
                <div className="flex justify-end mb-4">
                  <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition font-semibold">
                    <Plus size={18} />
                    Neues Ticket
                  </button>
                </div>
                {tickets.length === 0 ? (
                  <div className="text-center py-12 bg-slate-800 border border-slate-700 rounded-lg">
                    <MessageSquare size={48} className="mx-auto text-slate-400 mb-4" />
                    <p className="text-slate-400 text-lg">Keine Support-Tickets</p>
                  </div>
                ) : (
                  tickets.map(ticket => (
                    <div key={ticket.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-orange-500 transition cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-white">{ticket.subject}</h3>
                          <p className="text-xs text-slate-400 mt-2">Ticket-ID: {ticket.id}</p>
                          <p className="text-xs text-slate-500 mt-1">Erstellt: {new Date(ticket.created).toLocaleDateString("de-DE")}</p>
                        </div>
                        <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(ticket.status)}`}>
                          {getStatusIcon(ticket.status)}
                          {ticket.status === "open" ? "Offen" : "Geschlossen"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
