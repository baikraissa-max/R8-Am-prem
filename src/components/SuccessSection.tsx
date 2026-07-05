import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, Copy, Check, Download, Printer, ArrowRight, Sparkles, 
  Mail, ShoppingBag, ShieldCheck, HelpCircle 
} from 'lucide-react';
import { Order } from '../types';

interface SuccessSectionProps {
  order: Order;
  onContinueShopping: () => void;
}

export default function SuccessSection({ order, onContinueShopping }: SuccessSectionProps) {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedInvoice, setCopiedInvoice] = useState(false);

  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(order.price);

  const formattedDate = new Date(order.createdAt).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Action: Copy Transaction ID
  const handleCopyTransactionId = () => {
    navigator.clipboard.writeText(order.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Action: Print Invoice or Download Invoice
  const handleDownloadInvoice = () => {
    // Generate beautiful receipt layout in text file format
    const textReceipt = `
=========================================
          R8 STORE PREMIUM INVOICE
=========================================
Status      : ${order.status.toUpperCase()} (LUNAS)
ID Transaksi: ${order.id}
Tanggal     : ${formattedDate}
-----------------------------------------
PELANGGAN:
Email AM    : ${order.email}
-----------------------------------------
RINCIAN PRODUK:
Produk      : ${order.product}
Durasi      : 1 Tahun (365 Hari)
Harga       : ${formattedPrice}
Metode Bayar: ${order.paymentMethod}
-----------------------------------------
Keterangan:
Aktivasi premium diproses otomatis secara instan.
Silakan buka aplikasi Alight Motion, login dengan
email terdaftar, dan nikmati fitur PRO!

Terima kasih telah berbelanja di R8 Store.
Support & Jaminan Garansi Penuh: support@r8store.com
=========================================
    `;

    const blob = new Blob([textReceipt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_R8_Store_${order.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Action: Trigger browser printing directly
  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 relative" id="invoice-success-page">
      {/* Background Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#00ff66]/10 rounded-full filter blur-3xl pointer-events-none"></div>

      {/* Success Headline */}
      <div className="text-center space-y-3 mb-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="inline-flex items-center justify-center bg-neon/15 border border-neon/30 p-4 rounded-full text-neon shadow-[0_0_30px_rgba(0,255,102,0.3)] mb-2"
        >
          <CheckCircle2 className="w-12 h-12" />
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl sm:text-3xl font-black text-white tracking-tight"
        >
          Aktivasi Premium Berhasil!
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xs sm:text-sm text-white/50 max-w-md mx-auto leading-relaxed"
        >
          Pembayaran Anda telah sukses diverifikasi oleh R8 Store Gateway. Lisensi premium Alight Motion Anda telah aktif.
        </motion.p>
      </div>

      {/* Elegant Receipt Invoice Container */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/5 space-y-6 relative overflow-hidden print:bg-white print:text-black print:border-none print:shadow-none"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-neon/5 rounded-full filter blur-3xl print:hidden"></div>

        {/* Invoice Header */}
        <div className="flex justify-between items-center border-b border-white/5 pb-5">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-neon font-black block">RECEIPT / INVOICE LUNAS</span>
            <span className="text-base font-black text-white mt-1 block">R8 STORE INDONESIA</span>
          </div>
          <span className="bg-neon text-black font-extrabold text-[10px] px-3 py-1 rounded-full uppercase tracking-wide">
            PAID / LUNAS
          </span>
        </div>

        {/* Invoice Grid Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1 bg-white/2 p-3.5 rounded-xl border border-white/3">
            <span className="text-white/40 block font-light">ID Transaksi</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-white tracking-wide">{order.id}</span>
              <button 
                onClick={handleCopyTransactionId}
                className="text-neon hover:text-white transition-colors"
                title="Salin ID"
              >
                {copiedId ? <Check className="w-3.5 h-3.5 text-neon" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="space-y-1 bg-white/2 p-3.5 rounded-xl border border-white/3">
            <span className="text-white/40 block font-light">Email Alight Motion</span>
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-neon/60" />
              <span className="font-mono font-bold text-white">{order.email}</span>
            </div>
          </div>

          <div className="space-y-1 bg-white/2 p-3.5 rounded-xl border border-white/3">
            <span className="text-white/40 block font-light">Produk Pembelian</span>
            <span className="font-semibold text-white/90">{order.product} (1 Tahun)</span>
          </div>

          <div className="space-y-1 bg-white/2 p-3.5 rounded-xl border border-white/3">
            <span className="text-white/40 block font-light">Metode Pembayaran</span>
            <span className="font-bold text-neon">{order.paymentMethod}</span>
          </div>

          <div className="space-y-1 bg-white/2 p-3.5 rounded-xl border border-white/3 sm:col-span-2">
            <span className="text-white/40 block font-light">Tanggal Verifikasi</span>
            <span className="font-semibold text-white/90">{formattedDate}</span>
          </div>
        </div>

        {/* Price calculation details */}
        <div className="border-t border-white/5 pt-5 space-y-2.5">
          <div className="flex justify-between text-xs">
            <span className="text-white/40">Subtotal Produk</span>
            <span className="text-white/95 font-medium">{formattedPrice}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-white/40">Biaya Administrasi Gateway</span>
            <span className="text-neon font-medium">Rp 0 (GRATIS)</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-white/40">Pajak PPN 11%</span>
            <span className="text-[#00ff66]/70 font-medium">Included</span>
          </div>
          <div className="flex justify-between items-baseline border-t border-white/5 pt-3.5 mt-2">
            <span className="text-xs font-black text-white">TOTAL HARGA</span>
            <span className="text-xl font-black text-neon tracking-tight">{formattedPrice}</span>
          </div>
        </div>

        {/* Client Access Instructions */}
        <div className="bg-[#00ff66]/5 border border-[#00ff66]/15 p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-neon">
            <ShieldCheck className="w-4 h-4" />
            <h4 className="text-xs font-extrabold uppercase tracking-wide">Cara Mengaktifkan di HP Anda</h4>
          </div>
          <ol className="text-[11px] text-white/60 space-y-1.5 list-decimal pl-4 leading-relaxed font-light">
            <li>Buka aplikasi Alight Motion di HP Android / iOS Anda.</li>
            <li>Klik menu profil di pojok kanan atas, lalu pilih opsi <strong>Login/Sign In</strong>.</li>
            <li>Masuk menggunakan email terdaftar Anda (<strong>{order.email}</strong>).</li>
            <li>Sistem akan menyinkronkan status lisensi R8 Store dan status akun Anda otomatis menjadi <strong>Premium Pro</strong>!</li>
          </ol>
        </div>
      </motion.div>

      {/* Control Actions buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 flex flex-col sm:flex-row gap-3.5 print:hidden"
      >
        <button
          onClick={handleDownloadInvoice}
          className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-bold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <Download className="w-4 h-4 text-neon" />
          <span>Unduh Invoice (TXT)</span>
        </button>

        <button
          onClick={handlePrintInvoice}
          className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-bold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <Printer className="w-4 h-4 text-neon" />
          <span>Cetak / PDF Invoice</span>
        </button>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={onContinueShopping}
        className="mt-5 w-full bg-neon hover:bg-neon-dim text-black font-extrabold text-xs py-4 rounded-xl shadow-[0_0_20px_rgba(0,255,102,0.2)] flex items-center justify-center gap-1.5 cursor-pointer transition-colors print:hidden"
      >
        <ShoppingBag className="w-4 h-4" />
        <span>Kembali Berbelanja</span>
      </motion.button>
    </div>
  );
}
