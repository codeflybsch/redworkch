import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../api";
import {
  Users,
  Package,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  BarChart3,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Menu,
  X,
  ChevronRight,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Plus,
  Eye
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mock data
        setStats({
          totalCustomers: 1542,
          activeSubscriptions: 3287,
          monthlyRevenue: 45280.50,
          pendingInvoices: 245,
          openTickets: 18,
          revenueGrowth: 12.5
        });
        setCustomers([
          {
            id: "cust-001",
            email: "kunde@test.ch",
            name: "Max Mustermann",
            company: "Test GmbH",
            status: "active",
            subscriptions: 2,
            totalSpent: 2999.90,
            joinDate: "2024-01-15",
            lastPayment: "2026-05-01"
          },
          {
            id: "cust-002",
            email: "anna@test.ch",
            name: "Anna Schmidt",
            company: "Anna's Boutique",
            status: "active",
            subscriptions: 1,
            totalSpent: 1499.95,
            joinDate: "2024-01-20",
            lastPayment: "2026-05-05"
          },
          {
            id: "cust-003",
            email: "peter@test.ch",
            name: "Peter Weber",
            company: "Weber Consulting",
            status: "inactive",
            subscriptions: 0,
            totalSpent: 999.90,
            joinDate: "2024-02-01",
            lastPayment: "2026-03-15"
          }
        ]);
      } catch (err) {
        console.error("Error fetching admin data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-lg mb-4">Admin-Zugriff erforderlich</p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition"
          >
            Zur Startseite
          </button>
        </div>
      </div>
    );
  }

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const sidebarItems = [
    { id: "overview", label: "Übersicht", icon: <BarChart3 size={20} /> },
    { id: "customers", label: "Kunden", icon: <Users size={20} /> },
    { id: "subscriptions", label: "Abonnements", icon: <Package size={20} /> },
    { id: "invoices", label: "Rechnungen", icon: <FileText size={20} /> },
    { id: "tickets", label: "Support-Tickets", icon: <MessageSquare size={20} /> },
    { id: "settings", label: "Einstellungen", icon: <Settings size={20} /> }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-800 transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            redwork.ch
          </h1>
          <p className="text-xs text-slate-500 mt-2">Administration</p>
        </div>

        <nav className="p-4 space-y-2">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeSection === item.id
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {item.icon}
              <span className="font-semibold">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
          <button
            onClick={() => {
              if (confirm("Admin-Sitzung beenden?")) {
                logout();
              }
            }}
            className="w-full flex items-center gap-3 text-slate-400 hover:text-white px-4 py-3 rounded-lg hover:bg-slate-800 transition"
          >
            <LogOut size={20} />
            <span className="font-semibold">Abmelden</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-slate-850 border-b border-slate-800 backdrop-blur">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-slate-400 hover:text-white transition"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex-1 ml-4 lg:ml-0">
              <p className="text-sm font-semibold text-slate-300">Administrator: {user.username}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs bg-green-500 text-white px-3 py-1 rounded-full">
                ● Online
              </span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6 max-w-7xl mx-auto">
          
          {/* Overview Section */}
          {activeSection === "overview" && stats && (
            <div>
              <h1 className="text-3xl font-bold mb-8">Dashboard Übersicht</h1>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Total Customers */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold opacity-90">Gesamt Kunden</h3>
                    <Users size={28} className="opacity-50" />
                  </div>
                  <div className="text-4xl font-bold">{stats.totalCustomers.toLocaleString()}</div>
                  <p className="text-xs opacity-75 mt-2">+{Math.floor(stats.totalCustomers * 0.05)} diesen Monat</p>
                </div>

                {/* Active Subscriptions */}
                <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold opacity-90">Aktive Abos</h3>
                    <Package size={28} className="opacity-50" />
                  </div>
                  <div className="text-4xl font-bold">{stats.activeSubscriptions.toLocaleString()}</div>
                  <p className="text-xs opacity-75 mt-2">+{Math.floor(stats.activeSubscriptions * 0.08)} diese Woche</p>
                </div>

                {/* Monthly Revenue */}
                <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold opacity-90">Monatlicher Umsatz</h3>
                    <DollarSign size={28} className="opacity-50" />
                  </div>
                  <div className="text-4xl font-bold">CHF {(stats.monthlyRevenue / 1000).toFixed(1)}k</div>
                  <div className="flex items-center gap-2 text-xs opacity-75 mt-2">
                    <TrendingUp size={14} className="text-green-400" />
                    +{stats.revenueGrowth}% vs. letzten Monat
                  </div>
                </div>

                {/* Pending Invoices */}
                <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold opacity-90">Ausstehende Rechnungen</h3>
                    <FileText size={28} className="opacity-50" />
                  </div>
                  <div className="text-4xl font-bold">{stats.pendingInvoices}</div>
                  <p className="text-xs opacity-75 mt-2">CHF {(Math.random() * 50000).toFixed(2)}</p>
                </div>

                {/* Open Tickets */}
                <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold opacity-90">Offene Tickets</h3>
                    <MessageSquare size={28} className="opacity-50" />
                  </div>
                  <div className="text-4xl font-bold">{stats.openTickets}</div>
                  <p className="text-xs opacity-75 mt-2">Ø Antwortzeit: 2h 15m</p>
                </div>

                {/* System Status */}
                <div className="bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-lg p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold opacity-90">System Status</h3>
                    <AlertCircle size={28} className="opacity-50" />
                  </div>
                  <div className="text-2xl font-bold flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                    Alle Systeme OK
                  </div>
                  <p className="text-xs opacity-75 mt-2">Uptime: 99.98%</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <BarChart3 size={24} />
                  Schnelle Aktionen
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg transition font-semibold">
                    <Plus size={18} />
                    Rechnung erstellen
                  </button>
                  <button className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-3 rounded-lg transition font-semibold">
                    <Users size={18} />
                    Kunde hinzufügen
                  </button>
                  <button className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-3 rounded-lg transition font-semibold">
                    <Download size={18} />
                    Bericht exportieren
                  </button>
                  <button className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-3 rounded-lg transition font-semibold">
                    <Settings size={18} />
                    Einstellungen
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Customers Section */}
          {activeSection === "customers" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Kundenverwaltung</h1>
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition font-semibold">
                  <Plus size={18} />
                  Neuer Kunde
                </button>
              </div>

              {/* Filters */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search size={18} className="absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Nach E-Mail oder Name suchen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="all">Alle Status</option>
                  <option value="active">Aktiv</option>
                  <option value="inactive">Inaktiv</option>
                </select>
                <button className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition">
                  <Filter size={18} />
                </button>
              </div>

              {/* Customers Table */}
              <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-900 border-b border-slate-700">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300">Kunde</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300">E-Mail</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300">Firma</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300">Abos</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300">Gesamt</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300">Letzte Zahlung</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300">Aktionen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.map(customer => (
                        <tr key={customer.id} className="border-b border-slate-700 hover:bg-slate-700/50 transition">
                          <td className="px-6 py-4 text-sm font-semibold">{customer.name}</td>
                          <td className="px-6 py-4 text-sm text-slate-400">{customer.email}</td>
                          <td className="px-6 py-4 text-sm text-slate-400">{customer.company}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              customer.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}>
                              {customer.status === "active" ? "Aktiv" : "Inaktiv"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-white font-semibold">{customer.subscriptions}</td>
                          <td className="px-6 py-4 text-sm text-white font-semibold">CHF {customer.totalSpent.toFixed(2)}</td>
                          <td className="px-6 py-4 text-sm text-slate-400">{new Date(customer.lastPayment).toLocaleDateString("de-DE")}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button className="p-2 text-blue-400 hover:text-blue-300 transition" title="Ansehen">
                                <Eye size={18} />
                              </button>
                              <button className="p-2 text-yellow-400 hover:text-yellow-300 transition" title="Bearbeiten">
                                <Edit size={18} />
                              </button>
                              <button className="p-2 text-red-400 hover:text-red-300 transition" title="Löschen">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-slate-400">
                  Zeige {filteredCustomers.length} von {customers.length} Kunden
                </p>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition">← Zurück</button>
                  <button className="px-4 py-2 bg-blue-600 rounded-lg text-white">1</button>
                  <button className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition">2</button>
                  <button className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition">Weiter →</button>
                </div>
              </div>
            </div>
          )}

          {/* Other Sections - Placeholder */}
          {["subscriptions", "invoices", "tickets", "settings"].includes(activeSection) && (
            <div className="text-center py-12">
              <AlertCircle size={48} className="mx-auto text-slate-400 mb-4" />
              <p className="text-slate-400 text-lg">Diese Sektion wird noch entwickelt</p>
              <p className="text-slate-500 text-sm mt-2">Bitte wechseln Sie zu einem anderen Bereich</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
