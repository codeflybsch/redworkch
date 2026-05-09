import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Server, Package, FileText, MessageSquare, Activity, Plus } from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/dashboard");
        setData(res.data);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Laden...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Mein Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Willkommen, {user.firstName}</span>
              <Button variant="outline" onClick={logout}>Abmelden</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktive Pakete</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.activeOrders.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Offene Tickets</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.openTickets.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Server Status</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Online</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rechnungen</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.invoices.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Orders */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Aktive Hosting-Pakete
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.activeOrders.length === 0 ? (
                  <p className="text-gray-500">Keine aktiven Pakete</p>
                ) : (
                  <div className="space-y-4">
                    {data.activeOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold">{order.productName}</h3>
                          <p className="text-sm text-gray-600">Bestellung #{order.id}</p>
                        </div>
                        <Badge variant={order.status === 'active' ? 'default' : 'secondary'}>
                          {order.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4">
                  <Link to="/products">
                    <Button className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Neues Paket bestellen
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Letzte Aktivitäten
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.recentActivities.length === 0 ? (
                  <p className="text-gray-500">Keine Aktivitäten</p>
                ) : (
                  <div className="space-y-3">
                    {data.recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm">{activity.message}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(activity.date).toLocaleDateString('de-DE')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Open Tickets */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Offene Support-Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.openTickets.length === 0 ? (
              <p className="text-gray-500">Keine offenen Tickets</p>
            ) : (
              <div className="space-y-4">
                {data.openTickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{ticket.subject}</h3>
                      <p className="text-sm text-gray-600">Ticket #{ticket.id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        ticket.status === 'open' ? 'destructive' :
                        ticket.status === 'in_progress' ? 'default' : 'secondary'
                      }>
                        {ticket.status}
                      </Badge>
                      <Link to={`/tickets/${ticket.id}`}>
                        <Button variant="outline" size="sm">Ansehen</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4">
              <Link to="/support">
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Neues Ticket erstellen
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Invoices */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Rechnungen
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.invoices.length === 0 ? (
              <p className="text-gray-500">Keine Rechnungen vorhanden</p>
            ) : (
              <div className="space-y-4">
                {data.invoices.map((invoice) => {
                  const statusColors = {
                    draft: "bg-gray-100 text-gray-800",
                    sent: "bg-blue-100 text-blue-800",
                    paid: "bg-green-100 text-green-800",
                    overdue: "bg-red-100 text-red-800",
                    reminder_sent: "bg-yellow-100 text-yellow-800",
                    dunning_sent: "bg-orange-100 text-orange-800",
                    collection_warning: "bg-red-100 text-red-800"
                  };
                  const statusLabels = {
                    draft: "Entwurf",
                    sent: "Gesendet",
                    paid: "Bezahlt",
                    overdue: "Überfällig",
                    reminder_sent: "Erinnerung gesendet",
                    dunning_sent: "Mahnung gesendet",
                    collection_warning: "Inkasso-Warnung"
                  };
                  return (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">Rechnung {invoice.number}</h3>
                        <p className="text-sm text-gray-600">CHF {invoice.total?.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">Fällig: {new Date(invoice.dueDate).toLocaleDateString('de-DE')}</p>
                      </div>
                      <Badge className={statusColors[invoice.status] || "bg-gray-100 text-gray-800"}>
                        {statusLabels[invoice.status] || invoice.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}