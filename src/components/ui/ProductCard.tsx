import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Star } from 'lucide-react';
import { toast } from 'react-toastify';
import { Product } from '../../data';
import { useStore } from '../../store';

interface ProductCardProps {
  key?: React.Key;
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addToCart = useStore((state) => state.addToCart);
  const toggleWishlist = useStore((state) => state.toggleWishlist);
  const wishlist = useStore((state) => state.wishlist);
  const isDarkMode = useStore((state) => state.isDarkMode);
  const navigate = useNavigate();
  
  const inWishlist = wishlist.some(p => p.id === product.id);

  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');

  const handleOrder = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error('দয়া করে সাইজ সিলেক্ট করুন');
      return;
    }
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast.error('দয়া করে কালার সিলেক্ট করুন');
      return;
    }
    
    addToCart(product, 1, selectedSize, selectedColor);
    toast.success(`${product.name} কার্টে যোগ করা হয়েছে!`);
    navigate('/checkout');
  };

  return (
    <div className="group bg-white dark:bg-[#111113]/85 backdrop-blur-md border border-slate-150 dark:border-white/10 rounded-2xl md:rounded-[24px] overflow-hidden flex flex-col hover:border-orange-500/50 dark:hover:border-orange-500/50 hover:shadow-[0_10px_30px_rgba(249,115,22,0.15)] hover:-translate-y-1.5 transition-all duration-300">
      <Link to={`/product/${product.id}`} className="relative aspect-square overflow-hidden bg-slate-50 dark:bg-white/5 block">
        <img
          src={product.images && product.images.length > 0 ? product.images[0] : product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {product.originalPrice && product.originalPrice > product.price && (
          <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-gradient-to-r from-orange-600 to-amber-500 text-white text-[9px] md:text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% ছাড়
          </div>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
            toast.success(inWishlist ? 'উইশলিস্ট থেকে সরানো হয়েছে' : 'উইশলিস্টে যোগ করা হয়েছে!');
          }}
          className="absolute top-2 right-2 md:top-3 md:right-3 w-8 h-8 md:w-9 md:h-9 bg-black/40 hover:bg-rose-600/20 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-lg z-10 hover:scale-110"
        >
          <Heart className={`w-4 h-4 transition-all duration-300 ${inWishlist ? 'fill-rose-500 text-rose-500 filter drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 'text-white'}`} />
        </button>
      </Link>
      
      <div className="p-3 md:p-5 flex flex-col flex-grow">
        <div className="text-[10px] md:text-xs font-bold text-orange-500 uppercase tracking-widest mb-1.5 opacity-90 truncate">{product.category}</div>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-bold text-slate-800 dark:text-white text-xs md:text-base mb-2 line-clamp-2 leading-snug hover:text-orange-500 dark:hover:text-orange-500 transition-colors" title={product.name}>
            {product.name}
          </h3>
        </Link>

        {/* Brand Rating placeholder */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <div className="flex text-amber-500">
            {Array.from({ length: 5 }).map((_, r) => (
              <Star key={r} className="w-3 h-3 fill-current text-amber-500" />
            ))}
          </div>
          <span className="text-[10px] text-slate-400 font-bold">5.0</span>
        </div>
        
        {/* Variants Selection is now only shown inside Product details as requested */}
        
        <div className="mt-auto pt-2 flex items-center gap-2 mb-4">
          <span className="text-sm md:text-xl font-black text-slate-900 dark:text-white">৳{product.price}</span>
          {product.originalPrice && (
            <span className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500 line-through">৳{product.originalPrice}</span>
          )}
        </div>
        
        <div className="mt-auto grid grid-cols-2 gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              addToCart(product, 1, selectedSize, selectedColor);
              toast.success(`${product.name} কার্টে যোগ করা হয়েছে!`);
            }}
            className="w-full flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[9px] md:text-xs transition-colors border border-transparent dark:border-white/5 active:scale-95"
            title="Add to Cart"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              handleOrder();
            }}
            className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-orange-600 to-amber-500 hover:shadow-[0_0_15px_rgba(249,115,22,0.3)] text-white py-2.5 rounded-xl font-bold uppercase tracking-widest text-[9px] md:text-xs transition-all active:scale-95"
          >
            Buy
          </button>
        </div>
      </div>
    </div>
  );
}
