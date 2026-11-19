export const COMPANY_CONFIG = {
  whatsappNumber: '201096554798',
  phoneDisplay: '+20 109 655 4798',
  telegramUrl: 'https://t.me/+201096554798',
  // TODO: replace with your secondary landline or office phone if applicable
  officePhone: '+20 109 655 4798',
  // TODO: replace with your official Wardly business email
  email: 'info@wardly.eg',
  // TODO: replace with your exact Al-Minya office coordinates for Google Maps embed
  mapEmbedUrl: 'https://maps.google.com/maps?q=Minya,Egypt&t=&z=13&ie=UTF8&iwloc=&output=embed',
  mapExternalUrl: 'https://www.google.com/maps/search/?api=1&query=Al-Minya,Egypt',
  // TODO: replace with your custom photography if needed
  images: {
    heroPort: '/src/assets/images/hero_port_logistics_1795089453031.jpg',
    customsDesk: '/src/assets/images/service_customs_clearance_1795089456375.jpg',
    cargoInspection: '/src/assets/images/service_cargo_inspection_1795089455588.jpg',
    airColumnBags: '/src/assets/images/product_air_column_bags_1795089455256.jpg',
    protectivePackaging: '/src/assets/images/product_protective_packaging_1795089455189.jpg',
  },
} as const;

export function getWhatsAppLink(message?: string): string {
  const base = `https://wa.me/${COMPANY_CONFIG.whatsappNumber}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}
