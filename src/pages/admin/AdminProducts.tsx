import React, { useState, useRef } from 'react';
import { Plus, X, Upload, Save, Check, Image as ImageIcon } from 'lucide-react';
import { useStore } from '../../store';
import { Product } from '../../data';
import { toast } from 'react-toastify';

export default function AdminProducts() {
  const products = useStore((state) => state.products);
  const categories = useStore((state) => state.categories);
  const addProduct = useStore((state) => state.addProduct);
  const updateProduct = useStore((state) => state.updateProduct);
  const deleteProduct = useStore((state) => state.deleteProduct);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: categories[0]?.name || 'স্মার্ট ঘড়ি',
    price: 0,
    originalPrice: 0,
    image: '',
    images: [],
    description: '',
    stock: 0,
    sizes: [],
    colors: []
  });

  const [sizeInput, setSizeInput] = useState('');
  const [colorInput, setColorInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddSize = () => {
    if (sizeInput.trim() && !formData.sizes?.includes(sizeInput.trim())) {
      setFormData({ ...formData, sizes: [...(formData.sizes || []), sizeInput.trim()] });
      setSizeInput('');
    }
  };

  const handleAddColor = () => {
    if (colorInput.trim() && !formData.colors?.includes(colorInput.trim())) {
      setFormData({ ...formData, colors: [...(formData.colors || []), colorInput.trim()] });
      setColorInput('');
    }
  };

  const removeSize = (size: string) => {
    setFormData({ ...formData, sizes: formData.sizes?.filter(s => s !== size) });
  };

  const removeColor = (color: string) => {
    setFormData({ ...formData, colors: formData.colors?.filter(c => c !== color) });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    files.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index)
    }));
  };

  const handleStartEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      originalPrice: product.originalPrice || 0,
      image: product.image || '',
      images: product.images || [product.image].filter(Boolean),
      description: product.description || '',
      stock: product.stock,
      sizes: product.sizes || [],
      colors: product.colors || []
    });
    setIsAdding(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      toast.error('দয়া করে প্রয়োজনীয় তথ্য প্রদান করুন (নাম, মূল্য)');
      return;
    }
    
    const allImages = formData.images || [];
    if (allImages.length === 0 && !formData.image) {
      toast.error('দয়া করে অন্তত একটি ছবি যোগ করুন');
      return;
    }

    const mainImage = allImages.length > 0 ? allImages[0] : (formData.image || '');

    const defaultCat = categories[0]?.name || 'স্মার্ট ঘড়ি';

    if (editingId) {
      const updatedProduct: Product = {
        id: editingId,
        name: formData.name,
        category: formData.category || defaultCat,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        image: mainImage,
        images: allImages,
        description: formData.description || '',
        stock: Number(formData.stock),
        sizes: formData.sizes?.length ? formData.sizes : undefined,
        colors: formData.colors?.length ? formData.colors : undefined
      };
      updateProduct(updatedProduct);
      toast.success('প্রোডাক্ট সফলভাবে আপডেট করা হয়েছে!');
    } else {
      const newProduct: Product = {
        id: Date.now().toString(),
        name: formData.name,
        category: formData.category || defaultCat,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        image: mainImage,
        images: allImages,
        description: formData.description || '',
        stock: Number(formData.stock),
        sizes: formData.sizes?.length ? formData.sizes : undefined,
        colors: formData.colors?.length ? formData.colors : undefined
      };
      addProduct(newProduct);
      toast.success('প্রোডাক্ট সফলভাবে যোগ করা হয়েছে!');
    }
    setIsAdding(false);
    setEditingId(null);
    
    // Reset
    setFormData({
      name: '',
      category: defaultCat,
      price: 0,
      originalPrice: 0,
      image: '',
      images: [],
      description: '',
      stock: 0,
      sizes: [],
      colors: []
    });
  };

  if (isAdding) {
    return (
      <div className="space-y-6 animate-in fade-in">
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">
            {editingId ? 'প্রোডাক্ট এডিটিং প্যানেল' : 'নতুন প্রোডাক্ট যোগ করুন'}
          </h2>
          <button 
            onClick={() => {
              setIsAdding(false);
              setEditingId(null);
            }}
            className="text-slate-500 hover:bg-slate-100 p-2 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">প্রোডাক্টের নাম *</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900"
                  placeholder="যেমন: T55 Smart Watch"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">বর্তমান মূল্য (৳) *</label>
                  <input
                    required
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">পূর্বের মূল্য (৳) (Discount)</label>
                  <input
                    type="number"
                    value={formData.originalPrice || ''}
                    onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ক্যাটাগরি</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  >
                    {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">স্টক (Quantity)</label>
                  <input
                    type="number"
                    value={formData.stock || ''}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">বর্ণনা</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 h-32"
                ></textarea>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">প্রোডাক্টের ছবিসমূহ (একাধিক ছবি আপলোড করতে পারবেন) *</label>
                <div 
                  className="border-2 border-dashed border-indigo-200 rounded-2xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer bg-slate-50/50"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files) {
                      handleFiles(Array.from(e.dataTransfer.files));
                    }
                  }}
                >
                  <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-700">ক্লিক করুন অথবা ছবি টেনে আনুন</p>
                  <p className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP (সর্বোচ্চ ৫টি ছবি)</p>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileChange} 
                  />
                </div>
                
                {formData.images && formData.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {formData.images.map((img, index) => (
                      <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
                        <img src={img} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <button 
                             type="button"
                             onClick={() => removeImage(index)}
                             className="bg-white/90 p-1.5 rounded-full text-red-600 hover:bg-white"
                           >
                             <X className="w-4 h-4" />
                           </button>
                        </div>
                        {index === 0 && (
                          <div className="absolute top-2 left-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                            Main
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-4 flex gap-2">
                  <div className="flex-1 shrink-0 overflow-hidden text-ellipsis whitespace-nowrap">
                    <p className="text-xs text-slate-500 font-medium mb-1">অথবা ছবির URL দিন:</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.image || ''}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                        placeholder="https://..."
                      />
                      <button 
                        type="button" 
                        onClick={() => {
                          if (formData.image) {
                            setFormData(prev => ({
                              ...prev,
                              images: [...(prev.images || []), formData.image || ''],
                              image: '' // reset input
                            }));
                          }
                        }}
                        className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200"
                      >
                        Add URL
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">সাইজ ভেরিয়েন্ট (Optional)</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={sizeInput}
                  onChange={(e) => setSizeInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSize())}
                  className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-900"
                  placeholder="যেমন: M, L, XL"
                />
                <button type="button" onClick={handleAddSize} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200">
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.sizes?.map(size => (
                  <span key={size} className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                    {size}
                    <button type="button" onClick={() => removeSize(size)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">কালার ভেরিয়েন্ট (Optional)</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddColor())}
                  className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-900"
                  placeholder="যেমন: Black, Red"
                />
                <button type="button" onClick={handleAddColor} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200">
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.colors?.map(color => (
                  <span key={color} className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                    {color}
                    <button type="button" onClick={() => removeColor(color)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => setIsAdding(false)}
              className="px-6 py-2 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-600/20"
            >
              <Save className="w-4 h-4" /> Save Product
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">প্রোডাক্ট ম্যানেজমেন্ট</h2>
          <p className="text-slate-500 text-sm mt-1">সর্বমোট {products.length} টি প্রোডাক্ট আছে</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-medium transition-colors shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-5 h-5" /> নতুন প্রোডাক্ট যোগ করুন
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-900 font-medium border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">ছবি</th>
                <th className="px-6 py-4">নাম</th>
                <th className="px-6 py-4">ক্যাটাগরি</th>
                <th className="px-6 py-4">মূল্য</th>
                <th className="px-6 py-4">স্টক</th>
                <th className="px-6 py-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                      <img src={product.images && product.images.length > 0 ? product.images[0] : product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900 max-w-[200px] truncate">{product.name}</td>
                  <td className="px-6 py-4">{product.category}</td>
                  <td className="px-6 py-4">
                    ৳{product.price}
                    {product.originalPrice && <span className="text-xs text-slate-400 line-through ml-2">৳{product.originalPrice}</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${product.stock > 10 ? 'bg-green-100 text-green-700' : product.stock > 0 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                      {product.stock > 0 ? `${product.stock} পিস` : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button 
                      onClick={() => {
                        setEditingId(product.id);
                        setFormData({
                          name: product.name,
                          category: product.category,
                          price: product.price,
                          originalPrice: product.originalPrice || 0,
                          image: product.image,
                          images: product.images || [],
                          description: product.description || '',
                          stock: product.stock,
                          sizes: product.sizes || [],
                          colors: product.colors || []
                        });
                        setIsAdding(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => {
                        deleteProduct(product.id);
                        toast.success('প্রোডাক্টটি সফলভাবে ডিলিট করা হয়েছে!');
                      }} 
                      className="text-red-500 hover:text-red-700 font-medium cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                    কোনো প্রোডাক্ট পাওয়া যায়নি। নতুন প্রোডাক্ট যোগ করুন।
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
