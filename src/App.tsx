/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { WhatsAppFloat } from './components/WhatsAppFloat.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { ServicesPage } from './pages/ServicesPage.tsx';
import { ProductsPage } from './pages/ProductsPage.tsx';
import { QuotePage } from './pages/QuotePage.tsx';
import { TrackPage } from './pages/TrackPage.tsx';
import { AboutPage } from './pages/AboutPage.tsx';
import { FaqPage } from './pages/FaqPage.tsx';
import { ContactPage } from './pages/ContactPage.tsx';
import { AdminPage } from './pages/AdminPage.tsx';

function RouterView() {
  const { route } = useApp();

  switch (route) {
    case '/services':
      return <ServicesPage />;
    case '/products':
      return <ProductsPage />;
    case '/quote':
      return <QuotePage />;
    case '/track':
      return <TrackPage />;
    case '/about':
      return <AboutPage />;
    case '/faq':
      return <FaqPage />;
    case '/contact':
      return <ContactPage />;
    case '/admin':
      return <AdminPage />;
    default:
      return <HomePage />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col bg-[#F5F7FA] text-[#0B2545]">
        <Navbar />
        <main className="flex-1">
          <RouterView />
        </main>
        <Footer />
        <WhatsAppFloat />
      </div>
    </AppProvider>
  );
}
