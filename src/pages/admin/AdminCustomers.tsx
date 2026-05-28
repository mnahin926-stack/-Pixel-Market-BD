import React, { useState } from 'react';
import { Users, Search, Mail, Phone, Ban, CheckCircle, ShieldAlert, UserCheck } from 'lucide-react';
import { useStore } from '../../store';
import { toast } from 'react-toastify';

export default function AdminCustomers() {
  const { customers, toggleCustomerStatus } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  const handleToggleStatus = (customerId: string, name: string, currentStatus: 'Active' | 'Blocked') => {
    toggleCustomerStatus(customerId);
    const action = currentStatus === 'Active' ? 'ব্লক' : 'আনব্লক';
    toast.success(`কাস্টমার '${name}' কে সফলভাবে ${action} করা হয়েছে।`);
  };

  // Search logic
  const filteredCustomers = customers.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.id.toLowerCase().includes(q)
    );
  });

  // Dynamic counts calculations
  const totalCount = customers.length;
  const activeCount = customers.filter(c => c.status === 'Active').length;
  const blockedCount = customers.filter(c => c.status === 'Blocked').length;

  return (
    <div className="space-y-6 animate-in fade-in text-slate-800">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm col-span-full">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">কাস্টমার ম্যানেজমেন্ট</h2>
          <p className="text-slate-500 text-sm mt-1">সব রেজিস্টার্ড গ্রাহকের আইডি, মোট শপিং ইতিহাস ও স্ট্যাটাস তালিকা</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
           <div className="relative w-full sm:w-80">
             <input 
               type="text" 
               placeholder="কাস্টমার নাম, ইমেইল অথবা ফোন দিয়ে খুঁজুন..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full" 
             />
             <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
           </div>
        </div>
      </div>

      {/* Dynamic Counter Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-50/70 rounded-2xl p-6 border border-indigo-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-indigo-650 font-bold text-xs uppercase tracking-wider">মোট রেজিস্টার্ড গ্রাহক</p>
              <h3 className="text-3.5xl font-black text-indigo-900 mt-1">{totalCount} জন</h3>
              <p className="text-[10px] text-indigo-500 mt-2 font-medium">ওয়েবসাইটে অ্যাকাউন্ট তৈরি করেছেন</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-emerald-50/70 rounded-2xl p-6 border border-emerald-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-emerald-650 font-bold text-xs uppercase tracking-wider">সক্রিয় কাস্টমার (Active)</p>
              <h3 className="text-3.5xl font-black text-emerald-900 mt-1">{activeCount} জন</h3>
              <p className="text-[10px] text-emerald-500 mt-2 font-medium">সঠিক ও নিরুপদ্রব শপিং করতে পারছেন</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-rose-50/70 rounded-2xl p-6 border border-rose-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-rose-650 font-bold text-xs uppercase tracking-wider">নিষিদ্ধিত বা ব্লক মেম্বার</p>
              <h3 className="text-3.5xl font-black text-rose-900 mt-1">{blockedCount} জন</h3>
              <p className="text-[10px] text-rose-500 mt-2 font-medium">নিরাপত্তা ঝুঁকির কারণে অ্যাক্সেস সাময়িক বন্ধ</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
              <Ban className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Database Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/70 text-slate-900 font-bold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">গ্রাহক বিবরণী</th>
                <th className="px-6 py-4">যোগাযোগ মাধ্যম</th>
                <th className="px-6 py-4 text-center">মোট অর্ডার সংখ্যা</th>
                <th className="px-6 py-4 text-right">মোট খরচের পরিমাণ</th>
                <th className="px-6 py-4 text-center">স্ট্যাটাস</th>
                <th className="px-6 py-4 text-right pr-8">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60 bg-white">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-55/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-base uppercase">
                          {user.name ? user.name.charAt(0) : 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{user.name}</div>
                          <div className="text-[10px] text-indigo-600 font-mono mt-0.5">{user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        {user.email || 'কোনো ইমেইল নেই'}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                        <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        {user.phone || 'কোনো ফোন নেই'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className="bg-slate-100 border border-slate-150 text-slate-800 px-2.5 py-1 rounded-xl text-xs font-bold font-mono inline-block">
                         {user.ordersCount} টি
                       </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 text-right whitespace-nowrap">৳{user.spent}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black tracking-wider uppercase inline-flex items-center gap-1 ${
                        user.status === 'Active' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-150' 
                          : 'bg-rose-100 text-rose-800 border border-rose-150'
                      }`}>
                        <span className="w-1 h-1 rounded-full bg-current"></span>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right pr-6 whitespace-nowrap">
                      {user.status === 'Active' ? (
                        <button 
                          onClick={() => handleToggleStatus(user.id, user.name, user.status)}
                          className="text-rose-600 hover:bg-rose-50 border border-rose-150 hover:border-rose-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ml-auto"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" /> ব্লক করুন
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleToggleStatus(user.id, user.name, user.status)}
                          className="text-emerald-600 hover:bg-emerald-50 border border-emerald-150 hover:border-emerald-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ml-auto"
                        >
                          <UserCheck className="w-3.5 h-3.5" /> সক্রিয় করুন
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                    <Users className="w-12 h-12 text-slate-350 mx-auto mb-3" />
                    কোনো কাস্টমার ম্যাচ করেনি
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
