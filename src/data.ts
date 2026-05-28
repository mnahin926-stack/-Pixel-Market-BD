export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[]; // Multiple images support
  description: string;
  stock: number;
  sizes?: string[];
  colors?: string[];
  // Digital specific fields
  demoUrl?: string;
  fileUrl?: string;
  fileSize?: string;
  version?: string;
  isActive?: boolean;
}

export const CATEGORIES = [
  "থিম ও প্লাগইন",
  "সোর্স কোড / স্ক্রিপ্ট",
  "গ্রাফিক্স ও ডিজাইন",
  "ই-বই / ই-বুক",
  "অন্যান্য সফটওয়্যার"
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "PixelStore - Ultimate React & Tailwind E-Commerce Script",
    category: "সোর্স কোড / স্ক্রিপ্ট",
    price: 1550,
    originalPrice: 3500,
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=400",
    images: [
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=400",
      "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=400"
    ],
    description: "পিক্সেলস্টোর একটি কমপ্লিট রিঅ্যাক্ট এবং টেইলউইন্ড সিএসএস ই-কমার্স সোর্স কোড। এটি ফুল সাইকেল ম্যানেজমেন্ট, মোবাইল রেসপনসিভ কার্ট, এবং অ্যাডমিন কন্ট্রোল সাপোর্ট করে।",
    stock: 9999, // unlimited for digital downloads
    demoUrl: "https://pixelstore-demo.vercel.app",
    fileUrl: "https://pixelmarket.com/secure-downloads/pixelstore-react-v1.4.0.zip",
    fileSize: "28.5 MB",
    version: "v1.4.0",
    isActive: true
  },
  {
    id: "2",
    name: "Elementor Pro Real-Estate Dynamic Website Template Pack",
    category: "থিম ও প্লাগইন",
    price: 850,
    originalPrice: 1500,
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=400",
    images: [
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=400",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=400"
    ],
    description: "এলিমেন্টর প্রো দিয়ে তৈরি প্রফেশনাল রিয়েল এস্টেট ওয়েবসাইট টেমপ্লেট। এটি কাস্টম ফিল্টার, ডায়নামিক বুকিং ফর্ম, এবং প্রিমিয়াম লেআউট সহ সরাসরি ইমপোর্ট করার যোগ্য।",
    stock: 9999,
    demoUrl: "https://estatepro-demo.elementor.com",
    fileUrl: "https://pixelmarket.com/secure-downloads/elementor-realestate-theme.zip",
    fileSize: "12.2 MB",
    version: "v2.1.5",
    isActive: true
  },
  {
    id: "3",
    name: "Digital Marketing Mastery Handbook (Bangla PDF eBook)",
    category: "ই-বই / ই-বুক",
    price: 320,
    originalPrice: 650,
    image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=400",
    images: [
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=400"
    ],
    description: "সহজ বাংলা ভাষায় লিখা ডিজিটাল মার্কেটিং এর মাস্টার ক্লাসের কমপ্লিট গাইডবুক। ফেসবুক অ্যাডস, গুগল এসইও, ইমেইল ফানেল ও সেলস লিড জেনারেশন নিয়ে বিস্তারিত আলোচনা সহ ৩৫০+ পাতার ফুল পিডিএফ বুক।",
    stock: 9999,
    fileUrl: "https://pixelmarket.com/secure-downloads/digital-marketing-bangla.pdf",
    fileSize: "18.4 MB",
    version: "2026 Edition",
    isActive: true
  },
  {
    id: "4",
    name: "SaaS Multi-Tenant Project Management System Laravel Script",
    category: "সোর্স কোড / স্ক্রিপ্ট",
    price: 2450,
    originalPrice: 5000,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400",
    images: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400",
      "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=400"
    ],
    description: "লারাবেল ফ্রেমওয়ার্ক ভিত্তিক শক্তিশালী মাল্টি-টেন্যান্ট প্রজেক্ট এবং টাস্ক ম্যানেজমেন্ট সফটওয়্যার। আনলিমিটেড অর্গানাইজেশন, কানবান বোর্ড, রিয়েল টাইম চ্যাট এবং সাবস্ক্রিপশন ইনভয়েস ইন্টিগ্রেশন সম্পন্ন।",
    stock: 9999,
    demoUrl: "https://saas-pm-demo.premium-market.tech",
    fileUrl: "https://pixelmarket.com/secure-downloads/laravel-saas-pm.zip",
    fileSize: "42.0 MB",
    version: "v3.0.2",
    isActive: true
  },
  {
    id: "5",
    name: "120+ Premium Retro SVG Icons & UI Elements Pack",
    category: "গ্রাফিক্স ও ডিজাইন",
    price: 290,
    originalPrice: 600,
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400",
    images: [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400"
    ],
    description: "১০০% ভেক্টর প্রিমিয়াম রেট্রো স্টাইলের আইকনপ্যাক। Figma, Illustrator, এবং SVG ফরম্যাটে পেয়ে যাচ্ছেন। আপনার অ্যাপস, ল্যান্ডিং পেজ বা সোশ্যাল মিডিয়া পোষ্টে ব্যবহারের জন্য পারফেক্ট।",
    stock: 9999,
    fileUrl: "https://pixelmarket.com/secure-downloads/retro-icons-svg.zip",
    fileSize: "4.5 MB",
    version: "v1.0.0",
    isActive: true
  },
  {
    id: "6",
    name: "Premium Elementor Template for Agency & Consultants",
    category: "থিম ও প্লাগইন",
    price: 650,
    originalPrice: 1200,
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=400",
    description: "ডিজিটাল এজেন্সি এবং কনসালটেন্সি সার্ভিসের জন্য মডার্ন রেসপন্সিভ ওয়ার্ডপ্রেস এলিমেন্টর লেআউট। ফাস্ট লোডিং পেজ স্পিড এবং এসইও অপ্টিমাইজড।",
    stock: 9999,
    demoUrl: "https://agency-elem.demo.com",
    fileUrl: "https://pixelmarket.com/secure-downloads/agency-elementor.zip",
    fileSize: "8.1 MB",
    version: "v1.2.0",
    isActive: true
  }
];

