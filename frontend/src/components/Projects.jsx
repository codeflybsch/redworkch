import React, { useEffect, useState } from "react";
import api from "../api";
import { useModals } from "../contexts/ModalContext";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const { openQuote } = useModals();

  useEffect(() => {
    api.get("/projects").then((r) => setProjects(r.data)).catch(() => {});
  }, []);

  return (
    <section id="projekte" className="py-24 bg-[#f1f5fb]">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-[34px] md:text-[44px] font-extrabold text-[#0f172a]">
            <span className="section-title-hash">#</span> Was wir gemacht haben ?
          </h2>
          <p className="text-[#E63946] font-bold tracking-wider text-sm mt-2">REFERENZPROJEKTE</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((p) => (
            <div key={p.id} className="group cursor-pointer" onClick={() => p.url && window.open(p.url, "_blank")}>
              <div className="relative overflow-hidden rounded-3xl bg-white shadow-card aspect-[4/5]">
                <img
                  src={p.img}
                  alt={p.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <p className="text-xs uppercase tracking-widest text-[#FFC107] font-bold">{p.category}</p>
                  <h3 className="text-2xl font-bold mt-1">{p.title}</h3>
                  {p.description && (
                    <p className="text-sm text-white/85 mt-2 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {p.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <button onClick={() => openQuote()} className="btn-cta btn-red px-12">
            <span className="text-[15px]">EIGENES PROJEKT STARTEN</span>
          </button>
        </div>
      </div>
    </section>
  );
}
