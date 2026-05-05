import React, { useState } from "react";
import { Play, X } from "lucide-react";
import { useModals } from "../contexts/ModalContext";

export default function PromoVideo() {
  const [open, setOpen] = useState(false);
  const { openQuote } = useModals();

  return (
    <>
      <section className="py-24 bg-[#f1f5fb]">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="flex justify-center">
            <button
              onClick={() => setOpen(true)}
              className="relative w-full max-w-[440px] aspect-video bg-gradient-to-br from-[#1E88E5] to-[#0d47a1] rounded-3xl flex items-center justify-center shadow-card group overflow-hidden"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent)]" />
              <span className="relative w-24 h-24 bg-[#E63946] rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                <Play size={36} className="text-white ml-1" fill="currentColor" />
              </span>
            </button>
          </div>
          <div>
            <p className="text-[#E63946] font-bold tracking-wider text-sm">UNTERNEHMENSVORSTELLUNG</p>
            <h2 className="text-[28px] md:text-[36px] font-extrabold text-[#0f172a] mt-3 leading-tight">
              Unser Vorstellungsfilm
            </h2>
            <p className="text-[#475569] mt-5 leading-relaxed">
              Mit unserem sorgfältig gestalteten Vorstellungsfilm geben wir Ihnen einen ersten Einblick in unser
              Unternehmen. <strong>Wir kennen alle Anforderungen</strong> der Web-Welt und freuen uns, Sie in jedem
              Bereich zu unterstützen.
            </p>
            <p className="text-[#475569] mt-3 leading-relaxed">
              <strong>redwork.ch</strong> verbindet Wissen und Erfahrung mit Vertrauen und einem Lächeln und bietet
              Ihnen alle Unterstützung, um Ihre Traumprojekte zu verwirklichen.
            </p>
            <button
              onClick={() => openQuote()}
              className="mt-6 inline-flex items-center gap-2 bg-[#E63946] hover:bg-[#d22c39] text-white px-6 py-3 rounded-full font-bold transition"
            >
              Jetzt Projekt starten
            </button>
          </div>
        </div>
      </section>

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/85 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <button
            onClick={() => setOpen(false)}
            className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
          >
            <X size={22} />
          </button>
          <div className="w-full max-w-4xl aspect-video" onClick={(e) => e.stopPropagation()}>
            <iframe
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
              title="redwork.ch Vorstellungsfilm"
              className="w-full h-full rounded-2xl"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  );
}
