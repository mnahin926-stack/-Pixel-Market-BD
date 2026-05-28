import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { Shield, Lock, User } from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const setAdminAuthenticated = useStore((state) => state.setAdminAuthenticated);
  const adminCredentials = useStore((state) => state.adminCredentials);
  const navigate = useNavigate();

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    
    if (username === adminCredentials.username && password === adminCredentials.password) {
      setAdminAuthenticated(true);
      toast.success('লগইন সফল হয়েছে!');
      navigate('/admin/dashboard');
    } else {
      toast.error('ভুল ইউজারনেম বা পাসওয়ার্ড! Access Denied.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 max-w-md w-full">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Shield className="w-8 h-8 flex-shrink-0" />
        </div>
        
        <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">এডমিন প্যানেল</h1>
        <p className="text-center text-slate-500 mb-8">দয়া করে আপনার লগইন তথ্য দিন</p>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ইউজারনেম</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-5 h-5" />
              </div>
              <input
                required
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
                placeholder="আপনার ইউজারনেম"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">পাসওয়ার্ড</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
                placeholder="******"
              />
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-4 rounded-xl transition-colors mt-6"
          >
            লগইন করুন
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-slate-100 bg-slate-50 p-4 rounded-xl text-center">
          <p className="text-xs text-slate-500 font-mono">
            <strong>ডেমো এক্সেস:</strong><br />
            ইউজারনেম: নাঈমুর রহমান<br />
            পাসওয়ার্ড: 234000
          </p>
        </div>
      </div>
    </div>
  );
}
