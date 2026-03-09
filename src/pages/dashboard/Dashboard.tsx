import { Link, Navigate } from "react-router-dom";
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
  Sun,
  Moon,
  Sunrise,
  Heart,
  AlertCircle,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/hooks/useCredits";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good Morning", icon: Sunrise, emoji: "🌅" };
  if (hour < 17) return { text: "Good Afternoon", icon: Sun, emoji: "☀️" };
  if (hour < 21) return { text: "Good Evening", icon: Moon, emoji: "🌙" };
  return { text: "Good Night", icon: Moon, emoji: "🌙" };
};

const motivationalQuotes = [
  "You're doing great. Every small step counts. 💪",
  "Your mental health matters. We're here for you. 🌱",
  "It takes courage to ask for help. You're brave. ✨",
  "One day at a time. You've got this. 🌟",
  "Healing isn't linear, and that's okay. 💚",
];

const Dashboard = () => {
  const { profile } = useAuth();
  const { balance } = useCredits();
  const greeting = getGreeting();
  const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  const portals = [
    {
      icon: Calendar,
      title: "Appointments",
      description: "Book expert sessions",
      path: "/dashboard/appointments",
      gradient: "from-emerald-500 to-teal-500",
      bgClass: "bg-emerald-500/8",
    },
    {
      icon: MessageCircle,
      title: "Peer Connect",
      description: "Talk to trained interns",
      path: "/dashboard/peer-connect",
      gradient: "from-pink-500 to-rose-500",
      bgClass: "bg-pink-500/8",
    },
    {
      icon: Box,
      title: "BlackBox",
      description: "Express anonymously",
      path: "/dashboard/blackbox",
      gradient: "from-violet-500 to-purple-500",
      bgClass: "bg-violet-500/8",
    },
    {
      icon: Music,
      title: "Sound Therapy",
      description: "Meditate & relax",
      path: "/dashboard/sound-therapy",
      gradient: "from-cyan-500 to-blue-500",
      bgClass: "bg-cyan-500/8",
    },
  ];

  const quickTools = [
    { name: "Quest Cards", icon: Award, path: "/dashboard/self-help", color: "text-amber-400" },
    { name: "Wreck Buddy", icon: Sparkles, path: "/dashboard/self-help", color: "text-pink-400" },
    { name: "Tibetan Bowl", icon: Music, path: "/dashboard/self-help", color: "text-violet-400" },
    { name: "Credits", icon: Coins, path: "/dashboard/credits", color: "text-emerald-400" },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Greeting — warm and personal */}
        <div className="pt-1">
          <p className="text-muted-foreground text-sm mb-0.5">{greeting.emoji} {greeting.text}</p>
          <h1 className="text-xl sm:text-2xl font-bold font-display">
            {profile?.username || "friend"}
          </h1>
        </div>

        {/* Motivational Card */}
        <div className="relative overflow-hidden rounded-2xl p-4 sm:p-5" style={{ background: "linear-gradient(135deg, hsl(var(--eternia-teal) / 0.12), hsl(var(--eternia-lavender) / 0.12))" }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20" style={{ background: "radial-gradient(circle, hsl(var(--eternia-teal)), transparent 70%)" }} />
          <Heart className="w-5 h-5 text-primary mb-2" />
          <p className="text-sm text-foreground/90 leading-relaxed relative z-10">{quote}</p>
        </div>

        {/* Low Balance Prompt (PRD: show when balance < 5 ECC) */}
        {balance < 5 && (
          <Link
            to="/dashboard/credits"
            className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:border-amber-400/40 transition-all"
          >
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Your care energy is low.</p>
              <p className="text-xs text-muted-foreground">Refill gently — earn credits through self-help activities.</p>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-500 shrink-0" />
          </Link>
        )}

        {/* Quick Stats Row */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="rounded-xl bg-card p-3 text-center border border-border/50">
            <p className="text-lg sm:text-xl font-bold">{profile?.streak_days || 0}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Day Streak 🔥</p>
          </div>
          <div className="rounded-xl bg-card p-3 text-center border border-border/50">
            <p className="text-lg sm:text-xl font-bold">{balance}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Credits 💎</p>
          </div>
          <div className="rounded-xl bg-card p-3 text-center border border-border/50">
            <p className="text-lg sm:text-xl font-bold">{profile?.total_sessions || 0}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Sessions 📊</p>
          </div>
        </div>

        {/* Stories-style Quick Tools — horizontal scroll */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 px-0.5">Quick Tools</p>
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
            {quickTools.map((tool) => (
              <Link
                key={tool.name}
                to={tool.path}
                className="flex flex-col items-center gap-1.5 shrink-0"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-card border border-border/50 flex items-center justify-center hover:border-primary/30 transition-all active:scale-95">
                  <tool.icon className={`w-6 h-6 ${tool.color}`} />
                </div>
                <span className="text-[10px] sm:text-[11px] text-muted-foreground text-center leading-tight w-14 sm:w-16 truncate">{tool.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Core Portals */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 px-0.5">Your Space</p>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {portals.map((portal) => (
              <Link
                key={portal.path}
                to={portal.path}
                className="group rounded-2xl bg-card border border-border/40 p-4 sm:p-5 hover:border-primary/30 transition-all active:scale-[0.97]"
              >
                <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${portal.gradient} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                  <portal.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-sm sm:text-[15px] font-semibold font-display mb-0.5">{portal.title}</h3>
                <p className="text-[11px] sm:text-xs text-muted-foreground leading-snug">{portal.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Self-Help Banner */}
        <Link
          to="/dashboard/self-help"
          className="block rounded-2xl bg-card border border-border/40 p-4 sm:p-5 hover:border-primary/30 transition-all group active:scale-[0.98]"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-[15px] font-semibold font-display">Self-Help & Wellbeing</h3>
              <p className="text-[11px] sm:text-xs text-muted-foreground">Quest cards, breathing exercises & more</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>
        </Link>

        {/* Tip */}
        <div className="rounded-xl bg-muted/30 p-3.5 sm:p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground/80">💡 Tip:</span> Complete daily quests to earn XP and build your wellness streak. Every action counts!
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
