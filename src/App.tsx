import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp, Sparkles, ShoppingBag, ShieldAlert, Search, RefreshCw, X, WifiOff, Download, Smartphone } from 'lucide-react';
import Navbar from './components/Navbar';
import LoadingScreen from './components/LoadingScreen';
import HomeSection from './components/HomeSection';
import CheckoutFlow from './components/CheckoutFlow';
import SuccessSection from './components/SuccessSection';
import DashboardUser from './components/DashboardUser';
import DashboardAdmin from './components/DashboardAdmin';
import { Order, Testimonial } from './types';
import { safeFetchJson } from './utils/drive';

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
  const [whatsapp, setWhatsapp] = useState('');
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // Back to top visible state
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Simple clean toast manager state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // PWA states
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch store settings on mount
  const fetchSettings = async () => {
    try {
      setIsLoadingSettings(true);
      const data = await safeFetchJson<any>('/api/settings');
      setPrice(data.price || 149000);
      setBannerUrl(data.bannerUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop');
      setBannerTitle(data.bannerTitle || 'Alight Motion Premium 1 Tahun');
      setTestimonials(data.testimonials || []);
      setWhatsapp(data.whatsapp || '6282114757375');
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

    // Detect iOS & Standalone
    const iosDetection = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iosDetection);

    const standaloneDetection = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(!!standaloneDetection);

    // Show install banner after short delay if not standalone and not dismissed
    const isDismissed = localStorage.getItem('r8_pwa_install_dismissed');
    if (!standaloneDetection && !isDismissed) {
      setTimeout(() => {
        setShowInstallBanner(true);
      }, 4000);
    }

    // Network status listeners
    const handleOnline = () => {
      setIsOnline(true);
      triggerToast('Koneksi internet Anda telah kembali!', 'success');
      fetchSettings();
    };
    const handleOffline = () => {
      setIsOnline(false);
      triggerToast('Koneksi internet Anda terputus!', 'error');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // PWA install listener
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!standaloneDetection && !isDismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('User response to install prompt:', outcome);
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    } else if (isIOS) {
      triggerToast('Ketuk tombol Share 📤 lalu pilih "Tambah ke Layar Utama" ➕ di Safari', 'success');
    }
  };

  const dismissInstallBanner = () => {
    setShowInstallBanner(false);
    localStorage.setItem('r8_pwa_install_dismissed', 'true');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render beautiful offline page when offline
  if (!isOnline) {
    return (
      <div className="relative min-h-screen flex flex-col justify-center items-center bg-[#050505] text-[#f3f4f6] px-4" id="offline-container">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-red-600 rounded-full mix-blend-screen filter blur-[150px] opacity-15"></div>
          <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-blue-600 rounded-full mix-blend-screen filter blur-[150px] opacity-5"></div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[#0d0d0d] border border-white/10 p-8 rounded-3xl text-center space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative z-10 overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-[45%] bg-gradient-to-b from-white/[0.03] to-transparent rounded-t-3xl pointer-events-none" />
          
          <div className="mx-auto w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.15)] relative">
            <WifiOff className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight text-white font-mono uppercase">Tidak ada koneksi internet</h2>
            <p className="text-sm text-white/50 leading-relaxed font-sans">
              Koneksi internet Anda terputus. Silakan periksa jaringan Wi-Fi atau data seluler Anda dan coba lagi.
            </p>
          </div>

          <button
            onClick={() => {
              if (navigator.onLine) {
                setIsOnline(true);
                fetchSettings();
                triggerToast('Kembali online!', 'success');
              } else {
                triggerToast('Masih offline. Silakan periksa koneksi Anda!', 'error');
              }
            }}
            className="w-full bg-neon hover:bg-neon-dim text-black font-extrabold py-3.5 px-6 rounded-xl shadow-[0_4px_16px_rgba(0,255,102,0.3)] hover:shadow-[0_8px_24px_rgba(0,255,102,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 font-mono uppercase text-xs tracking-wider"
          >
            <RefreshCw className="w-4 h-4 animate-spin-slow" />
            <span>Coba Lagi</span>
          </button>
        </motion.div>
        
        {/* Toast alerts for offline state */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-6 left-6 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-xl border border-red-500/30 bg-black/90 text-red-400 font-bold text-xs shadow-2xl"
            >
              <ShieldAlert className="w-4.5 h-4.5" />
              <span>{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

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
                      whatsapp={whatsapp}
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

          {/* 4.5 Floating Install Button (Bottom Left) */}
          <AnimatePresence>
            {!isStandalone && (deferredPrompt || isIOS) && !showInstallBanner && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setShowInstallBanner(true)}
                className="fixed bottom-6 left-6 z-40 bg-[#00ff66] hover:bg-[#00e65c] text-black font-extrabold py-3 px-4 sm:px-5 rounded-full shadow-[0_0_20px_rgba(0,255,102,0.4)] cursor-pointer transition-colors flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider"
                id="floating-pwa-install-button"
                title="Instal Aplikasi R8 Store"
              >
                <Download className="w-4 h-4 font-bold" />
                <span>Instal App</span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* 4.6 Detailed PWA Install Banner */}
          <AnimatePresence>
            {showInstallBanner && !isStandalone && (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.95 }}
                className="fixed bottom-24 left-6 right-6 sm:left-6 sm:right-auto sm:w-[360px] z-50 bg-[#0d0d0d]/95 border border-white/10 p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(0,255,102,0.15)] flex flex-col gap-4 overflow-hidden backdrop-blur-md"
              >
                {/* Glossy sheen */}
                <div className="absolute top-0 left-0 right-0 h-[40%] bg-gradient-to-b from-white/[0.03] to-transparent rounded-t-2xl pointer-events-none" />
                
                <div className="flex items-start gap-3 relative">
                  {/* Mini Logo */}
                  <img 
                    src="/icon-512.jpg" 
                    alt="R8 Store App" 
                    className="w-12 h-12 rounded-xl object-cover border border-white/10 shadow-lg flex-shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-extrabold text-white tracking-wide font-mono uppercase">Pasang R8 Store App</h3>
                    <p className="text-[11px] text-white/50 leading-normal mt-0.5 font-sans">
                      Akses cepat tanpa browser, hemat data, dan dukung penuh mode offline!
                    </p>
                  </div>
                  <button 
                    onClick={dismissInstallBanner}
                    className="text-white/40 hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {isIOS ? (
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-[10px] text-white/60 leading-relaxed font-sans space-y-1.5">
                    <div className="flex gap-2 items-center text-neon font-bold uppercase font-mono tracking-wider">
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Panduan Instal iPhone / iOS</span>
                    </div>
                    <p>
                      1. Tekan tombol <strong className="text-white">Bagikan (Share) 📤</strong> di menu Safari.
                    </p>
                    <p>
                      2. Geser dan pilih <strong className="text-white">"Tambah ke Layar Utama" (Add to Home Screen) ➕</strong>.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={dismissInstallBanner}
                      className="flex-1 bg-white/[0.05] hover:bg-white/[0.08] text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors cursor-pointer text-center font-mono uppercase tracking-wider"
                    >
                      Nanti Saja
                    </button>
                    <button
                      onClick={handleInstallApp}
                      className="flex-1 bg-neon hover:bg-neon-dim text-black text-xs font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(0,255,102,0.2)] font-mono uppercase tracking-wider"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Instal</span>
                    </button>
                  </div>
                )}
              </motion.div>
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
