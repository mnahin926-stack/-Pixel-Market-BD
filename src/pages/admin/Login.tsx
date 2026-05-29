import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { Shield, Lock, User, Chrome, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { sha256Sync } from '../../utils';
import { auth, db } from '../../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function AdminLogin() {
  const [emailOrUser, setEmailOrUser] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [otpCode, setOtpCode] = useState('');
  const [pendingStaff, setPendingStaff] = useState<any>(null);
  const [pendingIsMaster, setPendingIsMaster] = useState(false);

  const setAdminAuthenticated = useStore((state) => state.setAdminAuthenticated);
  const roles = useStore((state) => state.roles);
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!emailOrUser.trim() || !password) {
      toast.error('•');
      return;
    }

    const enteredInput = emailOrUser.trim().toLowerCase();
    const enteredPassHash = sha256Sync(password);

    const matchedStaff = roles.find(rl => 
      (rl.email.toLowerCase() === enteredInput || rl.name.toLowerCase() === emailOrUser.trim().toLowerCase()) &&
      rl.passwordHash === enteredPassHash
    );

    if (matchedStaff) {
      if (matchedStaff.status !== 'Active') {
        toast.error('•');
        return;
      }

      // Write login attempt notification to Firestore
      try {
        await setDoc(doc(db, 'login_notifications', `${Date.now()}`), {
          email: matchedStaff.email,
          name: matchedStaff.name,
          timestamp: new Date().toISOString(),
          status: 'Pending OTP Verification',
          type: 'Standard Login'
        });
      } catch (err) {
        console.error(err);
      }

      setPendingStaff(matchedStaff);
      setPendingIsMaster(matchedStaff.email.toLowerCase() === 'pixelmarketbd2026@gmail.com');
      setStep('otp');
    } else {
      toast.error('•');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      if (!user.email) {
        toast.error('•');
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

        // Write login attempt notification to Firestore
        try {
          await setDoc(doc(db, 'login_notifications', `${Date.now()}`), {
            email: email,
            name: masterStaff.name,
            timestamp: new Date().toISOString(),
            status: 'Pending OTP Verification',
            type: 'Google Login (Master Admin)'
          });
        } catch (err) {
          console.error(err);
        }

        setPendingStaff(masterStaff);
        setPendingIsMaster(true);
        setStep('otp');
      } else if (matchedStaff) {
        if (matchedStaff.status !== 'Active') {
          toast.error('•');
          return;
        }
        
        // Write login attempt notification to Firestore
        try {
          await setDoc(doc(db, 'login_notifications', `${Date.now()}`), {
            email: email,
            name: matchedStaff.name,
            timestamp: new Date().toISOString(),
            status: 'Pending OTP Verification',
            type: 'Google Login'
          });
        } catch (err) {
          console.error(err);
        }

        setPendingStaff(matchedStaff);
        setPendingIsMaster(false);
        setStep('otp');
      } else {
        toast.error('•');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('•');
    }
  };

  const handleOtpSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (otpCode !== '25698145') {
      toast.error('•');
      return;
    }

    if (!pendingStaff) {
      toast.error('•');
      return;
    }

    try {
      // Write verified notification to Firestore
      await setDoc(doc(db, 'login_notifications', `${Date.now()}`), {
        email: pendingStaff.email,
        name: pendingStaff.name,
        timestamp: new Date().toISOString(),
        status: 'Authorized',
        type: 'OTP Verified Success'
      });

      setAdminAuthenticated(true, pendingStaff);
      
      // Save flag to localStorage so that admin link is never shown on the website again
      localStorage.setItem('admin_logged_in_once', 'true');

      toast.success('•');
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error(err);
      toast.error('•');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 bg-[#0A0A0B]">
      <div className="bg-[#121214] p-8 rounded-3xl shadow-2xl border border-white/5 max-w-sm w-full space-y-6">
        
        {step === 'credentials' ? (
          <>
            <div className="w-16 h-16 bg-white/5 text-slate-300 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Shield className="w-8 h-8 flex-shrink-0" />
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="w-5 h-5" />
                </div>
                <input
                  required
                  type="text"
                  value={emailOrUser}
                  onChange={(e) => setEmailOrUser(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-white/10 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/5 text-white placeholder-slate-600 outline-none text-sm leading-none"
                  placeholder="•••"
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-white/10 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/5 text-white placeholder-slate-600 outline-none text-sm leading-none"
                  placeholder="••••••"
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-medium py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-orange-600/20 cursor-pointer active:scale-95 flex items-center justify-center"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-white/5"></div>
            </div>

            <button
              onClick={handleGoogleLogin}
              type="button"
              className="w-full flex items-center justify-center gap-2 border border-white/10 hover:bg-white/5 text-slate-300 py-3.5 px-4 rounded-xl transition-all cursor-pointer shadow-md bg-white/5 active:scale-95"
            >
              <Chrome className="w-5 h-5 text-red-500" />
            </button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-white/5 text-orange-500 rounded-2xl flex items-center justify-center mx-auto shadow-inner animate-pulse">
              <Lock className="w-8 h-8 flex-shrink-0" />
            </div>
            
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Shield className="w-5 h-5" />
                </div>
                <input
                  required
                  type="text"
                  maxLength={8}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-white/10 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/5 text-white text-center tracking-[0.5em] font-mono placeholder-slate-600 outline-none text-lg"
                  placeholder="••••••••"
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-medium py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-orange-600/20 cursor-pointer active:scale-95 flex items-center justify-center"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </>
        )}
        
      </div>
    </div>
  );
}
