import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import { Send, ArrowLeft } from "lucide-react";

export default function TicketDetail() {
  const { ticketId } = useParams();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  const fetchTicket = async () => {
    try {
      const res = await api.get(`/tickets/${ticketId}`);
      setTicket(res.data);
    } catch (err) {
      console.error("Ticket detail error:", err);
    } finally {
      setLoading(false);
    }
  };

  const sendReply = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/tickets/${ticketId}/replies`, { message: reply });
      setReply("");
      fetchTicket();
    } catch (err) {
      alert("Fehler beim Senden der Antwort: " + err.response?.data?.detail);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Laden...</div>;
  }

  if (!ticket) {
    return <div className="min-h-screen flex items-center justify-center">Ticket nicht gefunden</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{ticket.subject}</CardTitle>
              <div className="flex gap-2">
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
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Ticket #{ticket.id} • {ticket.category} • 
              Erstellt am {new Date(ticket.createdAt).toLocaleDateString('de-DE')}
            </div>
          </CardHeader>
        </Card>

        <div className="space-y-4 mb-6">
          {/* Original message */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">{user.firstName} {user.lastName}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(ticket.createdAt).toLocaleString('de-DE')}
                    </span>
                  </div>
                  <div className="text-gray-700 whitespace-pre-wrap">{ticket.message}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Replies */}
          {ticket.replies && ticket.replies.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                    r.userId ? 'bg-blue-500' : 'bg-green-500'
                  }`}>
                    {r.userName ? r.userName[0] : 'A'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">
                        {r.userName || 'Administrator'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(r.createdAt).toLocaleString('de-DE')}
                      </span>
                    </div>
                    <div className="text-gray-700 whitespace-pre-wrap">{r.message}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {ticket.status !== 'closed' && (
          <Card>
            <CardHeader>
              <CardTitle>Antwort hinzufügen</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={sendReply}>
                <Textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Ihre Antwort..."
                  rows={4}
                  required
                  className="mb-4"
                />
                <Button type="submit">
                  <Send className="h-4 w-4 mr-2" />
                  Antwort senden
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}