import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight, Tag } from 'lucide-react';
import { useStore } from '../store';
import { toast } from 'react-toastify';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal, coupons } = useStore();
  const navigate = useNavigate();
  
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const handleApplyCoupon = () => {
    const matched = coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase() && c.status === 'Active');
    
    if (matched) {
      const totalAmt = cartTotal();
      if (totalAmt < matched.minSpend) {
        setDiscount(0);
        return toast.error(`এই কুপন ব্যবহারের জন্য ন্যূনতম ৳${matched.minSpend} শপিং করতে হবে।`);
      }
      
      let discountAmount = 0;
      if (matched.discountType === 'percentage') {
        discountAmount = Math.floor(totalAmt * (matched.discountValue / 100));
      } else {
        discountAmount = matched.discountValue;
      }
      
      setDiscount(discountAmount);
      toast.success(`কুপন যোগ করা হয়েছে! ৳${discountAmount} ডিসকাউন্ট পেয়েছেন।`);
    } else {
      setDiscount(0);
      toast.error('ভুল অথবা নিষ্ক্রিয় কুপন কোড!');
    }
  };

    if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-slate-500 mb-6">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">আপনার কার্ট খালি!</h2>
        <p className="text-slate-400 mb-8 max-w-md text-center">আপনি এখনও কোনো প্রোডাক্ট কার্টে যোগ করেননি। শপ থেকে প্রোডাক্ট পছন্দ করুন।</p>
        <Link
          to="/shop"
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-2xl transition-colors uppercase tracking-widest text-sm"
        >
          শপিং শুরু করুন
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10">
      <h1 className="text-3xl font-bold tracking-tight text-white mb-8">শপিং কার্ট</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item.cartItemId} className="bg-white/5 p-4 sm:p-6 rounded-[32px] border border-white/10 flex flex-col sm:flex-row items-center gap-6">
              <img
                src={item.image}
                alt={item.name}
                className="w-24 h-24 object-cover rounded-2xl bg-white/5"
              />
              <div className="flex-1 text-center sm:text-left">
                <div className="text-xs text-orange-500 font-bold tracking-widest uppercase mb-1">{item.category}</div>
                <h3 className="text-lg font-semibold text-white leading-tight mb-2">{item.name}</h3>
                
                {/* Variant Info */}
                {(item.selectedSize || item.selectedColor) && (
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                    {item.selectedSize && (
                      <span className="bg-white/10 px-2 py-1 rounded text-xs text-slate-300">
                        Size: {item.selectedSize}
                      </span>
                    )}
                    {item.selectedColor && (
                      <span className="bg-white/10 px-2 py-1 rounded text-xs text-slate-300">
                        Color: {item.selectedColor}
                      </span>
                    )}
                  </div>
                )}
                
                <div className="text-xl font-bold text-white">৳{item.price}</div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-[#0A0A0B] border border-white/10 rounded-xl p-1">
                  <button
                    onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                    className="p-2 hover:bg-white/10 rounded-lg text-slate-400 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-bold text-white">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                    className="p-2 hover:bg-white/10 rounded-lg text-slate-400 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => removeFromCart(item.cartItemId)}
                  className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-[#111113] p-6 rounded-[32px] border border-white/10 sticky top-24">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
              <ShoppingBag className="w-5 h-5 text-orange-500" />
              অর্ডার সামারি
            </h2>

            <div className="mb-6">
              <label className="text-sm text-slate-400 mb-2 block flex flex-center gap-2"><Tag className="w-4 h-4"/> প্রোমো কোড (কুপন)</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="e.g. DISCOUNT10" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 bg-[#0A0A0B] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500"
                />
                <button 
                  onClick={handleApplyCoupon}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors uppercase tracking-wider"
                >
                  Apply
                </button>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-slate-400">
                <span>সাব টোটাল ({cart.length} আইটেম)</span>
                <span className="text-white">৳{cartTotal()}</span>
              </div>
              {discount > 0 && (
                 <div className="flex justify-between text-slate-400">
                   <span className="text-emerald-500">ডিসকাউন্ট</span>
                   <span className="text-emerald-500">-৳{discount}</span>
                 </div>
              )}
              <div className="flex justify-between text-slate-400 pb-4 border-b border-white/10">
                <span>ডেলিভারি চার্জ</span>
                <span className="text-xs text-orange-500 font-bold bg-orange-500/10 px-2 py-1 rounded">চেকআউটে হিসাব হবে</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-white">
                <span>মোট</span>
                <span className="text-orange-500">৳{cartTotal() - discount}</span>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/checkout', { state: { discount } })}
              className="w-full bg-orange-600 hover:bg-orange-500 active:scale-[0.98] text-white font-bold py-4 px-4 rounded-2xl transition-all shadow-xl shadow-orange-600/20 flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
            >
              অর্ডার কনফার্ম করুন <ArrowRight className="w-5 h-5" />
            </button>
            <p className="mt-4 text-xs text-center text-slate-500">
              আপনি চেকআউট পেজে ডেলিভারি এরিয়া সিলেক্ট করতে পারবেন।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
