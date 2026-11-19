import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock, Package, Search } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { SafeImage } from '../components/SafeImage.tsx';

export interface ProductItem {
  id: number;
  sku: string;
  nameAr: string;
  nameEn: string;
  category: string;
  sizeLabel: string;
  sizeGroup: string;
  thicknessMicrons: number;
  useCasesAr: string;
  useCasesEn: string;
  descriptionAr: string;
  descriptionEn: string;
  imageUrl: string;
  inStock: boolean;
}

export function ProductsPage() {
  const { t, lang, navigate } = useApp();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSize, setSelectedSize] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let active = true;
    async function loadProducts() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Failed to load catalog');
        const data = await res.json();
        if (active) setProducts(data);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Error loading products');
      } finally {
        if (active) setLoading(false);
      }
    }
    loadProducts();
    return () => {
      active = false;
    };
  }, []);

  const typeOptions = [
    { id: 'all', label: t.products.types.all },
    { id: 'bottle', label: t.products.types.bottle },
    { id: 'electronics', label: t.products.types.electronics },
    { id: 'fragile', label: t.products.types.fragile },
    { id: 'rolls', label: t.products.types.rolls },
    { id: 'bubble_wrap', label: t.products.types.bubble_wrap },
  ];

  const sizeOptions = [
    { id: 'all', label: t.products.sizes.all },
    { id: 'small', label: t.products.sizes.small },
    { id: 'medium', label: t.products.sizes.medium },
    { id: 'large', label: t.products.sizes.large },
    { id: 'roll', label: t.products.sizes.roll },
  ];

  const filtered = products.filter((p) => {
    if (selectedType !== 'all' && p.category !== selectedType) return false;
    if (selectedSize !== 'all' && p.sizeGroup !== selectedSize) return false;
    if (searchTerm.trim()) {
      const needle = searchTerm.trim().toLowerCase();
      const hay = `${p.nameAr} ${p.nameEn} ${p.sku} ${p.useCasesAr} ${p.useCasesEn} ${p.sizeLabel}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  });

  const handleRequestPrice = (item: ProductItem) => {
    const productTitle = lang === 'ar' ? item.nameAr : item.nameEn;
    navigate(
      `/quote?service=packaging_supply&product=${encodeURIComponent(`${productTitle} (${item.sku})`)}`
    );
  };

  return (
    <div className="bg-[#F5F7FA] min-h-screen">
      {/* Page Header */}
      <section className="bg-[#0B2545] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white text-balance">
            {t.products.pageTitle}
          </h1>
          <p className="text-base text-slate-300 max-w-2xl leading-relaxed">
            {t.products.pageSubtitle}
          </p>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search
                className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${
                  lang === 'ar' ? 'right-3.5' : 'left-3.5'
                }`}
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.products.searchPlaceholder}
                className={`w-full h-10 rounded-xl border border-slate-200 text-sm text-[#0B2545] placeholder:text-slate-400 focus:outline-none focus:border-[#F28C28] ${
                  lang === 'ar' ? 'pr-10 pl-3' : 'pl-10 pr-3'
                }`}
              />
            </div>

            {/* Size Segmented Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">
                {t.products.filterSizeLabel}:
              </span>
              <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl">
                {sizeOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedSize(opt.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      selectedSize === opt.id
                        ? 'bg-white text-[#0B2545] shadow-sm'
                        : 'text-slate-600 hover:text-[#0B2545]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Type Filter Row */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500">
              {t.products.filterTypeLabel}:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {typeOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedType(opt.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    selectedType === opt.id
                      ? 'bg-[#0B2545] text-white border-[#0B2545]'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse"
                >
                  <div className="aspect-[4/3] bg-slate-200" />
                  <div className="p-6 space-y-3">
                    <div className="h-3 bg-slate-200 rounded w-1/3" />
                    <div className="h-5 bg-slate-200 rounded w-3/4" />
                    <div className="h-4 bg-slate-200 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl border border-red-200 p-8 text-center text-sm text-red-700">
              {error}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <Package className="w-10 h-10 text-slate-400 mx-auto" aria-hidden="true" />
              <h2 className="text-lg font-bold text-[#0B2545]">{t.products.emptyTitle}</h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto">{t.products.emptyDesc}</p>
              <button
                type="button"
                onClick={() => navigate('/quote?service=packaging_supply')}
                className="mt-2 inline-flex items-center px-5 py-2.5 rounded-xl bg-[#F28C28] text-white text-sm font-bold hover:bg-[#d97719] transition-colors cursor-pointer"
              >
                {t.products.customSizeCta}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((item) => {
                const name = lang === 'ar' ? item.nameAr : item.nameEn;
                const useCases = lang === 'ar' ? item.useCasesAr : item.useCasesEn;
                const description = lang === 'ar' ? item.descriptionAr : item.descriptionEn;

                return (
                  <article
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-[4/3] bg-slate-100 overflow-hidden border-b border-slate-100">
                        <SafeImage
                          src={item.imageUrl}
                          alt={name}
                          fallbackTitle={name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="p-6 space-y-3">
                        {/* Unboxed typographic metadata */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 tabular-nums">
                          <span className="font-mono-tabular font-semibold text-[#0B2545]">
                            {item.sku}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{item.sizeLabel}</span>
                          <span aria-hidden="true">·</span>
                          <span>
                            {item.thicknessMicrons} {t.products.thicknessUnit}
                          </span>
                        </div>

                        <h2 className="text-lg font-bold text-[#0B2545]">{name}</h2>

                        <p className="text-sm text-slate-600 leading-relaxed">{description}</p>

                        <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 leading-relaxed">
                          <span className="font-semibold text-[#0B2545]">
                            {t.products.useCasesLabel}{' '}
                          </span>
                          {useCases}
                        </div>
                      </div>
                    </div>

                    <div className="px-6 pb-6 pt-3 flex items-center justify-between gap-3 border-t border-slate-100">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                          item.inStock ? 'text-[#16A34A]' : 'text-amber-700'
                        }`}
                      >
                        {item.inStock ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                        ) : (
                          <Clock className="w-4 h-4 shrink-0" aria-hidden="true" />
                        )}
                        <span>{item.inStock ? t.products.inStock : t.products.outOfStock}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRequestPrice(item)}
                        className="px-4 py-2 rounded-xl bg-[#F28C28] hover:bg-[#d97719] text-white text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        {t.products.requestPrice}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
