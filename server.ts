import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  getDocs, 
  where, 
  orderBy, 
  addDoc,
  limit
} from 'firebase/firestore';
import dotenv from 'dotenv';
import fs from 'fs';
import firebaseConfig from './firebase-applet-config.json';

// Load environment variables
dotenv.config();

function getDirectGoogleDriveImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.includes('lh3.googleusercontent.com')) return url;
  if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
    const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`;
    }
    const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idParamMatch && idParamMatch[1]) {
      return `https://drive.google.com/uc?export=view&id=${idParamMatch[1]}`;
    }
  }
  return url;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Resolve paths for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase
const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId || '(default)');

export const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Detect Vercel environment
const isVercel = process.env.VERCEL === '1' || process.env.NOW_REGION !== undefined;
const dataDir = isVercel ? '/tmp' : process.cwd();

// Local storage files for fail-safe persistence fallback
const SETTINGS_FILE = path.join(dataDir, 'settings.json');
const TESTIMONIALS_FILE = path.join(dataDir, 'testimonials.json');
const ORDERS_FILE = path.join(dataDir, 'orders.json');

// Initialize local fallback files
function initLocalFiles() {
  try {
    if (isVercel) {
      const readOnlySettings = path.join(process.cwd(), 'settings.json');
      const readOnlyTestimonials = path.join(process.cwd(), 'testimonials.json');
      const readOnlyOrders = path.join(process.cwd(), 'orders.json');

      if (!fs.existsSync(SETTINGS_FILE) && fs.existsSync(readOnlySettings)) {
        fs.copyFileSync(readOnlySettings, SETTINGS_FILE);
      }
      if (!fs.existsSync(TESTIMONIALS_FILE) && fs.existsSync(readOnlyTestimonials)) {
        fs.copyFileSync(readOnlyTestimonials, TESTIMONIALS_FILE);
      }
      if (!fs.existsSync(ORDERS_FILE) && fs.existsSync(readOnlyOrders)) {
        fs.copyFileSync(readOnlyOrders, ORDERS_FILE);
      }
    }

    if (!fs.existsSync(SETTINGS_FILE)) {
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify({
        price: 149000,
        bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
        bannerTitle: 'R8 Store - Alight Motion Premium 1 Tahun',
        qrisUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=R8STORE_ALIGHTMOTION_SIMULATION',
        whatsapp: '6282114757375'
      }, null, 2));
    } else {
      // Migrating existing file if missing properties
      const data = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
      let modified = false;
      if (!data.qrisUrl) {
        data.qrisUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=R8STORE_ALIGHTMOTION_SIMULATION';
        modified = true;
      }
      if (!data.whatsapp) {
        data.whatsapp = '6282114757375';
        modified = true;
      }
      if (modified) {
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2));
      }
    }
    if (!fs.existsSync(TESTIMONIALS_FILE)) {
      fs.writeFileSync(TESTIMONIALS_FILE, JSON.stringify([
        {
          id: 'test-1',
          name: 'Budi Setiawan',
          text: 'Proses instan banget! Gak nyampe 5 menit premiumnya udah aktif di email. Seller ramah pol!',
          rating: 5,
          date: '2026-07-04',
          active: true
        },
        {
          id: 'test-2',
          name: 'Amalia Rizky',
          text: 'Awalnya ragu karena harganya murah, ternyata beneran premium 1 tahun full. Desain webnya juga keren bgt modern.',
          rating: 5,
          date: '2026-07-03',
          active: true
        },
        {
          id: 'test-3',
          name: 'Farhan Kurnia',
          text: 'Sangat membantu buat nge-edit jedag jedug di Alight Motion. Tanpa watermark, semua efek kebuka. R8 Store is the best!',
          rating: 5,
          date: '2026-07-02',
          active: true
        }
      ], null, 2));
    }
    if (!fs.existsSync(ORDERS_FILE)) {
      fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2));
    }
    console.log('Local fallback JSON files verified successfully.');
  } catch (err: any) {
    console.error('Error initializing local fallback files:', err.message);
  }
}
initLocalFiles();

