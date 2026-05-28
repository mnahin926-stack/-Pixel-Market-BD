import React, { useState } from 'react';
import { Truck, MapPin, Edit, Check } from 'lucide-react';
import { useStore, Order } from '../../store';
import { toast } from 'react-toastify';

export default function AdminDelivery() {
  const { orders, siteSettings, updateSiteSettings, updateOrderStatus } = useStore();
  const [isEditingCharges, setIsEditingCharges] = useState(false);

  // Extract values from state properly
  const dhakaOption = siteSettings.deliveryOptions?.find(o => o.id === 'dhaka');
  const outsideOption = siteSettings.deliveryOptions?.find(o => o.id === 'outside');

  const [insideCt, setInsideCt] = useState(dhakaOption ? dhakaOption.charge : 60);
  const [outsideCt, setOutsideCt] = useState(outsideOption ? outsideOption.charge : 120);
  const [carrierNo, setCarrierNo] = useState(siteSettings.whatsappOrderAlertNumber || '01700-000000');

  const handleSaveCharges = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedOptions = (siteSettings.deliveryOptions || []).map(option => {
      if (option.id === 'dhaka') return { ...option, charge: Number(insideCt) };
      if (option.id === 'outside') return { ...option, charge: Number(outsideCt) };
      return option;
    });

    updateSiteSettings({
      ...siteSettings,
      deliveryOptions: updatedOptions,
      whatsappOrderAlertNumber: carrierNo
    });

    setIsEditingCharges(false);
    toast.success('ডেলিভারি কনফিগারেশন ফি এবং কুরিয়ার সেটিংস সফলভাবে আপডেট হয়েছে!');
  };

  const handleUpdateStatus = (orderId: string, next: Order['status']) => {
    updateOrderStatus(orderId, next);
    toast.success(`অর্ডারের ডেলিভারি অবস্থা এখন '${next}' করা হয়েছে!`);
  };

  // Calculations
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const processingOrders = orders.filter(o => o.status === 'Processing').length;
  const shippedOrders = orders.filter(o => o.status === 'Shipped').length;
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;

  return (
    <div className="space-y-6 animate-in fade-in text-slate-800">
      
      {/* Header Info */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-sans">শিপিং ও কুরিয়ার সেটিংস</h2>
          <p className="text-slate-500 text-sm mt-1">হোম ডেলিভারি ফি জোন এবং প্যাক করা কুরিয়ার অর্ডারগুলোর ট্র্যাকিং স্থিতি দেখুন</p>
        </div>
        <button 
          onClick={() => setIsEditingCharges(!isEditingCharges)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Edit className="w-4 h-4" /> ডেলিভারি চার্জ পরিবর্তন করুন
        </button>
      </div>

      {/* Charge Edits Panel */}
      {isEditingCharges && (
        <form onSubmit={handleSaveCharges} className="bg-slate-900 p-6 rounded-3xl border border-slate-800 text-white shadow-xl animate-in slide-in-from-top-4 space-y-4 max-w-xl">
          <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2 mb-2">
            <Truck className="w-5 h-5 text-indigo-400" /> ডেলিভারি ফি সেটিংস পরিবর্তন
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-405 mb-2 font-bold font-sans">ঢাকার ভিতরে চার্জ (৳)</label>
              <input 
                type="number" 
                value={insideCt}
                onChange={(e) => setInsideCt(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-405 mb-2 font-bold font-sans font-bangla">ঢাকার বাইরে চার্জ (৳)</label>
              <input 
                type="number" 
                value={outsideCt}
                onChange={(e) => setOutsideCt(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-405 mb-2 font-bold font-sans">অর্ডার অ্যালার্টস কুরিয়ার ফোন নম্বর</label>
            <input 
              type="text" 
              value={carrierNo}
              onChange={(e) => setCarrierNo(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              placeholder="+৮৮০১৭১২-৩৪৫"
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button 
              type="button" 
              onClick={() => setIsEditingCharges(false)}
              className="px-4 py-2 border border-slate-700 hover:bg-slate-800 rounded-xl text-xs font-bold font-bangla cursor-pointer"
            >
              বাতিল
            </button>
            <button 
              type="submit" 
              className="px-6 py-2 bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              সেভ নিশ্চিত করুন
            </button>
          </div>
        </form>
      )}

      {/* Shipment Stats counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'অপেক্ষমাণ অর্ডার (Pending)', count: pendingOrders, color: 'text-yellow-600 bg-yellow-50' },
          { label: 'প্যাকিং চলছে (Processing)', count: processingOrders, color: 'text-blue-600 bg-blue-50' },
          { label: 'কুরিয়ারে আছে (Shipped)', count: shippedOrders, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'ডেলিভারি সম্পন্ন (Delivered)', count: deliveredOrders, color: 'text-emerald-700 bg-emerald-50' }
        ].map((st, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-xs font-bold leading-relaxed">{st.label}</p>
              <h4 className="text-2xl font-black text-slate-850 mt-1">{st.count} টি</h4>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${st.color}`}>
              <Truck className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Shipments List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-105">
          <h3 className="font-bold text-slate-950 text-sm">ডেলিভারি কুরিয়ার তালিকা পোর্টাল</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-905 font-bold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">অর্ডার আইডি</th>
                <th className="px-6 py-4">গ্রাহকের ঠিকানা</th>
                <th className="px-6 py-4">ডেলিভারি এরিয়া</th>
                <th className="px-6 py-4 text-center">ডেলিভারি চার্জ</th>
                <th className="px-6 py-4">ডেলিভারি অবস্থা</th>
                <th className="px-6 py-4 text-center">ইনস্ট্যান্ট আপডেট</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((o) => (
                  <tr key={o.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-indigo-600 whitespace-nowrap">{o.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{o.name}</div>
                      <div className="text-xs text-slate-450 mt-1 max-w-xs truncate">{o.address}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-100 text-indigo-755 text-xs font-bold px-2 py-1 rounded-lg">
                        <MapPin className="w-3 h-3 text-indigo-600" />
                        {o.deliveryAreaName || 'Standard'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold font-mono text-slate-900">৳{o.deliveryCharge || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase inline-block ${
                        o.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                        o.status === 'Shipped' ? 'bg-indigo-100 text-indigo-800' :
                        o.status === 'Processing' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center gap-2">
                        {o.status !== 'Shipped' && o.status !== 'Delivered' && (
                          <button
                            onClick={() => handleUpdateStatus(o.id, 'Shipped')}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Truck className="w-3 h-3" /> Ship
                          </button>
                        )}
                        {o.status === 'Shipped' && (
                          <button
                            onClick={() => handleUpdateStatus(o.id, 'Delivered')}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Check className="w-3 h-3" /> Deliver
                          </button>
                        )}
                        <span className="text-slate-400 font-medium text-xs">{(o.status === 'Delivered' || o.status === 'Cancelled') ? 'Locked' : ''}</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    কোনো শিপমেন্ট রেকর্ড পাওয়া যায়নি।
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
