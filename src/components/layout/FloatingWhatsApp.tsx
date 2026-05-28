import React, { useState } from 'react';
import { MessageSquare, Send, X, Phone } from 'lucide-react';
import { useStore } from '../../store';

export default function FloatingWhatsApp() {
  const { siteSettings } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [msgText, setMsgText] = useState('');

  // Normalize WhatsApp number
  const rawNum = siteSettings.whatsappNumber || '+8801234567890';
  const cleanNumber = rawNum.replace(/[^\d]/g, '');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgText.trim()) return;

    const encodedText = encodeURIComponent(msgText.trim());
    const url = `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodedText}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setMsgText('');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-40 font-sans flex flex-col items-end">
      {/* Expanded quick chat popup */}
      {isOpen && (
        <div className="bg-[#111113] border border-white/10 rounded-2xl w-80 shadow-2xl p-4 mb-3 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-center pb-3 border-b border-white/10 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Live Support (WhatsApp)</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="text-xs text-slate-400 mb-4 bg-white/5 p-3 rounded-xl border border-white/5 leading-relaxed">
            আসসালামু আলাইকুম! কোনো পণ্য বা অর্ডার নিয়ে সাহায্য প্রয়োজন? এখনই আমাদের সাথে সরাসরি মেসেজে কথা বলুন।
          </div>

          <form onSubmit={handleSend} className="space-y-2">
            <textarea
              rows={2}
              value={msgText}
              onChange={(e) => setMsgText(e.target.value)}
              placeholder="আপনার প্রশ্নটি এখানে লিখুন..."
              className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none font-sans"
              required
            />
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/10 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> মেসেজ পাঠান
            </button>
          </form>
        </div>
      )}

      {/* Main floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-emerald-600 hover:bg-emerald-500 hover:scale-105 active:scale-95 text-white rounded-full flex items-center justify-center transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] border border-white/15 group pointer-events-auto relative cursor-pointer"
        aria-label="Contact Live Support on WhatsApp"
        id="floating-wa-btn"
      >
        <span className="absolute -left-36 bg-emerald-600 text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hidden md:inline duration-300 border border-white/10 select-none">
          Live WhatsApp Support
        </span>
        <MessageSquare className="w-6 h-6 animate-pulse" />
      </button>
    </div>
  );
}
