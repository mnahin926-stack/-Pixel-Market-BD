import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useStore } from '../../store';
import { Lock, Mail, Phone, User as UserIcon, X } from 'lucide-react';

export default function CustomerLogin() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Forgot Password States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  
  const setUserAuthenticated = useStore((state) => state.setUserAuthenticated);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      if (email === 'nahin4387@gmail.com' || email.includes('@')) {
        setUserAuthenticated(true, { name: 'কাস্টমার', email, phone: '01XXXXXXXXX' });
        toast.success('সফলভাবে লগইন করা হয়েছে');
        navigate('/account');
      } else {
        toast.error('যেকোনো ভ্যালিড ইমেইল দিন (উদাঃ user@example.com)');
      }
    } else {
      if (name && email && password) {
        setUserAuthenticated(true, { name, email, phone: '01XXXXXXXXX' });
        toast.success('অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!');
        navigate('/account');
      } else {
        toast.error('দয়া করে সকল তথ্য দিন');
      }
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim() || !resetEmail.includes('@')) {
      toast.error('দয়া করে সঠিক ইমেইল আইডি দিন');
      return;
    }
    toast.success('পাসওয়ার্ড রিসেট লিংকটি আপনার ইমেইলে পাঠানো হয়েছে!');
    setShowForgotModal(false);
    setResetEmail('');
  };

  return (
    <div className="py-12 px-4 sm:px-0">
      <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-8 h-8 text-slate-900" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isLogin ? 'স্বাগতম!' : 'নতুন অ্যাকাউন্ট তৈরি করুন'}
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            {isLogin ? 'আপনার অ্যাকাউন্টে প্রবেশ করুন' : 'বিস্তারিত তথ্য দিয়ে রেজিস্ট্রেশন সম্পন্ন করুন'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">পূর্ণ নাম</label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900"
                  placeholder="আপনার নাম"
                />
                <UserIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ইমেইল বা ফোন নম্বর</label>
            <div className="relative">
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900"
                placeholder="ইমেইল বা ফোন নম্বর দিন"
              />
              <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">পাসওয়ার্ড</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900"
                placeholder="••••••••"
              />
              <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {isLogin && (
            <div className="flex justify-end">
              <button 
                type="button" 
                onClick={() => setShowForgotModal(true)}
                className="text-sm font-bold text-indigo-600 hover:text-indigo-805 cursor-pointer"
              >
                পাসওয়ার্ড ভুলে গেছেন?
              </button>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold transition-colors shadow-lg mt-2 cursor-pointer"
          >
            {isLogin ? 'লগইন করুন' : 'রেজিস্টার করুন'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-600 text-sm">
             {isLogin ? 'অ্যাকাউন্ট নেই?' : 'ইতোমধ্যে অ্যাকাউন্ট আছে?'}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="font-bold text-indigo-600 hover:text-indigo-800 ml-2 cursor-pointer"
            >
              {isLogin ? 'রেজিস্টার করুন' : 'লগইন করুন'}
            </button>
          </p>
        </div>
      </div>

      {/* Forgot password modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative animate-in fade-in">
            <button 
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-black mb-3">পাসওয়ার্ড পুনরুদ্ধার</h2>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">আপনার নিবন্ধিত ইমেইল আইডি দিন, আমরা আপনাকে একটি পাসওয়ার্ড পুনরুদ্ধার লিংক পাঠিয়ে দেব।</p>
            <form onSubmit={handleResetPassword} className="space-y-4">
               <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">ইমেইল ঠিকানা</label>
                  <input 
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="user@example.com"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 text-xs focus:outline-none focus:border-orange-500"
                  />
               </div>
               <button 
                 type="submit"
                 className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all text-xs"
               >
                 লিংক পাঠান
               </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
