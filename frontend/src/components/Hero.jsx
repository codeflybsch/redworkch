import React, { useEffect, useState, useMemo } from "react";
import { ChevronsDown, ShieldCheck } from "lucide-react";
import { useModals } from "../contexts/ModalContext";
import { API } from "../api";

function MatrixBg() {
  const cols = useMemo(() => {
    const arr = [];
    const chars = "アイウエオカキクケコサシスセソ0123456789ABCDEF";
    for (let i = 0; i < 40; i++) {
      let s = "";
      for (let j = 0; j < 28; j++) s += chars[Math.floor(Math.random() * chars.length)];
      arr.push({
        id: `mc-${i}`,
        text: s,
        left: `${(i / 40) * 100 + Math.random() * 2}%`,
        duration: 8 + Math.random() * 12,
        delay: -Math.random() * 10,
      });
    }
    return arr;
  }, []);

  return (
    <div className="matrix-bg pointer-events-none">
      {cols.map((c) => (
        <div
          key={c.id}
          className="matrix-column"
          style={{
            left: c.left,
            animationDuration: `${c.duration}s`,
            animationDelay: `${c.delay}s`,
          }}
        >
          {c.text}
        </div>
      ))}
    </div>
  );
}

// Renders text with <y>...</y> markers turned into yellow spans (safe, no HTML eval).
function renderRich(text) {
  if (!text) return null;
  const parts = String(text).split(/(<y>.*?<\/y>|<b>.*?<\/b>|\n)/g);
  return parts.map((p, i) => {
    if (p === "\n") return <br key={i} className="hidden md:block" />;
    const y = p.match(/^<y>(.*?)<\/y>$/);
    if (y) return <span key={i} className="text-[#E63946] font-semibold">{y[1]}</span>;
    const b = p.match(/^<b>(.*?)<\/b>$/);
    if (b) return <b key={i}>{b[1]}</b>;
    return <React.Fragment key={i}>{p}</React.Fragment>;
  });
}

const FALLBACK = {
  heroSlides: [{ highlight: "Reise", word: "Webdesign" }],
  heroSubtitle: "",
  heroTagline: "",
  badgeEnabled: true,
  badgeNumber: "12",
  badgeUnit: "MONATE",
  badgeText1: "kostenloser",
  badgeText2: "Support",
  badgeFooter1: "für unsere Kunden",
  badgeFooter2: "inklusive!",
  btnContactSmall: "Fragen Sie uns ?",
  btnContactLarge: "Schreiben Sie uns",
  btnQuoteSmall: "Haben Sie ein Projekt ?",
  btnQuoteLarge: "Angebot einholen",
  partners: [],
  ratingStars: "★★★★★",
  ratingText: "",
};

export default function Hero() {
  const [idx, setIdx] = useState(0);
  const [s, setS] = useState(FALLBACK);
  const { openQuote, openContact } = useModals();

  useEffect(() => {
    fetch(`${API}/site-settings`)
      .then((r) => r.json())
      .then((d) => setS({ ...FALLBACK, ...d }))
      .catch(() => {});
  }, []);

  const slides = s.heroSlides && s.heroSlides.length ? s.heroSlides : FALLBACK.heroSlides;

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % slides.length), 3500);
    return () => clearInterval(id);
  }, [slides.length]);

  const slide = slides[idx % slides.length];

  return (
    <section id="top" className="relative min-h-[75vh] sm:min-h-[80vh] bg-[#020617] overflow-hidden flex items-start sm:items-center justify-center py-16 sm:py-20">
      <MatrixBg />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

      {/* Support Badge */}
      {s.badgeEnabled && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 sm:left-auto sm:top-16 sm:right-4 z-20 pointer-events-none">
          <div className="relative">
            <div className="absolute inset-0 bg-[#E63946] rounded-full blur-2xl opacity-30 animate-pulse" />
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-44 md:h-44 lg:w-52 lg:h-52 rounded-full bg-gradient-to-br from-[#E63946] to-[#a8202e] border-2 border-white/20 flex flex-col items-center justify-center text-center text-white px-2 sm:px-3 md:px-5 shadow-2xl">
              <ShieldCheck size={22} className="text-[#E63946] mb-1" />
              <div className="text-[#E63946] font-extrabold text-[22px] sm:text-[26px] leading-none">{s.badgeNumber}</div>
              <div className="text-[10px] sm:text-[11px] font-bold tracking-wider mt-1">{s.badgeUnit}</div>
              <div className="text-[10px] sm:text-[12px] font-semibold mt-1 leading-tight">
                {s.badgeText1}
                <br />
                <span className="text-[#E63946]">{s.badgeText2}</span>
              </div>
              <div className="text-[9px] sm:text-[10px] mt-1 opacity-80">{s.badgeFooter1}</div>
              <div className="text-[9px] sm:text-[10px] mt-0.5 opacity-80 font-bold">{s.badgeFooter2}</div>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-30 w-full max-w-5xl translate-y-12 px-4 text-center sm:px-6 md:translate-y-14 lg:translate-y-0">
        <div className="flex items-center justify-center">
          <h1 key={idx} className="fade-in text-[30px] sm:text-[42px] md:text-[56px] lg:text-[66px] font-extrabold tracking-tight text-balance leading-[1.05]">
            <span className="text-[#1E88E5]">{slide.highlight}</span>
            <span className="text-white"> {slide.word}</span>
          </h1>
        </div>

        <p className="text-white/85 text-[14px] sm:text-[15px] md:text-[18px] mt-3 sm:mt-4 leading-7 md:leading-8 max-w-3xl mx-auto px-2">
          {renderRich(s.heroSubtitle)}
        </p>
        {s.heroTagline && (
          <p className="text-[#E63946] font-semibold text-[13px] sm:text-[15px] md:text-[18px] mt-2">
            {s.heroTagline}
          </p>
        )}

        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center relative z-30">
          <button onClick={openContact} data-testid="hero-contact-btn" className="btn-cta btn-red w-full sm:w-auto relative z-30">
            <span className="text-[11px] font-normal opacity-90">{s.btnContactSmall}</span>
            <span className="text-[15px] sm:text-[17px]">{s.btnContactLarge}</span>
          </button>
          <button onClick={() => openQuote()} data-testid="hero-quote-btn" className="btn-cta btn-blue w-full sm:w-auto relative z-30">
            <span className="text-[11px] font-normal opacity-90">{s.btnQuoteSmall}</span>
            <span className="text-[15px] sm:text-[17px]">{s.btnQuoteLarge}</span>
          </button>
        </div>
      </div>

      <div
        className="hidden sm:block absolute bottom-16 left-1/2 -translate-x-1/2 z-10 text-white/70 bouncing-arrow cursor-pointer"
        onClick={() => document.getElementById("stats")?.scrollIntoView({ behavior: "smooth" })}
      >
        <ChevronsDown size={36} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-black/90 py-2 sm:py-3 px-3 sm:px-6 z-10">
        <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-4 text-white text-xs">
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            {(s.partners || []).map((p, i) => (
              <span key={i} className="font-bold text-[9px] sm:text-[10px] tracking-wider opacity-80">{p}</span>
            ))}
          </div>
          {s.ratingText && (
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[#4285F4] font-bold">G</span>
              <span className="text-[#E63946]">{s.ratingStars}</span>
              <span className="text-white/90">{renderRich(s.ratingText)}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
