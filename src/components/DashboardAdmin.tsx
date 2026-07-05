import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, ArrowRight, ShieldCheck, TrendingUp, Users, DollarSign, 
  Settings, MessageSquare, ListFilter, Trash2, Edit, RefreshCw, 
  CheckCircle, AlertTriangle, Eye, Edit2, Plus, LogOut, Check, Search, X 
} from 'lucide-react';
import { Order, Testimonial } from '../types';

interface DashboardAdminProps {
  onSettingsUpdated: () => void;
}

export default function DashboardAdmin({ onSettingsUpdated }: DashboardAdminProps) {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Loaded admin state
  const [orders, setOrders] = useState<Order[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [price, setPrice] = useState(149000);
  const [bannerUrl, setBannerUrl] = useState('');
  const [bannerTitle, setBannerTitle] = useState('');

  // Control tabs: 'overview' | 'orders' | 'testimonials' | 'settings'
  const [adminTab, setAdminTab] = useState<'overview' | 'orders' | 'testimonials' | 'settings'>('overview');

  // Modal editing testimonial
  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);
  const [testimonialForm, setTestimonialForm] = useState<{
    id?: string;
    name: string;
    text: string;
    rating: number;
    active: boolean;
  }>({ name: '', text: '', rating: 5, active: true });

  // Filters
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');

  const adminPassword = password || 'admin_r8_store';

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Password salah!');
      }

      setToken(data.token);
      setIsAuthenticated(true);
      
      // Fetch all dynamic settings immediately
      await fetchAdminData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all admin data
  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      // Fetch settings & testimonials
      const settingsRes = await fetch('/api/settings');
      const settingsData = await settingsRes.json();
      setPrice(settingsData.price);
      setBannerUrl(settingsData.bannerUrl);
      setBannerTitle(settingsData.bannerTitle);
      setTestimonials(settingsData.testimonials || []);

      // Fetch all orders
      const ordersRes = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${adminPassword}` }
      });
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Update store settings
  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: Number(price),
          bannerUrl,
          bannerTitle,
          password
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal memperbarui pengaturan.');
      }

      onSettingsUpdated(); // Notify parent of settings update
      alert('Pengaturan berhasil diperbarui!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Update single order status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/order/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          password
        })
      });

      if (!response.ok) {
        throw new Error('Gagal memperbarui status order.');
      }

      // Live refresh orders list state
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Manage Testimonial (save or update)
  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const isEdit = !!testimonialForm.id;
      const response = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isEdit ? 'update' : 'create',
          password,
          ...testimonialForm
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal menyimpan testimoni.');
      }

      setIsTestimonialModalOpen(false);
      await fetchAdminData();
      onSettingsUpdated(); // Refresh parent settings
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Testimonial
  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus testimoni ini?')) return;

    try {
      const response = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          id,
          password
        })
      });

      if (!response.ok) {
        throw new Error('Gagal menghapus testimoni.');
      }

      await fetchAdminData();
      onSettingsUpdated();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Open modal for editing or creating
  const openTestimonialModal = (item?: Testimonial) => {
    if (item) {
      setTestimonialForm({
        id: item.id,
        name: item.name,
        text: item.text,
        rating: item.rating,
        active: item.active
      });
    } else {
      setTestimonialForm({
        name: '',
        text: '',
        rating: 5,
        active: true
      });
    }
    setIsTestimonialModalOpen(true);
  };

  // Calculate statistics
  const totalSales = orders.filter(o => o.status === 'Lunas').reduce((sum, o) => sum + (o.price || 149000), 0);
  const totalOrdersCount = orders.length;
  const successfulOrdersCount = orders.filter(o => o.status === 'Lunas').length;
  const pendingOrdersCount = orders.filter(o => o.status === 'Menunggu Pembayaran').length;
  const failedOrdersCount = orders.filter(o => o.status === 'Gagal').length;

  const formattedCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Filtered orders list
  const filteredOrders = orders.filter(ord => {
    const matchesSearch = ord.id.toLowerCase().includes(orderSearchQuery.toLowerCase()) || 
                          ord.email.toLowerCase().includes(orderSearchQuery.toLowerCase());
    const matchesStatus = orderStatusFilter === 'All' || ord.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
      
      <AnimatePresence mode="wait">
        {/* State A: Login Form */}
        {!isAuthenticated ? (
          <motion.div 
            key="login"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-md mx-auto py-16"
          >
            <form onSubmit={handleLogin} className="glass-panel p-8 rounded-3xl border border-white/5 space-y-6 box-neon-glow relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-neon/10 rounded-full filter blur-2xl"></div>
              
              <div className="text-center space-y-2">
                <div className="inline-flex bg-neon/10 border border-neon/20 p-3.5 rounded-2xl text-neon mb-2 shadow-[0_0_15px_rgba(0,255,102,0.1)]">
                  <Lock className="w-6 h-6 text-neon" />
                </div>
                <h3 className="text-xl font-black text-white tracking-tight">R8 Store Admin Portal</h3>
                <p className="text-xs text-white/50 leading-relaxed font-light">
                  Silakan masukkan kunci sandi administrator untuk mengelola database, harga, testimoni, dan status pesanan.
                </p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4.5 h-4.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/70 block">Password Administrator</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Kunci sandi admin"
                  className="w-full px-4 py-3 rounded-xl text-xs text-white bg-white/5 border border-white/10 focus:border-neon focus:outline-none transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-neon hover:bg-neon-dim text-black font-extrabold text-xs py-4 rounded-xl shadow-[0_0_20px_rgba(0,255,102,0.25)] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Masuk Ke Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        ) : (
          /* State B: Full Admin Workspace */
          <motion.div 
            key="workspace"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Workspace Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
              <div>
                <span className="text-xs text-neon font-black uppercase tracking-widest">Portal Administrator</span>
                <h2 className="text-2xl font-black text-white mt-0.5">R8 Store Control Panel</h2>
              </div>
              
              <button
                onClick={() => setIsAuthenticated(false)}
                className="flex items-center gap-2 text-xs font-bold text-white/60 hover:text-red-400 bg-white/5 hover:bg-red-500/10 px-4 py-2.5 rounded-xl border border-white/5 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>

            {/* Menu Dashboard Sub-Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-white/5 pb-4 overflow-x-auto">
              <button
                onClick={() => setAdminTab('overview')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  adminTab === 'overview'
                    ? 'bg-neon text-black'
                    : 'text-white/60 hover:text-white bg-white/3 hover:bg-white/5'
                }`}
              >
                Statistik Penjualan
              </button>

              <button
                onClick={() => setAdminTab('orders')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  adminTab === 'orders'
                    ? 'bg-neon text-black'
                    : 'text-white/60 hover:text-white bg-white/3 hover:bg-white/5'
                }`}
              >
                Kelola Pesanan ({orders.length})
              </button>

              <button
                onClick={() => setAdminTab('testimonials')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  adminTab === 'testimonials'
                    ? 'bg-neon text-black'
                    : 'text-white/60 hover:text-white bg-white/3 hover:bg-white/5'
                }`}
              >
                Kelola Testimoni
              </button>

              <button
                onClick={() => setAdminTab('settings')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  adminTab === 'settings'
                    ? 'bg-neon text-black'
                    : 'text-white/60 hover:text-white bg-white/3 hover:bg-white/5'
                }`}
              >
                Pengaturan Store
              </button>
            </div>

            {/* Tab Contents Panels */}
            <AnimatePresence mode="wait">
              
              {/* Tab 1: Overview Statistics */}
              {adminTab === 'overview' && (
                <motion.div 
                  key="overview-panel"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Bento Grid Stats Card */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Stat 1 */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/5 relative overflow-hidden flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-white/40 font-black uppercase tracking-wider block">Total Penjualan</span>
                        <span className="text-xl font-black text-neon tracking-tight block mt-1">{formattedCurrency(totalSales)}</span>
                      </div>
                      <div className="bg-[#00ff66]/10 border border-[#00ff66]/20 p-3 rounded-xl text-neon">
                        <DollarSign className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Stat 2 */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/5 relative overflow-hidden flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-white/40 font-black uppercase tracking-wider block">Jumlah Order</span>
                        <span className="text-xl font-black text-white tracking-tight block mt-1">{totalOrdersCount} Pesanan</span>
                      </div>
                      <div className="bg-white/5 border border-white/10 p-3 rounded-xl text-white/70">
                        <Users className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Stat 3 */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/5 relative overflow-hidden flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-white/40 font-black uppercase tracking-wider block">Lunas (Paid)</span>
                        <span className="text-xl font-black text-neon tracking-tight block mt-1">{successfulOrdersCount} Akun</span>
                      </div>
                      <div className="bg-[#00ff66]/10 border border-[#00ff66]/20 p-3 rounded-xl text-neon">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Stat 4 */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/5 relative overflow-hidden flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-white/40 font-black uppercase tracking-wider block">Pending / Failed</span>
                        <span className="text-xl font-black text-yellow-500 tracking-tight block mt-1">{pendingOrdersCount} / {failedOrdersCount}</span>
                      </div>
                      <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-xl text-yellow-500">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Visual Sales Income Chart mockup */}
                  <div className="glass-panel p-6 rounded-2xl border border-white/5">
                    <h3 className="text-xs font-black text-white uppercase tracking-wider border-b border-white/5 pb-3 mb-4">
                      Grafik Penjualan R8 Store (Simulasi Real-Time)
                    </h3>
                    <div className="h-64 flex items-end gap-3.5 border-b border-l border-white/5 pl-5 pb-5">
                      {/* Generates standard responsive visual indicator bars for visual depth */}
                      {[35, 45, 60, 40, 75, 90, 100].map((percent, index) => {
                        const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
                        return (
                          <div key={index} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                            <span className="text-[10px] font-mono text-neon font-extrabold">{percent}%</span>
                            <div 
                              className="w-full bg-neon rounded-t-lg shadow-[0_0_15px_rgba(0,255,102,0.2)] hover:bg-neon-dim transition-colors"
                              style={{ height: `${percent}%` }}
                            ></div>
                            <span className="text-[10px] text-white/40 font-medium">{days[index]}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 2: Orders Manager (Search, edit, update) */}
              {adminTab === 'orders' && (
                <motion.div 
                  key="orders-panel"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {/* Filter Toolbar */}
                  <div className="glass-panel p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative flex-1 w-full">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/35" />
                      <input 
                        type="text" 
                        value={orderSearchQuery}
                        onChange={(e) => setOrderSearchQuery(e.target.value)}
                        placeholder="Cari email pelanggan atau ID Transaksi..."
                        className="w-full pl-11 pr-4 py-2.5 rounded-lg text-xs text-white bg-[#0e0e13] border border-white/5 focus:border-neon focus:outline-none transition-all"
                      />
                    </div>
                    
                    <div className="flex gap-2 w-full sm:w-auto">
                      {['All', 'Lunas', 'Menunggu Pembayaran', 'Gagal'].map(statusFilter => (
                        <button
                          key={statusFilter}
                          onClick={() => setOrderStatusFilter(statusFilter)}
                          className={`flex-1 sm:flex-initial px-3.5 py-2.5 rounded-lg text-[10px] font-extrabold uppercase transition-all whitespace-nowrap cursor-pointer ${
                            orderStatusFilter === statusFilter
                              ? 'bg-neon text-black'
                              : 'bg-white/5 text-white/50 border border-white/5 hover:text-white'
                          }`}
                        >
                          {statusFilter === 'Menunggu Pembayaran' ? 'Pending' : statusFilter}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Orders Data Table */}
                  <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/10 bg-white/2 text-[10px] text-white/40 uppercase font-black tracking-wider">
                            <th className="p-4">Tanggal / ID</th>
                            <th className="p-4">Email AM</th>
                            <th className="p-4">Metode Bayar</th>
                            <th className="p-4 text-right">Harga</th>
                            <th className="p-4 text-center">Status</th>
                            <th className="p-4 text-center">Aksi Status</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs divide-y divide-white/2 font-light">
                          {filteredOrders.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-white/40 font-light">
                                Tidak ada data transaksi yang cocok dengan pencarian Anda.
                              </td>
                            </tr>
                          ) : (
                            filteredOrders.map((ord) => (
                              <tr key={ord.id} className="hover:bg-white/2 transition-colors">
                                <td className="p-4 font-mono">
                                  <span className="block font-bold text-white/95">{ord.id}</span>
                                  <span className="text-[10px] text-white/30">{new Date(ord.createdAt).toLocaleString('id-ID')}</span>
                                </td>
                                <td className="p-4 font-bold text-white/80">{ord.email}</td>
                                <td className="p-4 text-white/60">{ord.paymentMethod}</td>
                                <td className="p-4 text-right font-black text-neon">{formattedCurrency(ord.price)}</td>
                                <td className="p-4 text-center">
                                  <span className={`inline-block text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                                    ord.status === 'Lunas' 
                                      ? 'bg-neon/15 text-neon border border-neon/20' 
                                      : ord.status === 'Menunggu Pembayaran'
                                      ? 'bg-yellow-500/15 text-yellow-500 border border-yellow-500/20'
                                      : 'bg-red-500/15 text-red-500 border border-red-500/20'
                                  }`}>
                                    {ord.status === 'Menunggu Pembayaran' ? 'Pending' : ord.status}
                                  </span>
                                </td>
                                <td className="p-4 text-center flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => handleUpdateOrderStatus(ord.id, 'Lunas')}
                                    className="px-2 py-1 bg-neon/10 hover:bg-neon/20 text-neon border border-neon/20 hover:border-neon rounded font-bold text-[9px] uppercase cursor-pointer"
                                  >
                                    Lunas
                                  </button>
                                  <button
                                    onClick={() => handleUpdateOrderStatus(ord.id, 'Menunggu Pembayaran')}
                                    className="px-2 py-1 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/20 rounded font-bold text-[9px] uppercase cursor-pointer"
                                  >
                                    Pending
                                  </button>
                                  <button
                                    onClick={() => handleUpdateOrderStatus(ord.id, 'Gagal')}
                                    className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded font-bold text-[9px] uppercase cursor-pointer"
                                  >
                                    Batal
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 3: Testimonials manager */}
              {adminTab === 'testimonials' && (
                <motion.div 
                  key="testimonials-panel"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">
                      Daftar Testimoni Pelanggan
                    </h3>
                    
                    <button
                      onClick={() => openTestimonialModal()}
                      className="bg-neon text-black font-extrabold text-[10px] px-3 py-2 rounded-lg cursor-pointer flex items-center gap-1 hover:bg-neon-dim transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Testimoni</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {testimonials.map((t) => (
                      <div key={t.id} className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-white/95 block">{t.name}</span>
                            <span className={`inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              t.active 
                                ? 'bg-neon/10 text-neon border border-neon/20' 
                                : 'bg-white/10 text-white/40 border border-white/10'
                            }`}>
                              {t.active ? 'Aktif' : 'Non-Aktif'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-0.5 mt-2">
                            {[...Array(t.rating)].map((_, idx) => (
                              <span key={idx} className="text-neon text-[10px]">★</span>
                            ))}
                          </div>
                          
                          <p className="text-[11px] italic text-white/60 leading-normal font-light mt-3">
                            "{t.text}"
                          </p>
                        </div>

                        <div className="flex justify-end gap-2 border-t border-white/5 pt-3.5 mt-4">
                          <button
                            onClick={() => openTestimonialModal(t)}
                            className="bg-white/5 hover:bg-white/10 border border-white/10 p-1.5 rounded-lg text-white/70 hover:text-neon cursor-pointer transition-colors"
                            title="Edit Testimoni"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteTestimonial(t.id!)}
                            className="bg-white/5 hover:bg-red-500/10 border border-white/10 p-1.5 rounded-lg text-white/70 hover:text-red-400 cursor-pointer transition-colors"
                            title="Hapus Testimoni"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Tab 4: Pricing & Store settings */}
              {adminTab === 'settings' && (
                <motion.div 
                  key="settings-panel"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <form onSubmit={handleUpdateSettings} className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/5 space-y-6 max-w-xl">
                    <h3 className="text-xs font-black text-white uppercase tracking-wider border-b border-white/5 pb-3">
                      Ubah Rincian Produk & Tampilan Store
                    </h3>

                    {/* Price editor */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-white/70 block">Harga Alight Motion Premium 1 Tahun (IDR)</label>
                      <input 
                        type="number" 
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl text-xs font-mono font-bold text-white bg-white/5 border border-white/10 focus:border-neon focus:outline-none transition-all"
                        required
                      />
                    </div>

                    {/* Banner Title editor */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-white/70 block">Judul Banner Hero Utama</label>
                      <input 
                        type="text" 
                        value={bannerTitle}
                        onChange={(e) => setBannerTitle(e.target.value)}
                        placeholder="Contoh: Alight Motion Premium 1 Tahun"
                        className="w-full px-4 py-3 rounded-xl text-xs font-bold text-white bg-white/5 border border-white/10 focus:border-neon focus:outline-none transition-all"
                        required
                      />
                    </div>

                    {/* Banner URL editor */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-white/70 block">URL Gambar Banner Hero</label>
                      <input 
                        type="url" 
                        value={bannerUrl}
                        onChange={(e) => setBannerUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-4 py-3 rounded-xl text-xs font-mono text-white/80 bg-white/5 border border-white/10 focus:border-neon focus:outline-none transition-all"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-neon hover:bg-neon-dim text-black font-extrabold text-xs py-4 rounded-xl shadow-[0_0_20px_rgba(0,255,102,0.2)] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <span>Simpan Perubahan</span>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Testimonials Add/Edit Modal */}
      {isTestimonialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 w-full max-w-md relative space-y-5"
          >
            <button 
              onClick={() => setIsTestimonialModalOpen(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            <h4 className="text-sm font-black text-white uppercase tracking-wider">
              {testimonialForm.id ? 'Edit Testimoni' : 'Tambah Testimoni Baru'}
            </h4>

            <form onSubmit={handleSaveTestimonial} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/70 block">Nama Pelanggan</label>
                <input 
                  type="text"
                  value={testimonialForm.name}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })}
                  placeholder="Nama pembeli"
                  className="w-full px-4 py-3 rounded-xl text-xs text-white bg-[#0e0e13] border border-white/5 focus:border-neon focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/70 block">Rating Bintang (1 - 5)</label>
                <input 
                  type="number"
                  min="1"
                  max="5"
                  value={testimonialForm.rating}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, rating: Number(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl text-xs text-white bg-[#0e0e13] border border-white/5 focus:border-neon focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/70 block">Isi Testimoni</label>
                <textarea 
                  rows={4}
                  value={testimonialForm.text}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, text: e.target.value })}
                  placeholder="Review jujur pelanggan..."
                  className="w-full px-4 py-3 rounded-xl text-xs text-white bg-[#0e0e13] border border-white/5 focus:border-neon focus:outline-none resize-none"
                  required
                />
              </div>

              <div className="flex items-center gap-2.5">
                <input 
                  type="checkbox"
                  id="testi-active"
                  checked={testimonialForm.active}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, active: e.target.checked })}
                  className="w-4.5 h-4.5 rounded text-neon bg-[#0e0e13] border-white/5 focus:ring-neon accent-neon cursor-pointer"
                />
                <label htmlFor="testi-active" className="text-xs font-semibold text-white/70 cursor-pointer">
                  Tampilkan Testimoni di Store (Aktif)
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-neon hover:bg-neon-dim text-black font-extrabold text-xs py-3.5 rounded-xl cursor-pointer"
              >
                {isLoading ? 'Menyimpan...' : 'Simpan Testimoni'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
