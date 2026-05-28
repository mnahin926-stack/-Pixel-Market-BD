import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Truck, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../components/ui/ProductCard';
import { useStore } from '../store';

export default function Home() {
  const products = useStore((state) => state.products);
  const banners = useStore((state) => state.banners) || [];
  const categories = useStore((state) => state.categories) || [];
  const faqs = useStore((state) => state.faqs) || [];
  const siteSettings = useStore((state) => state.siteSettings);
  
  const activeBanners = banners.filter(b => b.status === 'Active');
  const featuredProducts = products.slice(0, 6);
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % activeBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentSlide(prev => (prev + 1) % activeBanners.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentSlide(prev => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  return (
    <div className="flex flex-col gap-6 select-none">
      {/* Moving Offer Ticker (Horizontal Marquee) as requested */}
      <div className="w-full bg-gradient-to-r from-orange-600 via-rose-600 to-amber-500 py-2 rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_0_20px_rgba(234,88,12,0.35)] relative flex items-center mb-2">
        <div className="absolute left-0 top-0 bottom-0 bg-orange-700 text-white font-black text-[9px] md:text-xs px-3 py-1 flex items-center uppercase tracking-widest z-10 rounded-l-2xl shadow-lg border-r border-white/10">
          মেগা অফার
        </div>
        <div className="flex whitespace-nowrap animate-[marquee_25s_linear_infinite] text-xs md:text-sm font-black text-white pl-[100px] tracking-widest">
          <span className="mx-8 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white animate-ping flex-shrink-0"></span>
            {siteSettings?.megaOfferText || '🔥 Pixel Market BD-তে ঈদ অফার! সব প্রিমিয়াম ডিজিটাল স্ক্রিপ্ট এবং থিমে ফ্ল্যাট ২০% ছাড়! কুপন কোড: EID2026 | 🚀 ১০০০+ রেডিমেড ওয়েবসাইট প্রজেক্ট, প্লাগইনস এবং থিম লাইফটাইম লাইসেন্স সহ আজই ডাউনলোড করুন! | 🚚 ৩০০০৳ এর ওপরে কেনাকাটা করলে রয়েছে ফ্রী ইনস্ট্যান্ট ড্রাইভ ডেলিভারি!'}
          </span>
        </div>
      </div>

      {/* Styled animation keyframe for marquee inside container style */}
      <style>{`
        @keyframes marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
      `}</style>

      {/* 1. Bento Layout - Small Slider & All Categories on the Right (On Top first as requested) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-1">
        
        {/* Left Side: Shortened Hero Slider */}
        <div className="lg:col-span-7 bg-[#111113]/40 border border-[#222225] rounded-[24px] md:rounded-[32px] flex flex-col justify-center relative overflow-hidden h-[140px] sm:h-[165px] md:h-[185px] lg:h-[210px] shadow-xl shadow-black/10">
          {activeBanners.length > 0 ? (
            <div className="absolute inset-0 w-full h-full">
              {/* Background Slide Image with Layer Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-950/20 to-purple-950/20 mix-blend-overlay z-0"></div>
              <img 
                src={activeBanners[currentSlide].image} 
                alt="Banner Slide" 
                className="w-full h-full object-cover opacity-25 dark:opacity-30 transition-all duration-1000 ease-out scale-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#0A0A0B] via-white/80 dark:via-[#0A0A0B]/60 to-transparent"></div>
              
              {/* Text Information Inside Slide */}
              <div className="absolute inset-0 flex flex-col justify-center p-3 md:p-5 z-10 max-w-lg">
                <div className="inline-flex items-center gap-2 mb-1">
                  <span className="bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-extrabold tracking-widest uppercase text-[8px] px-2 py-0.5 rounded-full border border-orange-500/20 shadow-sm">
                    অফার ক্যাম্পেইন
                  </span>
                </div>
                <h1 className="text-sm md:text-base lg:text-lg font-black text-slate-900 dark:text-white leading-tight mb-1 drop-shadow-sm font-sans tracking-tight">
                  {activeBanners[currentSlide].title}
                </h1>
                <p className="text-slate-600 dark:text-slate-350 mb-2 text-[9px] md:text-xs leading-relaxed font-semibold line-clamp-1">
                  {activeBanners[currentSlide].subtitle}
                </p>
                <div>
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white rounded-lg font-bold transition-all text-[8px] uppercase tracking-wider shadow-md shadow-orange-600/10 active:scale-95 group"
                  >
                    শপিং শুরু করুন 
                    <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Slider Controls */}
              {activeBanners.length > 1 && (
                <>
                  <button 
                    onClick={handlePrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-200/50 hover:bg-slate-200 dark:bg-black/30 dark:hover:bg-black/85 text-slate-800 dark:text-white flex items-center justify-center border border-slate-300 dark:border-white/5 z-25 cursor-pointer transition-all"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={handleNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-200/50 hover:bg-slate-200 dark:bg-black/30 dark:hover:bg-black/85 text-slate-800 dark:text-white flex items-center justify-center border border-slate-300 dark:border-white/5 z-25 cursor-pointer transition-all"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1 z-25">
                    {activeBanners.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`w-1 h-1 rounded-full transition-all duration-300 ${currentSlide === idx ? 'bg-orange-600 w-2.5' : 'bg-slate-300 dark:bg-white/40'}`}
                      ></button>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Fallback Classic Hero */
            <div className="p-4 flex flex-col justify-center relative overflow-hidden h-full">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-orange-500/10 blur-[60px] rounded-full"></div>
              <span className="text-orange-500 font-extrabold tracking-widest uppercase text-[9px] mb-1">Pixel Market BD 2026</span>
              <h1 className="text-sm md:text-base font-black text-slate-900 dark:text-white leading-tight mb-1">
                প্রিমিয়াম ডিজিটাল সোর্স কোড <span className="text-orange-500 italic">Ultra Pack</span>
              </h1>
              <p className="text-slate-600 dark:text-slate-400 max-w-xs mb-2 text-[10px] leading-relaxed line-clamp-2">
                নিজেদের ব্র্যান্ড বা স্টার্টআপ সফলভাবে দাঁড় করাতে রেডিমেড সোর্স কোড ও থিম ব্যবহার করুন।
              </p>
              <div>
                <Link
                  to="/shop"
                  className="inline-block px-3 py-1 bg-gradient-to-r from-orange-600 to-amber-500 text-white rounded-lg font-bold hover:shadow-[0_0_12px_rgba(234,88,12,0.25)] transition-all text-[9px]"
                >
                  এখনই কিনুন
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Product Categories Grid Preview (All Categories Showing, small and compact) */}
        <div className="lg:col-span-5 bg-[#F8FAFC]/90 dark:bg-[#111113]/70 backdrop-blur-md border border-slate-150 dark:border-white/10 rounded-[24px] md:rounded-[32px] p-4 flex flex-col justify-between shadow-lg shadow-black/5 h-[140px] sm:h-[165px] md:h-[185px] lg:h-[210px]">
          <div className="flex justify-between items-center mb-1.5 flex-shrink-0">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-[10px] uppercase tracking-widest opacity-80">Popular Collections</h3>
              <p className="text-[9px] text-slate-400 dark:text-slate-500">সব ক্যাটাগরি পেয়ে যাবেন এখানে</p>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping"></span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-2 gap-1.5 flex-grow overflow-y-auto pr-1 custom-scrollbar">
            {categories.map(cat => (
              <Link 
                key={cat.id} 
                to={`/shop?category=${encodeURIComponent(cat.name)}`} 
                className="bg-white hover:bg-slate-50 dark:bg-[#0A0A0B]/50 hover:dark:bg-white/10 flex-shrink-0 rounded-xl p-1.5 border border-slate-200 dark:border-white/5 shadow-xs transition-all hover:scale-[1.01] flex items-center gap-1.5"
              >
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-5 h-5 object-cover rounded-md flex-shrink-0 opacity-95" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-600 shadow-[0_0_6px_rgba(234,88,12,0.5)] flex-shrink-0"></div>
                )}
                <span className="text-[9px] font-bold text-slate-800 dark:text-white truncate">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Products Grid comes next as requested */}
      <section className="mt-2 text-slate-900 dark:text-white">
        <div className="flex justify-between items-end mb-6 px-2 md:px-0">
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-800 dark:text-white mb-1.5">জনপ্রিয় প্রোডাক্ট</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm">আমাদের সেরা সেলিং প্রোডাক্টগুলো দেখে নিন</p>
          </div>
          <Link to="/shop" className="sm:flex text-orange-500 hover:text-orange-400 font-bold uppercase tracking-widest text-xs items-center gap-1 transition-colors">
            সব দেখুন <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 md:gap-4 px-2 md:px-0">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-6 text-center sm:hidden col-span-1">
          <Link to="/shop" className="inline-flex py-3 px-6 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-colors uppercase tracking-widest text-[10px]">
            সব প্রোডাক্ট দেখুন
          </Link>
        </div>
      </section>

      {/* Feature Highlights underneath on home page */}
      <div className="bg-[#F8FAFC]/90 dark:bg-[#111113]/75 backdrop-blur-md border border-slate-150 dark:border-white/10 rounded-[24px] p-5 shadow-lg shadow-black/5 mt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300">
            <div className="w-10 h-10 bg-white dark:bg-white/5 rounded-xl flex items-center justify-center text-orange-600 dark:text-orange-500 shadow-sm border border-slate-100 dark:border-white/5">
              <Truck className="w-4 h-4 filter drop-shadow-[0_0_2px_rgba(234,88,12,0.3)]" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-xs md:text-sm">ইনস্ট্যান্ট ডেলিভারি</h4>
              <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-500 mt-0.5">অর্ডার ভেরিফাই হলেই গুগল ড্রাইভ লাইভ ডাউনলোড লিংক</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300">
            <div className="w-10 h-10 bg-white dark:bg-white/5 rounded-xl flex items-center justify-center text-orange-600 dark:text-orange-500 shadow-sm border border-slate-100 dark:border-white/5">
              <Shield className="w-4 h-4 filter drop-shadow-[0_0_2px_rgba(234,88,12,0.3)]" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-xs md:text-sm">লাইফটাইম সাপোর্ট</h4>
              <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-500 mt-0.5">সরাসরি সফ্টওয়্যার ইঞ্জিনিয়ারদের দ্বারা নিবিড় সাপোর্ট</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQs Collapsible Section */}
      <section className="mt-12 mb-8 animate-in fade-in">
        <div className="text-center mb-10">
          <span className="text-xs bg-orange-600/10 text-orange-500 font-extrabold px-3 py-1 uppercase tracking-widest rounded-full">প্রশ্ন ও উত্তর</span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-4">সাধারণ জিজ্ঞাসা (FAQ)</h2>
          <p className="text-slate-550 dark:text-slate-400 mt-2 text-xs md:text-sm max-w-md mx-auto">ডিজিটাল প্রোডাক্ট ক্রয় এবং লাইসেন্স সংক্রান্ত কিছু কমন প্রশ্নাবলি ও সরল সমাধান</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div key={faq.id || idx} className="bg-white dark:bg-[#111113] border border-slate-150 dark:border-white/10 rounded-2xl overflow-hidden transition-all shadow-sm">
                <button 
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full px-6 py-4.5 text-left flex justify-between items-center font-bold text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer text-sm"
                >
                  <span className="pr-4">{faq.q}</span>
                  <span className={`text-orange-500 font-black text-lg transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}>+</span>
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-slate-600 dark:text-slate-300 text-xs md:text-sm border-t border-slate-100 dark:border-white/5 leading-relaxed bg-slate-50/50 dark:bg-[#0A0A0B]/30 font-sans">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
