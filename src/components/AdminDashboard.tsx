import React from "react";
import { 
  TrendingUp, 
  ShoppingBag, 
  CheckCircle, 
  DollarSign, 
  Users, 
  Search, 
  Filter, 
  Settings, 
  FileText, 
  Check, 
  Trash2, 
  Edit3, 
  Plus, 
  HelpCircle, 
  Award,
  AlertTriangle,
  MapPin,
  Phone,
  Tag,
  ShieldAlert,
  Calendar,
  X,
  CreditCard,
  Eye,
  RefreshCw,
  Printer,
  Key,
  EyeOff,
  Lock
} from "lucide-react";
import { Order, User, LaundryItem, AppSettings, FAQ, Coupon, Testimonial } from "../types";

interface AdminDashboardProps {
  currentUser: User;
  setActivePage: (page: string) => void;
  services: LaundryItem[];
  setServices: React.Dispatch<React.SetStateAction<LaundryItem[]>>;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

export default function AdminDashboard({
  currentUser,
  setActivePage,
  services,
  setServices,
  settings,
  setSettings
}: AdminDashboardProps) {
  
  // Tab control
  const [adminTab, setAdminTab] = React.useState<'orders' | 'services' | 'payments' | 'customers' | 'website' | 'reports' | 'security'>('orders');

  // Change password states
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [pwError, setPwError] = React.useState("");
  const [pwSuccess, setPwSuccess] = React.useState("");
  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [pwLoading, setPwLoading] = React.useState(false);
  const [isCurrentPasswordVerified, setIsCurrentPasswordVerified] = React.useState(false);

  // Statistics state
  const [stats, setStats] = React.useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    todayOrdersCount: 0,
    todayRevenue: 0
  });
  const [last7Days, setLast7Days] = React.useState<any[]>([]);
  const [yearlyData, setYearlyData] = React.useState<any[]>([]);
  const [auditLogs, setAuditLogs] = React.useState<any[]>([]);

  // List states synced from API
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [customers, setCustomers] = React.useState<User[]>([]);
  const [blockedUserIds, setBlockedUserIds] = React.useState<string[]>([]);
  
  // Search & Filter state
  const [orderSearch, setOrderSearch] = React.useState("");
  const [orderFilterStatus, setOrderFilterStatus] = React.useState("");
  const [customerSearch, setCustomerSearch] = React.useState("");

  // Modals / Editors control
  const [editingOrder, setEditingOrder] = React.useState<Order | null>(null);
  const [newOrderStatus, setNewOrderStatus] = React.useState("");
  const [statusNotes, setStatusNotes] = React.useState("");
  const [viewingOrderDetails, setViewingOrderDetails] = React.useState<Order | null>(null);
  
  // Service editor form
  const [editingService, setEditingService] = React.useState<LaundryItem | null>(null);
  const [serviceName, setServiceName] = React.useState("");
  const [serviceType, setServiceType] = React.useState("");
  const [servicePrice, setServicePrice] = React.useState("");
  const [serviceCategory, setServiceCategory] = React.useState<'MEN' | 'WOMEN' | 'HOUSEHOLD' | 'KIDS'>('MEN');
  const [isServiceModalOpen, setIsServiceModalOpen] = React.useState(false);

  // FAQ Form
  const [newFaqQ, setNewFaqQ] = React.useState("");
  const [newFaqA, setNewFaqA] = React.useState("");

  // Coupon Form
  const [couponCode, setCouponCode] = React.useState("");
  const [couponType, setCouponType] = React.useState<'percentage' | 'fixed'>('percentage');
  const [couponValue, setCouponValue] = React.useState("");
  const [couponMinOrder, setCouponMinOrder] = React.useState("");
  const [couponDesc, setCouponDesc] = React.useState("");

  // Global settings edit
  const [address, setAddress] = React.useState(settings.address);
  const [upiId, setUpiId] = React.useState(settings.upiId);
  const [bannerText, setBannerText] = React.useState(settings.bannerText);
  const [bannerSubtext, setBannerSubtext] = React.useState(settings.bannerSubtext);
  const [phoneNumbers, setPhoneNumbers] = React.useState(settings.phones.join(", "));

  // Loading
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    // If not Owner, block entry and send back to home page
    if (currentUser?.role !== "OWNER") {
      setActivePage("home");
      alert("Unauthorized Access - Owner Login Required");
      return;
    }
    loadAdminData();
  }, [currentUser]);

  const loadAdminData = async () => {
    setRefreshing(true);
    try {
      // Sync reports & stats
      const repResp = await fetch("/api/reports");
      if (repResp.ok) {
        const repData = await repResp.json();
        setStats(repData.stats);
        setLast7Days(repData.last7Days);
        setYearlyData(repData.yearlyData);
        setAuditLogs(repData.auditLogs);
      }

      // Sync active orders
      const ordResp = await fetch("/api/orders");
      if (ordResp.ok) {
        const ordData = await ordResp.json();
        setOrders(ordData);
      }

      // Sync customers directory
      const custResp = await fetch("/api/users");
      if (custResp.ok) {
        const custData = await custResp.json();
        setCustomers(custData);
      }

    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  // ORDER MANAGEMENT METHODS
  const handleUpdateOrderStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    try {
      const response = await fetch(`/api/orders/${editingOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newOrderStatus,
          timelineNotes: statusNotes || undefined
        })
      });
      if (response.ok) {
        setEditingOrder(null);
        setStatusNotes("");
        loadAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleApprovePayment = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentStatus: "Paid"
        })
      });
      if (response.ok) {
        loadAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE"
      });
      if (response.ok) {
        loadAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // SERVICE RATES EDITING METHODS
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName || !servicePrice) return;

    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingService?.id || undefined,
          name: serviceName,
          price: Number(servicePrice),
          category: serviceCategory,
          serviceType: serviceType
        })
      });
      if (response.ok) {
        const data = await response.json();
        setServices(data.services);
        setEditingService(null);
        setServiceName("");
        setServiceType("");
        setServicePrice("");
        setIsServiceModalOpen(false);
        loadAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this service rate?")) return;
    try {
      const response = await fetch(`/api/services/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        const data = await response.json();
        setServices(data.services);
        loadAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // CUSTOMER DIRECTORY LOCK STATES METHODS
  const handleBlockToggle = async (userId: string, isBlocked: boolean) => {
    try {
      const response = await fetch(`/api/users/${userId}/block`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ block: !isBlocked })
      });
      if (response.ok) {
        const data = await response.json();
        setBlockedUserIds(data.blockedUserIds);
        loadAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCustomer = async (userId: string) => {
    if (!window.confirm("Are you sure you want to completely delete this customer database card?")) return;
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE"
      });
      if (response.ok) {
        loadAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // WEBSITE MANAGEMENT METHODS
  const handleSaveWebsiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          upiId,
          bannerText,
          bannerSubtext,
          phones: phoneNumbers.split(",").map(p => p.trim())
        })
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        alert("Store metadata successfully published!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddFAQ = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaqQ || !newFaqA) return;

    try {
      const response = await fetch("/api/settings/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: newFaqQ, answer: newFaqA })
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        setNewFaqQ("");
        setNewFaqA("");
        alert("FAQ added!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteFAQ = async (id: string) => {
    try {
      const response = await fetch(`/api/settings/faqs/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode || !couponValue) return;

    try {
      const response = await fetch("/api/settings/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode,
          discountType: couponType,
          value: Number(couponValue),
          minOrderValue: Number(couponMinOrder) || 0,
          description: couponDesc
        })
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        setCouponCode("");
        setCouponValue("");
        setCouponMinOrder("");
        setCouponDesc("");
        alert("New Coupon Added!");
      } else {
        const err = await response.json();
        alert(err.error || "Failed to create coupon.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCoupon = async (code: string) => {
    try {
      const response = await fetch(`/api/settings/coupons/${code}`, {
        method: "DELETE"
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (!currentPassword) {
      setPwError("Please enter your current password.");
      return;
    }

    setPwLoading(true);
    try {
      const response = await fetch("/api/auth/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword })
      });

      const data = await response.json();
      if (response.ok) {
        setIsCurrentPasswordVerified(true);
        setPwSuccess("Current password verified successfully! You can now set your new password below.");
      } else {
        setPwError(data.error || "Incorrect current password.");
        setIsCurrentPasswordVerified(false);
      }
    } catch (err) {
      console.error(err);
      setPwError("An error occurred. Please try again.");
    } finally {
      setPwLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError("Please fill out all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 4) {
      setPwError("Password must be at least 4 characters long.");
      return;
    }

    setPwLoading(true);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();
      if (response.ok) {
        setPwSuccess(data.message || "Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setIsCurrentPasswordVerified(false);
        loadAdminData(); // refresh audit logs
      } else {
        setPwError(data.error || "Failed to update password.");
      }
    } catch (err) {
      console.error(err);
      setPwError("An error occurred. Please try again.");
    } finally {
      setPwLoading(false);
    }
  };

  // Searching lists filter
  const searchedOrders = orders.filter((o) => {
    const matchesQuery = o.id.toLowerCase().includes(orderSearch.toLowerCase()) || 
                         o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
                         o.mobileNumber.includes(orderSearch);
    const matchesFilter = orderFilterStatus ? o.status === orderFilterStatus : true;
    return matchesQuery && matchesFilter;
  });

  const searchedCustomers = customers.filter((c) => {
    return c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
           c.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
           c.mobile.includes(customerSearch);
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      
      {/* Dashboard Brand Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-200 dark:border-gray-800 pb-5 mb-8 gap-4">
        <div>
          <span className="inline-flex items-center rounded-md bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800 border border-amber-200 uppercase tracking-wider">
            OWNER PRIVILEGES ONLY
          </span>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mt-1 flex items-center gap-2">
            SK Laundry Operations Dashboard
          </h1>
          <p className="text-gray-500 text-xs font-medium">Configure store settings, verification codes, transaction screenshots, and manage orders.</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadAdminData}
            disabled={refreshing}
            className="rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 p-2.5 text-gray-700 dark:text-gray-300 flex items-center space-x-1.5 text-xs font-bold transition-all cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            <span>Sync Ledger</span>
          </button>
        </div>
      </div>

      {/* DASHBOARD STATS WIDGETS CARDS */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-6 lg:grid-cols-6 mb-8">
        
        {/* Card 1 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-950 flex flex-col justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div className="mt-4">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Bookings</p>
            <p className="text-2xl font-black font-mono text-gray-900 dark:text-white mt-0.5">{stats.totalOrders || 0}</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-950 flex flex-col justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="mt-4">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Pending Washing</p>
            <p className="text-2xl font-black font-mono text-gray-900 dark:text-white mt-0.5">{stats.pendingOrders || 0}</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-950 flex flex-col justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div className="mt-4">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Delivered Out</p>
            <p className="text-2xl font-black font-mono text-gray-900 dark:text-white mt-0.5">{stats.completedOrders || 0}</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-950 flex flex-col justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400">
            <DollarSign className="h-5 w-5" />
          </div>
          <div className="mt-4">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Approved Revenue</p>
            <p className="text-2xl font-black font-mono text-gray-900 dark:text-white mt-0.5">₹{stats.totalRevenue || 0}</p>
          </div>
        </div>

        {/* Card 5 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-950 flex flex-col justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400">
            <Users className="h-5 w-5" />
          </div>
          <div className="mt-4">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Store Users</p>
            <p className="text-2xl font-black font-mono text-gray-900 dark:text-white mt-0.5">{stats.totalCustomers || 0}</p>
          </div>
        </div>

        {/* Card 6 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-950 flex flex-col justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">
            <Calendar className="h-5 w-5" />
          </div>
          <div className="mt-4">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Today's bookings</p>
            <p className="text-2xl font-black font-mono text-gray-900 dark:text-white mt-0.5">{stats.todayOrdersCount || 0}</p>
          </div>
        </div>

      </div>

      {/* DASHBOARD TAB CONTROLS NAVIGATION */}
      <div className="flex overflow-x-auto space-x-1 border-b border-gray-200 dark:border-gray-800 pb-2 mb-8 select-none">
        {[
          { id: 'orders', label: 'All Bookings', count: orders.length },
          { id: 'services', label: 'Pricing Editor', count: services.length },
          { id: 'payments', label: 'Payments Ledger', count: orders.filter(o => o.paymentStatus === 'Pending' && o.paymentMethod !== 'COD').length },
          { id: 'customers', label: 'Clients Roster', count: customers.length },
          { id: 'website', label: 'Website settings', count: null },
          { id: 'reports', label: 'Sales Reports', count: null },
          { id: 'security', label: 'Security & PIN', count: null }
        ].map((tab) => {
          const isActive = adminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id as any)}
              className={`flex items-center space-x-2 rounded-lg px-4.5 py-3 text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isActive 
                  ? "bg-brand-600 text-white shadow-md shadow-brand-500/10" 
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && tab.count > 0 && (
                <span className={`inline-flex items-center justify-center rounded-full h-5 px-1.5 text-[10px] font-extrabold ${isActive ? "bg-white text-brand-600" : "bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400"}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ---------------- SUB PANELS RENDER ---------------- */}

      {/* TAB 1: ALL ORDERS & METADATA MANAGER */}
      {adminTab === "orders" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders by Client name, Order ID, or Phone..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-xs focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-950 text-gray-900 dark:text-white"
              />
            </div>
            
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Filter className="h-4.5 w-4.5 text-gray-400 flex-shrink-0" />
              <select
                value={orderFilterStatus}
                onChange={(e) => setOrderFilterStatus(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs focus:outline-hidden dark:border-gray-800 dark:bg-gray-950 text-gray-700 dark:text-gray-300 w-full"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Pickup Scheduled">Pickup Scheduled</option>
                <option value="Picked Up">Picked Up</option>
                <option value="Washing">Washing</option>
                <option value="Drying">Drying</option>
                <option value="Steam Ironing">Steam Ironing</option>
                <option value="Quality Check">Quality Check</option>
                <option value="Ready">Ready</option>
                <option value="Out For Delivery">Out For Delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-x-auto shadow-xs">
            <table className="w-full text-xs text-left min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                  <th className="py-3.5 px-4 font-sans text-[10px]">Order ID</th>
                  <th className="py-3.5 px-4 font-sans text-[10px]">Customer Name</th>
                  <th className="py-3.5 px-4 font-sans text-[10px]">Phone Number</th>
                  <th className="py-3.5 px-4 font-sans text-[10px]">Booked Items</th>
                  <th className="py-3.5 px-4 font-sans text-[10px]">Garment Count</th>
                  <th className="py-3.5 px-4 font-sans text-[10px]">Order Value</th>
                  <th className="py-3.5 px-4 font-sans text-[10px]">Pickup Date</th>
                  <th className="py-3.5 px-4 font-sans text-[10px]">Order Status</th>
                  <th className="py-3.5 px-4 font-sans text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 dark:divide-gray-800">
                {searchedOrders.map((ord) => {
                  const garmentCount = ord.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
                  return (
                    <tr key={ord.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/5 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-brand-600 dark:text-brand-400 select-all">{ord.id}</td>
                      <td className="py-4 px-4 font-bold text-gray-900 dark:text-white">{ord.customerName}</td>
                      <td className="py-4 px-4 font-mono text-gray-500 dark:text-gray-400 font-semibold">{ord.mobileNumber}</td>
                      <td className="py-4 px-4 py-3 space-y-1">
                        {ord.items?.map((item, idx) => {
                          const name = item.name;
                          const serviceType = item.serviceType;
                          const displayString = serviceType && !name.includes(`(${serviceType})`)
                            ? `${item.quantity} × ${name} (${serviceType})`
                            : `${item.quantity} × ${name}`;
                          return (
                            <p key={idx} className="text-[11px] text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">
                              {displayString}
                            </p>
                          );
                        })}
                      </td>
                      <td className="py-4 px-4 font-bold text-gray-700 dark:text-gray-300 text-center font-mono">{garmentCount}</td>
                      <td className="py-4 px-4 font-extrabold text-brand-600 dark:text-brand-400 font-mono">₹{ord.totalPrice}</td>
                      <td className="py-4 px-4">
                        <p className="font-bold text-gray-800 dark:text-white">{ord.pickupDate}</p>
                        <p className="text-gray-400 mt-0.5 font-sans font-medium">{ord.pickupTime}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                          ord.status === "Delivered" 
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20" 
                            : "bg-blue-50 text-blue-700 dark:bg-blue-950/20"
                        }`}>
                          {ord.status}
                        </span>
                        <p className="text-[10px] text-gray-400 font-mono mt-1 font-semibold">Payment: {ord.paymentStatus}</p>
                      </td>
                      <td className="py-4 px-4 text-right flex justify-end space-x-1.5 items-center">
                        <button
                          onClick={() => setViewingOrderDetails(ord)}
                          className="rounded bg-teal-50 hover:bg-teal-100 text-teal-700 dark:bg-teal-950/20 dark:text-teal-400 dark:hover:bg-teal-950/40 p-2 font-bold cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingOrder(ord);
                            setNewOrderStatus(ord.status);
                          }}
                          className="rounded bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-950/20 dark:text-brand-400 dark:hover:bg-brand-950/40 p-2 font-bold cursor-pointer"
                          title="Update Status"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(ord.id)}
                          className="rounded bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:hover:bg-red-950/40 p-2 font-bold cursor-pointer"
                          title="Delete Order"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {searchedOrders.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-gray-400 text-sm">No laundry bookings matched your search query.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PRICING / SERVICE RATES EDITOR */}
      {adminTab === "services" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white">Active Service Pricing Directory</h3>
            <button
              onClick={() => {
                setEditingService(null);
                setServiceName("");
                setServiceType("Wash Iron");
                setServicePrice("");
                setServiceCategory("MEN");
                setIsServiceModalOpen(true);
              }}
              className="inline-flex items-center space-x-1 rounded-xl bg-brand-600 text-white font-bold text-xs px-4 py-2.5 shadow-md shadow-brand-500/10 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Custom Rate</span>
            </button>
          </div>

          <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xs">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                  <th className="py-3 px-4 font-sans text-[10px]">Category</th>
                  <th className="py-3 px-4 font-sans text-[10px]">Garment Item Name</th>
                  <th className="py-3 px-4 font-sans text-[10px]">Service Type</th>
                  <th className="py-3 px-4 font-sans text-[10px]">Rate per Item</th>
                  <th className="py-3 px-4 font-sans text-[10px] text-right">Settings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 dark:divide-gray-800">
                {services.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/50">
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center rounded-md bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 font-bold uppercase tracking-wider text-[9px] text-gray-500 dark:text-gray-400">
                        {s.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">{s.name}</td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">{s.serviceType || "Wash Iron"}</td>
                    <td className="py-3 px-4 font-black font-mono text-brand-600 dark:text-brand-400 text-sm">₹{s.price}</td>
                    <td className="py-3 px-4 text-right flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setEditingService(s);
                          setServiceName(s.name);
                          setServiceType(s.serviceType || "Wash Iron");
                          setServicePrice(s.price.toString());
                          setServiceCategory(s.category);
                          setIsServiceModalOpen(true);
                        }}
                        className="rounded bg-brand-50 text-brand-700 p-1.5 hover:bg-brand-100 cursor-pointer"
                        title="Edit Price"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteService(s.id)}
                        className="rounded bg-red-50 text-red-600 p-1.5 hover:bg-red-100 cursor-pointer"
                        title="Delete Rate"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PAYMENTS APPROVAL / LEDGER SCREENSHOT VERIFICATION */}
      {adminTab === "payments" && (
        <div className="space-y-6">
          <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white">Screenshot Verification Queue</h3>
          <p className="text-xs text-gray-500">View user submitted mobile UPI transaction receipts and mark ledger as 'Paid' to release laundry.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orders.filter(o => o.paymentScreenshot && o.paymentStatus !== "Paid").map((o) => (
              <div key={o.id} className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl p-5 shadow-xs space-y-4">
                
                {/* Visual Card Header */}
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-900 pb-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400 select-all">{o.id}</span>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white mt-1">Client: {o.customerName}</h4>
                    <p className="text-xs text-gray-400 font-mono">{o.mobileNumber}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                      Verify Screen
                    </span>
                    <p className="text-base font-extrabold text-brand-600 dark:text-brand-400 font-mono mt-1">₹{o.totalPrice}</p>
                  </div>
                </div>

                {/* Screenshot layout frame (Pristine, no broken boxes, elegantly scaled) */}
                <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 h-80">
                  <img 
                    src={o.paymentScreenshot} 
                    alt="Receipt Uploaded by Customer" 
                    className="h-full w-full object-contain" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[9px] font-mono px-2 py-1 rounded">
                    UPI Screenshot Proof
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprovePayment(o.id)}
                    className="w-full inline-flex items-center justify-center space-x-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-3 cursor-pointer"
                  >
                    <Check className="h-4 w-4" />
                    <span>Approve & Mark Paid</span>
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("Mark as Failed?")) {
                        fetch(`/api/orders/${o.id}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ paymentStatus: "Failed" })
                        }).then(() => loadAdminData());
                      }
                    }}
                    className="rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 font-bold text-xs px-4 py-3 dark:border-gray-800 cursor-pointer"
                  >
                    Reject
                  </button>
                </div>

              </div>
            ))}

            {orders.filter(o => o.paymentScreenshot && o.paymentStatus !== "Paid").length === 0 && (
              <div className="col-span-1 md:col-span-2 bg-white dark:bg-gray-950 border border-gray-100 p-12 rounded-3xl text-center text-gray-400">
                <p className="text-sm">No payment screens in the verification queue. All UPI transactions cleared.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: CLIENTS DIRECTORY ROSTER */}
      {adminTab === "customers" && (
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients by name, email database, or 10-digit mobile..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-xs focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-950 text-gray-900 dark:text-white"
            />
          </div>

          <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xs">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                  <th className="py-3 px-4 font-sans text-[10px]">Client Name</th>
                  <th className="py-3 px-4 font-sans text-[10px]">Email Database</th>
                  <th className="py-3 px-4 font-sans text-[10px]">Mobile Contact</th>
                  <th className="py-3 px-4 font-sans text-[10px]">Loyalty Accumulation</th>
                  <th className="py-3 px-4 font-sans text-[10px]">Lock State</th>
                  <th className="py-3 px-4 font-sans text-[10px] text-right">Delete Card</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 dark:divide-gray-800">
                {searchedCustomers.map((c) => {
                  const isBlocked = blockedUserIds.includes(c.id);
                  return (
                    <tr key={c.id} className="hover:bg-gray-50/50">
                      <td className="py-4 px-4 font-bold text-gray-900 dark:text-white">{c.name}</td>
                      <td className="py-4 px-4 font-mono">{c.email}</td>
                      <td className="py-4 px-4 font-mono">{c.mobile}</td>
                      <td className="py-4 px-4 font-bold text-emerald-600 font-mono">{c.loyaltyPoints || 0} Points</td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleBlockToggle(c.id, isBlocked)}
                          className={`rounded px-3 py-1 text-[10px] font-bold uppercase border cursor-pointer ${
                            isBlocked 
                              ? "bg-red-50 border-red-200 text-red-700" 
                              : "bg-emerald-50 border-emerald-200 text-emerald-700"
                          }`}
                        >
                          {isBlocked ? "Suspended" : "Active"}
                        </button>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleDeleteCustomer(c.id)}
                          className="text-red-500 hover:text-red-600 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: WEBSITE CONTENT / METADATA settings */}
      {adminTab === "website" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Global contact setup */}
          <div className="lg:col-span-6 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-xs space-y-6">
            <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white">Store Address & Metadata</h3>
            
            <form onSubmit={handleSaveWebsiteSettings} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Physical Street Location</label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-950 text-gray-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">UPI Merchant ID</label>
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-950 text-gray-900 dark:text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contact Phone Numbers (Comma Separated)</label>
                <input
                  type="text"
                  required
                  value={phoneNumbers}
                  onChange={(e) => setPhoneNumbers(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-950 text-gray-900 dark:text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Hero banner Main Title</label>
                <input
                  type="text"
                  required
                  value={bannerText}
                  onChange={(e) => setBannerText(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-950 text-gray-900 dark:text-white font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Hero banner Subtext</label>
                <textarea
                  required
                  rows={2}
                  value={bannerSubtext}
                  onChange={(e) => setBannerSubtext(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-950 text-gray-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-3 cursor-pointer"
              >
                Publish Store Metadata
              </button>
            </form>
          </div>

          {/* FAQs & promo coupons lists */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Promo Coupon Creator */}
            <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white">Active Promo Coupons</h3>
              
              <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1">
                {settings.coupons?.map((c) => (
                  <div key={c.code} className="flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 p-2 rounded-xl border border-gray-150">
                    <div className="text-xs">
                      <p className="font-extrabold text-brand-600 font-mono uppercase">{c.code}</p>
                      <p className="text-[10px] text-gray-400">{c.description} (Min Order: ₹{c.minOrderValue})</p>
                    </div>
                    <button
                      onClick={() => handleDeleteCoupon(c.code)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddCoupon} className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-900">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="CODE (e.g. SAVE20)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs focus:outline-hidden dark:border-gray-800 text-gray-900 uppercase font-mono"
                  />
                  <input
                    type="number"
                    required
                    placeholder="Value (e.g. 20)"
                    value={couponValue}
                    onChange={(e) => setCouponValue(e.target.value)}
                    className="rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs focus:outline-hidden dark:border-gray-800 text-gray-900 font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={couponType}
                    onChange={(e) => setCouponType(e.target.value as any)}
                    className="rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs focus:outline-hidden dark:border-gray-800 text-gray-700"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Flat (₹)</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Min Order (e.g. 300)"
                    value={couponMinOrder}
                    onChange={(e) => setCouponMinOrder(e.target.value)}
                    className="rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs focus:outline-hidden dark:border-gray-800 text-gray-950 font-mono"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Coupon short tagline description"
                  value={couponDesc}
                  onChange={(e) => setCouponDesc(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs focus:outline-hidden dark:border-gray-800 text-gray-900"
                />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-gray-900 hover:bg-black text-white dark:bg-brand-600 dark:hover:bg-brand-700 font-bold text-xs py-2 cursor-pointer"
                >
                  Create Coupon Code
                </button>
              </form>
            </div>

            {/* FAQ Manager */}
            <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white">Active FAQ List</h3>
              
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {settings.faqs?.map((f) => (
                  <div key={f.id} className="flex justify-between items-start bg-gray-50 dark:bg-gray-900/50 p-2.5 rounded-xl border border-gray-150">
                    <div className="text-[11px] leading-relaxed">
                      <p className="font-bold text-gray-800 dark:text-white">Q: {f.question}</p>
                      <p className="text-gray-500 mt-0.5">A: {f.answer}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteFAQ(f.id)}
                      className="text-red-500 hover:text-red-600 flex-shrink-0 ml-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddFAQ} className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-900">
                <input
                  type="text"
                  required
                  placeholder="Enter Question..."
                  value={newFaqQ}
                  onChange={(e) => setNewFaqQ(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-xs focus:outline-hidden dark:border-gray-800 text-gray-950"
                />
                <textarea
                  required
                  rows={2}
                  placeholder="Enter Answer description..."
                  value={newFaqA}
                  onChange={(e) => setNewFaqA(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-xs focus:outline-hidden dark:border-gray-800 text-gray-950"
                />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-gray-900 hover:bg-black text-white dark:bg-brand-600 dark:hover:bg-brand-700 font-bold text-xs py-2.5 cursor-pointer"
                >
                  Create FAQ Node
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* TAB 6: REPORTS & EXCEL/PDF LAYOUT STATS */}
      {adminTab === "reports" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-900 pb-3">
            <div>
              <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white">Financial Statement & Ledger Reports</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">Audited statistics compiling daily bookings and cleared store revenues.</p>
            </div>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center space-x-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-4 py-2.5 cursor-pointer shadow-md"
            >
              <Printer className="h-4 w-4" />
              <span>Print Statement</span>
            </button>
          </div>

          {/* Styled vector chart simulation for fast compiling and robust UI (PDF printable) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Last 7 Days chart simulation (Prisitne SVGs) */}
            <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-xs">
              <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-4">Last 7 Days Sales Trend (₹)</h4>
              
              <div className="h-48 flex items-end space-x-4 border-b border-l border-gray-100 dark:border-gray-800 pb-2 pl-2">
                {last7Days.map((day, idx) => {
                  const maxRevenue = Math.max(...last7Days.map(d => d.revenue), 100);
                  const barHeightPercent = Math.min(100, Math.max(10, (day.revenue / maxRevenue) * 100));
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center group relative">
                      {/* Tooltip on hover */}
                      <span className="absolute -top-8 bg-black text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        ₹{day.revenue} ({day.orders} orders)
                      </span>
                      {/* Bar */}
                      <div 
                        style={{ height: `${barHeightPercent}%` }}
                        className="w-full bg-brand-600 hover:bg-brand-700 rounded-t-md transition-all cursor-pointer"
                      />
                      <span className="text-[9px] font-mono text-gray-400 mt-2 font-bold">{day.date}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Audit Logs Directory */}
            <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-xs space-y-4">
              <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider">System Audit Logs (Top 15)</h4>
              <div className="max-h-48 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-900 pr-1 space-y-2">
                {auditLogs.map((log) => (
                  <div key={log.id} className="text-[10px] pt-1.5 first:pt-0 leading-relaxed">
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-900 dark:text-white font-bold">{log.action}</span>
                      <span className="text-gray-400 font-mono">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-gray-400 mt-0.5 font-mono">By: {log.user}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Statement breakdown table */}
          <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xs">
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 font-bold text-xs text-gray-500 uppercase">Monthly ledger balance sheet</div>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400">
                  <th className="py-3 px-6 font-semibold">Statement Month</th>
                  <th className="py-3 px-6 font-semibold text-center">Completed Orders</th>
                  <th className="py-3 px-6 font-semibold text-right">Settled Revenue (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 dark:divide-gray-800">
                {yearlyData.map((m, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="py-2.5 px-6 font-bold">{m.month} {new Date().getFullYear()}</td>
                    <td className="py-2.5 px-6 text-center font-bold text-gray-600 font-mono">{m.orders} orders</td>
                    <td className="py-2.5 px-6 text-right font-black font-mono text-brand-600 dark:text-brand-400">₹{m.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: SECURITY & PIN CONFIGURATION */}
      {adminTab === "security" && (
        <div className="max-w-md mx-auto bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-md space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto h-12 w-12 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Key className="h-6 w-6" />
            </div>
            <h3 className="font-display text-xl font-extrabold text-gray-900 dark:text-white">Change Owner PIN & Password</h3>
            <p className="text-xs text-gray-500">Update your credentials to secure access to the SK Laundry admin panel.</p>
          </div>

          {pwError && (
            <div className="flex items-center space-x-2 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-3 text-xs font-semibold">
              <AlertTriangle className="h-4.5 w-4.5 flex-shrink-0" />
              <span>{pwError}</span>
            </div>
          )}

          {pwSuccess && (
            <div className="flex items-center space-x-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 p-3 text-xs font-semibold">
              <CheckCircle className="h-4.5 w-4.5 flex-shrink-0" />
              <span>{pwSuccess}</span>
            </div>
          )}

          {!isCurrentPasswordVerified ? (
            <form onSubmit={handleVerifyPassword} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4.5 w-4.5 text-gray-400" />
                  <input
                    type={showCurrent ? "text" : "password"}
                    required
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-xs focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-950 text-gray-900 dark:text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-hidden"
                  >
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={pwLoading}
                className="w-full rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-3 cursor-pointer shadow-md shadow-brand-500/10 disabled:opacity-50 flex items-center justify-center space-x-1.5"
              >
                {pwLoading ? (
                  <span>Verifying Password...</span>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Verify Current Password</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="rounded-xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-950/10 p-3 flex justify-between items-center">
                <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                  <span>Current Password Verified</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsCurrentPasswordVerified(false);
                    setPwSuccess("");
                    setPwError("");
                  }}
                  className="text-[10px] text-gray-500 hover:text-brand-600 hover:underline"
                >
                  Change
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">New Password / PIN</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4.5 w-4.5 text-gray-400" />
                  <input
                    type={showNew ? "text" : "password"}
                    required
                    placeholder="At least 4 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-xs focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-950 text-gray-900 dark:text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-hidden"
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Confirm New Password / PIN</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4.5 w-4.5 text-gray-400" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    required
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-xs focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-950 text-gray-900 dark:text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-hidden"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={pwLoading}
                className="w-full rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-3 cursor-pointer shadow-md shadow-brand-500/10 disabled:opacity-50 flex items-center justify-center space-x-1.5"
              >
                {pwLoading ? (
                  <span>Updating Credentials...</span>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Update Credentials</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* ---------------- MODALS / EDITORS OVERLAYS ---------------- */}

      {/* VIEW ORDER DETAILS MODAL */}
      {viewingOrderDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl text-left">
            
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
              <div>
                <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white">Order Details</h3>
                <p className="text-xs font-mono text-brand-600 dark:text-brand-400 font-bold mt-0.5">{viewingOrderDetails.id}</p>
              </div>
              <button onClick={() => setViewingOrderDetails(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Customer Details Section */}
            <div className="space-y-2.5">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Customer Details</h4>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800/55 text-xs">
                <div>
                  <p className="text-gray-400 font-medium">Name</p>
                  <p className="font-bold text-gray-900 dark:text-white mt-0.5">{viewingOrderDetails.customerName}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-medium">Phone</p>
                  <p className="font-bold text-gray-900 dark:text-white mt-0.5 font-mono">{viewingOrderDetails.mobileNumber}</p>
                </div>
                <div className="col-span-2 border-t border-gray-200/50 dark:border-gray-800 pt-2.5">
                  <p className="text-gray-400 font-medium">Address</p>
                  <p className="font-bold text-gray-900 dark:text-white mt-0.5 leading-relaxed">{viewingOrderDetails.address}</p>
                </div>
              </div>
            </div>

            {/* Order Details Section */}
            <div className="space-y-2.5">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Order Details</h4>
              <div className="border border-gray-150 dark:border-gray-800 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-bold uppercase text-[9px] tracking-wider border-b border-gray-150 dark:border-gray-800">
                      <th className="py-2.5 px-3">Item Details</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {viewingOrderDetails.items?.map((item, idx) => {
                      const subtotal = item.price * item.quantity;
                      return (
                        <tr key={idx} className="hover:bg-gray-50/30 dark:hover:bg-gray-900/10">
                          <td className="py-3 px-3">
                            <p className="font-bold text-gray-900 dark:text-white">{item.name}</p>
                            <div className="flex gap-1.5 mt-0.5 text-[10px] items-center">
                              <span className="bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">{item.category}</span>
                              <span className="text-gray-400 font-medium">{item.serviceType || "Wash Iron"}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-gray-800 dark:text-gray-200 font-mono">Qty: {item.quantity}</td>
                          <td className="py-3 px-3 text-right text-gray-500 dark:text-gray-400 font-mono">₹{item.price}</td>
                          <td className="py-3 px-3 text-right font-black text-gray-900 dark:text-white font-mono">₹{subtotal}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals Summary */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 flex flex-col items-end space-y-1.5 text-xs">
              {viewingOrderDetails.discountAmount && viewingOrderDetails.discountAmount > 0 ? (
                <div className="flex justify-between w-48 text-rose-500 font-bold">
                  <span>Coupon Discount:</span>
                  <span className="font-mono">- ₹{viewingOrderDetails.discountAmount}</span>
                </div>
              ) : null}
              <div className="flex justify-between w-48 text-sm font-extrabold text-gray-900 dark:text-white pt-1">
                <span>Grand Total:</span>
                <span className="text-brand-600 dark:text-brand-400 font-mono">₹{viewingOrderDetails.totalPrice}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setViewingOrderDetails(null)}
                className="rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 dark:border-gray-800 dark:hover:bg-gray-900 dark:text-gray-300 font-bold text-xs py-2.5 px-5 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. ORDER STATUS MODAL EDITOR */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-900 pb-2">
              <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white">Modify Stage Status: {editingOrder.id}</h3>
              <button onClick={() => setEditingOrder(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateOrderStatus} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase block">Processing Stage</label>
                <select
                  value={newOrderStatus}
                  onChange={(e) => setNewOrderStatus(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-sm focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
                >
                  <option value="Pending">Pending</option>
                  <option value="Pickup Scheduled">Pickup Scheduled</option>
                  <option value="Picked Up">Picked Up</option>
                  <option value="Washing">Washing</option>
                  <option value="Drying">Drying</option>
                  <option value="Steam Ironing">Steam Ironing</option>
                  <option value="Quality Check">Quality Check</option>
                  <option value="Ready">Ready</option>
                  <option value="Out For Delivery">Out For Delivery</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase block">Timeline Progress Note</label>
                <input
                  type="text"
                  placeholder="e.g. Garments cleaned under corporate dry-clean slot"
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-xs focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 text-gray-950"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-3 cursor-pointer"
                >
                  Publish Progress Update
                </button>
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="w-full rounded-xl border border-gray-200 text-gray-500 font-bold text-xs py-3 dark:border-gray-800 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* 2. ADD/EDIT SERVICE PRICING MODAL EDITOR */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-900 pb-2">
              <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white">
                {editingService ? "Update Price Rate Card" : "Add Service Rate Card"}
              </h3>
              <button onClick={() => setIsServiceModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase block">Garment Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Silk Designer Lehenga"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-xs focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 text-gray-950"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase block">Service Type</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Steam Iron, Wash Fold, Dry Cleaning"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-xs focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 text-gray-950"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase block">Price per Unit (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 150"
                  value={servicePrice}
                  onChange={(e) => setServicePrice(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-xs focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 text-gray-950 font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase block">Category Folder</label>
                <select
                  value={serviceCategory}
                  onChange={(e) => setServiceCategory(e.target.value as any)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-xs focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
                >
                  <option value="MEN">MEN'S WEAR</option>
                  <option value="WOMEN">WOMEN'S ETHNIC/WESTERN</option>
                  <option value="HOUSEHOLD">HOUSEHOLD LINEN</option>
                  <option value="KIDS">KIDS' HYGIENIC</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-3 cursor-pointer"
                >
                  Save Service Rate
                </button>
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="w-full rounded-xl border border-gray-200 text-gray-500 font-bold text-xs py-3 dark:border-gray-800 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
