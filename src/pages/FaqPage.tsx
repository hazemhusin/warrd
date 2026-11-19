import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';

export function FaqPage() {
  const { t, navigate } = useApp();
  const [category, setCategory] = useState<'all' | 'customs' | 'packaging'>('all');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredItems = t.faq.items.filter(
    (item) => category === 'all' || item.category === category
  );

  const filterBtns = [
    { id: 'all' as const, label: t.faq.categories.all },
    { id: 'customs' as const, label: t.faq.categories.customs },
    { id: 'packaging' as const, label: t.faq.categories.packaging },
  ];

  return (
    <div className="bg-[#F5F7FA] min-h-screen">
      <section className="bg-[#0B2545] text-white py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white text-balance">
            {t.faq.pageTitle}
          </h1>
          <p className="text-base text-slate-300 leading-relaxed">{t.faq.pageSubtitle}</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl">
          {filterBtns.map((btn) => (
            <button
              key={btn.id}
              type="button"
              onClick={() => {
                setCategory(btn.id);
                setOpenIndex(0);
              }}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                category === btn.id
                  ? 'bg-[#0B2545] text-white'
                  : 'text-slate-600 hover:text-[#0B2545]'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filteredItems.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={item.q}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full px-6 py-5 flex items-center justify-between gap-4 text-start cursor-pointer hover:bg-slate-50/70 transition-colors"
                >
                  <span className="text-sm sm:text-base font-bold text-[#0B2545]">{item.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#F28C28] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[#0B2545]">{t.home.finalCtaTitle}</h2>
            <p className="text-sm text-slate-600">{t.home.finalCtaDesc}</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/quote')}
            className="px-5 py-2.5 rounded-xl bg-[#F28C28] hover:bg-[#d97719] text-white text-sm font-bold whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t.nav.quoteCta}
          </button>
        </div>
      </section>
    </div>
  );
}
