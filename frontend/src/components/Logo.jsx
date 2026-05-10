import React from "react";

export default function Logo({ size = "md", inverted = false }) {
  const sizes = {
    sm: { text: "text-[15px]", brk: "text-[10px]" },
    md: { text: "text-[20px]", brk: "text-[11px]" },
    lg: { text: "text-[28px]", brk: "text-[13px]" },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className="inline-flex items-center gap-1 leading-none select-none">
      <span className={`font-extrabold ${s.text} ${inverted ? "text-[#0f172a]" : "text-white"}`}>
        red
      </span>
      <span className={`font-extrabold ${s.text} text-[#E63946]`}>work</span>
      <span className={`${s.brk} font-bold ${inverted ? "text-[#475569]" : "text-white/70"} ml-0.5`}>
        .ch
      </span>
      <span className="ml-1 inline-flex items-center">
        <span className="text-[#1E88E5] font-bold" style={{ fontSize: "1.2em" }}>&lt;</span>
        <span className="text-[#E63946] font-bold" style={{ fontSize: "1.2em" }}>/</span>
        <span className="text-[#1E88E5] font-bold" style={{ fontSize: "1.2em" }}>&gt;</span>
      </span>
    </div>
  );
}
