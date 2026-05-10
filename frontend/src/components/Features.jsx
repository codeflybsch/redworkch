import React, { useEffect, useState } from "react";
import { features } from "../mock";
import api from "../api";
import { Sparkles, Smartphone, FileCode, Zap, Globe, Search } from "lucide-react";

const icons = [Sparkles, Smartphone, FileCode, Zap, Globe, Search];
const bgs = ["#3B82F6", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6", "#06B6D4"];

export default function Features() {
  const [s, setS] = useState({ featuresTitle: "Wie wir es machen ?", featuresSubtitle: "PROJEKTMERKMALE" });

  useEffect(() => {
    api.get("/site-settings").then((r) => setS((prev) => ({ ...prev, ...r.data }))).catch(() => {});
  }, []);

  return (
    <section className="py-24 bg-[#f1f5fb]">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-[34px] md:text-[44px] font-extrabold text-[#0f172a]">
            <span className="section-title-hash">#</span> {s.featuresTitle}
          </h2>
          <p className="text-[#E63946] font-bold tracking-wider text-sm mt-2">{s.featuresSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((f, i) => {
            const Icon = icons[i];
            return (
              <div key={f.title} className="flex gap-5 items-start group">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 shadow-card group-hover:scale-105 transition-transform"
                  style={{ background: bgs[i] }}
                >
                  <Icon size={36} className="text-white" strokeWidth={1.8} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#0f172a]">{f.title}</h3>
                  <p className="text-[14px] text-[#475569] mt-2 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
