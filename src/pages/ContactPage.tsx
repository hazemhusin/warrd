import React, { useState } from 'react';
import { CheckCircle2, Clock, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { COMPANY_CONFIG, getWhatsAppLink } from '../config/company.ts';
import { useApp } from '../context/AppContext.tsx';

export function ContactPage() {
  const { t } = useApp();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!name.trim() || !phone.trim() || !subject.trim() || !message.trim()) {
      setErrorMsg(t.quote.validationError);
      return;
    }

    setSending(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, subject, message }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send');
      }
      setSent(true);
      setName('');
      setPhone('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-[#F5F7FA] min-h-screen">
      <section className="bg-[#0B2545] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white text-balance">
            {t.contact.pageTitle}
          </h1>
          <p className="text-base text-slate-300 max-w-2xl leading-relaxed">
            {t.contact.pageSubtitle}
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Contact Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-7 sm:p-9">
            <h2 className="text-xl font-bold text-[#0B2545] mb-6">{t.contact.formTitle}</h2>

            {sent && (
              <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-3 text-sm text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" aria-hidden="true" />
                <span>{t.contact.successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div
                role="alert"
                className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cName" className="block text-sm font-semibold text-[#0B2545] mb-1.5">
                    {t.contact.nameLabel} *
                  </label>
                  <input
                    id="cName"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 px-4 text-sm text-[#0B2545] focus:outline-none focus:border-[#F28C28]"
                  />
                </div>
                <div>
                  <label htmlFor="cPhone" className="block text-sm font-semibold text-[#0B2545] mb-1.5">
                    {t.contact.phoneLabel} *
                  </label>
                  <input
                    id="cPhone"
                    type="tel"
                    dir="ltr"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 px-4 text-sm text-[#0B2545] focus:outline-none focus:border-[#F28C28]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cEmail" className="block text-sm font-semibold text-[#0B2545] mb-1.5">
                    {t.contact.emailLabel}
                  </label>
                  <input
                    id="cEmail"
                    type="email"
                    dir="ltr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 px-4 text-sm text-[#0B2545] focus:outline-none focus:border-[#F28C28]"
                  />
                </div>
                <div>
                  <label htmlFor="cSubject" className="block text-sm font-semibold text-[#0B2545] mb-1.5">
                    {t.contact.subjectLabel} *
                  </label>
                  <input
                    id="cSubject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 px-4 text-sm text-[#0B2545] focus:outline-none focus:border-[#F28C28]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="cMsg" className="block text-sm font-semibold text-[#0B2545] mb-1.5">
                  {t.contact.messageLabel} *
                </label>
                <textarea
                  id="cMsg"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#0B2545] focus:outline-none focus:border-[#F28C28]"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="px-6 py-3 rounded-xl bg-[#F28C28] hover:bg-[#d97719] disabled:opacity-60 text-white text-sm font-bold transition-colors cursor-pointer"
              >
                {sending ? t.contact.sendingBtn : t.contact.submitBtn}
              </button>
            </form>
          </div>

          {/* Direct Channels & Address */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-7 sm:p-9 flex flex-col justify-between gap-6">
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[#0B2545]">{t.contact.infoTitle}</h2>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#F28C28] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <div className="font-bold text-[#0B2545]">{t.contact.addressLabel}</div>
                    <div className="text-slate-600 mt-0.5">{t.contact.addressValue}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#F28C28] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <div className="font-bold text-[#0B2545]">{t.contact.phoneLabelInfo}</div>
                    <a
                      href={`tel:${COMPANY_CONFIG.phoneDisplay.replace(/\s+/g, '')}`}
                      dir="ltr"
                      className="text-slate-600 hover:text-[#0B2545] tabular-nums block mt-0.5"
                    >
                      {COMPANY_CONFIG.phoneDisplay}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#F28C28] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <div className="font-bold text-[#0B2545]">{t.contact.emailLabelInfo}</div>
                    <a
                      href={`mailto:${COMPANY_CONFIG.email}`}
                      className="text-slate-600 hover:text-[#0B2545] block mt-0.5"
                    >
                      {COMPANY_CONFIG.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#F28C28] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <div className="font-bold text-[#0B2545]">{t.contact.hoursLabel}</div>
                    <div className="text-slate-600 mt-0.5">{t.contact.hoursValue}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <a
                href={getWhatsAppLink(t.whatsapp.defaultMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-bold transition-colors"
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                <span>{t.contact.whatsappLabelInfo}</span>
              </a>
              <a
                href={COMPANY_CONFIG.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#0B2545] hover:bg-[#133B6D] text-white text-sm font-bold transition-colors"
              >
                <Send className="w-4 h-4 text-[#F28C28]" aria-hidden="true" />
                <span>{t.contact.telegramLabelInfo}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Embedded Google Map (Al-Minya, Egypt) */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
            <h2 className="text-base font-bold text-[#0B2545]">{t.contact.mapTitle}</h2>
            <a
              href={COMPANY_CONFIG.mapExternalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-[#F28C28] hover:underline"
            >
              {t.contact.openInMaps}
            </a>
          </div>
          <div className="w-full h-[360px] bg-slate-100">
            <iframe
              title={t.contact.mapTitle}
              src={COMPANY_CONFIG.mapEmbedUrl}
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
