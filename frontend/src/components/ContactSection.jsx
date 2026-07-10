import React, { useEffect, useState } from "react";
import { Phone, Mail, MapPin, MessageCircle, Send, ArrowRight } from "lucide-react";
import { useModals } from "../contexts/ModalContext";
import { API } from "../api";

const FALLBACK = {
  contactTitle: "Kontakt",
  contactSubtitle: "Lassen Sie uns sprechen",
  contactIntro: "Wählen Sie den Kanal, der für Ihr Anliegen am besten passt. Wir reagieren zügig und persönlich, in der Regel innerhalb eines Werktags.",
  contactPhone: "+41 44 000 00 00",
  contactPhoneHours: "Mo–Fr 8–18 Uhr",
  contactEmail: "info@redwork.ch",
  contactEmailNote: "Antwort innert 24 h",
  contactWhatsapp: "+41 79 000 00 00",
  contactAddress: "Bahnhofstrasse 1, 8001 Zürich",
  contactMapUrl: "https://www.openstreetmap.org/export/embed.html?bbox=8.5392%2C47.3705%2C8.5444%2C47.3735&layer=mapnik",
};

export default function ContactSection() {
  const { openContact, openQuote } = useModals();
  const [s, setS] = useState(FALLBACK);

  useEffect(() => {
    fetch(`${API}/site-settings`).then((r) => r.json()).then((d) => setS({ ...FALLBACK, ...d })).catch(() => {});
  }, []);

  return (
    <section id="kontakt" className="py-20 md:py-28 bg-[#0a0a0a] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(230,57,70,0.18),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(30,136,229,0.15),transparent_50%)] pointer-events-none" />
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 relative">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <p className="text-[#E63946] font-bold tracking-[0.25em] text-xs">{s.contactSubtitle?.toUpperCase()}</p>
          <h2 className="text-[32px] md:text-[48px] font-extrabold mt-2">{s.contactTitle}</h2>
          <p className="text-white/70 mt-4 text-[15px] leading-relaxed">{s.contactIntro}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 lg:gap-8">
          <div className="space-y-4">
            <ContactCard
              Icon={Mail}
              color="#E63946"
              label="E-Mail"
              value={s.contactEmail}
              href={`mailto:${s.contactEmail}`}
              note={s.contactEmailNote}
              dataTestid="contact-email-card"
            />
            <ContactCard
              Icon={Phone}
              color="#22C55E"
              label="Telefon"
              value={s.contactPhone}
              href={`tel:${s.contactPhone.replace(/\s/g, "")}`}
              note={s.contactPhoneHours}
              dataTestid="contact-phone-card"
            />
            <ContactCard
              Icon={MessageCircle}
              color="#25D366"
              label="WhatsApp"
              value={s.contactWhatsapp}
              href={`https://wa.me/${s.contactWhatsapp.replace(/[^\d]/g, "")}`}
              note="Direkter Kontakt während der Geschäftszeiten"
              dataTestid="contact-whatsapp-card"
            />
            <ContactCard
              Icon={MapPin}
              color="#1E88E5"
              label="Adresse"
              value={s.contactAddress}
              href={`https://maps.google.com/?q=${encodeURIComponent(s.contactAddress)}`}
              note="Termin nach Vereinbarung"
              dataTestid="contact-address-card"
            />

            <div className="grid grid-cols-1 gap-3 pt-4 min-[400px]:grid-cols-2">
              <button onClick={openContact} data-testid="cta-contact" className="px-5 py-3.5 rounded-full bg-[#E63946] hover:bg-[#d22c39] font-bold text-sm flex items-center justify-center gap-2 transition">
                <Send size={15} /> Nachricht senden
              </button>
              <button onClick={() => openQuote()} data-testid="cta-quote" className="px-5 py-3.5 rounded-full bg-white text-[#0a0a0a] hover:bg-[#E63946] hover:text-white font-bold text-sm flex items-center justify-center gap-2 transition">
                Angebot einholen <ArrowRight size={15} />
              </button>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-white/10 min-h-[420px] bg-white/5 relative">
            <iframe
              title="Standort"
              src={s.contactMapUrl}
              className="absolute inset-0 w-full h-full block border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactCard({ Icon, color, label, value, href, note, dataTestid }) {
  return (
    <a
      href={href}
      data-testid={dataTestid}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
      className="flex items-center gap-4 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5 transition group"
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110" style={{ background: `${color}25`, color }}>
        <Icon size={22} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold">{label}</p>
        <p className="font-bold text-white truncate text-[16px]">{value}</p>
        {note && <p className="text-xs text-white/55 mt-0.5">{note}</p>}
      </div>
      <ArrowRight size={16} className="text-white/40 group-hover:text-white group-hover:translate-x-1 transition" />
    </a>
  );
}
