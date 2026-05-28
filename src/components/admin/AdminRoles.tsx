import React, { useState } from 'react';
import { ShieldCheck, Plus, Check, X, Edit2, ShieldAlert } from 'lucide-react';
import { useStore, StaffRole } from '../../store';
import { toast } from 'react-toastify';

export default function AdminRoles() {
  const { roles, addStaff, updateStaff, deleteStaff } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states matching StaffRole
  const [sName, setSName] = useState('');
  const [sEmail, setSEmail] = useState('');
  const [sRole, setSRole] = useState<'Administrator' | 'Manager' | 'Support Agent' | 'Editor'>('Manager');
  const [sStatus, setSStatus] = useState<'Active' | 'Inactive'>('Active');
  const [rPermissions, setRPermissions] = useState<string[]>([]);

  const togglePermission = (perm: string) => {
    if (rPermissions.includes(perm)) {
      setRPermissions(rPermissions.filter(p => p !== perm));
    } else {
      setRPermissions([...rPermissions, perm]);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setSName('');
    setSEmail('');
    setSRole('Manager');
    setSStatus('Active');
    setRPermissions([]);
    setIsModalOpen(true);
  };

  const openEditModal = (st: StaffRole) => {
    setEditingId(st.id);
    setSName(st.name);
    setSEmail(st.email);
    setSRole(st.role);
    setSStatus(st.status);
    setRPermissions(st.permissions || []);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sName.trim() || !sEmail.trim()) {
      return toast.error('দয়া করে স্টাফ নাম এবং সঠিক ইমেইল দিন!');
    }

    const payload: StaffRole = {
      id: editingId || `st-${Date.now()}`,
      name: sName.trim(),
      email: sEmail.trim(),
      role: sRole,
      status: sStatus,
      permissions: rPermissions
    };

    if (editingId) {
      updateStaff(payload);
      toast.success('স্টাফ চমৎকারভাবে আপডেট হয়েছে!');
    } else {
      addStaff(payload);
      toast.success('নতুন কর্মকর্তা সফলভাবে যুক্ত হয়েছে!');
    }
    setIsModalOpen(false);
  };

  const handleDeleteStaff = (id: string) => {
    deleteStaff(id);
    toast.success('কর্মকর্তা সফলভাবে অপসারিত হয়েছেন।');
  };

  const allPermissionsList = [
    { id: 'all', desc: 'সর্বোচ্চ ক্ষমতা (Full Control Over Admin Panels)' },
    { id: 'products', desc: 'প্রোডাক্ট ক্রিয়েট, এডিট এবং ডিলিট করার সুবিধা' },
    { id: 'categories', desc: 'ক্যাটাগরি কন্টেন্ট এবং সাবক্যাটাগরি নিয়ন্ত্রণ' },
    { id: 'orders', desc: 'অর্ডারস লজিস্টিকস এবং স্ট্যাটাস এডিটস' },
    { id: 'marketing', desc: 'কুপন কোড ক্যাম্পেইন ও হোম স্লাইডার ব্যানারস' },
    { id: 'customers', desc: 'কাস্টমারদের অ্যাকাউন্ট ব্যান বা ব্লক করার পাওয়ার' },
    { id: 'live-chat', desc: 'লাইভ চ্যাট এ গ্রাহকের সাথে সংযুক্ত হওয়া' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in text-slate-800 max-w-5xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm col-span-full">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-sans">স্টাফ রোল ও পারমিশন গেটওয়ে</h2>
          <p className="text-slate-500 text-sm mt-1">আপনার কর্মকর্তা এবং ম্যানেজারদের জন্য কাস্টম অ্যাডমিন প্যানেল অফার পারমিশন পরিচালনা করুন</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold transition-colors shadow-lg shadow-indigo-600/20 cursor-pointer text-sm"
        >
          <Plus className="w-5 h-5" /> নতুন স্টাফ যুক্ত করুন
        </button>
      </div>

      {/* Staff Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((rl) => (
          <div key={rl.id} className="bg-white border border-slate-150 rounded-2xl shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-120 flex items-center justify-center text-indigo-750">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${
                  rl.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {rl.status}
                </span>
              </div>
              <h3 className="font-extrabold text-slate-950 text-base">{rl.name}</h3>
              <p className="text-xs text-indigo-600 font-bold font-mono mt-0.5">{rl.email}</p>
              <div className="mt-2.5 bg-slate-100/50 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 inline-block">
                Role Username: {rl.role}
              </div>
              
              <div className="mt-5 pt-4 border-t border-slate-100">
                <span className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-2 font-sans">অনুমতিসমূহ (Permissions):</span>
                <div className="flex flex-wrap gap-1">
                  {rl.permissions && rl.permissions.length > 0 ? (
                    rl.permissions.map((perm) => (
                      <span key={perm} className="text-[10px] bg-indigo-50 text-indigo-750 font-bold border border-indigo-100 px-1.5 py-0.5 rounded-md">
                        {perm}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-rose-500 italic font-medium">কোনো পারমিশন দেওয়া হয়নি</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button 
                onClick={() => openEditModal(rl)}
                className="flex-1 text-center py-2 bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                এডিট
              </button>
              <button 
                onClick={() => handleDeleteStaff(rl.id)}
                className="flex-1 text-center py-2 border border-rose-100 hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                মুছে ফেলুন
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Role Creation/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 relative shadow-2xl text-slate-800 animate-in zoom-in max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h3 className="text-xl font-bold text-slate-900 mb-6 font-sans">
              {editingId ? 'রোলের পারমিশন পরিবর্তন করুন' : 'নতুন স্টাফ রোল ও নিরাপত্তা পারমিশন'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1.5 font-bold">নাম (Officer Name)</label>
                <input 
                  type="text" 
                  value={sName} 
                  onChange={(e) => setSName(e.target.value)} 
                  placeholder="যেমন: সাকিব হাসান"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-805"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1.5 font-bold">ইমেইল অ্যাড্রেস</label>
                <input 
                  type="email" 
                  value={sEmail} 
                  onChange={(e) => setSEmail(e.target.value)} 
                  placeholder="sakib@premium-market.tech"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-805 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1.5 font-bold font-sans">ডিফল্ট রোল টাইপ</label>
                  <select 
                    value={sRole} 
                    onChange={(e) => setSRole(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-805"
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Manager">Manager</option>
                    <option value="Support Agent">Support Agent</option>
                    <option value="Editor">Editor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1.5 font-bold font-sans">স্ট্যাটাস</label>
                  <select 
                    value={sStatus} 
                    onChange={(e) => setSStatus(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-805"
                  >
                    <option value="Active">Active (সক্রিয়)</option>
                    <option value="Inactive">Inactive (নিষ্ক্রিয়)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 mb-2.5 font-bold font-sans">নিরাপত্তা পারমিশন নির্ধারণ করুন (Permission List)</label>
                <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-150 max-h-[220px] overflow-y-auto">
                  {allPermissionsList.map((p) => {
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => togglePermission(p.id)}
                        className={`w-full flex items-center justify-between text-left p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                          rPermissions.includes(p.id)
                            ? 'bg-indigo-50/50 border-indigo-250 text-indigo-900'
                            : 'bg-white border-slate-200 text-slate-750 hover:bg-slate-100/40'
                        }`}
                      >
                        <div>
                          <p className="font-extrabold uppercase tracking-wider text-indigo-750 text-[10px]">{p.id}</p>
                          <p className="text-slate-500 mt-0.5 leading-relaxed font-bangla">{p.desc}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-lg flex items-center justify-center border-2 transition-all ${
                          rPermissions.includes(p.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-100 border-slate-300'
                        }`}>
                          {rPermissions.includes(p.id) && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-6 font-bangla">
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
                  {editingId ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
