import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, MOCK_PRODUCTS } from './data';
import { sha256Sync } from './utils';
import { db, OperationType, handleFirestoreError } from './firebase';
import { doc, setDoc, updateDoc, deleteDoc, collection } from 'firebase/firestore';

export interface CartItem extends Product {
  cartItemId: string;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  status: 'Active' | 'Hidden';
  subcategories: string[];
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
  selectedSize?: string;
  selectedColor?: string;
}

export interface Order {
  id: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
  altPhone?: string;
  city: string;
  deliveryAreaId: string;
  deliveryAreaName: string;
  paymentMethod: string;
  paymentStatus: 'Paid' | 'Unpaid';
  trxId?: string;
  cart: string[]; // item summary labels
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  date: string;
  timestamp: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  ordersCount: number;
  spent: number;
  status: 'Active' | 'Blocked';
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number; // percentage (e.g. 10 for 10%) or currency amount (e.g. 200 for ৳২০০)
  minSpend: number;
  expiryDate: string;
  totalUsage: number;
  status: 'Active' | 'Inactive';
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  position: number;
  status: 'Active' | 'Inactive';
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  reviewerName: string;
  reviewerEmail: string;
  rating: number;
  comment: string;
  status: 'Pending' | 'Approved';
  date: string;
}

export interface Faq {
  id: string;
  q: string;
  a: string;
}

export interface StaffRole {
  id: string;
  name: string;
  email: string;
  role: 'Administrator' | 'Manager' | 'Support Agent' | 'Editor';
  status: 'Active' | 'Inactive';
  permissions: string[];
  passwordHash?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  ipAddress?: string;
}

export interface SupportMessage {
  id: string;
  sender: 'customer' | 'admin';
  text: string;
  timestamp: string;
}

export interface SupportChat {
  id: string;
  customerName: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  messages: SupportMessage[];
}

interface DeliveryOption {
  id: string;
  active: boolean;
  name: string;
  time: string;
  charge: number;
}

interface NavItem {
  id: string;
  label: string;
  url: string;
}

export interface SiteSettings {
  storeName: string;
  announcementText: string;
  description: string;
  aboutUsText?: string;
  faviconUrl: string;
  headerLogoUrl: string;
  footerLogoUrl: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  headOfficeAddress: string;
  socialLinks: {
    facebook: string;
    youtube: string;
    whatsapp: string;
    telegram: string;
    instagram: string;
  };
  deliveryOptions: DeliveryOption[];
  whatsappOrderAlertNumber: string;
  checkoutForm: {
    nameLabel: string;
    phoneLabel: string;
    addressLabel: string;
    emailLabel: string;
    altPhoneLabel: string;
    cityLabel: string;
  };
  colors: {
    primary: string;
  };
  navigation: NavItem[];
  megaOfferText?: string;
}

