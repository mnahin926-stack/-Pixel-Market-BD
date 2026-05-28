import React, { useState } from 'react';
import { Image as ImageIcon, Tag, Plus, Edit, Trash2, X } from 'lucide-react';
import { useStore, Banner, Coupon } from '../../store';
import { toast } from 'react-toastify';

export default function AdminMarketing() {
  const { 
    banners, addBanner, updateBanner, deleteBanner, 
    coupons, addCoupon, updateCoupon, deleteCoupon 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'banners' | 'coupons'>('banners');
  
  // State for modals
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);

  // Banner form inputs
  const [bTitle, setBTitle] = useState('');
  const [bSubtitle, setBSubtitle] = useState('');
  const [bImage, setBImage] = useState('');
  const [bStatus, setBStatus] = useState<'Active' | 'Inactive'>('Active');
  const [bPosition, setBPosition] = useState(1);

  // Coupon form inputs
  const [cCode, setCCode] = useState('');
  const [cType, setCType] = useState<'percentage' | 'fixed'>('percentage');
  const [cValue, setCValue] = useState(10);
  const [cMinSpend, setCMinSpend] = useState(500);
  const [cExpiry, setCExpiry] = useState('2026-12-31');
  const [cStatus, setCStatus] = useState<'Active' | 'Inactive'>('Active');

  // Open Banner dialog handlers
  const openAddBanner = () => {
    setEditingBannerId(null);
    setBTitle('');
    setBSubtitle('');
    setBImage('');
    setBStatus('Active');
    setBPosition(1);
    setIsBannerModalOpen(true);
  };

  const openEditBanner = (bn: Banner) => {
    setEditingBannerId(bn.id);
    setBTitle(bn.title);
    setBSubtitle(bn.subtitle);
    setBImage(bn.image);
    setBStatus(bn.status);
    setBPosition(bn.position || 1);
    setIsBannerModalOpen(true);
  };

  const handleBannerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bTitle.trim() || !bSubtitle.trim() || !bImage.trim()) {
      return toast.error('দয়া করে শিরোনাম, উপ- শিরোনাম এবং ইমেজ লিংক ঠিকভাবে প্রদান করুন!');
    }

    const payload: Banner = {
      id: editingBannerId || `bn-${Date.now()}`,
      title: bTitle.trim(),
      subtitle: bSubtitle.trim(),
      image: bImage.trim(),
      position: Number(bPosition),
      status: bStatus
    };

    if (editingBannerId) {
      updateBanner(payload);
      toast.success('ব্যানার স্লাইডার সফলভাবে আপডেট করা হয়েছে!');
    } else {
      addBanner(payload);
      toast.success('নতুন ব্যানার স্লাইড তৈরি করা হয়েছে!');
    }
    setIsBannerModalOpen(false);
  };

  // Open Coupon dialog handlers
  const openAddCoupon = () => {
    setEditingCouponId(null);
    setCCode('');
    setCType('percentage');
    setCValue(10);
    setCMinSpend(500);
    setCExpiry('2026-06-30');
    setCStatus('Active');
    setIsCouponModalOpen(true);
  };

  const openEditCoupon = (cp: Coupon) => {
    setEditingCouponId(cp.id);
    setCCode(cp.code);
    setCType(cp.discountType);
    setCValue(cp.discountValue);
    setCMinSpend(cp.minSpend);
    setCExpiry(cp.expiryDate);
    setCStatus(cp.status);
    setIsCouponModalOpen(true);
  };

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cCode.trim() || cValue <= 0) {
      return toast.error('কুপন কোড এবং ডিসকাউন্ট পরিমাণ সঠিক হতে হবে!');
    }

    const currentUsage = editingCouponId ? (coupons.find(c => c.id === editingCouponId)?.totalUsage || 0) : 0;

    const payload: Coupon = {
      id: editingCouponId || `cp-${Date.now()}`,
      code: cCode.trim().toUpperCase(),
      discountType: cType,
      discountValue: Number(cValue),
      minSpend: Number(cMinSpend),
      expiryDate: cExpiry,
      status: cStatus,
      totalUsage: currentUsage
    };

    if (editingCouponId) {
      updateCoupon(payload);
      toast.success('কুপন সফলভাবে সংশোধন করা হয়েছে!');
    } else {
      // Check duplicate
      const duplicate = coupons.find(c => c.code.toUpperCase() === payload.code);
      if (duplicate) {
        return toast.error('এই কুপন কোডটি ইতিমধ্যে আমাদের সিস্টেমে আছে!');
      }
      addCoupon(payload);
      toast.success('নতুন প্রোমো কুপন যোগ করা হয়েছে!');
    }
    setIsCouponModalOpen(false);
  };

  const handleDeleteBanner = (id: string) => {
    deleteBanner(id);
    toast.success('ব্যানার সফলভাবে মুছে ফেলা হয়েছে!');
  };

  const handleDeleteCoupon = (id: string) => {
    deleteCoupon(id);
    toast.success('কুপন সফলভাবে ডিলিট করা হয়েছে!');
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-5xl text-slate-805">
      
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">মার্কেটিং ও অফার ব্যানারসমূহ</h2>
          <p className="text-slate-500 text-sm mt-1">হোমপেইজের স্লাইডার ইমেজ, ডিসকাউন্ট ব্যানার এবং কুপন ক্যাম্পেইন প্রমোশন পরিচালনা করুন</p>
        </div>
        <button 
          onClick={activeTab === 'banners' ? openAddBanner : openAddCoupon}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold transition-colors shadow-lg shadow-indigo-600/25 cursor-pointer text-sm"
        >
          <Plus className="w-5 h-5" /> 
          {activeTab === 'banners' ? 'নতুন ব্যানার স্লাইড' : 'নতুন কুপন তৈরি করুন'}
        </button>
      </div>

      {/* Tabs navigation */}
      <div className="flex bg-white rounded-xl border border-slate-100 p-1 w-max">
         <button
           onClick={() => setActiveTab('banners')}
           className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'banners' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
         >
           <ImageIcon className="w-4 h-4" /> ব্যানার ও হোম স্লাইডার ({banners.length})
         </button>
         <button
           onClick={() => setActiveTab('coupons')}
           className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'coupons' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
         >
           <Tag className="w-4 h-4" /> কুপন কোড ড্যাশবোর্ড ({coupons.length})
         </button>
      </div>

      {/* View section content */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        
        {/* Banner rendering */}
        {activeTab === 'banners' && (
          <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {banners.map((bn) => (
                 <div key={bn.id} className="border border-slate-150 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow group">
                    <div className="h-40 bg-slate-200 flex items-center justify-center relative">
                      <img src={bn.image} alt={bn.title} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" />
                      <div className="absolute top-2 right-2 flex gap-1.5">
                        <span className={`text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded shadow ${bn.status === 'Active' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                          {bn.status}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-white space-y-2">
                      <h3 className="font-extrabold text-slate-950 text-base line-clamp-1">{bn.title}</h3>
                      <p className="text-xs text-slate-450 line-clamp-2 leading-relaxed">{bn.subtitle}</p>
                      <div className="text-[10px] bg-slate-100 border border-slate-200 py-1 px-2 rounded-lg text-slate-500 inline-block font-mono mt-2">
                        Position: {bn.position || 1}
                      </div>
                      <div className="flex gap-2 pt-3 border-t border-slate-100">
                         <button 
                           onClick={() => openEditBanner(bn)}
                           className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                         >
                           Edit Banner
                         </button>
                         <button 
                           onClick={() => handleDeleteBanner(bn.id)}
                           className="flex-1 border border-rose-100/60 text-rose-600 hover:bg-rose-50/50 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                         >
                           Delete
                         </button>
                      </div>
                    </div>
                 </div>
               ))}
               
               {/* Add New Quick Card representation */}
               <div 
                 onClick={openAddBanner}
                 className="border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden group flex flex-col items-center justify-center h-[280px] cursor-pointer hover:bg-slate-50 transition-colors bg-slate-50/20"
               >
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm">নতুন বিজ্ঞাপনী ব্যানার যুক্ত করুন</h3>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest font-mono">1920x600px Preferred</p>
               </div>
             </div>
          </div>
        )}

        {/* Coupons rendering */}
        {activeTab === 'coupons' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-900 font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">কুপন কোড</th>
                  <th className="px-6 py-4">ডিসকাউন্ট পরিমাণ</th>
                  <th className="px-6 py-4">ন্যূনতম শপিং (৳)</th>
                  <th className="px-6 py-4 font-bangla">মেয়াদ উত্তীর্ণের তারিখ</th>
                  <th className="px-6 py-4 text-center">ব্যবহারের হিসাব</th>
                  <th className="px-6 py-4">স্ট্যাটাস</th>
                  <th className="px-6 py-4 text-right pr-8 font-bangla">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coupons.length > 0 ? (
                  coupons.map((cop) => (
                    <tr key={cop.id} className="border-b border-slate-50 hover:bg-slate-50/40 transition-colors">
                       <td className="px-6 py-4 whitespace-nowrap">
                         <span className="font-bold text-indigo-700 bg-indigo-50 border border-indigo-150 px-3 py-1.5 rounded-xl text-xs uppercase tracking-widest font-mono">
                           {cop.code}
                         </span>
                       </td>
                       <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                         {cop.discountType === 'percentage' ? `${cop.discountValue}% ছাড়` : `৳${cop.discountValue} ছাড়`}
                       </td>
                       <td className="px-6 py-4 font-bold font-mono text-slate-755 whitespace-nowrap">৳{cop.minSpend}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium">{cop.expiryDate}</td>
                       <td className="px-6 py-4 text-center whitespace-nowrap">
                         <span className="bg-slate-100 px-2.5 py-1 rounded-xl text-slate-800 font-semibold text-xs border border-slate-200">
                           {cop.totalUsage} বার ব্যবহার হয়েছে
                         </span>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shadow-sm border ${
                           cop.status === 'Active' ? 'bg-emerald-100 text-emerald-800 border-emerald-150' : 'bg-rose-100 text-rose-800 border-rose-150'
                         }`}>
                           {cop.status}
                         </span>
                       </td>
                       <td className="px-6 py-4 text-right pr-6 whitespace-nowrap">
                          <button 
                            onClick={() => openEditCoupon(cop)}
                            className="text-slate-400 hover:text-indigo-650 hover:bg-indigo-50 p-2 rounded-xl mr-1 cursor-pointer transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteCoupon(cop.id)}
                            className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-xl cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                       </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      কোনো প্রোমো কুপন পাওয়া যায়নি।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Banner Create Modal */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 relative shadow-2xl text-slate-800 animate-in zoom-in">
            <button 
              onClick={() => setIsBannerModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h3 className="text-xl font-bold text-slate-900 mb-6">
              {editingBannerId ? 'বিজ্ঞাপনী ব্যানার সংশোধন করুন' : 'নতুন বিজ্ঞাপনী ব্যানার স্লাইড'}
            </h3>

            <form onSubmit={handleBannerSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1.5 font-bold">ব্যানার ক্যন্টেন্ট টাইটেল</label>
                <input 
                  type="text" 
                  value={bTitle} 
                  onChange={(e) => setBTitle(e.target.value)} 
                  placeholder="যেমন: আকর্ষণীয় ব্লুটুথ হেডফোন ক্যাটাগরি"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-805"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1.5 font-bold">উপ-শিরোনাম (Sub-title)</label>
                <input 
                  type="text" 
                  value={bSubtitle} 
                  onChange={(e) => setBSubtitle(e.target.value)} 
                  placeholder="যেমন: ২৫% পর্যন্ত মেগা ফ্ল্যাশ ছাড় রয়েছে আজ রাত পর্যন্ত"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-805"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1.5 font-bold">ইমেজ লিংক (Image URL)</label>
                <input 
                  type="text" 
                  value={bImage} 
                  onChange={(e) => setBImage(e.target.value)} 
                  placeholder="যেমন: https://images.unsplash.com/promo-banner"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-805"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1.5 font-bold">পজিশন অর্ডার</label>
                <input 
                  type="number" 
                  value={bPosition} 
                  onChange={(e) => setBPosition(Number(e.target.value))} 
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-805"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1.5 font-bold">স্ট্যাটাস</label>
                <select 
                  value={bStatus} 
                  onChange={(e) => setBStatus(e.target.value as 'Active' | 'Inactive')}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-805"
                >
                  <option value="Active">Active (সক্রিয়)</option>
                  <option value="Inactive">Inactive (নিষ্ক্রিয়)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-6 font-bangla">
                <button 
                  type="button" 
                  onClick={() => setIsBannerModalOpen(false)}
                  className="border border-slate-200 text-slate-500 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md cursor-pointer"
                >
                  {editingBannerId ? 'আপডেট ব্যানার' : 'তৈরি স্লাইড'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupon Create Modal */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 relative shadow-2xl text-slate-800 animate-in zoom-in">
            <button 
              onClick={() => setIsCouponModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h3 className="text-xl font-bold text-slate-900 mb-6">
              {editingCouponId ? 'প্রোমো কুপন এডিট করুন' : 'নতুন প্রোমো কুপন তৈরি'}
            </h3>

            <form onSubmit={handleCouponSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1.5 font-bold">কুপন কোড (যেমন: EID50)</label>
                <input 
                  type="text" 
                  value={cCode} 
                  onChange={(e) => setCCode(e.target.value)} 
                  placeholder="যেমন: SAVE20, FREESHIP"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-805 font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1.5 font-bold font-bangla font-semibold">ডিসকাউন্ট ধরণ</label>
                  <select 
                    value={cType} 
                    onChange={(e) => setCType(e.target.value as 'percentage' | 'fixed')}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-805"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Price (৳)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1.5 font-bold font-bangla font-semibold">ভ্যালু</label>
                  <input 
                    type="number" 
                    value={cValue} 
                    onChange={(e) => setCValue(Number(e.target.value))} 
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-805 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1.5 font-bold">সর্বনিম্ন শপিং খরচ (Minimum Basket Spend ৳)</label>
                <input 
                  type="number" 
                  value={cMinSpend} 
                  onChange={(e) => setCMinSpend(Number(e.target.value))} 
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-805 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1.5 font-bold font-bangla font-semibold">মেয়াদ উত্তীর্ণের তারিখ</label>
                <input 
                  type="text" 
                  value={cExpiry} 
                  onChange={(e) => setCExpiry(e.target.value)} 
                  placeholder="2026-12-31"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-850 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1.5 font-bold">স্ট্যাটাস</label>
                <select 
                  value={cStatus} 
                  onChange={(e) => setCStatus(e.target.value as 'Active' | 'Inactive')}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-805"
                >
                  <option value="Active">Active (সক্রিয়)</option>
                  <option value="Inactive">Inactive (নিষ্ক্রিয়)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-6 font-bangla">
                <button 
                  type="button" 
                  onClick={() => setIsCouponModalOpen(false)}
                  className="border border-slate-200 text-slate-500 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button 
                  type="submit"
                  className="bg-indigo-650 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md cursor-pointer"
                >
                  {editingCouponId ? 'আপডেট কুপন' : 'তৈরি কুপন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
