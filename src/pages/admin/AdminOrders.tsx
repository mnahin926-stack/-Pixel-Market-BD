import React, { useState } from 'react';
import { ShoppingCart, Eye, FileText, Printer, Truck, CheckCircle, XCircle, Search, X, Check, CreditCard, DollarSign, Trash2 } from 'lucide-react';
import { useStore, Order } from '../../store';
import { toast } from 'react-toastify';

export default function AdminOrders() {
  const { orders, updateOrderStatus, updateOrderPaymentStatus, deleteOrder } = useStore();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected order details modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  const handleUpdateStatus = (orderId: string, nextStatus: Order['status']) => {
    updateOrderStatus(orderId, nextStatus);
    toast.success(`অর্ডারের বর্তমান স্ট্যাটাস '${nextStatus}' করা হয়েছে।`);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status: nextStatus } : null);
    }
  };

  const handleTogglePaymentStatus = (orderId: string, current: 'Paid' | 'Unpaid') => {
    const nextStatus = current === 'Paid' ? 'Unpaid' : 'Paid';
    updateOrderPaymentStatus(orderId, nextStatus);
    toast.success(`পেমেন্ট স্ট্যাটাস '${nextStatus === 'Paid' ? 'Paid (পরিশোধিত)' : 'Unpaid (অপরিশোধিত)'}' করা হয়েছে।`);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, paymentStatus: nextStatus } : null);
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    deleteOrder(orderId);
    toast.success('অর্ডারটি সফলভাবে ডিলিট করা হয়েছে!');
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-750 border border-yellow-200';
      case 'Processing': return 'bg-blue-105 text-blue-750 border border-blue-200';
      case 'Shipped': return 'bg-indigo-100 text-indigo-750 border border-indigo-200';
      case 'Delivered': return 'bg-emerald-100 text-emerald-750 border border-emerald-200';
      case 'Cancelled': return 'bg-rose-100 text-rose-750 border border-rose-200';
      default: return 'bg-slate-100 text-slate-750';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesFilter = activeFilter === 'All' || order.status === activeFilter;
    
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      order.id.toLowerCase().includes(query) ||
      order.name.toLowerCase().includes(query) ||
      (order.phone && order.phone.includes(query)) ||
      (order.city && order.city.toLowerCase().includes(query));

    return matchesFilter && matchesSearch;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in text-slate-800">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">অর্ডার ম্যানেজমেন্ট</h2>
          <p className="text-slate-500 text-sm mt-1">সব কাস্টমারের অর্ডার স্ট্যাটাস, পেমেন্ট এবং শিপিং রিয়েল-টাইমে নিয়ন্ত্রণ করুন</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
           <div className="relative w-full sm:w-64">
             <input 
               type="text" 
               placeholder="আইডি, নাম বা ফোন দিয়ে খুঁজুন..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full" 
             />
             <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
           </div>
        </div>
      </div>

      {/* Tabs list matching orders status count */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(filter => {
          const count = filter === 'All' 
            ? orders.length 
            : orders.filter(o => o.status === filter).length;
            
          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
                activeFilter === filter 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{filter === 'All' ? 'সব অর্ডার' : filter}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeFilter === filter ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Table View */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/70 text-slate-900 font-bold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">অর্ডার আইডি</th>
                <th className="px-6 py-4">কাস্টমার মেইল/ফোন</th>
                <th className="px-6 py-4">তারিখ</th>
                <th className="px-6 py-4">পেমেন্ট মেথড</th>
                <th className="px-6 py-4">পেমেন্ট স্ট্যাটাস</th>
                <th className="px-6 py-4">ডেলিভারি স্ট্যাটাস</th>
                <th className="px-6 py-4 font-bold text-right">মোট দাম (৳)</th>
                <th className="px-6 py-4 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-indigo-600 whitespace-nowrap">{order.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{order.name}</div>
                      <div className="text-xs text-slate-450 mt-0.5">{order.phone}</div>
                      {order.city && (
                        <div className="text-[10px] bg-slate-100 text-slate-600 border border-slate-150 inline-block px-1.5 rounded-md mt-1 font-bold">
                          {order.city}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-500">{order.date || 'আজ'}</td>
                    <td className="px-6 py-4 capitalize font-semibold whitespace-nowrap text-slate-550">
                      {order.paymentMethod === 'cod' ? '💵 Cash on Delivery' : `💳 Online (${order.paymentMethod})`}
                      {order.trxId && (
                        <div className="text-[10px] text-indigo-600 font-mono block">TxID: {order.trxId}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleTogglePaymentStatus(order.id, order.paymentStatus)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer ${
                          order.paymentStatus === 'Paid' 
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                            : 'bg-rose-100 text-rose-850 hover:bg-rose-200'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {order.paymentStatus === 'Paid' ? 'Paid' : 'Unpaid'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <select 
                         value={order.status}
                         onChange={(e) => handleUpdateStatus(order.id, e.target.value as Order['status'])}
                         className={`px-3 py-1.5 rounded-xl text-xs font-bold border-0 outline-none cursor-pointer tracking-wider ${getStatusColor(order.status)}`}
                       >
                         <option value="Pending">Pending</option>
                         <option value="Processing">Processing</option>
                         <option value="Shipped">Shipped</option>
                         <option value="Delivered">Delivered</option>
                         <option value="Cancelled">Cancelled</option>
                       </select>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 text-right whitespace-nowrap">৳{order.total}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center gap-1">
                         <button 
                           onClick={() => setSelectedOrder(order)}
                           className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer" 
                           title="বিবরণ দেখুন"
                         >
                           <Eye className="w-4.5 h-4.5" />
                         </button>
                         <button 
                           onClick={() => { setSelectedOrder(order); setIsInvoiceOpen(true); }}
                           className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer" 
                           title="চালান / রসিদ"
                         >
                           <FileText className="w-4.5 h-4.5" />
                         </button>
                         <button 
                           onClick={() => handleDeleteOrder(order.id)}
                           className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer" 
                           title="অর্ডার ডিলিট করুন"
                         >
                           <Trash2 className="w-4.5 h-4.5" />
                         </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-slate-400">
                    <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    কোনো অর্ডার পাওয়া যায়নি।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic Detail Modal / Shipping View */}
      {selectedOrder && !isInvoiceOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-6 relative shadow-2xl text-slate-800 animate-in zoom-in max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
              <ShoppingCart className="w-6 h-6 text-indigo-600" />
              <div>
                <h3 className="text-xl font-bold text-slate-900">অর্ডার বিবরণী ({selectedOrder.id})</h3>
                <p className="text-xs text-slate-400">তারিখ: {selectedOrder.date || 'আজ'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Billing and Shipping */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <h4 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider mb-3">গ্রাহক ও শিপিং ঠিকানা</h4>
                <div className="space-y-2 text-sm text-slate-700">
                  <p><b className="text-slate-900">নাম:</b> {selectedOrder.name}</p>
                  <p><b className="text-slate-900">ফোন নম্বর:</b> {selectedOrder.phone}</p>
                  {selectedOrder.altPhone && <p><b className="text-slate-900">বিকল্প ফোন:</b> {selectedOrder.altPhone}</p>}
                  <p><b className="text-slate-900">শিপিং ঠিকানা:</b> {selectedOrder.address}</p>
                  <p><b className="text-slate-900">শহর/জেলা:</b> {selectedOrder.city || 'Not specified'}</p>
                  {selectedOrder.email && <p><b className="text-slate-900">ইমেইল:</b> {selectedOrder.email}</p>}
                </div>
              </div>

              {/* Status and Logistics */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider mb-3 font-bangla">লজিস্টিকস ও পেমেন্ট</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-slate-600">ডেলিভারি এরিয়া:</span>
                      <span className="font-bold text-slate-900">{selectedOrder.deliveryAreaName || 'ডিফল্ট এরিয়া'}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-slate-600">পেমেন্ট মেথড:</span>
                      <span className="font-bold text-slate-900 capitalize px-2 py-0.5 bg-slate-200 rounded text-xs">
                        {selectedOrder.paymentMethod}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-slate-600">পেমেন্ট স্ট্যাটাস:</span>
                      <button
                        onClick={() => handleTogglePaymentStatus(selectedOrder.id, selectedOrder.paymentStatus)}
                        className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                          selectedOrder.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {selectedOrder.paymentStatus} (টগল করুন)
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200/60 pt-3 mt-3">
                  <span className="block text-xs font-extrabold text-slate-400 mb-2 uppercase tracking-widest font-bangla">স্ট্যাটাস পরিবর্তন করুন</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
                      <button
                        key={st}
                        onClick={() => handleUpdateStatus(selectedOrder.id, st as Order['status'])}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all ${
                          selectedOrder.status === st 
                            ? 'bg-slate-800 text-white border-slate-850' 
                            : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items Summary */}
            <div className="border border-slate-100 rounded-2xl overflow-hidden mb-6">
              <div className="bg-slate-50/80 px-4 py-3 font-bold text-xs text-slate-400 uppercase tracking-wider border-b border-slate-100">অর্ডার প্রোডাক্টস</div>
              <div className="divide-y divide-slate-100 max-h-[220px] overflow-y-auto">
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((item, index) => (
                    <div key={index} className="p-4 flex items-center justify-between gap-4 text-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-150">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 font-bold">🛒</div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm leading-tight">{item.name}</p>
                          <p className="text-xs text-slate-450 mt-1">
                            {item.selectedColor ? `Color: ${item.selectedColor} ` : ''}
                            {item.selectedSize ? `Size: ${item.selectedSize}` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-sm text-slate-950">৳{item.price} × {item.quantity}</p>
                        <p className="text-xs text-indigo-650 font-bold mt-0.5">৳{item.price * item.quantity}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  /* Fallback string interpretation */
                  (selectedOrder.cart || []).map((desc, i) => (
                    <div key={i} className="p-3 text-sm text-slate-700">{desc}</div>
                  ))
                )}
              </div>
            </div>

            {/* Calculations Box */}
            <div className="space-y-1.5 border-t border-slate-150 pt-4 text-sm max-w-xs ml-auto">
              <div className="flex justify-between">
                <span className="text-slate-500">সাবটোটাল:</span>
                <span className="font-bold">৳{selectedOrder.subtotal || selectedOrder.total}</span>
              </div>
              {selectedOrder.discount ? (
                <div className="flex justify-between text-rose-600">
                  <span>ডিসকাউন্ট:</span>
                  <span>-৳{selectedOrder.discount}</span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span className="text-slate-500">ডেলিভারি চার্জ:</span>
                <span className="font-bold">৳{selectedOrder.deliveryCharge || 0}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5 text-base font-extrabold text-[#0F172A]">
                <span>সর্বমোট বিল:</span>
                <span className="text-indigo-600">৳{selectedOrder.total}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Generator Modal */}
      {selectedOrder && isInvoiceOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:p-0 print:bg-white overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-3xl p-8 relative shadow-2xl text-slate-800 print:shadow-none print:p-0 max-h-[95vh] overflow-y-auto print:max-h-none">
            
            {/* Close / Print actions */}
            <div className="absolute top-4 right-4 flex gap-2 print:hidden z-10">
              <button 
                onClick={handlePrint}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold font-sans flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Printer className="w-4 h-4" /> প্রিন্ট চালান
              </button>
              <button 
                onClick={() => { setSelectedOrder(null); setIsInvoiceOpen(false); }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-500 p-2 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printed Invoice Body */}
            <div className="p-4 print:p-0 space-y-8 font-sans">
              
              {/* Invoice Head */}
              <div className="flex justify-between items-start border-b-2 border-slate-100 pb-6">
                <div>
                  <h1 className="text-3xl font-extrabold text-indigo-700 tracking-tight">Pixel Market BD</h1>
                  <span className="text-xs text-slate-400 font-bold block uppercase tracking-widest mt-1">Premium Digital Store</span>
                  <p className="text-xs text-slate-500 mt-2 max-w-xs leading-relaxed">
                    মিরপুর, ঢাকা ১২১৬, বাংলাদেশ<br />
                    হটলাইন: +৮৮০১৭১২-৩৪৫৬৭৮
                  </p>
                </div>
                <div className="text-right">
                  <h2 className="text-xl font-black text-slate-900 uppercase">চালানপত্র / Invoice</h2>
                  <p className="text-sm font-bold text-indigo-600 font-mono mt-1">{selectedOrder.id}</p>
                  <p className="text-xs text-slate-500 mt-2">তারিখ: {selectedOrder.date || 'আজ'}</p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold">পেমেন্ট মেথড: {selectedOrder.paymentMethod}</p>
                </div>
              </div>

              {/* Invoice Address Blocks */}
              <div className="grid grid-cols-2 gap-8 text-sm">
                <div>
                  <h3 className="font-extrabold text-slate-400 uppercase text-xs tracking-wider mb-2">প্রাপক / Billed To:</h3>
                  <div className="space-y-1 text-slate-800 font-medium">
                    <p className="font-bold text-slate-950 text-base">{selectedOrder.name}</p>
                    <p>ফোন নম্বর: <b className="text-indigo-600">{selectedOrder.phone}</b></p>
                    {selectedOrder.altPhone && <p>বিকল্প নম্বর: {selectedOrder.altPhone}</p>}
                    <p>ঠিকানা: {selectedOrder.address}</p>
                    <p>শহর: {selectedOrder.city || 'রিলিজ ঢাকা'}</p>
                    {selectedOrder.email && <p>ইমেইল: {selectedOrder.email}</p>}
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-1">
                  <h3 className="font-extrabold text-slate-400 uppercase text-xs tracking-wider mb-2">ডেলিভারি লজিস্টিকস:</h3>
                  <p><b className="text-slate-800">শিপিং মেথড:</b> স্ট্যান্ডার্ড কুরিয়ার</p>
                  <p><b className="text-slate-800">এরিয়া জোন:</b> {selectedOrder.deliveryAreaName || 'ডিফল্ট জোন'}</p>
                  <p><b className="text-slate-800">পেমেন্ট স্ট্যাটাস:</b> 
                    <span className={`ml-1.5 font-black uppercase text-[10px] px-1.5 py-0.5 rounded ${
                      selectedOrder.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {selectedOrder.paymentStatus}
                    </span>
                  </p>
                  <p className="pt-2 text-[10px] text-slate-400 italic">ধন্যবাদ আমাদের উপর আস্থা রাখার জন্য। যেকোনো সমস্যায় উপরোক্ত হটলাইনে যোগাযোগ করুন।</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden mt-6">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 font-bold border-b border-slate-200 text-slate-900">
                    <tr>
                      <th className="px-6 py-3">আইটেম বিবরণ</th>
                      <th className="px-6 py-3 text-center">পরিমাণ</th>
                      <th className="px-6 py-3 text-right">ইউনিট মূল্য (৳)</th>
                      <th className="px-6 py-3 text-right">মোট মূল্য (৳)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 font-bold text-slate-900">
                            <span>{item.name}</span>
                            <span className="text-xs text-slate-450 block font-normal mt-0.5">
                              {item.selectedColor ? `Color: ${item.selectedColor} ` : ''}
                              {item.selectedSize ? `Size: ${item.selectedSize}` : ''}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center text-slate-800 font-bold font-mono">{item.quantity}</td>
                          <td className="px-6 py-4 text-right font-semibold">৳{item.price}</td>
                          <td className="px-6 py-4 text-right font-bold text-slate-950">৳{item.price * item.quantity}</td>
                        </tr>
                      ))
                    ) : (
                      (selectedOrder.cart || []).map((desc, i) => (
                        <tr key={i}>
                          <td className="px-6 py-4" colSpan={3}>{desc}</td>
                          <td className="px-6 py-4 text-right font-black">৳{selectedOrder.total}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Invoice Calculations and Footer Sign */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t-2 border-slate-100">
                <div className="text-xs text-slate-400 self-center leading-relaxed">
                  * মিরপুর কুরিয়ার হাফ-ডে ট্রান্সপোর্ট সিকিউরিটি সিস্টেম দ্বারা সুরক্ষিত।<br />
                  * ৭ দিনের সহজ রিটার্ন পলিসি প্রযোজ্য।<br />
                  * পণ্য বুঝে পেয়ে সরবরাহকারী প্রতিনিধিকে স্বাক্ষর দিন।
                </div>
                <div>
                  <div className="space-y-2 text-sm max-w-xs ml-auto">
                    <div className="flex justify-between">
                      <span className="text-slate-500">উপ-মোট বিল:</span>
                      <span className="font-bold">৳{selectedOrder.subtotal || selectedOrder.total}</span>
                    </div>
                    {selectedOrder.discount ? (
                      <div className="flex justify-between text-rose-600">
                        <span>ডিসকাউন্ট ছাড়:</span>
                        <span>-৳{selectedOrder.discount}</span>
                      </div>
                    ) : null}
                    <div className="flex justify-between">
                      <span className="text-slate-500">ডেলিভারি চার্জ:</span>
                      <span className="font-bold font-mono">৳{selectedOrder.deliveryCharge || 0}</span>
                    </div>
                    <div className="flex justify-between border-t-2 border-slate-200 pt-2 text-lg font-black text-slate-950">
                      <span>সর্বমোট পরিশোধযোগ্য:</span>
                      <span className="text-indigo-600 font-mono">৳{selectedOrder.total}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="flex justify-between items-end pt-16 print:pt-14 text-xs font-semibold text-slate-500">
                <div className="text-center w-36 border-t border-slate-350 pt-1.5 uppercase font-bold tracking-wider">
                  গ্রাহকের স্বাক্ষর
                </div>
                <div className="text-center w-36 border-t border-slate-350 pt-1.5 uppercase font-bold tracking-wider">
                  কর্তৃপক্ষের স্বাক্ষর
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
