import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
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

// Load environment variables
dotenv.config();

// Resolve paths for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read Firebase config
import firebaseConfig from './firebase-applet-config.json' assert { type: 'json' };

// Initialize Firebase
const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId || '(default)');

const app = express();
const PORT = 3000;

app.use(express.json());

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

// 1. GET Settings (includes testimonials)
app.get('/api/settings', async (req, res) => {
  try {
    const settingsDocRef = doc(db, 'settings', 'store_settings');
    const settingsSnap = await getDoc(settingsDocRef);
    let storeSettings = {
      price: 149000,
      bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
      bannerTitle: 'R8 Store - Alight Motion Premium 1 Tahun'
    };

    if (settingsSnap.exists()) {
      storeSettings = settingsSnap.data() as typeof storeSettings;
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
      testimonials: testimonials
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. POST Settings (Admin only)
app.post('/api/settings', async (req, res) => {
  try {
    const { price, bannerUrl, bannerTitle, password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin_r8_store';

    if (password !== adminPassword) {
      return res.status(401).json({ error: 'Password admin tidak valid!' });
    }

    const settingsDocRef = doc(db, 'settings', 'store_settings');
    await setDoc(settingsDocRef, {
      price: Number(price),
      bannerUrl: bannerUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
      bannerTitle: bannerTitle || 'R8 Store - Alight Motion Premium 1 Tahun'
    }, { merge: true });

    res.json({ success: true, message: 'Pengaturan berhasil diperbarui!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
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
      const settingsDocRef = doc(db, 'settings', 'store_settings');
      const settingsSnap = await getDoc(settingsDocRef);
      finalPrice = settingsSnap.exists() ? settingsSnap.data().price : 149000;
    }

    const createdAt = now.toISOString();

    // Setup visual payment mocks
    let qrCodeUrl: string | null = null;
    let vaNumber: string | null = null;

    if (paymentMethod === 'QRIS') {
      // Simulate static QR Code mockup for client display
      qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=R8STORE_ALIGHTMOTION_SIMULATION';
    } else if (['Virtual Account', 'VA Mandiri', 'VA BCA', 'VA BNI', 'VA BRI'].includes(paymentMethod) || paymentMethod.includes('Virtual')) {
      const bankCode = paymentMethod.includes('BCA') ? '88012' : paymentMethod.includes('Mandiri') ? '89012' : paymentMethod.includes('BNI') ? '87012' : '82012';
      vaNumber = `${bankCode}${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    }

    const newOrder = {
      id: transactionId,
      email: email.toLowerCase().trim(),
      product: 'Alight Motion Premium 1 Tahun',
      price: finalPrice,
      status: 'Menunggu Pembayaran' as const,
      paymentMethod,
      createdAt,
      updatedAt: createdAt,
      qrCodeUrl,
      vaNumber
    };

    // Save order to Firestore
    await setDoc(doc(db, 'orders', transactionId), newOrder);

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
      return res.status(404).json({ error: 'Pesanan tidak ditemukan!' });
    }

    res.json(orderSnap.data());
  } catch (error: any) {
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
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
      return res.status(404).json({ error: 'Pesanan tidak ditemukan!' });
    }

    const now = new Date().toISOString();
    await updateDoc(orderDocRef, {
      status,
      updatedAt: now
    });

    res.json({ success: true, status, updatedAt: now });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
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
      // For simplicity in this firebase client SDK web wrapper, we're doing a set/update or we can simply delete the testimonial
      // We can delete testimonial doc
      const docRef = doc(db, 'testimonials', id);
      // Let's mark it as inactive or setDoc empty if standard deleteDoc is preferred.
      // Importing deleteDoc from firebase/firestore
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(docRef);
      return res.json({ success: true, message: 'Testimoni berhasil dihapus!' });
    }

    res.status(400).json({ error: 'Aksi tidak valid!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// Vite middleware for development or serving index.html in production
if (process.env.NODE_ENV !== 'production') {
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`R8 Store server running on http://localhost:${PORT}`);
});
