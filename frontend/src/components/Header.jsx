import React, { useState } from "react";
import { Menu, X, ChevronDown, Heart, ClipboardCheck } from "lucide-react";
import { navItems } from "../mock";
import { useModals } from "../contexts/ModalContext";
import Logo from "./Logo";

export default function Header({ scrolled }) {
  const [open, setOpen] = useState(false);
  const { openQuote } = useModals();

  const handleNav = (e, href) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const id = href.slice(1);
      if (id === "top") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const el = document.getElementById(id);
        if (el) {
          const headerHeight = document.querySelector("header")?.offsetHeight || 0;
          const top = el.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
          window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
        }
      }
      setOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-black/85 backdrop-blur-md shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between py-4">
        <a href="#top" onClick={(e) => handleNav(e, "#top")}>
          <Logo size="md" />
        </a>

        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => handleNav(e, item.href)}
              className="text-white text-[15px] hover:text-[#FFC107] transition-colors flex items-center gap-1 font-medium cursor-pointer"
            >
              {item.label}
              {item.label === "projekte" && (
                <Heart size={14} className="text-[#E63946] fill-[#E63946]" />
              )}
              {item.label === "leistungen" && <ChevronDown size={14} />}
            </a>
          ))}
          <button
            onClick={() => openQuote()}
            className="text-white hover:text-[#FFC107] transition-colors"
            aria-label="Angebot anfordern"
          >
            <ClipboardCheck size={22} className="text-[#E63946]" />
          </button>
        </nav>

        <button
          className="lg:hidden text-white"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden bg-black/95 px-6 py-4 space-y-3 border-t border-white/10">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => handleNav(e, item.href)}
              className="block text-white py-2 hover:text-[#FFC107]"
            >
              {item.label}
            </a>
          ))}
          <button
            onClick={() => {
              openQuote();
              setOpen(false);
            }}
            className="w-full mt-2 bg-[#E63946] text-white py-2 rounded-full font-bold"
          >
            Angebot einholen
          </button>
        </div>
      )}
    </header>
  );
}
