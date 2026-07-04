import React from "react";
import { 
  WashingMachine, 
  Truck, 
  Clock, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Star, 
  HelpCircle,
  MessageCircle,
  ChevronDown,
  Percent,
  TrendingUp,
  Award,
  Sparkles
} from "lucide-react";
import { motion } from "motion/react";
import { AppSettings, FAQ, Testimonial } from "../types";

interface HomeProps {
  setActivePage: (page: string) => void;
  settings: AppSettings;
}

export default function Home({ setActivePage, settings }: HomeProps) {
  const [activeFaq, setActiveFaq] = React.useState<string | null>(null);

  // Dynamic Whatsapp helper
  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      "Hello SK Laundry Services! I would like to schedule a doorstep laundry pickup. Please guide me."
    );
    window.open(`https://wa.me/917337427757?text=${text}`, "_blank");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      
      {/* Dynamic Promo Banner/Offers Ticker */}
      {settings.offers && settings.offers.length > 0 && (
        <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-brand-800 text-white text-center py-2 px-4 text-xs font-semibold tracking-wide flex items-center justify-center space-x-2">
          <Percent className="h-4 w-4 animate-bounce" />
          <span>{settings.offers[0]}</span>
          <span className="hidden md:inline-block">|</span>
          <span className="hidden md:inline-block text-brand-100 font-normal">Fast 24-48 Hours Turnaround Time</span>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white dark:bg-gray-950 py-20 lg:py-24 border-b border-gray-100 dark:border-gray-900">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-50/50 via-white to-transparent dark:from-brand-950/15 dark:via-gray-950 dark:to-transparent" />
        
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 rounded-full bg-brand-50 border border-brand-100 px-3.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-950/30 dark:border-brand-900 dark:text-brand-400">
              <Sparkles className="h-3.5 w-3.5 text-brand-500 animate-pulse" />
              <span>₹10 signup bonus & 5% Loyalty Points</span>
            </div>
            
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl leading-tight">
              SK LAUNDRY <br />
              <span className="bg-gradient-to-r from-brand-600 to-brand-800 bg-clip-text text-transparent dark:from-brand-400 dark:to-brand-600">
                SERVICES
              </span>
            </h1>
            
            <p className="mx-auto lg:mx-0 max-w-2xl text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              {settings.bannerText || "Professional Laundry & Dry Cleaning Services"}
              <span className="block mt-1 font-medium text-brand-600 dark:text-brand-400">
                {settings.bannerSubtext || "Doorstep Pickup & Delivery Available"}
              </span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => setActivePage("order-now")}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold px-8 py-4 shadow-lg shadow-brand-600/20 transition-all hover:-translate-y-0.5 cursor-pointer"
                id="hero-book-now"
              >
                <WashingMachine className="h-5 w-5" />
                <span>Book Laundry Now</span>
              </button>
              
              <button
                onClick={handleWhatsApp}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-4 shadow-md transition-all hover:-translate-y-0.5 cursor-pointer"
                id="hero-whatsapp"
              >
                <MessageCircle className="h-5 w-5" />
                <span>WhatsApp Order</span>
              </button>
            </div>

            {/* Quick trust metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100 dark:border-gray-900">
              <div>
                <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">5000+</p>
                <p className="text-xs text-gray-500">Orders Delivered</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">24Hr</p>
                <p className="text-xs text-gray-500">Express Delivery</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">4.9 ★</p>
                <p className="text-xs text-gray-500">Customer Rating</p>
              </div>
            </div>

          </div>

          {/* Hero Right Visual Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm rounded-3xl bg-gray-900/5 p-4 dark:bg-white/5 ring-1 ring-inset ring-gray-900/10 dark:ring-white/10">
              <div className="relative rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-xl space-y-6">
                
                {/* Visual Header */}
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">SK Store Live</span>
                  </div>
                  <span className="text-xs font-bold text-brand-600 dark:text-brand-400">Balanagar, Hyderabad</span>
                </div>

                {/* Tracking Progress Mock Card */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 font-mono">ORDER ID</p>
                      <p className="font-bold text-gray-800 dark:text-white font-mono">SK20260024</p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
                      Washing
                    </span>
                  </div>

                  {/* Flow Steps Visual */}
                  <div className="relative pl-6 space-y-4 border-l-2 border-brand-500">
                    <div className="relative">
                      <div className="absolute -left-7.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-white text-[10px]">✓</div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">Picked Up</p>
                      <p className="text-[10px] text-gray-400">Today, 08:30 AM</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-7.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-white text-[10px] animate-pulse">●</div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">In Washing Cycle</p>
                      <p className="text-[10px] text-gray-400">Undergoing hygienic sanitization</p>
                    </div>
                    <div className="relative opacity-50">
                      <div className="absolute -left-7.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-gray-500 text-[10px] dark:bg-gray-800">3</div>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Drying & Steam Press</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 pt-4 text-center">
                  <button 
                    onClick={() => setActivePage("track-order")}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                  >
                    Track Real Order Live →
                  </button>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Highlights / Features Grid */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="font-display text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Why Choose SK Laundry Services?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
              Providing top-tier commercial dry cleaning, starch wash, and regular wardrobe maintenance across Hyderabad with modern full-stack tracking.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* Feature 1 */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-950">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display font-bold text-gray-950 dark:text-white">Free Doorstep Delivery</h3>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Schedule a pickup, and we collect and drop back your garments without any delivery friction for orders above ₹500.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-950">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display font-bold text-gray-950 dark:text-white">Express 24H Delivery</h3>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Emergency party wear, executive suits, or school uniform dry cleaning needed? Select our Express option during checkout.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-950">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display font-bold text-gray-950 dark:text-white">Premium Quality Process</h3>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                We use top-grade detergents, softeners, and eco-friendly dry-cleaning solvents protecting fabric shine and color health.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-950">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display font-bold text-gray-950 dark:text-white">Full Live Tracking</h3>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                No guessing! Enter your unique Order ID to track garments from washing to drying, steam ironing, and out for delivery.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Services Highlights Visual Cards (MEN, WOMEN, HOUSEHOLD, KIDS) */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="font-display text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Comprehensive Laundry Care
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm max-w-xl">
                We wash, steam iron, and dry clean everything from everyday corporate wear to luxury sarees and home linens.
              </p>
            </div>
            <button
              onClick={() => setActivePage("services")}
              className="mt-4 md:mt-0 inline-flex items-center text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              View Detailed Price List →
            </button>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* Category 1 */}
            <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-brand-600 text-white p-6 flex flex-col justify-between h-40">
                <span className="text-[10px] tracking-wider uppercase opacity-75 font-semibold">GENTLEMEN'S SELECTION</span>
                <h3 className="font-display text-2xl font-bold">Men's Wear</h3>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>Executive Shirt Steam Press</span>
                  <span className="font-bold text-gray-900 dark:text-white">₹40</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-2">
                  <span>Executive Suit Dry Clean</span>
                  <span className="font-bold text-gray-900 dark:text-white">₹250</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-2">
                  <span>Jeans/Trouser Wash</span>
                  <span className="font-bold text-gray-900 dark:text-white">₹50</span>
                </div>
              </div>
            </div>

            {/* Category 2 */}
            <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-rose-600 text-white p-6 flex flex-col justify-between h-40">
                <span className="text-[10px] tracking-wider uppercase opacity-75 font-semibold">LADIES' ETHNIC & WESTERN</span>
                <h3 className="font-display text-2xl font-bold">Women's Wear</h3>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>Saree Washing & Rolling</span>
                  <span className="font-bold text-gray-900 dark:text-white">₹120</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-2">
                  <span>Designer Lehenga Dry Clean</span>
                  <span className="font-bold text-gray-900 dark:text-white">₹250</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-2">
                  <span>Kurti Washing & Pressing</span>
                  <span className="font-bold text-gray-900 dark:text-white">₹60</span>
                </div>
              </div>
            </div>

            {/* Category 3 */}
            <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-amber-600 text-white p-6 flex flex-col justify-between h-40">
                <span className="text-[10px] tracking-wider uppercase opacity-75 font-semibold">LINEN & BEDDING CARE</span>
                <h3 className="font-display text-2xl font-bold">Household</h3>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>Heavy Blanket Wash & Dry</span>
                  <span className="font-bold text-gray-900 dark:text-white">₹150</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-2">
                  <span>Living Room Curtains (per pc)</span>
                  <span className="font-bold text-gray-900 dark:text-white">₹150</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-2">
                  <span>Premium Bedsheet Sanitizing</span>
                  <span className="font-bold text-gray-900 dark:text-white">₹80</span>
                </div>
              </div>
            </div>

            {/* Category 4 */}
            <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-indigo-600 text-white p-6 flex flex-col justify-between h-40">
                <span className="text-[10px] tracking-wider uppercase opacity-75 font-semibold">CHILDREN'S HYGIENIC WASH</span>
                <h3 className="font-display text-2xl font-bold">Kids' Wear</h3>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>Frock/Skirt Wash & Press</span>
                  <span className="font-bold text-gray-900 dark:text-white">₹50</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-2">
                  <span>School Blazer Dry Clean</span>
                  <span className="font-bold text-gray-900 dark:text-white">₹90</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-2">
                  <span>Kids Jeans & Trouser Press</span>
                  <span className="font-bold text-gray-900 dark:text-white">₹40</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900 border-t border-b border-gray-100 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <h2 className="font-display text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              What Our Happy Customers Say
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Read authentic feedback from residents across Kukatpally, Balanagar, and Jeedimetla.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {settings.testimonials && settings.testimonials.map((test) => (
              <div key={test.id} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-950 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-1 mb-3.5">
                    {Array.from({ length: test.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 italic leading-relaxed">
                    "{test.review}"
                  </p>
                </div>
                <div className="mt-6 border-t border-gray-100 dark:border-gray-900 pt-4 flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-950 dark:text-white">{test.name}</span>
                  <span className="text-gray-400 font-mono text-[10px]">{test.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs Accordion */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center space-y-3 mb-12">
            <HelpCircle className="h-10 w-10 text-brand-500 mx-auto" />
            <h2 className="font-display text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Everything you need to know about scheduling, fabric safety, pricing, and QR payments.
            </p>
          </div>

          <div className="space-y-4">
            {settings.faqs && settings.faqs.map((faq) => {
              const isOpen = activeFaq === faq.id;
              return (
                <div 
                  key={faq.id} 
                  className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden bg-gray-50 dark:bg-gray-900/50"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : faq.id)}
                    className="w-full flex items-center justify-between p-5 text-left font-semibold text-gray-900 dark:text-white text-sm"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`h-4 w-4 transform transition-transform text-gray-400 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="p-5 pt-0 text-xs text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-800 leading-relaxed bg-white dark:bg-gray-900">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Information & Map placeholder */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Contact Info */}
            <div className="lg:col-span-5 space-y-6">
              <h2 className="font-display text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Contact & Store Details
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Need customized group uniform dry cleaning, corporate billing assistance, or immediate delivery support? Reach out to us directly or visit our physical store location near Kandri Gutta.
              </p>

              <div className="space-y-4">
                <div className="flex items-start space-x-3.5">
                  <MapPin className="h-5 w-5 text-brand-600 dark:text-brand-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">Physical Address</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                      {settings.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <Phone className="h-5 w-5 text-brand-600 dark:text-brand-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">Store Phone Numbers</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex flex-col space-y-0.5 font-mono">
                      {settings.phones?.map((phone, idx) => {
                        const trimmed = phone.trim();
                        const formatted = trimmed.startsWith("+") || trimmed.startsWith("0") ? trimmed : `+91 ${trimmed}`;
                        return (
                          <span key={idx}>{formatted}</span>
                        );
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <a
                  href="tel:7337427757"
                  className="inline-flex items-center space-x-2 rounded-lg bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-brand-700 transition-colors shadow-xs"
                >
                  <Phone className="h-4 w-4" />
                  <span>Call Primary</span>
                </a>
                <button
                  onClick={handleWhatsApp}
                  className="inline-flex items-center space-x-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>WhatsApp Chat</span>
                </button>
              </div>
            </div>

            {/* Google Map Mock Frame (Zero empty image boxes, clean and modern UI vector design) */}
            <div className="lg:col-span-7">
              <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white p-2 dark:border-gray-800 dark:bg-gray-950 shadow-md">
                <div className="relative rounded-2xl bg-slate-900 text-white p-8 overflow-hidden h-96 flex flex-col justify-between">
                  {/* Subtle dark pattern representing maps */}
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:24px_24px]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-950/80 to-transparent" />

                  <div className="relative z-10 flex items-center justify-between">
                    <span className="inline-flex items-center rounded-md bg-brand-500/30 px-2.5 py-1 text-xs font-bold text-brand-300 border border-brand-500/20 uppercase tracking-wider font-mono">
                      GPS Locator
                    </span>
                    <span className="text-xs font-medium text-slate-300">Hyderabad, Telangana</span>
                  </div>

                  <div className="relative z-10 text-center space-y-4 max-w-sm mx-auto my-auto">
                    <div className="h-14 w-14 rounded-full bg-brand-500 text-white flex items-center justify-center mx-auto shadow-lg animate-bounce">
                      <MapPin className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold">SK Laundry Services Store</h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        Geetha Nagar, Beside St. Martin School, Kandri Gutta, Balanagar.
                      </p>
                    </div>
                    <a 
                      href="https://maps.google.com/?q=Geetha+Nagar+Balanagar+Hyderabad" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs px-5 py-3 transition-colors shadow-md cursor-pointer"
                    >
                      Open in Google Maps App
                    </a>
                  </div>

                  <div className="relative z-10 flex justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-4">
                    <span>Lat/Lng: 17.4725° N, 78.4419° E</span>
                    <span>9.3 KM from Secunderabad Junction</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
