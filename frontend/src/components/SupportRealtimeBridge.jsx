import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/use-toast";
import { API } from "../api";

function playPing() {
  if (typeof window === "undefined") return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  try {
    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    gainNode.gain.value = 0.0001;

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.22, audioContext.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.28);
    oscillator.stop(audioContext.currentTime + 0.32);

    window.setTimeout(() => {
      audioContext.close().catch(() => {});
    }, 500);
  } catch {
    // Ignore sound failures on browsers that block autoplay.
  }
}

function buildWsUrl() {
  const backend = API.replace(/\/api$/, "");
  return backend.startsWith("https://")
    ? backend.replace("https://", "wss://")
    : backend.replace("http://", "ws://");
}

export default function SupportRealtimeBridge() {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user || typeof window === "undefined") return undefined;

    let socket;
    let reconnectTimer = null;
    let closed = false;

    const connect = () => {
      socket = new WebSocket(`${buildWsUrl()}/ws/notifications`);

      socket.onmessage = (event) => {
        let payload;
        try {
          payload = JSON.parse(event.data);
        } catch {
          payload = { type: "message", message: event.data };
        }

        window.dispatchEvent(new CustomEvent("support-realtime", { detail: payload }));

        const ticket = payload.ticket || {};
        const isAdmin = user.role === "admin";
        const isCustomer = user.role === "customer";
        const isOwnTicket = isCustomer && ticket.userId && String(ticket.userId) === String(user.id);

        if (isAdmin && payload.type === "ticket_created") {
          playPing();
          toast({
            title: "Neues Support-Ticket",
            description: payload.message || ticket.subject || "Eine neue Anfrage ist eingegangen.",
          });
          return;
        }

        if ((isAdmin || isOwnTicket) && ["ticket_replied", "ticket_updated"].includes(payload.type)) {
          toast({
            title: isAdmin ? "Ticket aktualisiert" : "Support-Antwort",
            description: payload.message || ticket.subject || "Das Ticket wurde aktualisiert.",
          });
        }
      };

      socket.onclose = () => {
        if (closed) return;
        reconnectTimer = window.setTimeout(connect, 4000);
      };

      socket.onerror = () => {
        try {
          socket.close();
        } catch {
          // ignore
        }
      };
    };

    connect();

    return () => {
      closed = true;
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      try {
        socket?.close();
      } catch {
        // ignore
      }
    };
  }, [toast, user]);

  return null;
}
