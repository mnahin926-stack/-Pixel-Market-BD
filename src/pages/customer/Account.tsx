import React, { useState } from 'react';
import { useStore } from '../../store';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  ShoppingBag, 
  Heart, 
  Settings, 
  LogOut, 
  Clock, 
  HelpCircle,
  Download,
  Receipt,
  MessageSquare,
  Save,
  Printer,
  X,
  ShieldCheck,
  Key,
  ShieldAlert,
  Send
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function Account() {
  const [activeTab, setActiveTab] = useState('downloads');
  const user = useStore((state) => state.user);
  const isDarkMode = useStore((state) => state.isDarkMode);
  const setUserAuthenticated = useStore((state) => state.setUserAuthenticated);
  const logoutUser = useStore((state) => state.logoutUser);
  const navigate = useNavigate();

  const wishlist = useStore((state) => state.wishlist);
  const toggleWishlist = useStore((state) => state.toggleWishlist);
  const orders = useStore((state) => state.orders);

  // Profile Edit States
  const [profileName, setProfileName] = useState(user?.name || 'কাস্টমার');
  const [profileEmail, setProfileEmail] = useState(user?.email || 'user@example.com');
  const [profilePassword, setProfilePassword] = useState('••••••••');
  
  // Invoice Modal states
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any | null>(null);

  // Chat/Support States
  const [supportMessages, setSupportMessages] = useState([
    { id: 1, sender: 'bot', text: 'আসসালামু আলাইকুম! পিক্সেল মার্কেট বিডি কাস্টমার সাপোর্টে স্বাগতম। আপনার কি ধরনের সহায়তা প্রয়োজন?', time: '১০:৩০ AM' },
  ]);
  const [newChatText, setNewChatText] = useState('');
  const [tickets, setTickets] = useState([
    { id: '#TKT-829', subject: 'React Template Download Issue', status: 'Solved', date: '২৪ মে, ২০২৬' },
  ]);
  const [ticketSubject, setTicketSubject] = useState('');

  const handleLogout = () => {
    logoutUser();
    toast.info('সফলভাবে লগআউট হয়েছে');
    navigate('/login');
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setUserAuthenticated(true, {
      name: profileName,
      email: profileEmail,
      phone: user?.phone || '01XXXXXXXXX'
    });
    toast.success('আপনার প্রোফাইল সফলভাবে আপডেট করা হয়েছে!');
  };

  const handleSendSupportMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatText.trim()) return;
    
    const userMsg = { id: Date.now(), sender: 'customer', text: newChatText, time: 'এখন' };
    setSupportMessages(prev => [...prev, userMsg]);
    setNewChatText('');

    // Trigger dynamic agent answers
    setTimeout(() => {
      let botResponseText = 'ধন্যবাদ আপনার মেসেজের জন্য। আমাদের একজন প্রতিনিধি দ্রুত আপনার সাথে যোগাযোগ করবেন।';
      const promptLower = userMsg.text.toLowerCase();
      if (promptLower.includes('download') || promptLower.includes('ডাউনলোড')) {
        botResponseText = 'ডাউনলোড সমস্যায় ভুগছেন? অনুগ্রহ করে আপনার অ্যাকাউন্ট ড্যাশবোর্ডের "সফটওয়্যার ও ডাউনলোডস" ট্যাবে যান, সেখানে আপনার ক্রয়কৃত ফাইলের লাইভ সোর্স ডাউনলোড বাটন পেয়ে যাবেন।';
      } else if (promptLower.includes('bkash') || promptLower.includes('বিকাশ') || promptLower.includes('পেমেন্ট')) {
        botResponseText = 'বিকাশ/নগদ বা রকেট পেমেন্ট করতে চেকআউট পেজে গিয়ে সরাসরি ট্রানজেকশন আইডি প্রদান করে অর্ডার করতে পারেন অথবা সরাসরি আমাদের সাথে হোয়াটসঅ্যাপে যোগাযোগ করতে পারেন।';
      }
      setSupportMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: botResponseText,
        time: 'এখন'
      }]);
    }, 1000);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim()) {
      toast.error('টিকিটের বিষয়বস্তু লিখুন');
      return;
    }
    const newTicket = {
      id: `#TKT-${Math.floor(Math.random() * 900 + 100)}`,
      subject: ticketSubject,
      status: 'Open',
      date: 'আজ'
    };
    setTickets(prev => [newTicket, ...prev]);
    setTicketSubject('');
    toast.success('সাপোর্ট টিকিট সফলভাবে সাবমিট হয়েছে!');
  };

  const tabs = [
    { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: <User className="w-5 h-5" /> },
    { id: 'downloads', label: 'ক্রয়কৃত ডাউনলোডস', icon: <Download className="w-5 h-5" /> },
    { id: 'orders', label: 'আমার অর্ডারস', icon: <ShoppingBag className="w-5 h-5" /> },
    { id: 'wishlist', label: 'উইশলিস্ট', icon: <Heart className="w-5 h-5" /> },
    { id: 'support', label: 'টিকিট সাপোর্ট ডেস্ক', icon: <HelpCircle className="w-5 h-5" /> },
    { id: 'settings', label: 'প্রোফাইল সেটিংস', icon: <Settings className="w-5 h-5" /> },
  ];

  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in">
      <div className="bg-gradient-to-r from-orange-655 to-orange-500 dark:from-indigo-900/60 dark:to-slate-900/40 border border-orange-500/20 dark:border-white/10 rounded-3xl p-6 text-slate-800 dark:text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 flex items-center justify-between">
           <div>
             <span className="text-[10px] bg-white/20 dark:bg-orange-600 px-3 py-1 font-extrabold uppercase rounded-full text-white tracking-widest">
               প্রিমিয়াম অ্যাকাউন্ট
             </span>
             <h2 className="text-2xl md:text-3xl font-black mt-3 text-slate-950 dark:text-white">স্বাগতম, {user?.name || 'কাস্টমার'}!</h2>
             <p className="text-slate-700 dark:text-slate-350 text-sm mt-1">{user?.email}</p>
           </div>
           <div className="w-16 h-16 bg-white/15 dark:bg-white/10 rounded-2xl flex items-center justify-center border-2 border-white/20">
             <User className="w-8 h-8 text-slate-900 dark:text-white" />
           </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-200/40 dark:bg-indigo-500/10 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div 
           className="bg-white dark:bg-[#111113] p-6 rounded-3xl border border-slate-100 dark:border-white/15 shadow-sm flex items-center gap-4 cursor-pointer hover:border-orange-500 dark:hover:border-indigo-500 transition-all active:scale-95" 
           onClick={() => setActiveTab('downloads')}
         >
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-950 text-orange-600 rounded-2xl flex items-center justify-center">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">ডাউনলোড ফাইল সমূহ</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">৫ টি</h3>
            </div>
         </div>
         <div 
           className="bg-white dark:bg-[#111113] p-6 rounded-3xl border border-slate-100 dark:border-white/15 shadow-sm flex items-center gap-4 cursor-pointer hover:border-orange-500 dark:hover:border-indigo-500 transition-all active:scale-95" 
           onClick={() => setActiveTab('orders')}
         >
            <div className="w-12 h-12 bg-indigo-55 text-indigo-650 dark:bg-indigo-950/60 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">মোট অর্ডারস গেটওয়ে</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{orders.length} টি</h3>
            </div>
         </div>
         <div 
           className="bg-white dark:bg-[#111113] p-6 rounded-3xl border border-slate-100 dark:border-white/15 shadow-sm flex items-center gap-4 cursor-pointer hover:border-orange-500 dark:hover:border-indigo-500 transition-all active:scale-95" 
           onClick={() => setActiveTab('wishlist')}
         >
            <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/40 text-rose-600 rounded-2xl flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">উইশলিস্ট আইটেম</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{wishlist.length} টি</h3>
            </div>
         </div>
      </div>

      <div className="bg-white dark:bg-[#111113] p-6 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm">
        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-500" /> অ্যাকাউন্ট সিকিউরিটি স্টেটাস
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-[#0A0A0B]/60 border border-slate-100 dark:border-white/5 rounded-2xl flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-505 animate-pulse"></span>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase">পাসওয়ার্ড সিকিউরিটি</p>
              <p className="text-sm font-bold text-slate-800 dark:text-white">নিরাপদ (Strong)</p>
            </div>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-[#0A0A0B]/60 border border-slate-100 dark:border-white/5 rounded-2xl flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-505 animate-pulse"></span>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase">দ্বিমুখী প্রমাণীকরণ (2FA)</p>
              <p className="text-sm font-bold text-slate-800 dark:text-white">অনুরোধ অনুমোদিত</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDownloads = () => {
    // Premium Simulated Purchased Digital Products list
    const purchasedProducts = [
      { id: '1', name: 'PixelStore - Ultimate React & Tailwind E-Commerce Script', fileSize: '28.5 MB', version: 'v1.4.0', expiry: 'কখনো শেষ হবে না', fileUrl: 'https://pixelmarket.com/secure-downloads/pixelstore-react-v1.4.0.zip', serial: 'PX-STORE-9283-RE-2938' },
      { id: '2', name: 'Elementor Pro Real-Estate Dynamic Website Template Pack', fileSize: '12.2 MB', version: 'v2.1.5', expiry: '৫ মে, ২০২৭', fileUrl: 'https://pixelmarket.com/secure-downloads/elementor-realestate-theme.zip', serial: 'EL-PROP-7721-WP-4411' },
      { id: '4', name: 'SaaS Multi-Tenant Project Management System Laravel Script', fileSize: '42.0 MB', version: 'v3.0.2', expiry: 'কখনো শেষ হবে না', fileUrl: 'https://pixelmarket.com/secure-downloads/laravel-saas-pm.zip', serial: 'SASS-PM-0391-LV-1029' }
    ];

    const triggerDownload = (productName: string, url: string) => {
      toast.info(`${productName} ডাউনলোড ফাইলটি তৈরি করা হচ্ছে...`);
      setTimeout(() => {
        toast.success(`ফাইল ডাউনলোড সফলভাবে শুরু হয়েছে!`);
        // Simulated native anchor download triggering
        const link = document.createElement('a');
        link.href = '#';
        link.setAttribute('download', 'file.zip');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, 1500);
    };

    return (
      <div className="space-y-6 animate-in fade-in">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">ক্রয়কৃত ডিজিটাল সফটওয়্যার সমূহ</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">আপনার সফলভাবে অর্জিত পণ্য ও তাৎক্ষণিক ডাউনলোড ফাস্ট লিংক কোড</p>
          </div>
        </div>

        <div className="space-y-4">
          {purchasedProducts.map((p) => (
            <div key={p.id} className="bg-white dark:bg-[#111113] border border-slate-100 dark:border-white/10 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-orange-500/25 dark:hover:border-indigo-550/25 transition-all">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-extrabold px-2.5 py-0.5 rounded-full tracking-wider uppercase">
                    সম্পূর্ণ লাইসেন্সড
                  </span>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-900 text-slate-500 font-extrabold px-2.5 py-0.5 rounded-full">
                    Size: {p.fileSize}
                  </span>
                  <span className="text-[10px] bg-orange-100 dark:bg-orange-950/40 text-orange-600 font-extrabold px-2.5 py-0.5 rounded-full">
                    {p.version}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base md:text-lg pt-1 leading-snug">{p.name}</h3>
                
                <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pt-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-orange-500" />
                    <span>লাইসেন্স কি: <span className="text-slate-700 dark:text-slate-200 font-bold select-all bg-slate-50 dark:bg-[#0A0A0B] px-1.5 py-0.5 rounded border border-slate-100 dark:border-white/5">{p.serial}</span></span>
                  </div>
                  <span>• উড্ডয়ন মেয়াদ: <span className="text-emerald-500 font-bold">{p.expiry}</span></span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0 justify-end">
                <button 
                  onClick={() => triggerDownload(p.name, p.fileUrl)}
                  className="w-full md:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-850 dark:bg-orange-600 dark:hover:bg-orange-700 text-white rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-2 shadow-md hover:scale-[1.02]"
                >
                  <Download className="w-4 h-4" /> ডাউনলোড জিপ ফাইল
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderOrders = () => (
    <div className="space-y-6 animate-in fade-in">
       <div className="flex justify-between items-end mb-4">
         <div>
           <h2 className="text-2xl font-black text-slate-900 dark:text-white border-b-0 pb-0">ক্রয় বিবরণী ও রশিদপত্র</h2>
           <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">আপনার অ্যাকাউন্ট থেকে সম্পন্ন করা সকল ট্রানজেকশন তালিকা</p>
         </div>
       </div>

       <div className="space-y-4">
          {orders.map((order, idx) => (
             <div key={idx} className="bg-white dark:bg-[#111113] border border-slate-100 dark:border-white/10 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                   <div className="flex items-center gap-3">
                     <h3 className="font-bold text-base md:text-lg text-slate-900 dark:text-white">{order.id}</h3>
                     <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        order.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                     }`}>
                       {order.paymentStatus}
                     </span>
                     <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        order.status === 'Processing' ? 'bg-blue-105 text-blue-700' : 'bg-green-105 text-green-700'
                     }`}>
                       {order.status}
                     </span>
                   </div>
                   <p className="text-xs text-slate-550 dark:text-slate-400 mt-1 flex items-center gap-2">
                     <Clock className="w-3.5 h-3.5" /> {order.date || '২৬ মে, ২০২৬'} • {order.paymentMethod?.toUpperCase() || 'BKASH'} পেমেন্টে
                   </p>
                </div>
                <div className="flex items-center gap-6 w-full md:w-auto mt-2 md:mt-0 justify-between md:justify-end">
                   <div className="text-left md:text-right">
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">মোট বিল</p>
                     <p className="font-extrabold text-slate-900 dark:text-white text-lg">৳{order.total || 0}</p>
                   </div>
                   <button 
                     onClick={() => setSelectedInvoiceOrder(order)}
                     className="px-5 py-3 bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 active:scale-95"
                   >
                     <Receipt className="w-4 h-4" /> রশিদপত্র দেখুন
                   </button>
                </div>
             </div>
          ))}

          {orders.length === 0 && (
            <div className="bg-white dark:bg-[#111113] p-12 rounded-3xl border border-slate-100 dark:border-white/10 text-center text-slate-400">
               কোনো অর্ডার হিস্ট্রি খুঁজে পাওয়া যায়নি।
            </div>
          )}
       </div>
    </div>
  );

  const renderWishlist = () => (
    <div className="space-y-6 animate-in fade-in">
       <div className="flex justify-between items-end mb-4">
         <div>
           <h2 className="text-2xl font-black text-slate-900 dark:text-white">পছন্দের উইশলিস্ট</h2>
           <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">আপনার বুকমার্ক করা পছন্দের চমৎকার ডিজিটাল কালেকশন</p>
         </div>
       </div>

       {wishlist.length === 0 ? (
         <div className="bg-white dark:bg-[#111113] p-12 rounded-3xl border border-slate-100 dark:border-white/10 text-center">
           <Heart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
           <p className="text-slate-550 dark:text-slate-400 font-bold">উইশলিস্টে কোনো প্রোডাক্ট সেভ করা নেই</p>
         </div>
       ) : (
         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
           {wishlist.map(product => (
             <div key={product.id} className="bg-white dark:bg-[#111113] border border-slate-100 dark:border-white/10 rounded-2xl p-4 shadow-sm relative group">
                <button 
                  onClick={() => {
                    toggleWishlist(product);
                    toast.success('উইশলিস্ট থেকে সরানো হয়েছে');
                  }}
                  className="absolute top-2 right-2 bg-white/80 dark:bg-black/60 p-2 rounded-full text-rose-500 hover:bg-rose-50 shadow-sm z-10"
                >
                  <Heart className="w-4 h-4 fill-current" />
                </button>
                <div className="aspect-square rounded-xl overflow-hidden mb-3 bg-slate-50 dark:bg-[#0A0A0B]">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2" title={product.name}>{product.name}</h3>
                <div className="mt-2 text-xs text-orange-500 font-semibold">{product.category}</div>
                <div className="mt-2 font-black text-indigo-600 dark:text-indigo-400 text-sm">৳{product.price}</div>
             </div>
           ))}
         </div>
       )}
    </div>
  );

  const renderSupport = () => (
    <div className="space-y-6 animate-in fade-in">
       <div className="flex justify-between items-end mb-4">
         <div>
           <h2 className="text-2xl font-black text-slate-900 dark:text-white">সাপোর্ট ডেস্ক ও লাইভ চ্যাটবট</h2>
           <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">নিরাপদ টিকিট তৈরি করুন অথবা তাৎক্ষণিক সমাধানের জন্য অ্যাসিস্ট্যান্টের সাহায্য নিন</p>
         </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         {/* Live chat emulator column */}
         <div className="lg:col-span-7 bg-white dark:bg-[#111113] border border-slate-100 dark:border-white/10 rounded-3xl p-5 shadow-sm flex flex-col h-[400px]">
            <div className="flex items-center gap-2 border-b border-slate-50 dark:border-white/5 pb-3">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></span>
              <p className="font-bold text-sm text-slate-900 dark:text-white">পিক্সেল বট (Chatbot Active)</p>
            </div>
            
            {/* Messages box */}
            <div className="flex-1 overflow-y-auto space-y-3 py-3 custom-scrollbar text-xs">
              {supportMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 max-w-[85%] rounded-2xl ${
                    msg.sender === 'customer' 
                      ? 'bg-orange-600 text-white rounded-br-none' 
                      : 'bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-slate-200 rounded-bl-none'
                  }`}>
                    <p className="leading-relaxed font-semibold">{msg.text}</p>
                    <span className="text-[9px] opacity-60 block text-right mt-1">{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Send chat form */}
            <form onSubmit={handleSendSupportMessage} className="mt-auto pt-3 border-t border-slate-50 dark:border-white/5 flex gap-2">
              <input 
                type="text" 
                placeholder="আপনার বার্তাটি লিখুন..." 
                value={newChatText}
                onChange={(e) => setNewChatText(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-[#0A0A0B] border border-slate-200 dark:border-white/5 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs"
              />
              <button 
                type="submit" 
                className="p-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl transition-all active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
         </div>

         {/* Create support tickets Column */}
         <div className="lg:col-span-5 bg-white dark:bg-[#111113] border border-slate-100 dark:border-white/10 rounded-3xl p-5 shadow-sm flex flex-col h-[400px] justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3">নতুন কাস্টমার টিকিট তৈরি</h3>
              <form onSubmit={handleCreateTicket} className="space-y-3">
                 <div>
                   <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">টিকিট টপিক বা বিষয়বস্তু</label>
                   <input 
                     type="text"
                     value={ticketSubject}
                     onChange={(e) => setTicketSubject(e.target.value)}
                     placeholder="উদাঃ পেমেন্ট প্রসেসিং আটকে গেছে"
                     className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0A0A0B] border border-slate-200 dark:border-white/5 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-orange-500"
                   />
                 </div>
                 <button 
                   type="submit"
                   className="w-full py-2.5 bg-slate-900 dark:bg-indigo-650 hover:bg-indigo-750 text-white rounded-xl font-bold transition-all text-xs"
                 >
                   সাপোর্ট টিকিট ওপেন করুন
                 </button>
              </form>
            </div>

            <div className="border-t border-slate-50 dark:border-white/5 pt-4">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-2">আপনার ওপেন টিকিট সমূহ</h4>
              <div className="space-y-2 overflow-y-auto max-h-[140px] custom-scrollbar text-xs">
                {tickets.map((t) => (
                  <div key={t.id} className="p-2.5 bg-slate-50 dark:bg-[#0A0A0B] border border-slate-100 dark:border-white/5 rounded-xl flex justify-between items-center gap-2">
                    <div className="truncate flex-1">
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{t.subject}</p>
                      <span className="text-[10px] text-slate-400">{t.id} • {t.date}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase text-white ${
                      t.status === 'Solved' ? 'bg-emerald-500' : 'bg-red-500'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
         </div>
       </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6 animate-in fade-in">
       <div className="flex justify-between items-end mb-4">
         <div>
           <h2 className="text-2xl font-black text-slate-900 dark:text-white">প্রোফাইল সেটিংস</h2>
           <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">আপনার অ্যাকাউন্ট নাম, ইমেইল এবং সিকিউরিটি পাসওয়ার্ড ম্যানেজ করুন</p>
         </div>
       </div>

       <div className="bg-white dark:bg-[#111113] border border-slate-100 dark:border-white/10 rounded-3xl p-6 shadow-sm">
         <form onSubmit={handleUpdateProfile} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">পূর্ণ নাম</label>
                 <input 
                   type="text" 
                   value={profileName}
                   onChange={(e) => setProfileName(e.target.value)}
                   className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0A0A0B] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                   placeholder="আপনার নাম"
                 />
               </div>
               <div>
                 <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">ইমেইল ঠিকানা</label>
                 <input 
                   type="email" 
                   value={profileEmail}
                   onChange={(e) => setProfileEmail(e.target.value)}
                   className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0A0A0B] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                   placeholder="user@example.com"
                 />
               </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">নতুন পাসওয়ার্ড পরিবর্তন করুন</label>
              <input 
                type="password" 
                value={profilePassword}
                onChange={(e) => setProfilePassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0A0A0B] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="নতুন পাসওয়ার্ড দিন"
              />
              <p className="text-[10px] text-slate-500 mt-1">পাসওয়ার্ড গোপন রাখুন। পাসওয়ার্ড সর্বনিম্ন ৮ ডিজিটের হওয়া বাঞ্ছনীয়।</p>
            </div>

            <div className="flex justify-end pt-2">
              <button 
                type="submit"
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-orange-600 dark:hover:bg-orange-750 text-white rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 shadow-md active:scale-95"
              >
                <Save className="w-4 h-4" /> পরিবর্তন সংরক্ষণ করুন
              </button>
            </div>
         </form>
       </div>
    </div>
  );

  return (
    <div className="py-8 px-2 sm:px-0">
       <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Navigation */}
          <div className="w-full lg:w-72 flex-shrink-0">
             <div className="bg-white dark:bg-[#111113] rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm overflow-hidden sticky top-24">
                <div className="p-6 text-center border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/2">
                  <div className="w-20 h-20 bg-orange-100 dark:bg-orange-950/60 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-3 font-extrabold text-2xl">
                     {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{user?.name || 'কাস্টমার'}</h3>
                  <p className="text-xs text-slate-400 font-medium font-mono mt-0.5">{user?.phone || '01XXXXXXXXX'}</p>
                </div>
                <div className="p-3 space-y-1">
                   {tabs.map(tab => (
                     <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-left text-xs ${
                           activeTab === tab.id 
                           ? 'bg-slate-900 dark:bg-orange-600 text-white shadow-md shadow-orange-600/10' 
                           : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                        }`}
                     >
                       <span className={activeTab === tab.id ? 'text-white' : 'text-slate-400 dark:text-slate-500'}>{tab.icon}</span>
                       {tab.label}
                     </button>
                   ))}
                   
                   <div className="pt-3 mt-3 border-t border-slate-100 dark:border-white/5">
                     <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-left text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                     >
                        <LogOut className="w-5 h-5 opacity-70" />
                        লগআউট করুন
                     </button>
                   </div>
                </div>
             </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
             {activeTab === 'dashboard' && renderDashboard()}
             {activeTab === 'downloads' && renderDownloads()}
             {activeTab === 'orders' && renderOrders()}
             {activeTab === 'wishlist' && renderWishlist()}
             {activeTab === 'support' && renderSupport()}
             {activeTab === 'settings' && renderSettings()}
          </div>
       </div>

       {/* INVOICE MODAL (REAL PRINT SUPPORT AND DETAILS) */}
       {selectedInvoiceOrder && (
         <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="relative bg-white text-slate-800 w-full max-w-2xl rounded-3xl p-6 md:p-8 shadow-2xl animate-in fade-in">
             
             {/* Print close headers */}
             <div className="flex justify-between items-center pb-4 border-b border-slate-100 print:hidden">
               <span className="text-xs bg-orange-600 text-white font-extrabold px-3 py-1 uppercase tracking-widest rounded-full">ই-রশিদ ও মেমো</span>
               <div className="flex items-center gap-2">
                 <button 
                   onClick={() => window.print()}
                   className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer"
                 >
                   <Printer className="w-4 h-4" /> রশিদ প্রিন্ট
                 </button>
                 <button 
                   onClick={() => setSelectedInvoiceOrder(null)}
                   className="p-2.5 text-slate-400 hover:text-slate-600 rounded-xl"
                 >
                   <X className="w-5 h-5" />
                 </button>
               </div>
             </div>

             {/* Printable area */}
             <div className="py-6 space-y-6 print:py-0">
               <div className="flex justify-between items-start">
                 <div>
                   <h1 className="text-2xl font-black tracking-wider text-slate-900">PIXELMARKET BD</h1>
                   <p className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Digital Selling Agency</p>
                   <p className="text-xs text-slate-500 mt-2">গুলশান লিঙ্ক রোড, ঢাকা-১২১২<br />হেল্পলাইন: +৮৮০ ৯৬১২-১২৩৪৫৬</p>
                 </div>
                 <div className="text-right">
                   <h2 className="text-xl font-bold text-indigo-700">INVOICE RECEIPT</h2>
                   <p className="text-sm font-bold text-slate-900 mt-1">{selectedInvoiceOrder.id}</p>
                   <p className="text-xs text-slate-400 mt-1">অর্ডার তারিখ: {selectedInvoiceOrder.date || 'আজ'}</p>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl text-xs border border-slate-100">
                 <div>
                   <p className="font-bold text-[10px] text-slate-400 uppercase">গ্রাহকের বিবরণী</p>
                   <p className="font-bold text-slate-800 text-sm mt-1">{selectedInvoiceOrder.name || user?.name || 'কাস্টমার'}</p>
                   <p className="text-slate-500 mt-0.5">{selectedInvoiceOrder.phone || user?.phone || '০১৭XXXXXXXX'}</p>
                   <p className="text-slate-500 mt-0.5">{selectedInvoiceOrder.address || 'ডিজিটাল ডেলিভারি'}</p>
                 </div>
                 <div className="text-right">
                   <p className="font-bold text-[10px] text-slate-400 uppercase">পেমেন্ট গেটওয়ে স্টেটাস</p>
                   <p className="font-bold text-slate-800 text-sm mt-1">{selectedInvoiceOrder.paymentMethod?.toUpperCase() || 'BKASH'}</p>
                   <p className="text-emerald-600 font-extrabold mt-0.5">পেমেন্ট সম্পন্ন হয়েছে (PAID)</p>
                   {selectedInvoiceOrder.trxId && <p className="text-slate-400 mt-0.5 font-mono">TrxID: {selectedInvoiceOrder.trxId}</p>}
                 </div>
               </div>

               {/* Table products */}
               <div className="space-y-2 text-xs">
                 <p className="font-bold text-[10px] text-slate-400 uppercase tracking-widest pl-1 mb-2">আইটেম রসিদ তালিকা</p>
                 <table className="w-full text-left">
                   <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                     <tr>
                       <th className="px-3 py-2">আইটেম নাম</th>
                       <th className="px-3 py-2 text-center">পরিমাণ</th>
                       <th className="px-3 py-2 text-right">ইউনিট মূল্য</th>
                       <th className="px-3 py-2 text-right">মোট</th>
                     </tr>
                   </thead>
                   <tbody>
                     {selectedInvoiceOrder.items && selectedInvoiceOrder.items.length > 0 ? (
                       selectedInvoiceOrder.items.map((item: any, i: number) => (
                         <tr key={i} className="border-b border-slate-100">
                           <td className="px-3 py-2 h-10 font-bold text-slate-800">{item.name}</td>
                           <td className="px-3 py-2 text-center font-bold text-slate-700">{item.quantity}</td>
                           <td className="px-3 py-2 text-right text-slate-700">৳{item.price}</td>
                           <td className="px-3 py-2 text-right font-bold text-slate-900">৳{item.price * item.quantity}</td>
                         </tr>
                       ))
                     ) : (
                       <tr className="border-b border-slate-100">
                         <td className="px-3 py-2 h-10 font-bold text-slate-800">পিক্সেল সোর্স ও সফটওয়্যার লাইসেন্স</td>
                         <td className="px-3 py-2 text-center font-bold text-slate-700">১</td>
                         <td className="px-3 py-2 text-right text-slate-700">৳{selectedInvoiceOrder.subtotal}</td>
                         <td className="px-3 py-2 text-right font-bold text-slate-900">৳{selectedInvoiceOrder.subtotal}</td>
                       </tr>
                     )}
                   </tbody>
                 </table>
               </div>

               {/* Bills totals */}
               <div className="flex justify-end text-xs">
                 <div className="w-56 space-y-1.5 border-t border-slate-200 pt-3">
                   <div className="flex justify-between text-slate-500">
                     <span>সাব-টোটাল:</span>
                     <span>৳{selectedInvoiceOrder.subtotal || selectedInvoiceOrder.total}</span>
                   </div>
                   {selectedInvoiceOrder.discount > 0 && (
                     <div className="flex justify-between text-rose-600">
                       <span>ডিসকাউন্ট স্লিপ:</span>
                       <span>-৳{selectedInvoiceOrder.discount}</span>
                     </div>
                   )}
                   <div className="flex justify-between text-slate-500">
                     <span>ভ্যাট/ট্যাক্স (০%):</span>
                     <span>৳০</span>
                   </div>
                   <div className="flex justify-between font-black text-slate-900 text-sm pt-2 border-t border-slate-100">
                     <span>সর্বমোট বিল:</span>
                     <span>৳{selectedInvoiceOrder.total}</span>
                   </div>
                 </div>
               </div>

               {/* Secure digital token and sign footer */}
               <div className="pt-8 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
                 <div className="flex items-center gap-1.5 font-mono">
                   <ShieldCheck className="w-4 h-4 text-emerald-500" />
                   <span>ডিজিটাল প্রমাণীকৃত রশিদপত্র • Secure SSL</span>
                 </div>
                 <div className="text-right italic">
                   অনুমোদিত কতৃপক্ষ স্বাক্ষর
                 </div>
               </div>
             </div>

           </div>
         </div>
       )}
    </div>
  );
}
