import React, { useState } from "react";
import { Menu, X, ChevronDown, LogIn, User, Phone, Mail, LayoutDashboard } from "lucide-react";
import { useModals } from "../contexts/ModalContext";
import { useAuth } from "../contexts/AuthContext";
import Logo from "./Logo";

const mainLinks = [
  { label: "Start", href: "#top" },
  { label: "Hosting", href: "#hosting" },
  { label: "Domain Auktionen", href: "#domains" },
  { label: "Projekte", href: "#projekte" },
  { label: "Über uns", href: "#ueber" },
  { label: "Kontakt", href: "#kontakt" },
];

const serviceLinks = [
  { label: "Webdesign", href: "#leistungen" },
  { label: "Softwareentwicklung", href: "#leistungen" },
  { label: "SEO & Marketing", href: "#leistungen" },
  { label: "Hosting & Domains", href: "#hosting" },
];

export default function Header({ scrolled }) {
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const { openQuote, openContact } = useModals();
  const { user, logout, isAdmin } = useAuth();

  const handleNav = (e, href) => {
    if (!href?.startsWith("#")) return;
    e.preventDefault();
    const id = href.slice(1);
    if (id === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const el = document.getElementById(id);
      if (el) {
        const headerHeight = document.querySelector("header")?.offsetHeight || 0;
        const top = el.getBoundingClientRect().top + window.scrollY - headerHeight - 18;
        window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
      }
    }
    setOpen(false);
    setServicesOpen(false);
  };

  const dashboardUrl = isAdmin ? "/admin" : "/dashboard";

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-[#07090f]/95 shadow-2xl shadow-black/20 backdrop-blur-xl border-b border-white/10" : "bg-[#07090f]/90 backdrop-blur-md"}`}>
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:py-3.5">
        <a href="#top" onClick={(e) => handleNav(e, "#top")} className="shrink-0" aria-label="RedWORK Startseite">
          <Logo size="md" />
        </a>

        <nav className="hidden xl:flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-2 shadow-inner">
          {mainLinks.slice(0, 1).map((item) => (
            <a key={item.label} href={item.href} onClick={(e) => handleNav(e, item.href)} className="rounded-full px-3.5 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/10 hover:text-[#FFC107]">
              {item.label}
            </a>
          ))}

          <div className="relative">
            <button type="button" onClick={() => setServicesOpen((v) => !v)} className="flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/10 hover:text-[#FFC107]">
              Leistungen <ChevronDown size={15} className={`transition ${servicesOpen ? "rotate-180" : ""}`} />
            </button>
            {servicesOpen && (
              <div className="absolute left-0 top-full mt-3 w-72 overflow-hidden rounded-3xl border border-white/10 bg-white p-2 shadow-2xl">
                {serviceLinks.map((service) => (
                  <a key={service.label} href={service.href} onClick={(e) => handleNav(e, service.href)} className="block rounded-2xl px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 hover:text-[#E63946]">
                    {service.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {mainLinks.slice(1).map((item) => (
            <a key={item.label} href={item.href} onClick={(e) => handleNav(e, item.href)} className="rounded-full px-3.5 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/10 hover:text-[#FFC107]">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden xl:flex items-center gap-3">
          <a href="tel:+414400000000" className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-white/80 hover:text-[#FFC107]">
            <Phone size={15} /> <span>+41 44 000 00 00</span>
          </a>
          <button onClick={openContact} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-white/80 hover:text-[#FFC107]">
            <Mail size={15} /> Kontakt
          </button>
          {user ? (
            <a href={dashboardUrl} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-white hover:bg-white/10">
              <LayoutDashboard size={15} /> Dashboard
            </a>
          ) : (
            <a href="/login" className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-white hover:bg-white/10">
              <LogIn size={15} /> Login
            </a>
          )}
          {user && <button onClick={logout} className="text-sm font-semibold text-white/60 hover:text-white">Abmelden</button>}
          <button onClick={openQuote} className="rounded-full bg-gradient-to-r from-[#E63946] to-[#ff6b35] px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-red-900/30 transition hover:scale-[1.03]">
            Angebot
          </button>
        </div>

        <button className="xl:hidden rounded-2xl border border-white/10 bg-white/[0.06] p-2.5 text-white" onClick={() => setOpen((v) => !v)} aria-label="Menü öffnen">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="xl:hidden border-t border-white/10 bg-[#07090f]/98 px-4 py-5 shadow-2xl">
          <div className="grid gap-2">
            {mainLinks.map((item) => (
              <a key={item.label} href={item.href} onClick={(e) => handleNav(e, item.href)} className="rounded-2xl px-4 py-3 text-base font-bold text-white hover:bg-white/10 hover:text-[#FFC107]">
                {item.label}
              </a>
            ))}
            <div className="mt-2 rounded-3xl border border-white/10 bg-white/[0.04] p-3">
              <p className="px-2 pb-2 text-xs font-black uppercase tracking-[0.22em] text-white/45">Leistungen</p>
              {serviceLinks.map((service) => (
                <a key={service.label} href={service.href} onClick={(e) => handleNav(e, service.href)} className="block rounded-2xl px-4 py-2.5 text-sm font-semibold text-white/85 hover:bg-white/10">
                  {service.label}
                </a>
              ))}
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <button onClick={() => { openContact(); setOpen(false); }} className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-left font-bold text-white">Kontakt</button>
              {user ? (
                <a href={dashboardUrl} className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 font-bold text-white">Dashboard</a>
              ) : (
                <a href="/login" className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 font-bold text-white">Login</a>
              )}
            </div>
            <button onClick={() => { openQuote(); setOpen(false); }} className="mt-2 rounded-2xl bg-gradient-to-r from-[#E63946] to-[#ff6b35] px-4 py-4 font-black text-white">
              Angebot einholen
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
