import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, ArrowRight, ShieldCheck, CreditCard, Landmark, CheckCircle, 
  Smartphone, AlertCircle, RefreshCw, Clock, Copy, Check, Barcode, Store, Upload,
  Download, Maximize2, X, Link2, FileText, ExternalLink
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { getDirectGoogleDriveImageUrl } from '../utils/drive';

interface CheckoutFlowProps {
  price: number;
  whatsapp?: string;
  onSuccess: (order: Order) => void;
  onCancel: () => void;
}

export default function CheckoutFlow({ price, whatsapp = '6282114757375', onSuccess, onCancel }: CheckoutFlowProps) {
  // Navigation Steps:
  // 1 = Email Input Form
  // 2 = Payment Method Selector
  // 3 = Interactive Simulated Payment Gate
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [activeCategory, setActiveCategory] = useState<'qris' | 'va' | 'retail'>('qris');

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

  // Transfer Proof Upload States
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [proofSuccessMessage, setProofSuccessMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [isQrisZoomed, setIsQrisZoomed] = useState(false);

  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(price);

  // Methods definition
  const paymentMethods = [
    // QRIS & E-Wallet
    { id: 'QRIS', name: 'QRIS (Gopay/Dana/OVO/LinkAja/ShopeePay)', type: 'qris', icon: CreditCard, subtitle: 'Pindai QR otomatis aktif instan' },
    { id: 'DANA', name: 'DANA e-Wallet', type: 'qris', icon: Smartphone, subtitle: 'Bayar via aplikasi DANA' },
    { id: 'GoPay', name: 'GoPay e-Wallet', type: 'qris', icon: Smartphone, subtitle: 'Bayar via aplikasi Gojek' },
    { id: 'OVO', name: 'OVO e-Wallet', type: 'qris', icon: Smartphone, subtitle: 'Bayar via aplikasi OVO' },
    { id: 'ShopeePay', name: 'ShopeePay e-Wallet', type: 'qris', icon: Smartphone, subtitle: 'Bayar via aplikasi Shopee' },
    { id: 'LinkAja', name: 'LinkAja e-Wallet', type: 'qris', icon: Smartphone, subtitle: 'Bayar via aplikasi LinkAja' },
    
    // Virtual Accounts
    { id: 'Virtual Account BCA', name: 'BCA Virtual Account', type: 'va', icon: Landmark, subtitle: 'Konfirmasi otomatis transfer BCA' },
    { id: 'Virtual Account Mandiri', name: 'Mandiri Virtual Account', type: 'va', icon: Landmark, subtitle: 'Konfirmasi otomatis transfer Mandiri' },
    { id: 'Virtual Account BNI', name: 'BNI Virtual Account', type: 'va', icon: Landmark, subtitle: 'Konfirmasi otomatis transfer BNI' },
    { id: 'Virtual Account BRI', name: 'BRI Virtual Account', type: 'va', icon: Landmark, subtitle: 'Konfirmasi otomatis transfer BRI' },
    { id: 'Virtual Account Permata', name: 'Permata Virtual Account', type: 'va', icon: Landmark, subtitle: 'Konfirmasi otomatis transfer Permata' },
    { id: 'Virtual Account BSI', name: 'BSI Virtual Account', type: 'va', icon: Landmark, subtitle: 'Konfirmasi otomatis transfer BSI' },
    
    // Gerai Retail
    { id: 'Alfamart', name: 'Alfamart', type: 'retail', icon: Store, subtitle: 'Bayar tunai di kasir Alfamart' },
    { id: 'Indomaret', name: 'Indomaret', type: 'retail', icon: Store, subtitle: 'Bayar tunai di kasir Indomaret' }
  ];

  // Form Validation and submission for Step 1 -> Directly to QRIS
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

    // Skip payment select step, directly checkout using QRIS All Payment
    handleCreateOrder('QRIS All Payment');
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

      if (data && data.qrCodeUrl) {
        data.qrCodeUrl = getDirectGoogleDriveImageUrl(data.qrCodeUrl);
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

  const handleDownloadQRIS = async (url: string) => {
    try {
      const link = document.createElement('a');
      link.href = `/api/download?url=${encodeURIComponent(url)}`;
      link.download = 'QRIS-R8-Store.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download QRIS image:', error);
      window.open(url, '_blank');
    }
  };

  // WhatsApp confirmation sender
  const handleConfirmWhatsapp = () => {
    if (!createdOrder) return;
    const orderId = createdOrder.id;
    const emailStr = createdOrder.email;
    const nominal = formattedPrice;
    
    const message = `Halo Admin R8 Store, saya sudah melakukan pembayaran via QRIS All Payment.

Detail Pembayaran:
- ID Transaksi: ${orderId}
- Email Alight Motion: ${emailStr}
- Nominal Transfer: ${nominal}

Mohon dicek mutasi akun dan segera diproses aktivasi Alight Motion Premium saya ya Min. Terima kasih banyak!`;

    const encodedMessage = encodeURIComponent(message);
    const waUrl = `https://wa.me/${whatsapp}?text=${encodedMessage}`;
    window.open(waUrl, '_blank');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Mohon pilih file gambar saja (PNG/JPG/JPEG)!');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 600;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          setProofPreview(compressedBase64);
          setProofSuccessMessage('');
          setError('');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitProof = async () => {
    if (!createdOrder || !proofPreview) return;
    setIsUploadingProof(true);
    setError('');
    try {
      const response = await fetch(`/api/order/${createdOrder.id}/proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proofOfPaymentUrl: proofPreview })
      });
      const data = await response.json();
      if (response.ok) {
        setProofSuccessMessage('Bukti transfer berhasil dikirim! Admin R8 Store akan memverifikasi pembayaran Anda secepatnya.');
        setCreatedOrder(prev => prev ? { ...prev, proofOfPaymentUrl: proofPreview, proofOfPaymentUploadedAt: new Date().toISOString() } : null);
      } else {
        setError(data.error || 'Gagal mengirim bukti transfer.');
      }
    } catch (err: any) {
      console.error(err);
      setError('Gangguan koneksi saat mengirim bukti pembayaran.');
    } finally {
      setIsUploadingProof(false);
    }
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
              disabled={isSubmitting}
              className="w-full bg-neon hover:bg-neon-dim text-black font-extrabold text-xs py-4 rounded-xl shadow-[0_0_20px_rgba(0,255,102,0.25)] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Memproses Pesanan Anda...</span>
                </>
              ) : (
                <>
                  <span>Lanjutkan ke Pembayaran QRIS</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
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

              {/* Category tabs */}
              <div className="flex border-b border-white/5 mb-4 text-[10px] sm:text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveCategory('qris')}
                  className={`flex-1 pb-2.5 text-center transition-colors border-b-2 cursor-pointer ${
                    activeCategory === 'qris' 
                      ? 'border-neon text-neon' 
                      : 'border-transparent text-white/40 hover:text-white/80'
                  }`}
                >
                  QRIS / E-Wallet
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory('va')}
                  className={`flex-1 pb-2.5 text-center transition-colors border-b-2 cursor-pointer ${
                    activeCategory === 'va' 
                      ? 'border-neon text-neon' 
                      : 'border-transparent text-white/40 hover:text-white/80'
                  }`}
                >
                  Transfer Bank (VA)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory('retail')}
                  className={`flex-1 pb-2.5 text-center transition-colors border-b-2 cursor-pointer ${
                    activeCategory === 'retail' 
                      ? 'border-neon text-neon' 
                      : 'border-transparent text-white/40 hover:text-white/80'
                  }`}
                >
                  Gerai Retail
                </button>
              </div>

              {/* Payment Grid */}
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {paymentMethods
                  .filter((m) => m.type === activeCategory)
                  .map((method) => {
                    const IconComponent = method.icon;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => handleCreateOrder(method.id)}
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-[#00ff00]/5 border border-white/5 hover:border-[#00ff00]/30 text-left cursor-pointer transition-all disabled:opacity-50 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-white/5 group-hover:bg-[#00ff00]/10 border border-white/10 group-hover:border-[#00ff00]/20 p-2 rounded-lg text-white/80 group-hover:text-neon transition-colors">
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
            {/* Guide Info Banner */}
            <div className="glass-panel-neon p-4 rounded-2xl border border-neon/20 text-xs box-neon-glow relative overflow-hidden">
              <div className="absolute top-0 right-0 w-8 h-8 bg-neon/10 rounded-full filter blur-xl"></div>
              <div className="flex gap-2.5">
                <ShieldCheck className="w-5 h-5 text-neon flex-shrink-0" />
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-[12px] uppercase tracking-wide">PANDUAN PEMBAYARAN INSTAN</h4>
                  <p className="text-[10px] text-white/70 leading-relaxed font-light">
                    Silakan pindai kode QRIS di bawah ini melalui aplikasi e-wallet (DANA, ShopeePay, OVO, GoPay) atau Mobile Banking Anda. Setelah berhasil mentransfer, <strong>klik tombol hijau "Konfirmasi Pembayaran via WhatsApp"</strong> di bawah untuk mengirim bukti transfer ke Admin agar diproses secara instan.
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
                    <button
                      type="button"
                      onClick={() => setIsQrisZoomed(true)}
                      className="group relative bg-white p-2.5 rounded-xl border border-neon/25 shadow-[0_0_15px_rgba(0,255,102,0.1)] cursor-pointer hover:scale-[1.02] transition-all"
                      title="Klik untuk memperbesar QRIS"
                    >
                      <img 
                        src={createdOrder.qrCodeUrl} 
                        alt="Simulated QRIS QR Code" 
                        className="w-40 h-40 object-contain"
                      />
                      <span className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-1.5 text-xs font-bold text-white">
                        <Maximize2 className="w-4 h-4 text-neon" />
                        Perbesar QR
                      </span>
                    </button>
                    
                    <div className="flex gap-2.5 mt-1">
                      <button
                        type="button"
                        onClick={() => setIsQrisZoomed(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[11px] font-bold text-white/80 transition-colors cursor-pointer"
                      >
                        <Maximize2 className="w-3.5 h-3.5 text-neon" />
                        <span>Perbesar QR</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadQRIS(createdOrder.qrCodeUrl || '')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-neon/10 hover:bg-neon/20 border border-neon/25 rounded-lg text-[11px] font-bold text-neon transition-colors cursor-pointer shadow-[0_0_10px_rgba(0,255,102,0.05)]"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh QRIS</span>
                      </button>
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

                {/* Visual rendering of Retail Outlet (Alfamart/Indomaret) */}
                {createdOrder.paymentCode && (
                  <div className="w-full space-y-4 text-center">
                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest block">KODE PEMBAYARAN GERAI RETAIL</span>
                    <div className="bg-white/5 border border-white/10 px-5 py-4 rounded-xl flex flex-col items-center gap-2 max-w-sm mx-auto">
                      <span className="text-white/40 font-medium text-xs uppercase font-mono">{createdOrder.paymentMethod} CASHIER CODE</span>
                      <span className="text-neon font-black tracking-wider text-base font-mono">{createdOrder.paymentCode}</span>
                      
                      {/* Fake Barcode graphic */}
                      <div className="mt-2 flex items-center justify-center gap-1.5 opacity-75">
                        <Barcode className="w-10 h-6 text-white" />
                        <span className="text-[8px] text-white/50 font-mono">SCAN BARCODE SIMULATION</span>
                      </div>
                    </div>
                    
                    <div className="text-left text-[11px] text-white/50 space-y-2 bg-white/2 p-4 rounded-xl max-w-sm mx-auto">
                      <p className="font-bold text-white/80">Panduan Pembayaran Kasir:</p>
                      <p>1. Datangi kasir {createdOrder.paymentMethod} terdekat.</p>
                      <p>2. Katakan ingin melakukan pembayaran tagihan <strong>R8 Store / Alight Motion</strong>.</p>
                      <p>3. Berikan kode pembayaran di atas ke kasir untuk di-scan.</p>
                      <p>4. Bayar sesuai nominal dan simpan struk pembayaran Anda.</p>
                    </div>
                  </div>
                )}

                {/* Visual rendering of E-wallet direct simulator (OVO, DANA, GoPay etc) */}
                {!createdOrder.qrCodeUrl && !createdOrder.vaNumber && !createdOrder.paymentCode && (
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

              {/* Upload Bukti Pembayaran (Real Integration) */}
              <div className="border-t border-white/5 pt-5 space-y-4">
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest block text-center">UPLOAD BUKTI PEMBAYARAN</span>
                
                {proofSuccessMessage ? (
                  <div className="bg-[#10b981]/10 border border-[#10b981]/30 p-4 rounded-xl text-center space-y-3">
                    <CheckCircle className="w-8 h-8 text-[#10b981] mx-auto animate-bounce" />
                    <p className="text-xs font-bold text-white leading-relaxed">
                      {proofSuccessMessage}
                    </p>
                    {proofPreview && (
                      <div className="relative inline-block mt-2">
                        <img 
                          src={proofPreview} 
                          alt="Bukti Transfer Berhasil" 
                          className="w-24 h-auto rounded border border-white/10 mx-auto"
                        />
                        <span className="absolute -top-1.5 -right-1.5 bg-[#10b981] text-black text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase">Sent</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {!proofPreview ? (
                      <div
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all relative ${
                          dragActive 
                            ? 'border-neon bg-neon/5' 
                            : 'border-white/10 bg-white/2 hover:border-white/20 hover:bg-white/4'
                        }`}
                      >
                        <input
                          type="file"
                          id="proof-upload"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <label htmlFor="proof-upload" className="cursor-pointer block space-y-2">
                          <Upload className="w-8 h-8 text-white/30 mx-auto animate-pulse" />
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-white/80">Pilih Screenshot Bukti Transfer</p>
                            <p className="text-[10px] text-white/40 leading-relaxed font-light">
                              Tarik & lepas file gambar ke sini, atau <span className="text-neon underline">klik untuk memilih</span>
                            </p>
                            <p className="text-[9px] text-white/30 font-light font-mono">
                              PNG, JPG, JPEG (Maks. 5 MB)
                            </p>
                          </div>
                        </label>
                      </div>
                    ) : (
                      <div className="bg-white/3 border border-white/10 p-4 rounded-xl space-y-4">
                        <div className="flex gap-3 items-center">
                          <img 
                            src={proofPreview} 
                            alt="Preview Bukti Pembayaran" 
                            className="w-16 h-20 object-cover rounded-lg border border-white/10 bg-black flex-shrink-0"
                          />
                          <div className="space-y-1 text-left min-w-0 flex-1">
                            <p className="text-xs font-bold text-white/90 truncate">File Bukti Transfer Siap</p>
                            <p className="text-[10px] text-[#10b981] flex items-center gap-1 font-medium">
                              <span className="w-1.5 h-1.5 bg-[#10b981] rounded-full"></span>
                              Berhasil di-compress & siap dikirim
                            </p>
                            <button
                              type="button"
                              onClick={() => setProofPreview(null)}
                              className="text-[10px] text-red-400 hover:text-red-300 underline font-medium cursor-pointer"
                            >
                              Ganti Gambar
                            </button>
                          </div>
                        </div>

                        {error && (
                          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] rounded-lg text-left leading-relaxed">
                            {error}
                          </div>
                        )}

                        <button
                          type="button"
                          disabled={isUploadingProof}
                          onClick={handleSubmitProof}
                          className="w-full bg-neon hover:bg-neon-dim text-black font-extrabold text-xs py-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
                        >
                          {isUploadingProof ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Mengirim Bukti...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>KIRIM BUKTI PEMBAYARAN</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                onClick={handleConfirmWhatsapp}
                className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-xs py-4 rounded-xl shadow-[0_0_20px_rgba(37,211,102,0.15)] flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Smartphone className="w-4 h-4" />
                <span>KONFIRMASI PEMBAYARAN VIA WHATSAPP</span>
              </button>


              
              <button
                onClick={onCancel}
                className="w-full text-xs text-white/30 hover:text-white/60 text-center block cursor-pointer transition-colors pt-2"
              >
                Kembali Ke Toko
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zoom Lightbox Modal */}
      <AnimatePresence>
        {isQrisZoomed && createdOrder?.qrCodeUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setIsQrisZoomed(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0e0e13] border border-white/10 rounded-2xl p-6 max-w-sm w-full relative shadow-[0_0_50px_rgba(0,0,0,0.8)] text-center space-y-4"
            >
              <button
                type="button"
                onClick={() => setIsQrisZoomed(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="border-b border-white/5 pb-2">
                <h4 className="text-sm font-black text-white uppercase tracking-wider font-mono">Pindai Kode QRIS</h4>
                <p className="text-[10px] text-white/40 font-light mt-0.5 font-sans">Silakan scan QRIS untuk menyelesaikan transaksi Anda</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-neon/25 inline-block mx-auto shadow-inner">
                <img 
                  src={createdOrder.qrCodeUrl} 
                  alt="QRIS Fullsize" 
                  className="w-64 h-64 object-contain"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleDownloadQRIS(createdOrder.qrCodeUrl || '')}
                  className="flex-1 bg-neon hover:bg-neon-dim text-black font-extrabold text-xs py-3 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(0,255,102,0.15)]"
                >
                  <Download className="w-4 h-4" />
                  <span>UNDUH QRIS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsQrisZoomed(false)}
                  className="px-5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/75 font-semibold text-xs py-3 rounded-xl cursor-pointer transition-colors"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
