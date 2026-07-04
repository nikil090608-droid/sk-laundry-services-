import React from "react";
import { 
  Search, 
  Tag, 
  ShoppingBag, 
  Plus, 
  Minus,
  Check,
  Sparkles,
  Info,
  Trash2,
  WashingMachine,
  ArrowRight
} from "lucide-react";
import { LaundryItem } from "../types";

interface ServicesProps {
  services: LaundryItem[];
  setActivePage: (page: string) => void;
  cart: Record<string, number>;
  setCart: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}

export default function Services({ services, setActivePage, cart, setCart }: ServicesProps) {
  const [activeTab, setActiveTab] = React.useState<'MEN' | 'WOMEN' | 'HOUSEHOLD' | 'KIDS'>('MEN');
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // Local temporary quantities for adding items
  const [quantities, setQuantities] = React.useState<Record<string, number>>({});

  const categories = [
    { id: 'MEN', label: "Men's Wear", icon: "👔" },
    { id: 'WOMEN', label: "Women's Wear", icon: "👗" },
    { id: 'HOUSEHOLD', label: "Household", icon: "🏠" },
    { id: 'KIDS', label: "Kids Wear", icon: "🧒" }
  ];

  // Filter services by category and search query
  const filteredServices = services.filter((item) => {
    const matchesCategory = item.category === activeTab;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.serviceType && item.serviceType.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getLocalQty = (itemId: string) => {
    return quantities[itemId] || 1;
  };

  const handleUpdateLocalQty = (itemId: string, diff: number) => {
    setQuantities((prev) => {
      const current = prev[itemId] || 1;
      const next = current + diff;
      return {
        ...prev,
        [itemId]: next < 1 ? 1 : next
      };
    });
  };

  const handleAddToCart = (item: LaundryItem) => {
    const qtyToAdd = getLocalQty(item.id);
    setCart((prev) => {
      const updated = { ...prev };
      updated[item.id] = (updated[item.id] || 0) + qtyToAdd;
      return updated;
    });
    // Reset local quantity back to 1
    setQuantities((prev) => ({ ...prev, [item.id]: 1 }));
  };

  const handleUpdateCartQty = (itemId: string, diff: number) => {
    setCart((prev) => {
      const updated = { ...prev };
      const current = updated[itemId] || 0;
      const next = current + diff;
      if (next <= 0) {
        delete updated[itemId];
      } else {
        updated[itemId] = next;
      }
      return updated;
    });
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart((prev) => {
      const updated = { ...prev };
      delete updated[itemId];
      return updated;
    });
  };

  const getCartTotalItems = () => {
    return Object.values(cart).reduce((sum, count) => sum + count, 0);
  };

  const getCartSubtotal = () => {
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const item = services.find(s => s.id === id);
      return sum + (item ? item.price * qty : 0);
    }, 0);
  };

  // Delivery charge details: Free on orders above ₹500, otherwise ₹50
  const subtotal = getCartSubtotal();
  const deliveryCharge = subtotal > 0 && subtotal < 500 ? 50 : 0;
  const grandTotal = subtotal + deliveryCharge;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-[#0B1528] min-h-screen text-gray-100">
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
        <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full text-xs text-blue-400 font-semibold uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5" />
          <span>SK Laundry Services Rate Card</span>
        </div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
          Order Fresh Laundry
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">
          Browse the exact rates from our official rate card. Build your basket, select a service type, and schedule doorstep pickup & delivery!
        </p>
      </div>

      {/* Main Grid: Left List, Right Cart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Services list (col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Quick Search */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search laundry garments (e.g. Shirt, Saree, Blanket, Blazer, Kurti)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-[#12223F] py-3.5 pl-12 pr-4 text-sm focus:border-blue-500 focus:outline-hidden text-white shadow-md placeholder-gray-400 transition-all"
            />
          </div>

          {/* Category Tabs Grid */}
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap items-center sm:justify-start">
            {categories.map((cat) => {
              const isActive = activeTab === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveTab(cat.id as any);
                    setSearchQuery('');
                  }}
                  className={`flex items-center justify-center space-x-2.5 rounded-xl px-5 py-3 text-sm font-bold transition-all border w-full sm:w-auto cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20"
                      : "bg-[#12223F] text-gray-300 border-white/5 hover:bg-[#192E54]"
                  }`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* pricing Grid List */}
          <div className="bg-[#12223F] rounded-2xl border border-white/10 shadow-lg overflow-hidden">
            
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 bg-[#0F1D36] text-xs font-bold uppercase tracking-wider text-gray-400">
              <div className="col-span-4">Item Name</div>
              <div className="col-span-3">Service Type</div>
              <div className="col-span-2 text-center">Unit Price</div>
              <div className="col-span-3 text-right">Add to Basket</div>
            </div>

            {/* List items */}
            {filteredServices.length > 0 ? (
              <div className="divide-y divide-white/5">
                {filteredServices.map((item) => {
                  const localQty = getLocalQty(item.id);
                  const inCartQty = cart[item.id] || 0;
                  
                  return (
                    <div 
                      key={item.id} 
                      className="grid grid-cols-1 md:grid-cols-12 gap-3 px-6 py-4.5 items-center hover:bg-white/[0.02] transition-colors"
                    >
                      
                      {/* Item Name */}
                      <div className="col-span-1 md:col-span-4 flex items-center space-x-3">
                        <div className="h-9 w-9 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 border border-blue-500/15">
                          <Tag className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">
                            {item.name}
                          </h3>
                          <span className="text-[10px] text-blue-400 font-mono tracking-wider uppercase block md:hidden">
                            {item.category} • {item.serviceType}
                          </span>
                        </div>
                      </div>

                      {/* Service Type */}
                      <div className="col-span-1 md:col-span-3 hidden md:block">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-500/5 border border-blue-500/10 text-blue-300">
                          {item.serviceType || "Wash & Iron"}
                        </span>
                      </div>

                      {/* Pricing Info */}
                      <div className="col-span-1 md:col-span-2 text-left md:text-center flex justify-between md:block py-1 md:py-0">
                        <span className="md:hidden text-xs text-gray-400">Unit Price:</span>
                        <span className="text-sm font-extrabold text-blue-400 font-mono">
                          ₹{item.price}
                        </span>
                      </div>

                      {/* Counter & Action Buttons */}
                      <div className="col-span-1 md:col-span-3 flex justify-between md:justify-end items-center space-x-3">
                        <div className="flex items-center bg-[#0B1528] border border-white/10 rounded-lg p-0.5">
                          <button
                            onClick={() => handleUpdateLocalQty(item.id, -1)}
                            className="h-7 w-7 rounded bg-[#12223F] flex items-center justify-center text-gray-400 hover:text-white border border-white/5 cursor-pointer transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center font-mono font-bold text-xs text-white">
                            {localQty}
                          </span>
                          <button
                            onClick={() => handleUpdateLocalQty(item.id, 1)}
                            className="h-7 w-7 rounded bg-[#12223F] flex items-center justify-center text-gray-400 hover:text-white border border-white/5 cursor-pointer transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleAddToCart(item)}
                          className="inline-flex items-center space-x-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-xs font-bold cursor-pointer transition-colors shadow-sm"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Add</span>
                          {inCartQty > 0 && (
                            <span className="ml-1 px-1.5 py-0.2 bg-blue-900 text-[10px] rounded-full text-blue-200">
                              {inCartQty}
                            </span>
                          )}
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-16 text-center text-gray-400 space-y-2">
                <p className="text-sm font-semibold">No garments found matching "{searchQuery}" in {categories.find(c => c.id === activeTab)?.label}.</p>
                <p className="text-xs text-gray-500">Please check the spelling or select another category tab above.</p>
              </div>
            )}

          </div>

          {/* Info Notice Box */}
          <div className="rounded-2xl bg-blue-950/20 border border-blue-500/10 p-5 flex items-start space-x-3.5">
            <Info className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-blue-300">SK Laundry Services Policy Notice</h4>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                All prices listed above represent our exact physical rate card values. No pricing discrepancies or hidden charges! Our experts inspect and tag items upon collection. Delivery is absolutely free for order totals of ₹500 and above.
              </p>
            </div>
          </div>

        </div>

        {/* Right Column: Dynamic Shopping Basket (col-span-4) */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          <div className="bg-[#12223F] rounded-2xl border border-white/10 shadow-lg p-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="h-5 w-5 text-blue-400" />
                <h2 className="font-display text-lg font-bold text-white">Your Basket</h2>
              </div>
              <span className="text-xs font-mono font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-md">
                {getCartTotalItems()} items
              </span>
            </div>

            {getCartTotalItems() > 0 ? (
              <div className="space-y-4">
                
                {/* Cart Items list */}
                <div className="divide-y divide-white/5 max-h-80 overflow-y-auto pr-1">
                  {Object.entries(cart).map(([id, qty]) => {
                    const item = services.find(s => s.id === id);
                    if (!item) return null;
                    const itemSubtotal = item.price * qty;

                    return (
                      <div key={id} className="py-3 flex flex-col space-y-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-bold text-white">{item.name}</p>
                            <span className="text-[10px] text-blue-400 uppercase tracking-wider font-semibold font-mono">
                              {item.serviceType}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRemoveFromCart(id)}
                            className="text-gray-400 hover:text-red-400 p-1 rounded-md transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center bg-[#0B1528] border border-white/5 rounded-md p-0.5">
                            <button
                              onClick={() => handleUpdateCartQty(id, -1)}
                              className="h-5 w-5 rounded bg-[#12223F] flex items-center justify-center text-gray-400 hover:text-white"
                            >
                              <Minus className="h-2.5 w-2.5" />
                            </button>
                            <span className="w-5 text-center font-mono text-[11px] text-white">
                              {qty}
                            </span>
                            <button
                              onClick={() => handleUpdateCartQty(id, 1)}
                              className="h-5 w-5 rounded bg-[#12223F] flex items-center justify-center text-gray-400 hover:text-white"
                            >
                              <Plus className="h-2.5 w-2.5" />
                            </button>
                          </div>
                          <div className="text-right text-xs">
                            <span className="text-gray-400 font-mono">₹{item.price} × {qty} = </span>
                            <span className="font-bold text-white font-mono">₹{itemSubtotal}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pricing summary calculations */}
                <div className="border-t border-white/5 pt-4 space-y-2">
                  
                  {/* Delivery charge progress card */}
                  {subtotal < 500 ? (
                    <div className="bg-blue-950/10 border border-blue-500/5 rounded-xl p-3 text-xs text-blue-300">
                      <div className="flex justify-between font-bold mb-1">
                        <span>Add ₹{500 - subtotal} more for Free Delivery!</span>
                        <span>₹{subtotal}/500</span>
                      </div>
                      <div className="w-full bg-[#0B1528] h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-500 h-full transition-all duration-300" 
                          style={{ width: `${Math.min((subtotal / 500) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-400 font-bold flex items-center space-x-1.5">
                      <Check className="h-4 w-4" />
                      <span>Congratulations! You qualified for Free Delivery.</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm text-gray-400 pt-2">
                    <span>Subtotal</span>
                    <span className="font-mono text-white">₹{subtotal}</span>
                  </div>

                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Delivery Charges</span>
                    <span className="font-mono text-white">
                      {deliveryCharge > 0 ? `₹${deliveryCharge}` : "FREE"}
                    </span>
                  </div>

                  <div className="flex justify-between text-base font-extrabold text-white border-t border-white/5 pt-2.5">
                    <span>Grand Total</span>
                    <span className="font-mono text-blue-400 text-lg">₹{grandTotal}</span>
                  </div>
                </div>

                {/* Checkout button */}
                <button
                  onClick={() => setActivePage("order-now")}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3.5 font-bold text-sm shadow-md shadow-blue-600/10 transition-all cursor-pointer group"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>

              </div>
            ) : (
              <div className="py-12 text-center text-gray-400 space-y-3">
                <WashingMachine className="h-10 w-10 text-gray-500 mx-auto animate-pulse" />
                <p className="text-sm">Your basket is currently empty.</p>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Click the "Add" button next to any laundry item on the left to start building your order!
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
