import React from "react";
import { 
  Search, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  CreditCard, 
  WashingMachine, 
  MessageCircle,
  FileText,
  AlertTriangle,
  FileSpreadsheet,
  TrendingUp,
  Sparkles
} from "lucide-react";
import { Order, OrderStatus } from "../types";

interface TrackOrderProps {
  initialOrderId?: string;
}

export default function TrackOrder({ initialOrderId }: TrackOrderProps) {
  const [orderIdInput, setOrderIdInput] = React.useState(initialOrderId || "");
  const [order, setOrder] = React.useState<Order | null>(null);
  const [searching, setSearching] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

  React.useEffect(() => {
    if (initialOrderId) {
      handleSearch(initialOrderId);
    }
  }, [initialOrderId]);

  const handleSearch = async (targetId: string) => {
    const id = targetId.trim().toUpperCase();
    if (!id) return;

    setSearching(true);
    setErrorMsg("");
    setOrder(null);

    try {
      const response = await fetch(`/api/orders/${id}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      } else {
        const errData = await response.json();
        setErrorMsg(errData.error || "Order ID not found. Double check code format (e.g. SK20260001).");
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("Failed to connect to SK laundry services network. Try again later.");
    } finally {
      setSearching(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(orderIdInput);
  };

  const handleWhatsAppHelp = () => {
    if (!order) return;
    const text = encodeURIComponent(
      `Hello SK Laundry Services! I am checking status of Order ID: ${order.id}. Current status shown: ${order.status}. Could you please update me on delivery status?`
    );
    window.open(`https://wa.me/917337427757?text=${text}`, "_blank");
  };

  // Timeline workflow maps
  const workflowSteps: OrderStatus[] = [
    "Pending",
    "Pickup Scheduled",
    "Picked Up",
    "Washing",
    "Drying",
    "Steam Ironing",
    "Quality Check",
    "Ready",
    "Out For Delivery",
    "Delivered"
  ];

  const getStepProgressIndex = (status: OrderStatus) => {
    return workflowSteps.indexOf(status);
  };

  const activeStepIdx = order ? getStepProgressIndex(order.status) : -1;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      
      {/* Search Header panel */}
      <div className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 md:p-8 shadow-xs text-center space-y-6 max-w-2xl mx-auto">
        <div className="h-14 w-14 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto dark:bg-brand-950/40 dark:text-brand-400">
          <TrendingUp className="h-7 w-7" />
        </div>

        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Track Order Live</h1>
          <p className="text-gray-500 text-xs mt-1.5 leading-relaxed">
            Enter your unique 10-digit Order ID (Format: SK2026xxxx) to see live processing tracking timeline.
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-gray-400" />
            <input
              type="text"
              required
              placeholder="e.g. SK20260001"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm font-semibold tracking-wide focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-950 text-gray-900 dark:text-white uppercase font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-6 py-3.5 shadow-md shadow-brand-600/10 cursor-pointer disabled:opacity-50"
          >
            {searching ? "Searching..." : "Track Status"}
          </button>
        </form>

        {errorMsg && (
          <div className="rounded-xl bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 p-3 text-xs font-semibold flex items-center justify-center gap-1.5 border border-red-100 dark:border-red-900/40">
            <AlertTriangle className="h-4 w-4" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Live Order tracking Detail Box */}
      {order && (
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Timeline workflow track */}
          <div className="lg:col-span-7 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">LIVE TRACKING STAGE</span>
                <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                  Current Status: <span className="text-brand-600 dark:text-brand-400 font-extrabold">{order.status}</span>
                </h2>
              </div>
              <button
                onClick={handleWhatsAppHelp}
                className="inline-flex items-center space-x-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900 px-3 py-1.5 text-xs font-semibold cursor-pointer"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>WhatsApp Help</span>
              </button>
            </div>

            {/* Visual Timeline (Interactive, beautiful vertically stacked steps with timeline notes) */}
            <div className="relative pl-8 space-y-5 border-l-2 border-brand-100 dark:border-l-gray-800">
              {workflowSteps.map((step, idx) => {
                const isPassed = activeStepIdx >= idx;
                const isCurrent = activeStepIdx === idx;
                
                // Find matching log in order history
                const timelineLog = order.timeline?.find(t => t.status === step);

                return (
                  <div key={step} className={`relative transition-all ${isPassed ? "opacity-100" : "opacity-40"}`}>
                    
                    {/* Visual Node */}
                    <div className={`absolute -left-10.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold ring-4 ring-white dark:ring-gray-950 ${
                      isCurrent 
                        ? "bg-brand-600 text-white animate-pulse" 
                        : isPassed 
                          ? "bg-brand-100 text-brand-700 dark:bg-brand-950/50 dark:text-brand-400" 
                          : "bg-gray-100 text-gray-400 dark:bg-gray-900"
                    }`}>
                      {isPassed && !isCurrent ? "✓" : idx + 1}
                    </div>

                    {/* Step Info */}
                    <div>
                      <h4 className={`text-sm font-bold ${isCurrent ? "text-brand-600 dark:text-brand-400 font-extrabold" : "text-gray-900 dark:text-white"}`}>
                        {step}
                      </h4>
                      {timelineLog ? (
                        <div className="mt-1">
                          <p className="text-xs text-gray-500 leading-relaxed">
                            {timelineLog.notes || `Order transitioned to ${step} stage successfully.`}
                          </p>
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                            {new Date(timelineLog.timestamp).toLocaleDateString()} at {new Date(timelineLog.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic">Processing update pending.</p>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

          </div>

          {/* Order Details & Summary sidebar */}
          <div className="lg:col-span-5 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-xs space-y-6">
            <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white flex items-center gap-1.5 border-b border-gray-100 dark:border-gray-800 pb-3">
              <FileText className="h-5 w-5 text-brand-500" />
              <span>Garment Metadata</span>
            </h3>

            {/* Quick stats details */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-gray-400">Order ID Code</p>
                <p className="font-bold text-gray-800 dark:text-white font-mono uppercase tracking-wide mt-1">{order.id}</p>
              </div>
              <div>
                <p className="text-gray-400">Date Logged</p>
                <p className="font-bold text-gray-800 dark:text-white mt-1">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Scheduled Pickup</p>
                <p className="font-bold text-gray-800 dark:text-white mt-1">
                  {order.pickupDate} ({order.pickupTime})
                </p>
              </div>
              <div>
                <p className="text-gray-400">Est. Drop-Off Date</p>
                <p className="font-bold text-gray-800 dark:text-white mt-1">{order.deliveryDate}</p>
              </div>
              <div className="col-span-2 border-t border-gray-100 dark:border-gray-800 pt-3">
                <p className="text-gray-400">Pickup Address Location</p>
                <p className="font-medium text-gray-700 dark:text-gray-300 mt-1 leading-relaxed">{order.address}</p>
              </div>
            </div>

            {/* Items billing summary */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-2.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Garments Checklist</span>
              
              <div className="space-y-1.5 divide-y divide-gray-50 dark:divide-gray-900 max-h-40 overflow-y-auto pr-1">
                {order.items?.map((item, idx) => {
                  const displayName = item.serviceType && !item.name.includes(`(${item.serviceType})`)
                    ? `${item.name} (${item.serviceType})`
                    : item.name;
                  return (
                    <div key={idx} className="flex justify-between items-center text-xs pt-1.5 first:pt-0">
                      <span className="text-gray-600 dark:text-gray-400">
                        {displayName} <span className="font-bold text-gray-400 font-mono">x{item.quantity}</span>
                      </span>
                      <span className="font-bold text-gray-800 dark:text-white font-mono">₹{item.price * item.quantity}</span>
                    </div>
                  );
                })}
              </div>

              {/* Cost summary metrics */}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-3 text-xs space-y-2">
                {order.discountAmount && order.discountAmount > 0 ? (
                  <div className="flex justify-between text-rose-500 font-semibold">
                    <span>Coupon Discount</span>
                    <span className="font-mono">- ₹{order.discountAmount}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-sm font-extrabold border-t border-dashed border-gray-100 dark:border-gray-800 pt-2">
                  <span className="text-gray-900 dark:text-white">Amount Total</span>
                  <span className="text-brand-600 dark:text-brand-400 font-mono">₹{order.totalPrice}</span>
                </div>
              </div>
            </div>

            {/* Payment state badge */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 flex items-center justify-between text-xs">
              <span className="text-gray-400 uppercase tracking-wider">Payment State</span>
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                order.paymentStatus === "Paid"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                  : order.paymentStatus === "Refunded"
                    ? "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                    : order.paymentStatus === "Failed"
                      ? "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                      : "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400"
              }`}>
                {order.paymentMethod === "COD" ? "Cash On Delivery" : order.paymentMethod} - {order.paymentStatus}
              </span>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
