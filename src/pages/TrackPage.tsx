import React, { useEffect, useState } from 'react';
import { CheckCircle2, FileText, MapPin, PackageCheck, Search, Ship, Truck } from 'lucide-react';
import { getWhatsAppLink } from '../config/company.ts';
import { useApp } from '../context/AppContext.tsx';

interface TrackedShipment {
  trackingNumber: string;
  originCountry: string;
  port: string;
  destination: string;
  cargoTypeAr: string;
  cargoTypeEn: string;
  containerOrBill: string | null;
  status: 'documents_received' | 'under_clearance' | 'released' | 'delivered';
  notesAr: string | null;
  notesEn: string | null;
  estimatedDelivery: string | null;
  updatedAt: string;
}

export function TrackPage() {
  const { t, lang, queryParams } = useApp();
  const [inputCode, setInputCode] = useState('');
  const [shipment, setShipment] = useState<TrackedShipment | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const sampleCodes = ['WRD-2026-8841', 'WRD-2026-8842', 'WRD-2026-8843', 'WRD-2026-8844'];

  const lookupShipment = async (code: string) => {
    const cleaned = code.trim().toUpperCase();
    if (!cleaned) return;
    setLoading(true);
    setNotFound(false);
    setShipment(null);
    try {
      const res = await fetch(`/api/shipments/track/${encodeURIComponent(cleaned)}`);
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      if (!res.ok) throw new Error('Lookup error');
      const data = await res.json();
      setShipment(data);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initial = queryParams.get('code');
    if (initial) {
      setInputCode(initial);
      lookupShipment(initial);
    }
  }, [queryParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lookupShipment(inputCode);
  };

  const stageIcons = [FileText, Ship, PackageCheck, Truck];
  const currentStageIndex = shipment
    ? t.track.stages.findIndex((s) => s.key === shipment.status)
    : -1;

  return (
    <div className="bg-[#F5F7FA] min-h-screen">
      <section className="bg-[#0B2545] text-white py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white text-balance">
            {t.track.pageTitle}
          </h1>
          <p className="text-base text-slate-300 leading-relaxed">{t.track.pageSubtitle}</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        {/* Search Box */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${
                  lang === 'ar' ? 'right-3.5' : 'left-3.5'
                }`}
                aria-hidden="true"
              />
              <input
                type="text"
                dir="ltr"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder={t.track.inputPlaceholder}
                className={`w-full h-12 rounded-xl border border-slate-200 text-sm font-mono-tabular text-[#0B2545] placeholder:text-slate-400 focus:outline-none focus:border-[#F28C28] ${
                  lang === 'ar' ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4'
                }`}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="h-12 px-6 rounded-xl bg-[#F28C28] hover:bg-[#d97719] disabled:opacity-60 text-white text-sm font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {loading ? t.track.searching : t.track.searchBtn}
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>{t.track.samplesLabel}</span>
            {sampleCodes.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => {
                  setInputCode(code);
                  lookupShipment(code);
                }}
                className="font-mono-tabular font-semibold text-[#0B2545] hover:text-[#F28C28] underline underline-offset-2 cursor-pointer"
              >
                {code}
              </button>
            ))}
          </div>
        </div>

        {/* Not Found */}
        {notFound && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
            <h2 className="text-lg font-bold text-[#0B2545]">{t.track.notFoundTitle}</h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto">{t.track.notFoundDesc}</p>
            <a
              href={getWhatsAppLink(`${t.whatsapp.defaultMessage} (${inputCode})`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-5 py-2.5 rounded-xl bg-[#16A34A] text-white text-xs font-bold hover:bg-[#15803D] transition-colors"
            >
              {t.whatsapp.label}
            </a>
          </div>
        )}

        {/* Shipment Result */}
        {shipment && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-8">
            {/* Header Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="space-y-1">
                <div className="text-xs text-slate-500">{t.track.details.trackingNo}</div>
                <div className="font-mono-tabular text-2xl font-extrabold text-[#0B2545]">
                  {shipment.trackingNumber}
                </div>
              </div>
              <div className="inline-flex items-center gap-2 text-sm font-bold text-[#0B2545]">
                <CheckCircle2 className="w-5 h-5 text-[#F28C28]" aria-hidden="true" />
                <span>{t.track.stages[currentStageIndex]?.label || shipment.status}</span>
              </div>
            </div>

            {/* 4-Step Visual Progress */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {t.track.stages.map((stage, idx) => {
                const Icon = stageIcons[idx];
                const reached = idx <= currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                return (
                  <div
                    key={stage.key}
                    className={`rounded-xl border p-4 space-y-2 ${
                      isCurrent
                        ? 'border-[#F28C28] bg-[#F28C28]/10'
                        : reached
                        ? 'border-[#0B2545]/30 bg-[#F5F7FA]'
                        : 'border-slate-200 bg-white opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon
                        className={`w-5 h-5 ${
                          isCurrent
                            ? 'text-[#F28C28]'
                            : reached
                            ? 'text-[#0B2545]'
                            : 'text-slate-400'
                        }`}
                        aria-hidden="true"
                      />
                      <span className="font-mono-tabular text-xs font-bold text-slate-500">
                        0{idx + 1}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-[#0B2545]">{stage.label}</div>
                    <p className="text-xs text-slate-600 leading-relaxed">{stage.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Shipment Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-slate-100 text-sm">
              <div>
                <div className="text-xs text-slate-500 mb-1">{t.track.details.origin}</div>
                <div className="font-semibold text-[#0B2545]">{shipment.originCountry}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">{t.track.details.port}</div>
                <div className="font-semibold text-[#0B2545]">{shipment.port}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">{t.track.details.destination}</div>
                <div className="font-semibold text-[#0B2545] inline-flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#F28C28]" aria-hidden="true" />
                  <span>{shipment.destination}</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">{t.track.details.cargo}</div>
                <div className="font-semibold text-[#0B2545]">
                  {lang === 'ar' ? shipment.cargoTypeAr : shipment.cargoTypeEn}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">{t.track.details.container}</div>
                <div className="font-mono-tabular font-semibold text-[#0B2545]">
                  {shipment.containerOrBill || '—'}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">{t.track.details.eta}</div>
                <div className="font-mono-tabular font-semibold text-[#0B2545]">
                  {shipment.estimatedDelivery || '—'}
                </div>
              </div>
            </div>

            {(shipment.notesAr || shipment.notesEn) && (
              <div className="rounded-xl bg-[#F5F7FA] border border-slate-200 p-4 space-y-1">
                <div className="text-xs font-bold text-[#0B2545]">{t.track.details.notes}</div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {lang === 'ar'
                    ? shipment.notesAr || shipment.notesEn
                    : shipment.notesEn || shipment.notesAr}
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
