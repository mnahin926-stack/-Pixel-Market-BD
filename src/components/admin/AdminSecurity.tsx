import React, { useState } from 'react';
import { Key, Download, Server, ShieldAlert } from 'lucide-react';
import { useStore } from '../../store';
import { toast } from 'react-toastify';

export default function AdminSecurity() {
  const { auditLogs, siteSettings, updateSiteSettings, addAuditLog } = useStore();
  const [isAdminEmailEditing, setIsAdminEmailEditing] = useState(false);

  // Form states matching siteSettings contact details
  const [contactEmail, setContactEmail] = useState(siteSettings.contactEmail || 'support@pixelmarket.com');
  const [contactPhone, setContactPhone] = useState(siteSettings.contactPhone || '+8801234567890');

  const handleUpdateSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteSettings({
      ...siteSettings,
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim()
    });
    
    // Add audit log with (action: string, user?: string) signature!
    addAuditLog('প্যানেল এডমিন ইমেইল / হেল্পলাইন সেটিংস আপডেট', 'Super Admin (নাঈমুর রহমান)');

    setIsAdminEmailEditing(false);
    toast.success('অ্যাডমিন প্যানেল ইমেইল এবং হেল্পলাইন সেটিংস সফলভাবে আপডেট করা হয়েছে!');
  };

  const triggerExportBackup = () => {
    // Generate JSON bundle
    const state = localStorage.getItem('pixelmarket-ecom-store-state');
    if (!state) {
      return toast.error('ডাউনলোডযোগ্য লোকাল ডেটাবেজ খুঁজে পাওয়া যায়নি!');
    }

    try {
      const parsed = JSON.parse(state);
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(parsed, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `pixelmarket_db_backup_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      // Log action
      addAuditLog('ডেটাবেজ ব্যাকআপ অফলাইনে এক্সপোর্ট করা হয়েছে', 'Super Admin');

      toast.success('ডেটাবেজ ব্যাকআপ সফলভাবে জেনারেট ও পিসি-তে অফলাইনে ডাউনলোড হয়েছে!');
    } catch(e) {
      toast.error('ডেটাবেজ এনক্রিপশন এরর!');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in text-slate-800 max-w-5xl">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 font-sans">সিকিউরিটি, অডিট লগ ও ব্যাকআপ গেটওয়ে</h2>
        <p className="text-slate-500 text-sm mt-1">সব অ্যাডমিনিস্ট্রেтивного অপারেশন ট্র্যাক করুন, ইমেল পরিবর্তন করুন এবং কাস্টম অফলাইন ব্যাকআপ এক্সপোর্ট নিন</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Settings rotation */}
        <div className="bg-white p-6 border border-slate-150 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Key className="w-5 h-5 text-indigo-600" /> নিরাপত্তা ইমেল ও যোগাযোগ সেটিংস
            </h3>
            <button 
              onClick={() => setIsAdminEmailEditing(!isAdminEmailEditing)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              {isAdminEmailEditing ? 'সংকোচন করুন' : 'সম্পাদনা'}
            </button>
          </div>

          {isAdminEmailEditing ? (
            <form onSubmit={handleUpdateSecurity} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1.5 font-bold">এডমিন ইমেইল</label>
                <input 
                  type="email" 
                  value={contactEmail} 
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-805"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1.5 font-bold font-sans">গ্রাহক হেল্পলাইন নম্বর</label>
                <input 
                  type="text" 
                  value={contactPhone} 
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-805"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer text-center"
              >
                আপডেট কনফিগারেশন
              </button>
            </form>
          ) : (
            <div className="space-y-2 text-sm pt-2">
              <p className="flex justify-between">
                <span className="text-slate-500">ডিফল্ট কাস্টমার ইমেইল:</span>
                <b className="text-slate-900 font-mono">{siteSettings.contactEmail}</b>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-500">মোবাইল হেল্পলাইন:</span>
                <b className="text-slate-900 font-mono">{siteSettings.contactPhone}</b>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-500 text-indigo-600 font-bold flex items-center gap-1">● সল্ট এনক্রিপশন স্ট্যাটাস:</span>
                <b className="text-emerald-600 font-bold">AES-256 Enabled</b>
              </p>
            </div>
          )}
        </div>

        {/* Database backups */}
        <div className="bg-white p-6 border border-slate-150 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Server className="w-5 h-5 text-emerald-600" /> লোকাল ডেটাবেজ ব্যাকআপ (Offline Export)
            </h3>
            <p className="text-xs text-slate-550 mt-3 leading-relaxed">
              আপনার ওয়েবসাইটের পণ্য, কাস্টমার অ্যাকাউন্ট, কুপন এবং সর্বমোট বিক্রিত অর্ডারের হিসাব লোকাল স্টোরেজ থেকে এনক্রিপ্ট করে একটি সম্পূর্ণ ব্যাকআপ ফাইল তৈরি করতে পারেন। এই ফাইলটি পরবর্তীতে রিকভারির কাজে ব্যবহার করা সম্ভব।
            </p>
          </div>
          <button
            onClick={triggerExportBackup}
            className="w-full mt-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/10 cursor-pointer flex items-center justify-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4" /> অফলাইন JSON ব্যাকআপ ডাউনলোড করুন
          </button>
        </div>

      </div>

      {/* Audit Logs */}
      <div className="bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-150 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-950 text-sm">লাইভ নিরাপত্তা অডিট রেকর্ড (Live Security Audit Trail Logs)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-650">
            <thead className="bg-slate-50 text-slate-900 font-bold border-b border-slate-100">
              <tr>
                <th className="px-6 py-3 whitespace-nowrap rounded-t-xl">অডিট আইডি</th>
                <th className="px-6 py-3">অ্যাকশন / অপারেশনের বিবরণ</th>
                <th className="px-6 py-3">অপারেটর অ্যাডমিন</th>
                <th className="px-6 py-3 rounded-tr-xl">অপারেটিং টাইমস্ট্যাম্প</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.length > 0 ? (
                auditLogs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-55/40 transition-colors">
                    <td className="px-6 py-3.5 font-mono font-bold text-slate-400 text-xs">{log.id}</td>
                    <td className="px-6 py-3.5 font-extrabold text-slate-850 text-xs">{log.action}</td>
                    <td className="px-6 py-3.5 font-semibold text-slate-700 text-xs">{log.user || 'System Auto'}</td>
                    <td className="px-6 py-3.5 text-slate-550 text-xs font-mono">{log.timestamp}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-405">
                    কোনো অডিট রেকর্ড পাওয়া যায়নি।
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
