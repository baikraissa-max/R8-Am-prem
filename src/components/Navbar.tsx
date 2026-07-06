import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Search, Sparkles, Compass } from 'lucide-react';

interface NavbarProps {
  activeView: 'home' | 'search' | 'admin';
  onViewChange: (view: 'home' | 'search' | 'admin') => void;
  onCheckoutClick: () => void;
}

export default function Navbar({ activeView, onViewChange, onCheckoutClick }: NavbarProps) {
  const [clickCount, setClickCount] = useState(0);

  const handleLogoClick = () => {
    // Navigate home on single click
    onViewChange('home');
    
    // Quick secret trigger: click logo 5 times to reveal admin panel
    setClickCount(prev => {
      const next = prev + 1;
      if (next >= 5) {
        onViewChange('admin');
        return 0;
      }
      return next;
    });

    // Reset click count after 3 seconds of inactivity
    const timer = setTimeout(() => {
      setClickCount(0);
    }, 3000);
    return () => clearTimeout(timer);
  };

  return (
    <div className="sticky top-4 z-50 w-full px-4 lg:px-8 pointer-events-none">
      <nav 
        className="max-w-4xl mx-auto w-full bg-black/40 backdrop-blur-3xl border border-white/10 rounded-full px-4 sm:px-6 py-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1.5px_2.5px_rgba(255,255,255,0.15),inset_0_-1px_1px_rgba(255,255,255,0.05)] relative flex items-center justify-between transition-all duration-300 pointer-events-auto overflow-hidden group"
        id="navbar-liquid-glass"
      >
        {/* Glossy top glass reflection highlight */}
        <div className="absolute top-0 left-0 right-0 h-[45%] bg-gradient-to-b from-white/[0.08] to-transparent rounded-t-full pointer-events-none" />
        
        {/* Ambient liquid glow behind navbar */}
        <div className="absolute -inset-10 bg-neon/5 rounded-full filter blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        {/* Brand Logo - Secrets Hidden Inside */}
        <div 
          onClick={handleLogoClick}
          onDoubleClick={() => onViewChange('admin')}
          className="flex items-center gap-2.5 cursor-pointer group/logo relative select-none"
          title="R8 Store (Klik 5x atau Double Click untuk Admin)"
          id="nav-logo"
        >
          {/* Liquid Glass Badge */}
          <div className="relative flex items-center justify-center bg-gradient-to-b from-white/10 to-white/[0.02] border border-white/20 rounded-xl w-9.5 h-9.5 transition-all duration-500 group-hover/logo:scale-105 group-hover/logo:border-neon/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_8px_16px_rgba(0,0,0,0.4)] overflow-hidden">
            {/* Slide shine overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/logo:translate-x-full transition-transform duration-1000" />
            <div className="absolute inset-0 bg-neon/10 opacity-0 group-hover/logo:opacity-100 transition-opacity duration-500" />
            <span className="text-lg font-black text-white tracking-tighter italic font-mono group-hover/logo:text-neon group-hover/logo:drop-shadow-[0_0_8px_rgba(0,255,102,0.6)] transition-all">R8</span>
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-[13px] font-black tracking-wider text-white group-hover/logo:text-neon transition-colors font-mono">
                R8 STORE
              </span>
              <div className="w-1 h-1 rounded-full bg-neon animate-pulse" />
            </div>
            <span className="text-[7.5px] font-extrabold text-white/35 tracking-[0.2em] uppercase -mt-1 select-none font-sans">
              ALIGHT MOTION
            </span>
          </div>
        </div>

        {/* Navigation Menu Buttons */}
        <div className="flex items-center gap-1 sm:gap-2 relative">
          {/* Main Storefront / Home */}
          <button
            onClick={() => onViewChange('home')}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 select-none z-10 cursor-pointer ${
              activeView === 'home' 
                ? 'text-black font-extrabold' 
                : 'text-white/60 hover:text-white'
            }`}
            id="nav-home"
          >
            {activeView === 'home' && (
              <motion.div 
                layoutId="active-pill" 
                transition={{ type: "spring", stiffness: 320, damping: 26 }}
                className="absolute inset-0 bg-neon rounded-full shadow-[0_2px_12px_rgba(0,255,102,0.35),inset_0_1px_1.5px_rgba(255,255,255,0.5)] z-[-1]"
              />
            )}
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-mono uppercase tracking-wider text-[10px]">Store</span>
          </button>

          {/* Search ID Transaction / Riwayat */}
          <button
            onClick={() => onViewChange('search')}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 select-none z-10 cursor-pointer ${
              activeView === 'search' 
                ? 'text-black font-extrabold' 
                : 'text-white/60 hover:text-white'
            }`}
            id="nav-search"
          >
            {activeView === 'search' && (
              <motion.div 
                layoutId="active-pill" 
                transition={{ type: "spring", stiffness: 320, damping: 26 }}
                className="absolute inset-0 bg-neon rounded-full shadow-[0_2px_12px_rgba(0,255,102,0.35),inset_0_1px_1.5px_rgba(255,255,255,0.5)] z-[-1]"
              />
            )}
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-mono uppercase tracking-wider text-[10px]">Cari Pesanan</span>
          </button>

          {/* Secret indicator when admin is active */}
          {activeView === 'admin' && (
            <button
              onClick={() => onViewChange('admin')}
              className="relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 select-none z-10 cursor-pointer text-black font-extrabold"
              id="nav-admin"
            >
              <motion.div 
                layoutId="active-pill" 
                transition={{ type: "spring", stiffness: 320, damping: 26 }}
                className="absolute inset-0 bg-red-400 rounded-full shadow-[0_2px_12px_rgba(248,113,113,0.35),inset_0_1px_1.5px_rgba(255,255,255,0.5)] z-[-1]"
              />
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-mono uppercase tracking-wider text-[10px]">Admin Panel</span>
            </button>
          )}

          {/* Split divider */}
          <div className="w-[1px] h-4 bg-white/10 mx-1 sm:mx-1.5" />

          {/* Premium "Beli" Highlight Call To Action (Liquid glass CTA) */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCheckoutClick}
            className="relative flex items-center gap-1.5 bg-gradient-to-r from-[#00ff66] to-[#00ffcc] text-black font-extrabold text-[10px] uppercase font-mono tracking-widest px-4 py-2 rounded-full cursor-pointer transition-colors shadow-[0_4px_16px_rgba(0,255,102,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)] hover:shadow-[0_8px_24px_rgba(0,255,102,0.5)] overflow-hidden"
            id="nav-cta"
          >
            {/* Reflective top gloss glare on CTA */}
            <div className="absolute top-0 left-0 right-0 h-[40%] bg-white/25 rounded-t-full pointer-events-none" />
            <Sparkles className="w-3.5 h-3.5 text-black" />
            <span className="hidden xs:inline">Order Now</span>
          </motion.button>
        </div>
      </nav>
    </div>
  );
}
