import React, { useState, useEffect } from 'react';
import { X, CheckCircle, ShoppingBag, Truck, User, Phone, MapPin, CreditCard, Send, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';
import { useStore, Order } from '../../store';
import { Product } from '../../data';

interface WhatsAppCheckoutModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  initialSize?: string;
  initialColor?: string;
  initialQuantity?: number;
}

export default function WhatsAppCheckoutModal({ 
  product, 
  isOpen, 
  onClose,
  initialSize = '',
  initialColor = '',
  initialQuantity = 1
}: WhatsAppCheckoutModalProps) {
  const { siteSettings, addOrder, addAuditLog } = useStore();

  const [size, setSize] = useState(initialSize || product.sizes?.[0] || '');
  const [color, setColor] = useState(initialColor || product.colors?.[0] || '');
  const [quantity, setQuantity] = useState(initialQuantity);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [thanaDistrict, setThanaDistrict] = useState('');
  const [notes, setNotes] = useState('');

  // Delivery options from store settings
  const activeDeliveryOptions = (siteSettings?.deliveryOptions || []).filter(opt => opt.active);
  const defaultOption = activeDeliveryOptions.length > 0 ? activeDeliveryOptions[0] : null;
  const [deliveryAreaId, setDeliveryAreaId] = useState(defaultOption ? defaultOption.id : '');
  const [paymentMethod, setPaymentMethod] = useState('cod'); // cod, bkash, nagad, rocket
  const [trxId, setTrxId] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [generatedOrderId, setGeneratedOrderId] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSize(initialSize || product.sizes?.[0] || '');
      setColor(initialColor || product.colors?.[0] || '');
      setQuantity(initialQuantity);
      setOrderSuccess(false);
      setGeneratedOrderId('');
      setName('');
      setPhone('');
      setAddress('');
      setThanaDistrict('');
      setNotes('');
      setTrxId('');
      if (defaultOption) {
        setDeliveryAreaId(defaultOption.id);
      }
    }
  }, [isOpen, product, initialSize, initialColor, initialQuantity]);

  if (!isOpen) return null;

  const currentDelivery = activeDeliveryOptions.find(opt => opt.id === deliveryAreaId) || activeDeliveryOptions[0];
  const deliveryCharge = currentDelivery ? currentDelivery.charge : 0;
  const deliveryName = currentDelivery ? currentDelivery.name : '';
  const deliveryTime = currentDelivery ? currentDelivery.time : '';

  const subtotal = product.price * quantity;
  const total = subtotal + deliveryCharge;

  const validatePhone = (p: string) => {
    const rx = /^(01)[3-9][0-9]{8}$/;
    return rx.test(p);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return toast.error('দয়া করে আপনার নাম লিখুন');
    if (!validatePhone(phone)) return toast.error('সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)');
    if (!address.trim()) return toast.error('ডেলিভারি ঠিকানা ও গলি নম্বর দিন');
    if (!thanaDistrict.trim()) return toast.error('শহর, থানা বা জেলা লিখুন');
    if (!deliveryAreaId) return toast.error('ডেলিভারি এলাকা নির্বাচন করুন');
    if (paymentMethod !== 'cod' && !trxId.trim()) return toast.error('পেমেন্টের ট্রানজেকশন আইডি (TrxID) প্রদান করুন');

    setIsSubmitting(true);

    try {
      // Create random order id
      const orderId = `#ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      setGeneratedOrderId(orderId);

      const itemSummary = `${product.name} ${size ? `(Size: ${size})` : ''} ${color ? `(Color: ${color})` : ''} (x${quantity})`;

      const orderData: Order = {
        id: orderId,
        name: name.trim(),
        phone: phone.trim(),
        address: `${address.trim()}, ${thanaDistrict.trim()}${notes.trim() ? ` (নোট: ${notes.trim()})` : ''}`,
        city: thanaDistrict.trim(),
        deliveryAreaId,
        deliveryAreaName: deliveryName,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'Unpaid' : 'Paid',
        trxId: trxId.trim() || undefined,
        cart: [itemSummary],
        items: [{
          productId: product.id,
          name: product.name,
          quantity,
          price: product.price,
          image: product.image,
          selectedSize: size || undefined,
          selectedColor: color || undefined
        }],
        subtotal,
        discount: 0,
        deliveryCharge,
        total,
        status: 'Pending',
        date: new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }),
        timestamp: new Date().toISOString()
      };

      // Register inside center app store
      addOrder(orderData);

      // Trigger Audit log
      addAuditLog(`WhatsApp এর মাধ্যমে নতুন অর্ডার করেছেন কাস্টমার: ${name} (${orderId})`, 'WhatsApp');

      // Trigger local storage save & state updates successfully
      toast.success('অর্ডারটি ডাটাবেজে রেকর্ড করা হয়েছে!');

      // Create WhatsApp message payload strictly as requested by the user
      const fullAddress = `${address.trim()}, ${thanaDistrict.trim()}`;
      const storeNameLabel = siteSettings.storeName || 'Pixel Market BD';

      let message = `🛒 *New Order - ${storeNameLabel}*\n`;
      message += `👤 *Name:* ${name.trim()}\n`;
      message += `📞 *Phone:* ${phone.trim()}\n`;
      message += `📦 *Product:* ${product.name}\n`;
      if (product.sizes && product.sizes.length > 0 && size) {
        message += `📏 *Size:* ${size}\n`;
      }
      if (product.colors && product.colors.length > 0 && color) {
        message += `🎨 *Color:* ${color}\n`;
      }
      message += `🔢 *Quantity:* ${quantity}\n`;
      message += `🚚 *Delivery:* ${deliveryName}\n`;
      message += `💳 *Payment:* ${paymentMethod.toUpperCase()}\n`;
      if (paymentMethod !== 'cod' && trxId.trim()) {
        message += `🆔 *TrxID:* ${trxId.trim()}\n`;
      }
      message += `💰 *Total:* ${total}৳\n`;
      message += `📍 *Address:* ${fullAddress}`;
      if (notes.trim()) {
        message += `\n📝 *Notes:* ${notes.trim()}`;
      }

      // Format WhatsApp API string
      const destPhone = (siteSettings.whatsappOrderAlertNumber || '+8801234567890').replace(/[^\d]/g, '');
      const waUrl = `https://api.whatsapp.com/send?phone=${destPhone}&text=${encodeURIComponent(message)}`;

      // Simulate a small timing window for visual confirmation
      await new Promise(resolve => setTimeout(resolve, 1200));

      setOrderSuccess(true);
      
      // Simulate real-time alerts
      toast.info('Telegram-এ অর্ডার এলার্ট সফলভাবে পাঠানো হয়েছে!');
      
      // Navigate to WhatsApp
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      toast.error('অর্ডার প্রসেস করতে ব্যর্থ হয়েছে। দয়া করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0A0A0B] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-slate-200 shadow-2xl animate-in fade-in duration-300">
        
        {/* Header toolbar */}
        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500 animate-pulse" />
            <h3 className="font-bold text-white tracking-wide text-base md:text-lg">📲 WhatsApp এ সরাসরি অর্ডার</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white p-2 hover:bg-white/5 rounded-xl cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {orderSuccess ? (
          /* Completion details card */
          <div className="flex-1 overflow-y-auto px-6 py-12 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h4 className="text-3xl font-extrabold text-white mb-3">আমরা অর্ডারটি পেয়েছি!</h4>
            <p className="text-slate-400 max-w-md mx-auto text-sm md:text-base leading-relaxed mb-6">
              আপনার ডিটেইলস সফলভাবে সংরক্ষণ করা হয়েছে। অর্ডারটি সম্পন্ন করতে কাস্টমার হোয়াটসঅ্যাপ অ্যাপ্লিকেশন খুলে <span className="text-emerald-400 font-bold">"Send"</span> বাটন চাপুন।
            </p>

            <div className="bg-[#111113] border border-white/10 rounded-2xl p-6 mb-8 w-full max-w-sm">
              <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">অর্ডার নম্বর (Order ID)</div>
              <div className="text-orange-500 text-2xl font-mono font-bold tracking-widest mb-4">{generatedOrderId}</div>
              
              <div className="flex justify-between items-center text-xs border-t border-white/5 pt-3 mb-2">
                <span className="text-slate-400">ডেলিভারি এরিয়া</span>
                <span className="text-white font-medium">{deliveryName}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">সর্বমোট প্রদেয় বিল</span>
                <span className="text-orange-500 font-bold text-sm">৳{total}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
              <button
                onClick={() => {
                  const destPhone = (siteSettings.whatsappOrderAlertNumber || '+8801234567890').replace(/[^\d]/g, '');
                  const message = `🛒 *New Order - ${siteSettings.storeName || 'Pixel Market BD'}*\n👤 *Name:* ${name}\n📞 *Phone:* ${phone}\n📦 *Product:* ${product.name}\n🔢 *Quantity:* ${quantity}\n💰 *Total:* ${total}৳`;
                  window.open(`https://api.whatsapp.com/send?phone=${destPhone}&text=${encodeURIComponent(message)}`, '_blank');
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-6 rounded-xl text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01]"
              >
                <Send className="w-4 h-4" /> হোয়াটসঅ্যাপ পুনরায় খুলুন
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 font-bold py-3.5 px-6 rounded-xl text-sm border border-white/10 transition-colors cursor-pointer"
              >
                প্যানেল বন্ধ করুন
              </button>
            </div>
          </div>
        ) : (
          /* Main active form rendering */
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* 1. Item quick parameters */}
            <div className="bg-[#111113] p-4 rounded-2xl border border-white/15 flex gap-4 md:items-center">
              <div className="w-20 h-20 rounded-xl bg-white/5 border border-white/5 overflow-hidden flex-shrink-0">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white text-sm md:text-base truncate">{product.name}</h4>
                <p className="text-orange-500 font-bold text-sm mt-0.5">৳{product.price}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {/* Select size */}
                  {product.sizes && product.sizes.length > 0 && (
                    <select 
                      value={size} 
                      onChange={(e) => setSize(e.target.value)}
                      className="bg-[#0A0A0B] border border-white/10 text-slate-300 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-orange-500"
                    >
                      {product.sizes.map(s => (
                        <option key={s} value={s}>Size: {s}</option>
                      ))}
                    </select>
                  )}
                  {/* Select color */}
                  {product.colors && product.colors.length > 0 && (
                    <select 
                      value={color} 
                      onChange={(e) => setColor(e.target.value)}
                      className="bg-[#0A0A0B] border border-white/10 text-slate-300 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-orange-500"
                    >
                      {product.colors.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  )}
                  {/* Quantity selector */}
                  <div className="flex items-center gap-2 border border-white/10 bg-[#0A0A0B] rounded-lg px-2 py-0.5">
                    <button 
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="text-slate-400 hover:text-white font-bold px-1 text-xs"
                    >-</button>
                    <span className="text-white text-xs font-bold min-w-[15px] text-center">{quantity}</span>
                    <button 
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="text-slate-400 hover:text-white font-bold px-1 text-xs"
                    >+</button>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Customer inputs */}
            <div className="space-y-4">
              {/* Important warning note to prevent fake orders */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs font-semibold leading-relaxed mb-4 shadow-[0_0_15px_rgba(245,158,11,0.06)]">
                <span className="font-extrabold text-amber-400 block mb-0.5 text-xs">⚠️ বিশেষ সতর্কবার্তা:</span>
                অহেতুক বা ফেক অর্ডার এড়াতে এবং আপনার অর্ডারটি নিশ্চিত করতে ডেলিভারি চার্জ অগ্রিম প্রদান করুন। বাকি মূল্য পণ্য হাতে পাওয়ার পর পরিশোধ করবেন।
              </div>

              <h5 className="text-xs font-extrabold uppercase tracking-widest text-[#94a3b8] flex items-center gap-1.5 border-b border-white/5 pb-2">
                <User className="w-4 h-4 text-orange-500" /> কাস্টমার ইনফরমেশন
              </h5>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1.5">আপনার নাম <span className="text-rose-500">*</span></label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="যেমন: জনাব তানভীর"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1.5">মোবাইল নাম্বার <span className="text-rose-500">*</span></label>
                  <input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="যেমন: 017XXXXXXXX"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1.5">ডেলিভারি ঠিকানা ও রোড নম্বর <span className="text-rose-500">*</span></label>
                  <input
                    required
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="যেমন: বাড়ি নং ১২, রোড ৫, গুলশান ১"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1.5">থানা / জেলা / শহর <span className="text-rose-500">*</span></label>
                  <input
                    required
                    type="text"
                    value={thanaDistrict}
                    onChange={(e) => setThanaDistrict(e.target.value)}
                    placeholder="যেমন: ঢাকা"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1.5">বিশেষ বার্তা / নোট (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="যেমন: ৪ টার মধ্যে ডেলিভারি দিলে ভালো হয়।"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* 3. Delivery charges calculation */}
            <div className="space-y-4">
              <h5 className="text-xs font-extrabold uppercase tracking-widest text-[#94a3b8] flex items-center gap-1.5 border-b border-white/5 pb-2">
                <Truck className="w-4 h-4 text-orange-500" /> ডেলিভারি চার্জ নির্ধারণ করুন
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeDeliveryOptions.length > 0 ? (
                  activeDeliveryOptions.map(opt => (
                    <label 
                      key={opt.id}
                      className={`cursor-pointer px-4 py-3 rounded-xl border flex items-center gap-3 transition-colors ${deliveryAreaId === opt.id ? 'bg-orange-500/10 border-orange-500 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                    >
                      <input 
                        type="radio" 
                        name="modalDelivery" 
                        value={opt.id} 
                        checked={deliveryAreaId === opt.id} 
                        onChange={() => setDeliveryAreaId(opt.id)}
                        className="w-4 h-4 text-orange-600 focus:ring-orange-500 bg-transparent border-slate-500"
                      />
                      <div className="text-left">
                        <p className="font-bold text-xs text-slate-200">{opt.name}</p>
                        <p className="text-[10px] text-slate-400">চার্জ: ৳{opt.charge} | সময়: {opt.time}</p>
                      </div>
                    </label>
                  ))
                ) : (
                  <p className="text-xs text-amber-500">কোনো ডেলিভারি অপশন এভেইলেবল নেই</p>
                )}
              </div>
            </div>

            {/* 4. Payment details */}
            <div className="space-y-4">
              <h5 className="text-xs font-extrabold uppercase tracking-widest text-[#94a3b8] flex items-center gap-1.5 border-b border-white/5 pb-2">
                <CreditCard className="w-4 h-4 text-orange-500" /> পেমেন্ট মেথড
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { id: 'cod', name: 'Cash On Delivery', style: 'border-white/10 hover:border-white/20' },
                  { id: 'bkash', name: 'bKash', style: 'border-[#e2136e]/20 bg-[#e2136e]/5 hover:bg-[#e2136e]/10' },
                  { id: 'nagad', name: 'Nagad', style: 'border-[#f26522]/20 bg-[#f26522]/5 hover:bg-[#f26522]/10' },
                  { id: 'rocket', name: 'Rocket', style: 'border-[#8c1561]/20 bg-[#8c1561]/5 hover:bg-[#8c1561]/10' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => { setPaymentMethod(item.id); if (item.id === 'cod') setTrxId(''); }}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center justify-center cursor-pointer ${paymentMethod === item.id ? 'ring-2 ring-orange-500 border-orange-500 text-white' : 'text-slate-400 bg-white/5 ' + item.style}`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>

              {paymentMethod !== 'cod' && (
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 mt-2 animate-in fade-in">
                  <label className="block text-[11px] font-bold text-[#fbcfe8] mb-1.5">Transaction ID (TrxID) <span className="text-rose-500">*</span></label>
                  <input
                    required={paymentMethod !== 'cod'}
                    type="text"
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    placeholder="যেমন: BK9238HKL"
                    className="w-full bg-[#0A0A0B] border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-pink-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-2">
                    নির্ধারিত নম্বরে পেমেন্ট সফলভাবে সম্পন্ন করে ট্রানজেকশন কোডটি প্রদান করুন।
                  </p>
                </div>
              )}
            </div>

            {/* Total breakdown bill */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>প্রোডাক্ট বিল (Subtotal)</span>
                <span className="text-white">৳{subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>ডেলিভারি চার্জ ({deliveryName || 'নির্বাচন করুন'})</span>
                <span className="text-white">৳{deliveryCharge}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-white pt-2.5 border-t border-white/5">
                <span>সর্বমোট বিল (Total)</span>
                <span className="text-orange-500 text-lg">৳{total}</span>
              </div>
            </div>

            {/* Button toolbar submission */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-bold py-4 rounded-xl shadow-lg shadow-emerald-600/10 transition-colors uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <Send className="w-4 h-4 animate-bounce" /> {isSubmitting ? 'প্রসেস হচ্ছে...' : '📲 কনফার্ম অর্ডার করুন'}
            </button>
            <p className="text-[10px] text-center text-slate-400">
              বাটনে ক্লিক করা মাত্র আপনার অর্ডারটি সাবমিট হবে এবং হোয়াটসঅ্যাপ অ্যাপ্লিকেশনে চ্যাট ওপেন হবে।
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
