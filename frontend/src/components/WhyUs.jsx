import React, { useEffect, useState } from "react";
import api from "../api";
import { reasons } from "../mock";

export default function WhyUs() {
  const [s, setS] = useState({ whyUsTitle: "Warum redwork.ch ?", whyUsSubtitle: "UNSERE VORTEILE" });

  useEffect(() => {
    api.get("/site-settings").then((r) => setS((prev) => ({ ...prev, ...r.data }))).catch(() => {});
  }, []);

  return (
    <section id="ueber" className="py-24 bg-white">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <h2 className="text-[34px] md:text-[44px] font-extrabold text-[#0f172a]">
            <span className="section-title-hash">#</span> {s.whyUsTitle}
          </h2>
          <p className="text-[#E63946] font-bold tracking-wider text-sm mt-2">{s.whyUsSubtitle}</p>
          <p className="text-[#475569] mt-6 leading-relaxed">
            Seit über 10 Jahren tragen wir als preisgekrönte Webdesign- und Software-Agentur dazu bei, dass Marken
            eine starke Identität in der digitalen Welt aufbauen. redwork.ch schafft mit seinem Expertenteam in den
            Bereichen professionelles Webdesign, SEO, E-Commerce und digitales Marketing einen Mehrwert für
            Unternehmen in der Schweiz und Europa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((r, i) => (
            <div
              key={r.title}
              className="bg-[#f8fafc] rounded-2xl p-7 border border-[#e2e8f0] hover:border-[#1E88E5] hover:shadow-card transition-all duration-300"
            >
              <div className="flex items-baseline gap-3 mb-3">
                <span className="text-[#E63946] font-extrabold text-2xl">
                  {(i + 1).toString().padStart(2, "0")}.
                </span>
                <h3 className="text-[17px] font-bold text-[#0f172a]">{r.title}</h3>
              </div>
              <p className="text-[13.5px] text-[#475569] leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
