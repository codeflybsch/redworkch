import React, { useEffect, useState } from "react";
import { Menu, X, ChevronDown, LogIn, Phone, Mail, LayoutDashboard, MessageCircle, MapPin, Headphones } from "lucide-react";
import { useModals } from "../contexts/ModalContext";
import { useAuth } from "../contexts/AuthContext";
import { API } from "../api";
import Logo from "./Logo";

const mainLinks = [
  { label: "Start", href: "#top" },
  { label: "Hosting", href: "#hosting" },
  { label: "Domain Auktionen", href: "#domain-auctions" },
  { label: "Projekte", href: "#projekte" },
  { label: "Über uns", href: "#ueber" },
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
  const [supportOpen, setSupportOpen] = useState(false);
  const [contact, setContact] = useState({
    phone: "+41 44 000 00 00",
    whatsapp: "+41 44 000 00 00",
    email: "info@redwork.ch",
    address: "Bahnhofstrasse 1, 8001 Zürich, Schweiz",
  });
  const { openQuote, openContact } = useModals();
  const { user, logout, isAdmin } = useAuth();

  useEffect(() => {
    fetch(`${API}/site-settings`)
      .then((response) => response.json())
      .then((settings) => setContact((current) => ({
        phone: settings.footerPhone || current.phone,
        whatsapp: settings.contactWhatsapp || settings.footerPhone || current.whatsapp,
        email: settings.footerEmail || current.email,
        address: settings.footerAddress || settings.contactAddress || current.address,
      })))
      .catch(() => {});
  }, []);

  const handleNav = (e, href) => {
    if (!href?.startsWith("#")) return;
    e.preventDefault();
    if (window.location.pathname !== "/" && window.location.pathname !== "/hosting" && window.location.pathname !== "/domains") {
      window.location.href = `/${href}`;
      return;
    }
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
          {user ? (
            <a href={dashboardUrl} className="flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-2 text-sm font-bold text-white transition hover:bg-white/20"><LayoutDashboard size={15} /> Dashboard</a>
          ) : (
            <a href="/login" className="flex items-center gap-1.5 rounded-full bg-[#E63946] px-3.5 py-2 text-sm font-bold text-white transition hover:bg-[#c5303d]"><LogIn size={15} /> Login</a>
          )}
          {mainLinks.slice(0, 1).map((item) => (
            <a key={item.label} href={item.href} onClick={(e) => handleNav(e, item.href)} className="rounded-full px-3.5 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/10 hover:text-[#E63946]">
              {item.label}
            </a>
          ))}

          <div className="relative">
            <button type="button" onClick={() => setServicesOpen((v) => !v)} className="flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/10 hover:text-[#E63946]">
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
            <a key={item.label} href={item.href} onClick={(e) => handleNav(e, item.href)} className="rounded-full px-3.5 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/10 hover:text-[#E63946]">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden xl:flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setSupportOpen((value) => !value)}
              className="flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-400/20"
              aria-expanded={supportOpen}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              <Headphones size={16} /> Support
              <ChevronDown size={14} className={`transition ${supportOpen ? "rotate-180" : ""}`} />
            </button>
            {supportOpen && (
              <div className="absolute right-0 top-full mt-3 w-72 overflow-hidden rounded-3xl border border-slate-200 bg-white p-2 text-slate-900 shadow-2xl">
                <p className="px-4 pb-2 pt-3 text-[11px] font-black uppercase tracking-[.18em] text-slate-400">Wie können wir helfen?</p>
                <a href={`https://wa.me/${contact.whatsapp.replace(/[^\d]/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold hover:bg-emerald-50 hover:text-emerald-700"><MessageCircle size={18} /> WhatsApp</a>
                <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold hover:bg-blue-50 hover:text-blue-700"><Phone size={18} /> Anrufen</a>
                <a href={`https://maps.google.com/?q=${encodeURIComponent(contact.address)}`} target="_blank" rel="noreferrer" className="flex items-start gap-3 rounded-2xl px-4 py-3 text-sm font-bold hover:bg-red-50 hover:text-red-700"><MapPin size={18} className="mt-0.5 shrink-0" /><span><span className="block">Adresse</span><span className="mt-0.5 block text-xs font-medium text-slate-400">{contact.address}</span></span></a>
              </div>
            )}
          </div>
          <button onClick={openContact} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-white/80 hover:text-[#E63946]">
            <Mail size={15} /> Kontakt
          </button>
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
        <div className="max-h-[calc(100dvh-68px)] overflow-y-auto overscroll-contain border-t border-white/10 bg-[#07090f]/98 px-4 py-4 shadow-2xl xl:hidden">
          <div className="grid gap-2">
            {user ? (
              <a href={dashboardUrl} className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3.5 text-base font-black text-white"><LayoutDashboard size={19} /> Dashboard</a>
            ) : (
              <a href="/login" className="flex items-center gap-3 rounded-2xl bg-[#E63946] px-4 py-3.5 text-base font-black text-white"><LogIn size={19} /> Login</a>
            )}
            {mainLinks.map((item) => (
              <a key={item.label} href={item.href} onClick={(e) => handleNav(e, item.href)} className="rounded-2xl px-4 py-3 text-base font-bold text-white hover:bg-white/10 hover:text-[#E63946]">
                {item.label}
              </a>
            ))}
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3">
              <p className="mb-2 flex items-center gap-2 px-2 text-sm font-black text-white"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" /> Support</p>
              <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
                <a href={`https://wa.me/${contact.whatsapp.replace(/[^\d]/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 text-sm font-semibold text-white"><MessageCircle size={16} /> WhatsApp</a>
                <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 text-sm font-semibold text-white"><Phone size={16} /> Anrufen</a>
                <a href={`https://maps.google.com/?q=${encodeURIComponent(contact.address)}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 text-sm font-semibold text-white"><MapPin size={16} /> Adresse</a>
              </div>
            </div>
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
              {user && <button onClick={logout} className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-left font-bold text-white">Abmelden</button>}
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
