import React, { useState } from "react";
import { workSteps } from "../mock";
import { ChevronLeft, ChevronRight, Presentation, Palette, Code2, Rocket, ShieldCheck, Globe } from "lucide-react";

const iconMap = {
  presentation: Presentation,
  palette: Palette,
  code: Code2,
  rocket: Rocket,
  "shield-check": ShieldCheck,
  globe: Globe,
};

const gradientMap = {
  "#2196F3": "gradient-circle-blue",
  "#FF6B35": "gradient-circle-orange",
  "#22C55E": "gradient-circle-green",
  "#EF4444": "gradient-circle-red",
  "#A855F7": "gradient-circle-purple",
  "#06B6D4": "gradient-circle-cyan",
};

export default function HowWeWork() {
  const [start, setStart] = useState(0);
  const visible = 4;
  const items = [];
  for (let i = 0; i < visible; i++) {
    items.push(workSteps[(start + i) % workSteps.length]);
  }

  const next = () => setStart((s) => (s + 1) % workSteps.length);
  const prev = () => setStart((s) => (s - 1 + workSteps.length) % workSteps.length);

  return (
    <section className="py-24 bg-[#f1f5fb]">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-[34px] md:text-[44px] font-extrabold text-[#0f172a]">
            <span className="section-title-hash">#</span> Wie wir arbeiten ?
          </h2>
          <p className="text-[#E63946] font-bold tracking-wider text-sm mt-2">PRODUKTIONSPHASE</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {items.map((step, i) => {
            const Icon = iconMap[step.icon] || Code2;
            return (
              <div key={`${step.title}-${i}`} className="text-center relative px-2">
                <div className="relative inline-block">
                  <div className={`w-32 h-32 rounded-full ${gradientMap[step.color]} mx-auto flex items-center justify-center shadow-card hover:scale-105 transition-transform duration-300`}>
                    <Icon size={50} className="text-white" strokeWidth={1.6} />
                  </div>
                  {i < items.length - 1 && (
                    <div className="hidden lg:block dotted-arrow absolute top-1/2 -right-12 w-12 h-2.5 -translate-y-1/2" />
                  )}
                </div>
                <h3 className="mt-6 text-xl font-bold text-[#0f172a]">{step.title}</h3>
                <p className="mt-3 text-[14px] text-[#475569] leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center gap-6 mt-10">
          <button onClick={prev} className="text-[#22C55E] hover:scale-110 transition-transform" aria-label="vorherig">
            <ChevronLeft size={32} strokeWidth={2.5} />
          </button>
          <button onClick={next} className="text-[#22C55E] hover:scale-110 transition-transform" aria-label="nächste">
            <ChevronRight size={32} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </section>
  );
}
