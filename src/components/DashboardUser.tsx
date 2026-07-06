import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, FileText, Clipboard, History, User, CheckCircle2, Clock, 
  XCircle, Copy, Check, ShieldCheck, Mail, ArrowRight, ArrowLeft, RefreshCw, Upload, CheckCircle,
  Download, Maximize2, X, Link2, ExternalLink
} from 'lucide-react';
import { Order } from '../types';
import { getDirectGoogleDriveImageUrl, safeFetchJson } from '../utils/drive';
import SuccessSection from './SuccessSection';

export default function DashboardUser() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'id' | 'email'>('id');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Results
  const [foundOrders, setFoundOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [whatsapp, setWhatsapp] = useState('6282114757375');
  
  // Active sub-menu tab
  const [activeTab, setActiveTab] = useState<'history' | 'detail' | 'profile'>('history');
  const [isQrisZoomed, setIsQrisZoomed] = useState(false);

  // Copy states
  const [copiedId, setCopiedId] = useState<string | null>(null);

  React.useEffect(() => {
    safeFetchJson<any>('/api/settings')
      .then(data => {
        if (data.whatsapp) {
          setWhatsapp(data.whatsapp);
        }
      })
      .catch(err => console.error('Error fetching settings:', err));
  }, []);

  // Transfer Proof Upload States
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [proofSuccessMessage, setProofSuccessMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [proofError, setProofError] = useState('');

  // Reset proof states when selecting a different order
  React.useEffect(() => {
    setProofPreview(null);
    setProofSuccessMessage('');
    setProofError('');
    setDragActive(false);
  }, [selectedOrder?.id]);

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
      setProofError('Mohon pilih file gambar saja (PNG/JPG/JPEG)!');
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
          setProofError('');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitProof = async () => {
    if (!selectedOrder || !proofPreview) return;
    setIsUploadingProof(true);
    setProofError('');
    try {
      await safeFetchJson<any>(`/api/order/${selectedOrder.id}/proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proofOfPaymentUrl: proofPreview })
      });
      setProofSuccessMessage('Bukti transfer berhasil dikirim! Admin R8 Store akan memverifikasi pembayaran Anda secepatnya.');
      const updatedOrder = { ...selectedOrder, proofOfPaymentUrl: proofPreview, proofOfPaymentUploadedAt: new Date().toISOString() };
      setSelectedOrder(updatedOrder);
      setFoundOrders(prev => prev.map(o => o.id === selectedOrder.id ? updatedOrder : o));
    } catch (err: any) {
      console.error(err);
      setProofError('Gangguan koneksi saat mengirim bukti pembayaran.');
    } finally {
      setIsUploadingProof(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setFoundOrders([]);
    setSelectedOrder(null);

    const queryStr = searchQuery.trim();
    if (!queryStr) {
      setError('Masukkan ID Transaksi atau Email Alight Motion!');
      setIsLoading(false);
      return;
    }

    try {
      if (searchType === 'id') {
        const data = await safeFetchJson<Order>(`/api/order/${queryStr}`);
        setFoundOrders([data]);
        setSelectedOrder(data);
        setActiveTab('detail');
      } else {
        const data = await safeFetchJson<Order[]>(`/api/user/orders?email=${encodeURIComponent(queryStr)}`);
        if (data.length === 0) {
          throw new Error('Tidak ada riwayat pesanan untuk email tersebut.');
        }

        setFoundOrders(data);
        setSelectedOrder(data[0]);
        setActiveTab('history');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formattedPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(price || 149000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Lunas':
        return (
          <span className="inline-flex items-center gap-1 bg-[#00ff66]/10 border border-[#00ff66]/20 text-neon font-bold text-[10px] px-2.5 py-1 rounded-full uppercase">
            <CheckCircle2 className="w-3 h-3" />
            Lunas
          </span>
        );
      case 'Menunggu Pembayaran':
        return (
          <span className="inline-flex items-center gap-1 bg-yellow-500/15 border border-yellow-500/25 text-yellow-500 font-bold text-[10px] px-2.5 py-1 rounded-full uppercase">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-[10px] px-2.5 py-1 rounded-full uppercase">
            <XCircle className="w-3 h-3" />
            Gagal
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Search Header panel */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-neon/5 rounded-full filter blur-3xl pointer-events-none"></div>

        <div className="max-w-xl">
          <span className="text-xs text-neon font-black uppercase tracking-widest">Dashboard Pelanggan</span>
          <h2 className="text-2xl font-black text-white mt-1">Cari Riwayat & Status Pesanan</h2>
          <p className="text-xs text-white/50 font-light leading-relaxed mt-2">
            Lacak status pembelian Anda secara instan. Pilih tipe pencarian menggunakan ID Transaksi unik atau Alamat Email terdaftar.
          </p>

          {/* Selector Type Tabs */}
          <div className="flex gap-2.5 mt-5">
            <button
              onClick={() => { setSearchType('id'); setError(''); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                searchType === 'id'
                  ? 'bg-neon text-black border-neon'
                  : 'bg-white/5 text-white/60 border-white/5 hover:text-white hover:bg-white/10'
              }`}
            >
              Cari ID Transaksi
            </button>
            <button
              onClick={() => { setSearchType('email'); setError(''); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                searchType === 'email'
                  ? 'bg-neon text-black border-neon'
                  : 'bg-white/5 text-white/60 border-white/5 hover:text-white hover:bg-white/10'
              }`}
            >
              Cari via Email
            </button>
          </div>

          {/* Search bar form */}
          <form onSubmit={handleSearch} className="mt-5 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/35" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchType === 'id' ? 'Contoh: R8-AM-20260705-000001' : 'Contoh: nama@email.com'}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl text-xs font-mono font-medium text-white bg-white/5 border border-white/10 focus:border-neon focus:outline-none transition-all"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-neon hover:bg-neon-dim text-black font-extrabold text-xs px-6 py-3.5 rounded-xl cursor-pointer transition-colors shadow-[0_0_15px_rgba(0,255,102,0.2)] flex items-center justify-center gap-1.5"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <span>Cari</span>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl flex items-center gap-2">
              <XCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Dashboard Panel displayed once results are loaded */}
      {foundOrders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Sidebar Menu Panel */}
          <div className="glass-panel p-4 rounded-2xl border border-white/5 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible">
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2.5 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all ${
                activeTab === 'history'
                  ? 'bg-neon/10 text-neon border border-neon/30'
                  : 'text-white/50 hover:text-white bg-transparent hover:bg-white/5 border border-transparent'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Riwayat</span>
            </button>
            
            <button
              onClick={() => setActiveTab('detail')}
              className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2.5 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all ${
                activeTab === 'detail'
                  ? 'bg-neon/10 text-neon border border-neon/30'
                  : 'text-white/50 hover:text-white bg-transparent hover:bg-white/5 border border-transparent'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Detail & Status</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2.5 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all ${
                activeTab === 'profile'
                  ? 'bg-neon/10 text-neon border border-neon/30'
                  : 'text-white/50 hover:text-white bg-transparent hover:bg-white/5 border border-transparent'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profil</span>
            </button>
          </div>

          {/* Main Workspace Display Content area */}
          <div className="md:col-span-3">
            <AnimatePresence mode="wait">
              {/* Tab 1: Riwayat Pesanan */}
              {activeTab === 'history' && (
                <motion.div
                  key="history-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4"
                >
                  <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-white/5 pb-3 flex items-center gap-2">
                    <History className="w-4.5 h-4.5 text-neon" />
                    <span>Daftar Transaksi Anda</span>
                  </h3>

                  <div className="overflow-x-auto w-full">
                    <table className="w-full min-w-[500px] text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 text-[10px] text-white/40 uppercase font-black tracking-wider">
                          <th className="pb-3 font-semibold">ID Transaksi</th>
                          <th className="pb-3 font-semibold">Metode</th>
                          <th className="pb-3 font-semibold text-right">Harga</th>
                          <th className="pb-3 font-semibold text-center">Status</th>
                          <th className="pb-3 font-semibold text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs divide-y divide-white/2 font-light">
                        {foundOrders.map((ord) => (
                          <tr key={ord.id} className="hover:bg-white/2 transition-colors">
                            <td className="py-3.5 font-mono font-semibold text-white/90">
                              <span className="block">{ord.id}</span>
                              <span className="text-[10px] text-white/30">{new Date(ord.createdAt).toLocaleDateString('id-ID')}</span>
                            </td>
                            <td className="py-3.5 text-white/80 font-medium">{ord.paymentMethod}</td>
                            <td className="py-3.5 text-right font-bold text-neon">{formattedPrice(ord.price)}</td>
                            <td className="py-3.5 text-center">{getStatusBadge(ord.status)}</td>
                            <td className="py-3.5 text-center">
                              <button
                                onClick={() => {
                                  setSelectedOrder(ord);
                                  setActiveTab('detail');
                                }}
                                className="text-[10px] font-bold text-neon bg-neon/10 hover:bg-neon/20 px-3 py-1 rounded border border-neon/20 cursor-pointer"
                              >
                                Pilih
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* Tab 2: Detail Pesanan */}
              {activeTab === 'detail' && selectedOrder && (
                <motion.div
                  key="detail-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* If status is Lunas, let's embed a print invoice trigger within the user dashboard! */}
                  {selectedOrder.status === 'Lunas' ? (
                    <SuccessSection 
                      order={selectedOrder} 
                      onContinueShopping={() => setSelectedOrder(null)} 
                    />
                  ) : (
                    // Payment is still pending! Let's display the simulated gateway card here so they can retry/pay it
                    <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
                      <div className="flex justify-between items-start border-b border-white/5 pb-4">
                        <div>
                          <span className="text-[10px] font-mono tracking-widest text-neon font-black block">PESANAN BELUM LUNAS</span>
                          <span className="text-base font-black text-white mt-1 block">R8 STORE GATEWAY</span>
                        </div>
                        {getStatusBadge(selectedOrder.status)}
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-white/40 font-light">ID Transaksi</span>
                          <span className="font-mono font-semibold text-white/90">{selectedOrder.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/40 font-light">Email Terdaftar</span>
                          <span className="font-mono font-semibold text-white/90">{selectedOrder.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/40 font-light">Produk</span>
                          <span className="font-semibold text-white/90">{selectedOrder.product}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/40 font-light">Metode Pembayaran</span>
                          <span className="font-bold text-neon">{selectedOrder.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/40 font-light">Total Harga</span>
                          <span className="font-black text-neon text-sm">{formattedPrice(selectedOrder.price)}</span>
                        </div>
                      </div>

                      {/* Display VA or QR code based on the order */}
                      <div className="border-t border-white/5 pt-5 flex flex-col items-center justify-center text-center space-y-4">
                        {selectedOrder.qrCodeUrl ? (
                          <div className="space-y-3 flex flex-col items-center">
                            <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest block">PINDAI KODE QRIS</span>
                            <button
                              type="button"
                              onClick={() => setIsQrisZoomed(true)}
                              className="group relative bg-white p-2.5 rounded-xl border border-neon/20 inline-block cursor-pointer hover:scale-[1.02] transition-all"
                              title="Klik untuk memperbesar QRIS"
                            >
                              <img src={getDirectGoogleDriveImageUrl(selectedOrder.qrCodeUrl)} className="w-36 h-36" alt="QRIS" />
                              <span className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-1 text-xs font-bold text-white">
                                <Maximize2 className="w-3.5 h-3.5 text-neon" />
                                Perbesar
                              </span>
                            </button>

                            <div className="flex gap-2 justify-center mt-1">
                              <button
                                type="button"
                                onClick={() => setIsQrisZoomed(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold text-white/80 transition-colors cursor-pointer"
                              >
                                <Maximize2 className="w-3 h-3 text-neon" />
                                <span>Perbesar QR</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDownloadQRIS(getDirectGoogleDriveImageUrl(selectedOrder.qrCodeUrl) || '')}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-neon/10 hover:bg-neon/20 border border-neon/25 rounded-lg text-[10px] font-bold text-neon transition-colors cursor-pointer shadow-[0_0_10px_rgba(0,255,102,0.05)]"
                              >
                                <Download className="w-3 h-3" />
                                <span>Unduh QRIS</span>
                              </button>
                            </div>

                            <span className="block text-[10px] text-white/40 max-w-xs mx-auto leading-relaxed font-light">
                              Pindai QRIS di atas dengan aplikasi DANA, OVO, ShopeePay, GoPay, atau m-Banking Anda.
                            </span>
                          </div>
                        ) : selectedOrder.vaNumber ? (
                          <div className="w-full space-y-2 max-w-sm">
                            <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest block">NOMOR VIRTUAL ACCOUNT</span>
                            <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-xl font-mono text-center flex justify-between items-center">
                              <span className="text-[10px] text-white/40 font-bold">{selectedOrder.paymentMethod.replace('Virtual Account', '')}</span>
                              <span className="text-neon font-black tracking-widest text-xs">{selectedOrder.vaNumber}</span>
                            </div>
                          </div>
                        ) : null}

                        {/* Proof of Payment Section */}
                        {selectedOrder.status === 'Menunggu Pembayaran' && (
                          <div className="w-full max-w-xs border-t border-white/5 pt-4 space-y-3">
                            <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest block">BUKTI PEMBAYARAN (TRANSFER)</span>
                            
                            {selectedOrder.proofOfPaymentUrl || proofSuccessMessage ? (
                              <div className="bg-[#10b981]/5 border border-[#10b981]/20 p-3.5 rounded-xl space-y-2 text-center mx-auto w-full">
                                <CheckCircle className="w-5 h-5 text-[#10b981] mx-auto animate-pulse" />
                                <p className="text-[10px] text-white/80 leading-relaxed font-medium">
                                  {proofSuccessMessage || 'Bukti transfer sudah terkirim! Admin akan segera memverifikasi pembayaran Anda.'}
                                </p>
                                <div className="relative inline-block mt-1">
                                  <img 
                                    src={selectedOrder.proofOfPaymentUrl || proofPreview || ''} 
                                    alt="Bukti Transfer" 
                                    className="w-20 h-auto rounded border border-white/15 bg-black mx-auto"
                                  />
                                  <span className="absolute -top-1 -right-1 bg-[#10b981] text-black text-[7px] font-black px-1 py-0.2 rounded-full uppercase">Sent</span>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3.5 text-left w-full mx-auto">
                                {!proofPreview ? (
                                  <div
                                    onDragEnter={handleDrag}
                                    onDragOver={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDrop={handleDrop}
                                    className={`border border-dashed rounded-xl p-4 text-center transition-all relative ${
                                      dragActive 
                                        ? 'border-neon bg-neon/5' 
                                        : 'border-white/10 bg-white/2 hover:border-white/15 hover:bg-white/4'
                                    }`}
                                  >
                                    <input
                                      type="file"
                                      id="dashboard-proof-upload"
                                      accept="image/*"
                                      onChange={handleFileChange}
                                      className="hidden"
                                    />
                                    <label htmlFor="dashboard-proof-upload" className="cursor-pointer block space-y-1.5">
                                      <Upload className="w-6 h-6 text-white/30 mx-auto animate-pulse" />
                                      <div className="space-y-0.5">
                                        <p className="text-[11px] font-bold text-white/80">Kirim Bukti Pembayaran</p>
                                        <p className="text-[9px] text-white/40 leading-relaxed">
                                          Tarik file ke sini, atau <span className="text-neon underline">klik untuk memilih</span>
                                        </p>
                                      </div>
                                    </label>
                                  </div>
                                ) : (
                                  <div className="bg-white/2 border border-white/10 p-3 rounded-xl space-y-3 w-full">
                                    <div className="flex gap-2.5 items-center">
                                      <img 
                                        src={proofPreview} 
                                        alt="Preview" 
                                        className="w-12 h-16 object-cover rounded border border-white/10 flex-shrink-0"
                                      />
                                      <div className="space-y-0.5 text-left min-w-0 flex-1">
                                        <p className="text-[11px] font-bold text-white/95 truncate">
                                          Screenshot ready
                                        </p>
                                        <p className="text-[9px] text-[#10b981] font-medium flex items-center gap-1">
                                          <span className="w-1 h-1 bg-[#10b981] rounded-full"></span>
                                          Siap dikirim
                                        </p>
                                        <button
                                          type="button"
                                          onClick={() => setProofPreview(null)}
                                          className="text-[9px] text-red-400 hover:text-red-300 underline font-medium cursor-pointer"
                                        >
                                          Ganti
                                        </button>
                                      </div>
                                    </div>

                                    {proofError && (
                                      <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] rounded-lg leading-relaxed text-left">
                                        {proofError}
                                      </div>
                                    )}

                                    <button
                                      type="button"
                                      disabled={isUploadingProof}
                                      onClick={handleSubmitProof}
                                      className="w-full bg-neon hover:bg-neon-dim text-black font-extrabold text-[10px] py-2.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 transition-all"
                                    >
                                      {isUploadingProof ? (
                                        <>
                                          <RefreshCw className="w-3 h-3 animate-spin" />
                                          <span>Mengirim Bukti...</span>
                                        </>
                                      ) : (
                                        <>
                                          <CheckCircle className="w-3 h-3" />
                                          <span>KIRIM BUKTI TRANSFER</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* WhatsApp confirmation button */}
                        <button
                          onClick={() => {
                            const message = `Halo Admin R8 Store, saya ingin mengonfirmasi pesanan saya yang masih pending.

Detail Pembayaran:
- ID Transaksi: ${selectedOrder.id}
- Email Alight Motion: ${selectedOrder.email}
- Nominal Transfer: ${formattedPrice(selectedOrder.price)}

Mohon dibantu cek mutasi dan diaktifkan ya Min. Terima kasih!`;
                            const encoded = encodeURIComponent(message);
                            window.open(`https://wa.me/${whatsapp}?text=${encoded}`, '_blank');
                          }}
                          className="w-full max-w-xs bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-xs py-3 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(37,211,102,0.15)]"
                        >
                          <span>Konfirmasi Pembayaran via WhatsApp</span>
                        </button>


                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Tab 3: Profil Alight Motion */}
              {activeTab === 'profile' && selectedOrder && (
                <motion.div
                  key="profile-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass-panel p-6 rounded-2xl border border-white/5 space-y-5"
                >
                  <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-white/5 pb-3 flex items-center gap-2">
                    <User className="w-4.5 h-4.5 text-neon" />
                    <span>Profil Lisensi Alight Motion</span>
                  </h3>

                  <div className="flex flex-col sm:flex-row gap-5 items-center bg-white/2 p-5 rounded-2xl border border-white/3">
                    {/* Visual Avatar mockup */}
                    <div className="w-16 h-16 rounded-2xl bg-neon/15 border border-neon/30 flex items-center justify-center text-neon text-2xl font-black shadow-[0_0_15px_rgba(0,255,102,0.1)]">
                      {selectedOrder.email.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="space-y-1.5 text-center sm:text-left flex-1">
                      <span className="text-xs font-bold text-white/95 block">{selectedOrder.email}</span>
                      <span className="inline-flex items-center gap-1.5 text-[10px] text-neon bg-neon/10 border border-neon/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Aktivasi Legal Resmi
                      </span>
                    </div>

                    <div className="text-right border-t sm:border-t-0 sm:border-l border-white/5 pt-4 sm:pt-0 sm:pl-6">
                      <span className="block text-[10px] text-white/40 uppercase font-black">Masa Lisensi</span>
                      <span className="text-xs font-extrabold text-white mt-1 block">365 Hari (Aktif)</span>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs leading-relaxed font-light text-white/60">
                    <p>
                      Email Alight Motion Anda telah secara resmi dikaitkan dengan program <strong>Alight Motion Premium Reseller R8 Store Indonesia</strong>.
                    </p>
                    <p>
                      Masa berlaku premium Anda adalah 1 tahun terhitung sejak tanggal verifikasi pesanan. Lisensi ini mencakup garansi penuh dan pembatalan otomatis diatur pada tanggal berakhir. Anda tidak perlu membatalkan langganan apa pun secara manual.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Zoom Lightbox Modal */}
      <AnimatePresence>
        {isQrisZoomed && selectedOrder?.qrCodeUrl && (
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
                  src={getDirectGoogleDriveImageUrl(selectedOrder.qrCodeUrl)} 
                  alt="QRIS Fullsize" 
                  className="w-64 h-64 object-contain"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleDownloadQRIS(getDirectGoogleDriveImageUrl(selectedOrder.qrCodeUrl) || '')}
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
