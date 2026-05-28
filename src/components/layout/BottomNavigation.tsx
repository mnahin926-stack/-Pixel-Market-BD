import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Heart, ShoppingCart, User } from 'lucide-react';
import { useStore } from '../../store';
import { cn } from '../../utils';

export default function BottomNavigation() {
  const location = useLocation();
  const cartCount = useStore((state) => state.cart.reduce((acc, item) => acc + item.quantity, 0));

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Shop', path: '/shop', icon: ShoppingBag },
    { name: 'Cart', path: '/cart', icon: ShoppingCart, badge: cartCount },
    { name: 'Profile', path: '/admin/login', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-[#0A0A0B]/90 backdrop-blur-lg border-t border-white/10 z-50 pb-2">
      <div className="flex justify-around items-center px-2 py-3">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex flex-col items-center gap-1.5 p-2 transition-colors relative',
              location.pathname === item.path ? 'text-orange-500' : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span className="text-[10px] font-bold tracking-wider leading-none">{item.name}</span>
            {item.badge != null && item.badge > 0 && (
              <span className="absolute top-0 right-1 w-4 h-4 rounded-full bg-orange-600 text-white text-[9px] font-bold flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
