import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, CheckCircle2, ShieldCheck, Zap, Download, Info, Plus, Minus,
  MessageSquare, HelpCircle, ArrowRight, Video, Layers, Award, RefreshCw 
} from 'lucide-react';

interface Testimonial {
  id?: string;
  name: string;
  text: string;
  rating: number;
  date: string;
  active: boolean;
}

interface HomeSectionProps {
  price: number;
  bannerUrl: string;
  bannerTitle: string;
  testimonials: Testimonial[];
  onCheckoutClick: () => void;
  isLoadingSettings: boolean;
}

export default function HomeSection({ 
  price, 
  bannerUrl, 
  bannerTitle, 
  testimonials, 
  onCheckoutClick,
  isLoadingSettings
}: HomeSectionProps) {
  // State for Accordion FAQ
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(price || 149000);

  const faqItems = [
    {
      q: 'Bagaimana proses aktivasi premium?',
      a: 'Setelah Anda melakukan pembayaran, sistem kami secara otomatis memproses aktivasi lisensi premium Alight Motion langsung ke alamat email yang Anda daftarkan. Tidak perlu login akun atau memberikan password!'
    },
    {
      q: 'Apakah akun ini bergaransi penuh?',
      a: 'Ya! R8 Store memberikan jaminan garansi penuh selama 1 tahun penuh (365 hari). Jika terjadi kendala pada premium Anda, tim support kami siap membantu re-aktivasi dengan cepat.'
    },
    {
      q: 'Dapatkah saya menggunakan akun ini di banyak perangkat?',
      a: 'Lisensi premium Alight Motion dapat digunakan di perangkat Android, iOS, maupun iPadOS Anda yang login dengan email terdaftar tersebut secara bersamaan.'
    },
    {
      q: 'Metode pembayaran apa saja yang didukung?',
      a: 'Kami mendukung pembayaran instan otomatis terlengkap melalui QRIS (bisa scan pakai GoPay, OVO, DANA, LinkAja, BCA), Transfer Virtual Account Bank, serta e-Wallet DANA, GoPay, OVO, dan ShopeePay.'
    }
  ];

  return (
    <div className="relative w-full overflow-hidden pb-20">
      {/* Background Neon Elements */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-neon-glow filter blur-[150px] rounded-full pointer-events-none opacity-20"></div>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 lg:px-8 pt-12 md:pt-20 pb-16 flex flex-col items-center text-center">
        {/* Neon Active Reseller Tag */}
        <motion.div 
          className="inline-flex items-center gap-2 bg-neon/10 border border-neon/30 text-neon font-extrabold text-[10px] sm:text-xs px-3 sm:px-4 py-1.5 rounded-full mb-6 tracking-wide shadow-[0_0_15px_rgba(0,255,102,0.15)] text-center justify-center max-w-full"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">RESELLER RESMI ALIGHT MOTION PREMIUM • INDONESIA</span>
        </motion.div>

        {/* Hero Headline */}
        <motion.h1 
          className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight max-w-4xl text-white leading-[1.15]"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {bannerTitle || 'Alight Motion Premium 1 Tahun'}
        </motion.h1>

        {/* Hero Paragraph */}
        <motion.p 
          className="mt-6 text-sm sm:text-base md:text-lg text-white/60 max-w-2xl font-light leading-relaxed"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Buka potensi kreativitas editing jedag-jedug, sinematik, dan motion graphic Anda tanpa batasan. 
          Akses instan semua preset, transisi, XML ekspor, dan resolusi 4K tanpa watermark.
        </motion.p>

        {/* Hero Call to Action Buttons */}
        <motion.div 
          className="mt-10 flex flex-col sm:flex-row items-center gap-4"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <button
            onClick={onCheckoutClick}
            className="w-full sm:w-auto bg-neon hover:bg-neon-dim text-black font-black text-sm tracking-wider uppercase px-8 py-4 rounded-xl cursor-pointer transition-all shadow-[0_0_25px_rgba(0,255,102,0.4)] hover:shadow-[0_0_35px_rgba(0,255,102,0.6)] flex items-center justify-center gap-2 group"
            id="hero-buy-btn"
          >
            <span>Beli Sekarang</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
          
          <a
            href="#product-showcase"
            className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm px-8 py-4 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Info className="w-4 h-4 text-neon" />
            <span>Lihat Penawaran</span>
          </a>
        </motion.div>

        {/* Hero Mockup Banner (Using settings dynamic bannerUrl) */}
        <motion.div 
          className="mt-16 w-full max-w-5xl rounded-2xl overflow-hidden border border-white/10 relative shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          id="product-showcase"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-transparent to-transparent z-10"></div>
          <img 
            src={bannerUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop'} 
            alt="Alight Motion Premium" 
            className="w-full aspect-[16/10] sm:aspect-[21/9] object-cover filter brightness-[0.7] scale-105 hover:scale-100 transition-transform duration-1000"
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6 z-20 text-left flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4">
            <div>
              <span className="text-[9px] font-extrabold uppercase bg-neon text-black px-2 py-0.5 rounded tracking-widest">BEST SELLER</span>
              <h3 className="text-sm sm:text-lg md:text-2xl font-black mt-1 sm:mt-2">Alight Motion Premium 1 Tahun Full Garansi</h3>
              <p className="text-[10px] sm:text-xs text-white/60">Aktivasi otomatis, legal, aman, dan tanpa login password.</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 bg-[#0d0d12]/95 border border-white/10 p-2 sm:p-3 rounded-xl backdrop-blur-md">
              <div className="text-right">
                <span className="block text-[8px] sm:text-[10px] font-bold text-white/40 uppercase">Harga Promo</span>
                <span className="text-neon font-black text-sm sm:text-lg tracking-tight">
                  {isLoadingSettings ? 'Memuat...' : formattedPrice}
                </span>
              </div>
              <button
                onClick={onCheckoutClick}
                className="bg-neon text-black font-black text-[10px] sm:text-xs px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg cursor-pointer hover:bg-neon-dim transition-colors"
              >
                Order
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Keunggulan Section (Value Props) */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-neon uppercase tracking-widest">KEUNGGULAN PREMIUM</span>
          <h2 className="text-3xl font-black tracking-tight text-white mt-1">Mengapa Membeli di R8 Store?</h2>
          <p className="text-sm text-white/50 max-w-xl mx-auto mt-2">Dapatkan kualitas pelayanan VIP dan fitur premium terbaik untuk semua kebutuhan editing Anda.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-neon/20 transition-all duration-300 group">
            <div className="bg-neon/10 border border-neon/20 rounded-xl w-12 h-12 flex items-center justify-center mb-4 text-neon shadow-[0_0_15px_rgba(0,255,102,0.1)] group-hover:scale-105 transition-transform">
              <Video className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white group-hover:text-neon transition-colors">Tanpa Watermark</h4>
            <p className="text-xs text-white/50 mt-2 leading-relaxed">Ekspor hasil mahakarya video Anda tanpa diganggu logo watermark Alight Motion. Terlihat sangat profesional.</p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-neon/20 transition-all duration-300 group">
            <div className="bg-neon/10 border border-neon/20 rounded-xl w-12 h-12 flex items-center justify-center mb-4 text-neon shadow-[0_0_15px_rgba(0,255,102,0.1)] group-hover:scale-105 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white group-hover:text-neon transition-colors">Semua Efek Terbuka</h4>
            <p className="text-xs text-white/50 mt-2 leading-relaxed">Gunakan semua preset premium, transisi, filter, font, keyframe, dan fitur premium XML tanpa batasan.</p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-neon/20 transition-all duration-300 group">
            <div className="bg-neon/10 border border-neon/20 rounded-xl w-12 h-12 flex items-center justify-center mb-4 text-neon shadow-[0_0_15px_rgba(0,255,102,0.1)] group-hover:scale-105 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white group-hover:text-neon transition-colors">Aktivasi Instan Otomatis</h4>
            <p className="text-xs text-white/50 mt-2 leading-relaxed">Setelah pembayaran terkonfirmasi, lisensi premium Alight Motion langsung aktif otomatis ke email Anda saat itu juga.</p>
          </div>

          {/* Card 4 */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-neon/20 transition-all duration-300 group">
            <div className="bg-neon/10 border border-neon/20 rounded-xl w-12 h-12 flex items-center justify-center mb-4 text-neon shadow-[0_0_15px_rgba(0,255,102,0.1)] group-hover:scale-105 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white group-hover:text-neon transition-colors">Garansi 1 Tahun Penuh</h4>
            <p className="text-xs text-white/50 mt-2 leading-relaxed">Kami menjamin garansi penuh 365 hari. Jika premium terputus di tengah jalan, support kami akan memperbaikinya.</p>
          </div>

          {/* Card 5 */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-neon/20 transition-all duration-300 group">
            <div className="bg-neon/10 border border-neon/20 rounded-xl w-12 h-12 flex items-center justify-center mb-4 text-neon shadow-[0_0_15px_rgba(0,255,102,0.1)] group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white group-hover:text-neon transition-colors">Aman & Tanpa Password</h4>
            <p className="text-xs text-white/50 mt-2 leading-relaxed">Sistem aktivasi kami sepenuhnya legal dan aman. Anda tidak perlu memberikan sandi akun Alight Motion Anda.</p>
          </div>

          {/* Card 6 */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-neon/20 transition-all duration-300 group">
            <div className="bg-neon/10 border border-neon/20 rounded-xl w-12 h-12 flex items-center justify-center mb-4 text-neon shadow-[0_0_15px_rgba(0,255,102,0.1)] group-hover:scale-105 transition-transform">
              <Download className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white group-hover:text-neon transition-colors">Ekspor Resolusi 4K 60FPS</h4>
            <p className="text-xs text-white/50 mt-2 leading-relaxed">Nikmati rendering super mulus dan ekspor hasil edit video hingga kualitas Ultra HD 4K dan framerate tinggi 60 FPS.</p>
          </div>
        </div>
      </section>

      {/* Cara Kerja Section */}
      <section className="bg-[#0b0b0f] border-y border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-neon uppercase tracking-widest">ALUR PEMESANAN</span>
            <h2 className="text-3xl font-black tracking-tight text-white mt-1">Bagaimana Cara Kerjanya?</h2>
            <p className="text-sm text-white/50 max-w-xl mx-auto mt-2">Hanya butuh 3 langkah mudah untuk mendapatkan akun Alight Motion Premium Anda.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center relative px-4">
              <div className="bg-neon text-black font-black text-xl w-12 h-12 rounded-full flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(0,255,102,0.3)]">
                1
              </div>
              <h4 className="text-lg font-bold text-white">Lakukan Pemesanan</h4>
              <p className="text-xs text-white/50 mt-2 leading-relaxed">Klik tombol Beli Sekarang, lalu isi alamat email Alight Motion Anda dengan benar dan konfirmasi.</p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center relative px-4">
              <div className="bg-neon text-black font-black text-xl w-12 h-12 rounded-full flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(0,255,102,0.3)]">
                2
              </div>
              <h4 className="text-lg font-bold text-white">Selesaikan Pembayaran</h4>
              <p className="text-xs text-white/50 mt-2 leading-relaxed">Pilih salah satu e-wallet, QRIS, atau Virtual Account Bank kesukaan Anda dan bayar secara instan.</p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center relative px-4">
              <div className="bg-neon text-black font-black text-xl w-12 h-12 rounded-full flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(0,255,102,0.3)]">
                3
              </div>
              <h4 className="text-lg font-bold text-white">Premium Aktif Instan!</h4>
              <p className="text-xs text-white/50 mt-2 leading-relaxed">Sistem otomatis memproses lisensi, email Anda langsung berstatus Premium dan siap digunakan mengedit.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimoni Section */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-neon uppercase tracking-widest">TESTIMONI PELANGGAN</span>
          <h2 className="text-3xl font-black tracking-tight text-white mt-1">Ulasan Pembeli R8 Store</h2>
          <p className="text-sm text-white/50 max-w-xl mx-auto mt-2">Dengarkan ulasan jujur dari editor dan desainer yang mempercayakan kebutuhan premium mereka pada kami.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials && testimonials.filter(t => t.active).map((t, i) => (
            <div key={t.id || i} className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating || 5)].map((_, idx) => (
                    <span key={idx} className="text-neon text-sm">★</span>
                  ))}
                </div>
                <p className="text-xs italic text-white/70 leading-relaxed font-light">
                  "{t.text}"
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-6">
                <span className="text-xs font-semibold text-white/95">{t.name}</span>
                <span className="text-[10px] text-white/40 font-mono">{t.date}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <HelpCircle className="w-8 h-8 text-neon mx-auto mb-2 animate-bounce" />
          <h2 className="text-3xl font-black tracking-tight text-white">Pertanyaan Umum (FAQ)</h2>
          <p className="text-xs text-white/50 mt-1">Segala informasi dasar yang perlu Anda ketahui tentang produk kami.</p>
        </div>

        <div className="space-y-4">
          {faqItems.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div 
                key={index} 
                className="glass-panel rounded-xl overflow-hidden border border-white/5 transition-colors hover:border-white/10"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-sm tracking-wide text-white cursor-pointer select-none"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <Minus className="w-4 h-4 text-neon flex-shrink-0" />
                  ) : (
                    <Plus className="w-4 h-4 text-neon flex-shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-white/60 leading-relaxed border-t border-white/5 bg-[#0a0a0f]/40 font-light">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer Branding Banner */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 mt-12">
        <div className="glass-panel-neon p-8 rounded-3xl text-center flex flex-col items-center justify-center relative overflow-hidden box-neon-glow">
          <div className="absolute top-0 right-0 w-32 h-32 bg-neon/10 rounded-full filter blur-2xl"></div>
          <Sparkles className="w-10 h-10 text-neon mb-4 animate-spin-slow" />
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Tunggu Apa Lagi?</h3>
          <p className="text-xs text-white/60 max-w-md mt-2 leading-relaxed">Aktivasi akun Alight Motion Premium 1 tahun Anda dalam hitungan menit dan buat video Anda viral sekarang juga!</p>
          <button
            onClick={onCheckoutClick}
            className="mt-6 bg-neon hover:bg-neon-dim text-black font-extrabold text-xs px-6 py-3 rounded-xl cursor-pointer transition-colors shadow-[0_0_15px_rgba(0,255,102,0.3)] flex items-center gap-1.5"
            id="footer-buy-btn"
          >
            <span>Beli Alight Motion Premium</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* Simple Clean Footer */}
      <footer className="max-w-7xl mx-auto px-4 lg:px-8 mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div className="flex items-center gap-2">
          <span className="text-lg font-black text-neon text-neon-glow">R8</span>
          <span className="text-xs text-white/50">• Alight Motion Premium Reseller Resmi</span>
        </div>
        <p className="text-[10px] text-white/30 font-mono tracking-widest uppercase">
          © 2026 R8 STORE. ALL RIGHTS RESERVED. DESIGNED WITH PREMIUM CRAFTSMANSHIP.
        </p>
      </footer>
    </div>
  );
}
