import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileUp,
  MessageCircle,
  Paperclip,
} from 'lucide-react';
import { getWhatsAppLink } from '../config/company.ts';
import { useApp } from '../context/AppContext.tsx';

export function QuotePage() {
  const { t, lang, queryParams } = useApp();
  const ArrowNext = lang === 'ar' ? ArrowLeft : ArrowRight;
  const ArrowPrev = lang === 'ar' ? ArrowRight : ArrowLeft;

  const [step, setStep] = useState(1);
  const [serviceType, setServiceType] = useState('customs_clearance');
  const [goodsDescription, setGoodsDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [originCountry, setOriginCountry] = useState('');
  const [portOfEntry, setPortOfEntry] = useState<string>(t.quote.ports[0]);
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [contactName, setContactName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState('');

  useEffect(() => {
    const svc = queryParams.get('service');
    const prod = queryParams.get('product');
    if (
      svc &&
      ['customs_clearance', 'supply_sourcing', 'cargo_inspection', 'packaging_supply'].includes(svc)
    ) {
      setServiceType(svc);
    }
    if (prod) {
      setGoodsDescription(prod);
    }
  }, [queryParams]);

  useEffect(() => {
    setPortOfEntry(t.quote.ports[0]);
  }, [lang]);

  const serviceOptions = [
    { id: 'customs_clearance', label: t.quote.services.customs_clearance },
    { id: 'supply_sourcing', label: t.quote.services.supply_sourcing },
    { id: 'cargo_inspection', label: t.quote.services.cargo_inspection },
    { id: 'packaging_supply', label: t.quote.services.packaging_supply },
  ];

  const handleNext = () => {
    setErrorMsg('');
    if (step === 1) {
      if (!serviceType || !goodsDescription.trim() || !quantity.trim()) {
        setErrorMsg(t.quote.validationError);
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!originCountry.trim() || !portOfEntry.trim()) {
        setErrorMsg(t.quote.validationError);
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!contactName.trim() || !phone.trim() || !email.trim()) {
      setErrorMsg(t.quote.validationError);
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('serviceType', serviceType);
      formData.append('goodsDescription', goodsDescription.trim());
      formData.append('quantity', quantity.trim());
      formData.append('originCountry', originCountry.trim());
      formData.append('portOfEntry', portOfEntry.trim());
      formData.append('contactName', contactName.trim());
      formData.append('companyName', companyName.trim());
      formData.append('phone', phone.trim());
      formData.append('email', email.trim());
      formData.append('notes', notes.trim());
      if (file) {
        formData.append('attachment', file);
      }

      const res = await fetch('/api/quotes', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit request');
      }
      setSubmittedRef(data.referenceCode);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Submission error');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSubmittedRef('');
    setGoodsDescription('');
    setQuantity('');
    setOriginCountry('');
    setNotes('');
    setFile(null);
    setContactName('');
    setCompanyName('');
    setPhone('');
    setEmail('');
    setErrorMsg('');
  };

  return (
    <div className="bg-[#F5F7FA] min-h-screen">
      <section className="bg-[#0B2545] text-white py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white text-balance">
            {t.quote.pageTitle}
          </h1>
          <p className="text-base text-slate-300 leading-relaxed">{t.quote.pageSubtitle}</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {submittedRef ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 text-center space-y-5">
            <CheckCircle2 className="w-12 h-12 text-[#16A34A] mx-auto" aria-hidden="true" />
            <h2 className="text-2xl font-bold text-[#0B2545]">{t.quote.successTitle}</h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto leading-relaxed">
              {t.quote.successDesc}
            </p>
            <div className="inline-flex flex-col sm:flex-row items-center gap-2 px-5 py-3 rounded-xl bg-[#F5F7FA] border border-slate-200">
              <span className="text-xs font-semibold text-slate-500">
                {t.quote.referenceLabel}
              </span>
              <span className="font-mono-tabular text-lg font-extrabold text-[#0B2545]">
                {submittedRef}
              </span>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <a
                href={getWhatsAppLink(
                  `${t.whatsapp.defaultMessage} (${t.quote.referenceLabel} ${submittedRef})`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-bold transition-colors"
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                <span>{t.quote.whatsappFollowup}</span>
              </a>
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[#0B2545] text-sm font-semibold transition-colors cursor-pointer"
              >
                {t.quote.newRequest}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10">
            {/* Stepper Progress */}
            <div className="grid grid-cols-3 gap-3 pb-8 mb-8 border-b border-slate-100">
              {t.quote.steps.map((label, idx) => {
                const stepNum = idx + 1;
                const isActive = step === stepNum;
                const isDone = step > stepNum;
                return (
                  <div key={label} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-7 h-7 rounded-lg font-mono-tabular text-xs font-bold flex items-center justify-center shrink-0 ${
                          isActive
                            ? 'bg-[#F28C28] text-white'
                            : isDone
                            ? 'bg-[#0B2545] text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        0{stepNum}
                      </span>
                      <span
                        className={`text-xs sm:text-sm font-semibold truncate ${
                          isActive || isDone ? 'text-[#0B2545]' : 'text-slate-400'
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                    <div
                      className={`h-1 rounded-full ${
                        isActive
                          ? 'bg-[#F28C28]'
                          : isDone
                          ? 'bg-[#0B2545]'
                          : 'bg-slate-100'
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            {errorMsg && (
              <div
                role="alert"
                className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-[#0B2545] mb-2.5">
                      {t.quote.serviceLabel}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {serviceOptions.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setServiceType(opt.id)}
                          className={`text-start px-4 py-3.5 rounded-xl border text-sm font-semibold transition-colors cursor-pointer ${
                            serviceType === opt.id
                              ? 'border-[#F28C28] bg-[#F28C28]/10 text-[#0B2545]'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="goodsDescription"
                      className="block text-sm font-bold text-[#0B2545] mb-2"
                    >
                      {t.quote.goodsLabel} *
                    </label>
                    <textarea
                      id="goodsDescription"
                      rows={3}
                      value={goodsDescription}
                      onChange={(e) => setGoodsDescription(e.target.value)}
                      placeholder={t.quote.goodsPlaceholder}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#0B2545] placeholder:text-slate-400 focus:outline-none focus:border-[#F28C28]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="quantity"
                      className="block text-sm font-bold text-[#0B2545] mb-2"
                    >
                      {t.quote.quantityLabel} *
                    </label>
                    <input
                      id="quantity"
                      type="text"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder={t.quote.quantityPlaceholder}
                      className="w-full h-11 rounded-xl border border-slate-200 px-4 text-sm text-[#0B2545] placeholder:text-slate-400 focus:outline-none focus:border-[#F28C28]"
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="originCountry"
                        className="block text-sm font-bold text-[#0B2545] mb-2"
                      >
                        {t.quote.originLabel} *
                      </label>
                      <input
                        id="originCountry"
                        type="text"
                        value={originCountry}
                        onChange={(e) => setOriginCountry(e.target.value)}
                        placeholder={t.quote.originPlaceholder}
                        className="w-full h-11 rounded-xl border border-slate-200 px-4 text-sm text-[#0B2545] placeholder:text-slate-400 focus:outline-none focus:border-[#F28C28]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="portOfEntry"
                        className="block text-sm font-bold text-[#0B2545] mb-2"
                      >
                        {t.quote.portLabel} *
                      </label>
                      <select
                        id="portOfEntry"
                        value={portOfEntry}
                        onChange={(e) => setPortOfEntry(e.target.value)}
                        className="w-full h-11 rounded-xl border border-slate-200 px-4 text-sm text-[#0B2545] bg-white focus:outline-none focus:border-[#F28C28]"
                      >
                        {t.quote.ports.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#0B2545] mb-2">
                      {t.quote.fileLabel}
                    </label>
                    <label className="flex items-center justify-center gap-3 w-full rounded-xl border border-dashed border-slate-300 bg-[#F5F7FA] hover:border-[#F28C28] px-4 py-5 cursor-pointer transition-colors">
                      <FileUp className="w-5 h-5 text-[#F28C28] shrink-0" aria-hidden="true" />
                      <span className="text-sm font-medium text-slate-700">
                        {file ? `${t.quote.fileSelected} ${file.name}` : t.quote.fileButton}
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls,.csv"
                        onChange={(e) => {
                          const selected = e.target.files?.[0] || null;
                          if (selected && selected.size > 2 * 1024 * 1024) {
                            setErrorMsg('Max file size is 2MB');
                            return;
                          }
                          setErrorMsg('');
                          setFile(selected);
                        }}
                        className="hidden"
                      />
                    </label>
                    {file && (
                      <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-600">
                        <Paperclip className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{file.name}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-sm font-bold text-[#0B2545] mb-2">
                      {t.quote.notesLabel}
                    </label>
                    <textarea
                      id="notes"
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={t.quote.notesPlaceholder}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#0B2545] placeholder:text-slate-400 focus:outline-none focus:border-[#F28C28]"
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="contactName"
                        className="block text-sm font-bold text-[#0B2545] mb-2"
                      >
                        {t.quote.nameLabel} *
                      </label>
                      <input
                        id="contactName"
                        type="text"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full h-11 rounded-xl border border-slate-200 px-4 text-sm text-[#0B2545] focus:outline-none focus:border-[#F28C28]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="companyName"
                        className="block text-sm font-bold text-[#0B2545] mb-2"
                      >
                        {t.quote.companyLabel}
                      </label>
                      <input
                        id="companyName"
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full h-11 rounded-xl border border-slate-200 px-4 text-sm text-[#0B2545] focus:outline-none focus:border-[#F28C28]"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-bold text-[#0B2545] mb-2">
                        {t.quote.phoneLabel} *
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        dir="ltr"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+20 109 655 4798"
                        className="w-full h-11 rounded-xl border border-slate-200 px-4 text-sm text-[#0B2545] focus:outline-none focus:border-[#F28C28]"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-bold text-[#0B2545] mb-2">
                        {t.quote.emailLabel} *
                      </label>
                      <input
                        id="email"
                        type="email"
                        dir="ltr"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full h-11 rounded-xl border border-slate-200 px-4 text-sm text-[#0B2545] focus:outline-none focus:border-[#F28C28]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setStep((s) => s - 1);
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-[#0B2545] hover:bg-slate-50 cursor-pointer"
                  >
                    <ArrowPrev className="w-4 h-4" aria-hidden="true" />
                    <span>{t.quote.prev}</span>
                  </button>
                ) : (
                  <div />
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0B2545] hover:bg-[#133B6D] text-white text-sm font-bold transition-colors cursor-pointer"
                  >
                    <span>{t.quote.next}</span>
                    <ArrowNext className="w-4 h-4" aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F28C28] hover:bg-[#d97719] disabled:opacity-60 text-white text-sm font-bold transition-colors cursor-pointer"
                  >
                    <span>{submitting ? t.quote.submitting : t.quote.submit}</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </section>
    </div>
  );
}
