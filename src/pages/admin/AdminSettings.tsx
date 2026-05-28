import React, { useState } from 'react';
import { Save, Store, Globe, MapPin, Phone, Mail, Link as LinkIcon, Camera, Lock, User, Truck, MessageSquare, Palette, Menu, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useStore, SiteSettings, Faq } from '../../store';

export default function AdminSettings() {
  const adminCredentials = useStore((state) => state.adminCredentials);
  const updateAdminCredentials = useStore((state) => state.updateAdminCredentials);
  const siteSettings = useStore((state) => state.siteSettings);
  const updateSiteSettings = useStore((state) => state.updateSiteSettings);
  
  const faqs = useStore((state) => state.faqs) || [];
  const addFaq = useStore((state) => state.addFaq);
  const updateFaq = useStore((state) => state.updateFaq);
  const deleteFaq = useStore((state) => state.deleteFaq);

  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(siteSettings);

  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [faqFormData, setFaqFormData] = useState({ q: '', a: '' });
  const [isFaqFormOpen, setIsFaqFormOpen] = useState(false);

  const handleFaqSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqFormData.q.trim() || !faqFormData.a.trim()) {
      return toast.error('প্রশ্ন এবং উত্তর উভয়ই ইনপুট করতে হবে!');
    }
    if (editingFaqId) {
      updateFaq({ id: editingFaqId, q: faqFormData.q.trim(), a: faqFormData.a.trim() });
      toast.success('প্রশ্ন-উত্তর সফলভাবে আপডেট করা হয়েছে!');
    } else {
      addFaq({ id: `faq-${Date.now()}`, q: faqFormData.q.trim(), a: faqFormData.a.trim() });
      toast.success('নতুন প্রশ্ন-উত্তর সফলভাবে যুক্ত করা হয়েছে!');
    }
    setFaqFormData({ q: '', a: '' });
    setEditingFaqId(null);
    setIsFaqFormOpen(false);
  };

  const handleEditFaq = (faq: Faq) => {
    setEditingFaqId(faq.id);
    setFaqFormData({ q: faq.q, a: faq.a });
    setIsFaqFormOpen(true);
  };

  const handleDeleteFaq = (id: string) => {
    deleteFaq(id);
    toast.success('প্রশ্ন-উত্তর মুছে ফেলা হয়েছে!');
  };

  const [securityData, setSecurityData] = useState({
    username: adminCredentials.username,
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSettingChange = (field: keyof SiteSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'faviconUrl' | 'headerLogoUrl' | 'footerLogoUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          handleSettingChange(field, reader.result);
          toast.success('ছবিটি ডিভাইস থেকে সফলভাবে লোড করা হয়েছে!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNestedChange = (parent: keyof SiteSettings, field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as any),
        [field]: value
      }
    }));
  };

  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSecurityData(prev => ({ ...prev, [name]: value }));
  };

  const handleDeliveryOptionChange = (id: string, field: string, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      deliveryOptions: prev.deliveryOptions.map(opt => opt.id === id ? { ...opt, [field]: value } : opt)
    }));
  };

  const addDeliveryOption = () => {
    const newId = `custom-${Date.now()}`;
    setSettings(prev => {
      const updated = {
        ...prev,
        deliveryOptions: [
          ...prev.deliveryOptions,
          { id: newId, active: true, name: 'নতুন ডেলিভারি অপশন', time: '১-২ দিন', charge: 0 }
        ]
      };
      updateSiteSettings(updated);
      return updated;
    });
    toast.success('নতুন ডেলিভারি অপশন যোগ করা হয়েছে!');
  };

  const removeDeliveryOption = (id: string) => {
    setSettings(prev => {
      const updated = {
        ...prev,
        deliveryOptions: prev.deliveryOptions.filter(opt => opt.id !== id)
      };
      updateSiteSettings(updated);
      return updated;
    });
    toast.success('ডেলিভারি অপশনটি সফলভাবে মুছে ফেলা হয়েছে!');
  };

  const handleNavChange = (id: string, field: string, value: string) => {
     setSettings(prev => ({
      ...prev,
      navigation: prev.navigation.map(nav => nav.id === id ? { ...nav, [field]: value } : nav)
    }));
  }

  const addNavItem = () => {
    const newId = `nav-${Date.now()}`;
    setSettings(prev => ({
      ...prev,
      navigation: [
        ...prev.navigation,
        { id: newId, label: 'New Link', url: '/' }
      ]
    }));
  }

  const removeNavItem = (id: string) => {
    setSettings(prev => ({
        ...prev,
        navigation: prev.navigation.filter(opt => opt.id !== id)
      }));
  }

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      updateSiteSettings(settings);
      setIsSaving(false);
      toast.success('সেটিংস সফলভাবে আপডেট করা হয়েছে');
    }, 1000);
  };

  const handleSecuritySave = () => {
    if (securityData.oldPassword !== adminCredentials.password) {
      toast.error('বর্তমান পাসওয়ার্ডটি সঠিক নয়!');
      return;
    }
    if (securityData.newPassword !== securityData.confirmPassword) {
      toast.error('নতুন পাসওয়ার্ড দুইটি মিলছে না!');
      return;
    }
    if (securityData.newPassword.length < 6 && securityData.newPassword.length > 0) {
      toast.error('পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে!');
      return;
    }

    const finalPassword = securityData.newPassword || adminCredentials.password;
    updateAdminCredentials(securityData.username, finalPassword);
    
    setSecurityData({
      username: securityData.username,
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    
    toast.success('সিকিউরিটি সেটিংস সফলভাবে আপডেট করা হয়েছে');
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm sticky top-0 z-10">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">জেনারেল সেটিংস</h2>
          <p className="text-slate-500 text-sm mt-1">ওয়েবসাইটের নাম, লোগো, এবং বেসিক ইনফরমেশন আপডেট করুন</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-medium transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSaving ? <Store className="w-5 h-5 animate-pulse" /> : <Save className="w-5 h-5" />}
          {isSaving ? 'সংরক্ষণ হচ্ছে...' : 'সেভ পরিবর্তন'}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-12">
        
        {/* 1. Branding & Logos */}
        <section>
          <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Palette className="w-5 h-5 text-indigo-600" /> Branding & Logos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700">Website Name</label>
              <input type="text" value={settings.storeName} onChange={(e) => handleSettingChange('storeName', e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Favicon URL / বাউজার আপলোড (Favicon)</label>
              <input type="text" placeholder="https://..." value={settings.faviconUrl} onChange={(e) => handleSettingChange('faviconUrl', e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs" />
              <div className="flex items-center gap-3">
                <label className="px-3.5 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-650 hover:border-indigo-300 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold cursor-pointer transition-all inline-flex items-center gap-1.5 shadow-sm">
                  <Camera className="w-3.5 h-3.5 text-indigo-500" /> ডিভাইস থেকে ছবি সিলেক্ট করুন
                  <input type="file" accept="image/*" onChange={(e) => handleLogoUpload(e, 'faviconUrl')} className="hidden" />
                </label>
                {settings.faviconUrl && (
                  <img src={settings.faviconUrl} alt="Favicon Preview" className="h-7 w-7 object-contain rounded-lg border border-slate-200 bg-slate-50 p-0.5" />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Header Top Logo URL / বাউজার আপলোড (Header Logo)</label>
              <input type="text" placeholder="https://..." value={settings.headerLogoUrl} onChange={(e) => handleSettingChange('headerLogoUrl', e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs" />
              <div className="flex items-center gap-3">
                <label className="px-3.5 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-650 hover:border-indigo-300 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold cursor-pointer transition-all inline-flex items-center gap-1.5 shadow-sm">
                  <Camera className="w-3.5 h-3.5 text-indigo-500" /> ডিভাইস থেকে ছবি সিলেক্ট করুন
                  <input type="file" accept="image/*" onChange={(e) => handleLogoUpload(e, 'headerLogoUrl')} className="hidden" />
                </label>
                {settings.headerLogoUrl && (
                  <img src={settings.headerLogoUrl} alt="Header Logo Preview" className="h-7 w-auto max-w-[120px] object-contain rounded-lg border border-slate-200 bg-slate-50 p-0.5" />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Footer Bottom Logo URL / বাউজার আপলোড (Footer Logo)</label>
              <input type="text" placeholder="https://..." value={settings.footerLogoUrl} onChange={(e) => handleSettingChange('footerLogoUrl', e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs" />
              <div className="flex items-center gap-3">
                <label className="px-3.5 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-650 hover:border-indigo-300 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold cursor-pointer transition-all inline-flex items-center gap-1.5 shadow-sm">
                  <Camera className="w-3.5 h-3.5 text-indigo-500" /> ডিভাইস থেকে ছবি সিলেক্ট করুন
                  <input type="file" accept="image/*" onChange={(e) => handleLogoUpload(e, 'footerLogoUrl')} className="hidden" />
                </label>
                {settings.footerLogoUrl && (
                  <img src={settings.footerLogoUrl} alt="Footer Logo Preview" className="h-7 w-auto max-w-[120px] object-contain rounded-lg border border-slate-200 bg-slate-50 p-0.5" />
                )}
              </div>
            </div>
            <div className="space-y-1">
               <label className="text-sm font-bold text-slate-700">Contact Email</label>
               <input type="email" value={settings.contactEmail} onChange={(e) => handleSettingChange('contactEmail', e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
             </div>
             <div className="space-y-1">
               <label className="text-sm font-bold text-slate-700">Contact Phone</label>
               <input type="tel" value={settings.contactPhone} onChange={(e) => handleSettingChange('contactPhone', e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
             </div>
             <div className="space-y-1">
               <label className="text-sm font-bold text-slate-700">WhatsApp Number</label>
               <input type="tel" value={settings.whatsappNumber} onChange={(e) => handleSettingChange('whatsappNumber', e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
             </div>
          </div>
        </section>

        {/* 2. General Information */}
        <section>
          <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Store className="w-5 h-5 text-indigo-600" /> General Info & Socials
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700">Announcement Badge Title (Top bar)</label>
              <input type="text" value={settings.announcementText} onChange={(e) => handleSettingChange('announcementText', e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700">মেগা অফার কাস্টমাইজ টেক্সট (Mega Offer Marquee)</label>
              <input type="text" value={settings.megaOfferText || ''} onChange={(e) => handleSettingChange('megaOfferText', e.target.value)} placeholder="মেগা অফারে প্রদর্শন করার টেক্সট..." className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700">Head Office Address</label>
              <input type="text" value={settings.headOfficeAddress} onChange={(e) => handleSettingChange('headOfficeAddress', e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="space-y-1 col-span-1 md:col-span-2">
              <label className="text-sm font-bold text-slate-700">Website Description (Footer Motto)</label>
              <input type="text" value={settings.description} onChange={(e) => handleSettingChange('description', e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="space-y-1 col-span-1 md:col-span-2">
              <label className="text-sm font-bold text-slate-700">আমাদের সম্পর্কে (About Us - Page Content)</label>
              <textarea 
                rows={10} 
                value={settings.aboutUsText || ''} 
                onChange={(e) => handleSettingChange('aboutUsText', e.target.value)} 
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans text-sm font-medium leading-relaxed bg-white"
                placeholder="আমাদের সম্পর্কে বিস্তারিত বিবরণ এখানে লিখুন..."
              />
              <p className="text-[11px] text-indigo-500 font-semibold mt-1">
                * টিপস: আপনি নতুন লাইন ব্যবহারে আলাদা প্যারাগ্রাফ এবং লাইনের শুরুতে • বা - যুক্ত করে বুলেট পয়েন্ট তৈরি করতে পারেন।
              </p>
            </div>
            <div className="space-y-1 col-span-1 md:col-span-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">Theme Primary Color (Hex)</label>
              <div className="flex gap-4 items-center">
                 <input type="color" value={settings.colors.primary} onChange={(e) => handleNestedChange('colors', 'primary', e.target.value)} className="w-12 h-12 p-1 rounded-lg border border-slate-200 cursor-pointer" />
                 <input type="text" value={settings.colors.primary} onChange={(e) => handleNestedChange('colors', 'primary', e.target.value)} className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 max-w-[200px]" placeholder="#ea580c" />
              </div>
            </div>
            {/* Social Links */}
             <div className="space-y-1">
               <label className="text-sm font-bold text-slate-700">Facebook URL</label>
               <input type="url" value={settings.socialLinks.facebook} onChange={(e) => handleNestedChange('socialLinks', 'facebook', e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
             </div>
             <div className="space-y-1">
               <label className="text-sm font-bold text-slate-700">YouTube URL</label>
               <input type="url" value={settings.socialLinks.youtube} onChange={(e) => handleNestedChange('socialLinks', 'youtube', e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
             </div>
             <div className="space-y-1">
               <label className="text-sm font-bold text-slate-700">Instagram URL</label>
               <input type="url" value={settings.socialLinks.instagram} onChange={(e) => handleNestedChange('socialLinks', 'instagram', e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
             </div>
             <div className="space-y-1">
               <label className="text-sm font-bold text-slate-700">Telegram URL</label>
               <input type="url" value={settings.socialLinks.telegram} onChange={(e) => handleNestedChange('socialLinks', 'telegram', e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
             </div>
          </div>
        </section>

        {/* 3. Delivery Options */}
        <section>
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-indigo-600" /> ডেলিভারি চার্জ ও ঠিকানা সেটিংস
            </h3>
            <button onClick={addDeliveryOption} className="text-indigo-600 hover:text-indigo-700 font-bold text-sm flex items-center gap-1">
              <Plus className="w-4 h-4" /> নতুন অপশন
            </button>
          </div>
          
          <div className="space-y-4">
             {settings.deliveryOptions.map((opt, index) => (
               <div key={opt.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4 items-start md:items-end">
                  <div className="flex-1 space-y-1">
                    <label className="text-sm font-bold text-slate-700">অপশন এর নাম (Label)</label>
                    <input type="text" value={opt.name} onChange={(e) => handleDeliveryOptionChange(opt.id, 'name', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-white" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-sm font-bold text-slate-700">ডেলিভারি সময় (Estimate)</label>
                    <input type="text" value={opt.time} onChange={(e) => handleDeliveryOptionChange(opt.id, 'time', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-white" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-sm font-bold text-slate-700">ডেলিভারি ফি (৳)</label>
                    <input type="number" value={opt.charge} onChange={(e) => handleDeliveryOptionChange(opt.id, 'charge', Number(e.target.value))} className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-white" />
                  </div>
                  <div className="flex items-center gap-2 pb-2">
                     <label className="flex items-center gap-2 cursor-pointer font-bold text-sm">
                       <input type="checkbox" checked={opt.active} onChange={(e) => handleDeliveryOptionChange(opt.id, 'active', e.target.checked)} className="w-4 h-4 text-indigo-600" />
                       সক্রিয়
                     </label>
                  </div>
                  <button onClick={() => removeDeliveryOption(opt.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg mb-1">
                    <Trash2 className="w-5 h-5" />
                  </button>
               </div>
             ))}
          </div>
        </section>

        {/* 4. WhatsApp Order Notification */}
        <section>
          <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-500" /> হোয়াটসঅ্যাপ অর্ডার নোটিফিকেশন
          </h3>
          <p className="text-sm text-slate-500 mb-4">নতুন যেকোনো অর্ডার করার পর এই নম্বরে অর্ডার পাঠানো হবে।</p>
          <div className="max-w-md space-y-1">
              <label className="text-sm font-bold text-slate-700">WhatsApp Mobile Number</label>
              <input type="tel" value={settings.whatsappOrderAlertNumber} onChange={(e) => handleSettingChange('whatsappOrderAlertNumber', e.target.value)} className="w-full px-4 py-2 border border-emerald-200 focus:border-emerald-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
          </div>
        </section>

        {/* 5. Checkout Form Customization */}
        <section>
           <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
             <Store className="w-5 h-5 text-indigo-600" /> চেকআউট ফর্ম কাস্টমাইজেশন
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-1">
               <label className="text-sm font-bold text-slate-700">Name Input Label</label>
               <input type="text" value={settings.checkoutForm.nameLabel} onChange={(e) => handleNestedChange('checkoutForm', 'nameLabel', e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white" />
             </div>
             <div className="space-y-1">
               <label className="text-sm font-bold text-slate-700">Phone Input Label</label>
               <input type="text" value={settings.checkoutForm.phoneLabel} onChange={(e) => handleNestedChange('checkoutForm', 'phoneLabel', e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white" />
             </div>
             <div className="space-y-1">
               <label className="text-sm font-bold text-slate-700">Address Input Label</label>
               <input type="text" value={settings.checkoutForm.addressLabel} onChange={(e) => handleNestedChange('checkoutForm', 'addressLabel', e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white" />
             </div>
             <div className="space-y-1">
               <label className="text-sm font-bold text-slate-700">Email Input Label</label>
               <input type="text" value={settings.checkoutForm.emailLabel} onChange={(e) => handleNestedChange('checkoutForm', 'emailLabel', e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white" />
             </div>
             <div className="space-y-1">
               <label className="text-sm font-bold text-slate-700">Alt Phone Input Label</label>
               <input type="text" value={settings.checkoutForm.altPhoneLabel} onChange={(e) => handleNestedChange('checkoutForm', 'altPhoneLabel', e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white" />
             </div>
             <div className="space-y-1">
               <label className="text-sm font-bold text-slate-700">City Input Label</label>
               <input type="text" value={settings.checkoutForm.cityLabel} onChange={(e) => handleNestedChange('checkoutForm', 'cityLabel', e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white" />
             </div>
           </div>
        </section>

        {/* 6. Navigation Link Customization */}
        <section>
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Menu className="w-5 h-5 text-indigo-600" /> নেভিগেশন মেনু আইটেম
            </h3>
            <button onClick={addNavItem} className="text-indigo-600 hover:text-indigo-700 font-bold text-sm flex items-center gap-1">
              <Plus className="w-4 h-4" /> নতুন লিঙ্ক
            </button>
          </div>
          <div className="space-y-3">
             {settings.navigation.map((nav, index) => (
                <div key={nav.id} className="flex flex-col md:flex-row gap-4 items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex-1 w-full">
                     <input type="text" value={nav.label} onChange={(e) => handleNavChange(nav.id, 'label', e.target.value)} placeholder="Link Name (e.g., Home)" className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-sm" />
                  </div>
                  <div className="flex-1 w-full">
                     <input type="text" value={nav.url} onChange={(e) => handleNavChange(nav.id, 'url', e.target.value)} placeholder="URL (e.g., /shop)" className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-sm" />
                  </div>
                  <button onClick={() => removeNavItem(nav.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
             ))}
          </div>
        </section>

        {/* 7. FAQ (সাধারণ জিজ্ঞাসা) Customizer */}
        <section className="bg-[#FAFBFD] p-6 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-150">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-bangla">
                <MessageSquare className="w-5 h-5 text-indigo-600" /> সাধারণ জিজ্ঞাসা (FAQ) সেটিংস
              </h3>
              <p className="text-xs text-slate-500 mt-1">হোমপেইজে প্রদর্শিত কাস্টমার প্রশ্ন ও উত্তরসমূহ এখান থেকে পরিবর্তন করুন</p>
            </div>
            <button 
              onClick={() => {
                setEditingFaqId(null);
                setFaqFormData({ q: '', a: '' });
                setIsFaqFormOpen(!isFaqFormOpen);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              {isFaqFormOpen ? 'ফর্ম বন্ধ করুন' : 'নতুন জিজ্ঞাসা তৈরি'}
            </button>
          </div>

          {/* Form fields for FAQ Create/Edit */}
          {isFaqFormOpen && (
            <form onSubmit={handleFaqSubmit} className="bg-white p-4 rounded-xl border border-slate-200 space-y-3.5 animate-in fade-in zoom-in-95">
              <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                {editingFaqId ? 'জিজ্ঞাসা সংশোধন করুন' : 'নতুন প্রশ্ন ও উত্তর এড করুন'}
              </h4>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">প্রশ্ন (Question)</label>
                <input 
                  type="text" 
                  value={faqFormData.q} 
                  onChange={(e) => setFaqFormData(prev => ({ ...prev, q: e.target.value }))}
                  placeholder="যেমন: অর্ডার দেওয়ার কতক্ষণের মধ্যে ডেলিভারি পাবো?"
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">উত্তর (Answer)</label>
                <textarea 
                  rows={2}
                  value={faqFormData.a} 
                  onChange={(e) => setFaqFormData(prev => ({ ...prev, a: e.target.value }))}
                  placeholder="যেমন: অর্ডার ভেরিফাই সম্পন্ন হওয়ার সাথে সাথেই সোর্স জিপ লিংক পেয়ে যাবেন।"
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button 
                  type="button" 
                  onClick={() => {
                    setFaqFormData({ q: '', a: '' });
                    setEditingFaqId(null);
                    setIsFaqFormOpen(false);
                  }}
                  className="border border-slate-200 text-slate-600 px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer hover:bg-slate-50"
                >
                  বাতিল
                </button>
                <button 
                  type="submit"
                  className="bg-indigo-650 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow cursor-pointer hover:bg-indigo-700"
                >
                  {editingFaqId ? 'সংরক্ষণ করুন' : 'জিজ্ঞাসা যুক্ত করুন'}
                </button>
              </div>
            </form>
          )}

          {/* List of currently active FAQs inside custom store state */}
          <div className="space-y-2 max-h-[350px] overflow-y-auto">
            {faqs.length > 0 ? (
              faqs.map((faq, index) => (
                <div key={faq.id || index} className="p-3 bg-white border border-slate-200 rounded-xl flex items-start justify-between gap-4 hover:shadow-sm transition-shadow">
                  <div className="space-y-1 text-slate-800">
                    <p className="font-bold text-xs text-indigo-700 font-mono">FAQ {index + 1}</p>
                    <p className="font-bold text-slate-900 text-sm">{faq.q}</p>
                    <p className="text-xs text-slate-500 leading-relaxed font-sans">{faq.a}</p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button 
                      onClick={() => handleEditFaq(faq)}
                      className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded"
                    >
                      সম্পাদনা
                    </button>
                    <button 
                      onClick={() => handleDeleteFaq(faq.id)}
                      className="text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded"
                    >
                      মুছুন
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">কোনো সাধারণ জিজ্ঞাসা (FAQ) পাওয়া যায়নি। দয়া করে তৈরি করুন।</p>
            )}
          </div>
        </section>

        {/* Security Info */}
        <section className="pt-6 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-rose-500" /> লগইন ও সিকিউরিটি
            </h3>
            <button 
              onClick={handleSecuritySave}
              className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-xl flex items-center gap-2 font-medium transition-colors text-sm"
            >
              <Save className="w-4 h-4" /> আপডেট সিকিউরিটি
            </button>
          </div>
          
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">ইউজারনেম (লগইনের জন্য)</label>
                <div className="relative">
                  <input type="text" name="username" value={securityData.username} onChange={handleSecurityChange} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white" />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">বর্তমান পাসওয়ার্ড *</label>
                <div className="relative">
                  <input type="password" name="oldPassword" value={securityData.oldPassword} onChange={handleSecurityChange} placeholder="••••••••" className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white" />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">নতুন পাসওয়ার্ড (ঐচ্ছিক)</label>
                <div className="relative">
                  <input type="password" name="newPassword" value={securityData.newPassword} onChange={handleSecurityChange} placeholder="••••••••" className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white" />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-xs text-slate-500 mt-1">পাসওয়ার্ড পরিবর্তন না করতে চাইলে ফাঁকা রাখুন</p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">নতুন পাসওয়ার্ড নিশ্চিত করুন</label>
                <div className="relative">
                  <input type="password" name="confirmPassword" value={securityData.confirmPassword} onChange={handleSecurityChange} placeholder="••••••••" className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white" />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

