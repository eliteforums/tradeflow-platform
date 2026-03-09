import { Link } from "react-router-dom";
import {
  Calendar,
  MessageCircle,
  Box,
  Music,
  Sparkles,
  Coins,
  ArrowRight,
  TrendingUp,
  Clock,
  Award,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/hooks/useCredits";

const Dashboard = () => {
  const { profile } = useAuth();
  const { balance } = useCredits();

  const portals = [
    {
      icon: Calendar,
      title: "Expert Appointments",
      description: "Book sessions with mental health professionals",
      path: "/dashboard/appointments",
      gradient: "from-emerald-500 to-teal-500",
      bgGlow: "bg-emerald-500/10",
    },
    {
      icon: MessageCircle,
      title: "Peer Connect",
      description: "Connect with trained psychology interns",
      path: "/dashboard/peer-connect",
      gradient: "from-pink-500 to-rose-500",
      bgGlow: "bg-pink-500/10",
    },
    {
      icon: Box,
      title: "BlackBox",
      description: "Anonymous emotional expression space",
      path: "/dashboard/blackbox",
      gradient: "from-violet-500 to-purple-500",
      bgGlow: "bg-violet-500/10",
    },
    {
      icon: Music,
      title: "Sound Therapy",
      description: "Guided meditation and soundscapes",
      path: "/dashboard/sound-therapy",
      gradient: "from-cyan-500 to-blue-500",
      bgGlow: "bg-cyan-500/10",
    },
  ];

  const selfHelpTools = [
    { name: "Quest Cards", icon: Award, description: "Daily challenges" },
    { name: "Wreck the Buddy", icon: Sparkles, description: "Stress release" },
    { name: "Tibetan Bowl", icon: Music, description: "Guided breathing" },
  ];

  const stats = [
    { label: "Sessions", value: String(profile?.total_sessions || 0), icon: Clock },
    { label: "Credits", value: String(balance), icon: Coins },
    { label: "Streak", value: String(profile?.streak_days || 0), icon: TrendingUp },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* Welcome */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display mb-1 sm:mb-2">
              Welcome back, {profile?.username || "user"} 👋
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Your safe space for mental wellness.
            </p>
          </div>
          <Link
            to="/dashboard/credits"
            className="flex items-center gap-3 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-gradient-eternia-subtle border border-border hover:border-primary/50 transition-all self-start"
          >
            <Coins className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Care Credits</p>
              <p className="font-bold text-base sm:text-lg">{balance} ECC</p>
            </div>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-3 p-3 sm:p-5 rounded-xl bg-card border border-border"
            >
              <div className="w-9 sm:w-12 h-9 sm:h-12 rounded-lg sm:rounded-xl bg-muted flex items-center justify-center shrink-0">
                <stat.icon className="w-4 sm:w-6 h-4 sm:h-6 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold">{stat.value}</p>
                <p className="text-[11px] sm:text-sm text-muted-foreground truncate">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Core Portals */}
        <div>
          <h2 className="text-lg sm:text-xl font-bold font-display mb-3 sm:mb-4">Core Portals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {portals.map((portal) => (
              <Link
                key={portal.path}
                to={portal.path}
                className={`portal-card ${portal.bgGlow} border border-border group`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`w-11 sm:w-14 h-11 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${portal.gradient} flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <portal.icon className="w-5 sm:w-7 h-5 sm:h-7 text-white" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold font-display mb-0.5 sm:mb-1">{portal.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{portal.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Self-Help Tools */}
        <div>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-bold font-display">Self-Help Tools</h2>
            <Link
              to="/dashboard/self-help"
              className="text-xs sm:text-sm text-primary hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {selfHelpTools.map((tool) => (
              <Link
                key={tool.name}
                to="/dashboard/self-help"
                className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl bg-card border border-border hover:border-primary/50 transition-all"
              >
                <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0">
                  <tool.icon className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base">{tool.name}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{tool.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Tips */}
        <div className="p-4 sm:p-6 rounded-2xl bg-gradient-eternia-subtle border border-border">
          <h3 className="font-semibold font-display mb-1.5 sm:mb-2 text-sm sm:text-base">💡 Tip of the Day</h3>
          <p className="text-sm text-muted-foreground">
            Taking just 5 minutes for deep breathing can significantly reduce stress. 
            Try the Tibetan Bowl exercise in Self-Help Tools.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
