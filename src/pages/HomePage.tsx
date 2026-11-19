import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  PackageCheck,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { COMPANY_CONFIG, getWhatsAppLink } from '../config/company.ts';
import { useApp } from '../context/AppContext.tsx';
import { SafeImage } from '../components/SafeImage.tsx';

export function HomePage() {
  const { t, lang, navigate } = useApp();
  const [quickCode, setQuickCode] = useState('');
  const ArrowIcon = lang === 'ar' ? ArrowLeft : ArrowRight;

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = quickCode.trim();
    if (!cleaned) {
      navigate('/track');
      return;
    }
    navigate(`/track?code=${encodeURIComponent(cleaned)}`);
  };

  return (
    <div>
      {/* 1. Hero Section */}
      <section className="bg-[#0B2545] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 flex flex-col justify-center space-y-6"
            >
              <p className="text-xs sm:text-sm font-medium text-[#F28C28] tracking-wide">
                {t.home.heroKicker}
              </p>

              <h1 className="text-3xl sm:text-4xl lg:text-[52px] font-extrabold leading-[1.18] tracking-tight text-white text-balance">
                {t.home.heroTitle}
              </h1>

              <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-xl">
                {t.home.heroSubtitle}
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/quote')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#F28C28] hover:bg-[#d97719] text-white text-sm sm:text-base font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <span>{t.home.heroPrimaryCta}</span>
                  <ArrowIcon className="w-4 h-4" aria-hidden="true" />
                </button>

                <a
                  href={getWhatsAppLink(t.whatsapp.defaultMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-white/25 bg-white/5 hover:bg-white/15 text-white text-sm sm:text-base font-semibold transition-colors whitespace-nowrap shrink-0"
                >
                  <MessageCircle className="w-4 h-4 text-[#4ADE80]" aria-hidden="true" />
                  <span>{t.home.heroSecondaryCta}</span>
                </a>
              </div>

              {/* Quick Tracking Bar */}
              <form
                onSubmit={handleQuickTrack}
                className="pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-2.5 max-w-xl"
              >
                <div className="relative flex-1">
                  <Search
                    className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${
                      lang === 'ar' ? 'right-3.5' : 'left-3.5'
                    }`}
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    value={quickCode}
                    onChange={(e) => setQuickCode(e.target.value)}
                    placeholder={t.home.quickTrackPlaceholder}
                    aria-label={t.home.quickTrackLabel}
                    className={`w-full h-11 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-300 text-sm focus:outline-none focus:border-[#F28C28] ${
                      lang === 'ar' ? 'pr-10 pl-3' : 'pl-10 pr-3'
                    }`}
                  />
                </div>
                <button
                  type="submit"
                  className="h-11 px-5 rounded-xl bg-white text-[#0B2545] hover:bg-slate-100 text-sm font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {t.home.quickTrackButton}
                </button>
              </form>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 flex"
            >
              <div className="relative w-full rounded-2xl overflow-hidden border border-white/15 bg-[#133B6D] min-h-[280px] lg:min-h-[420px]">
                <SafeImage
                  src={COMPANY_CONFIG.images.heroPort}
                  alt={t.home.heroImageAlt}
                  fallbackTitle={t.brand.wordmark}
                  className="w-full h-full object-cover lg:absolute lg:inset-0"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-[#0B2545]/75 via-[#0B2545]/15 to-transparent pointer-events-none"
                  aria-hidden="true"
                />
                <div className="absolute bottom-4 inset-x-4 flex items-center justify-between text-xs text-white/90 bg-[#0B2545]/80 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/15">
                  <span className="font-semibold">{t.brand.tagline}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Full-Width 4-Column Stats Counter Strip */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {t.home.stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="space-y-1"
              >
                <div className="text-2xl sm:text-3xl font-extrabold text-[#0B2545] tabular-nums">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-slate-600 leading-snug">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Services Overview */}
      <section className="py-16 lg:py-20 bg-[#F5F7FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="space-y-2 max-w-2xl">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0B2545] text-balance">
                {t.home.servicesTitle}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {t.home.servicesSubtitle}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/services')}
              className="inline-flex items-center gap-2 text-sm font-bold text-[#0B2545] hover:text-[#F28C28] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>{t.home.servicesViewAll}</span>
              <ArrowIcon className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {t.home.servicesCards.map((card, idx) => (
              <motion.article
                key={card.index}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                onClick={() => navigate('/services')}
                className="bg-white rounded-2xl border border-slate-200 p-7 hover:border-[#0B2545]/40 transition-colors cursor-pointer flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono-tabular text-sm font-bold text-[#F28C28]">
                      {card.index}
                    </span>
                    <span className="text-xs text-slate-500 truncate">{card.meta}</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#0B2545]">{card.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{card.desc}</p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#0B2545]">
                  <span>{t.services.ctaQuote}</span>
                  <ArrowIcon className="w-4 h-4 text-[#F28C28]" aria-hidden="true" />
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* 4. How It Works (4 Steps) */}
      <section className="py-16 lg:py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0B2545] text-balance">
              {t.home.howItWorksTitle}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {t.home.howItWorksSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.home.steps.map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.3, delay: idx * 0.06 }}
                className="rounded-2xl bg-[#F5F7FA] border border-slate-200/80 p-6 space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-[#0B2545] text-white font-mono-tabular text-sm font-bold flex items-center justify-center">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-[#0B2545]">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Featured Air Column Bags Spotlight */}
      <section className="py-16 lg:py-20 bg-[#F5F7FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
            <div className="lg:col-span-6 p-8 sm:p-10 lg:p-12 flex flex-col justify-center space-y-5">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#F28C28]">
                <PackageCheck className="w-4 h-4" aria-hidden="true" />
                <span>{t.products.types.fragile}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0B2545] text-balance">
                {t.home.packagingBannerTitle}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {t.home.packagingBannerDesc}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/products')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0B2545] hover:bg-[#133B6D] text-white text-sm font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>{t.home.packagingBannerCta}</span>
                  <ArrowIcon className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className="lg:col-span-6 min-h-[260px] relative bg-slate-100">
              <SafeImage
                src={COMPANY_CONFIG.images.airColumnBags}
                alt={t.home.packagingBannerTitle}
                fallbackTitle={t.home.packagingBannerTitle}
                className="w-full h-full object-cover lg:absolute lg:inset-0"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 6. Why Choose Wardly + Testimonials */}
      <section className="py-16 lg:py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
          {/* Why Choose Us */}
          <div>
            <div className="max-w-2xl mb-10 space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0B2545] text-balance">
                {t.home.whyTitle}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {t.home.whySubtitle}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {t.home.whyPoints.map((point) => (
                <div
                  key={point.title}
                  className="rounded-2xl border border-slate-200 p-6 flex items-start gap-4"
                >
                  <ShieldCheck className="w-6 h-6 text-[#F28C28] shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="space-y-1.5">
                    <h3 className="text-base sm:text-lg font-bold text-[#0B2545]">{point.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{point.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div className="pt-10 border-t border-slate-200">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0B2545] mb-8 text-balance">
              {t.home.testimonialsTitle}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {t.home.testimonials.map((item) => (
                <article
                  key={item.name}
                  className="rounded-2xl bg-[#F5F7FA] border border-slate-200/80 p-6 flex flex-col justify-between gap-5"
                >
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B2545]">
                      <CheckCircle2 className="w-4 h-4 text-[#F28C28]" aria-hidden="true" />
                      <span>{item.metric}</span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">“{item.quote}”</p>
                  </div>
                  <div className="pt-4 border-t border-slate-200/80">
                    <div className="text-sm font-bold text-[#0B2545]">{item.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{item.role}</div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. Final CTA Banner */}
      <section className="bg-[#0B2545] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 lg:py-16 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-2 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white text-balance">
              {t.home.finalCtaTitle}
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {t.home.finalCtaDesc}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3.5 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/quote')}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#F28C28] hover:bg-[#d97719] text-white text-sm font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>{t.home.finalCtaQuote}</span>
              <ArrowIcon className="w-4 h-4" aria-hidden="true" />
            </button>
            <a
              href={getWhatsAppLink(t.whatsapp.defaultMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl border border-white/25 hover:bg-white/10 text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              <MessageCircle className="w-4 h-4 text-[#4ADE80]" aria-hidden="true" />
              <span>{t.home.finalCtaWhatsapp}</span>
            </a>
            <a
              href={COMPANY_CONFIG.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl border border-white/25 hover:bg-white/10 text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              <span>{t.contact.telegramLabelInfo}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
