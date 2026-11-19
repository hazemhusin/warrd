import React from 'react';
import { Package } from 'lucide-react';

interface BrandLogoProps {
  variant?: 'light' | 'dark';
  onClick?: () => void;
}

/**
 * Easy-to-replace Brand Logo component.
 * TODO: replace the <Package /> icon with your custom SVG or <img> logo anytime.
 */
export function BrandLogo({ variant = 'dark', onClick }: BrandLogoProps) {
  const isLight = variant === 'light';

  return (
    <a
      href="/"
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F28C28] rounded-md ${
        isLight ? 'text-white' : 'text-[#0B2545]'
      }`}
    >
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#F28C28] text-white shrink-0">
        <Package className="w-4 h-4" strokeWidth={2.2} aria-hidden="true" />
      </span>
      <span className="text-lg font-bold tracking-tight whitespace-nowrap shrink-0">
        وَردلي | Wardly
      </span>
    </a>
  );
}
