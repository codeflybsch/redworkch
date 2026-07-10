import React, { useEffect, useState } from "react";
import api from "../../api";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Eye, Loader2, MessageSquare, Send, X } from "lucide-react";

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    const handleRealtime = (event) => {
      const payload = event.detail || {};
      const ticket = payload.ticket || {};
      if (payload.type === "ticket_created" || payload.type === "ticket_replied" || payload.type === "ticket_updated") {
        fetchTickets();
        if (selected?.id && String(selected.id) === String(ticket.id)) {
          openTicket(ticket.id);
        }
      }
    };

    window.addEventListener("support-realtime", handleRealtime);
    return () => window.removeEventListener("support-realtime", handleRealtime);
  }, [selected?.id]);

  const fetchTickets = async () => {
    try {
      const res = await api.get("/admin/tickets");
      setTickets(res.data);
    } catch (err) {
      console.error("Tickets error:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId, status) => {
    try {
      await api.patch(`/admin/tickets/${ticketId}`, { status });
      fetchTickets();
    } catch (err) {
      alert("Fehler beim Aktualisieren: " + err.response?.data?.detail);
    }
  };

  const openTicket = async (ticketId) => {
    setDetailLoading(true);
    try {
      const response = await api.get(`/admin/tickets/${ticketId}`);
      setSelected(response.data);
    } catch (err) {
      alert("Ticket konnte nicht geladen werden: " + (err.response?.data?.detail || err.message));
    } finally { setDetailLoading(false); }
  };

  const sendReply = async (event) => {
    event.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    try {
      await api.post(`/admin/tickets/${selected.id}/replies`, { message: reply.trim() });
      setReply("");
      await openTicket(selected.id);
      await fetchTickets();
    } catch (err) {
      alert("Antwort konnte nicht gesendet werden: " + (err.response?.data?.detail || err.message));
    } finally { setSending(false); }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Laden...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Support-Tickets</h1>
          <p className="text-muted-foreground">Verwalten Sie Kunden-Support-Tickets</p>
        </div>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {tickets.length} Tickets
        </Badge>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket #</TableHead>
                <TableHead>Kunde</TableHead>
                <TableHead>Betreff</TableHead>
                <TableHead>Kategorie</TableHead>
                <TableHead>Priorität</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Letzte Aktivität</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">#{ticket.id}</TableCell>
                  <TableCell>{ticket.userName}</TableCell>
                  <TableCell className="max-w-xs truncate">{ticket.subject}</TableCell>
                  <TableCell>{ticket.category}</TableCell>
                  <TableCell>
                    <Badge variant={
                      ticket.priority === 'high' ? 'destructive' :
                      ticket.priority === 'medium' ? 'default' : 'secondary'
                    }>
                      {ticket.priority === 'high' ? 'Hoch' :
                       ticket.priority === 'medium' ? 'Normal' : 'Niedrig'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={ticket.status}
                      onValueChange={(value) => updateTicketStatus(ticket.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Offen</SelectItem>
                        <SelectItem value="in_progress">In Bearbeitung</SelectItem>
                        <SelectItem value="answered">Beantwortet</SelectItem>
                        <SelectItem value="closed">Geschlossen</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {new Date(ticket.updatedAt).toLocaleDateString('de-DE')}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => openTicket(ticket.id)} disabled={detailLoading}>
                      <Eye size={15} className="mr-1" /> Ansehen
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selected && <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => setSelected(null)}>
        <div className="flex max-h-[100dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-3xl" onClick={(event) => event.stopPropagation()}>
          <div className="flex items-start justify-between bg-slate-950 p-5 text-white sm:p-6">
            <div><p className="text-xs font-bold uppercase tracking-widest text-blue-300">Support-Ticket #{selected.id.slice(0, 8)}</p><h2 className="mt-1 text-xl font-black sm:text-2xl">{selected.subject}</h2><p className="mt-1 text-sm text-slate-400">{selected.userName} · {selected.category}</p></div>
            <button onClick={() => setSelected(null)} className="rounded-full bg-white/10 p-2 hover:bg-white/20"><X size={18} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Kundenanfrage</p><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-800">{selected.message}</p></div>
            <div className="mt-6 space-y-3">
              {(selected.replies || []).length === 0 ? <div className="py-8 text-center text-sm text-slate-500"><MessageSquare className="mx-auto mb-2" />Noch keine Antworten</div> : selected.replies.map((item) => <div key={item.id} className={`flex ${item.userId ? "justify-start" : "justify-end"}`}><div className={`max-w-[85%] rounded-2xl px-4 py-3 ${item.userId ? "bg-slate-100 text-slate-800" : "bg-blue-600 text-white"}`}><p className="mb-1 text-[10px] font-bold uppercase opacity-60">{item.userName}</p><p className="whitespace-pre-wrap text-sm leading-6">{item.message}</p><p className="mt-1 text-[10px] opacity-50">{new Date(item.createdAt).toLocaleString("de-DE")}</p></div></div>)}
            </div>
          </div>
          <form onSubmit={sendReply} className="border-t border-slate-200 bg-white p-4 sm:p-5"><textarea value={reply} onChange={(event) => setReply(event.target.value)} rows={3} required placeholder="Antwort an den Kunden schreiben..." className="w-full resize-none rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500" /><div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-slate-500">Der Kunde erhält zusätzlich eine E-Mail-Benachrichtigung.</p><button disabled={sending || !reply.trim()} className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50">{sending ? <Loader2 className="animate-spin" size={17} /> : <Send size={17} />} Antwort senden</button></div></form>
        </div>
      </div>}
    </div>
  );
}
