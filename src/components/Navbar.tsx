import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Search, ShieldAlert, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeView: 'home' | 'search' | 'admin';
  onViewChange: (view: 'home' | 'search' | 'admin') => void;
  onCheckoutClick: () => void;
}

export default function Navbar({ activeView, onViewChange, onCheckoutClick }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-40 w-full bg-black/40 backdrop-blur-xl border-b border-white/10 px-4 lg:px-8 py-5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => onViewChange('home')}
          className="flex items-center gap-3 cursor-pointer group"
          id="nav-logo"
        >
          <div className="flex items-center justify-center bg-neon rounded-xl w-10 h-10 transition-transform group-hover:scale-105 shadow-[0_0_20px_rgba(0,255,0,0.4)]">
            <span className="text-xl font-extrabold text-black tracking-tighter italic">R8</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-tight text-white group-hover:text-neon transition-colors uppercase">
              R8 STORE
            </span>
            <span className="text-[8px] font-bold text-white/40 tracking-widest uppercase -mt-1">
              PREMIUM PARTNER
            </span>
          </div>
        </div>

        {/* Navigation Menu Buttons */}
        <div className="flex items-center gap-1 sm:gap-3">
          {/* Main Storefront / Home */}
          <button
            onClick={() => onViewChange('home')}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
              activeView === 'home' 
                ? 'text-neon bg-neon/10 border border-neon/20' 
                : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
            id="nav-home"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Store</span>
          </button>

          {/* Search ID Transaction / Riwayat */}
          <button
            onClick={() => onViewChange('search')}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
              activeView === 'search' 
                ? 'text-neon bg-neon/10 border border-neon/20' 
                : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
            id="nav-search"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cari Pesanan</span>
          </button>

          {/* Admin Dashboard */}
          <button
            onClick={() => onViewChange('admin')}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
              activeView === 'admin' 
                ? 'text-neon bg-neon/10 border border-neon/20' 
                : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
            id="nav-admin"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin</span>
          </button>

          {/* Premium "Beli" Highlight Call To Action */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCheckoutClick}
            className="flex items-center gap-1.5 bg-neon hover:bg-neon-dim text-black font-extrabold text-xs px-3 sm:px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-[0_0_15px_rgba(0,255,102,0.3)] hover:shadow-[0_0_20px_rgba(0,255,102,0.5)]"
            id="nav-cta"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Order</span>
          </motion.button>
        </div>
      </div>
    </nav>
  );
}
