import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { Shield, Lock, User, Chrome } from 'lucide-react';
import { toast } from 'react-toastify';
import { sha256Sync } from '../../utils';
import { auth, db } from '../../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function AdminLogin() {
  const [emailOrUser, setEmailOrUser] = useState('');
  const [password, setPassword] = useState('');
  const setAdminAuthenticated = useStore((state) => state.setAdminAuthenticated);
  const roles = useStore((state) => state.roles);
  const navigate = useNavigate();

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    
    if (!emailOrUser.trim() || !password) {
      toast.error('দয়া করে ইমেইল/ইউজারনেম এবং পাসওয়ার্ড প্রদান করুন!');
      return;
    }

    const enteredInput = emailOrUser.trim().toLowerCase();
    const enteredPassHash = sha256Sync(password);

    // Find staff role where email matches or name matches
    const matchedStaff = roles.find(rl => 
      (rl.email.toLowerCase() === enteredInput || rl.name.toLowerCase() === emailOrUser.trim().toLowerCase()) &&
      rl.passwordHash === enteredPassHash
    );

    if (matchedStaff) {
      if (matchedStaff.status !== 'Active') {
        toast.error('আপনার অ্যাডমিন প্যানেল অ্যাকাউন্টটি বর্তমানে নিষ্ক্রিয় রয়েছে!');
        return;
      }
      setAdminAuthenticated(true, matchedStaff);
      toast.success(`${matchedStaff.name} হিসেবে লগইন সফল হয়েছে!`);
      navigate('/admin/dashboard');
    } else {
      toast.error('ভুল ইমেইল/ইউজারনেম বা পাসওয়ার্ড! অ্যাক্সেস প্রত্যাখ্যাত।');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      if (!user.email) {
        toast.error('আপনার গুগল অ্যাকাউন্টের সাথে কোনো ইমেইল যুক্ত নেই!');
        return;
      }

      const email = user.email.toLowerCase();
      const isMaster = email === 'pixelmarketbd2026@gmail.com';
      
      const staffSnap = await getDoc(doc(db, 'staff', email));
      const matchedStaff = staffSnap.exists() ? (staffSnap.data() as any) : null;

      if (isMaster) {
        const masterStaff = matchedStaff || {
          id: email,
          name: user.displayName || 'নাঈমুর রহমান',
          email: user.email,
          role: 'Administrator' as const,
          status: 'Active' as const,
          permissions: ['categories', 'products', 'orders', 'users', 'marketing', 'settings', 'live-chat']
        };
        
        await setDoc(doc(db, 'staff', email), masterStaff, { merge: true });
        setAdminAuthenticated(true, masterStaff);
        toast.success(`মাস্টার প্রিমিয়াম এডমিন হিসেবে গুগল লগইন সফল হয়েছে!`);
        navigate('/admin/dashboard');
      } else if (matchedStaff) {
        if (matchedStaff.status !== 'Active') {
          toast.error('আপনার অ্যাডমিন প্যানেল অ্যাকাউন্টটি বর্তমানে নিষ্ক্রিয় রয়েছে!');
          return;
        }
        
        setAdminAuthenticated(true, matchedStaff);
        toast.success(`${matchedStaff.name} হিসেবে লগইন সফল হয়েছে!`);
        navigate('/admin/dashboard');
      } else {
        toast.error('অ্যাক্সেস প্রত্যাখ্যাত! এই গুগল ইমেইলটি অ্যাডমিন বা স্টাফ প্যানেলে নিবন্ধিত নয়।');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('গুগল লগইন করতে সমস্যা হয়েছে: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 max-w-md w-full">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Shield className="w-8 h-8 flex-shrink-0" />
        </div>
        
        <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">এডমিন প্যানেল</h1>
        <p className="text-center text-slate-500 mb-8">দয়া করে আপনার অ্যাডমিন লগইন তথ্য দিন</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ইমেইল বা ইউজারনেম</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-5 h-5" />
              </div>
              <input
                required
                type="text"
                value={emailOrUser}
                onChange={(e) => setEmailOrUser(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 text-slate-800"
                placeholder="যেমন: nayem@premium-market.tech"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">পাসওয়ার্ড</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 text-slate-800"
                placeholder="******"
              />
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-4 rounded-xl transition-colors mt-6 cursor-pointer"
          >
            লগইন করুন
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-400">অথবা সম্পূর্ণ নিরাপদ পদ্ধতি</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full flex items-center justify-center gap-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold py-3 px-4 rounded-xl transition-all cursor-pointer shadow-sm"
        >
          <Chrome className="w-5 h-5 text-red-500" />
          <span>Google দিয়ে এডমিন লগইন</span>
        </button>
        
        <div className="mt-8 pt-6 border-t border-slate-100 bg-slate-50 p-4 rounded-xl text-center">
          <p className="text-xs text-slate-500 leading-relaxed text-left">
            <strong>নিরাপদ Role-Based লগইন নির্দেশিকা:</strong><br />
            ১. আপনার গুগল অ্যাকাউন্ট <span className="text-slate-900 font-semibold font-mono">pixelmarketbd2026@gmail.com</span> দিয়ে লগইন করলে আপনি স্বয়ংক্রিয়ভাবে সর্বময় ক্ষমতার **মাস্টার অ্যাডমিন** হিসেবে নিযুক্ত হবেন এবং ডাটাবেজ এক্সেস পাবেন।<br />
            ২. অন্য কোনো ব্যক্তি সোর্স কোড ঘুরিয়ে বা ইন্সপেক্ট করে লগইন করার সুযোগ নেই। কারণ ফায়ারবেসের সিকিউরিটি রুলস সরাসরি ক্লাউডে রান হচ্ছে যা বাইপাস করা অসম্ভব।
          </p>
        </div>
      </div>
    </div>
  );
}
