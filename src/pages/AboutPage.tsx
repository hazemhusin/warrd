import React from 'react';
import { Award, Compass, ShieldCheck, Target } from 'lucide-react';
import { COMPANY_CONFIG } from '../config/company.ts';
import { useApp } from '../context/AppContext.tsx';
import { SafeImage } from '../components/SafeImage.tsx';

export function AboutPage() {
  const { t } = useApp();

  return (
    <div className="bg-[#F5F7FA] min-h-screen">
      <section className="bg-[#0B2545] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white text-balance">
            {t.about.pageTitle}
          </h1>
          <p className="text-base text-slate-300 max-w-2xl leading-relaxed">
            {t.about.pageSubtitle}
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        {/* Story Split */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-7 p-8 sm:p-10 space-y-4 flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-[#0B2545]">{t.about.storyTitle}</h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{t.about.storyP1}</p>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{t.about.storyP2}</p>
          </div>
          <div className="lg:col-span-5 relative min-h-[260px] bg-slate-100">
            <SafeImage
              src={COMPANY_CONFIG.images.customsDesk}
              alt={t.about.storyTitle}
              fallbackTitle={t.brand.wordmark}
              className="w-full h-full object-cover lg:absolute lg:inset-0"
            />
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
            <Target className="w-7 h-7 text-[#F28C28]" aria-hidden="true" />
            <h2 className="text-xl font-bold text-[#0B2545]">{t.about.missionTitle}</h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {t.about.missionDesc}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
            <Compass className="w-7 h-7 text-[#F28C28]" aria-hidden="true" />
            <h2 className="text-xl font-bold text-[#0B2545]">{t.about.visionTitle}</h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {t.about.visionDesc}
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-[#0B2545]">{t.about.valuesTitle}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.about.values.map((val) => (
              <div
                key={val.title}
                className="bg-white rounded-2xl border border-slate-200 p-6 space-y-2.5"
              >
                <ShieldCheck className="w-5 h-5 text-[#F28C28]" aria-hidden="true" />
                <h3 className="text-base font-bold text-[#0B2545]">{val.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Licenses & Certifications Placeholder */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6">
          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold text-[#0B2545]">{t.about.licensesTitle}</h2>
            <p className="text-sm text-slate-600">{t.about.licensesSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {t.about.licenses.map((lic) => (
              <div
                key={lic.title}
                className="rounded-xl bg-[#F5F7FA] border border-slate-200 p-5 flex items-start gap-3.5"
              >
                <Award className="w-5 h-5 text-[#F28C28] shrink-0 mt-0.5" aria-hidden="true" />
                <div className="space-y-1">
                  <div className="text-sm font-bold text-[#0B2545]">{lic.title}</div>
                  <div className="font-mono-tabular text-xs font-semibold text-slate-700">
                    {lic.code}
                  </div>
                  <div className="text-xs text-slate-500">{lic.issuer}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
