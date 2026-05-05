import React from "react";
import {
  Facebook, Twitter, Instagram, Youtube, Linkedin,
  Phone, MessageCircle, Mail, MessageSquare, ClipboardCheck,
} from "lucide-react";
import { footerLinks } from "../mock";
import { useModals } from "../contexts/ModalContext";
import Logo from "./Logo";

export default function Footer() {
  const { openQuote, openContact } = useModals();

  return (
    <footer id="kontakt" className="bg-[#0a0a0a] text-white pt-20 pb-8">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex justify-center mb-10">
          <Logo size="lg" />
        </div>

        <div className="max-w-4xl mx-auto text-center text-[14px] text-white/75 leading-relaxed relative">
          <span className="absolute -left-4 top-0 text-5xl text-white/20 font-serif">“</span>
          <span className="absolute -right-4 bottom-0 text-5xl text-white/20 font-serif">”</span>
          <p>
            Mit der <strong>preisgekrönten</strong> Webdesign- und Software-Agentur entdecken Sie
            <strong> Weltklasse-Standards</strong> auf Ihrer Website. Wir sind anders, seien Sie auch anders.
          </p>
          <p className="mt-4">
            Als <strong>redwork.ch</strong> entwickeln wir Ihnen passende Lösungen je nach Budget, analysieren Ihre
            Bedürfnisse beim Webdesign und der Web-Software präzise und führen Ihre Erwartungen zur Umsetzung.
          </p>
          <p className="mt-4">
            Mit der richtigen Strategie, professioneller Geschäftsplanung, makellosem Design und höchster Qualität
            haben wir uns über 10 Jahre lang am Markt unverzichtbar gemacht: Web-Software, Webdesign, Grafikdesign,
            Programmierung, 3D-Design, Animation, Hosting & Domain, Social-Media-Management, Digital-Marketing, SEO
            und mehr.
          </p>
          <p className="mt-4 text-[#FFC107] font-semibold">
            12 Monate kostenloser Support für alle unsere Kunden inklusive!
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mt-10">
          {["Google Partner", "Bing Ads", "Yandex Partner", "Microsoft Gold Partner", "Adobe Solution Partner"].map(
            (p) => (
              <div
                key={p}
                className="text-[10px] tracking-wider font-bold text-white/80 border border-white/15 px-3 py-2 rounded"
              >
                {p}
              </div>
            )
          )}
        </div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-[13px]">
          {footerLinks.map((link) => (
            <button
              key={link}
              onClick={() => openQuote()}
              className="text-left text-white/75 hover:text-[#FFC107] transition-colors flex items-center gap-2"
            >
              <span className="text-[#E63946]">#</span>
              {link}
            </button>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex gap-3">
            {[
              { Icon: Facebook, name: "facebook" },
              { Icon: Twitter, name: "twitter" },
              { Icon: Instagram, name: "instagram" },
              { Icon: Youtube, name: "youtube" },
              { Icon: Linkedin, name: "linkedin" },
            ].map(({ Icon, name }) => (
              <a
                key={name}
                href="#"
                aria-label={name}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#1E88E5] flex items-center justify-center transition-colors"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>

          <div className="text-center text-xs text-white/60">
            Copyright © 2026 <span className="text-white font-bold">redwork.ch</span>
            <br />
            Alle Rechte vorbehalten. AGB • Datenschutz
          </div>

          <div className="flex gap-3">
            <button onClick={openContact} className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#E63946] flex items-center justify-center transition-colors" aria-label="Telefon"><Phone size={16} /></button>
            <a href="https://wa.me/41000000000" className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#22C55E] flex items-center justify-center transition-colors" aria-label="WhatsApp"><MessageCircle size={16} /></a>
            <button onClick={openContact} className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#E63946] flex items-center justify-center transition-colors" aria-label="E-Mail"><Mail size={16} /></button>
            <button onClick={openContact} className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#E63946] flex items-center justify-center transition-colors" aria-label="Nachricht"><MessageSquare size={16} /></button>
            <button onClick={() => openQuote()} className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#FFC107] hover:text-black flex items-center justify-center transition-colors" aria-label="Angebot"><ClipboardCheck size={16} /></button>
          </div>
        </div>
      </div>
    </footer>
  );
}
