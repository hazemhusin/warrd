import React, { useCallback, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import {
  Download,
  Edit3,
  LogOut,
  Plus,
  RefreshCw,
  Shield,
  Trash2,
} from 'lucide-react';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import { COMPANY_CONFIG } from '../config/company.ts';
import { useApp } from '../context/AppContext.tsx';
import type { ProductItem } from './ProductsPage.tsx';

interface OverviewStats {
  adminEmail: string;
  newQuotes: number;
  totalQuotes: number;
  activeShipments: number;
  deliveredShipments: number;
  totalProducts: number;
  totalMessages: number;
}

interface QuoteRecord {
  id: number;
  referenceCode: string;
  serviceType: string;
  goodsDescription: string;
  originCountry: string;
  portOfEntry: string;
  quantity: string;
  contactName: string;
  companyName: string | null;
  phone: string;
  email: string;
  notes: string | null;
  attachmentName: string | null;
  status: string;
  emailNotificationStatus: string;
  createdAt: string;
}

interface ShipmentRecord {
  id: number;
  trackingNumber: string;
  clientName: string;
  clientPhone: string | null;
  originCountry: string;
  port: string;
  destination: string;
  cargoTypeAr: string;
  cargoTypeEn: string;
  containerOrBill: string | null;
  status: string;
  notesAr: string | null;
  notesEn: string | null;
  estimatedDelivery: string | null;
  updatedAt: string;
}

interface ContactMessageRecord {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  subject: string;
  message: string;
  createdAt: string;
}

export function AdminPage() {
  const { t, lang, navigate } = useApp();
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState('');

  const [tab, setTab] = useState<'quotes' | 'shipments' | 'products' | 'messages'>('quotes');
  const [loading, setLoading] = useState(false);
  const [dataError, setDataError] = useState('');

  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [shipments, setShipments] = useState<ShipmentRecord[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [messages, setMessages] = useState<ContactMessageRecord[]>([]);

  // Shipment Form State
  const [showShipmentForm, setShowShipmentForm] = useState(false);
  const [editingShipmentId, setEditingShipmentId] = useState<number | null>(null);
  const [shipForm, setShipForm] = useState({
    trackingNumber: '',
    clientName: '',
    clientPhone: '',
    originCountry: '',
    port: 'Alexandria Port',
    destination: 'Al-Minya',
    cargoTypeAr: '',
    cargoTypeEn: '',
    containerOrBill: '',
    status: 'documents_received',
    notesAr: '',
    notesEn: '',
    estimatedDelivery: '',
  });

  // Product Form State
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [prodForm, setProdForm] = useState({
    sku: '',
    nameAr: '',
    nameEn: '',
    category: 'fragile',
    sizeLabel: '',
    sizeGroup: 'medium',
    thicknessMicrons: 65,
    useCasesAr: '',
    useCasesEn: '',
    imageUrl: COMPANY_CONFIG.images.airColumnBags as string,
    inStock: true,
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  const authFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      if (!user) throw new Error('Not authenticated');
      const token = await user.getIdToken();
      const headers = new Headers(options.headers);
      headers.set('Authorization', `Bearer ${token}`);
      if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }
      const res = await fetch(url, { ...options, headers });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `Request failed (${res.status})`);
      }
      return res;
    },
    [user]
  );

  const loadAllData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setDataError('');
    try {
      const [ovRes, qRes, sRes, pRes, mRes] = await Promise.all([
        authFetch('/api/admin/overview'),
        authFetch('/api/admin/quotes'),
        authFetch('/api/admin/shipments'),
        fetch('/api/products'),
        authFetch('/api/admin/messages'),
      ]);
      setOverview(await ovRes.json());
      setQuotes(await qRes.json());
      setShipments(await sRes.json());
      setProducts(await pRes.json());
      setMessages(await mRes.json());
    } catch (err) {
      setDataError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user, authFetch]);

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user, loadAllData]);

  const handleSignIn = async () => {
    setAuthError('');
    setSigningIn(true);
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const handleQuoteStatusChange = async (id: number, status: string) => {
    try {
      await authFetch(`/api/admin/quotes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      await loadAllData();
    } catch (err) {
      setDataError(err instanceof Error ? err.message : 'Failed to update quote');
    }
  };

  const handleDownloadAttachment = async (quoteId: number, filename: string) => {
    try {
      const res = await authFetch(`/api/admin/quotes/${quoteId}/attachment`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setDataError(err instanceof Error ? err.message : 'Failed to download attachment');
    }
  };

  const openNewShipment = () => {
    setEditingShipmentId(null);
    setShipForm({
      trackingNumber: `WRD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      clientName: '',
      clientPhone: '',
      originCountry: '',
      port: 'Alexandria Port',
      destination: 'Al-Minya',
      cargoTypeAr: '',
      cargoTypeEn: '',
      containerOrBill: '',
      status: 'documents_received',
      notesAr: '',
      notesEn: '',
      estimatedDelivery: '',
    });
    setShowShipmentForm(true);
  };

  const openEditShipment = (s: ShipmentRecord) => {
    setEditingShipmentId(s.id);
    setShipForm({
      trackingNumber: s.trackingNumber,
      clientName: s.clientName,
      clientPhone: s.clientPhone || '',
      originCountry: s.originCountry,
      port: s.port,
      destination: s.destination,
      cargoTypeAr: s.cargoTypeAr,
      cargoTypeEn: s.cargoTypeEn,
      containerOrBill: s.containerOrBill || '',
      status: s.status,
      notesAr: s.notesAr || '',
      notesEn: s.notesEn || '',
      estimatedDelivery: s.estimatedDelivery || '',
    });
    setShowShipmentForm(true);
  };

  const saveShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingShipmentId) {
        await authFetch(`/api/admin/shipments/${editingShipmentId}`, {
          method: 'PATCH',
          body: JSON.stringify(shipForm),
        });
      } else {
        await authFetch('/api/admin/shipments', {
          method: 'POST',
          body: JSON.stringify(shipForm),
        });
      }
      setShowShipmentForm(false);
      await loadAllData();
    } catch (err) {
      setDataError(err instanceof Error ? err.message : 'Failed to save shipment');
    }
  };

  const handleQuickShipmentStatus = async (id: number, status: string) => {
    try {
      await authFetch(`/api/admin/shipments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      await loadAllData();
    } catch (err) {
      setDataError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const deleteShipment = async (id: number) => {
    try {
      await authFetch(`/api/admin/shipments/${id}`, { method: 'DELETE' });
      await loadAllData();
    } catch (err) {
      setDataError(err instanceof Error ? err.message : 'Failed to delete shipment');
    }
  };

  const openNewProduct = () => {
    setEditingProductId(null);
    setProdForm({
      sku: `WRD-ACB-${Math.floor(1000 + Math.random() * 9000)}`,
      nameAr: '',
      nameEn: '',
      category: 'fragile',
      sizeLabel: '',
      sizeGroup: 'medium',
      thicknessMicrons: 65,
      useCasesAr: '',
      useCasesEn: '',
      imageUrl: COMPANY_CONFIG.images.airColumnBags,
      inStock: true,
    });
    setShowProductForm(true);
  };

  const openEditProduct = (p: ProductItem) => {
    setEditingProductId(p.id);
    setProdForm({
      sku: p.sku,
      nameAr: p.nameAr,
      nameEn: p.nameEn,
      category: p.category,
      sizeLabel: p.sizeLabel,
      sizeGroup: p.sizeGroup,
      thicknessMicrons: p.thicknessMicrons,
      useCasesAr: p.useCasesAr,
      useCasesEn: p.useCasesEn,
      imageUrl: p.imageUrl,
      inStock: p.inStock,
    });
    setShowProductForm(true);
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProductId) {
        await authFetch(`/api/admin/products/${editingProductId}`, {
          method: 'PATCH',
          body: JSON.stringify(prodForm),
        });
      } else {
        await authFetch('/api/admin/products', {
          method: 'POST',
          body: JSON.stringify(prodForm),
        });
      }
      setShowProductForm(false);
      await loadAllData();
    } catch (err) {
      setDataError(err instanceof Error ? err.message : 'Failed to save product');
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      await authFetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      await loadAllData();
    } catch (err) {
      setDataError(err instanceof Error ? err.message : 'Failed to delete product');
    }
  };

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-6">
        <div className="text-sm font-semibold text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-5">
          <div className="w-12 h-12 rounded-xl bg-[#0B2545] text-[#F28C28] flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-[#0B2545]">{t.admin.signInTitle}</h1>
            <p className="text-sm text-slate-600 leading-relaxed">{t.admin.signInDesc}</p>
          </div>
          {authError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              {authError}
            </div>
          )}
          <button
            type="button"
            onClick={handleSignIn}
            disabled={signingIn}
            className="w-full py-3 px-5 rounded-xl bg-[#0B2545] hover:bg-[#133B6D] disabled:opacity-60 text-white text-sm font-bold transition-colors cursor-pointer"
          >
            {signingIn ? t.admin.signingIn : t.admin.signInButton}
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-xs font-semibold text-slate-500 hover:text-[#0B2545] cursor-pointer"
          >
            {t.admin.backToSite}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F5F7FA] min-h-screen">
      {/* Top Admin Header */}
      <div className="bg-[#0B2545] text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white">{t.admin.title}</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">{t.admin.subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-slate-300 font-mono-tabular">{user.email}</span>
            <button
              type="button"
              onClick={loadAllData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 text-xs font-semibold text-white hover:bg-white/10 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t.admin.signOut}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {dataError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {dataError}
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: t.admin.stats.newQuotes, value: overview?.newQuotes ?? 0 },
            { label: t.admin.stats.totalQuotes, value: overview?.totalQuotes ?? 0 },
            { label: t.admin.stats.activeShipments, value: overview?.activeShipments ?? 0 },
            { label: t.admin.stats.deliveredShipments, value: overview?.deliveredShipments ?? 0 },
            { label: t.admin.stats.products, value: overview?.totalProducts ?? 0 },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-xs text-slate-500">{stat.label}</div>
              <div className="text-2xl font-extrabold text-[#0B2545] tabular-nums mt-1">
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Section Tabs */}
        <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl">
          {(
            [
              { id: 'quotes', label: t.admin.tabs.quotes },
              { id: 'shipments', label: t.admin.tabs.shipments },
              { id: 'products', label: t.admin.tabs.products },
              { id: 'messages', label: t.admin.tabs.messages },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                tab === item.id
                  ? 'bg-[#0B2545] text-white'
                  : 'text-slate-600 hover:text-[#0B2545]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* TAB 1: Quote Requests */}
        {tab === 'quotes' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
            <table className="w-full text-sm text-start">
              <thead className="bg-[#F5F7FA] border-b border-slate-200 text-xs text-slate-600">
                <tr>
                  <th className="py-3 px-4 text-start font-semibold">{t.admin.quotes.ref}</th>
                  <th className="py-3 px-4 text-start font-semibold">{t.admin.quotes.client}</th>
                  <th className="py-3 px-4 text-start font-semibold">{t.admin.quotes.service}</th>
                  <th className="py-3 px-4 text-start font-semibold">{t.admin.quotes.route}</th>
                  <th className="py-3 px-4 text-start font-semibold">{t.admin.quotes.goods}</th>
                  <th className="py-3 px-4 text-start font-semibold">{t.admin.quotes.attachment}</th>
                  <th className="py-3 px-4 text-start font-semibold">{t.admin.quotes.status}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotes.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-mono-tabular font-bold text-[#0B2545] whitespace-nowrap">
                      {q.referenceCode}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#0B2545]">{q.contactName}</div>
                      <div className="text-xs text-slate-500 font-mono-tabular" dir="ltr">
                        {q.phone} · {q.email}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-700">
                      {t.quote.services[q.serviceType as keyof typeof t.quote.services] || q.serviceType}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      <div>{q.originCountry}</div>
                      <div className="text-slate-500">{q.portOfEntry}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-700 max-w-xs">
                      <div className="line-clamp-2">{q.goodsDescription}</div>
                      <div className="text-slate-500 mt-0.5">{q.quantity}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      {q.attachmentName ? (
                        <button
                          type="button"
                          onClick={() => handleDownloadAttachment(q.id, q.attachmentName!)}
                          className="inline-flex items-center gap-1 text-[#F28C28] hover:underline font-semibold cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{t.admin.quotes.download}</span>
                        </button>
                      ) : (
                        <span className="text-slate-400">{t.admin.quotes.noFile}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={q.status}
                        onChange={(e) => handleQuoteStatusChange(q.id, e.target.value)}
                        className="h-9 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-[#0B2545] bg-white focus:outline-none focus:border-[#F28C28]"
                      >
                        {Object.entries(t.admin.quotes.statuses).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: Shipments */}
        {tab === 'shipments' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={openNewShipment}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F28C28] hover:bg-[#d97719] text-white text-xs sm:text-sm font-bold cursor-pointer"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>{t.admin.shipments.addBtn}</span>
              </button>
            </div>

            {showShipmentForm && (
              <form
                onSubmit={saveShipment}
                className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input
                    required
                    placeholder={t.admin.shipments.trackingNo}
                    value={shipForm.trackingNumber}
                    onChange={(e) => setShipForm({ ...shipForm, trackingNumber: e.target.value })}
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-mono-tabular"
                  />
                  <input
                    required
                    placeholder={t.admin.shipments.clientName}
                    value={shipForm.clientName}
                    onChange={(e) => setShipForm({ ...shipForm, clientName: e.target.value })}
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                  />
                  <input
                    placeholder={t.admin.shipments.clientPhone}
                    value={shipForm.clientPhone}
                    onChange={(e) => setShipForm({ ...shipForm, clientPhone: e.target.value })}
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                  />
                  <input
                    required
                    placeholder={t.admin.shipments.origin}
                    value={shipForm.originCountry}
                    onChange={(e) => setShipForm({ ...shipForm, originCountry: e.target.value })}
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                  />
                  <input
                    required
                    placeholder={t.admin.shipments.port}
                    value={shipForm.port}
                    onChange={(e) => setShipForm({ ...shipForm, port: e.target.value })}
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                  />
                  <input
                    required
                    placeholder={t.admin.shipments.destination}
                    value={shipForm.destination}
                    onChange={(e) => setShipForm({ ...shipForm, destination: e.target.value })}
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                  />
                  <input
                    required
                    placeholder={t.admin.shipments.cargoAr}
                    value={shipForm.cargoTypeAr}
                    onChange={(e) => setShipForm({ ...shipForm, cargoTypeAr: e.target.value })}
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                  />
                  <input
                    required
                    placeholder={t.admin.shipments.cargoEn}
                    value={shipForm.cargoTypeEn}
                    onChange={(e) => setShipForm({ ...shipForm, cargoTypeEn: e.target.value })}
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                  />
                  <input
                    placeholder={t.admin.shipments.container}
                    value={shipForm.containerOrBill}
                    onChange={(e) => setShipForm({ ...shipForm, containerOrBill: e.target.value })}
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-mono-tabular"
                  />
                  <select
                    value={shipForm.status}
                    onChange={(e) => setShipForm({ ...shipForm, status: e.target.value })}
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm bg-white"
                  >
                    {t.track.stages.map((st) => (
                      <option key={st.key} value={st.key}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                  <input
                    placeholder={t.admin.shipments.eta}
                    value={shipForm.estimatedDelivery}
                    onChange={(e) => setShipForm({ ...shipForm, estimatedDelivery: e.target.value })}
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-mono-tabular"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    placeholder={t.admin.shipments.notesAr}
                    value={shipForm.notesAr}
                    onChange={(e) => setShipForm({ ...shipForm, notesAr: e.target.value })}
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                  />
                  <input
                    placeholder={t.admin.shipments.notesEn}
                    value={shipForm.notesEn}
                    onChange={(e) => setShipForm({ ...shipForm, notesEn: e.target.value })}
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#0B2545] text-white text-xs font-bold cursor-pointer"
                  >
                    {t.admin.shipments.saveBtn}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowShipmentForm(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 cursor-pointer"
                  >
                    {t.admin.shipments.cancelBtn}
                  </button>
                </div>
              </form>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
              <table className="w-full text-sm text-start">
                <thead className="bg-[#F5F7FA] border-b border-slate-200 text-xs text-slate-600">
                  <tr>
                    <th className="py-3 px-4 text-start font-semibold">{t.admin.shipments.trackingNo}</th>
                    <th className="py-3 px-4 text-start font-semibold">{t.admin.shipments.clientName}</th>
                    <th className="py-3 px-4 text-start font-semibold">{t.admin.shipments.port}</th>
                    <th className="py-3 px-4 text-start font-semibold">{t.admin.shipments.status}</th>
                    <th className="py-3 px-4 text-end font-semibold" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shipments.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 font-mono-tabular font-bold text-[#0B2545]">
                        {s.trackingNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#0B2545]">{s.clientName}</div>
                        <div className="text-xs text-slate-500">
                          {lang === 'ar' ? s.cargoTypeAr : s.cargoTypeEn}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {s.port} → {s.destination}
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={s.status}
                          onChange={(e) => handleQuickShipmentStatus(s.id, e.target.value)}
                          className="h-9 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-[#0B2545] bg-white"
                        >
                          {t.track.stages.map((st) => (
                            <option key={st.key} value={st.key}>
                              {st.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-end whitespace-nowrap space-x-2">
                        <button
                          type="button"
                          onClick={() => openEditShipment(s)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-[#0B2545] hover:bg-slate-100 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{t.admin.shipments.editBtn}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteShipment(s.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 text-xs font-semibold text-red-700 hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Products Catalog */}
        {tab === 'products' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={openNewProduct}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F28C28] hover:bg-[#d97719] text-white text-xs sm:text-sm font-bold cursor-pointer"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>{t.admin.products.addBtn}</span>
              </button>
            </div>

            {showProductForm && (
              <form
                onSubmit={saveProduct}
                className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input
                    required
                    placeholder={t.admin.products.sku}
                    value={prodForm.sku}
                    onChange={(e) => setProdForm({ ...prodForm, sku: e.target.value })}
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-mono-tabular"
                  />
                  <input
                    required
                    placeholder={t.admin.products.nameAr}
                    value={prodForm.nameAr}
                    onChange={(e) => setProdForm({ ...prodForm, nameAr: e.target.value })}
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                  />
                  <input
                    required
                    placeholder={t.admin.products.nameEn}
                    value={prodForm.nameEn}
                    onChange={(e) => setProdForm({ ...prodForm, nameEn: e.target.value })}
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                  />
                  <select
                    value={prodForm.category}
                    onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm bg-white"
                  >
                    <option value="bottle">{t.products.types.bottle}</option>
                    <option value="electronics">{t.products.types.electronics}</option>
                    <option value="fragile">{t.products.types.fragile}</option>
                    <option value="rolls">{t.products.types.rolls}</option>
                    <option value="bubble_wrap">{t.products.types.bubble_wrap}</option>
                  </select>
                  <input
                    required
                    placeholder={t.admin.products.sizeLabel}
                    value={prodForm.sizeLabel}
                    onChange={(e) => setProdForm({ ...prodForm, sizeLabel: e.target.value })}
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                  />
                  <select
                    value={prodForm.sizeGroup}
                    onChange={(e) => setProdForm({ ...prodForm, sizeGroup: e.target.value })}
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm bg-white"
                  >
                    <option value="small">{t.products.sizes.small}</option>
                    <option value="medium">{t.products.sizes.medium}</option>
                    <option value="large">{t.products.sizes.large}</option>
                    <option value="roll">{t.products.sizes.roll}</option>
                  </select>
                  <input
                    type="number"
                    required
                    placeholder={t.admin.products.thickness}
                    value={prodForm.thicknessMicrons}
                    onChange={(e) =>
                      setProdForm({ ...prodForm, thicknessMicrons: Number(e.target.value) })
                    }
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm tabular-nums"
                  />
                  <input
                    required
                    placeholder={t.admin.products.useCasesAr}
                    value={prodForm.useCasesAr}
                    onChange={(e) => setProdForm({ ...prodForm, useCasesAr: e.target.value })}
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                  />
                  <input
                    required
                    placeholder={t.admin.products.useCasesEn}
                    value={prodForm.useCasesEn}
                    onChange={(e) => setProdForm({ ...prodForm, useCasesEn: e.target.value })}
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                  />
                </div>
                <label className="inline-flex items-center gap-2 text-sm font-medium text-[#0B2545]">
                  <input
                    type="checkbox"
                    checked={prodForm.inStock}
                    onChange={(e) => setProdForm({ ...prodForm, inStock: e.target.checked })}
                  />
                  <span>{t.admin.products.inStock}</span>
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#0B2545] text-white text-xs font-bold cursor-pointer"
                  >
                    {t.admin.products.saveBtn}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProductForm(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 cursor-pointer"
                  >
                    {t.admin.products.cancelBtn}
                  </button>
                </div>
              </form>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
              <table className="w-full text-sm text-start">
                <thead className="bg-[#F5F7FA] border-b border-slate-200 text-xs text-slate-600">
                  <tr>
                    <th className="py-3 px-4 text-start font-semibold">{t.admin.products.sku}</th>
                    <th className="py-3 px-4 text-start font-semibold">{t.admin.products.nameAr}</th>
                    <th className="py-3 px-4 text-start font-semibold">{t.admin.products.sizeLabel}</th>
                    <th className="py-3 px-4 text-start font-semibold">{t.admin.products.inStock}</th>
                    <th className="py-3 px-4 text-end font-semibold" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 font-mono-tabular font-bold text-[#0B2545]">
                        {p.sku}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#0B2545]">
                          {lang === 'ar' ? p.nameAr : p.nameEn}
                        </div>
                        <div className="text-xs text-slate-500">
                          {p.thicknessMicrons} {t.products.thicknessUnit}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs tabular-nums text-slate-600">
                        {p.sizeLabel}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold">
                        {p.inStock ? (
                          <span className="text-[#16A34A]">{t.products.inStock}</span>
                        ) : (
                          <span className="text-amber-700">{t.products.outOfStock}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-end whitespace-nowrap space-x-2">
                        <button
                          type="button"
                          onClick={() => openEditProduct(p)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-[#0B2545] hover:bg-slate-100 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{t.admin.products.editBtn}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteProduct(p.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 text-xs font-semibold text-red-700 hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: Contact Messages */}
        {tab === 'messages' && (
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
            {messages.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">—</div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className="p-5 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-bold text-[#0B2545]">{m.subject}</span>
                    <span className="text-xs font-mono-tabular text-slate-500" dir="ltr">
                      {m.name} · {m.phone}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{m.message}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
