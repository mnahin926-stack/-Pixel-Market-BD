import { useEffect, useRef } from 'react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  getDoc,
  getDocs,
  query,
  limit,
  orderBy
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useStore, initialRoles } from '../store';
import { MOCK_PRODUCTS } from '../data';
import { onAuthStateChanged } from 'firebase/auth';

export default function FirebaseSync() {
  const store = useStore();
  const publicInitialized = useRef(false);

  // 1. Listen to Authentication State and Fetch Staff Doc
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const email = user.email || '';
        const isMaster = email.toLowerCase() === 'pixelmarketbd2026@gmail.com';
        const docId = email.toLowerCase();
        
        try {
          const staffRef = doc(db, 'staff', docId);
          const staffSnap = await getDoc(staffRef);
          
          if (isMaster) {
            const masterStaff = staffSnap.exists() 
              ? (staffSnap.data() as any) 
              : {
                  id: docId,
                  name: user.displayName || 'নাঈমুর রহমান',
                  email: email,
                  role: 'Administrator' as const,
                  status: 'Active' as const,
                  permissions: ['categories', 'products', 'orders', 'users', 'marketing', 'settings', 'live-chat']
                };
            
            await setDoc(staffRef, masterStaff, { merge: true });
            store.setAdminAuthenticated(true, masterStaff);
          } else if (staffSnap.exists()) {
            const staffData = staffSnap.data() as any;
            if (staffData.status === 'Active') {
              store.setAdminAuthenticated(true, staffData);
            } else {
              store.setAdminAuthenticated(false, null);
            }
          } else {
            // Not a registered administrator or staff
            store.setAdminAuthenticated(false, null);
          }
        } catch (err) {
          console.error("Error fetching staff profile during auth change:", err);
          store.setAdminAuthenticated(false, null);
        }
      } else {
        if (store.isAdminAuthenticated && store.currentStaff) {
          store.setAdminAuthenticated(false, null);
        }
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  // 2. Real-Time Listeners for Public Collections (Everyone is allowed to read)
  useEffect(() => {
    if (publicInitialized.current) return;
    publicInitialized.current = true;

    // --- PRODUCTS SYNC ---
    const unsubscribeProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      if (snapshot.empty) {
        MOCK_PRODUCTS.forEach((prod) => {
          setDoc(doc(db, 'products', prod.id), prod).catch(console.error);
        });
      } else {
        const prodList: any[] = [];
        snapshot.forEach((doc) => {
          prodList.push({ id: doc.id, ...doc.data() });
        });
        useStore.setState({ products: prodList });
      }
    }, (err) => console.error('Products sync error:', err));

    // --- CATEGORIES SYNC ---
    const unsubscribeCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      if (snapshot.empty) {
        const defaultCats = [
          { id: 'cat-0', name: 'স্মার্ট ঘড়ি', status: 'Active', image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=400', subcategories: ['Smart Watches', 'Metal Straps'] },
          { id: 'cat-1', name: 'টি শার্ট', status: 'Active', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=400', subcategories: ['Polo Shirt', 'Oversized T-shirt'] },
          { id: 'cat-2', name: 'পাওয়ার ব্যাংক', status: 'Active', image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&q=80&w=400', subcategories: ['Fast Charger', 'Wireless Charging'] },
          { id: 'cat-3', name: 'ইয়ারবার্ড', status: 'Active', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=400', subcategories: ['Bluetooth Earbuds', 'Noise Cancelling'] },
          { id: 'cat-4', name: 'মাইক্রোফোন', status: 'Active', image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=400', subcategories: ['Wireless Mic', 'Condenser Mic'] },
          { id: 'cat-5', name: 'পাঞ্জাবি', status: 'Active', image: 'https://images.unsplash.com/photo-1593030761756-168f6b86dcf3?auto=format&fit=crop&q=80&w=400', subcategories: ['Semi-Long Punjabi', 'Exclusive Punjabi'] },
          { id: 'cat-6', name: 'হেডফোন', status: 'Active', image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=400', subcategories: ['Over Ear Headphone', 'Gaming Headset'] },
        ];
        defaultCats.forEach((cat) => {
          setDoc(doc(db, 'categories', cat.id), cat).catch(console.error);
        });
      } else {
        const catList: any[] = [];
        snapshot.forEach((doc) => {
          catList.push({ id: doc.id, ...doc.data() });
        });
        useStore.setState({ categories: catList });
      }
    }, (err) => console.error('Categories sync error:', err));

    // --- BANNERS / SLIDERS SYNC ---
    const unsubscribeBanners = onSnapshot(collection(db, 'banners'), (snapshot) => {
      if (snapshot.empty) {
        const defaultBanners = [
          { id: 'ban-1', title: 'ঈদ স্পেশাল মেগা সেল', subtitle: 'সব প্রোডাক্টে আকর্ষণীয় মূল্যছাড়!', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1200', position: 1, status: 'Active' },
          { id: 'ban-2', title: 'প্রিমিয়াম এক্সেসরিজ', subtitle: 'কোয়ালিটি গ্যারান্টি সহ দ্রুত ডেলিভারি', image: 'https://images.unsplash.com/photo-1468436139062-f60a71c5c892?auto=format&fit=crop&q=80&w=1200', position: 2, status: 'Active' }
        ];
        defaultBanners.forEach((ban) => {
          setDoc(doc(db, 'banners', ban.id), ban).catch(console.error);
        });
      } else {
        const banList: any[] = [];
        snapshot.forEach((doc) => {
          banList.push({ id: doc.id, ...doc.data() });
        });
        useStore.setState({ banners: banList });
      }
    }, (err) => console.error('Banners sync error:', err));

    // --- SITE SETTINGS SYNC ---
    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (!docSnap.exists()) {
        const defaultSettings = {
          storeName: 'Pixel Market BD',
          announcementText: '🔥 ফ্রি হোম ডেলিভারি ৩ হাজার টাকার বেশি শপিং করলে!',
          description: 'Pixel Market BD - আপনার বিশ্বস্ত অনলাইন শপিং পার্টনার।',
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
            primary: '#ea580c'
          },
          navigation: [
            { id: 'nav-1', label: 'হোম', url: '/' },
            { id: 'nav-about', label: 'আমাদের সম্পর্কে', url: '/about' },
            { id: 'nav-2', label: 'প্রোডাক্টস', url: '/shop' }
          ],
          megaOfferText: '🔥 Pixel Market BD-তে ঈদ অফার! সব প্রিমিয়াম ডিজিটাল স্ক্রিপ্ট এবং থিমে ফ্ল্যাট ২০% ছাড়! কুপন কোড: EID2026 | 🚀 ১০০০+ রেডিমেড ওয়েবসাইট প্রজেক্ট, প্লাগইনস এবং থিম লাইফটাইম লাইসেন্স সহ আজই ডাউনলোড করুন! | 🚚 ৩০০০৳ এর ওপরে কেনাকাটা করলে রয়েছে ফ্রী ইনস্ট্যান্ট ড্রাইভ ডেলিভারি!'
        };
        setDoc(doc(db, 'settings', 'global'), defaultSettings).catch(console.error);
      } else {
        useStore.setState({ siteSettings: docSnap.data() as any });
      }
    }, (err) => console.error('SiteSettings sync error:', err));

    // --- COUPONS SYNC ---
    const unsubscribeCoupons = onSnapshot(collection(db, 'coupons'), (snapshot) => {
      if (snapshot.empty) {
        const defaultCoupons = [
          { id: 'cp-1', code: 'EID2026', discountType: 'percentage', discountValue: 20, minSpend: 1000, expiryDate: '2026-06-30', totalUsage: 45, status: 'Active' },
          { id: 'cp-2', code: 'FREESHIP', discountType: 'fixed', discountValue: 120, minSpend: 2000, expiryDate: '2026-07-15', totalUsage: 112, status: 'Active' },
          { id: 'cp-3', code: 'DISCOUNT10', discountType: 'percentage', discountValue: 10, minSpend: 500, expiryDate: '2026-12-31', totalUsage: 89, status: 'Active' },
        ];
        defaultCoupons.forEach((cp) => {
          setDoc(doc(db, 'coupons', cp.id), cp).catch(console.error);
        });
      } else {
        const cpList: any[] = [];
        snapshot.forEach((doc) => {
          cpList.push({ id: doc.id, ...doc.data() });
        });
        useStore.setState({ coupons: cpList });
      }
    }, (err) => console.error('Coupons sync error:', err));

    // --- REVIEWS SYNC ---
    const unsubscribeReviews = onSnapshot(collection(db, 'reviews'), (snapshot) => {
      if (snapshot.empty) {
        const defaultReviews = [
          { id: 'rev-1', productId: '1', productName: 'T55 Series 8 Smart Watch', reviewerName: 'মিজানুর রহমান', reviewerEmail: 'mizan@test.com', rating: 5, comment: 'খুবই চমৎকার একটি ঘড়ি! ফিচারগুলো দারুণ এবং ব্যাটারি ব্যাকআপ অসাধারণ।', status: 'Approved', date: '২৫ মে, ২০২৬' },
          { id: 'rev-2', productId: '2', productName: 'TWS M10 Earbuds', reviewerName: 'আরিফ রহমান', reviewerEmail: 'arif@test.com', rating: 4, comment: 'সাউন্ড কোয়ালিটি দাম অনুযায়ী ভালো। পাওয়ার ব্যাংক ব্যাকআপও কার্যকরী।', status: 'Approved', date: '২৪ মে, ২০২৬' },
          { id: 'rev-3', productId: '3', productName: 'Premium Cotton T-shirt', reviewerName: 'ফারজানা ইয়াসমিন', reviewerEmail: 'farjana@test.com', rating: 5, comment: 'কাপড় অনেক সফট এবং গরমে পরার জন্য আদর্শ। কালারও ঠিক আছে।', status: 'Approved', date: '২৩ মে, ২০২৬' }
        ];
        defaultReviews.forEach((rev) => {
          setDoc(doc(db, 'reviews', rev.id), rev).catch(console.error);
        });
      } else {
        const revList: any[] = [];
        snapshot.forEach((doc) => {
          revList.push({ id: doc.id, ...doc.data() });
        });
        useStore.setState({ reviews: revList });
      }
    }, (err) => console.error('Reviews sync error:', err));

    // --- FAQS SYNC ---
    const unsubscribeFaqs = onSnapshot(collection(db, 'faqs'), (snapshot) => {
      if (snapshot.empty) {
        const defaultFaqs = [
          { id: 'faq-1', q: "অর্ডার করার পর ফাইল কিভাবে পাবো?", a: "পেমেন্ট সফল হওয়ার সাথে সাথে আপনার কাস্টমার ড্যাশবোর্ডের 'ক্রয়কৃত ডাউনলোডস' ট্যাবে ফাইলের সোর্স জিপ লিংক সক্রিয় হয়ে যাবে। সেখান থেকে যেকোনো সময় ডাউনলোড করতে পারবেন।" },
          { id: 'faq-2', q: "লাইসেন্স কি-র মেয়াদ কতদিন থাকবে?", a: "আমাদের এখানে সোর্স কোড বা থিম প্লাগইনগুলোর লাইসেন্স মূলত লাইফটাইম। অর্থাৎ আপনি একবার ক্রয় করলে আজীবন আপডেট এবং কোড ব্যবহার করতে পারবেন।" },
          { id: 'faq-3', q: "বিকাশ বা নগদ ট্রানজেকশনে কিভাবে পেমেন্ট সম্পন্ন করবো?", a: "চেকআউট পাতায় বিকাশ, নগদ বা নগদ-রকেটের কাস্টম ওয়ালেট সিলেক্ট করে সেখানে উল্লেখিত নম্বরে সেন্ডমানি করে ট্রানজেকশন আইডি ইনপুট দিলে পেমেন্ট সেকেন্ডের মধ্যে ভেরিফাই হয়ে যাবে।" },
          { id: 'faq-4', q: "কোড সেটআপে যেকোনো সমস্যা বা বাগে সাপোর্ট পাবো কিভাবে?", a: "কোনো সমস্যা নেই! আপনার ড্যাশবোর্ডে গিয়ে আমাদের 'টিকিট সাপোর্ট ডেস্ক' বা লাইভ চ্যাটে একটি টিকিট বা মেসেজ ওপেন করলে আমাদের সিনিয়র সফ্টওয়্যার ইঞ্জিনিয়াররা ২৪ ঘণ্টার মধ্যে সর্বোচ্চ সহায়তা প্রদান করবেন।" }
        ];
        defaultFaqs.forEach((faq) => {
          setDoc(doc(db, 'faqs', faq.id), faq).catch(console.error);
        });
      } else {
        const faqList: any[] = [];
        snapshot.forEach((doc) => {
          faqList.push({ id: doc.id, ...doc.data() });
        });
        useStore.setState({ faqs: faqList });
      }
    }, (err) => console.error('Faqs sync error:', err));

    return () => {
      unsubscribeProducts();
      unsubscribeCategories();
      unsubscribeBanners();
      unsubscribeSettings();
      unsubscribeCoupons();
      unsubscribeReviews();
      unsubscribeFaqs();
    };
  }, []);

  // 3. Real-Time Listeners for RESTRICTED Collections (Only run when authenticated as admin)
  useEffect(() => {
    if (!store.isAdminAuthenticated) {
      // Clear sensitive info when logged out
      useStore.setState({ orders: [], customers: [], roles: initialRoles, auditLogs: [] });
      return;
    }

    // --- ORDERS SYNC ---
    const unsubscribeOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const orderList: any[] = [];
      snapshot.forEach((doc) => {
        orderList.push({ id: doc.id, ...doc.data() });
      });
      orderList.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
      useStore.setState({ orders: orderList });
    }, (err) => console.error('Orders sync error:', err));

    // --- CUSTOMERS SYNC ---
    const unsubscribeCustomers = onSnapshot(collection(db, 'customers'), (snapshot) => {
      if (snapshot.empty) {
        const defaultCustomers = [
          { id: '#USR-001', name: 'রাহিম হাসান', email: 'rahim@example.com', phone: '01711223344', ordersCount: 12, spent: 12400, status: 'Active', createdAt: '2026-01-15' },
          { id: '#USR-002', name: 'জনাব তানভীর', email: 'tanvir@example.com', phone: '01811223344', ordersCount: 5, spent: 3200, status: 'Active', createdAt: '2026-02-20' },
          { id: '#USR-003', name: 'সাইফুল ইসলাম', email: 'saiful@example.com', phone: '01911223344', ordersCount: 1, spent: 1500, status: 'Blocked', createdAt: '2026-03-10' },
          { id: '#USR-004', name: 'নাঈমুর রহমান', email: 'nayem@example.com', phone: '01611223344', ordersCount: 24, spent: 45200, status: 'Active', createdAt: '2026-04-05' },
        ];
        defaultCustomers.forEach((cust) => {
          setDoc(doc(db, 'customers', cust.id), cust).catch(console.error);
        });
      } else {
        const custList: any[] = [];
        snapshot.forEach((doc) => {
          custList.push({ id: doc.id, ...doc.data() });
        });
        useStore.setState({ customers: custList });
      }
    }, (err) => console.error('Customers sync error:', err));

    // --- STAFF/ROLES SYNC ---
    const unsubscribeStaff = onSnapshot(collection(db, 'staff'), (snapshot) => {
      if (snapshot.empty) {
        const defaultRoles = [
          { id: 'nayem@premium-market.tech', name: 'নাঈমুর রহমান', email: 'nayem@premium-market.tech', role: 'Administrator', status: 'Active', permissions: ['categories', 'products', 'orders', 'users', 'marketing', 'settings', 'live-chat'], passwordHash: 'ee7a912e6eaa469065251964f1d701fe51f1d01a88a966fc183a7243a24da7e3' },
          { id: 'sakib@premium-market.tech', name: 'সাকিব হাসান', email: 'sakib@premium-market.tech', role: 'Manager', status: 'Active', permissions: ['products', 'orders', 'marketing'], passwordHash: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92' },
          { id: 'jack@premium-market.tech', name: 'জাকারিয়া রহমান', email: 'jack@premium-market.tech', role: 'Support Agent', status: 'Active', permissions: ['live-chat', 'orders'], passwordHash: '2a18c4b747ddc57ae267f81709473bac4d3fcef623e85014a0ecd98bb19ae699' }
        ];
        defaultRoles.forEach((role) => {
          setDoc(doc(db, 'staff', role.email.toLowerCase()), role).catch(console.error);
        });
      } else {
        const staffList: any[] = [];
        snapshot.forEach((doc) => {
          staffList.push({ id: doc.id, ...doc.data() });
        });
        useStore.setState({ roles: staffList });
      }
    }, (err) => console.error('Staff sync error:', err));

    // --- AUDIT LOGS SYNC ---
    const unsubscribeAuditLogs = onSnapshot(collection(db, 'auditLogs'), (snapshot) => {
      const logList: any[] = [];
      snapshot.forEach((doc) => {
        logList.push({ id: doc.id, ...doc.data() });
      });
      logList.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
      useStore.setState({ auditLogs: logList.slice(0, 50) });
    }, (err) => console.error('AuditLogs sync error:', err));

    return () => {
      unsubscribeOrders();
      unsubscribeCustomers();
      unsubscribeStaff();
      unsubscribeAuditLogs();
    };
  }, [store.isAdminAuthenticated]);

  return null;
}
