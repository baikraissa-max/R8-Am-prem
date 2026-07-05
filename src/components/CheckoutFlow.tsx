import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, ArrowRight, ShieldCheck, CreditCard, Landmark, CheckCircle, 
  Smartphone, AlertCircle, RefreshCw, Clock, Copy, Check 
} from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface CheckoutFlowProps {
  price: number;
  onSuccess: (order: Order) => void;
  onCancel: () => void;
}

export default function CheckoutFlow({ price, onSuccess, onCancel }: CheckoutFlowProps) {
  // Navigation Steps:
  // 1 = Email Input Form
  // 2 = Payment Method Selector
  // 3 = Interactive Simulated Payment Gate
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form states
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Created Order State for payment simulation
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [simulatedPaymentLoading, setSimulatedPaymentLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(price);

  // Methods definition
  const paymentMethods = [
    { id: 'QRIS', name: 'QRIS (Gopay/Dana/OVO)', type: 'qris', icon: CreditCard, subtitle: 'Otomatis aktif instan' },
    { id: 'DANA', name: 'DANA e-Wallet', type: 'wallet', icon: Smartphone, subtitle: 'Bayar via DANA App' },
    { id: 'GoPay', name: 'GoPay e-Wallet', type: 'wallet', icon: Smartphone, subtitle: 'Bayar via Gojek App' },
    { id: 'OVO', name: 'OVO e-Wallet', type: 'wallet', icon: Smartphone, subtitle: 'Bayar via OVO App' },
    { id: 'ShopeePay', name: 'ShopeePay', type: 'wallet', icon: Smartphone, subtitle: 'Bayar via Shopee' },
    { id: 'Virtual Account BCA', name: 'BCA Virtual Account', type: 'va', icon: Landmark, subtitle: 'Transfer antar bank BCA' },
    { id: 'Virtual Account Mandiri', name: 'Mandiri Virtual Account', type: 'va', icon: Landmark, subtitle: 'Transfer antar bank Mandiri' },
    { id: 'Virtual Account BNI', name: 'BNI Virtual Account', type: 'va', icon: Landmark, subtitle: 'Transfer antar bank BNI' }
  ];

  // Form Validation and submission for Step 1 -> Step 2
  const handleValidateEmails = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const emailTrim = email.trim().toLowerCase();
    const confirmEmailTrim = confirmEmail.trim().toLowerCase();

    if (!emailTrim || !confirmEmailTrim) {
      setError('Kedua kolom email wajib diisi!');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrim)) {
      setError('Format email Alight Motion tidak valid!');
      return;
    }

    if (emailTrim !== confirmEmailTrim) {
      setError('Konfirmasi email tidak sama dengan email utama!');
      return;
    }

    setStep(2); // Go to Payment Selection
  };

  // Create Order in server and proceed to Step 3
  const handleCreateOrder = async (methodId: string) => {
    setPaymentMethod(methodId);
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          confirmEmail: confirmEmail.trim().toLowerCase(),
          paymentMethod: methodId,
          price: price
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan saat membuat pesanan.');
      }

      setCreatedOrder(data);
      setStep(3); // Open the simulator page
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simulate payment processing trigger
  const handleSimulatePaymentSuccess = async () => {
    if (!createdOrder) return;
    setSimulatedPaymentLoading(true);

    try {
      const response = await fetch(`/api/order/${createdOrder.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Lunas',
          isSimulation: true
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengubah status pembayaran.');
      }

      // Success callback
      const finalOrder: Order = {
        ...createdOrder,
        status: 'Lunas',
        updatedAt: data.updatedAt
      };
      onSuccess(finalOrder);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSimulatedPaymentLoading(false);
    }
  };

  // Copy helper
  const handleCopyId = () => {
    if (!createdOrder) return;
    navigator.clipboard.writeText(createdOrder.id);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 relative">
      {/* Back button */}
      <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
        <div>
          <span className="text-xs text-neon uppercase font-bold tracking-wider">Checkout Premium</span>
          <h2 className="text-xl font-black text-white mt-0.5">R8 Store - Alight Motion</h2>
        </div>
        <button 
          onClick={onCancel}
          className="text-xs text-white/40 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 cursor-pointer"
        >
          Batal
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Email Form */}
        {step === 1 && (
          <motion.form 
            key="step1"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            onSubmit={handleValidateEmails}
            className="space-y-6"
          >
            <div className="glass-panel p-6 rounded-2xl border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-neon/5 rounded-full filter blur-xl"></div>
              
              <div className="flex items-center gap-2 mb-4 text-neon">
                <Mail className="w-5 h-5 text-neon" />
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">Langkah 1: Hubungkan Akun Alight Motion</h3>
              </div>
              <p className="text-xs text-white/50 leading-relaxed font-light mb-6">
                Masukkan alamat email yang Anda gunakan di aplikasi Alight Motion. Sistem akan langsung mengaktivasi status Premium pada email tersebut secara legal.
              </p>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2 mb-5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/70 block">Email Alight Motion Anda</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-xs font-medium text-white bg-white/5 border border-white/10 focus:border-neon focus:ring-1 focus:ring-neon focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Confirm Email Input */}
              <div className="space-y-1.5 mt-5">
                <label className="text-xs font-bold text-white/70 block">Konfirmasi Ulang Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input 
                    type="email" 
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    placeholder="Konfirmasi nama@email.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-xs font-medium text-white bg-white/5 border border-white/10 focus:border-neon focus:ring-1 focus:ring-neon focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Info Security Badge */}
              <div className="mt-6 flex items-center gap-2 bg-[#00ff66]/5 border border-[#00ff66]/10 p-3 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-neon flex-shrink-0" />
                <span className="text-[10px] text-white/60 leading-normal font-light">
                  <strong>Privasi Terjamin:</strong> Kami tidak pernah meminta kata sandi / password akun Anda.
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-neon hover:bg-neon-dim text-black font-extrabold text-xs py-4 rounded-xl shadow-[0_0_20px_rgba(0,255,102,0.25)] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Lanjutkan Pilih Pembayaran</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.form>
        )}

        {/* Step 2: Payment Selector */}
        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-6"
          >
            <div className="glass-panel p-6 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2 text-neon">
                  <CreditCard className="w-5 h-5 text-neon" />
                  <h3 className="font-bold text-sm text-white uppercase tracking-wider">Langkah 2: Pilih Metode Pembayaran</h3>
                </div>
                <button 
                  onClick={() => setStep(1)}
                  className="text-[10px] text-neon hover:underline cursor-pointer"
                >
                  Ubah Email
                </button>
              </div>

              <div className="mb-4 bg-white/5 border border-white/5 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <span className="block text-[9px] text-white/40 uppercase font-bold">Email Tujuan</span>
                  <span className="text-xs font-mono font-bold text-white/95">{email}</span>
                </div>
                <div className="text-right">
                  <span className="block text-[9px] text-white/40 uppercase font-bold">Total Pembayaran</span>
                  <span className="text-xs font-black text-neon">{formattedPrice}</span>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2 mb-4">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Payment Grid */}
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {paymentMethods.map((method) => {
                  const IconComponent = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => handleCreateOrder(method.id)}
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-[#00ff66]/5 border border-white/5 hover:border-[#00ff66]/30 text-left cursor-pointer transition-all disabled:opacity-50 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-white/5 group-hover:bg-[#00ff66]/10 border border-white/10 group-hover:border-[#00ff66]/20 p-2 rounded-lg text-white/80 group-hover:text-neon transition-colors">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-white group-hover:text-neon transition-colors">{method.name}</span>
                          <span className="block text-[10px] text-white/40 font-light mt-0.5">{method.subtitle}</span>
                        </div>
                      </div>
                      
                      {isSubmitting && paymentMethod === method.id ? (
                        <RefreshCw className="w-4 h-4 text-neon animate-spin" />
                      ) : (
                        <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:text-neon transition-colors group-hover:translate-x-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Interactive Sandbox Payment Gateway Simulator */}
        {step === 3 && createdOrder && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-6"
          >
            {/* Interactive Alert Banner informing user this is a sandbox mode */}
            <div className="glass-panel-neon p-4 rounded-2xl border border-neon/30 text-xs box-neon-glow relative overflow-hidden">
              <div className="absolute top-0 right-0 w-8 h-8 bg-neon/10 rounded-full filter blur-xl"></div>
              <div className="flex gap-2.5">
                <ShieldCheck className="w-5 h-5 text-neon flex-shrink-0" />
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-[12px] uppercase tracking-wide">R8 Store Gateway Sandbox</h4>
                  <p className="text-[10px] text-white/70 leading-relaxed font-light">
                    Sistem pembayaran berada dalam <strong>Mode Demo / Simulasi Sandbox</strong>. Anda tidak perlu mentransfer uang sungguhan. Cukup klik tombol pembayaran hijau di bawah untuk mengaktifkan status "Lunas" otomatis!
                  </p>
                </div>
              </div>
            </div>

            {/* Simulated Transaction Invoice Card */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-5">
              <div className="flex justify-between items-start border-b border-white/5 pb-4">
                <div>
                  <span className="text-[9px] text-white/40 uppercase font-black font-mono">Invoice Pesanan</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs font-mono font-bold text-white">{createdOrder.id}</span>
                    <button 
                      onClick={handleCopyId}
                      className="text-neon hover:text-white transition-colors"
                      title="Salin ID Transaksi"
                    >
                      {copySuccess ? (
                        <Check className="w-3 h-3 text-neon" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wide animate-pulse">
                    <Clock className="w-3 h-3" />
                    <span>PENDING</span>
                  </span>
                </div>
              </div>

              {/* Invoice details */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/40 font-light">Email Alight Motion</span>
                  <span className="font-mono font-semibold text-white/90">{createdOrder.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40 font-light">Produk</span>
                  <span className="font-semibold text-white/90">{createdOrder.product}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40 font-light">Metode Bayar</span>
                  <span className="font-bold text-neon">{createdOrder.paymentMethod}</span>
                </div>
                <div className="border-t border-white/5 pt-2 mt-2 flex justify-between items-baseline">
                  <span className="text-white/40 font-bold">Total Pembayaran</span>
                  <span className="text-lg font-black text-neon tracking-tight">{formattedPrice}</span>
                </div>
              </div>

              {/* Payment Visual Simulation */}
              <div className="border-t border-white/5 pt-5 flex flex-col items-center justify-center text-center">
                {/* Visual rendering of QRIS */}
                {createdOrder.qrCodeUrl && (
                  <div className="space-y-3 flex flex-col items-center">
                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">PINDAI KODE QRIS DI BAWAH</span>
                    <div className="bg-white p-2.5 rounded-xl border border-neon/25 shadow-[0_0_15px_rgba(0,255,102,0.1)]">
                      <img 
                        src={createdOrder.qrCodeUrl} 
                        alt="Simulated QRIS QR Code" 
                        className="w-40 h-40 object-contain"
                      />
                    </div>
                    <span className="text-[9px] text-white/30 font-light leading-normal max-w-xs">
                      Mendukung semua aplikasi e-wallet & Mobile Banking Indonesia yang mendukung QRIS.
                    </span>
                  </div>
                )}

                {/* Visual rendering of Virtual Account */}
                {createdOrder.vaNumber && (
                  <div className="w-full space-y-4 text-center">
                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest block">NOMOR VIRTUAL ACCOUNT</span>
                    <div className="bg-white/5 border border-white/10 px-5 py-4 rounded-xl flex items-center justify-between font-mono max-w-sm mx-auto">
                      <span className="text-white/40 font-medium text-xs uppercase">{createdOrder.paymentMethod.replace('Virtual Account', '').trim() || 'BANK'} VA</span>
                      <span className="text-neon font-black tracking-widest text-sm">{createdOrder.vaNumber}</span>
                    </div>
                    
                    <div className="text-left text-[11px] text-white/50 space-y-2 bg-white/2 p-4 rounded-xl max-w-sm mx-auto">
                      <p className="font-bold text-white/80">Panduan Transfer Bank:</p>
                      <p>1. Salin nomor Virtual Account di atas.</p>
                      <p>2. Buka aplikasi M-Banking Anda, lalu pilih menu Transfer VA.</p>
                      <p>3. Masukkan nomor VA, periksa nominal Rp {price.toLocaleString('id-ID')}, dan selesaikan transaksi.</p>
                    </div>
                  </div>
                )}

                {/* Visual rendering of E-wallet direct simulator (OVO, DANA, GoPay etc) */}
                {!createdOrder.qrCodeUrl && !createdOrder.vaNumber && (
                  <div className="space-y-3 max-w-sm w-full mx-auto">
                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">PEMBAYARAN E-WALLET INSTAN</span>
                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white/40">Provider</span>
                        <span className="font-bold text-white">{createdOrder.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white/40">Status Koneksi</span>
                        <span className="text-neon font-bold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-neon rounded-full animate-ping"></span>
                          Terhubung
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] text-white/30 text-left leading-normal font-light">
                      Notifikasi push pembayaran instan akan secara otomatis muncul di handphone Anda yang terdaftar pada nomor e-wallet yang aktif.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Simulation CTA Action Button */}
            <div className="space-y-2.5">
              <button
                onClick={handleSimulatePaymentSuccess}
                disabled={simulatedPaymentLoading}
                className="w-full bg-neon hover:bg-neon-dim text-black font-black text-sm py-4 rounded-xl shadow-[0_0_25px_rgba(0,255,102,0.35)] flex items-center justify-center gap-2 cursor-pointer transition-all"
                id="simulate-payment-btn"
              >
                {simulatedPaymentLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Memproses Aktivasi Premium...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Bayar & Aktifkan Premium (Simulasi)</span>
                  </>
                )}
              </button>
              
              <button
                onClick={onCancel}
                className="w-full text-xs text-white/30 hover:text-white/60 text-center block cursor-pointer transition-colors"
              >
                Batalkan & Kembali Ke Store
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
