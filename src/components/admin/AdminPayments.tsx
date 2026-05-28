import React, { useState } from 'react';
import { DollarSign, ShieldCheck, HelpCircle, Eye, RefreshCw, Layers, Trash2 } from 'lucide-react';
import { useStore } from '../../store';
import { toast } from 'react-toastify';

export default function AdminPayments() {
  const { orders, updateOrderPaymentStatus, deleteOrder } = useStore();
  const [filterType, setFilterType] = useState<'All' | 'Paid' | 'Unpaid'>('All');

  // Calculations
  const codUnpaid = orders.filter(o => o.paymentMethod === 'cod' && o.paymentStatus === 'Unpaid');
  const codPaid = orders.filter(o => o.paymentMethod === 'cod' && o.paymentStatus === 'Paid');
  const onlinePaid = orders.filter(o => o.paymentMethod !== 'cod' && o.paymentStatus === 'Paid');
  
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const paidRevenue = orders.filter(o => o.paymentStatus === 'Paid').reduce((sum, o) => sum + o.total, 0);
  const unpaidRevenue = orders.filter(o => o.paymentStatus === 'Unpaid').reduce((sum, o) => sum + o.total, 0);

  const displayOrders = orders.filter(o => {
    if (filterType === 'All') return true;
    return o.paymentStatus === filterType;
  });

  const togglePayment = (orderId: string, current: 'Paid' | 'Unpaid') => {
    const next = current === 'Paid' ? 'Unpaid' : 'Paid';
    updateOrderPaymentStatus(orderId, next);
    toast.success(`পেমেন্ট পরিবর্তন করে ${next === 'Paid' ? 'পরিশোধিত' : 'অপরিশোধিত'} করা হয়েছে!`);
  };

  const handleDeletePayment = (orderId: string) => {
    deleteOrder(orderId);
    toast.success('পেমেন্ট ও লেনদেন রেকর্ডটি সফলভাবে ডিলিট করা হয়েছে!');
  };

  return (
    <div className="space-y-6 animate-in fade-in text-slate-800">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">পেমেন্ট ও লেনদেন ট্র্যাকিং</h2>
        <p className="text-slate-500 text-sm mt-1">সব পেমেন্ট মেথড (ক্যাশ অন ডেলিভারি, বিকাশ, নগদ, রকেট) এবং লেনদেন আইডি মিলিয়ে দেখুন</p>
      </div>

      {/* Metrics of Income */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">মোট পরিশোধিত ফান্ড</p>
          <h3 className="text-3xl font-black text-emerald-950 mt-1">৳{paidRevenue}</h3>
          <div className="text-[10px] text-emerald-500 mt-2 font-semibold">
            অনলাইন ট্রানজেকশন ও ক্যাশ-ইন রিসিভড
          </div>
        </div>

        <div className="bg-rose-50 rounded-2xl p-6 border border-rose-100">
          <p className="text-xs font-bold text-rose-600 uppercase tracking-widest">অপরিশোধিত / বাকি পেমেন্ট</p>
          <h3 className="text-3xl font-black text-rose-950 mt-1">৳{unpaidRevenue}</h3>
          <div className="text-[10px] text-rose-500 mt-2 font-semibold">
            পেন্ডিং কুরিয়ার হ্যান্ডওভার ক্যাশ
          </div>
        </div>

        <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">সর্বমোট ই-কমার্স রেভিনিউ</p>
          <h3 className="text-3xl font-black text-indigo-950 mt-1">৳{totalRevenue}</h3>
          <div className="text-[10px] text-indigo-500 mt-2 font-semibold">
            ক্যালকুলেশন মেথড: All Order Values
          </div>
        </div>
      </div>

      {/* Layout Tabs */}
      <div className="flex bg-white rounded-xl border border-slate-100 p-1 w-max">
        {['All', 'Paid', 'Unpaid'].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t as any)}
            className={`px-6 py-2 rounded-lg text-sm font-bold cursor-pointer transition-all ${
              filterType === t ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t === 'All' ? 'সব পেমেন্ট' : t === 'Paid' ? 'Paid (পরিশোধিত)' : 'Unpaid (বাকি)'}
          </button>
        ))}
      </div>

      {/* Database View table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/70 text-slate-900 font-bold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">অর্ডার আইডি</th>
                <th className="px-6 py-4">গ্রাহক</th>
                <th className="px-6 py-4">লেনদেন মাধ্যম</th>
                <th className="px-6 py-4">লেনদেন কী (TxID)</th>
                <th className="px-6 py-4">পেমেন্ট অবস্থা</th>
                <th className="px-6 py-4 text-right">টোটাল বিল</th>
                <th className="px-6 py-4 text-center">ইনজেক্ট অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {displayOrders.length > 0 ? (
                displayOrders.map((o) => (
                  <tr key={o.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-indigo-600">{o.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{o.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{o.phone}</div>
                    </td>
                    <td className="px-6 py-4 capitalize font-semibold">
                      {o.paymentMethod === 'cod' ? '💵 Cash on Delivery (COD)' : `💳 Online (${o.paymentMethod})`}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-700">
                      {o.trxId ? (
                        <span className="text-indigo-600 bg-indigo-50/70 px-2 py-1 rounded border border-indigo-100 text-xs">
                          {o.trxId}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black tracking-wider px-2.5 py-1 rounded-xl uppercase inline-flex items-center gap-1 ${
                        o.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        <span className="w-1 h-1 rounded-full bg-current"></span>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-extrabold text-slate-900">৳{o.total}</td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => togglePayment(o.id, o.paymentStatus)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" /> অবস্থা বদলান
                        </button>
                        <button
                          onClick={() => handleDeletePayment(o.id)}
                          className="bg-slate-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-500 border border-slate-200 p-1.5 rounded-xl transition-all cursor-pointer inline-flex items-center"
                          title="রেকর্ড ডিলিট করুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    কোনো পেমেন্ট রেকর্ড পাওয়া যায়নি।
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
