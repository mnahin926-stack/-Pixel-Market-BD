import React, { useState } from 'react';
import { Plus, Edit2, Trash2, GripVertical, Image as ImageIcon, CheckCircle, XCircle, X } from 'lucide-react';
import { useStore, Category } from '../../store';
import { toast } from 'react-toastify';

export default function AdminCategories() {
  const { categories, addCategory, updateCategory, deleteCategory } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [status, setStatus] = useState<'Active' | 'Hidden'>('Active');
  const [subCatInput, setSubCatInput] = useState('');
  const [subcategories, setSubcategories] = useState<string[]>([]);

  // Sub-category modal states
  const [activeSubcategoryCatId, setActiveSubcategoryCatId] = useState<string | null>(null);
  const [newSubName, setNewSubName] = useState('');

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setImage('');
    setStatus('Active');
    setSubcategories([]);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setImage(cat.image || '');
    setStatus(cat.status);
    setSubcategories(cat.subcategories || []);
    setIsModalOpen(true);
  };

  const handleAddSubcategoryChip = () => {
    if (!subCatInput.trim()) return;
    if (subcategories.includes(subCatInput.trim())) {
      return toast.warning('এই সাব-ক্যাটাগরি ইতোমধ্যে তালিকায় রয়েছে');
    }
    setSubcategories([...subcategories, subCatInput.trim()]);
    setSubCatInput('');
  };

  const removeSubcategoryChip = (subName: string) => {
    setSubcategories(subcategories.filter(s => s !== subName));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      return toast.error('দয়া করে ক্যাটাগরি নাম দিন!');
    }

    const defaultImage = image.trim() || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400';

    if (editingId) {
      updateCategory({
        id: editingId,
        name: name.trim(),
        image: defaultImage,
        status,
        subcategories
      });
      toast.success('ক্যাটাগরি সফলভাবে আপডেট করা হয়েছে!');
    } else {
      addCategory({
        id: `cat-${Date.now()}`,
        name: name.trim(),
        image: defaultImage,
        status,
        subcategories
      });
      toast.success('নতুন ক্যাটাগরি সফলভাবে যোগ করা হয়েছে!');
    }

    setIsModalOpen(false);
  };

  const handleToggleStatus = (cat: Category) => {
    const nextStatus = cat.status === 'Active' ? 'Hidden' : 'Active';
    updateCategory({
      ...cat,
      status: nextStatus
    });
    toast.info(`ক্যাটাগরি এখন ${nextStatus === 'Active' ? 'সক্রিয়' : 'লুকানো'} করা হয়েছে`);
  };

  const handleDelete = (id: string) => {
    deleteCategory(id);
    toast.success('ক্যাটাগরি সফলভাবে ডিলিট করা হয়েছে!');
  };

  const handleDirectAddSub = (catId: string) => {
    if (!newSubName.trim()) return;
    const cat = categories.find(c => c.id === catId);
    if (!cat) return;

    const updatedSubs = [...(cat.subcategories || [])];
    if (updatedSubs.includes(newSubName.trim())) {
      return toast.warning('সাব-ক্যাটাগরি টি ইতিমধ্যে আছে');
    }

    updatedSubs.push(newSubName.trim());
    updateCategory({
      ...cat,
      subcategories: updatedSubs
    });

    toast.success('সাব-ক্যাটাগরি যুক্ত করা হয়েছে!');
    setNewSubName('');
    setActiveSubcategoryCatId(null);
  };

  const handleDirectDeleteSub = (catId: string, subName: string) => {
    const cat = categories.find(c => c.id === catId);
    if (!cat) return;

    updateCategory({
      ...cat,
      subcategories: (cat.subcategories || []).filter(s => s !== subName)
    });
    toast.success('সাব-ক্যাটাগরি সরানো হয়েছে!');
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">ক্যাটাগরি ম্যানেজমেন্ট</h2>
          <p className="text-slate-500 text-sm mt-1">ওয়েবসাইটের প্রোডাক্ট ক্যাটাগরি ও সাব-ক্যাটাগরি নিয়ন্ত্রণ করুন</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-medium transition-colors shadow-lg shadow-indigo-600/20 cursor-pointer"
        >
          <Plus className="w-5 h-5" /> নতুন ক্যাটাগরি
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {categories.length > 0 ? (
          categories.map((cat) => (
            <div key={cat.id} className="bg-white border border-slate-150 rounded-2xl shadow-sm overflow-hidden text-slate-800">
              <div className="bg-slate-50/70 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-200 rounded-xl overflow-hidden border border-slate-205 flex items-center justify-center text-slate-400">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                      {cat.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${cat.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {cat.status === 'Active' ? 'Active' : 'Hidden'}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">
                        {(cat.subcategories || []).length} Sub-categories
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button 
                    onClick={() => openEditModal(cat)}
                    className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer" 
                    title="Edit Category Info"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleToggleStatus(cat)}
                    className="p-2 text-slate-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors cursor-pointer" 
                    title="Change Visibility"
                  >
                    {cat.status === 'Active' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => handleDelete(cat.id)}
                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer" 
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Subcategories view */}
              <div className="p-5 bg-white space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">সাব-ক্যাটাগরিসমূহ</h4>
                  
                  {activeSubcategoryCatId === cat.id ? (
                    <div className="flex gap-2 items-center">
                      <input 
                        type="text" 
                        placeholder="যেমন: লেদার বেল্ট" 
                        value={newSubName} 
                        onChange={(e) => setNewSubName(e.target.value)}
                        className="border border-slate-200 px-3 py-1 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                      />
                      <button 
                        onClick={() => handleDirectAddSub(cat.id)}
                        className="bg-indigo-600 text-white px-3 py-1 text-xs rounded-lg font-bold"
                      >
                        Add
                      </button>
                      <button 
                        onClick={() => setActiveSubcategoryCatId(null)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => { setActiveSubcategoryCatId(cat.id); setNewSubName(''); }}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> সাব-ক্যাটাগরি যোগ করুন
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {(cat.subcategories && cat.subcategories.length > 0) ? (
                    cat.subcategories.map((sub, index) => (
                      <div key={index} className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 hover:bg-slate-100 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 transition-colors group">
                        <span>{sub}</span>
                        <button 
                          onClick={() => handleDirectDeleteSub(cat.id, sub)}
                          className="hover:text-red-500 opacity-60 hover:opacity-100 ml-1 transition-opacity cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 py-2">কোনো সাব-ক্যাটাগরি পাওয়া যায়নি</span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 shadow-sm text-slate-400">
            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            কোনো ক্যাটাগরি পাওয়া যায়নি।
          </div>
        )}
      </div>

      {/* Category Creation / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 relative shadow-2xl text-slate-800 animate-in fade-in">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h3 className="text-xl font-bold text-slate-900 mb-6">
              {editingId ? 'ক্যাটাগরি এডিট করুন' : 'নতুন ক্যাটাগরি যুক্ত করুন'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1.5 font-bold">ক্যাটাগরি নাম (বাংলা)</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="যেমন: ব্লুটুথ স্পিকার"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-805"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1.5 font-bold">ক্যাটাগরি ছবি URL</label>
                <input 
                  type="text" 
                  value={image} 
                  onChange={(e) => setImage(e.target.value)} 
                  placeholder="যেমন: https://images.unsplash.com/..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-805"
                />
                <p className="text-[10px] text-slate-400 mt-1">খালি থকে গেলে একটি আকর্ষণীয় ডিফল্ট ছবি সেট করা হবে।</p>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1.5 font-bold">স্ট্যাটাস</label>
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value as 'Active' | 'Hidden')}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-805"
                >
                  <option value="Active">Active (সক্রিয়)</option>
                  <option value="Hidden">Hidden (লুকানো)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1.5 font-bold">সাব-ক্যাটাগরিসমূহ যোগ করুন</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={subCatInput} 
                    onChange={(e) => setSubCatInput(e.target.value)} 
                    placeholder="যেমন: মেটাল স্ট্র্যাপ"
                    className="flex-1 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-805"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubcategoryChip();
                      }
                    }}
                  />
                  <button 
                    type="button" 
                    onClick={handleAddSubcategoryChip}
                    className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-850 cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mt-3 p-2 bg-slate-50 rounded-xl border border-slate-100 min-h-[50px]">
                  {subcategories.length > 0 ? (
                    subcategories.map((sub, i) => (
                      <span key={i} className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700">
                        {sub}
                        <button 
                          type="button" 
                          onClick={() => removeSubcategoryChip(sub)}
                          className="text-slate-400 hover:text-red-500 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-405 self-center mx-auto">কোনো সাব-ক্যাটাগরি যুক্ত করা হয়নি</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="border border-slate-200 text-slate-500 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button 
                  type="submit"
                  className="bg-indigo-650 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md cursor-pointer"
                >
                  {editingId ? 'আপডেট' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
