import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp, Sparkles, ShoppingBag, ShieldAlert, Search, RefreshCw, X } from 'lucide-react';
import Navbar from './components/Navbar';
import LoadingScreen from './components/LoadingScreen';
import HomeSection from './components/HomeSection';
import CheckoutFlow from './components/CheckoutFlow';
import SuccessSection from './components/SuccessSection';
import DashboardUser from './components/DashboardUser';
import DashboardAdmin from './components/DashboardAdmin';
import { Order, Testimonial } from './types';

export default function App() {
  const [showLoading, setShowLoading] = useState(true);
  const [activeView, setActiveView] = useState<'home' | 'search' | 'admin'>('home');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Dynamic values loaded from API
  const [price, setPrice] = useState(149000);
  const [bannerUrl, setBannerUrl] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop');
  const [bannerTitle, setBannerTitle] = useState('Alight Motion Premium 1 Tahun');
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // Back to top visible state
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Simple clean toast manager state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch store settings on mount
  const fetchSettings = async () => {
    try {
      setIsLoadingSettings(true);
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setPrice(data.price || 149000);
        setBannerUrl(data.bannerUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop');
        setBannerTitle(data.bannerTitle || 'Alight Motion Premium 1 Tahun');
        setTestimonials(data.testimonials || []);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  useEffect(() => {
    fetchSettings();

    // Monitor scroll for back to top button
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#050505] text-[#f3f4f6] overflow-hidden" id="main-applet-container">
      {/* Background Mesh Gradients */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-neon rounded-full mix-blend-screen filter blur-[150px] opacity-20 pointer-events-none z-0"></div>
      <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-blue-600 rounded-full mix-blend-screen filter blur-[150px] opacity-10 pointer-events-none z-0"></div>
      
      {/* 1. Loader Gate */}
      <AnimatePresence>
        {showLoading && (
          <LoadingScreen onComplete={() => setShowLoading(false)} />
        )}
      </AnimatePresence>

      {!showLoading && (
        <div className="flex-1 flex flex-col relative z-10">
          {/* 2. Navigation Header */}
          <Navbar 
            activeView={activeView} 
            onViewChange={(view) => {
              setActiveView(view);
              setCompletedOrder(null);
              setIsCheckoutOpen(false);
              scrollToTop();
            }}
            onCheckoutClick={() => {
              setIsCheckoutOpen(true);
              setCompletedOrder(null);
              scrollToTop();
            }}
          />

          {/* 3. Main Workspace Display */}
          <main className="flex-1 w-full">
            <AnimatePresence mode="wait">
              {/* Checkout Modal / Dedicated Form Overlay */}
              {isCheckoutOpen ? (
                <motion.div
                  key="checkout-view"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                >
                  {completedOrder ? (
                    <SuccessSection 
                      order={completedOrder} 
                      onContinueShopping={() => {
                        setCompletedOrder(null);
                        setIsCheckoutOpen(false);
                        setActiveView('home');
                        scrollToTop();
                      }}
                    />
                  ) : (
                    <CheckoutFlow 
                      price={price} 
                      onSuccess={(order) => {
                        setCompletedOrder(order);
                        triggerToast('Aktivasi premium berhasil! Pembayaran lunas.', 'success');
                      }}
                      onCancel={() => {
                        setIsCheckoutOpen(false);
                        setActiveView('home');
                        scrollToTop();
                      }}
                    />
                  )}
                </motion.div>
              ) : (
                /* Standard Routing Views */
                <div className="w-full">
                  {activeView === 'home' && (
                    <motion.div
                      key="home-view"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {isLoadingSettings ? (
                        /* Loading Skeletons */
                        <div className="max-w-4xl mx-auto px-4 py-20 space-y-8 animate-pulse text-center">
                          <div className="h-6 bg-white/5 w-48 rounded mx-auto"></div>
                          <div className="h-10 bg-white/5 w-96 rounded mx-auto"></div>
                          <div className="h-40 bg-white/5 rounded-2xl"></div>
                        </div>
                      ) : (
                        <HomeSection 
                          price={price}
                          bannerUrl={bannerUrl}
                          bannerTitle={bannerTitle}
                          testimonials={testimonials}
                          onCheckoutClick={() => {
                            setIsCheckoutOpen(true);
                            scrollToTop();
                          }}
                          isLoadingSettings={isLoadingSettings}
                        />
                      )}
                    </motion.div>
                  )}

                  {activeView === 'search' && (
                    <motion.div
                      key="search-view"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <DashboardUser />
                    </motion.div>
                  )}

                  {activeView === 'admin' && (
                    <motion.div
                      key="admin-view"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <DashboardAdmin onSettingsUpdated={fetchSettings} />
                    </motion.div>
                  )}
                </div>
              )}
            </AnimatePresence>
          </main>

          {/* 4. Global Float Back To Top button */}
          <AnimatePresence>
            {showBackToTop && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={scrollToTop}
                className="fixed bottom-6 right-6 z-40 bg-neon hover:bg-neon-dim text-black p-3.5 rounded-full shadow-[0_0_20px_rgba(0,255,102,0.4)] cursor-pointer transition-colors"
                id="back-to-top-button"
                title="Kembali ke Atas"
              >
                <ArrowUp className="w-5 h-5 font-bold" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* 5. Global Toast Notification Alerts */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className={`fixed bottom-6 left-6 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-xl border font-bold text-xs shadow-2xl ${
                  toast.type === 'success'
                    ? 'bg-black/90 border-[#00ff66]/30 text-neon shadow-[0_0_20px_rgba(0,255,102,0.15)]'
                    : 'bg-black/90 border-red-500/30 text-red-400'
                }`}
              >
                <Sparkles className="w-4.5 h-4.5" />
                <span>{toast.message}</span>
                <button onClick={() => setToast(null)} className="ml-2 hover:opacity-80">
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