interface StoreState {
  cart: CartItem[];
  products: Product[];
  categories: Category[];
  orders: Order[];
  customers: Customer[];
  coupons: Coupon[];
  banners: Banner[];
  reviews: Review[];
  roles: StaffRole[];
  auditLogs: AuditLog[];
  supportChats: SupportChat[];
  wishlist: Product[];
  faqs: Faq[];
  siteSettings: SiteSettings;
  isAdminAuthenticated: boolean;
  currentStaff: StaffRole | null;
  isUserAuthenticated: boolean;
  user: { name: string; email: string; phone: string } | null;
  adminCredentials: { username: string; password: string };
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  
  // Cart operations
  addToCart: (product: Product, quantity?: number, selectedSize?: string, selectedColor?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: () => number;
  toggleWishlist: (product: Product) => void;

  // Authentication
  setAdminAuthenticated: (status: boolean, staff?: StaffRole | null) => void;
  updateAdminCredentials: (username: string, password: string) => void;
  setUserAuthenticated: (status: boolean, user?: { name: string; email: string; phone: string }) => void;
  logoutUser: () => void;

  // General Settings
  updateSiteSettings: (settings: SiteSettings) => void;
  addFaq: (faq: Faq) => void;
  updateFaq: (faq: Faq) => void;
  deleteFaq: (id: string) => void;

  // Product Operations
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;

  // Category Operations
  addCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;

  // Order Operations
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  updateOrderPaymentStatus: (id: string, paymentStatus: Order['paymentStatus']) => void;
  deleteOrder: (id: string) => void;

  // Customer Operations
  addCustomer: (customer: Customer) => void;
  toggleCustomerStatus: (id: string) => void;

  // Coupon Operations
  addCoupon: (coupon: Coupon) => void;
  updateCoupon: (coupon: Coupon) => void;
  deleteCoupon: (id: string) => void;
  incrementCouponUsage: (code: string) => void;

  // Banner Operations
  addBanner: (banner: Banner) => void;
  updateBanner: (banner: Banner) => void;
  deleteBanner: (id: string) => void;

  // Review Operations
  addReview: (review: Review) => void;
  approveReview: (id: string) => void;
  deleteReview: (id: string) => void;

  // Staff Roles Operations
  addStaff: (staff: StaffRole) => void;
  updateStaff: (staff: StaffRole) => void;
  deleteStaff: (id: string) => void;

  // Live Support Operations
  addSupportChat: (chat: SupportChat) => void;
  sendSupportMessage: (chatId: string, message: SupportMessage) => void;
  markChatAsRead: (chatId: string) => void;

  // Audit Logs
  addAuditLog: (action: string, user?: string) => void;
  clearAuditLogs: () => void;
}

// Initial seed data
const initialCategories: Category[] = [
  { id: 'cat-0', name: 'স্মার্ট ঘড়ি', status: 'Active', image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=400', subcategories: ['Smart Watches', 'Metal Straps'] },
  { id: 'cat-1', name: 'টি শার্ট', status: 'Active', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=400', subcategories: ['Polo Shirt', 'Oversized T-shirt'] },
  { id: 'cat-2', name: 'পাওয়ার ব্যাংক', status: 'Active', image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&q=80&w=400', subcategories: ['Fast Charger', 'Wireless Charging'] },
  { id: 'cat-3', name: 'ইয়ারবার্ড', status: 'Active', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=400', subcategories: ['Bluetooth Earbuds', 'Noise Cancelling'] },
  { id: 'cat-4', name: 'মাইক্রোফোন', status: 'Active', image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=400', subcategories: ['Wireless Mic', 'Condenser Mic'] },
  { id: 'cat-5', name: 'পাঞ্জাবি', status: 'Active', image: 'https://images.unsplash.com/photo-1593030761756-168f6b86dcf3?auto=format&fit=crop&q=80&w=400', subcategories: ['Semi-Long Punjabi', 'Exclusive Punjabi'] },
  { id: 'cat-6', name: 'হেডফোন', status: 'Active', image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=400', subcategories: ['Over Ear Headphone', 'Gaming Headset'] },
];

const initialBanners: Banner[] = [
  { id: 'ban-1', title: 'ঈদ স্পেশাল মেগা সেল', subtitle: 'সব প্রোডাক্টে আকর্ষণীয় মূল্যছাড়!', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1200', position: 1, status: 'Active' },
  { id: 'ban-2', title: 'প্রিমিয়াম এক্সেসরিজ', subtitle: 'কোয়ালিটি গ্যারান্টি সহ দ্রুত ডেলিভারি', image: 'https://images.unsplash.com/photo-1468436139062-f60a71c5c892?auto=format&fit=crop&q=80&w=1200', position: 2, status: 'Active' }
];

const initialFaqs: Faq[] = [
  { id: 'faq-1', q: "অর্ডার করার পর ফাইল কিভাবে পাবো?", a: "পেমেন্ট সফল হওয়ার সাথে সাথে আপনার কাস্টমার ড্যাশবোর্ডের 'ক্রয়কৃত ডাউনলোডস' ট্যাবে ফাইলের সোর্স জিপ লিংক সক্রিয় হয়ে যাবে। সেখান থেকে যেকোনো সময় ডাউনলোড করতে পারবেন।" },
  { id: 'faq-2', q: "লাইসেন্স কি-র মেয়াদ কতদিন থাকবে?", a: "আমাদের এখানে সোর্স কোড বা থিম প্লাগইনগুলোর লাইসেন্স মূলত লাইফটাইম। অর্থাৎ আপনি একবার ক্রয় করলে আজীবন আপডেট এবং কোড ব্যবহার করতে পারবেন।" },
  { id: 'faq-3', q: "বিকাশ বা নগদ ট্রানজেকশনে কিভাবে পেমেন্ট সম্পন্ন করবো?", a: "চেকআউট পাতায় বিকাশ, নগদ বা নগদ-রকেটের কাস্টম ওয়ালেট সিলেক্ট করে সেখানে উল্লেখিত নম্বরে সেন্ডমানি করে ট্রানজেকশন আইডি ইনপুট দিলে পেমেন্ট সেকেন্ডের মধ্যে ভেরিফাই হয়ে যাবে।" },
  { id: 'faq-4', q: "কোড সেটআপে যেকোনো সমস্যা বা বাগে সাপোর্ট পাবো কিভাবে?", a: "কোনো সমস্যা নেই! আপনার ড্যাশবোর্ডে গিয়ে আমাদের 'টিকিট সাপোর্ট ডেস্ক' বা লাইভ চ্যাটে একটি টিকিট বা মেসেজ ওপেন করলে আমাদের সিনিয়র সফ্টওয়্যার ইঞ্জিনিয়াররা ২৪ ঘণ্টার মধ্যে সর্বোচ্চ সহায়তা প্রদান করবেন।" }
];

const initialCoupons: Coupon[] = [
  { id: 'cp-1', code: 'EID2026', discountType: 'percentage', discountValue: 20, minSpend: 1000, expiryDate: '2026-06-30', totalUsage: 45, status: 'Active' },
  { id: 'cp-2', code: 'FREESHIP', discountType: 'fixed', discountValue: 120, minSpend: 2000, expiryDate: '2026-07-15', totalUsage: 112, status: 'Active' },
  { id: 'cp-3', code: 'DISCOUNT10', discountType: 'percentage', discountValue: 10, minSpend: 500, expiryDate: '2026-12-31', totalUsage: 89, status: 'Active' },
];

const initialCustomers: Customer[] = [
  { id: '#USR-001', name: 'রাহিম হাসান', email: 'rahim@example.com', phone: '01711223344', ordersCount: 12, spent: 12400, status: 'Active', createdAt: '2026-01-15' },
  { id: '#USR-002', name: 'জনাব তানভীর', email: 'tanvir@example.com', phone: '01811223344', ordersCount: 5, spent: 3200, status: 'Active', createdAt: '2026-02-20' },
  { id: '#USR-003', name: 'সাইফুল ইসলাম', email: 'saiful@example.com', phone: '01911223344', ordersCount: 1, spent: 1500, status: 'Blocked', createdAt: '2026-03-10' },
  { id: '#USR-004', name: 'নাঈমুর রহমান', email: 'nayem@example.com', phone: '01611223344', ordersCount: 24, spent: 45200, status: 'Active', createdAt: '2026-04-05' },
];

const initialOrders: Order[] = [
  {
    id: '#ORD-001',
    name: 'রাহিম হাসান',
    phone: '01711223344',
    address: 'বাড়ি নং ১২, রোড ৫, গুলশান ১',
    city: 'ঢাকা',
    deliveryAreaId: 'dhaka',
    deliveryAreaName: 'ঢাকার ভিতরে',
    paymentMethod: 'cod',
    paymentStatus: 'Unpaid',
    cart: ['T55 Series 8 Smart Watch (x2)'],
    items: [
      { productId: '1', name: 'T55 Series 8 Smart Watch', quantity: 2, price: 1200, image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=400' }
    ],
    subtotal: 2400,
    discount: 0,
    deliveryCharge: 60,
    total: 2460,
    status: 'Pending',
    date: '২৬ মে, ২০২৬',
    timestamp: '2026-05-26T04:20:00Z'
  },
  {
    id: '#ORD-002',
    name: 'জনাব তানভীর',
    phone: '01811223344',
    address: 'ধানমন্ডি ৩২',
    city: 'ঢাকা',
    deliveryAreaId: 'dhaka',
    deliveryAreaName: 'ঢাকার ভিতরে',
    paymentMethod: 'bkash',
    paymentStatus: 'Paid',
    trxId: 'BK9238HKL',
    cart: ['TWS M10 Earbuds (x2)', 'Premium Cotton T-shirt (x1)'],
    items: [
      { productId: '2', name: 'TWS M10 Earbuds', quantity: 2, price: 450, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=400' },
      { productId: '3', name: 'Premium Cotton T-shirt', quantity: 1, price: 350, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=400', selectedSize: 'XL' }
    ],
    subtotal: 1250,
    discount: 110,
    deliveryCharge: 60,
    total: 1200,
    status: 'Processing',
    date: '২৬ মে, ২০২৬',
    timestamp: '2026-05-26T02:15:00Z'
  },
  {
    id: '#ORD-003',
    name: 'সাইফুল ইসলাম',
    phone: '01911223344',
    address: 'চাষাড়া, নারায়ণগঞ্জ',
    city: 'নারায়ণগঞ্জ',
    deliveryAreaId: 'outside',
    deliveryAreaName: 'ঢাকার বাইরে',
    paymentMethod: 'cod',
    paymentStatus: 'Unpaid',
    cart: ['Premium Punjabi (x3)'],
    items: [
      { productId: '6', name: 'Premium Panjabi', quantity: 3, price: 1500, image: 'https://images.unsplash.com/photo-1593030761756-168f6b86dcf3?auto=format&fit=crop&q=80&w=400', selectedSize: '42' }
    ],
    subtotal: 4500,
    discount: 120,
    deliveryCharge: 120,
    total: 4500,
    status: 'Delivered',
    date: '২৫ মে, ২০২৬',
    timestamp: '2026-05-25T11:40:00Z'
  },
  {
    id: '#ORD-004',
    name: 'নাঈমুর রহমান',
    phone: '01611223344',
    address: 'উপশহর, সিলেট',
    city: 'সিলেট',
    deliveryAreaId: 'outside',
    deliveryAreaName: 'ঢাকার বাইরে',
    paymentMethod: 'nagad',
    paymentStatus: 'Paid',
    trxId: 'NG98301LSS',
    cart: ['Gaming Headphone G2000 (x3)', 'K9 Wireless Microphone (x1)'],
    items: [
      { productId: '7', name: 'Gaming Headphone G2000', quantity: 3, price: 950, image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=400' },
      { productId: '4', name: 'K9 Wireless Microphone', quantity: 1, price: 650, image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=400' }
    ],
    subtotal: 3500,
    discount: 420,
    deliveryCharge: 120,
    total: 3200,
    status: 'Shipped',
    date: '২৫ মে, ২০২৬',
    timestamp: '2026-05-25T08:30:00Z'
  },
];

const initialReviews: Review[] = [
  { id: 'rev-1', productId: '1', productName: 'T55 Series 8 Smart Watch', reviewerName: 'মিজানুর রহমান', reviewerEmail: 'mizan@test.com', rating: 5, comment: 'খুবই চমৎকার একটি ঘড়ি! ফিচারগুলো দারুণ এবং ব্যাটারি ব্যাকআপ অসাধারণ।', status: 'Approved', date: '২৫ মে, ২০২৬' },
  { id: 'rev-2', productId: '2', productName: 'TWS M10 Earbuds', reviewerName: 'আরিফ রহমান', reviewerEmail: 'arif@test.com', rating: 4, comment: 'সাউন্ড কোয়ালিটি দাম অনুযায়ী ভালো। পাওয়ার ব্যাংক ব্যাকআপও কার্যকরী।', status: 'Approved', date: '২৪ মে, ২০২৬' },
  { id: 'rev-3', productId: '3', productName: 'Premium Cotton T-shirt', reviewerName: 'ফারজানা ইয়াসমিন', reviewerEmail: 'farjana@test.com', rating: 5, comment: 'কাপড় অনেক সফট এবং গরমে পরার জন্য আদর্শ। কালারও ঠিক আছে।', status: 'Approved', date: '২৩ মে, ২০২৬' }
];

export const initialRoles: StaffRole[] = [
  { id: 'st-1', name: 'নাঈমুর রহমান', email: 'nayem@premium-market.tech', role: 'Administrator', status: 'Active', permissions: ['categories', 'products', 'orders', 'users', 'marketing', 'settings', 'live-chat'], passwordHash: 'ee7a912e6eaa469065251964f1d701fe51f1d01a88a966fc183a7243a24da7e3' },
  { id: 'st-2', name: 'সাকিব হাসান', email: 'sakib@premium-market.tech', role: 'Manager', status: 'Active', permissions: ['products', 'orders', 'marketing'], passwordHash: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92' },
  { id: 'st-3', name: 'জাকারিয়া রহমান', email: 'jack@premium-market.tech', role: 'Support Agent', status: 'Active', permissions: ['live-chat', 'orders'], passwordHash: '2a18c4b747ddc57ae267f81709473bac4d3fcef623e85014a0ecd98bb19ae699' }
];

const initialSupportChats: SupportChat[] = [
  {
    id: 'ch-1',
    customerName: 'তাহমিদুল আলম',
    lastMessage: 'আমার অর্ডারটি কখন হ্যান্ডওভার করা হবে ভাই?',
    timestamp: '১০ মিনিট আগে',
    unread: true,
    messages: [
      { id: 'm1', sender: 'customer', text: 'আসসালামু আলাইকুম, আমি গতকাল একটা স্মার্ট ওয়াচ অর্ডার করেছিলাম।', timestamp: '2026-05-26T05:10:00Z' },
      { id: 'm2', sender: 'admin', text: 'ওয়ালাইকুম আসসালাম ভাইয়া। আপনার অর্ডারটি প্রসেসিং করা হয়েছে।', timestamp: '2026-05-26T05:12:00Z' },
      { id: 'm3', sender: 'customer', text: 'আমার অর্ডারটি কখন হ্যান্ডওভার করা হবে ভাই?', timestamp: '2026-05-26T05:15:00Z' },
    ]
  },
  {
    id: 'ch-2',
    customerName: 'সুমাইয়া আক্তার',
    lastMessage: 'ধন্যবাদ সাহায্য করার জন্য!',
    timestamp: '১ ঘণ্টা আগে',
    unread: false,
    messages: [
      { id: 'n1', sender: 'customer', text: 'আপনাদের পাঞ্জাবির ৪২ সাইজ কি এভেইলেবল আছে?', timestamp: '2026-05-26T04:00:00Z' },
      { id: 'n2', sender: 'admin', text: 'জ্বি ভাইয়া, প্রিমিয়াম পাঞ্জাবির ৪২ সাইজ এই বুকিং সেশনে সম্পূর্ণ স্টকে এভেইলেবল রয়েছে।', timestamp: '2026-05-26T04:05:00Z' },
      { id: 'n3', sender: 'customer', text: 'ধন্যবাদ সাহায্য করার জন্য!', timestamp: '2026-05-26T04:06:00Z' },
    ]
  }
];

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      cart: [],
      products: MOCK_PRODUCTS,
      categories: initialCategories,
      orders: initialOrders,
      customers: initialCustomers,
      coupons: initialCoupons,
      banners: initialBanners,
      reviews: initialReviews,
      roles: initialRoles,
      auditLogs: [
        { id: 'log-1', action: 'সিস্টেম মডিউলসমূহ সফলভাবে আপগ্রেড করা হয়েছে', user: 'সিস্টেম ইঞ্জিন', timestamp: new Date().toISOString() }
      ],
      supportChats: initialSupportChats,
      wishlist: [],
      faqs: initialFaqs,
      siteSettings: {
        storeName: 'Pixel Market BD',
        announcementText: '🔥 ফ্রি হোম ডেলিভারি ৩ হাজার টাকার বেশি শপিং করলে!',
        description: 'Pixel Market BD - আপনার বিশ্বস্ত অনলাইন শপিং পার্টনার।',
        aboutUsText: `আমাদের সম্পর্কে About Us – Pixel Market BD
স্বাগতম Pixel Market BD এ।
আমরা শুধু একটি অনলাইন শপ নই — আমরা এমন একটি বিশ্বস্ত প্ল্যাটফর্ম, যেখানে আধুনিক প্রযুক্তি, প্রিমিয়াম কোয়ালিটি এবং গ্রাহকের সন্তুষ্টিকে সর্বোচ্চ গুরুত্ব দেওয়া হয়। বর্তমান ডিজিটাল যুগে মানুষ চায় আসল পণ্য, সঠিক দাম এবং নির্ভরযোগ্য সার্ভিস। আর ঠিক সেই লক্ষ্য নিয়েই যাত্রা শুরু করেছে Pixel Market BD।
আমাদের লক্ষ্য একটাই — বাংলাদেশের প্রতিটি মানুষের কাছে বিশ্বস্ত ও মানসম্মত পণ্য সহজে পৌঁছে দেওয়া।

কেন Pixel Market BD আলাদা?
বর্তমানে অনলাইনে অসংখ্য ওয়েবসাইট রয়েছে, কিন্তু সবাই গ্রাহকের বিশ্বাস ধরে রাখতে পারে না। আমরা বিশ্বাস করি, একটি ব্যবসার সবচেয়ে বড় সম্পদ হলো গ্রাহকের আস্থা। তাই প্রতিটি পণ্য নির্বাচন থেকে শুরু করে ডেলিভারি পর্যন্ত প্রতিটি ধাপে আমরা সর্বোচ্চ সতর্কতা বজায় রাখি।
আমরা যা নিশ্চিত করি:
• প্রিমিয়াম ও যাচাইকৃত পণ্য
• সাশ্রয়ী ও ন্যায্য মূল্য
• দ্রুত ও নিরাপদ ডেলিভারি
• গ্রাহকবান্ধব সাপোর্ট
• অর্ডারের সম্পূর্ণ ট্র্যাকিং সুবিধা
• নিরাপদ পেমেন্ট সিস্টেম
• প্রতারণামুক্ত অনলাইন শপিং অভিজ্ঞতা

আমাদের প্রতিশ্রুতি
Pixel Market BD কখনো শুধুমাত্র বিক্রির দিকে গুরুত্ব দেয় না। আমরা দীর্ঘমেয়াদী সম্পর্ক গড়ে তুলতে বিশ্বাস করি। তাই আমরা এমন একটি সার্ভিস দেওয়ার চেষ্টা করি, যেখানে একজন গ্রাহক একবার কেনাকাটা করার পর বারবার ফিরে আসতে চান।
আমাদের টিম প্রতিনিয়ত নতুন ট্রেন্ড, আধুনিক ডিজাইন এবং গ্রাহকের প্রয়োজন অনুযায়ী পণ্য সংগ্রহ করে থাকে। প্রতিটি পণ্য যাচাই-বাছাই করার পরই ওয়েবসাইটে যুক্ত করা হয়।

আমাদের ভিশন
বাংলাদেশের অন্যতম বিশ্বস্ত এবং জনপ্রিয় অনলাইন মার্কেটপ্লেস হিসেবে নিজেদের প্রতিষ্ঠিত করা, যেখানে মানুষ নির্ভয়ে ও নিশ্চিন্তে কেনাকাটা করতে পারে।

আমাদের মিশন
• অনলাইন শপিংকে আরও সহজ ও নিরাপদ করা
• সেরা মানের পণ্য সঠিক দামে পৌঁছে দেওয়া
• প্রতিটি গ্রাহককে প্রিমিয়াম সার্ভিস প্রদান করা
• বাংলাদেশের ই-কমার্স সেক্টরে বিশ্বস্ততার নতুন মান তৈরি করা

গ্রাহকের সন্তুষ্টিই আমাদের সফলতা
আমরা বিশ্বাস করি, ভালো পণ্য মানুষ একবার কেনে — কিন্তু ভালো ব্যবহার ও বিশ্বাস মানুষকে বারবার ফিরিয়ে আনে। তাই Pixel Market BD প্রতিটি গ্রাহককে পরিবারের সদস্যের মতো গুরুত্ব দেয়।
আপনার সন্তুষ্টিই আমাদের অনুপ্রেরণা।
আপনার বিশ্বাসই আমাদের শক্তি।
ধন্যবাদ Pixel Market BD এর সাথে থাকার জন্য। 💙`,
        faviconUrl: '',
        headerLogoUrl: '',
        footerLogoUrl: '',
        contactEmail: 'support@pixelmarket.com',
        contactPhone: '+8801234567890',
        whatsappNumber: '+8801234567890',
        headOfficeAddress: 'মিরপুর ১০, ঢাকা, বাংলাদেশ',
        socialLinks: {
          facebook: 'https://facebook.com',
          youtube: 'https://youtube.com',
          whatsapp: 'https://wa.me/8801234567890',
          telegram: 'https://t.me',
          instagram: 'https://instagram.com'
        },
        deliveryOptions: [
          { id: 'dhaka', active: true, name: 'ঢাকার ভিতরে', time: '১-২ দিন', charge: 60 },
          { id: 'outside', active: true, name: 'ঢাকার বাইরে', time: '৩-৫ দিন', charge: 120 }
        ],
        whatsappOrderAlertNumber: '+8801234567890',
        checkoutForm: {
          nameLabel: 'আপনার নাম',
          phoneLabel: 'মোবাইল নম্বর',
          addressLabel: 'ডেলিভারি ঠিকানা',
          emailLabel: 'ইমেইল অ্যাড্রেস (ঐচ্ছিক)',
          altPhoneLabel: 'বিকল্প মোবাইল নম্বর (ঐচ্ছিক)',
          cityLabel: 'শহর / জেলা'
        },
        colors: {
          primary: '#ea580c' // orange-600
        },
        navigation: [
          { id: 'nav-1', label: 'হোম', url: '/' },
          { id: 'nav-about', label: 'আমাদের সম্পর্কে', url: '/about' },
          { id: 'nav-2', label: 'প্রোডাক্টস', url: '/shop' }
        ],
        megaOfferText: '🔥 Pixel Market BD-তে ঈদ অফার! সব প্রিমিয়াম ডিজিটাল স্ক্রিপ্ট এবং থিমে ফ্ল্যাট ২০% ছাড়! কুপন কোড: EID2026 | 🚀 ১০০০+ রেডিমেড ওয়েবসাইট প্রজেক্ট, প্লাগইনস এবং থিম লাইফটাইম লাইসেন্স সহ আজই ডাউনলোড করুন! | 🚚 ৩০০০৳ এর ওপরে কেনাকাটা করলে রয়েছে ফ্রী ইনস্ট্যান্ট ড্রাইভ ডেলিভারি!'
      },
      isAdminAuthenticated: false,
      currentStaff: null,
      isUserAuthenticated: false,
      user: null,
      adminCredentials: { username: 'নাঈমুর রহমান', password: '234000' },
      isDarkMode: true,
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      
      // Cart operations
      addToCart: (product, quantity = 1, selectedSize, selectedColor) => set((state) => {
        const cartItemId = `${product.id}-${selectedSize || 'none'}-${selectedColor || 'none'}`;
        const existing = state.cart.find((item) => item.cartItemId === cartItemId);
        if (existing) {
          return {
            cart: state.cart.map((item) =>
              item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + quantity } : item
            ),
          };
        }
        return { cart: [...state.cart, { ...product, cartItemId, quantity, selectedSize, selectedColor }] };
      }),
      removeFromCart: (cartItemId) => set((state) => ({
        cart: state.cart.filter((item) => item.cartItemId !== cartItemId),
      })),
      updateQuantity: (cartItemId, quantity) => set((state) => ({
        cart: state.cart.map((item) =>
          item.cartItemId === cartItemId ? { ...item, quantity: Math.max(1, quantity) } : item
        ),
      })),
      clearCart: () => set({ cart: [] }),
      toggleWishlist: (product) => set((state) => {
        const isExist = state.wishlist.some(p => p.id === product.id);
        return { wishlist: isExist ? state.wishlist.filter(p => p.id !== product.id) : [...state.wishlist, product] };
      }),
      setAdminAuthenticated: (status, staff = null) => set((state) => {
        if (status) {
          get().addAuditLog('এডমিন প্যানেলে সফলভাবে লগইন করা হয়েছে', staff?.name || 'নাঈমুর রহমান');
        } else {
          get().addAuditLog('এডমিন প্যানেল থেকে লগআউট করা হয়েছে', state.currentStaff?.name || 'নাঈমুর রহমান');
        }
        return { 
          isAdminAuthenticated: status,
          currentStaff: status ? staff : null
        };
      }),
      updateAdminCredentials: (username, password) => set((state) => {
        const hash = sha256Sync(password);
        get().addAuditLog(`এডমিন অ্যাক্সেস ক্রেডেনশিয়াল আপডেট করা হয়েছে`, state.currentStaff?.name || 'নাঈমুর রহমান');
        
        // Also update in roles if matched
        const updatedRoles = state.roles.map(r => {
          if (r.id === 'st-1' || r.role === 'Administrator') {
            return { ...r, name: username, passwordHash: hash };
          }
          return r;
        });

        // Also update currentStaff
        const updatedCurrentStaff = state.currentStaff ? {
          ...state.currentStaff,
          name: state.currentStaff.role === 'Administrator' ? username : state.currentStaff.name,
          passwordHash: state.currentStaff.role === 'Administrator' ? hash : state.currentStaff.passwordHash
        } : null;

        return { 
          adminCredentials: { username, password }, 
          roles: updatedRoles,
          currentStaff: updatedCurrentStaff
        };
      }),
      updateSiteSettings: (settings) => {
        setDoc(doc(db, 'settings', 'global'), settings)
          .catch(err => handleFirestoreError(err, OperationType.WRITE, 'settings/global'));
        get().addAuditLog(`জেনারেল ওয়েবসাইট সেটিংস আপডেট করা হয়েছে`, get().currentStaff?.name || 'নাঈমুর রহমান');
        set({ siteSettings: settings });
      },
      setUserAuthenticated: (status, user) => set({ isUserAuthenticated: status, user: user || null }),
      logoutUser: () => set({ isUserAuthenticated: false, user: null }),
      cartTotal: () => get().cart.reduce((total, item) => total + item.price * item.quantity, 0),
      
      // Product operations
      addProduct: (product) => {
        setDoc(doc(db, 'products', product.id), product)
          .catch(err => handleFirestoreError(err, OperationType.WRITE, `products/${product.id}`));
        get().addAuditLog(`নতুন প্রোডাক্ট যুক্ত করা হয়েছে: ${product.name}`, get().currentStaff?.name || 'নাঈমুর রহমান');
        set((state) => ({ products: [product, ...state.products] }));
      },
      updateProduct: (product) => {
        setDoc(doc(db, 'products', product.id), product)
          .catch(err => handleFirestoreError(err, OperationType.WRITE, `products/${product.id}`));
        get().addAuditLog(`প্রোডাক্ট এডিট করা হয়েছে: ${product.name}`, get().currentStaff?.name || 'নাঈমুর রহমান');
        set((state) => ({ products: state.products.map((p) => p.id === product.id ? product : p) }));
      },
      deleteProduct: (id) => {
        const product = get().products.find(p => p.id === id);
        deleteDoc(doc(db, 'products', id))
          .catch(err => handleFirestoreError(err, OperationType.DELETE, `products/${id}`));
        get().addAuditLog(`প্রোডাক্ট ডিলিট করা হয়েছে: ${product?.name || id}`, get().currentStaff?.name || 'নাঈমুর রহমান');
        set((state) => ({ products: state.products.filter((p) => p.id !== id) }));
      },

      // Category operations
      addCategory: (category) => {
        setDoc(doc(db, 'categories', category.id), category)
          .catch(err => handleFirestoreError(err, OperationType.WRITE, `categories/${category.id}`));
        get().addAuditLog(`নতুন ক্যাটাগরি যুক্ত করা হয়েছে: ${category.name}`, get().currentStaff?.name || 'নাঈমুর রহমান');
        set((state) => ({ categories: [...state.categories, category] }));
      },
      updateCategory: (category) => {
        setDoc(doc(db, 'categories', category.id), category)
          .catch(err => handleFirestoreError(err, OperationType.WRITE, `categories/${category.id}`));
        get().addAuditLog(`ক্যাটাগরি আপডেট করা হয়েছে: ${category.name}`, get().currentStaff?.name || 'নাঈমুর রহমান');
        set((state) => ({ categories: state.categories.map((c) => c.id === category.id ? category : c) }));
      },
      deleteCategory: (id) => {
        const cat = get().categories.find(c => c.id === id);
        deleteDoc(doc(db, 'categories', id))
          .catch(err => handleFirestoreError(err, OperationType.DELETE, `categories/${id}`));
        get().addAuditLog(`ক্যাটাগরি ডিলিট করা হয়েছে: ${cat?.name || id}`, get().currentStaff?.name || 'নাঈমুর রহমান');
        set((state) => ({ categories: state.categories.filter((c) => c.id !== id) }));
      },

      // Order operations
      addOrder: (order) => {
        setDoc(doc(db, 'orders', order.id), order)
          .catch(err => handleFirestoreError(err, OperationType.WRITE, `orders/${order.id}`));

        // Automatically calculate spent for returning customer or create customer
        const updatedCustomers = [...get().customers];
        const existIdx = updatedCustomers.findIndex(c => c.phone === order.phone);
        if (existIdx !== -1) {
          updatedCustomers[existIdx].spent += order.total;
          updatedCustomers[existIdx].ordersCount += 1;
          updateDoc(doc(db, 'customers', updatedCustomers[existIdx].id), {
            spent: updatedCustomers[existIdx].spent,
            ordersCount: updatedCustomers[existIdx].ordersCount
          }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `customers/${updatedCustomers[existIdx].id}`));
        } else {
          const newCustId = `#USR-${Math.floor(100 + Math.random() * 900)}`;
          const newCust = {
            id: newCustId,
            name: order.name,
            email: order.email || 'customer@guest.com',
            phone: order.phone,
            ordersCount: 1,
            spent: order.total,
            status: 'Active' as const,
            createdAt: new Date().toISOString().split('T')[0]
          };
          updatedCustomers.push(newCust);
          setDoc(doc(db, 'customers', newCustId), newCust)
            .catch(err => handleFirestoreError(err, OperationType.WRITE, `customers/${newCustId}`));
        }

        get().addAuditLog(`নতুন অর্ডার রিসিভ করা হয়েছে: ${order.id} (৳${order.total})`, 'কাস্টমার');
        set({
          orders: [order, ...get().orders],
          customers: updatedCustomers
        });
      },
      updateOrderStatus: (id, status) => {
        updateDoc(doc(db, 'orders', id), { status })
          .catch(err => handleFirestoreError(err, OperationType.UPDATE, `orders/${id}`));
        get().addAuditLog(`অর্ডার ${id} এর স্ট্যাটাস পরিবর্তন করে করা হয়েছে: ${status}`, get().currentStaff?.name || 'নাঈমুর রহমান');
        set((state) => ({
          orders: state.orders.map((o) => o.id === id ? { ...o, status } : o)
        }));
      },
      updateOrderPaymentStatus: (id, paymentStatus) => {
        updateDoc(doc(db, 'orders', id), { paymentStatus })
          .catch(err => handleFirestoreError(err, OperationType.UPDATE, `orders/${id}`));
        get().addAuditLog(`অর্ডার ${id} এর পেমেন্ট পেমেন্ট স্ট্যাটাস করা হয়েছে: ${paymentStatus}`, get().currentStaff?.name || 'নাঈমুর রহমান');
        set((state) => ({
          orders: state.orders.map((o) => o.id === id ? { ...o, paymentStatus } : o)
        }));
      },
      deleteOrder: (id) => {
        deleteDoc(doc(db, 'orders', id))
          .catch(err => handleFirestoreError(err, OperationType.DELETE, `orders/${id}`));
        get().addAuditLog(`অর্ডার ডিলিট করা হয়েছে: ${id}`, get().currentStaff?.name || 'নাঈমুর রহমান');
        set((state) => ({
          orders: state.orders.filter((o) => o.id !== id)
        }));
      },

      // Customer operations
      addCustomer: (customer) => {
        setDoc(doc(db, 'customers', customer.id), customer)
          .catch(err => handleFirestoreError(err, OperationType.WRITE, `customers/${customer.id}`));
        set((state) => ({ customers: [...state.customers, customer] }));
      },
      toggleCustomerStatus: (id) => {
        const cust = get().customers.find(c => c.id === id);
        const nextStatus = cust?.status === 'Active' ? 'Blocked' : 'Active';
        updateDoc(doc(db, 'customers', id), { status: nextStatus })
          .catch(err => handleFirestoreError(err, OperationType.UPDATE, `customers/${id}`));
        get().addAuditLog(`কাস্টমার ${cust?.name} কে ${nextStatus === 'Blocked' ? 'ব্লক' : 'আনব্লক'} করা হয়েছে`, get().currentStaff?.name || 'নাঈমুর রহমান');
        set((state) => ({
          customers: state.customers.map((c) => c.id === id ? { ...c, status: nextStatus } : c)
        }));
      },

      // FAQ Operations
      addFaq: (faq) => {
        setDoc(doc(db, 'faqs', faq.id), faq)
          .catch(err => handleFirestoreError(err, OperationType.WRITE, `faqs/${faq.id}`));
        get().addAuditLog(`নতুন সাধারণ জিজ্ঞাসা (FAQ) যোগ করা হয়েছে: ${faq.q}`, get().currentStaff?.name || 'নাঈমুর রহমান');
        set((state) => ({ faqs: [...state.faqs, faq] }));
      },
      updateFaq: (faq) => {
        setDoc(doc(db, 'faqs', faq.id), faq)
          .catch(err => handleFirestoreError(err, OperationType.WRITE, `faqs/${faq.id}`));
        get().addAuditLog(`সাধারণ জিজ্ঞাসা (FAQ) আপডেট করা হয়েছে: ${faq.q}`, get().currentStaff?.name || 'নাঈমুর রহমান');
        set((state) => ({ faqs: state.faqs.map((f) => f.id === faq.id ? faq : f) }));
      },
      deleteFaq: (id) => {
        const faq = get().faqs.find(f => f.id === id);
        deleteDoc(doc(db, 'faqs', id))
          .catch(err => handleFirestoreError(err, OperationType.DELETE, `faqs/${id}`));
        get().addAuditLog(`সাধারণ জিজ্ঞাসা (FAQ) ডিলিট করা হয়েছে: ${faq?.q || id}`, get().currentStaff?.name || 'নাঈমুর রহমান');
        set((state) => ({ faqs: state.faqs.filter((f) => f.id !== id) }));
      },

      // Coupon operations
      addCoupon: (coupon) => {
        setDoc(doc(db, 'coupons', coupon.id), coupon)
          .catch(err => handleFirestoreError(err, OperationType.WRITE, `coupons/${coupon.id}`));
        get().addAuditLog(`নতুন কুপন কোড তৈরি করা হয়েছে: ${coupon.code}`, get().currentStaff?.name || 'নাঈমুর রহমান');
        set((state) => ({ coupons: [...state.coupons, coupon] }));
      },
      updateCoupon: (coupon) => {
        setDoc(doc(db, 'coupons', coupon.id), coupon)
          .catch(err => handleFirestoreError(err, OperationType.WRITE, `coupons/${coupon.id}`));
        get().addAuditLog(`কুপন কোড আপডেট করা হয়েছে: ${coupon.code}`, get().currentStaff?.name || 'নাঈমুর রহমান');
        set((state) => ({ coupons: state.coupons.map((c) => c.id === coupon.id ? coupon : c) }));
      },
      deleteCoupon: (id) => {
        const coupon = get().coupons.find(c => c.id === id);
        deleteDoc(doc(db, 'coupons', id))
          .catch(err => handleFirestoreError(err, OperationType.DELETE, `coupons/${id}`));
        get().addAuditLog(`কুপন ডিলিট করা হয়েছে: ${coupon?.code || id}`, get().currentStaff?.name || 'নাঈমুর রহমান');
        set((state) => ({ coupons: state.coupons.filter((c) => c.id !== id) }));
      },
      incrementCouponUsage: (code) => {
        const c = get().coupons.find(x => x.code.toUpperCase() === code.toUpperCase());
        if (c) {
          updateDoc(doc(db, 'coupons', c.id), { totalUsage: c.totalUsage + 1 })
            .catch(err => handleFirestoreError(err, OperationType.UPDATE, `coupons/${c.id}`));
          set((state) => ({
            coupons: state.coupons.map((item) => item.id === c.id ? { ...item, totalUsage: item.totalUsage + 1 } : item)
          }));
        }
      },

      // Banner operations
      addBanner: (banner) => {
        setDoc(doc(db, 'banners', banner.id), banner)
          .catch(err => handleFirestoreError(err, OperationType.WRITE, `banners/${banner.id}`));
        get().addAuditLog(`নতুন অফার ব্যানার যোগ করা হয়েছে: ${banner.title}`, get().currentStaff?.name || 'নাঈমুর রহমান');
        set((state) => ({ banners: [...state.banners, banner] }));
      },
      updateBanner: (banner) => {
        setDoc(doc(db, 'banners', banner.id), banner)
          .catch(err => handleFirestoreError(err, OperationType.WRITE, `banners/${banner.id}`));
        get().addAuditLog(`অফার ব্যানার এডিট করা হয়েছে: ${banner.title}`, get().currentStaff?.name || 'নাঈমুর রহমান');
        set((state) => ({ banners: state.banners.map((b) => b.id === banner.id ? banner : b) }));
      },
      deleteBanner: (id) => {
        const banner = get().banners.find(b => b.id === id);
        deleteDoc(doc(db, 'banners', id))
          .catch(err => handleFirestoreError(err, OperationType.DELETE, `banners/${id}`));
        get().addAuditLog(`অফার ব্যানার ডিলিট করা হয়েছে: ${banner?.title || id}`, get().currentStaff?.name || 'নাঈমুর রহমান');
        set((state) => ({ banners: state.banners.filter((b) => b.id !== id) }));
      },

      // Review operations
      addReview: (review) => {
        setDoc(doc(db, 'reviews', review.id), review)
          .catch(err => handleFirestoreError(err, OperationType.WRITE, `reviews/${review.id}`));
        get().addAuditLog(`প্রোডাক্ট ${review.productName} এ নতুন রিভিউ যুক্ত হয়েছে`, 'কাস্টমার');
        set((state) => ({ reviews: [review, ...state.reviews] }));
      },
      approveReview: (id) => {
        const rev = get().reviews.find(r => r.id === id);
        updateDoc(doc(db, 'reviews', id), { status: 'Approved' })
          .catch(err => handleFirestoreError(err, OperationType.UPDATE, `reviews/${id}`));
        get().addAuditLog(`প্রোডাক্ট রিভিউ অ্যাপ্রুভ করা হয়েছে: ${rev?.reviewerName}`, get().currentStaff?.name || 'নাঈমুর রহমান');
        set((state) => ({ reviews: state.reviews.map((r) => r.id === id ? { ...r, status: 'Approved' } : r) }));
      },
      deleteReview: (id) => {
        const rev = get().reviews.find(r => r.id === id);
        deleteDoc(doc(db, 'reviews', id))
          .catch(err => handleFirestoreError(err, OperationType.DELETE, `reviews/${id}`));
        get().addAuditLog(`প্রোডাক্ট রিভিউ রিমুভ করা হয়েছে: ${rev?.reviewerName}`, get().currentStaff?.name || 'নাঈমুর রহমান');
        set((state) => ({ reviews: state.reviews.filter((r) => r.id !== id) }));
      },

      // Staff operations
      addStaff: (staff) => {
        const docId = staff.email.trim().toLowerCase();
        const finalStaff = { ...staff, id: docId };
        setDoc(doc(db, 'staff', docId), finalStaff)
          .catch(err => handleFirestoreError(err, OperationType.WRITE, `staff/${docId}`));
        get().addAuditLog(`নতুন স্টাফ মেম্বার যোগ করা হয়েছে: ${staff.name}`, get().currentStaff?.name || 'নাঈমুর রহমান');
        set((state) => {
          const filtered = state.roles.filter(s => s.id !== docId && s.email.toLowerCase() !== docId);
          return { roles: [...filtered, finalStaff] };
        });
      },
      updateStaff: (staff) => {
        const docId = staff.email.trim().toLowerCase();
        const finalStaff = { ...staff, id: docId };
        setDoc(doc(db, 'staff', docId), finalStaff)
          .catch(err => handleFirestoreError(err, OperationType.WRITE, `staff/${docId}`));
        get().addAuditLog(`স্টাফ মেম্বার ইনফো আপডেট করা হয়েছে: ${staff.name}`, get().currentStaff?.name || 'নাঈমুর রহমান');
        set((state) => ({ 
          roles: state.roles.map((s) => (s.id === staff.id || s.email.toLowerCase() === docId) ? finalStaff : s) 
        }));
      },
      deleteStaff: (id) => {
        const staff = get().roles.find(s => s.id === id);
        const docId = staff ? staff.email.trim().toLowerCase() : id;
        deleteDoc(doc(db, 'staff', docId))
          .catch(err => handleFirestoreError(err, OperationType.DELETE, `staff/${docId}`));
        get().addAuditLog(`স্টাফ মেম্বার ডিলিট করা হয়েছে: ${staff?.name || id}`, get().currentStaff?.name || 'নাঈমুর রহমান');
        set((state) => ({ 
          roles: state.roles.filter((s) => s.id !== id && s.email.toLowerCase() !== docId) 
        }));
      },

      // Live chat support
      addSupportChat: (chat) => {
        setDoc(doc(db, 'supportChats', chat.id), chat)
          .catch(err => handleFirestoreError(err, OperationType.WRITE, `supportChats/${chat.id}`));
        set((state) => ({ supportChats: [...state.supportChats, chat] }));
      },
      sendSupportMessage: (chatId, message) => {
        const dateStr = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
        const chat = get().supportChats.find(c => c.id === chatId);
        if (chat) {
          const updatedChat = {
            ...chat,
            lastMessage: message.text,
            timestamp: `${dateStr} তে`,
            unread: message.sender === 'customer',
            messages: [...chat.messages, message]
          };
          setDoc(doc(db, 'supportChats', chatId), updatedChat)
            .catch(err => handleFirestoreError(err, OperationType.WRITE, `supportChats/${chatId}`));
          set((state) => ({
            supportChats: state.supportChats.map((c) => c.id === chatId ? updatedChat : c)
          }));
        }
      },
      markChatAsRead: (chatId) => {
        const chat = get().supportChats.find(c => c.id === chatId);
        if (chat) {
          updateDoc(doc(db, 'supportChats', chatId), { unread: false })
            .catch(err => handleFirestoreError(err, OperationType.UPDATE, `supportChats/${chatId}`));
          set((state) => ({
            supportChats: state.supportChats.map((c) => c.id === chatId ? { ...c, unread: false } : c)
          }));
        }
      },

      // Audit logs
      addAuditLog: (action, user = 'নাঈমুর রহমান') => {
        const logId = `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const logObj = {
          id: logId,
          action,
          user,
          timestamp: new Date().toISOString()
        };
        setDoc(doc(db, 'auditLogs', logId), logObj)
          .catch(err => handleFirestoreError(err, OperationType.WRITE, `auditLogs/${logId}`));
        set((state) => ({
          auditLogs: [logObj, ...state.auditLogs].slice(0, 50)
        }));
      },
      clearAuditLogs: () => set({ auditLogs: [] })
    }),
    {
      name: 'pixel-market-storage',
    }
  )
);
