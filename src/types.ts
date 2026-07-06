export type OrderStatus = 'Menunggu Pembayaran' | 'Lunas' | 'Gagal';

export interface Order {
  id: string; // e.g. R8-AM-20260705-000001
  email: string;
  product: string;
  price: number;
  status: OrderStatus;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  qrCodeUrl?: string | null;
  vaNumber?: string | null;
  paymentCode?: string | null;
  proofOfPaymentUrl?: string | null;
  proofOfPaymentUploadedAt?: string | null;
}

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
  date: string;
  active: boolean;
}

export interface StoreSettings {
  price: number;
  bannerUrl: string;
  bannerTitle: string;
}
