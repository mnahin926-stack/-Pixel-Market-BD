import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store';
import { ShoppingBag, ArrowLeft, Heart, Share2, Check, MessageSquare, Send } from 'lucide-react';
import { toast } from 'react-toastify';
import WhatsAppCheckoutModal from '../components/ui/WhatsAppCheckoutModal';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const products = useStore(state => state.products);
  const addToCart = useStore(state => state.addToCart);
  const wishlist = useStore(state => state.wishlist);
  const toggleWishlist = useStore(state => state.toggleWishlist);
  const reviews = useStore(state => state.reviews) || [];
  const addReview = useStore(state => state.addReview);
  
  const product = products.find(p => p.id === id);
  const inWishlist = product ? wishlist.some(p => p.id === product.id) : false;

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  // Review state
  const [revName, setRevName] = useState('');
  const [revEmail, setRevEmail] = useState('');
  const [revRating, setRevRating] = useState(5);
  const [revComment, setRevComment] = useState('');

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (!revName.trim() || !revEmail.trim() || !revComment.trim()) {
      return toast.error('দয়া করে সব ঘর ঠিকমতো পূরণ করুন!');
    }
    
    addReview({
      id: `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      productId: product.id,
      productName: product.name,
      reviewerName: revName,
      reviewerEmail: revEmail,
      rating: revRating,
      comment: revComment,
      status: 'Pending',
      date: new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })
    });
    
    toast.success('আপনার রিভিউ জমা হয়েছে! এডমিন কনফার্মেশন এর পর এটি প্রকাশিত হবে।');
    setRevName('');
    setRevEmail('');
    setRevRating(5);
    setRevComment('');
  };

  useEffect(() => {
    if (product) {
       setSelectedSize(product.sizes?.[0] || '');
       setSelectedColor(product.colors?.[0] || '');
       setActiveImage(0);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Product Not Found</h2>
        <Link to="/shop" className="text-orange-500 hover:text-orange-400">Return to Shop</Link>
      </div>
    );
  }

  const allImages = product.images && product.images.length > 0 ? product.images : [product.image];
  const discountPercentage = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  const handleOrder = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error('দয়া করে সাইজ সিলেক্ট করুন');
      return;
    }
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast.error('দয়া করে কালার সিলেক্ট করুন');
      return;
    }
    addToCart(product, quantity, selectedSize, selectedColor);
    toast.success(`${product.name} কার্টে যোগ করা হয়েছে!`);
    navigate('/checkout');
  };

  const handleWhatsAppQuickOrder = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error('দয়া করে সাইজ সিলেক্ট করুন');
      return;
    }
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast.error('দয়া করে কালার সিলেক্ট করুন');
      return;
    }
    setIsWhatsAppModalOpen(true);
  };

  const handleAddToCart = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error('দয়া করে সাইজ সিলেক্ট করুন');
      return;
    }
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast.error('দয়া করে কালার সিলেক্ট করুন');
      return;
    }
    addToCart(product, quantity, selectedSize, selectedColor);
    toast.success(`${product.name} কার্টে যোগ করা হয়েছে!`);
  };

  return (
    <div className="py-8 animate-in fade-in">
      <Link to="/shop" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> <span>Back to Shop</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images Section */}
        <div className="space-y-4">
          <div className="aspect-square bg-[#111113] rounded-3xl overflow-hidden border border-white/5 relative">
            <img src={allImages[activeImage]} alt={product.name} className="w-full h-full object-cover" />
            {discountPercentage > 0 && (
              <div className="absolute top-4 left-4 bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                {discountPercentage}% OFF
              </div>
            )}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button 
                onClick={() => { toggleWishlist(product); toast.success(inWishlist ? 'উইশলিস্ট থেকে সরানো হয়েছে' : 'উইশলিস্টে যোগ করা হয়েছে!'); }}
                className="w-10 h-10 bg-black/40 backdrop-blur text-white hover:bg-black/60 rounded-full flex items-center justify-center transition-colors border border-white/10"
              >
                 <Heart className={`w-5 h-5 ${inWishlist ? 'fill-orange-500 text-orange-500' : ''}`} />
              </button>
              <button className="w-10 h-10 bg-black/40 backdrop-blur text-white hover:bg-black/60 rounded-full flex items-center justify-center transition-colors border border-white/10">
                 <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          {allImages.length > 1 && (
            <div className="grid grid-cols-5 gap-3">
              {allImages.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveImage(idx)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-orange-500 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt={`${product.name} view ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="flex flex-col">
          <div className="mb-2">
            <span className="text-orange-500 font-bold tracking-widest text-xs uppercase">{product.category}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4">{product.name}</h1>
          
          <div className="flex items-end gap-4 mb-8">
            <div className="text-4xl font-bold text-white">৳{product.price}</div>
            {product.originalPrice && (
              <div className="text-xl text-slate-500 line-through mb-1">৳{product.originalPrice}</div>
            )}
          </div>

          <div className="space-y-6 mb-10 pb-10 border-b border-white/10">
            {/* Stock status */}
            <div className="flex items-center gap-2 text-sm">
               {product.stock > 0 ? (
                 <span className="inline-flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full font-medium">
                   <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                   In Stock ({product.stock} available)
                 </span>
               ) : (
                 <span className="inline-flex items-center gap-1.5 text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-full font-medium">
                   <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                   Out of Stock
                 </span>
               )}
            </div>

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-3">Color</h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map(color => (
                    <button 
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${selectedColor === color ? 'bg-orange-600 border-orange-500 text-white' : 'bg-transparent border-white/20 text-slate-400 hover:border-white/40'}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-3">Size</h3>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map(size => (
                    <button 
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 rounded-xl border flex items-center justify-center font-bold transition-all ${selectedSize === size ? 'bg-orange-600 border-orange-500 text-white' : 'bg-transparent border-white/20 text-slate-400 hover:border-white/40'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
               <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-3">Quantity</h3>
               <div className="flex items-center gap-4">
                  <div className="flex items-center border border-white/20 rounded-xl bg-white/5 p-1">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-white"
                    >-</button>
                    <div className="w-12 text-center font-bold text-white">{quantity}</div>
                    <button 
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-white"
                    >+</button>
                  </div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            <button 
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl font-bold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" /> Add to Cart
            </button>
            <button 
              onClick={handleOrder}
              disabled={product.stock === 0}
              className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(234,88,12,0.3)] disabled:opacity-50 cursor-pointer"
            >
              Buy it Now
            </button>
            <button 
              onClick={handleWhatsAppQuickOrder}
              disabled={product.stock === 0}
              className="sm:col-span-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-extrabold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(16,185,129,0.35)] disabled:opacity-50 flex items-center justify-center gap-2 text-sm md:text-base cursor-pointer hover:scale-[1.01]"
              id="product-details-wa-btn"
            >
              📲 WhatsApp এ সরাসরি অর্ডার
            </button>
          </div>

          <div>
             <h3 className="text-lg font-bold text-white mb-4">Product Description</h3>
             <div className="text-slate-400 leading-relaxed space-y-4">
               {product.description.split('\n').map((para, idx) => (
                 <p key={idx}>{para}</p>
               ))}
             </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Order Button Bar at Bottom */}
      {product.stock > 0 && (
        <div className="md:hidden fixed bottom-[55px] left-0 w-full bg-[#0A0A0B]/95 backdrop-blur-lg border-t border-white/10 z-40 px-4 py-3 flex items-center justify-between gap-3 shadow-2xl">
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold font-sans">দাম (Price)</span>
            <span className="text-white text-lg font-extrabold font-sans">৳{product.price * quantity}</span>
          </div>
          <button
            onClick={handleWhatsAppQuickOrder}
            className="bg-emerald-600 hover:bg-emerald-505 text-white text-xs font-black px-5 py-3 rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-600/10 active:scale-95 cursor-pointer uppercase tracking-wider"
          >
            📲 WhatsApp Order
          </button>
        </div>
      )}

      {/* WhatsApp Quick Checkout Form Modal */}
      <WhatsAppCheckoutModal 
        product={product}
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        initialSize={selectedSize}
        initialColor={selectedColor}
        initialQuantity={quantity}
      />
    </div>
  );
}
