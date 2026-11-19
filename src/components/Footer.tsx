import React from 'react';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { COMPANY_CONFIG } from '../config/company.ts';
import { useApp } from '../context/AppContext.tsx';
import { BrandLogo } from './BrandLogo.tsx';

export function Footer() {
  const { t, navigate } = useApp();

  const quickLinks = [
    { path: '/', label: t.nav.home },
    { path: '/products', label: t.nav.products },
    { path: '/track', label: t.nav.track },
    { path: '/quote', label: t.nav.quoteCta },
    { path: '/about', label: t.nav.about },
    { path: '/faq', label: t.nav.faq },
    { path: '/contact', label: t.nav.contact },
  ];

  const handleLink = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    navigate(path);
  };

  return (
    <footer className="bg-[#0B2545] text-slate-200 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand summary */}
          <div className="space-y-4">
            <BrandLogo variant="light" onClick={() => navigate('/')} />
            <p className="text-sm text-slate-300 leading-relaxed max-w-xs">
              {t.brand.tagline}
            </p>
            <p className="text-xs text-slate-400">{t.brand.locationTag}</p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">{t.footer.quickLinks}</h3>
            <ul className="space-y-2.5 text-sm">
              {quickLinks.map((item) => (
                <li key={item.path}>
                  <a
                    href={item.path}
                    onClick={(e) => handleLink(e, item.path)}
                    className="text-slate-300 hover:text-[#F28C28] transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">{t.footer.servicesTitle}</h3>
            <ul className="space-y-2.5 text-sm">
              {t.services.sections.map((sec) => (
                <li key={sec.id}>
                  <a
                    href="/services"
                    onClick={(e) => handleLink(e, '/services')}
                    className="text-slate-300 hover:text-[#F28C28] transition-colors"
                  >
                    {sec.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white mb-4">{t.footer.contactTitle}</h3>
            <div className="flex items-start gap-2.5 text-sm text-slate-300">
              <MapPin className="w-4 h-4 text-[#F28C28] shrink-0 mt-1" aria-hidden="true" />
              <span>{t.contact.addressValue}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-slate-300">
              <Phone className="w-4 h-4 text-[#F28C28] shrink-0" aria-hidden="true" />
              <a
                href={`tel:${COMPANY_CONFIG.phoneDisplay.replace(/\s+/g, '')}`}
                dir="ltr"
                className="hover:text-white transition-colors tabular-nums"
              >
                {COMPANY_CONFIG.phoneDisplay}
              </a>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-slate-300">
              <Mail className="w-4 h-4 text-[#F28C28] shrink-0" aria-hidden="true" />
              <a href={`mailto:${COMPANY_CONFIG.email}`} className="hover:text-white transition-colors">
                {COMPANY_CONFIG.email}
              </a>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-slate-300">
              <Send className="w-4 h-4 text-[#F28C28] shrink-0" aria-hidden="true" />
              <a
                href={COMPANY_CONFIG.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                {t.contact.telegramLabelInfo}
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>{t.footer.rights}</p>
          <a
            href="/admin"
            onClick={(e) => handleLink(e, '/admin')}
            className="text-slate-400 hover:text-white transition-colors"
          >
            {t.nav.admin}
          </a>
        </div>
      </div>
    </footer>
  );
}
