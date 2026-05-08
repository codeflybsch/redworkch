import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { MessageSquare, Plus, Send } from "lucide-react";

export default function Support() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: "",
    category: "",
    priority: "medium",
    message: ""
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await api.get("/tickets");
      setTickets(res.data);
    } catch (err) {
      console.error("Tickets error:", err);
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async (e) => {
    e.preventDefault();
    try {
      await api.post("/tickets", newTicket);
      setNewTicket({ subject: "", category: "", priority: "medium", message: "" });
      setShowNewTicket(false);
      fetchTickets();
      alert("Ticket erfolgreich erstellt!");
    } catch (err) {
      alert("Fehler beim Erstellen des Tickets: " + err.response?.data?.detail);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Laden...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Support-Tickets</h1>
          <Button onClick={() => setShowNewTicket(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Neues Ticket
          </Button>
        </div>

        {showNewTicket && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Neues Support-Ticket erstellen</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={createTicket} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Betreff</label>
                    <Input
                      value={newTicket.subject}
                      onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                      required
                      placeholder="Kurze Beschreibung Ihres Problems"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Kategorie</label>
                    <Select value={newTicket.category} onValueChange={(value) => setNewTicket({...newTicket, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Kategorie auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technisches Problem</SelectItem>
                        <SelectItem value="billing">Abrechnung</SelectItem>
                        <SelectItem value="account">Konto</SelectItem>
                        <SelectItem value="domain">Domain</SelectItem>
                        <SelectItem value="other">Sonstiges</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Priorität</label>
                  <Select value={newTicket.priority} onValueChange={(value) => setNewTicket({...newTicket, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Niedrig</SelectItem>
                      <SelectItem value="medium">Normal</SelectItem>
                      <SelectItem value="high">Hoch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nachricht</label>
                  <Textarea
                    value={newTicket.message}
                    onChange={(e) => setNewTicket({...newTicket, message: e.target.value})}
                    required
                    rows={5}
                    placeholder="Beschreiben Sie Ihr Problem detailliert..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">
                    <Send className="h-4 w-4 mr-2" />
                    Ticket erstellen
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowNewTicket(false)}>
                    Abbrechen
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {tickets.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Tickets gefunden</h3>
                <p className="text-gray-600">Sie haben noch keine Support-Tickets erstellt.</p>
              </CardContent>
            </Card>
          ) : (
            tickets.map((ticket) => (
              <Card key={ticket.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{ticket.subject}</h3>
                      <p className="text-sm text-gray-600 mt-1">Ticket #{ticket.id} • {ticket.category}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Erstellt am {new Date(ticket.createdAt).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={
                        ticket.status === 'open' ? 'destructive' :
                        ticket.status === 'in_progress' ? 'default' :
                        ticket.status === 'answered' ? 'secondary' : 'outline'
                      }>
                        {ticket.status === 'open' ? 'Offen' :
                         ticket.status === 'in_progress' ? 'In Bearbeitung' :
                         ticket.status === 'answered' ? 'Beantwortet' : 'Geschlossen'}
                      </Badge>
                      <Badge variant={
                        ticket.priority === 'high' ? 'destructive' :
                        ticket.priority === 'medium' ? 'default' : 'secondary'
                      }>
                        {ticket.priority === 'high' ? 'Hoch' :
                         ticket.priority === 'medium' ? 'Normal' : 'Niedrig'}
                      </Badge>
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/tickets/${ticket.id}`}>Ansehen</a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}