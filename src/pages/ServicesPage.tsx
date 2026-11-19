import React from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { COMPANY_CONFIG } from '../config/company.ts';
import { useApp } from '../context/AppContext.tsx';
import { SafeImage } from '../components/SafeImage.tsx';

export function ServicesPage() {
  const { t, lang, navigate } = useApp();
  const ArrowIcon = lang === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <div className="bg-[#F5F7FA] min-h-screen">
      {/* Page Header */}
      <section className="bg-[#0B2545] text-white py-14 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white text-balance">
            {t.services.pageTitle}
          </h1>
          <p className="text-base text-slate-300 max-w-2xl leading-relaxed">
            {t.services.pageSubtitle}
          </p>
        </div>
      </section>

      {/* Four Detailed Service Sections */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16 space-y-10">
        {t.services.sections.map((section, index) => {
          const isReversed = index % 2 === 1;
          const imgSrc = COMPANY_CONFIG.images[section.imageKey];

          return (
            <article
              key={section.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch"
            >
              <div
                className={`lg:col-span-5 relative min-h-[260px] bg-slate-100 ${
                  isReversed ? 'lg:order-2' : ''
                }`}
              >
                <SafeImage
                  src={imgSrc}
                  alt={section.imageAlt}
                  fallbackTitle={section.title}
                  className="w-full h-full object-cover lg:absolute lg:inset-0"
                />
              </div>

              <div
                className={`lg:col-span-7 p-7 sm:p-10 flex flex-col justify-between gap-6 ${
                  isReversed ? 'lg:order-1' : ''
                }`}
              >
                <div className="space-y-4">
                  <div className="font-mono-tabular text-sm font-bold text-[#F28C28]">
                    {section.index}
                  </div>
                  <h2 className="text-2xl font-bold text-[#0B2545]">{section.title}</h2>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    {section.summary}
                  </p>
                  <ul className="space-y-2.5 pt-2">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2.5 text-sm text-slate-700">
                        <Check
                          className="w-4 h-4 text-[#F28C28] shrink-0 mt-1"
                          aria-hidden="true"
                        />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => navigate(`/quote?service=${encodeURIComponent(section.id)}`)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B2545] hover:bg-[#133B6D] text-white text-sm font-semibold transition-colors cursor-pointer"
                  >
                    <span>{t.services.ctaQuote}</span>
                    <ArrowIcon className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
