import React from "react";
import { LaundryItem, User } from "../types";
import { 
  WashingMachine, 
  User as UserIcon, 
  LogOut, 
  Lock, 
  Home, 
  Smartphone,
  Phone,
  Moon,
  Sun,
  Menu,
  X,
  Compass,
  FileText,
  Tag,
  ShoppingCart
} from "lucide-react";
import { motion } from "motion/react";

interface NavbarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  cartCount?: number;
}

export default function Navbar({
  activePage,
  setActivePage,
  currentUser,
  setCurrentUser,
  darkMode,
  setDarkMode,
  cartCount = 0
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "services", label: "Services", icon: Compass },
    { id: "order-now", label: "Order Now", icon: WashingMachine },
    { id: "track-order", label: "Track Order", icon: FileText }
  ];

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("skl_user");
    setActivePage("home");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0A192F]/80 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo Section */}
        <div 
          onClick={() => setActivePage("home")} 
          className="flex cursor-pointer items-center space-x-3 group"
          id="navbar-logo"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-sm bg-blue-600 font-bold text-xl tracking-tighter text-white transition-transform group-hover:scale-105">
            SK
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-widest text-white leading-none">SK LAUNDRY</span>
            <span className="text-[10px] text-blue-400 tracking-[0.2em] font-medium">ENTERPRISE SOLUTIONS</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setActivePage(item.id)}
                className={`relative flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  isActive 
                    ? "text-brand-600 dark:text-brand-400" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-white"
                }`}
              >
                <div className="relative">
                  <Icon className="h-4.5 w-4.5" />
                  {item.id === "order-now" && cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-black text-white ring-2 ring-white dark:ring-gray-950">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span>{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-4 right-4 h-0.5 bg-brand-500 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Small Cart Button */}
          <button
            id="btn-nav-cart"
            onClick={() => setActivePage("order-now")}
            className="relative flex items-center justify-center rounded-lg p-2.5 text-gray-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer group"
            title="View Active Cart"
          >
            <ShoppingCart className="h-5 w-5 transition-transform group-hover:scale-110" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] font-black text-white ring-2 ring-[#0A192F] animate-pulse">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Section */}
          {currentUser ? (
            <div className="flex items-center space-x-2">
              <button
                id="btn-nav-dashboard"
                onClick={() => setActivePage(currentUser.role === "OWNER" ? "admin-dashboard" : "customer-dashboard")}
                className={`flex items-center space-x-1.5 rounded-lg px-3.5 py-2 text-sm font-medium border transition-colors ${
                  currentUser.role === "OWNER" 
                    ? "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900"
                    : "bg-brand-50 text-brand-700 border-brand-100 hover:bg-brand-100 dark:bg-brand-950/20 dark:text-brand-400 dark:border-brand-900"
                }`}
              >
                {currentUser.role === "OWNER" ? <Lock className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />}
                <span className="max-w-32 truncate">{currentUser.name}</span>
              </button>
              <button
                id="btn-nav-logout"
                onClick={handleLogout}
                className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition-colors"
                title="Log out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <button
              id="btn-nav-login"
              onClick={() => setActivePage("login")}
              className="flex items-center space-x-1.5 rounded-lg bg-brand-600 px-4.5 py-2 text-sm font-medium text-white shadow-xs hover:bg-brand-700 transition-colors cursor-pointer"
            >
              <UserIcon className="h-4 w-4" />
              <span>Login / Register</span>
            </button>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center space-x-2">
          {/* Mobile Cart Shortcut Button */}
          <button
            id="btn-mobile-cart"
            onClick={() => setActivePage("order-now")}
            className="relative flex items-center justify-center rounded-lg p-2 text-gray-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer mr-1 group"
            title="View Active Cart"
          >
            <ShoppingCart className="h-5.5 w-5.5 transition-transform group-hover:scale-110" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-black text-white ring-2 ring-[#0A192F]">
                {cartCount}
              </span>
            )}
          </button>

          <button
            id="btn-mobile-menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="border-b border-gray-200 bg-white px-4 pt-2 pb-4 dark:border-gray-800 dark:bg-gray-950 md:hidden"
        >
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex w-full items-center space-x-3 rounded-lg px-4 py-3 text-base font-medium transition-colors ${
                    isActive 
                      ? "bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400" 
                      : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900"
                  }`}
                >
                  <div className="relative">
                    <Icon className="h-5 w-5" />
                    {item.id === "order-now" && cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white">
                        {cartCount}
                      </span>
                    )}
                  </div>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-800">
            {currentUser ? (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setActivePage(currentUser.role === "OWNER" ? "admin-dashboard" : "customer-dashboard");
                    setMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center space-x-3 rounded-lg bg-gray-50 px-4 py-3 text-base font-medium text-gray-700 dark:bg-gray-900 dark:text-gray-300"
                >
                  {currentUser.role === "OWNER" ? <Lock className="h-5 w-5 text-amber-500" /> : <UserIcon className="h-5 w-5 text-brand-500" />}
                  <span>{currentUser.name} ({currentUser.role === "OWNER" ? "Owner" : "Customer"})</span>
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center space-x-3 rounded-lg bg-red-50 px-4 py-3 text-base font-medium text-red-600 dark:bg-red-950/20 dark:text-red-400"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setActivePage("login");
                  setMobileMenuOpen(false);
                }}
                className="flex w-full items-center justify-center space-x-2 rounded-lg bg-brand-600 px-4 py-3 text-base font-semibold text-white shadow-xs hover:bg-brand-700"
              >
                <UserIcon className="h-5 w-5" />
                <span>Login / Register</span>
              </button>
            )}
          </div>
        </motion.div>
      )}
    </header>
  );
}
