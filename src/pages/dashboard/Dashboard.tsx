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

const Dashboard = () => {
  const portals = [
    {
      icon: Calendar,
      title: "Expert Appointments",
      description: "Book sessions with verified mental health professionals",
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
    { name: "Quest Cards", icon: Award, description: "Daily wellbeing challenges" },
    { name: "Wreck the Buddy", icon: Sparkles, description: "Emotional release tool" },
    { name: "Tibetan Bowl", icon: Music, description: "Guided breathing" },
  ];

  const stats = [
    { label: "Sessions This Month", value: "3", icon: Clock },
    { label: "Credits Balance", value: "250", icon: Coins },
    { label: "Streak Days", value: "7", icon: TrendingUp },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display mb-2">Welcome back 👋</h1>
            <p className="text-muted-foreground">
              Your safe space for mental wellness. How are you feeling today?
            </p>
          </div>
          <Link
            to="/dashboard/credits"
            className="flex items-center gap-3 px-5 py-3 rounded-xl bg-gradient-eternia-subtle border border-border hover:border-primary/50 transition-all"
          >
            <Coins className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Care Credits</p>
              <p className="font-bold text-lg">250 ECC</p>
            </div>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-4 p-5 rounded-xl bg-card border border-border"
            >
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Core Portals */}
        <div>
          <h2 className="text-xl font-bold font-display mb-4">Core Portals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portals.map((portal) => (
              <Link
                key={portal.path}
                to={portal.path}
                className={`portal-card ${portal.bgGlow} border border-border group`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${portal.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <portal.icon className="w-7 h-7 text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-lg font-semibold font-display mb-1">{portal.title}</h3>
                <p className="text-sm text-muted-foreground">{portal.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Self-Help Tools */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-display">Self-Help Tools</h2>
            <Link
              to="/dashboard/self-help"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {selfHelpTools.map((tool) => (
              <Link
                key={tool.name}
                to="/dashboard/self-help"
                className="flex items-center gap-4 p-5 rounded-xl bg-card border border-border hover:border-primary/50 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <tool.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">{tool.name}</h3>
                  <p className="text-sm text-muted-foreground">{tool.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Tips */}
        <div className="p-6 rounded-2xl bg-gradient-eternia-subtle border border-border">
          <h3 className="font-semibold font-display mb-2">💡 Tip of the Day</h3>
          <p className="text-muted-foreground">
            Taking just 5 minutes for deep breathing can significantly reduce stress and anxiety. 
            Try our Tibetan Bowl exercise in the Self-Help Tools section.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
