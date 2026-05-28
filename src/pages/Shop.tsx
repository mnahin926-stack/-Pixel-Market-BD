import { useState, useMemo } from 'react';
import ProductCard from '../components/ui/ProductCard';
import { useStore } from '../store';
import { Search, SlidersHorizontal } from 'lucide-react';

export default function Shop() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, price-low, price-high
  const [showFilters, setShowFilters] = useState(false);
  const products = useStore((state) => state.products);
  const categories = useStore((state) => state.categories) || [];
  
  const filteredProducts = useMemo(() => {
    let result = products;

    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
    }

    if (sortBy === 'price-low') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="py-4">
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white">আমাদের সকল প্রোডাক্ট</h1>
          
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                placeholder="প্রোডাক্ট খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-orange-500 text-white text-sm"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden p-3 bg-white/5 border border-white/10 rounded-2xl text-slate-300"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Category Filters Mobile Optimized */}
        <div className={`flex flex-col lg:flex-row gap-4 mb-8 lg:items-center justify-between ${showFilters ? 'block' : 'hidden lg:flex'}`}>
          <div className="flex overflow-x-auto hide-scrollbar gap-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-6 py-3 rounded-2xl font-bold uppercase tracking-widest transition-colors text-xs whitespace-nowrap flex-shrink-0 ${
                selectedCategory === 'all' 
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' 
                  : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
              }`}
            >
              All Products
            </button>
            
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-6 py-3 rounded-2xl font-bold uppercase tracking-widest transition-colors text-xs whitespace-nowrap flex-shrink-0 ${
                  selectedCategory === cat.name 
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' 
                    : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex-shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full lg:w-auto px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-slate-300 text-sm focus:outline-none focus:border-orange-500 appearance-none cursor-pointer"
            >
              <option value="newest" className="bg-slate-900">Newest Arrivals</option>
              <option value="price-low" className="bg-slate-900">Price: Low to High</option>
              <option value="price-high" className="bg-slate-900">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4 px-2 sm:px-0">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-20 bg-white/5 rounded-[32px] border border-white/10 mt-8">
            <h3 className="text-lg font-bold text-white mb-2">কোনো প্রোডাক্ট পাওয়া যায়নি</h3>
            <p className="text-slate-400">দয়া করে অন্য ক্যাটাগরি সিলেক্ট করুন।</p>
          </div>
        )}
      </div>
    </div>
  );
}
