import React, { useState } from 'react';
import { MessageSquare, Check, Trash2, ShieldAlert, Star, Eye } from 'lucide-react';
import { useStore, Review } from '../../store';
import { toast } from 'react-toastify';

export default function AdminReviews() {
  const { reviews, approveReview, deleteReview } = useStore();
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Approved'>('All');

  const handleApprove = (id: string, reviewer: string) => {
    approveReview(id);
    toast.success(`কাস্টমার '${reviewer}' এর রিভিউ সফলতা সাথে অ্যাপ্রুভ করা হয়েছে!`);
  };

  const handleDelete = (id: string) => {
    deleteReview(id);
    toast.success('রিভিউ সফলভাবে মুছে ফেলা হয়েছে।');
  };

  const filteredReviews = reviews.filter((rev) => {
    if (filter === 'All') return true;
    return rev.status === filter;
  });

  return (
    <div className="space-y-6 animate-in fade-in text-slate-800 max-w-5xl">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm col-span-full">
        <h2 className="text-2xl font-bold text-slate-900">রিভিউ ও রেটিং মডারেশন</h2>
        <p className="text-slate-500 text-sm mt-1">গ্রাহকদের সাবমিট করা মতামত ও প্রোডাক্ট রিভিউর মান যাচাই বা অনুমোদন করুন</p>
      </div>

      {/* Tabs navigation */}
      <div className="flex bg-white rounded-xl border border-slate-100 p-1 w-max">
        {['All', 'Pending', 'Approved'].map((t) => {
          const count = t === 'All' ? reviews.length : reviews.filter(r => r.status === t).length;
          return (
            <button
              key={t}
              onClick={() => setFilter(t as any)}
              className={`px-6 py-2 rounded-lg text-sm font-bold cursor-pointer transition-all flex items-center gap-2 ${
                filter === t ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>{t === 'All' ? 'সব রিভিউ' : t === 'Pending' ? 'অপেক্ষমাণ (Pending)' : 'অনুমোদিত (Approved)'}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === t ? 'bg-indigo-650 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Reviews feed */}
      <div className="grid grid-cols-1 gap-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((rev) => (
            <div key={rev.id} className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition-shadow">
              
              {/* Left Comment Info */}
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-150 flex items-center justify-center font-bold text-indigo-700 text-lg uppercase">
                    {rev.reviewerName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">{rev.reviewerName}</h3>
                    <p className="text-xs text-slate-450">{rev.reviewerEmail} • {rev.date || 'আজ'}</p>
                  </div>
                </div>

                <div className="flex gap-1 text-orange-500 py-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < rev.rating ? 'fill-current' : 'text-slate-300'}`} />
                  ))}
                  <span className="text-xs text-slate-450 font-bold ml-1">({rev.rating}/৫ তারকার কন্টেন্ট)</span>
                </div>

                <p className="text-sm font-bold text-indigo-650 bg-indigo-50 border border-indigo-100 inline-block px-2.5 py-1 rounded-lg">
                  প্রোডাক্ট: {rev.productName}
                </p>

                <p className="text-slate-700 leading-relaxed text-sm pt-1">{rev.comment}</p>
              </div>

              {/* Right Action buttons */}
              <div className="flex md:flex-col justify-end items-end gap-3 min-w-[150px] border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                <div className="text-right hidden md:block">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                    rev.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {rev.status}
                  </span>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  {rev.status === 'Pending' && (
                    <button
                      onClick={() => handleApprove(rev.id, rev.reviewerName)}
                      className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm shadow-emerald-600/10"
                    >
                      <Check className="w-4 h-4" /> অনুমোদন করুন
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(rev.id)}
                    className="flex-1 md:flex-none border border-rose-100 text-rose-600 hover:bg-rose-50 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" /> মুছে ফেলুন
                  </button>
                </div>
              </div>

            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm text-slate-400">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            কোনো কাস্টমার রিভিউ পাওয়া যায়নি।
          </div>
        )}
      </div>
    </div>
  );
}
