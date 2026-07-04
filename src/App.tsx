import React from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./components/Home";
import Services from "./components/Services";
import OrderNow from "./components/OrderNow";
import TrackOrder from "./components/TrackOrder";
import LoginRegister from "./components/LoginRegister";
import OwnerLogin from "./components/OwnerLogin";
import CustomerDashboard from "./components/CustomerDashboard";
import AdminDashboard from "./components/AdminDashboard";

import { User, LaundryItem, AppSettings, Order } from "./types";

export default function App() {
  const [activePage, setActivePage] = React.useState<string>("home");
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [cart, setCart] = React.useState<Record<string, number>>({});
  const [initialTrackingId, setInitialTrackingId] = React.useState<string>("");
  const [darkMode, setDarkMode] = React.useState<boolean>(true);

  // Dynamically fetched from our server APIs
  const [services, setServices] = React.useState<LaundryItem[]>([]);
  const [settings, setSettings] = React.useState<AppSettings>({
    address: "Geetha Nagar, 8-4-300, Beside St. Martin School, Kandri Gutta, Balanagar, Hyderabad, Telangana – 500042",
    phones: ["7337427757", "8919501286", "9014025932"],
    upiId: "QR918919501286-0197@unionbankofindia",
    bannerText: "SK LAUNDRY SERVICES",
    bannerSubtext: "Premium hygiene fabric clinic with fast 24-hour delivery in Balanagar & Hyderabad surrounding areas.",
    faqs: [],
    coupons: [],
    testimonials: []
  });

  // Load state from local storage or server on startup
  React.useEffect(() => {
    // 1. Sync Authentication
    const storedUser = localStorage.getItem("skl_user");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error(e);
      }
    }

    // 2. Sync Cart
    const storedCart = localStorage.getItem("skl_cart");
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {
        console.error(e);
      }
    }

    // 3. Sync Dark Mode - locked to true for Sophisticated Dark theme
    setDarkMode(true);

    // 4. Fetch services list from server
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setServices(data);
        } else if (data && data.services) {
          setServices(data.services);
        }
      })
      .catch((err) => console.error("Error fetching services:", err));

    // 5. Fetch store configurations / settings from server
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.address) {
          setSettings(data);
        } else if (data && data.settings) {
          setSettings(data.settings);
        }
      })
      .catch((err) => console.error("Error fetching settings:", err));
  }, []);

  // Save cart to local storage when modified
  React.useEffect(() => {
    localStorage.setItem("skl_cart", JSON.stringify(cart));
  }, [cart]);

  // Handle dark mode setup visually
  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("skl_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("skl_theme", "light");
    }
  }, [darkMode]);

  // Safe router render switch
  const renderPage = () => {
    switch (activePage) {
      case "home":
        return (
          <Home 
            setActivePage={setActivePage} 
            settings={settings} 
          />
        );
      case "services":
        return (
          <Services 
            services={services} 
            cart={cart} 
            setCart={setCart} 
            setActivePage={setActivePage} 
          />
        );
      case "order-now":
        return (
          <OrderNow 
            services={services}
            cart={cart} 
            setCart={setCart} 
            currentUser={currentUser} 
            settings={settings} 
            setActivePage={setActivePage} 
            setInitialTrackingId={setInitialTrackingId}
          />
        );
      case "track-order":
        return (
          <TrackOrder 
            initialOrderId={initialTrackingId} 
          />
        );
      case "login":
        return (
          <LoginRegister 
            setCurrentUser={setCurrentUser} 
            setActivePage={setActivePage} 
          />
        );
      case "owner-login":
        return (
          <OwnerLogin 
            setCurrentUser={setCurrentUser} 
            setActivePage={setActivePage} 
          />
        );
      case "customer-dashboard":
        if (!currentUser) {
          setActivePage("login");
          return null;
        }
        return (
          <CustomerDashboard 
            currentUser={currentUser} 
            setCurrentUser={setCurrentUser} 
            setActivePage={setActivePage} 
            services={services}
            setInitialTrackingId={setInitialTrackingId}
          />
        );
      case "admin-dashboard":
        if (!currentUser || currentUser.role !== "OWNER") {
          setActivePage("owner-login");
          return null;
        }
        return (
          <AdminDashboard 
            currentUser={currentUser} 
            setActivePage={setActivePage} 
            services={services} 
            setServices={setServices} 
            settings={settings} 
            setSettings={setSettings} 
          />
        );
      default:
        return (
          <Home 
            setActivePage={setActivePage} 
            settings={settings} 
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col font-sans transition-colors duration-300">
      
      {/* Dynamic Global Offer Alert Rail */}
      <div className="bg-brand-600 dark:bg-brand-900 text-white text-xs py-2 px-4 text-center font-semibold tracking-wide flex items-center justify-center gap-1.5 shadow-sm">
        <span>🎉 PROMO: Use code <strong className="underline decoration-wavy font-mono">WELCOME10</strong> for flat 10% discount on first door pickup laundry booking!</span>
      </div>

      {/* Main navigation header */}
      <Navbar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        currentUser={currentUser} 
        setCurrentUser={setCurrentUser} 
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        cartCount={Object.keys(cart).reduce((sum: number, key: string) => sum + (cart[key] || 0), 0)}
      />

      {/* Main viewport pages container */}
      <main className="flex-grow">
        {renderPage()}
      </main>

      {/* Business information footer */}
      <Footer 
        setActivePage={setActivePage} 
      />

    </div>
  );
}
