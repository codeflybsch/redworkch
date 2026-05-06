import React, { useEffect, useState } from "react";
import { ExternalLink, ArrowRight } from "lucide-react";
import api from "../api";
import { useModals } from "../contexts/ModalContext";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const { openQuote } = useModals();

  useEffect(() => {
    api.get("/projects").then((r) => setProjects(r.data)).catch(() => {});
  }, []);

  return (
    <section id="projekte" className="scroll-mt-24 py-16 sm:py-24 bg-[#f1f5fb]">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-6">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-[28px] sm:text-[34px] md:text-[44px] font-extrabold text-[#0f172a]">
            <span className="section-title-hash">#</span> Was wir gemacht haben?
          </h2>
          <p className="text-[#E63946] font-bold tracking-wider text-xs sm:text-sm mt-2">REFERENZPROJEKTE</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
          {projects.map((p) => {
            const Tag = p.url ? "a" : "div";
            const tagProps = p.url ? { href: p.url, target: "_blank", rel: "noreferrer" } : {};
            return (
              <Tag
                key={p.id}
                {...tagProps}
                data-testid={`project-${p.id}`}
                className="group block bg-white rounded-2xl sm:rounded-3xl shadow-card overflow-hidden cursor-pointer hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="relative aspect-[4/3] sm:aspect-[4/5] overflow-hidden">
                  <img
                    src={p.img}
                    alt={p.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Soft gradient at bottom for image-only mobile look */}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent pointer-events-none sm:hidden" />
                  <p className="sm:hidden absolute left-4 bottom-4 text-[10px] uppercase tracking-widest text-[#FFC107] font-bold">{p.category}</p>
                  {p.url && (
                    <span className="absolute top-3 right-3 inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/95 text-[#0f172a] shadow-md opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition">
                      <ExternalLink size={16} />
                    </span>
                  )}
                </div>
                {/* Always-visible text block (no hover required) */}
                <div className="p-4 sm:p-5">
                  <p className="hidden sm:block text-[10px] uppercase tracking-widest text-[#E63946] font-bold">{p.category}</p>
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#0f172a] mt-1 leading-snug">{p.title}</h3>
                  {p.description && (
                    <p className="text-sm text-[#475569] mt-2 leading-relaxed">
                      {p.description}
                    </p>
                  )}
                  <span className="inline-flex items-center gap-1 text-[#E63946] font-bold text-sm mt-3 group-hover:gap-2 transition-all">
                    {p.url ? "Projekt ansehen" : "Mehr erfahren"} <ArrowRight size={14} />
                  </span>
                </div>
              </Tag>
            );
          })}
        </div>

        {projects.length === 0 && (
          <div className="text-center text-[#64748b] py-12">Bald verfügbar.</div>
        )}

        <div className="flex justify-center mt-10 sm:mt-12">
          <button onClick={() => openQuote()} data-testid="projects-cta" className="btn-cta btn-red px-8 sm:px-12">
            <span className="text-[14px] sm:text-[15px]">EIGENES PROJEKT STARTEN</span>
          </button>
        </div>
      </div>
    </section>
  );
}
