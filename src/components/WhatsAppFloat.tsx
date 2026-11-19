import React from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { COMPANY_CONFIG, getWhatsAppLink } from '../config/company.ts';
import { useApp } from '../context/AppContext.tsx';

export function WhatsAppFloat() {
  const { t, lang, route } = useApp();

  if (route === '/admin') {
    return null;
  }

  return (
    <div
      className={`fixed bottom-4 z-40 flex items-center gap-2 ${
        lang === 'ar' ? 'left-4' : 'right-4'
      }`}
    >
      <a
        href={COMPANY_CONFIG.telegramUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t.contact.telegramLabelInfo}
        title={t.contact.telegramLabelInfo}
        className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#0B2545] hover:bg-[#133B6D] text-white border border-white/20 shadow-lg transition-transform duration-150 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F28C28]"
      >
        <Send className="w-4 h-4 text-[#F28C28]" aria-hidden="true" />
      </a>
      <a
        href={getWhatsAppLink(t.whatsapp.defaultMessage)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t.whatsapp.label}
        title={t.whatsapp.label}
        className="inline-flex items-center gap-2 h-11 px-4 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white shadow-lg transition-transform duration-150 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B2545]"
      >
        <MessageCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
        <span className="hidden sm:inline text-xs font-semibold whitespace-nowrap">
          {t.whatsapp.label}
        </span>
      </a>
    </div>
  );
}
