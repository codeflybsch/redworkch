import React, { useEffect, useState } from "react";
import { Facebook, Twitter, Instagram, Youtube, Linkedin, Phone, MessageCircle, Mail, MessageSquare, ClipboardCheck, MapPin } from "lucide-react";
import { useModals } from "../contexts/ModalContext";
import { API } from "../api";
import Logo from "./Logo";

const SOCIAL_ICONS = { facebook: Facebook, twitter: Twitter, instagram: Instagram, youtube: Youtube, linkedin: Linkedin };

const FALLBACK = {
  footerAbout: "redwork.ch ist Ihre Schweizer Premium-Agentur für Webdesign, Software-Entwicklung, SEO und digitales Marketing.",
  footerAddress: "Bahnhofstrasse 1, 8001 Zürich, Schweiz",
  footerPhone: "+41 44 000 00 00",
  footerEmail: "info@redwork.ch",
  footerCopyright: "© 2026 redwork.ch – Alle Rechte vorbehalten",
  footerSocial: { facebook: "", twitter: "", instagram: "", youtube: "", linkedin: "" },
  partners: [],
  contactWhatsapp: "",
};

export default function Footer() {
  const { openQuote, openContact } = useModals();
  const [s, setS] = useState(FALLBACK);

  useEffect(() => {
    fetch(`${API}/site-settings`)
      .then((r) => r.json())
      .then((d) => setS({ ...FALLBACK, ...d, footerSocial: { ...FALLBACK.footerSocial, ...(d.footerSocial || {}) } }))
      .catch(() => {});
  }, []);

  const quickLinks = ["Webdesign", "Softwareentwicklung", "SEO", "Online-Shops", "Mobile Apps", "Branding", "Hosting", "Beratung", "Kundenportal"];

  return (
    <footer className="bg-[#0a0a0a] text-white pt-16 sm:pt-20 pb-8">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-6">
        <div className="flex justify-center mb-8 sm:mb-10">
          <Logo size="lg" />
        </div>

        <div className="max-w-3xl mx-auto text-center text-[14px] sm:text-[15px] text-white/80 leading-relaxed">
          <p>{s.footerAbout}</p>
          <p className="mt-4 text-[#FFC107] font-semibold">12 Monate kostenloser Support für alle unsere Kunden inklusive!</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-8 sm:mt-10">
          {(s.partners || []).map((p) => (
            <div key={p} className="text-[9px] sm:text-[10px] tracking-wider font-bold text-white/80 border border-white/15 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded">{p}</div>
          ))}
        </div>

        <div className="mt-10 sm:mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-[13px]">
          {quickLinks.map((link) => (
            <button
              key={link}
              onClick={() => link === "Kundenportal" ? window.location.href = "/login" : openQuote()}
              className="text-left text-white/75 hover:text-[#FFC107] transition-colors flex items-center gap-2"
            >
              <span className="text-[#E63946]">#</span>
              {link}
            </button>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 grid sm:grid-cols-3 gap-4 text-sm">
          {s.footerAddress && (
            <a href={`https://maps.google.com/?q=${encodeURIComponent(s.footerAddress)}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-white/75 hover:text-white">
              <MapPin size={15} className="text-[#E63946] flex-shrink-0" />
              <span className="truncate">{s.footerAddress}</span>
            </a>
          )}
          {s.footerPhone && (
            <a href={`tel:${s.footerPhone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-white/75 hover:text-white">
              <Phone size={15} className="text-[#22C55E] flex-shrink-0" />
              <span>{s.footerPhone}</span>
            </a>
          )}
          {s.footerEmail && (
            <a href={`mailto:${s.footerEmail}`} className="flex items-center gap-2 text-white/75 hover:text-white">
              <Mail size={15} className="text-[#1E88E5] flex-shrink-0" />
              <span>{s.footerEmail}</span>
            </a>
          )}
        </div>

        <div className="mt-10 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex gap-3">
            {Object.entries(s.footerSocial || {}).filter(([, url]) => url).map(([name, url]) => {
              const Icon = SOCIAL_ICONS[name] || Facebook;
              return (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={name}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#1E88E5] flex items-center justify-center transition-colors"
                >
                  <Icon size={16} />
                </a>
              );
            })}
          </div>

          <div className="text-center text-xs text-white/60">
            {s.footerCopyright}
          </div>

          <div className="flex gap-2 sm:gap-3 flex-wrap justify-center">
            {s.footerPhone && <a href={`tel:${s.footerPhone.replace(/\s/g, "")}`} className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#E63946] flex items-center justify-center transition-colors" aria-label="Telefon"><Phone size={16} /></a>}
            {s.contactWhatsapp && <a href={`https://wa.me/${s.contactWhatsapp.replace(/[^\d]/g, "")}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#22C55E] flex items-center justify-center transition-colors" aria-label="WhatsApp"><MessageCircle size={16} /></a>}
            {s.footerEmail && <a href={`mailto:${s.footerEmail}`} className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#1E88E5] flex items-center justify-center transition-colors" aria-label="E-Mail"><Mail size={16} /></a>}
            <button onClick={openContact} className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#E63946] flex items-center justify-center transition-colors" aria-label="Nachricht"><MessageSquare size={16} /></button>
            <button onClick={() => openQuote()} className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#FFC107] hover:text-black flex items-center justify-center transition-colors" aria-label="Angebot"><ClipboardCheck size={16} /></button>
          </div>
        </div>
      </div>
    </footer>
  );
}
