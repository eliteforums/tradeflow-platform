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

const navItems = [
  { icon: Home, label: "Dashboard", path: "/dashboard" },
  { icon: Calendar, label: "Appointments", path: "/dashboard/appointments" },
  { icon: MessageCircle, label: "Peer Connect", path: "/dashboard/peer-connect" },
  { icon: Box, label: "BlackBox", path: "/dashboard/blackbox" },
  { icon: Music, label: "Sound Therapy", path: "/dashboard/sound-therapy" },
  { icon: Sparkles, label: "Self-Help", path: "/dashboard/self-help" },
  { icon: Coins, label: "Credits", path: "/dashboard/credits" },
  { icon: User, label: "Profile", path: "/dashboard/profile" },
];

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          sidebarOpen ? "w-60" : "w-[68px]"
        } bg-sidebar border-r border-sidebar-border`}
      >
        <div className="h-14 flex items-center justify-between px-3 border-b border-sidebar-border">
          <Link to="/dashboard" className="flex items-center gap-2.5 min-w-0">
            <EterniaLogo size={32} />
            {sidebarOpen && (
              <span className="text-lg font-bold font-display text-sidebar-foreground truncate">
                Eternia
              </span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-sidebar-foreground hover:bg-sidebar-accent h-8 w-8 shrink-0"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${!sidebarOpen ? "rotate-180" : ""}`} />
          </Button>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-sm ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <item.icon className="w-[18px] h-[18px] shrink-0" />
                {sidebarOpen && <span className="font-medium truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-2 border-t border-sidebar-border">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={`w-full justify-start gap-2.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-destructive h-10 ${
              !sidebarOpen ? "justify-center px-0" : ""
            }`}
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-background/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <EterniaLogo size={28} />
          <span className="text-base font-bold font-display">Eternia</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 pt-14">
          <div
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative bg-background border-b border-border shadow-xl">
            <nav className="px-3 py-3 space-y-0.5 max-h-[70vh] overflow-y-auto">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-sm ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <item.icon className="w-[18px] h-[18px]" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
              <button
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-foreground hover:bg-muted hover:text-destructive transition-all"
              >
                <LogOut className="w-[18px] h-[18px]" />
                <span className="font-medium">Logout</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main
        className={`flex-1 min-h-screen transition-all duration-300 ${
          sidebarOpen ? "lg:ml-60" : "lg:ml-[68px]"
        } pt-14 lg:pt-0`}
      >
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
