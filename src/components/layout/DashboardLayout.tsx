import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Calendar,
  MessageCircle,
  Box,
  Music,
  Sparkles,
  Coins,
  User,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from "lucide-react";
import EterniaLogo from "@/components/EterniaLogo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: Calendar, label: "Expert Appointments", path: "/dashboard/appointments" },
    { icon: MessageCircle, label: "Peer Connect", path: "/dashboard/peer-connect" },
    { icon: Box, label: "BlackBox", path: "/dashboard/blackbox" },
    { icon: Music, label: "Sound Therapy", path: "/dashboard/sound-therapy" },
    { icon: Sparkles, label: "Self-Help Tools", path: "/dashboard/self-help" },
    { icon: Coins, label: "Care Credits", path: "/dashboard/credits" },
    { icon: User, label: "Profile", path: "/dashboard/profile" },
  ];

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-50 transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        } bg-sidebar border-r border-sidebar-border`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          <Link to="/dashboard" className="flex items-center gap-3">
            <EterniaLogo size={40} />
            {sidebarOpen && (
              <span className="text-xl font-bold font-display text-sidebar-foreground">
                Eternia
              </span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <ChevronLeft className={`w-5 h-5 transition-transform ${!sidebarOpen ? "rotate-180" : ""}`} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-sidebar-border">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={`w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-destructive ${
              !sidebarOpen ? "justify-center" : ""
            }`}
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 glass-strong flex items-center justify-between px-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <EterniaLogo size={40} />
          <span className="text-xl font-bold font-display">Eternia</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 pt-16 bg-background">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start gap-3 px-4 py-3 text-foreground hover:bg-muted hover:text-destructive"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </Button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main
        className={`flex-1 min-h-screen transition-all duration-300 ${
          sidebarOpen ? "lg:ml-64" : "lg:ml-20"
        } pt-16 lg:pt-0`}
      >
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
