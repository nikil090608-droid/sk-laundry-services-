import React from "react";
import { 
  Mail, 
  Lock, 
  User as UserIcon, 
  Phone, 
  MapPin, 
  AlertCircle, 
  CheckCircle,
  WashingMachine
} from "lucide-react";
import { User } from "../types";

interface LoginRegisterProps {
  setCurrentUser: (user: User | null) => void;
  setActivePage: (page: string) => void;
}

export default function LoginRegister({ setCurrentUser, setActivePage }: LoginRegisterProps) {
  const [isLogin, setIsLogin] = React.useState(true);
  
  // Credentials input
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [mobile, setMobile] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [address, setAddress] = React.useState("");
  
  const [errorMsg, setErrorMsg] = React.useState("");
  const [successMsg, setSuccessMsg] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (isLogin) {
        // Standard email login
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (response.ok) {
          setCurrentUser(data.user);
          localStorage.setItem("skl_user", JSON.stringify(data.user));
          if (data.token) {
            localStorage.setItem("skl_token", data.token);
          }
          setSuccessMsg("Logged in successfully! Redirecting...");
          setTimeout(() => {
            setActivePage(data.user.role === "OWNER" ? "admin-dashboard" : "customer-dashboard");
          }, 1000);
        } else {
          setErrorMsg(data.error || "Incorrect login credentials.");
        }
      } else {
        // Customer Registration
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, mobile, password, address })
        });
        const data = await response.json();
        if (response.ok) {
          setSuccessMsg("Account Created Successfully");
          if (data.user) {
            setCurrentUser(data.user);
            localStorage.setItem("skl_user", JSON.stringify(data.user));
            if (data.token) {
              localStorage.setItem("skl_token", data.token);
            }
            setTimeout(() => {
              setActivePage("customer-dashboard");
            }, 1000);
          } else {
            setIsLogin(true);
            setPassword("");
          }
        } else {
          setErrorMsg(data.error || "Failed to register account.");
        }
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("Network error connecting to SK Laundry servers.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-3xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-950 shadow-xl space-y-6">
        
        {/* visual Header */}
        <div className="text-center space-y-2">
          <div className="h-12 w-12 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto dark:bg-brand-950/40 dark:text-brand-400">
            <WashingMachine className="h-6 w-6 animate-spin-slow" />
          </div>
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            {isLogin ? "Customer Login" : "Create Account"}
          </h2>
          <p className="text-xs text-gray-400">
            {isLogin 
              ? "Access your historic bills, track pending orders, and spend loyalty points." 
              : "Register as an SK customer to start tracking and earning points."}
          </p>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="rounded-xl bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 p-3.5 text-xs font-semibold flex items-center gap-1.5 border border-red-100 dark:border-red-900/40">
            <AlertCircle className="h-4 w-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 p-3.5 text-xs font-semibold flex items-center gap-1.5 border border-emerald-100 dark:border-emerald-900/40">
            <CheckCircle className="h-4 w-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Main Forms */}
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-4.5 w-4.5 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Srikanth Rao"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-950 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4.5 w-4.5 text-gray-400" />
              <input
                type="email"
                required
                placeholder="e.g. srikanth@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-950 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4.5 w-4.5 text-gray-400" />
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="10 digit phone contact"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-950 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Security Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4.5 w-4.5 text-gray-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-950 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Saved Doorstep Address (Optional)</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4.5 w-4.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Balanagar, Hyderabad"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-950 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm py-3 shadow-md shadow-brand-600/10 cursor-pointer"
          >
            {loading ? "Authenticating..." : isLogin ? "Login Securely" : "Register Account"}
          </button>
        </form>

        {/* Helper Footer switches */}
        <div className="text-center pt-2 border-t border-gray-100 dark:border-gray-900">
          <p className="text-xs text-gray-500">
            {isLogin ? "New to SK Laundry?" : "Already registered with SK?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className="font-bold text-brand-600 hover:underline cursor-pointer"
            >
              {isLogin ? "Create an account" : "Log in to portal"}
            </button>
          </p>
          
          <div className="mt-4 text-[10px] text-gray-400 border-t border-gray-50 dark:border-gray-900 pt-3">
            <p>Are you the owner? Access <button onClick={() => setActivePage("owner-login")} className="text-brand-500 font-bold hover:underline">Owner Login Panel</button></p>
          </div>
        </div>

      </div>
    </div>
  );
}
