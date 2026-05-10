import React, { useState } from "react";
import { Menu, X, ChevronDown, Heart, ClipboardCheck, LogIn, User, Phone, Mail } from "lucide-react";
import { navItems } from "../mock";
import { useModals } from "../contexts/ModalContext";
import { useAuth } from "../contexts/AuthContext";
import Logo from "./Logo";

export default function Header({ scrolled }) {
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const { openQuote, openContact } = useModals();
  const { user, logout } = useAuth();

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
      setServicesOpen(false);
    }
  };

  const services = [
    { label: "Webdesign", href: "#leistungen" },
    { label: "Softwareentwicklung", href: "#leistungen" },
    { label: "SEO", href: "#leistungen" },
    { label: "Hosting", href: "#hosting" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-black/95 backdrop-blur-md shadow-lg" : "bg-black/90"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex items-center justify-between py-3">
        <a href="#top" onClick={(e) => handleNav(e, "#top")}>
          <Logo size="md" />
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {navItems.slice(0, 2).map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => handleNav(e, item.href)}
              className="text-white text-sm hover:text-[#FFC107] transition-colors font-medium"
            >
              {item.label}
            </a>
          ))}

          {/* Services Dropdown */}
          <div className="relative">
            <button
              onClick={() => setServicesOpen(!servicesOpen)}
              className="text-white text-sm hover:text-[#FFC107] transition-colors font-medium flex items-center gap-1"
            >
              Leistungen <ChevronDown size={14} />
            </button>
            {servicesOpen && (
              <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg py-2 min-w-[200px] z-50">
                {services.map((service) => (
                  <a
                    key={service.label}
                    href={service.href}
                    onClick={(e) => handleNav(e, service.href)}
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100 text-sm"
                  >
                    {service.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {navItems.slice(2).map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => handleNav(e, item.href)}
              className="text-white text-sm hover:text-[#FFC107] transition-colors font-medium"
            >
              {item.label}
            </a>
          ))}

          {/* Contact Info */}
          <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white/20">
            <a href="tel:+414400000000" className="text-white hover:text-[#FFC107] transition-colors flex items-center gap-1 text-sm">
              <Phone size={14} />
              <span className="hidden xl:inline">+41 44 000 00 00</span>
            </a>
            <button
              onClick={openContact}
              className="text-white hover:text-[#FFC107] transition-colors flex items-center gap-1 text-sm"
            >
              <Mail size={14} />
              <span className="hidden xl:inline">Kontakt</span>
            </button>
          </div>
        </nav>

        {/* Auth & CTA */}
        <div className="hidden lg:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <a
                href="/dashboard"
                className="text-white hover:text-[#FFC107] transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <User size={16} />
                Dashboard
              </a>
              <button
                onClick={logout}
                className="text-white hover:text-[#FFC107] transition-colors text-sm"
              >
                Abmelden
              </button>
            </div>
          ) : (
            <a
              href="/login"
              className="text-white hover:text-[#FFC107] transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <LogIn size={16} />
              Anmelden
            </a>
          )}
          <button
            onClick={openQuote}
            className="bg-[#E63946] text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-[#d32f3f] transition-colors"
          >
            Angebot
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-white"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="lg:hidden bg-black/95 px-4 py-6 space-y-4 border-t border-white/10">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => handleNav(e, item.href)}
              className="block text-white py-3 hover:text-[#FFC107] text-base font-medium"
            >
              {item.label}
            </a>
          ))}

          {/* Services in Mobile */}
          <div className="space-y-2">
            <div className="text-white/60 text-sm uppercase tracking-wider">Leistungen</div>
            {services.map((service) => (
              <a
                key={service.label}
                href={service.href}
                onClick={(e) => handleNav(e, service.href)}
                className="block text-white py-2 pl-4 hover:text-[#FFC107] text-sm"
              >
                {service.label}
              </a>
            ))}
          </div>

          {/* Contact in Mobile */}
          <div className="space-y-2 pt-4 border-t border-white/10">
            <a href="tel:+414400000000" className="flex items-center gap-3 text-white hover:text-[#FFC107] py-2">
              <Phone size={16} />
              <span>+41 44 000 00 00</span>
            </a>
            <button
              onClick={() => {
                openContact();
                setOpen(false);
              }}
              className="flex items-center gap-3 text-white hover:text-[#FFC107] py-2 w-full text-left"
            >
              <Mail size={16} />
              <span>Kontakt</span>
            </button>
          </div>

          {/* Auth in Mobile */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            {user ? (
              <>
                <a
                  href="/dashboard"
                  className="block text-white hover:text-[#FFC107] py-2 text-base font-medium"
                >
                  Dashboard
                </a>
                <button
                  onClick={logout}
                  className="block text-white hover:text-[#FFC107] py-2 text-base w-full text-left"
                >
                  Abmelden
                </button>
              </>
            ) : (
              <a
                href="/login"
                className="block text-white hover:text-[#FFC107] py-2 text-base font-medium"
              >
                Anmelden
              </a>
            )}
            <button
              onClick={() => {
                openQuote();
                setOpen(false);
              }}
              className="w-full bg-[#E63946] text-white py-3 rounded-full font-bold hover:bg-[#d32f3f] transition-colors"
            >
              Angebot einholen
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
