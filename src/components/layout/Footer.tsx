import { useStore } from '../../store';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Youtube, Instagram, MessageCircle, Shield } from 'lucide-react';

export default function Footer() {
  const { siteSettings } = useStore();

  return (
    <footer className="mt-8 pt-12 pb-24 md:pb-8 bg-[#0A0A0B] border-t border-white/10 text-slate-400">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Branding & Motto */}
        <div className="col-span-1 md:col-span-1 space-y-4">
          {siteSettings?.footerLogoUrl ? (
            <img src={siteSettings.footerLogoUrl} alt={siteSettings.storeName || 'Pixel Market'} className="h-10 w-auto object-contain" />
          ) : (
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-600 rounded-lg flex items-center justify-center font-bold text-lg md:text-xl text-white shadow-[0_0_15px_rgba(234,88,12,0.4)]">
                 {(siteSettings?.storeName || 'P').charAt(0).toUpperCase()}
              </div>
              {siteSettings?.storeName || 'Pixel Market'}
            </h2>
          )}
          <p className="text-sm opacity-80">{siteSettings?.description || ''}</p>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h3 className="text-white font-bold uppercase tracking-wider text-sm">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            {(siteSettings?.navigation || []).map((nav) => (
              <li key={nav.id}>
                <Link to={nav.url} className="hover:text-orange-500 transition-colors uppercase tracking-widest text-xs">
                  {nav.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h3 className="text-white font-bold uppercase tracking-wider text-sm">Contact Us</h3>
          <ul className="space-y-3 text-sm">
            {siteSettings?.headOfficeAddress && (
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <span>{siteSettings.headOfficeAddress}</span>
              </li>
            )}
            {siteSettings?.contactPhone && (
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-orange-500" />
                <span>{siteSettings.contactPhone}</span>
              </li>
            )}
            {siteSettings?.contactEmail && (
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-orange-500" />
                <span>{siteSettings.contactEmail}</span>
              </li>
            )}
          </ul>
        </div>

        {/* Socials */}
        <div className="space-y-4">
          <h3 className="text-white font-bold uppercase tracking-wider text-sm">Follow Us</h3>
          <div className="flex items-center gap-4">
             {siteSettings?.socialLinks?.facebook && (
               <a href={siteSettings.socialLinks.facebook} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all hover:scale-110">
                 <Facebook className="w-5 h-5" />
               </a>
             )}
             {siteSettings?.socialLinks?.youtube && (
               <a href={siteSettings.socialLinks.youtube} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all hover:scale-110">
                 <Youtube className="w-5 h-5" />
               </a>
             )}
             {siteSettings?.socialLinks?.instagram && (
               <a href={siteSettings.socialLinks.instagram} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all hover:scale-110">
                 <Instagram className="w-5 h-5" />
               </a>
             )}
              {siteSettings?.socialLinks?.whatsapp && (
               <a href={siteSettings.socialLinks.whatsapp} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all hover:scale-110">
                 <MessageCircle className="w-5 h-5" />
               </a>
             )}
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-[11px] uppercase tracking-[0.2em]">
        {localStorage.getItem('admin_logged_in_once') !== 'true' && (
          <div className="flex items-center gap-2 mb-4 md:mb-0 text-slate-300 hover:text-orange-500 transition-colors">
            <Shield className="w-4 h-4 text-orange-500" />
            <Link to="/admin" className="font-bold">এডমিন প্যানেল (Admin Panel)</Link>
          </div>
        )}
        <div className="text-slate-500 text-center md:text-right">© {new Date().getFullYear()} {siteSettings?.storeName || 'Pixel Market'}</div>
      </div>
    </footer>
  );
}
