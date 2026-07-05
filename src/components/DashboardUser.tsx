import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, FileText, Clipboard, History, User, CheckCircle2, Clock, 
  XCircle, Copy, Check, ShieldCheck, Mail, ArrowRight, ArrowLeft, RefreshCw 
} from 'lucide-react';
import { Order } from '../types';
import SuccessSection from './SuccessSection';

export default function DashboardUser() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'id' | 'email'>('id');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Results
  const [foundOrders, setFoundOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Active sub-menu tab
  const [activeTab, setActiveTab] = useState<'history' | 'detail' | 'profile'>('history');

  // Copy states
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
        const response = await fetch(`/api/order/${queryStr}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'ID Transaksi tidak ditemukan.');
        }

        setFoundOrders([data]);
        setSelectedOrder(data);
        setActiveTab('detail');
      } else {
        const response = await fetch(`/api/user/orders?email=${encodeURIComponent(queryStr)}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Terjadi kesalahan saat memuat riwayat.');
        }

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
                      <div className="border-t border-white/5 pt-5 flex flex-col items-center justify-center text-center">
                        {selectedOrder.qrCodeUrl ? (
                          <div className="space-y-3">
                            <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest block">PINDAI KODE QRIS</span>
                            <div className="bg-white p-2.5 rounded-xl border border-neon/20 inline-block">
                              <img src={selectedOrder.qrCodeUrl} className="w-36 h-36" alt="QRIS" />
                            </div>
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

                        {/* Fast Simulated checkout completion */}
                        <button
                          onClick={async () => {
                            try {
                              setIsLoading(true);
                              const res = await fetch(`/api/order/${selectedOrder.id}/status`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: 'Lunas', isSimulation: true })
                              });
                              if (res.ok) {
                                const refreshed = await res.json();
                                setSelectedOrder({ ...selectedOrder, status: 'Lunas' });
                                // Update item in foundOrders list
                                setFoundOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: 'Lunas' } : o));
                              }
                            } catch (e) {
                              console.error(e);
                            } finally {
                              setIsLoading(false);
                            }
                          }}
                          className="mt-6 w-full max-w-xs bg-neon text-black font-extrabold text-xs py-3 rounded-lg cursor-pointer hover:bg-neon-dim transition-colors shadow-[0_0_15px_rgba(0,255,102,0.2)]"
                        >
                          Simulasikan Pembayaran Lunas Sekarang
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
    </div>
  );
}
