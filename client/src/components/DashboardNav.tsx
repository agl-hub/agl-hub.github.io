import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import {
    BarChart3,
    ShoppingCart,
    Wrench,
    Users,
    DollarSign,
    Package,
    CreditCard,
    Bell,
    LogOut,
    Menu,
    X,
    MessageSquare,
    Upload,
    FileText,
  } from "lucide-react";
import { Link } from "wouter";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
}

export default function DashboardNav() {
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    { label: "Dashboard", icon: <BarChart3 size={20} />, href: "/" },
    { label: "Sales", icon: <ShoppingCart size={20} />, href: "/sales" },
    { label: "Workshop", icon: <Wrench size={20} />, href: "/workshop" },
    { label: "Staff", icon: <Users size={20} />, href: "/staff" },
    { label: "Finances", icon: <DollarSign size={20} />, href: "/finances" },
    { label: "Inventory", icon: <Package size={20} />, href: "/inventory" },
    { label: "Credit Sales", icon: <CreditCard size={20} />, href: "/credit-sales" },
    { label: "AI Assistant", icon: <MessageSquare size={20} />, href: "/chat" },
    { label: "Data Import", icon: <Upload size={20} />, href: "/import" },
    { label: "Reports", icon: <FileText size={20} />, href: "/reports" },
  ];

  if (!isAuthenticated) {
    return (
      <nav className="bg-gradient-to-r from-red-900 to-red-800 text-white p-4 flex justify-between items-center">
        <div className="text-2xl font-bold">AGL Command Center</div>
        <Button onClick={() => window.location.href = getLoginUrl()} className="bg-white text-red-900 hover:bg-gray-100">
          Login
        </Button>
      </nav>
    );
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-gradient-to-r from-red-900 to-red-800 text-white p-4 flex justify-between items-center">
        <div className="font-bold">AGL Command Center</div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white p-4 transition-transform duration-300 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } md:relative md:translate-x-0 z-50 md:z-0`}
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-red-500">AGL</h1>
          <p className="text-xs text-gray-400">Command Center</p>
        </div>

        <nav className="space-y-2 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-600/20 hover:text-red-400 transition-colors group"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="text-gray-400 group-hover:text-red-400">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-red-600 text-white text-xs rounded-full px-2 py-1">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="border-t border-gray-700 pt-4 space-y-2">
          <div className="px-4 py-2">
            <p className="text-xs text-gray-400">Logged in as</p>
            <p className="text-sm font-medium truncate">{user?.name || user?.email}</p>
          </div>
          <Button
            onClick={() => logout()}
            className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
          >
            <LogOut size={16} />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
