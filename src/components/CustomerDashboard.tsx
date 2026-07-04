import React from "react";
import { 
  WashingMachine, 
  MapPin, 
  User as UserIcon, 
  Calendar, 
  Clock, 
  CreditCard, 
  ShoppingBag, 
  Star,
  Award,
  CheckCircle,
  TrendingUp,
  FileText,
  Printer,
  ChevronRight,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { Order, User, LaundryItem } from "../types";

interface CustomerDashboardProps {
  currentUser: User;
  setCurrentUser: (user: User | null) => void;
  setActivePage: (page: string) => void;
  services: LaundryItem[];
  setInitialTrackingId: (id: string) => void;
}

export default function CustomerDashboard({ 
  currentUser, 
  setCurrentUser, 
  setActivePage,
  services,
  setInitialTrackingId
}: CustomerDashboardProps) {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  const [loading, setLoading] = React.useState(true);
  
  // Profile update fields
  const [name, setName] = React.useState(currentUser.name);
  const [email, setEmail] = React.useState(currentUser.email);
  const [mobile, setMobile] = React.useState(currentUser.mobile);
  const [address, setAddress] = React.useState(currentUser.address || "");
  const [profileMsg, setProfileMsg] = React.useState("");

  // Review submission fields
  const [reviewText, setReviewText] = React.useState("");
  const [reviewRating, setReviewRating] = React.useState(5);
  const [reviewMsg, setReviewMsg] = React.useState("");

  React.useEffect(() => {
    fetchOrders();
  }, [currentUser]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/orders?customerId=${currentUser.id}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg("");
    // In real app, this would hit an API. Let's simulate a quick local edit
    try {
      const updatedUser = { ...currentUser, name, email, mobile, address };
      setCurrentUser(updatedUser);
      localStorage.setItem("skl_user", JSON.stringify(updatedUser));
      setProfileMsg("Profile updated successfully!");
    } catch (err) {
      setProfileMsg("Failed to update profile.");
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewMsg("");
    if (!reviewText) return;

    try {
      const response = await fetch("/api/settings/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: currentUser.name,
          rating: reviewRating,
          review: reviewText
        })
      });
      if (response.ok) {
        setReviewMsg("Feedback registered! Thank you so much.");
        setReviewText("");
      } else {
        setReviewMsg("Failed to log review.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTrackOrder = (orderId: string) => {
    setInitialTrackingId(orderId);
    setActivePage("track-order");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      
      {/* Dashboard Top banner */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-800 text-white rounded-3xl p-6 md:p-8 shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
            <Award className="h-3.5 w-3.5" />
            <span>Loyalty Member</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Welcome, {currentUser.name}!</h1>
          <p className="text-brand-100 text-xs">Manage active laundry bookings, download tax invoices, and edit credentials.</p>
        </div>

        {/* Loyalty points card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center space-x-4">
          <div className="h-12 w-12 bg-white text-brand-600 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm">
            🌟
          </div>
          <div>
            <p className="text-[10px] text-brand-200 font-bold uppercase tracking-wider">Your Balance</p>
            <p className="text-xl font-black font-mono">{currentUser.loyaltyPoints || 0} Points</p>
            <p className="text-[9px] text-brand-200 mt-0.5">1 Point per ₹100 spent (used as direct cash discounts!)</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Order Listing & details */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Bookings section */}
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-xs">
            <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-4">Your Bookings & Invoices</h2>

            {loading ? (
              <p className="text-sm text-gray-400 py-6 text-center">Fetching your laundry logs...</p>
            ) : orders.length > 0 ? (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {orders.map((ord) => (
                  <div key={ord.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400 select-all">{ord.id}</span>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          ord.status === "Delivered"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20"
                            : "bg-blue-50 text-blue-700 dark:bg-blue-950/20"
                        }`}>
                          {ord.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-mono">
                        Placed: {new Date(ord.createdAt).toLocaleDateString()} | Total: ₹{ord.totalPrice} ({ord.items?.length || 0} items)
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Scheduled Pickup: {ord.pickupDate} ({ord.pickupTime})
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTrackOrder(ord.id)}
                        className="rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs px-3.5 py-2.5 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900 cursor-pointer"
                      >
                        Track Progress
                      </button>
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-3.5 py-2.5 transition-colors cursor-pointer"
                      >
                        Print Invoice
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-400">
                <p className="text-sm">You haven't scheduled any laundry bookings yet.</p>
                <button
                  onClick={() => setActivePage("order-now")}
                  className="mt-4 inline-flex items-center space-x-1.5 rounded-xl bg-brand-600 px-5 py-3 text-xs font-semibold text-white hover:bg-brand-700 cursor-pointer"
                >
                  <WashingMachine className="h-4 w-4" />
                  <span>Book Pickup Now</span>
                </button>
              </div>
            )}
          </div>

          {/* Submit Client Review block */}
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-xs">
            <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white mb-2">Write Store Review</h3>
            <p className="text-xs text-gray-500 mb-4">Your review helps residents in Balanagar find premium hygiene fabric care.</p>
            
            {reviewMsg && (
              <p className="rounded-xl bg-emerald-50 text-emerald-700 p-3 text-xs font-semibold mb-4 border border-emerald-100">{reviewMsg}</p>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Rating Star</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star className={`h-6 w-6 ${reviewRating >= star ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Feedback Description</label>
                <textarea
                  required
                  rows={2}
                  placeholder="The steam press on my corporate shirts looks flawless! Delivery was exactly within 24 hours. Highly recommended."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3.5 text-xs focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-950 text-gray-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-4.5 py-3 cursor-pointer"
              >
                Log Feedback
              </button>
            </form>
          </div>

        </div>

        {/* Right Side: Profile settings */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-xs">
            <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white mb-2">Profile Credentials</h3>
            <p className="text-xs text-gray-500 mb-4">Edit directory information used for automatic bookings pre-filling.</p>
            
            {profileMsg && (
              <p className="rounded-xl bg-emerald-50 text-emerald-700 p-3 text-xs font-semibold mb-4 border border-emerald-100">{profileMsg}</p>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-950 text-gray-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-950 text-gray-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mobile Contact</label>
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-950 text-gray-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Default Delivery Location</label>
                <textarea
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-950 text-gray-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-gray-900 hover:bg-black text-white dark:bg-brand-600 dark:hover:bg-brand-700 font-bold text-xs py-3 cursor-pointer"
              >
                Save Details
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* Invoice Generator Modal Dialog (Pristine layout, zero broken icons, printable as standard page) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl border border-gray-100 text-gray-900">
            
            {/* Modal Controls */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Garment Tax Invoice</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center space-x-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 px-3.5 py-1.5 text-xs font-bold text-gray-700 cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print / PDF</span>
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-bold px-3 py-1.5 text-gray-500 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Printable Invoice Container */}
            <div id="printable-invoice" className="bg-white p-6 space-y-6 border border-gray-100 rounded-2xl">
              
              {/* Invoice Header */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-display text-lg font-black tracking-tight text-brand-600">SK LAUNDRY SERVICES</h3>
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mt-0.5">HYGIENE FABRIC CLINIC</p>
                  <p className="text-[9px] text-gray-400 leading-relaxed mt-1 max-w-xs">
                    Geetha Nagar, 8-4-300, Beside St. Martin School, Kandri Gutta, Balanagar, Hyderabad, Telangana – 500042
                  </p>
                  <p className="text-[9px] font-mono text-gray-400 mt-1">Reg No: SEA/MED/ALO/QB/1174332/2025</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700">
                    TAX INVOICE
                  </span>
                  <p className="text-sm font-bold text-gray-800 mt-2 font-mono">{selectedOrder.id}</p>
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                    {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Billed To / Shipping */}
              <div className="grid grid-cols-2 gap-4 border-t border-b border-gray-100 py-4 text-xs">
                <div>
                  <h4 className="font-bold text-gray-400 uppercase tracking-wider text-[9px]">Client Details</h4>
                  <p className="font-bold text-gray-800 mt-1">{selectedOrder.customerName}</p>
                  <p className="text-gray-500 mt-0.5">{selectedOrder.mobileNumber}</p>
                  {currentUser.email && <p className="text-gray-400">{currentUser.email}</p>}
                </div>
                <div>
                  <h4 className="font-bold text-gray-400 uppercase tracking-wider text-[9px]">Store Logistics</h4>
                  <p className="font-semibold text-gray-700 mt-1">Pickup Scheduled:</p>
                  <p className="text-gray-500">{selectedOrder.pickupDate} ({selectedOrder.pickupTime})</p>
                  <p className="font-semibold text-gray-700 mt-1">Est Delivery Slot:</p>
                  <p className="text-gray-500">{selectedOrder.deliveryDate}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <h4 className="font-bold text-gray-400 uppercase tracking-wider text-[9px]">Garments Breakdown</h4>
                
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-gray-50 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                      <th className="py-2 px-3">Item Description</th>
                      <th className="py-2 px-3 text-center">Qty</th>
                      <th className="py-2 px-3 text-right">Unit Rate (₹)</th>
                      <th className="py-2 px-3 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedOrder.items?.map((item, idx) => {
                      const displayName = item.serviceType && !item.name.includes(`(${item.serviceType})`)
                        ? `${item.name} (${item.serviceType})`
                        : item.name;
                      return (
                        <tr key={idx} className="hover:bg-gray-50/50">
                          <td className="py-2 px-3">
                            <p className="font-bold text-gray-800">{displayName}</p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">{item.category} {item.serviceType || "WASH"}</p>
                          </td>
                          <td className="py-2 px-3 text-center font-semibold text-gray-700 font-mono">{item.quantity}</td>
                          <td className="py-2 px-3 text-right text-gray-600 font-mono">₹{item.price}</td>
                          <td className="py-2 px-3 text-right font-bold text-gray-800 font-mono">₹{item.price * item.quantity}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Invoice Calculations */}
              <div className="border-t border-gray-100 pt-4 flex justify-end text-xs">
                <div className="w-64 space-y-2.5">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal Cost</span>
                    <span className="font-bold font-mono">₹{selectedOrder.items?.reduce((sum, i) => sum + (i.price * i.quantity), 0)}</span>
                  </div>
                  
                  {selectedOrder.discountAmount && selectedOrder.discountAmount > 0 ? (
                    <div className="flex justify-between text-rose-500 font-semibold">
                      <span>Promo Discount ({selectedOrder.couponCode})</span>
                      <span className="font-mono">- ₹{selectedOrder.discountAmount}</span>
                    </div>
                  ) : null}

                  {/* GST info display */}
                  <div className="flex justify-between text-[10px] text-gray-400 border-t border-dashed border-gray-100 pt-2">
                    <span>CGST (0%) / SGST (0%)</span>
                    <span className="font-mono">₹0.00</span>
                  </div>

                  <div className="flex justify-between border-t border-gray-200 pt-2 text-sm font-black">
                    <span className="text-gray-900">Total Invoice Due</span>
                    <span className="text-brand-600 font-mono">₹{selectedOrder.totalPrice}</span>
                  </div>
                </div>
              </div>

              {/* Invoice footer */}
              <div className="border-t border-gray-100 pt-4 text-center space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Hygienically Cleaned & Quality Audited</p>
                <p className="text-[9px] text-gray-400 leading-relaxed">
                  Thank you for placing your trust with SK Laundry Services. For any query on this billing invoice, write to srikanth@sklaundry.com or call +91-7337427757 within 24 hours of delivery.
                </p>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
