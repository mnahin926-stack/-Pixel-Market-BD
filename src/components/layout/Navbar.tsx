import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, User, Search, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { cn } from '../../utils';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cart = useStore((state) => state.cart);
  const { isUserAuthenticated, siteSettings, isDarkMode, toggleDarkMode } = useStore();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navLinks = siteSettings?.navigation && siteSettings.navigation.length > 0 ? siteSettings.navigation : [
    { id: '1', label: 'হোম', url: '/' },
    { id: '2', label: 'শপ', url: '/shop' },
  ];

  return (
    <>
      {siteSettings?.announcementText && (
        <div className="bg-orange-600 text-white text-center py-2 text-xs font-bold tracking-wider uppercase z-50 relative w-full flex items-center justify-center">
             <span>{siteSettings.announcementText}</span>
        </div>
      )}
      <nav
        className={cn(
          'fixed left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] md:w-[calc(100%-2rem)] max-w-7xl z-40 transition-all duration-300 rounded-2xl md:rounded-[24px]',
          siteSettings?.announcementText ? (isScrolled ? 'top-2 md:top-4' : 'top-10 md:top-12') : 'top-2 md:top-4',
          isScrolled
            ? (isDarkMode 
                ? 'bg-[#0A0A0B]/80 backdrop-blur-lg border border-white/10 shadow-[0_0_20px_rgba(249,115,22,0.1)] py-2.5 md:py-3 text-white'
                : 'bg-white/85 backdrop-blur-lg border border-slate-250 shadow-[0_0_20px_rgba(0,0,0,0.05)] py-2.5 md:py-3 text-slate-800')
            : (isDarkMode 
                ? 'bg-[#0A0A0B]/50 backdrop-blur-lg border border-white/10 py-3 text-white'
                : 'bg-white/60 backdrop-blur-lg border border-slate-200 py-3 text-slate-850')
        )}
      >
        <div className="px-3 md:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 md:gap-3">
              {siteSettings?.headerLogoUrl ? (
                 <img src={siteSettings.headerLogoUrl} alt={siteSettings.storeName || 'Pixel Market'} className="h-8 md:h-10 w-auto object-contain" />
              ) : (
                <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-600 rounded-lg flex items-center justify-center font-bold text-lg md:text-xl text-white shadow-[0_0_15px_rgba(234,88,12,0.4)]">
                   {(siteSettings?.storeName || 'P').charAt(0).toUpperCase()}
                </div>
              )}
              <Link to="/" className="text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-white flex gap-1">
                {siteSettings?.storeName || 'Pixel Market'}
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.id}
                  to={link.url}
                  className={cn(
                    'text-sm font-bold tracking-widest uppercase transition-colors hover:text-orange-500 opacity-80',
                    location.pathname === link.url 
                      ? 'text-orange-500 opacity-100' 
                      : (isDarkMode ? 'text-slate-200' : 'text-slate-650')
                  )}
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleDarkMode}
                  className="p-2 text-slate-650 dark:text-slate-200 hover:text-orange-500 transition-colors opacity-80"
                  aria-label="Theme Toggle desktop"
                  id="theme-changer-desktop"
                >
                  {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-900" />}
                </button>
                <button className="p-2 text-slate-650 dark:text-slate-200 hover:text-orange-500 transition-colors opacity-80">
                  <Search className="w-5 h-5" />
                </button>
                <Link
                  to="/cart"
                  className="relative p-2 text-slate-650 dark:text-slate-200 hover:text-orange-500 transition-colors opacity-80"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center p-1 w-4 h-4 text-[10px] font-bold leading-none text-white bg-orange-600 rounded-full shadow-[0_0_10px_rgba(234,88,12,0.6)]">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link
                  to={isUserAuthenticated ? "/account" : "/login"}
                  className="p-2 text-slate-650 dark:text-slate-200 hover:text-orange-500 transition-colors opacity-80"
                >
                  <User className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2 text-slate-600 dark:text-slate-200">
              <button
                onClick={toggleDarkMode}
                className="p-2 hover:text-orange-500 transition-colors"
                aria-label="Theme Toggle mobile"
                id="theme-changer-mobile"
              >
                {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-900" />}
              </button>
              <button className="p-2 hover:text-orange-500 transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 hover:text-orange-500 focus:outline-none transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6 text-orange-500" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#111113]/95 backdrop-blur-xl border border-white/10 absolute w-full left-0 top-full mt-2 rounded-[24px] shadow-2xl shadow-black/80 overflow-hidden transform animate-in fade-in slide-in-from-top-2">
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.id}
                  to={link.url}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3.5 rounded-xl text-sm uppercase tracking-widest font-bold text-slate-200 hover:text-orange-500 hover:bg-white/5 active:scale-[0.98] transition-all"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                  to={isUserAuthenticated ? "/account" : "/login"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3.5 rounded-xl text-sm uppercase tracking-widest font-bold text-slate-200 hover:text-orange-500 hover:bg-white/5 active:scale-[0.98] transition-all"
                >
                  আমার অ্যাকাউন্ট
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