// Helper to seed database with default values if empty
async function seedDatabaseIfEmpty() {
  try {
    // 1. Seed Settings
    const settingsDocRef = doc(db, 'settings', 'store_settings');
    const settingsSnap = await getDoc(settingsDocRef);
    if (!settingsSnap.exists()) {
      console.log('Seeding store settings...');
      await setDoc(settingsDocRef, {
        price: 149000,
        bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
        bannerTitle: 'R8 Store - Alight Motion Premium 1 Tahun'
      });
    }

    // 2. Seed Testimonials
    const testimonialsColRef = collection(db, 'testimonials');
    const testimonialSnap = await getDocs(query(testimonialsColRef, limit(1)));
    if (testimonialSnap.empty) {
      console.log('Seeding testimonials...');
      const defaultTestimonials = [
        {
          name: 'Budi Setiawan',
          text: 'Proses instan banget! Gak nyampe 5 menit premiumnya udah aktif di email. Seller ramah pol!',
          rating: 5,
          date: '2026-07-04',
          active: true
        },
        {
          name: 'Amalia Rizky',
          text: 'Awalnya ragu karena harganya murah, ternyata beneran premium 1 tahun full. Desain webnya juga keren bgt modern.',
          rating: 5,
          date: '2026-07-03',
          active: true
        },
        {
          name: 'Farhan Kurnia',
          text: 'Sangat membantu buat nge-edit jedag jedug di Alight Motion. Tanpa watermark, semua efek kebuka. R8 Store is the best!',
          rating: 5,
          date: '2026-07-02',
          active: true
        }
      ];

      for (const t of defaultTestimonials) {
        await addDoc(testimonialsColRef, t);
      }
    }
    console.log('Database seeding checked successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Seed on server startup
seedDatabaseIfEmpty();

// --- API ROUTES ---

// CORS-free image proxy download
app.get('/api/download', async (req, res) => {
  const targetUrl = req.query.url as string;
  if (!targetUrl) {
    return res.status(400).send('URL is required');
  }
  try {
    const response = await fetch(targetUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.setHeader('Content-Type', response.headers.get('Content-Type') || 'image/png');
    res.setHeader('Content-Disposition', 'attachment; filename="QRIS-R8-Store.png"');
    res.send(buffer);
  } catch (error: any) {
    console.error('Download proxy error, falling back to direct redirect:', error.message);
    res.redirect(targetUrl);
  }
});

// 1. GET Settings (includes testimonials)
app.get('/api/settings', async (req, res) => {
  try {
    const settingsDocRef = doc(db, 'settings', 'store_settings');
    const settingsSnap = await getDoc(settingsDocRef);
    let storeSettings = {
      price: 149000,
      bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
      bannerTitle: 'R8 Store - Alight Motion Premium 1 Tahun',
      qrisUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=R8STORE_ALIGHTMOTION_SIMULATION',
      whatsapp: '6282114757375'
    };

    if (settingsDocRef && settingsSnap.exists()) {
      storeSettings = { ...storeSettings, ...settingsSnap.data() };
    }

    // Fetch active testimonials
    const testimonialsColRef = collection(db, 'testimonials');
    const testimonialSnap = await getDocs(query(testimonialsColRef));
    const testimonials: any[] = [];
    testimonialSnap.forEach((doc) => {
      testimonials.push({ id: doc.id, ...doc.data() });
    });

    res.json({
      price: storeSettings.price,
      bannerUrl: storeSettings.bannerUrl,
      bannerTitle: storeSettings.bannerTitle,
      qrisUrl: storeSettings.qrisUrl,
      whatsapp: storeSettings.whatsapp,
      testimonials: testimonials
    });
  } catch (error: any) {
    console.log('Firestore GET settings failed, falling back to local file storage:', error.message);
    try {
      const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
      const testimonials = JSON.parse(fs.readFileSync(TESTIMONIALS_FILE, 'utf-8'));
      res.json({
        price: settings.price,
        bannerUrl: settings.bannerUrl,
        bannerTitle: settings.bannerTitle,
        qrisUrl: settings.qrisUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=R8STORE_ALIGHTMOTION_SIMULATION',
        whatsapp: settings.whatsapp || '6282114757375',
        testimonials: testimonials
      });
    } catch (localErr: any) {
      res.status(500).json({ error: localErr.message });
    }
  }
});

// 2. POST Settings (Admin only)
app.post('/api/settings', async (req, res) => {
  try {
    const { price, bannerUrl, bannerTitle, qrisUrl, whatsapp, password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin_r8_store';

    if (password !== adminPassword) {
      return res.status(401).json({ error: 'Password admin tidak valid!' });
    }

    const settingsDocRef = doc(db, 'settings', 'store_settings');
    await setDoc(settingsDocRef, {
      price: Number(price),
      bannerUrl: bannerUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
      bannerTitle: bannerTitle || 'R8 Store - Alight Motion Premium 1 Tahun',
      qrisUrl: qrisUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=R8STORE_ALIGHTMOTION_SIMULATION',
      whatsapp: whatsapp || '6282114757375'
    }, { merge: true });

    res.json({ success: true, message: 'Pengaturan berhasil diperbarui!' });
  } catch (error: any) {
    console.log('Firestore POST settings failed, falling back to local file storage:', error.message);
    try {
      const { price, bannerUrl, bannerTitle, qrisUrl, whatsapp } = req.body;
      const settings = {
        price: Number(price),
        bannerUrl: bannerUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
        bannerTitle: bannerTitle || 'R8 Store - Alight Motion Premium 1 Tahun',
        qrisUrl: qrisUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=R8STORE_ALIGHTMOTION_SIMULATION',
        whatsapp: whatsapp || '6282114757375'
      };
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
      res.json({ success: true, message: 'Pengaturan berhasil diperbarui (Local)!' });
    } catch (localErr: any) {
      res.status(500).json({ error: localErr.message });
    }
  }
});

// 3. Admin Login Validation
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin_r8_store';

  if (password === adminPassword) {
    res.json({ success: true, token: 'r8_admin_token_2026' });
  } else {
    res.status(401).json({ error: 'Password admin salah!' });
  }
});

// 4. Create Order (Checkout)
app.post('/api/checkout', async (req, res) => {
  try {
    const { email, confirmEmail, paymentMethod, price } = req.body;

    if (!email || !confirmEmail || !paymentMethod) {
      return res.status(400).json({ error: 'Semua field wajib diisi!' });
    }

    if (email.toLowerCase().trim() !== confirmEmail.toLowerCase().trim()) {
      return res.status(400).json({ error: 'Email konfirmasi tidak sama!' });
    }

    // Generate Unique Transaction ID
    // Format: R8-AM-YYYYMMDD-XXXXXX where XXXXXX is random 6-digits
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const date = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${date}`;
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const transactionId = `R8-AM-${dateStr}-${randomDigits}`;

    // Get current settings to ensure accurate price if not provided
    let finalPrice = Number(price);
    if (!finalPrice) {
      try {
        const settingsDocRef = doc(db, 'settings', 'store_settings');
        const settingsSnap = await getDoc(settingsDocRef);
        finalPrice = settingsSnap.exists() ? settingsSnap.data().price : 149000;
      } catch (err) {
        const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
        finalPrice = settings.price || 149000;
      }
    }

    const createdAt = now.toISOString();

    // Fetch custom qrisUrl from settings
    let configuredQrisUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=R8STORE_ALIGHTMOTION_SIMULATION';
    try {
      const settingsDocRef = doc(db, 'settings', 'store_settings');
      const settingsSnap = await getDoc(settingsDocRef);
      if (settingsSnap.exists() && settingsSnap.data().qrisUrl) {
        configuredQrisUrl = settingsSnap.data().qrisUrl;
      } else {
        const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
        if (settings.qrisUrl) {
          configuredQrisUrl = settings.qrisUrl;
        }
      }
    } catch (err) {
      try {
        const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
        if (settings.qrisUrl) {
          configuredQrisUrl = settings.qrisUrl;
        }
      } catch (localErr) {}
    }

    const qrCodeUrl = getDirectGoogleDriveImageUrl(configuredQrisUrl);
    const finalPaymentMethod = 'QRIS All Payment';

    const newOrder = {
      id: transactionId,
      email: email.toLowerCase().trim(),
      product: 'Alight Motion Premium 1 Tahun',
      price: finalPrice,
      status: 'Menunggu Pembayaran' as const,
      paymentMethod: finalPaymentMethod,
      createdAt,
      updatedAt: createdAt,
      qrCodeUrl,
      vaNumber: null,
      paymentCode: null
    };

    // Save order to Firestore or local
    try {
      await setDoc(doc(db, 'orders', transactionId), newOrder);
    } catch (dbErr: any) {
      console.log('Firestore setDoc failed during checkout, using local file fallback:', dbErr.message);
      const orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'));
      orders.push(newOrder);
      fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
    }

    res.json(newOrder);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Get Order Details (Search ID or View Details)
app.get('/api/order/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const orderDocRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderDocRef);

    if (!orderSnap.exists()) {
      // Try local file first before returning 404
      const orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'));
      const order = orders.find((o: any) => o.id === orderId);
      if (order) {
        return res.json(order);
      }
      return res.status(404).json({ error: 'Pesanan tidak ditemukan!' });
    }

    res.json(orderSnap.data());
  } catch (error: any) {
    console.log('Firestore GET order failed, falling back to local file storage:', error.message);
    try {
      const orderId = req.params.id;
      const orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'));
      const order = orders.find((o: any) => o.id === orderId);
      if (!order) {
        return res.status(404).json({ error: 'Pesanan tidak ditemukan!' });
      }
      res.json(order);
    } catch (localErr: any) {
      res.status(500).json({ error: localErr.message });
    }
  }
});

// 6. Get User Orders (History based on email)
app.get('/api/user/orders', async (req, res) => {
  try {
    const email = req.query.email as string;
    if (!email) {
      return res.status(400).json({ error: 'Email wajib disertakan!' });
    }

    const ordersColRef = collection(db, 'orders');
    const q = query(ordersColRef, where('email', '==', email.toLowerCase().trim()));
    const querySnapshot = await getDocs(q);

    const orders: any[] = [];
    querySnapshot.forEach((doc) => {
      orders.push(doc.data());
    });

    // Sort by createdAt descending
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json(orders);
  } catch (error: any) {
    console.log('Firestore GET user orders failed, falling back to local file storage:', error.message);
    try {
      const email = (req.query.email as string).toLowerCase().trim();
      const orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'));
      const filteredOrders = orders.filter((o: any) => o.email === email);
      filteredOrders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      res.json(filteredOrders);
    } catch (localErr: any) {
      res.status(500).json({ error: localErr.message });
    }
  }
});

// 7. GET All Orders (Admin only)
app.get('/api/orders', async (req, res) => {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin_r8_store';
    const authHeader = req.headers.authorization;

    if (!authHeader || authHeader !== `Bearer ${adminPassword}`) {
      return res.status(401).json({ error: 'Unauthorized!' });
    }

    const ordersColRef = collection(db, 'orders');
    const querySnapshot = await getDocs(ordersColRef);

    const orders: any[] = [];
    querySnapshot.forEach((doc) => {
      orders.push(doc.data());
    });

    // Sort by createdAt descending
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json(orders);
  } catch (error: any) {
    console.log('Firestore GET all orders failed, falling back to local file storage:', error.message);
    try {
      const orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'));
      orders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      res.json(orders);
    } catch (localErr: any) {
      res.status(500).json({ error: localErr.message });
    }
  }
});

// 8. Update Order Status (Admin or Simulation trigger)
app.post('/api/order/:id/status', async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status, password, isSimulation } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status wajib diisi!' });
    }

    const adminPassword = process.env.ADMIN_PASSWORD || 'admin_r8_store';
    
    // Accept if it's either an authentic admin or a client-side sandbox payment simulation action
    if (!isSimulation && password !== adminPassword) {
      return res.status(401).json({ error: 'Unauthorized password!' });
    }

    const orderDocRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderDocRef);

    if (!orderSnap.exists()) {
      // Try updating local file first before returning 404
      const orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'));
      const orderIndex = orders.findIndex((o: any) => o.id === orderId);
      if (orderIndex !== -1) {
        const now = new Date().toISOString();
        orders[orderIndex].status = status;
        orders[orderIndex].updatedAt = now;
        fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
        return res.json({ success: true, status, updatedAt: now });
      }
      return res.status(404).json({ error: 'Pesanan tidak ditemukan!' });
    }

    const now = new Date().toISOString();
    await updateDoc(orderDocRef, {
      status,
      updatedAt: now
    });

    res.json({ success: true, status, updatedAt: now });
  } catch (error: any) {
    console.log('Firestore POST order status failed, falling back to local file storage:', error.message);
    try {
      const orderId = req.params.id;
      const { status } = req.body;
      const orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'));
      const orderIndex = orders.findIndex((o: any) => o.id === orderId);
      if (orderIndex === -1) {
        return res.status(404).json({ error: 'Pesanan tidak ditemukan!' });
      }
      const now = new Date().toISOString();
      orders[orderIndex].status = status;
      orders[orderIndex].updatedAt = now;
      fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
      res.json({ success: true, status, updatedAt: now });
    } catch (localErr: any) {
      res.status(500).json({ error: localErr.message });
    }
  }
});

// 8.5 Upload Proof of Payment (Bukti Transfer)
app.post('/api/order/:id/proof', async (req, res) => {
  try {
    const orderId = req.params.id;
    const { proofOfPaymentUrl } = req.body;

    if (!proofOfPaymentUrl) {
      return res.status(400).json({ error: 'Link bukti pembayaran wajib diisi!' });
    }

    const orderDocRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderDocRef);
    const now = new Date().toISOString();

    if (!orderSnap.exists()) {
      // Try local file storage first before returning 404
      const orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'));
      const orderIndex = orders.findIndex((o: any) => o.id === orderId);
      if (orderIndex !== -1) {
        orders[orderIndex].proofOfPaymentUrl = proofOfPaymentUrl;
        orders[orderIndex].proofOfPaymentUploadedAt = now;
        orders[orderIndex].updatedAt = now;
        fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
        return res.json({ success: true, proofOfPaymentUrl, proofOfPaymentUploadedAt: now });
      }
      return res.status(404).json({ error: 'Pesanan tidak ditemukan!' });
    }

    await updateDoc(orderDocRef, {
      proofOfPaymentUrl,
      proofOfPaymentUploadedAt: now,
      updatedAt: now
    });

    res.json({ success: true, proofOfPaymentUrl, proofOfPaymentUploadedAt: now });
  } catch (error: any) {
    console.log('Firestore POST proof failed, falling back to local file storage:', error.message);
    try {
      const orderId = req.params.id;
      const { proofOfPaymentUrl } = req.body;
      const orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'));
      const orderIndex = orders.findIndex((o: any) => o.id === orderId);
      if (orderIndex === -1) {
        return res.status(404).json({ error: 'Pesanan tidak ditemukan!' });
      }
      const now = new Date().toISOString();
      orders[orderIndex].proofOfPaymentUrl = proofOfPaymentUrl;
      orders[orderIndex].proofOfPaymentUploadedAt = now;
      orders[orderIndex].updatedAt = now;
      fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
      res.json({ success: true, proofOfPaymentUrl, proofOfPaymentUploadedAt: now });
    } catch (localErr: any) {
      res.status(500).json({ error: localErr.message });
    }
  }
});

// 9. Manage Testimonials (Admin add/delete/toggle)
app.post('/api/testimonials', async (req, res) => {
  try {
    const { action, id, name, text, rating, active, password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin_r8_store';

    if (password !== adminPassword) {
      return res.status(401).json({ error: 'Unauthorized password!' });
    }

    const testimonialsColRef = collection(db, 'testimonials');

    if (action === 'create') {
      const newTestimonial = {
        name,
        text,
        rating: Number(rating) || 5,
        date: new Date().toISOString().split('T')[0],
        active: active !== undefined ? active : true
      };
      const docRef = await addDoc(testimonialsColRef, newTestimonial);
      return res.json({ success: true, id: docRef.id, ...newTestimonial });
    }

    if (action === 'update' && id) {
      const docRef = doc(db, 'testimonials', id);
      await updateDoc(docRef, {
        name,
        text,
        rating: Number(rating) || 5,
        active: active !== undefined ? active : true
      });
      return res.json({ success: true, message: 'Testimoni berhasil diperbarui!' });
    }

    if (action === 'delete' && id) {
      const docRef = doc(db, 'testimonials', id);
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(docRef);
      return res.json({ success: true, message: 'Testimoni berhasil dihapus!' });
    }

    res.status(400).json({ error: 'Aksi tidak valid!' });
  } catch (error: any) {
    console.log('Firestore POST testimonials failed, falling back to local file storage:', error.message);
    try {
      const { action, id, name, text, rating, active } = req.body;
      const testimonials = JSON.parse(fs.readFileSync(TESTIMONIALS_FILE, 'utf-8'));

      if (action === 'create') {
        const newTestimonial = {
          id: `local-${Date.now()}`,
          name,
          text,
          rating: Number(rating) || 5,
          date: new Date().toISOString().split('T')[0],
          active: active !== undefined ? active : true
        };
        testimonials.push(newTestimonial);
        fs.writeFileSync(TESTIMONIALS_FILE, JSON.stringify(testimonials, null, 2));
        return res.json({ success: true, ...newTestimonial });
      }

      if (action === 'update' && id) {
        const index = testimonials.findIndex((t: any) => t.id === id);
        if (index === -1) {
          return res.status(404).json({ error: 'Testimoni tidak ditemukan!' });
        }
        testimonials[index] = {
          ...testimonials[index],
          name: name || testimonials[index].name,
          text: text || testimonials[index].text,
          rating: rating !== undefined ? Number(rating) : testimonials[index].rating,
          active: active !== undefined ? active : testimonials[index].active
        };
        fs.writeFileSync(TESTIMONIALS_FILE, JSON.stringify(testimonials, null, 2));
        return res.json({ success: true, message: 'Testimoni berhasil diperbarui!' });
      }

      if (action === 'delete' && id) {
        const filtered = testimonials.filter((t: any) => t.id !== id);
        fs.writeFileSync(TESTIMONIALS_FILE, JSON.stringify(filtered, null, 2));
        return res.json({ success: true, message: 'Testimoni berhasil dihapus!' });
      }

      res.status(400).json({ error: 'Aksi tidak valid!' });
    } catch (localErr: any) {
      res.status(500).json({ error: localErr.message });
    }
  }
});


// Vite middleware for development or serving index.html in production
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Only call app.listen if not running as a Vercel Serverless Function
if (process.env.VERCEL !== '1' && process.env.NOW_REGION === undefined) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`R8 Store server running on http://localhost:${PORT}`);
  });
}
