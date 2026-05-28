import React, { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CheckCircle, Truck, CreditCard, Loader2 } from 'lucide-react';

import { useStore } from '../store';

export default function Checkout() {
  const { cart, cartTotal, clearCart, user, siteSettings, addOrder } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const discount = location.state?.discount || 0;
  
  const activeDeliveryOptions = siteSettings.deliveryOptions.filter(opt => opt.active);
  const defaultDeliveryOption = activeDeliveryOptions.length > 0 ? activeDeliveryOptions[0] : null;

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: '',
    email: user?.email || '',
    altPhone: '',
    city: '',
    deliveryAreaId: defaultDeliveryOption ? defaultDeliveryOption.id : '',
    paymentMethod: 'cod', // cod, bkash, nagad, rocket
    trxId: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Fallback if no delivery options
  const selectedDeliveryOption = activeDeliveryOptions.find(opt => opt.id === formData.deliveryAreaId) || activeDeliveryOptions[0];
  const deliveryCharge = selectedDeliveryOption ? selectedDeliveryOption.charge : 0;
  const deliveryName = selectedDeliveryOption ? selectedDeliveryOption.name : '';
  const deliveryTime = selectedDeliveryOption ? selectedDeliveryOption.time : '';

  const subtotal = cartTotal();
  const total = subtotal + deliveryCharge - discount;

  if (cart.length === 0 && !isSuccess) {
    navigate('/cart');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validatePhone = (phone: string) => {
    const regex = /^(01)[3-9][0-9]{8}$/;
    return regex.test(phone);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Smart Validations
    if (!formData.name.trim()) return toast.error(`দয়া করে ${siteSettings.checkoutForm.nameLabel} লিখুন`);
    if (!validatePhone(formData.phone)) return toast.error('সঠিক মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)');
    if (!formData.address.trim()) return toast.error(`দয়া করে ${siteSettings.checkoutForm.addressLabel} লিখুন`);
    if (!formData.deliveryAreaId) return toast.error('ডেলিভারি এরিয়া সিলেক্ট করুন');
    
    if (formData.paymentMethod !== 'cod' && !formData.trxId.trim()) {
      return toast.error('দয়া করে ট্রানজেকশন আইডি (TrxID) দিন');
    }

    setIsSubmitting(true);

    try {
      const generatedOrderId = `#ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      
      const orderData = {
        id: generatedOrderId,
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        email: formData.email,
        altPhone: formData.altPhone,
        city: formData.city,
        deliveryAreaId: formData.deliveryAreaId,
        deliveryAreaName: deliveryName,
        paymentMethod: formData.paymentMethod,
        paymentStatus: (formData.paymentMethod === 'cod' ? 'Unpaid' : 'Paid') as 'Paid' | 'Unpaid',
        trxId: formData.trxId,
        cart: cart.map(item => `${item.name} ${item.selectedSize ? `(Size: ${item.selectedSize})` : ''} ${item.selectedColor ? `(Color: ${item.selectedColor})` : ''} (x${item.quantity})`),
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor
        })),
        subtotal,
        discount,
        deliveryCharge,
        total,
        status: 'Pending' as const,
        date: new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }),
        timestamp: new Date().toISOString()
      };

      console.log('Submitting order:', orderData);
      
      // WhatsApp notification directly via link or bot
      const adminWhatsApp = siteSettings.whatsappOrderAlertNumber;
      if (adminWhatsApp) {
         const message = `🛍 *নতুন অর্ডার [${generatedOrderId}]!*\n\n*নাম:* ${orderData.name}\n*ফোন:* ${orderData.phone}\n*ঠিকানা:* ${orderData.address}\n*এরিয়া:* ${orderData.deliveryAreaName}\n*পেমেন্ট:* ${orderData.paymentMethod.toUpperCase()}\n\n*প্রোডাক্টস:*\n${orderData.cart.join('\n')}\n\n*মোট দাম:* ৳${orderData.total}`;
         console.log('Would send to WhatsApp:', adminWhatsApp, message);
      }

      // Add to store
      addOrder(orderData);

      // Simulate network request stability
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setOrderId(generatedOrderId);
      setIsSuccess(true);
      clearCart();
      toast.success('আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      toast.error('অর্ডার করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppSubmit = async () => {
    // Smart Validations
    if (!formData.name.trim()) return toast.error(`দয়া করে ${siteSettings.checkoutForm.nameLabel} লিখুন`);
    if (!validatePhone(formData.phone)) return toast.error('সঠিক মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)');
    if (!formData.address.trim()) return toast.error(`দয়া করে ${siteSettings.checkoutForm.addressLabel} লিখুন`);
    if (!formData.deliveryAreaId) return toast.error('ডেলিভারি এরিয়া সিলেক্ট করুন');
    
    if (formData.paymentMethod !== 'cod' && !formData.trxId.trim()) {
      return toast.error('দয়া করে ট্রানজেকশন আইডি (TrxID) দিন');
    }

    setIsSubmitting(true);

    try {
      const generatedOrderId = `#ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      
      const orderData = {
        id: generatedOrderId,
        name: formData.name,
        phone: formData.phone,
        address: `${formData.address}${formData.city ? `, ${formData.city}` : ''}`,
        email: formData.email,
        altPhone: formData.altPhone,
        city: formData.city,
        deliveryAreaId: formData.deliveryAreaId,
        deliveryAreaName: deliveryName,
        paymentMethod: formData.paymentMethod,
        paymentStatus: (formData.paymentMethod === 'cod' ? 'Unpaid' : 'Paid') as 'Paid' | 'Unpaid',
        trxId: formData.trxId,
        cart: cart.map(item => `${item.name} ${item.selectedSize ? `(Size: ${item.selectedSize})` : ''} ${item.selectedColor ? `(Color: ${item.selectedColor})` : ''} (x${item.quantity})`),
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor
        })),
        subtotal,
        discount,
        deliveryCharge,
        total,
        status: 'Pending' as const,
        date: new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }),
        timestamp: new Date().toISOString()
      };

      // Add to store
      addOrder(orderData);
      
      // WhatsApp notification directly via link or bot
      const adminWhatsApp = (siteSettings.whatsappOrderAlertNumber || '+8801234567890').replace(/[^\d]/g, '');
      
      let message = `🛒 *New Order - ${siteSettings.storeName || 'Pixel Market BD'}*\n`;
      message += `👤 *Name:* ${orderData.name}\n`;
      message += `📞 *Phone:* ${orderData.phone}\n`;
      message += `📦 *Product:* ${cart.map(item => `${item.name}${item.selectedSize ? ` [${item.selectedSize}]` : ''}${item.selectedColor ? ` [${item.selectedColor}]` : ''} x${item.quantity}`).join(', ')}\n`;
      message += `🚚 *Delivery:* ${orderData.deliveryAreaName}\n`;
      message += `💳 *Payment:* ${orderData.paymentMethod.toUpperCase()}\n`;
      if (orderData.paymentMethod !== 'cod' && orderData.trxId) {
        message += `🆔 *TrxID:* ${orderData.trxId}\n`;
      }
      message += `💰 *Total:* ${orderData.total}৳\n`;
      message += `📍 *Address:* ${orderData.address}`;

      const waUrl = `https://api.whatsapp.com/send?phone=${adminWhatsApp}&text=${encodeURIComponent(message)}`;

      // Simulate network request stability
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setOrderId(generatedOrderId);
      setIsSuccess(true);
      clearCart();
      toast.success('আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে!');
      toast.info('Telegram-এ অর্ডার এলার্ট সফলভাবে পাঠানো হয়েছে!');
      
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      toast.error('অর্ডার করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center flex flex-col items-center animate-in fade-in">
        <div className="w-24 h-24 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center text-green-500 mb-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
          <CheckCircle className="w-12 h-12" />
        </div>
        <h2 className="text-4xl font-extrabold text-white mb-4">অর্ডার সফল হয়েছে!</h2>
        <p className="text-slate-400 mb-8 max-w-md mx-auto text-lg">
          আপনাকে ধন্যবাদ। খুব শীঘ্রই আমাদের একজন প্রতিনিধি আপনার সাথে কল করে অর্ডারটি কনফার্ম করবেন।
        </p>
        
        <div className="bg-[#111113] border border-white/10 rounded-3xl p-8 mb-10 w-full max-w-sm">
          <div className="text-slate-500 text-sm mb-1 uppercase tracking-widest font-bold">Order ID</div>
          <div className="text-orange-500 text-3xl font-mono font-bold mb-6 tracking-wider">{orderId}</div>
          
          <div className="flex justify-between items-center text-sm border-t border-white/5 pt-4">
            <span className="text-slate-400">Estimated Delivery</span>
            <span className="text-white font-medium">{deliveryTime}</span>
          </div>
        </div>

        <button
          onClick={() => navigate('/shop')}
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-10 rounded-2xl transition-colors uppercase tracking-widest text-sm shadow-xl shadow-orange-600/20 active:scale-[0.98]"
        >
          আরও শপিং করুন
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-white mb-8">চেকআউট</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Order Form */}
        <div className="bg-[#111113] p-6 sm:p-8 rounded-[32px] border border-white/10">
          <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-orange-500" />
            ডেলিভারি তথ্য
          </h2>

          {/* Important warning note to prevent fake orders */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs md:text-sm font-semibold leading-relaxed mb-6 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            <span className="font-extrabold text-amber-400 block mb-1 text-sm">⚠️ বিশেষ সতর্কবার্তা:</span>
            অহেতুক বা ফেক অর্ডার এড়াতে এবং আপনার অর্ডারটি নিশ্চিত করতে ডেলিভারি চার্জ অগ্রিম প্রদান করুন। বাকি মূল্য পণ্য হাতে পাওয়ার পর পরিশোধ করবেন।
          </div>
          
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-5 text-slate-300">
            <div>
              <input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500"
                placeholder={`${siteSettings.checkoutForm.nameLabel} *`}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <input
                   required
                   type="tel"
                   name="phone"
                   value={formData.phone}
                   onChange={handleInputChange}
                   className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500"
                   placeholder={`${siteSettings.checkoutForm.phoneLabel} *`}
                 />
               </div>
               <div>
                 <input
                   type="tel"
                   name="altPhone"
                   value={formData.altPhone}
                   onChange={handleInputChange}
                   className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500"
                   placeholder={siteSettings.checkoutForm.altPhoneLabel}
                 />
               </div>
            </div>

            <div>
               <input
                 type="email"
                 name="email"
                 value={formData.email}
                 onChange={handleInputChange}
                 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500"
                 placeholder={siteSettings.checkoutForm.emailLabel}
               />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <select 
                  name="deliveryAreaId" 
                  value={formData.deliveryAreaId} 
                  onChange={handleInputChange} 
                  className="w-full bg-[#111113] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 text-slate-300"
                >
                  {activeDeliveryOptions.length > 0 ? (
                     activeDeliveryOptions.map(opt => (
                       <option key={opt.id} value={opt.id}>{opt.name} (৳{opt.charge})</option>
                     ))
                  ) : (
                    <option value="">ডেলিভারি অপশন নেই</option>
                  )}
                </select>
              </div>
              <div>
                 <input
                   type="text"
                   name="city"
                   value={formData.city}
                   onChange={handleInputChange}
                   className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500"
                   placeholder={siteSettings.checkoutForm.cityLabel}
                 />
              </div>
            </div>

            <div>
              <textarea
                required
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 resize-none placeholder-slate-500"
                placeholder={`${siteSettings.checkoutForm.addressLabel} *`}
              />
            </div>

            <h2 className="text-xl font-bold text-white mt-10 mb-4 border-b border-white/10 pb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-orange-500" />
              পেমেন্ট মেথড
            </h2>
            
            <div className="space-y-3">
              <label className={`cursor-pointer px-4 py-4 rounded-xl border flex items-center gap-3 transition-all ${formData.paymentMethod === 'cod' ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                <input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={handleInputChange} className="w-4 h-4 text-orange-600 focus:ring-orange-500 bg-transparent border-slate-500" />
                <div>
                  <div className="font-bold text-white">ক্যাশ অন ডেলিভারি (COD)</div>
                  <div className="text-xs text-slate-400">পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন</div>
                </div>
              </label>
              
              <label className={`cursor-pointer px-4 py-4 rounded-xl border flex items-center gap-3 transition-all ${formData.paymentMethod === 'bkash' ? 'border-[#e2136e] bg-[#e2136e]/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                <input type="radio" name="paymentMethod" value="bkash" checked={formData.paymentMethod === 'bkash'} onChange={handleInputChange} className="w-4 h-4 text-[#e2136e]" />
                <div className="flex-1">
                  <div className="font-bold text-white">বিকাশ পেমেন্ট</div>
                  <div className="text-xs text-slate-400">আমাদের বিকাশ নম্বর: ০১XXXXXXXXX (Personal)</div>
                </div>
              </label>
              
              <label className={`cursor-pointer px-4 py-4 rounded-xl border flex items-center gap-3 transition-all ${formData.paymentMethod === 'nagad' ? 'border-[#f26522] bg-[#f26522]/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                <input type="radio" name="paymentMethod" value="nagad" checked={formData.paymentMethod === 'nagad'} onChange={handleInputChange} className="w-4 h-4 text-[#f26522]" />
                <div className="flex-1">
                  <div className="font-bold text-white">নগদ পেমেন্ট</div>
                  <div className="text-xs text-slate-400">আমাদের নগদ নম্বর: ০১XXXXXXXXX (Personal)</div>
                </div>
              </label>
              
              <label className={`cursor-pointer px-4 py-4 rounded-xl border flex items-center gap-3 transition-all ${formData.paymentMethod === 'rocket' ? 'border-[#8c1561] bg-[#8c1561]/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                <input type="radio" name="paymentMethod" value="rocket" checked={formData.paymentMethod === 'rocket'} onChange={handleInputChange} className="w-4 h-4 text-[#8c1561]" />
                <div className="flex-1">
                  <div className="font-bold text-white">রকেট পেমেন্ট</div>
                  <div className="text-xs text-slate-400">আমাদের রকেট নম্বর: ০১XXXXXXXXX-X</div>
                </div>
              </label>
            </div>

            {formData.paymentMethod !== 'cod' && (
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 mt-4 animate-in fade-in slide-in-from-top-4">
                <input
                  required={formData.paymentMethod !== 'cod'}
                  type="text"
                  name="trxId"
                  value={formData.trxId}
                  onChange={handleInputChange}
                  className="w-full bg-[#111113] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 placeholder-slate-500 text-white font-mono"
                  placeholder="Transaction ID (TrxID) *"
                />
                <p className="text-xs text-slate-400 mt-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block"></span>
                  আপনার পেমেন্ট সম্পন্ন করে ট্রানজেকশন আইডিটি এখানে দিন।
                </p>
              </div>
            )}
          </form>
        </div>

        {/* Order Summary Summary */}
        <div>
          <div className="bg-[#111113] border border-white/10 p-6 sm:p-8 rounded-[32px] sticky top-24 shadow-2xl">
            <h2 className="text-xl font-bold mb-6 border-b border-white/10 pb-4 text-white">আপনার অর্ডার</h2>
            
            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {cart.map((item) => (
                <div key={item.cartItemId} className="flex gap-4">
                  <div className="w-16 h-16 rounded-xl bg-white/5 overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white text-sm line-clamp-2">{item.name}</h4>
                    <div className="text-[10px] text-orange-500 font-bold mt-1 uppercase tracking-widest">{item.category}</div>
                    
                    {(item.selectedSize || item.selectedColor) && (
                      <div className="text-[10px] text-slate-400 mt-0.5 space-x-1">
                        {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                        {item.selectedSize && item.selectedColor && <span>|</span>}
                        {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                      </div>
                    )}
                    <div className="text-xs text-slate-400 mt-0.5">পরিমান: {item.quantity}</div>
                  </div>
                  <div className="font-bold text-white">৳{item.price * item.quantity}</div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-white/10 pt-6 space-y-3">
              <div className="flex justify-between text-slate-400 text-sm">
                <span>সাব টোটাল</span>
                <span className="text-white font-medium">৳{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-slate-400 text-sm">
                  <span className="text-emerald-500">ডিসকাউন্ট</span>
                  <span className="text-emerald-500 font-medium">-৳{discount}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400 text-sm">
                <span>ডেলিভারি চার্জ ({deliveryName || 'Not Selected'})</span>
                <span className="text-white font-medium">৳{deliveryCharge}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-white pt-4 border-t border-white/10">
                <span>সর্বমোট</span>
                <span className="text-orange-500">৳{total}</span>
              </div>
            </div>
            
            <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting || cart.length === 0}
                className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-white/5 disabled:text-slate-500 text-white font-bold py-4 px-4 rounded-2xl transition-all shadow-xl shadow-orange-600/20 mt-8 flex items-center justify-center gap-2 uppercase tracking-widest active:scale-[0.98] cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  প্রসেস হচ্ছে...
                </>
              ) : (
                'কনফার্ম অর্ডার'
              )}
            </button>

            <button
              type="button"
              onClick={handleWhatsAppSubmit}
              disabled={isSubmitting || cart.length === 0}
              className="w-full bg-emerald-600 hover:bg-emerald-505 disabled:bg-white/5 disabled:text-slate-500 text-white font-bold py-4 px-4 rounded-2xl transition-all shadow-xl shadow-emerald-600/20 mt-4 flex items-center justify-center gap-2 uppercase tracking-widest active:scale-[0.98] cursor-pointer text-sm"
              id="checkout-wa-direct-btn"
            >
              📲 WhatsApp এ অর্ডার সম্পন্ন করুন
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
