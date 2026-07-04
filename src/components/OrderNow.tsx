import React from "react";
import { 
  WashingMachine, 
  Calendar, 
  MapPin, 
  CreditCard, 
  Upload, 
  Trash2, 
  Plus, 
  Minus, 
  FileText, 
  CheckCircle,
  AlertCircle,
  Copy,
  Tag,
  Clock,
  Sparkles
} from "lucide-react";
import { LaundryItem, Order, User, Coupon, AppSettings } from "../types";

interface OrderNowProps {
  services: LaundryItem[];
  currentUser: User | null;
  setActivePage: (page: string) => void;
  cart: Record<string, number>;
  setCart: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  settings: AppSettings;
  setInitialTrackingId?: (id: string) => void;
}

export default function OrderNow({ 
  services, 
  currentUser, 
  setActivePage, 
  cart, 
  setCart, 
  settings,
  setInitialTrackingId
}: OrderNowProps) {
  const [step, setStep] = React.useState(1);
  
  // Form fields
  const [customerName, setCustomerName] = React.useState(currentUser?.name || "");
  const [mobileNumber, setMobileNumber] = React.useState(currentUser?.mobile || "");
  const [pickupDate, setPickupDate] = React.useState("");
  const [pickupTime, setPickupTime] = React.useState("08:00 AM - 11:00 AM");
  const [deliveryDate, setDeliveryDate] = React.useState("");
  const [address, setAddress] = React.useState(currentUser?.address || "");
  const [notes, setNotes] = React.useState("");
  const [clothImages, setClothImages] = React.useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = React.useState<'COD' | 'UPI' | 'GPay' | 'PhonePe' | 'Paytm' | 'Razorpay'>('COD');
  const [paymentScreenshot, setPaymentScreenshot] = React.useState<string>("");
  
  // Coupon State
  const [couponCode, setCouponCode] = React.useState("");
  const [activeCoupon, setActiveCoupon] = React.useState<Coupon | null>(null);
  const [couponError, setCouponError] = React.useState("");
  const [couponDiscount, setCouponDiscount] = React.useState(0);

  // Success state
  const [submittedOrder, setSubmittedOrder] = React.useState<Order | null>(null);
  const [smsTriggerText, setSmsTriggerText] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  // Pre-fill fields if user changes
  React.useEffect(() => {
    if (currentUser) {
      setCustomerName(currentUser.name);
      setMobileNumber(currentUser.mobile);
      if (currentUser.address) setAddress(currentUser.address);
    }
  }, [currentUser]);

  // Set default delivery date (2 days after pickup)
  React.useEffect(() => {
    if (pickupDate) {
      const d = new Date(pickupDate);
      d.setDate(d.getDate() + 2); // default 48 hrs standard turnaround
      setDeliveryDate(d.toISOString().split("T")[0]);
    }
  }, [pickupDate]);

  // Calculate prices
  const getSubtotal = () => {
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const item = services.find(s => s.id === id);
      return sum + (item ? item.price * qty : 0);
    }, 0);
  };

  const getDeliveryCharge = () => {
    const sub = getSubtotal();
    return sub > 0 && sub < 500 ? 50 : 0;
  };

  // Recalculate discount whenever activeCoupon or subtotal changes
  React.useEffect(() => {
    const subtotal = getSubtotal();
    if (activeCoupon) {
      if (subtotal < activeCoupon.minOrderValue) {
        setCouponError(`Min order value of ₹${activeCoupon.minOrderValue} required for this coupon.`);
        setActiveCoupon(null);
        setCouponDiscount(0);
      } else {
        if (activeCoupon.discountType === "percentage") {
          setCouponDiscount(Math.round((subtotal * activeCoupon.value) / 100));
        } else {
          setCouponDiscount(activeCoupon.value);
        }
        setCouponError("");
      }
    } else {
      setCouponDiscount(0);
    }
  }, [activeCoupon, cart]);

  const getGrandTotal = () => {
    const sub = getSubtotal();
    const delivery = getDeliveryCharge();
    const total = sub - couponDiscount + delivery;
    return total < 0 ? 0 : total;
  };

  const handleApplyCoupon = () => {
    setCouponError("");
    const code = couponCode.toUpperCase().trim();
    if (!code) return;

    const coupon = settings.coupons?.find(c => c.code === code);
    if (!coupon) {
      setCouponError("Invalid coupon code.");
      return;
    }
    if (!coupon.isActive) {
      setCouponError("This coupon code is expired or inactive.");
      return;
    }

    const sub = getSubtotal();
    if (sub < coupon.minOrderValue) {
      setCouponError(`Minimum order value of ₹${coupon.minOrderValue} required.`);
      return;
    }

    setActiveCoupon(coupon);
  };

  const handleRemoveCoupon = () => {
    setActiveCoupon(null);
    setCouponDiscount(0);
    setCouponCode("");
  };

  // Handle image upload (converts to base64)
  const handleClothImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files);
      filesArr.forEach((file: any) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            setClothImages((prev) => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file as Blob);
      });
    }
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setPaymentScreenshot(reader.result as string);
        }
      };
      reader.readAsDataURL(file as Blob);
    }
  };

  const removeClothImage = (index: number) => {
    setClothImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQtyChange = (itemId: string, diff: number) => {
    setCart((prev) => {
      const updated = { ...prev };
      const val = (updated[itemId] || 0) + diff;
      if (val <= 0) {
        delete updated[itemId];
      } else {
        updated[itemId] = val;
      }
      return updated;
    });
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (getCartTotalItems() === 0) {
      alert("Please select at least one garment item.");
      return;
    }
    if (!pickupDate) {
      alert("Please specify your desired pickup date.");
      return;
    }
    if (!address || !mobileNumber) {
      alert("Pickup address and mobile number are mandatory.");
      return;
    }

    setSubmitting(true);

    const orderItems = Object.entries(cart).map(([id, qty]) => {
      const s = services.find(item => item.id === id)!;
      return {
        id: s.id,
        name: s.name,
        category: s.category,
        quantity: qty,
        price: s.price,
        serviceType: s.serviceType || "Wash Iron"
      };
    });

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: currentUser?.id,
          customerName,
          mobileNumber,
          items: orderItems,
          totalPrice: getGrandTotal(),
          pickupDate,
          pickupTime,
          deliveryDate,
          address,
          notes,
          clothImages,
          paymentMethod,
          paymentScreenshot: paymentScreenshot || undefined,
          couponCode: activeCoupon?.code,
          discountAmount: couponDiscount
        })
      });

      const data = await response.json();
      if (data.success) {
        setSubmittedOrder(data.order);
        setSmsTriggerText(data.smsTriggerMessage);
        setCart({}); // clear cart
      } else {
        alert(data.error || "Failed to submit order. Please try again.");
      }
    } catch (e) {
      console.error(e);
      alert("Network error submiting order. Check server connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const getCartTotalItems = () => {
    return Object.values(cart).reduce((sum, count) => sum + count, 0);
  };

  const nextStep = () => {
    if (step === 1 && getCartTotalItems() === 0) {
      alert("Please add at least one item to your basket to continue.");
      return;
    }
    if (step === 2 && (!pickupDate || !pickupTime)) {
      alert("Please choose both pickup date and time slots.");
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  // Dynamic UPI URL for direct scanning in real apps
  const upiQueryUrl = `upi://pay?pa=${settings.upiId}&pn=SK%20LAUNDRY%20SERVICES&am=${getGrandTotal()}&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiQueryUrl)}`;

  if (submittedOrder) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="rounded-3xl border border-gray-100 bg-white p-8 dark:border-gray-800 dark:bg-gray-950 shadow-xl space-y-6">
          <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto dark:bg-emerald-950/40 dark:text-emerald-400">
            <CheckCircle className="h-9 w-9" />
          </div>
          
          <div>
            <h2 className="font-display text-3xl font-extrabold text-gray-900 dark:text-white">Order Registered!</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
              Your pickup has been successfully scheduled. Our executive will arrive as per details below.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 text-left space-y-4">
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
              <span className="text-xs font-semibold text-gray-400">UNIQUE ORDER ID</span>
              <span className="font-mono text-sm font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1.5 select-all">
                {submittedOrder.id}
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(submittedOrder.id);
                    alert("Order ID copied!");
                  }}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-gray-400">Scheduled Pickup</p>
                <p className="font-bold text-gray-800 dark:text-white mt-1">
                  {submittedOrder.pickupDate} ({submittedOrder.pickupTime})
                </p>
              </div>
              <div>
                <p className="text-gray-400">Est. Delivery Date</p>
                <p className="font-bold text-gray-800 dark:text-white mt-1">{submittedOrder.deliveryDate}</p>
              </div>
              <div className="col-span-2 border-t border-gray-200 dark:border-gray-800 pt-3">
                <p className="text-gray-400">Address Details</p>
                <p className="font-medium text-gray-700 dark:text-gray-300 mt-1 leading-relaxed">{submittedOrder.address}</p>
              </div>
            </div>

            {/* Simulated SMS Alert */}
            <div className="border-t border-dashed border-gray-200 dark:border-gray-800 pt-4">
              <span className="text-[9px] font-bold tracking-wider text-amber-600 dark:text-amber-400 uppercase flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Simulated Customer Notification (WhatsApp/SMS)
              </span>
              <p className="mt-1.5 text-[11px] text-gray-500 font-mono leading-relaxed bg-amber-500/5 dark:bg-amber-400/5 p-3 rounded-lg border border-amber-500/10 dark:border-amber-400/10">
                {smsTriggerText}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => {
                if (setInitialTrackingId && submittedOrder) {
                  setInitialTrackingId(submittedOrder.id);
                }
                setActivePage("track-order");
              }}
              className="w-full flex items-center justify-center space-x-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm py-3.5 shadow-md shadow-brand-600/10 cursor-pointer"
            >
              <span>Track Live Status</span>
            </button>
            <button
              onClick={() => {
                setSubmittedOrder(null);
                setStep(1);
              }}
              className="w-full rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-sm py-3.5 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900 cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      
      {/* Steps Visual Tracker */}
      <div className="flex items-center justify-center space-x-4 mb-10 max-w-xl mx-auto">
        {[
          { num: 1, label: "Items Basket", icon: WashingMachine },
          { num: 2, label: "Schedule slots", icon: Calendar },
          { num: 3, label: "Contact info", icon: MapPin },
          { num: 4, label: "Payment QR", icon: CreditCard }
        ].map((s) => {
          const isActive = step === s.num;
          const isDone = step > s.num;
          const Icon = s.icon;
          return (
            <React.Fragment key={s.num}>
              {s.num > 1 && <div className={`h-0.5 w-10 flex-1 transition-colors ${isDone ? "bg-brand-600" : "bg-gray-200 dark:bg-gray-800"}`} />}
              <div className="flex flex-col items-center">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold transition-all border ${
                  isActive 
                    ? "bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-600/10" 
                    : isDone
                      ? "bg-brand-100 text-brand-700 border-brand-200 dark:bg-brand-950/20 dark:text-brand-400 dark:border-brand-900"
                      : "bg-white text-gray-400 border-gray-200 dark:bg-gray-950 dark:border-gray-800"
                }`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <span className={`text-[10px] mt-1.5 font-bold uppercase tracking-wider hidden sm:inline-block ${isActive ? "text-brand-600 dark:text-brand-400" : "text-gray-400"}`}>
                  {s.label}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left main form pane */}
        <div className="lg:col-span-8 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-xs">
          
          <form onSubmit={handleSubmitOrder} className="space-y-6">
            
            {/* STEP 1: BASKET ITEMS */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white">Verify Your Basket</h3>
                  <p className="text-xs text-gray-500">Edit quantities or add services directly below prior to scheduling pickup.</p>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-gray-800 border-t border-b border-gray-100 dark:border-gray-800 py-2">
                  {Object.entries(cart).map(([id, qty]) => {
                    const item = services.find(s => s.id === id);
                    if (!item) return null;
                    return (
                      <div key={id} className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{item.name}</p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">{item.category}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-xs font-mono text-gray-400">₹{item.price} each</span>
                          <div className="flex items-center bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg p-0.5">
                            <button
                              type="button"
                              onClick={() => handleQtyChange(id, -1)}
                              className="h-6 w-6 rounded bg-white dark:bg-gray-950 flex items-center justify-center text-gray-500 hover:text-brand-600 hover:shadow-xs border border-gray-200 dark:border-gray-800 transition-all"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-5 text-center font-mono font-bold text-xs text-gray-900 dark:text-white">{qty}</span>
                            <button
                              type="button"
                              onClick={() => handleQtyChange(id, 1)}
                              className="h-6 w-6 rounded bg-white dark:bg-gray-950 flex items-center justify-center text-gray-500 hover:text-brand-600 hover:shadow-xs border border-gray-200 dark:border-gray-800 transition-all"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <span className="w-16 text-right font-mono font-extrabold text-sm text-gray-950 dark:text-white">₹{item.price * qty}</span>
                        </div>
                      </div>
                    );
                  })}

                  {getCartTotalItems() === 0 && (
                    <div className="py-12 text-center">
                      <p className="text-sm text-gray-400">Your basket is empty. Head to our Services tab to add items!</p>
                      <button
                        type="button"
                        onClick={() => setActivePage("services")}
                        className="mt-4 inline-flex items-center space-x-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-brand-700 shadow-xs cursor-pointer"
                      >
                        <WashingMachine className="h-3.5 w-3.5" />
                        <span>Go to Services pricing</span>
                      </button>
                    </div>
                  )}
                </div>

                {getCartTotalItems() > 0 && (
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={nextStep}
                      className="inline-flex items-center justify-center space-x-1.5 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 shadow-md shadow-brand-600/10 cursor-pointer"
                    >
                      <span>Proceed to slots</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: DATES & SLOTS */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white">Date & Time Selection</h3>
                  <p className="text-xs text-gray-500">Pick convenient dates. Standard turn-around takes 48 hours for pristine sanitization.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pickup Date</label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split("T")[0]}
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white py-3 px-4 text-sm focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-950 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Estimated Delivery Date</label>
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      min={pickupDate || new Date().toISOString().split("T")[0]}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-sm focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 text-gray-400 font-medium cursor-not-allowed"
                      disabled
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Preferred Pickup Hours Slot</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        "08:00 AM - 11:00 AM",
                        "11:00 AM - 02:00 PM",
                        "04:00 PM - 07:00 PM"
                      ].map((slot) => {
                        const isSel = pickupTime === slot;
                        return (
                          <button
                            type="button"
                            key={slot}
                            onClick={() => setPickupTime(slot)}
                            className={`flex items-center justify-center space-x-1.5 px-4 py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                              isSel 
                                ? "bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-950/30 dark:border-brand-900 dark:text-brand-400"
                                : "bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-950 dark:border-gray-800 dark:hover:bg-gray-900"
                            }`}
                          >
                            <Clock className="h-3.5 w-3.5" />
                            <span>{slot}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 dark:border-gray-800 dark:text-gray-300"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="inline-flex items-center justify-center space-x-1.5 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 shadow-md shadow-brand-600/10 cursor-pointer"
                  >
                    <span>Proceed to address</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: CONTACT & ADDRESS DETAILS */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white">Contact & Address Details</h3>
                  <p className="text-xs text-gray-500">Provide accurate address info. Verification OTP is handled automatically on submission.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter your full name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white py-3 px-4 text-sm focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-950 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mobile Number</label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="10 digit contact number"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white py-3 px-4 text-sm focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-950 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider font-sans">Full Doorstep Pickup Address</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Flat/House number, Street name, Beside landmarks, Kandri Gutta, Balanagar, Hyderabad"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white py-3 px-4 text-sm focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-950 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Special Laundry Instructions / Notes</label>
                    <input
                      type="text"
                      placeholder="Avoid hard washing on blue saree, iron shirt starch-less, separate dry-clean suit"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white py-3 px-4 text-sm focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-950 text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Image uploading section */}
                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Upload Cloth Images (Optional)</label>
                    <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-6 text-center hover:bg-gray-50/50 dark:hover:bg-gray-900/5 transition-colors relative">
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*"
                        onChange={handleClothImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Drag & Drop or Click to Upload</p>
                      <p className="text-[10px] text-gray-400 mt-1">PNG, JPG up to 5MB (Useful for pre-existing stains reference)</p>
                    </div>

                    {clothImages.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {clothImages.map((img, idx) => (
                          <div key={idx} className="relative h-14 w-14 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-50">
                            <img src={img} alt="cloth-uploaded" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                            <button
                              type="button"
                              onClick={() => removeClothImage(idx)}
                              className="absolute top-0.5 right-0.5 p-0.5 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-xs"
                            >
                              <Trash2 className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 dark:border-gray-800 dark:text-gray-300"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="inline-flex items-center justify-center space-x-1.5 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 shadow-md shadow-brand-600/10 cursor-pointer"
                  >
                    <span>Proceed to payment</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: PAYMENTS & screenshots */}
            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white">Verify Payment & Confirm Order</h3>
                  <p className="text-xs text-gray-500">Pick standard COD or pay upfront via UPI QR Code and attach screenshot.</p>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Choose Payment Mode</label>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'COD', label: 'Cash On Delivery', desc: 'Pay on drop-off' },
                      { id: 'UPI', label: 'Scan UPI QR', desc: 'Secure Instant QR' },
                      { id: 'GPay', label: 'Google Pay', desc: 'Direct GPay Transfer' },
                      { id: 'PhonePe', label: 'PhonePe UPI', desc: 'Pay via PhonePe' },
                      { id: 'Paytm', label: 'Paytm Wallet', desc: 'Instant Paytm' }
                    ].map((mode) => {
                      const isSel = paymentMethod === mode.id;
                      return (
                        <button
                          type="button"
                          key={mode.id}
                          onClick={() => {
                            setPaymentMethod(mode.id as any);
                            if (mode.id === "COD") {
                              setPaymentScreenshot("");
                            }
                          }}
                          className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all cursor-pointer ${
                            isSel 
                              ? "bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-950/30 dark:border-brand-900 dark:text-brand-400"
                              : "bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-950 dark:border-gray-800 dark:hover:bg-gray-900"
                          }`}
                        >
                          <span className="text-xs font-bold">{mode.label}</span>
                          <span className="text-[10px] text-gray-400 mt-0.5">{mode.desc}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* UPI QR Display (Absolutely zero broken images, dynamically pulls from API based on real total!) */}
                  {paymentMethod !== "COD" && (
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900 space-y-4">
                      <div className="text-center">
                        <span className="inline-flex items-center rounded-md bg-blue-100 px-2.5 py-1 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          INSTANT UPI MERCHANT SCANNER
                        </span>
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white mt-2">SK Laundry Services Merchant UPI</h4>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5 select-all">{settings.upiId}</p>
                      </div>

                      <div className="flex justify-center">
                        <div className="bg-white p-3 rounded-2xl shadow-xs border border-gray-100 flex flex-col items-center">
                          <img 
                            src={qrCodeUrl} 
                            alt="SK Laundry QR Code Payment" 
                            className="h-44 w-44 object-contain" 
                            referrerPolicy="no-referrer"
                          />
                          <p className="text-[11px] font-extrabold text-brand-600 mt-2 font-mono">
                            Pay Exact Amount: ₹{getGrandTotal()}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                          Upload Payment Transaction Screenshot
                        </label>
                        <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 text-center relative hover:bg-gray-100/50 dark:hover:bg-gray-950/20 transition-all">
                          <input 
                            type="file" 
                            accept="image/*"
                            required={paymentMethod !== "COD"}
                            onChange={handleScreenshotUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                          <div className="flex flex-col items-center justify-center">
                            <Upload className="h-6 w-6 text-gray-400 mb-1" />
                            <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                              {paymentScreenshot ? "Screenshot attached successfully!" : "Click to attach pay proof image"}
                            </span>
                          </div>
                        </div>

                        {paymentScreenshot && (
                          <div className="mt-2 flex items-center justify-between p-2 rounded bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                            <div className="flex items-center space-x-2">
                              <div className="h-8 w-8 rounded overflow-hidden border border-gray-200">
                                <img src={paymentScreenshot} alt="screenshot-thumb" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">Attached proof ready.</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setPaymentScreenshot("")}
                              className="text-red-500 hover:text-red-600 text-xs font-bold p-1"
                            >
                              Clear
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>

                <div className="flex justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 dark:border-gray-800 dark:text-gray-300"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center space-x-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-8 py-3.5 shadow-md shadow-brand-600/10 cursor-pointer disabled:opacity-50"
                  >
                    <span>{submitting ? "Registering Order..." : "Confirm & Book Pickup"}</span>
                  </button>
                </div>
              </div>
            )}

          </form>

        </div>

        {/* Right order summary sidebar */}
        <div className="lg:col-span-4 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-xs space-y-6">
          <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
            <Sparkles className="h-5 w-5 text-brand-500" />
            <span>Order Summary</span>
          </h3>

          {/* Quick billing detail */}
          <div className="space-y-3 text-xs border-b border-gray-100 dark:border-gray-800 pb-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Selected Items</span>
              <span className="font-bold text-gray-800 dark:text-white font-mono">{getCartTotalItems()} items</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Subtotal Price</span>
              <span className="font-bold text-gray-800 dark:text-white font-mono">₹{getSubtotal()}</span>
            </div>

            {/* Loyalty points discount info */}
            {currentUser && currentUser.loyaltyPoints > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span className="flex items-center gap-1">
                  Loyalty Points Balance
                </span>
                <span className="font-bold font-mono">{currentUser.loyaltyPoints} Points</span>
              </div>
            )}

            {couponDiscount > 0 && (
              <div className="flex justify-between text-rose-500 font-bold">
                <span>Discount Applied</span>
                <span className="font-mono">- ₹{couponDiscount}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-gray-400">Delivery Charges</span>
              <span className="font-bold text-gray-800 dark:text-white font-mono">
                {getDeliveryCharge() > 0 ? `₹${getDeliveryCharge()}` : "FREE"}
              </span>
            </div>

            <div className="flex justify-between border-t border-gray-100 dark:border-gray-800 pt-3 text-sm font-extrabold">
              <span className="text-gray-900 dark:text-white">Est. Grand Total</span>
              <span className="text-brand-600 dark:text-brand-400 font-mono">₹{getGrandTotal()}</span>
            </div>
          </div>

          {/* Coupon Code Applying Panel */}
          {getCartTotalItems() > 0 && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Apply Promo Coupon</label>
              
              {activeCoupon ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950/20 border border-brand-100 dark:border-brand-900/50">
                  <div className="flex items-center space-x-2">
                    <Tag className="h-4 w-4 text-brand-500" />
                    <div>
                      <p className="text-xs font-extrabold text-brand-700 dark:text-brand-400 font-mono">{activeCoupon.code}</p>
                      <p className="text-[9px] text-gray-400">{activeCoupon.description}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-red-500 hover:text-red-600 text-xs font-bold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="SKFIRST10"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-950 text-gray-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="rounded-xl bg-gray-900 hover:bg-black text-white dark:bg-brand-600 dark:hover:bg-brand-700 font-bold text-xs px-4 py-2 cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              )}

              {couponError && (
                <p className="text-[10px] font-bold text-red-500 mt-1">{couponError}</p>
              )}
            </div>
          )}

          {/* Cart selected item row feedback preview */}
          {getCartTotalItems() > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Basket Contents</span>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 divide-y divide-gray-50 dark:divide-gray-900">
                {Object.entries(cart).map(([id, qty]) => {
                  const s = services.find(item => item.id === id);
                  if (!s) return null;
                  return (
                    <div key={id} className="flex justify-between items-center text-[11px] pt-1.5 first:pt-0">
                      <span className="text-gray-600 dark:text-gray-400 truncate max-w-40">
                        {s.name} <span className="font-bold text-gray-400 font-mono">x{qty}</span>
                      </span>
                      <span className="font-semibold text-gray-800 dark:text-gray-300 font-mono">₹{s.price * qty}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
