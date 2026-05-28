import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, Order } from '../../store';
import { 
  LayoutDashboard, 
  Package,
  Layers,
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut,
  TrendingUp,
  DollarSign,
  Truck,
  ShieldCheck,
  Tag,
  Megaphone,
  MessageSquare,
  HeadphonesIcon,
  ShieldAlert,
  ArrowRight,
  UserCheck,
  X
} from 'lucide-react';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import AdminCustomers from './AdminCustomers';
import AdminSettings from './AdminSettings';
import AdminCategories from './AdminCategories';
import AdminMarketing from './AdminMarketing';
import AdminReports from './AdminReports';

// Extra components
import AdminPayments from '../../components/admin/AdminPayments';
import AdminDelivery from '../../components/admin/AdminDelivery';
import AdminRoles from '../../components/admin/AdminRoles';
import AdminReviews from '../../components/admin/AdminReviews';
import AdminSupport from '../../components/admin/AdminSupport';
import AdminSecurity from '../../components/admin/AdminSecurity';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const setAdminAuthenticated = useStore((state) => state.setAdminAuthenticated);
  const { orders, customers, products, supportChats, reviews } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    setAdminAuthenticated(false);
    navigate('/');
  };

  const getTabBadge = (tabId: string) => {
    if (tabId === 'support') {
      const count = supportChats.filter(c => c.unread).length;
      return count > 0 ? (
        <span className="ml-auto bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
          {count}
        </span>
      ) : null;
    }
    if (tabId === 'orders') {
      const count = orders.filter(o => o.status === 'Pending').length;
      return count > 0 ? (
        <span className="ml-auto bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-full">
          {count}
        </span>
      ) : null;
    }
    if (tabId === 'reviews') {
      const count = reviews.filter(r => r.status === 'Pending').length;
      return count > 0 ? (
        <span className="ml-auto bg-indigo-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
          {count}
        </span>
      ) : null;
    }
    return null;
  };

  const tabs = [
    { id: 'dashboard', label: 'ড্যাশবোর্ড ওভারভিউ', icon: <LayoutDashboard className="w-5 h-5" />, group: 'সারসংক্ষেপ' },
    { id: 'products', label: 'প্রোডাক্টস লিস্ট', icon: <Package className="w-5 h-5" />, group: 'ই-কমার্স' },
    { id: 'categories', label: 'ক্যাটাগরি ম্যানেজমেন্ট', icon: <Layers className="w-5 h-5" />, group: 'ই-কমার্স' },
    { id: 'orders', label: 'অর্ডারস গেটওয়ে', icon: <ShoppingCart className="w-5 h-5" />, group: 'ই-কমার্স' },
    { id: 'payments', label: 'পেমেন্টস ট্র্যাকিং', icon: <DollarSign className="w-5 h-5" />, group: 'ই-কমার্স' },
    { id: 'delivery', label: 'শিপিং ও ডেলিভারি', icon: <Truck className="w-5 h-5" />, group: 'ই-কমার্স' },
    { id: 'users', label: 'কাস্টমারস ড্যাশবোর্ড', icon: <Users className="w-5 h-5" />, group: 'ইউজার' },
    { id: 'roles', label: 'রোল ও পারমিশন', icon: <ShieldCheck className="w-5 h-5" />, group: 'ইউজার' },
    { id: 'marketing', label: 'ব্যানার ও স্লাইডার', icon: <Megaphone className="w-5 h-5" />, group: 'মার্কেটিং' },
    { id: 'reviews', label: 'রিভিউ ও রেটিং', icon: <MessageSquare className="w-5 h-5" />, group: 'মার্কেটিং' },
    { id: 'support', label: 'লাইভ সাপোর্ট ডেস্ক', icon: <HeadphonesIcon className="w-5 h-5" />, group: 'কমিউনিকেশন' },
    { id: 'reports', label: 'রিপোর্টস ও অ্যানালিটিক্স', icon: <TrendingUp className="w-5 h-5" />, group: 'সিস্টেম' },
    { id: 'settings', label: 'জেনারেল সেটিংস', icon: <Settings className="w-5 h-5" />, group: 'sওভারল' },
    { id: 'security', label: 'সিকিউরিটি ও ব্যাকআপ', icon: <ShieldAlert className="w-5 h-5" />, group: 'sওভারল' },
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-750';
      case 'Processing': return 'bg-blue-100 text-blue-750';
      case 'Shipped': return 'bg-indigo-100 text-indigo-755 border border-indigo-200';
      case 'Delivered': return 'bg-green-100 text-green-755';
      case 'Cancelled': return 'bg-red-105 text-red-755';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  // Live calculations for overview tiles
  const totalIncome = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;
  const customersCount = customers.length;
  const productsCount = products.length;

  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in text-slate-800">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">ড্যাশবোর্ড ওভারভিউ</h2>
        <p className="text-slate-500 text-sm mt-1">স্বাগতম! নিচে আপনার ই-কমার্স স্টোরের আজকের লাইভ পরিসংখ্যান দেওয়া হলো।</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'সর্বমোট বিক্রয় (Revenue)', value: `৳${totalIncome.toLocaleString('bn-BD')}`, icon: <DollarSign className="w-6 h-6 text-green-600" />, bg: 'bg-green-100/60' },
          { label: 'অপেক্ষমাণ অর্ডার', value: `${pendingOrdersCount} টি`, icon: <ShoppingCart className="w-6 h-6 text-blue-600" />, bg: 'bg-blue-100/60' },
          { label: 'নিবন্ধিত কাস্টমার', value: `${customersCount} জন`, icon: <Users className="w-6 h-6 text-purple-600" />, bg: 'bg-purple-100/60' },
          { label: 'ক্যাটালগ প্রোডাক্টস', value: `${productsCount} টি`, icon: <Package className="w-6 h-6 text-orange-600" />, bg: 'bg-orange-100/60' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`p-4 rounded-xl ${stat.bg}`}>
              {stat.icon}
            </div>
            <div>
              <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">{stat.label}</div>
              <div className="text-2xl font-black text-slate-900 mt-0.5">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic Recent Orders */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mt-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900">সাম্প্রতিক অর্ডারসমূহ</h3>
          <button 
            onClick={() => setActiveTab('orders')}
            className="text-xs font-bold text-indigo-650 flex items-center gap-1.5 hover:text-indigo-850 cursor-pointer"
          >
            সব অর্ডার দেখুন <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-900 font-bold border-b border-slate-100">
              <tr>
                <th className="px-5 py-3 rounded-tl-xl">অর্ডার আইডি</th>
                <th className="px-5 py-3">কাস্টমার নাম</th>
                <th className="px-5 py-3">তারিখ</th>
                <th className="px-5 py-3">পেমেন্ট</th>
                <th className="px-5 py-3">স্ট্যাটাস</th>
                <th className="px-5 py-3 text-right rounded-tr-xl">মোট বিল</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((order, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-indigo-600">{order.id}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-900">{order.name}</td>
                  <td className="px-5 py-3.5 text-slate-500 font-medium">{order.date || 'আজ'}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-extrabold ${order.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-black text-slate-900">৳{order.total}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                     কোনো অর্ডার পাওয়া যায়নি।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 absolute inset-0 z-[100] font-sans">
      
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-slate-950 text-slate-350 flex-shrink-0 border-r border-slate-900">
        <div className="p-6 border-b border-slate-900/80 bg-slate-955">
          <h1 className="text-xl font-extrabold text-white tracking-widest uppercase">Pixel<span className="text-indigo-400 font-light">Market</span></h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">অ্যাডমিন প্যানেল গেটওয়ে</p>
        </div>
        
        <nav className="p-4 space-y-5 max-h-[85vh] overflow-y-auto">
          {Array.from(new Set(tabs.map(t => t.group))).map(groupName => (
            <div key={groupName} className="space-y-1">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 px-4">{groupName}</h3>
              {tabs.filter(t => t.group === groupName).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-all text-xs font-bold text-left cursor-pointer ${
                    activeTab === tab.id 
                      ? 'bg-indigo-650 text-white shadow-lg shadow-indigo-600/15' 
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  {tab.icon} <span className="flex-1 truncate">{tab.label}</span>
                  {getTabBadge(tab.id)}
                </button>
              ))}
            </div>
          ))}
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-left mt-8 text-red-400 hover:bg-red-500/10 cursor-pointer text-xs"
          >
            <LogOut className="w-5 h-5 animate-pulse" /> লগ আউট করুন
          </button>
        </nav>
      </aside>

      {/* Main content body switcher */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-4">
          {activeTab !== 'dashboard' && (
            <div className="flex justify-between items-center bg-white px-5 py-3 rounded-xl border border-slate-100 shadow-sm transition-all animate-in fade-in slide-in-from-top-1">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                📍 বর্তমান ফিচার: <span className="text-indigo-600 font-bold">{tabs.find(t => t.id === activeTab)?.label}</span>
              </span>
              <button 
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-150 text-rose-600 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-sm shadow-rose-100/50"
                id="exit-feature-btn"
              >
                <X className="w-3.5 h-3.5" /> এই ফিচার থেকে বের হোন (Exit Feature)
              </button>
            </div>
          )}

          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'products' && <AdminProducts />}
          {activeTab === 'categories' && <AdminCategories />}
          {activeTab === 'orders' && <AdminOrders />}
          {activeTab === 'payments' && <AdminPayments />}
          {activeTab === 'delivery' && <AdminDelivery />}
          {activeTab === 'users' && <AdminCustomers />}
          {activeTab === 'roles' && <AdminRoles />}
          {activeTab === 'marketing' && <AdminMarketing />}
          {activeTab === 'reviews' && <AdminReviews />}
          {activeTab === 'support' && <AdminSupport />}
          {activeTab === 'reports' && <AdminReports />}
          {activeTab === 'settings' && <AdminSettings />}
          {activeTab === 'security' && <AdminSecurity />}
        </div>
      </main>
    </div>
  );
}
