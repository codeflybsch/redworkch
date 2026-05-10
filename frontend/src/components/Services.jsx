import React, { useEffect, useState } from "react";
import api from "../api";
import {
  Smartphone, Code, Search, Megaphone, Award, MessageSquare,
  Camera, Bookmark, Lightbulb, Globe, Star, Briefcase,
} from "lucide-react";
import { useModals } from "../contexts/ModalContext";

const iconMap = { Smartphone, Code, Search, Megaphone, Award, MessageSquare };

export default function Services() {
  const [services, setServices] = useState([]);
  const [s, setS] = useState({ servicesTitle: "Was wir tun ?", servicesSubtitle: "DIENSTLEISTUNGEN" });
  const { openQuote } = useModals();

  useEffect(() => {
    api.get("/services").then((r) => setServices(r.data)).catch(() => {});
    api.get("/site-settings").then((r) => setS((prev) => ({ ...prev, ...r.data }))).catch(() => {});
  }, []);

  const left = services.filter((s) => s.side === "left");
  const right = services.filter((s) => s.side === "right");

  const gridIcons = [Camera, Smartphone, Code, Search, Bookmark, Lightbulb, Globe, Star, Award, Megaphone, MessageSquare, Briefcase];
  const gridColors = ["#3B82F6", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#F97316", "#84CC16", "#6366F1", "#14B8A6", "#A855F7"];

  const renderItem = (s, side) => {
    const Icon = iconMap[s.icon] || Smartphone;
    return (
      <button
        key={s.id}
        onClick={() => openQuote()}
        className={`flex gap-4 items-start group w-full ${side === "left" ? "justify-end text-right flex-row-reverse" : "justify-start text-left"}`}
      >
        <div className="w-14 h-14 rounded-full bg-white shadow-card flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
          <Icon size={26} className={side === "left" ? "text-[#1E88E5]" : "text-[#E63946]"} />
        </div>
        <div className={side === "left" ? "text-right" : "text-left"}>
          <h3 className="text-xl md:text-2xl font-bold text-[#0f172a] group-hover:text-[#E63946] transition-colors">{s.title}</h3>
          <p className="text-[14px] text-[#475569] mt-2 leading-relaxed">{s.desc}</p>
        </div>
      </button>
    );
  };

  return (
    <section id="leistungen" className="py-24 bg-[#f1f5fb] relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-[34px] md:text-[44px] font-extrabold text-[#0f172a]">
            <span className="section-title-hash">#</span> {s.servicesTitle}
          </h2>
          <p className="text-[#E63946] font-bold tracking-wider text-sm mt-2">{s.servicesSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="space-y-12">{left.map((s) => renderItem(s, "left"))}</div>

          <div className="flex justify-center order-first lg:order-none">
            <div className="relative w-[280px] h-[560px] bg-[#0f172a] rounded-[44px] p-4 shadow-2xl border-[6px] border-[#0f172a]">
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-10" />
              <div className="w-full h-full bg-white rounded-[28px] overflow-hidden grid grid-cols-3 gap-2 p-3 content-center">
                {gridIcons.map((Icon, i) => (
                  <div
                    key={`grid-${Icon.displayName || Icon.name || i}-${i}`}
                    className="aspect-square rounded-xl flex items-center justify-center hover:scale-110 transition-transform duration-200"
                    style={{ background: gridColors[i] }}
                  >
                    <Icon size={22} className="text-white" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-12">{right.map((s) => renderItem(s, "right"))}</div>
        </div>
      </div>
    </section>
  );
}
