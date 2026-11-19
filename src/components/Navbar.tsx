import React, { useState } from 'react';
import { Globe, Menu, X } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { BrandLogo } from './BrandLogo.tsx';

export function Navbar() {
  const { t, lang, toggleLang, route, navigate } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { path: '/', label: t.nav.home },
    { path: '/services', label: t.nav.services },
    { path: '/products', label: t.nav.products },
    { path: '/track', label: t.nav.track },
    { path: '/about', label: t.nav.about },
    { path: '/faq', label: t.nav.faq },
    { path: '/contact', label: t.nav.contact },
  ];

  const handleNav = (path: string) => {
    setMobileOpen(false);
    navigate(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark */}
        <BrandLogo variant="dark" onClick={() => handleNav('/')} />

        {/* Zone 2: Clean single-line navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600"
        >
          {links.map((link) => {
            const active = route === link.path;
            return (
              <a
                key={link.path}
                href={link.path}
                onClick={(e) => {
                  e.preventDefault();
                  handleNav(link.path);
                }}
                className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F28C28] ${
                  active
                    ? 'text-[#0B2545] border-[#F28C28] font-semibold'
                    : 'border-transparent hover:text-[#0B2545] hover:border-slate-300'
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Language Switch + Primary CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={toggleLang}
            aria-label={lang === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-[#0B2545] hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#F28C28]"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            <span>{t.nav.langSwitch}</span>
          </button>

          <button
            type="button"
            onClick={() => handleNav('/quote')}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#F28C28] hover:bg-[#d97719] text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B2545]"
          >
            {t.nav.quoteCta}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? t.nav.menuClose : t.nav.menuOpen}
            aria-expanded={mobileOpen}
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 text-[#0B2545] hover:bg-slate-50 cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-1">
          {links.map((link) => {
            const active = route === link.path;
            return (
              <a
                key={link.path}
                href={link.path}
                onClick={(e) => {
                  e.preventDefault();
                  handleNav(link.path);
                }}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[#0B2545] text-white font-semibold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </a>
            );
          })}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => handleNav('/quote')}
              className="w-full py-2.5 px-4 rounded-lg bg-[#F28C28] text-white text-sm font-semibold hover:bg-[#d97719] transition-colors cursor-pointer"
            >
              {t.nav.quoteCta}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
