import React from "react";
import { 
  Phone, 
  MapPin, 
  CreditCard, 
  FileText, 
  ShieldCheck, 
  Clock, 
  WashingMachine,
  Map
} from "lucide-react";

interface FooterProps {
  setActivePage: (page: string) => void;
}

export default function Footer({ setActivePage }: FooterProps) {
  return (
    <footer className="bg-[#050B18] text-gray-400 border-t border-white/5 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-4">
          
          {/* Brand Col */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 text-white">
              <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-blue-600">
                <WashingMachine className="h-5 w-5 text-white animate-spin-slow" />
              </div>
              <span className="font-display text-lg font-bold tracking-tight text-white leading-none">
                SK LAUNDRY <span className="text-blue-400">SERVICES</span>
              </span>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-gray-400">
              Your premium full-service laundry partner in Hyderabad. We deliver professional hygiene, pristine whites, and delicate fabric care right at your doorstep.
            </p>
            <div className="mt-4 border-t border-white/10 pt-4">
              <div className="flex items-center space-x-2 text-[10px] text-gray-500">
                <ShieldCheck className="h-4 w-4 text-blue-400 flex-shrink-0" />
                <div>
                  <p className="font-semibold uppercase tracking-wider text-gray-400">Registered Enterprise</p>
                  <p className="font-mono text-gray-500">Reg: SEA/MED/ALO/QB/1174332/2025</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links Col */}
          <div>
            <h3 className="font-display text-sm font-semibold tracking-wider text-white uppercase">Our Services</h3>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <button onClick={() => setActivePage("services")} className="hover:text-white transition-colors">
                  Steam Ironing & Pressing
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage("services")} className="hover:text-white transition-colors">
                  Premium Dry Cleaning
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage("services")} className="hover:text-white transition-colors">
                  Starch Wash & Cotton Polishing
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage("services")} className="hover:text-white transition-colors">
                  Blankets & Household Sanitizing
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage("services")} className="hover:text-white transition-colors">
                  Saree Rolling & Drape Polishing
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Col */}
          <div>
            <h3 className="font-display text-sm font-semibold tracking-wider text-white uppercase">Contact & Store</h3>
            <ul className="mt-4 space-y-3.5 text-xs">
              <li className="flex items-start space-x-2.5">
                <MapPin className="h-4 w-4 mt-0.5 text-blue-400 flex-shrink-0" />
                <span className="leading-relaxed text-gray-400">
                  Geetha Nagar, 8-4-300,<br />
                  Beside St. Martin School,<br />
                  Kandri Gutta, Balanagar,<br />
                  Hyderabad, TS – 500042
                </span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="h-4 w-4 text-blue-400 flex-shrink-0" />
                <div className="flex flex-col text-gray-400">
                  <a href="tel:7337427757" className="hover:text-white transition-colors">7337427757</a>
                  <a href="tel:8919501286" className="hover:text-white transition-colors">8919501286</a>
                  <a href="tel:9014025932" className="hover:text-white transition-colors">9014025932</a>
                </div>
              </li>
              <li className="flex items-center space-x-2.5 border-t border-white/10 pt-2">
                <CreditCard className="h-4 w-4 text-blue-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-500 font-semibold uppercase">UPI Merchant ID</p>
                  <p className="font-mono text-[11px] text-gray-400 select-all select-all-copy" title="Click to select and copy">
                    QR918919501286-0197@unionbankofindia
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Service Areas Col */}
          <div>
            <h3 className="font-display text-sm font-semibold tracking-wider text-white uppercase">Service Coverage</h3>
            <p className="mt-3 text-xs leading-relaxed text-gray-400">
              We provide prompt doorstep dry cleaning pickup and fast drop-off across the following localities:
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {["Balanagar", "Jagathgirigutta", "Jeedimetla", "Shapurnagar", "Kukatpally", "Hyderabad Areas"].map((area, idx) => (
                <span key={idx} className="inline-flex items-center rounded-md bg-[#152238] px-2 py-1 text-[10px] font-medium text-blue-300 border border-white/5">
                  <Map className="h-2.5 w-2.5 mr-1" />
                  {area}
                </span>
              ))}
            </div>
            <div className="mt-4 flex items-center space-x-2 text-xs text-gray-500">
              <Clock className="h-4 w-4 text-blue-400 flex-shrink-0" />
              <span>Open: 7:00 AM – 9:00 PM (Daily)</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-white/10 pt-6 text-center md:flex md:items-center md:justify-between">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} SK Laundry Services. All Rights Reserved. Designed for premium luxury fabric hospitality.
          </p>
          <div className="mt-4 flex justify-center space-x-6 text-xs text-gray-500 md:mt-0">
            <span className="hover:text-gray-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-gray-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-gray-400 cursor-pointer">GST Invoice Help</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
