import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import api from "../api";

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [start, setStart] = useState(0);

  useEffect(() => {
    api.get("/testimonials").then((r) => setTestimonials(r.data)).catch(() => {});
  }, []);

  const visible = 3;
  const items = [];
  if (testimonials.length > 0) {
    for (let i = 0; i < Math.min(visible, testimonials.length); i++) {
      items.push(testimonials[(start + i) % testimonials.length]);
    }
  }

  return (
    <section className="py-24 bg-[#0a0a0a] text-white">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-[34px] md:text-[44px] font-extrabold">
            <span className="section-title-hash">#</span> Was unsere Kunden sagen ?
          </h2>
          <p className="text-[#FFC107] font-bold tracking-wider text-sm mt-2">KUNDENBEWERTUNGEN</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((t) => (
            <div key={t.id} className="bg-white/5 border border-white/10 rounded-2xl p-7 hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between">
                <Quote size={28} className="text-[#FFC107]" />
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating || 5 }).map((_, i) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <Star key={`star-${t.id}-${i}`} size={14} className="text-[#FFC107] fill-[#FFC107]" />
                  ))}
                </div>
              </div>
              <p className="text-white/85 text-[14px] leading-relaxed mt-3">{t.text}</p>
              <div className="mt-5 pt-5 border-t border-white/10">
                <p className="font-bold">{t.name}</p>
                <p className="text-white/60 text-xs">{t.company}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-6 mt-10">
          <button onClick={() => testimonials.length && setStart((s) => (s - 1 + testimonials.length) % testimonials.length)} className="text-[#FFC107] hover:scale-110 transition-transform">
            <ChevronLeft size={32} strokeWidth={2.5} />
          </button>
          <button onClick={() => testimonials.length && setStart((s) => (s + 1) % testimonials.length)} className="text-[#FFC107] hover:scale-110 transition-transform">
            <ChevronRight size={32} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </section>
  );
}
