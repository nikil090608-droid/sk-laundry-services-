import React from "react";
import { Lock, Mail, User as UserIcon, AlertCircle, WashingMachine, Key, Eye, EyeOff } from "lucide-react";
import { User } from "../types";

interface OwnerLoginProps {
  setCurrentUser: (user: User | null) => void;
  setActivePage: (page: string) => void;
}

export default function OwnerLogin({ setCurrentUser, setActivePage }: OwnerLoginProps) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPin, setShowPin] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleOwnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok && data.user?.role === "OWNER") {
        setCurrentUser(data.user);
        localStorage.setItem("skl_user", JSON.stringify(data.user));
        setActivePage("admin-dashboard");
      } else {
        setErrorMsg(data.error || "Unauthorized access - Owner login required.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network failure authenticating secure owner access.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-3xl border border-amber-200 bg-amber-500/5 p-8 dark:border-amber-900/40 dark:bg-amber-950/5 shadow-xl space-y-6">
        
        {/* visual Header */}
        <div className="text-center space-y-2">
          <div className="h-12 w-12 bg-amber-500/10 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Owner Security Login
          </h2>
          <p className="text-xs text-amber-700 dark:text-amber-400">
            This dashboard URL is restricted to the administrator. Under penal code of Hyderabad registrars.
          </p>
        </div>

        {errorMsg && (
          <div className="rounded-xl bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 p-3.5 text-xs font-semibold flex items-center gap-1.5 border border-red-100 dark:border-red-900/40">
            <AlertCircle className="h-4 w-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleOwnerSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Owner ID</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4.5 w-4.5 text-gray-400" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-950 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Secure PIN</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4.5 w-4.5 text-gray-400" />
              <input
                type={showPin ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-950 text-gray-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-hidden"
              >
                {showPin ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm py-3 transition-colors cursor-pointer"
          >
            {loading ? "Authenticating security..." : "Unlock Dashboard"}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-amber-200/40">
          <button
            onClick={() => setActivePage("home")}
            className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
          >
            Cancel and Return to Home
          </button>
        </div>

      </div>
    </div>
  );
}
