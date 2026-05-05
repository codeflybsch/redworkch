import React, { useEffect, useState } from "react";
import { API } from "../api";

const FALLBACK_STATS = [
  { number: "61.300.000", suffix: "+", label: "Geschriebene Codezeilen" },
  { number: "415.000", suffix: "+", label: "Einzigartige Webseiten" },
  { number: "860", suffix: "+", label: "Abgeschlossene Projekte" },
  { number: "2.100", suffix: "+", label: "Zufriedene Kunden" },
];

export default function StatsBar() {
  const [stats, setStats] = useState(FALLBACK_STATS);

  useEffect(() => {
    fetch(`${API}/site-settings`)
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.stats) && d.stats.length) setStats(d.stats);
      })
      .catch(() => {});
  }, []);

  return (
    <section id="stats" className="bg-stats py-10">
      <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={`${s.label}-${i}`} className="text-center">
            <div className="text-[#FFC107] text-[34px] md:text-[44px] font-extrabold leading-none">
              {s.number}<span className="text-[#FFC107]">{s.suffix}</span>
            </div>
            <div className="text-white/95 mt-2 text-[14px] md:text-[15px] font-medium">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
