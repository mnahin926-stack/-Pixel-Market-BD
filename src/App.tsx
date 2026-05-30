import React, { useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import BottomNavigation from './components/layout/BottomNavigation';
import FloatingWhatsApp from './components/layout/FloatingWhatsApp';
import { useStore } from './store';
import { cn } from './utils';
import FirebaseSync from './components/FirebaseSync';

// Performance Optimization: Lazy Load pages to reduce initial bundle chunk size by >50%!
const Home = React.lazy(() => import('./pages/Home'));
const Shop = React.lazy(() => import('./pages/Shop'));
const About = React.lazy(() => import('./pages/About'));
const ProductDetails = React.lazy(() => import('./pages/ProductDetails'));
const Cart = React.lazy(() => import('./pages/Cart'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const AdminLogin = React.lazy(() => import('./pages/admin/Login'));
const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'));
const CustomerLogin = React.lazy(() => import('./pages/customer/Login'));
const Account = React.lazy(() => import('./pages/customer/Account'));

// Lightweight, modern loading skeleton
const PageLoader = () => (
  <div className="min-h-[50vh] w-full flex flex-col items-center justify-center p-8 animate-pulse">
    <div className="w-12 h-12 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
    <span className="text-slate-500 text-xs font-bold tracking-widest uppercase font-sans mt-4">
      লোড হচ্ছে... (Optimizing Section)
    </span>
  </div>
);

const PrivateUserRoute = ({ children }: { children: React.ReactNode }) => {
  const isUserAuthenticated = useStore((state) => state.isUserAuthenticated);
  return isUserAuthenticated ? children : <Navigate to="/login" />;
};

const PrivateAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const isAdminAuthenticated = useStore((state) => state.isAdminAuthenticated);
  return isAdminAuthenticated ? children : <Navigate to="/admin/login" />;
};

function AppLayout() {
  const { siteSettings, isDarkMode } = useStore();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    // Update Website Title
    if (siteSettings?.storeName) {
      document.title = siteSettings.storeName;
    }
    // Update Favicon
    if (siteSettings?.faviconUrl) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = siteSettings.faviconUrl;
    }
    // Attempt to inject primary color globally via CSS var if possible
    if (siteSettings?.colors?.primary) {
      document.documentElement.style.setProperty('--color-primary', siteSettings.colors.primary);
    }
  }, [siteSettings?.storeName, siteSettings?.faviconUrl, siteSettings?.colors?.primary]);

  return (
    <div className={cn(
      "min-h-screen flex flex-col font-sans pb-16 md:pb-0 select-none transition-colors duration-300",
      isDarkMode ? "bg-[#0A0A0B] text-slate-200" : "bg-slate-50 text-slate-900"
    )}>
      <Navbar />
      <main className="flex-grow pt-24 pb-8 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <BottomNavigation />
      <FloatingWhatsApp />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <FirebaseSync />
      <ToastContainer position="bottom-right" aria-label="Notifications" />
      <Routes>
        <Route element={<AppLayout />}>
          {/* Public Routes inside Persistent Shell Layout */}
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/about" element={<About />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />

          {/* Customer Routes inside Persistent Shell Layout */}
          <Route path="/login" element={<CustomerLogin />} />
          <Route 
            path="/account" 
            element={
              <PrivateUserRoute>
                <Account />
              </PrivateUserRoute>
            } 
          />

          {/* Admin Routes inside Persistent Shell Layout */}
          <Route path="/admin/login" element={<AdminLogin />} />
        </Route>

        {/* Dedicated Admin Dashboard Route */}
        <Route 
          path="/admin/*" 
          element={
            <PrivateAdminRoute>
              <Suspense fallback={<PageLoader />}>
                <AdminDashboard />
              </Suspense>
            </PrivateAdminRoute>
          } 
        />
        </Routes>
      </BrowserRouter>
    );
}
