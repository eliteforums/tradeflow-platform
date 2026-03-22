import { memo } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  Calendar, MessageCircle, Box, Music, Sparkles, Coins,
  ArrowRight, Award, Heart,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/hooks/useCredits";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/layout/DashboardLayout";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good Morning", emoji: "🌅" };
  if (hour < 17) return { text: "Good Afternoon", emoji: "☀️" };
  if (hour < 21) return { text: "Good Evening", emoji: "🌙" };
  return { text: "Good Night", emoji: "🌙" };
};

const quotes = [
  "You're doing great. Every small step counts. 💪",
  "Your mental health matters. We're here for you. 🌱",
  "It takes courage to ask for help. You're brave. ✨",
  "One day at a time. You've got this. 🌟",
  "Healing isn't linear, and that's okay. 💚",
];

const DashboardSkeleton = () => (
  <DashboardLayout>
    <div className="space-y-5 pb-24">
      <div>
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-6 w-40" />
      </div>
      <Skeleton className="h-20 w-full rounded-2xl" />
      <div className="grid grid-cols-3 gap-3">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>
      <Skeleton className="h-4 w-24" />
      <div className="flex gap-4">
        <Skeleton className="w-14 h-14 rounded-2xl" />
        <Skeleton className="w-14 h-14 rounded-2xl" />
        <Skeleton className="w-14 h-14 rounded-2xl" />
        <Skeleton className="w-14 h-14 rounded-2xl" />
      </div>
      <Skeleton className="h-4 w-24" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    </div>
  </DashboardLayout>
);

const MobileDashboard = () => {
  const { profile, isLoading } = useAuth();
  const { balance } = useCredits();
  const greeting = getGreeting();
  const quote = quotes[Math.floor(Math.random() * quotes.length)];

  if (isLoading) return <DashboardSkeleton />;

  const role = profile?.role as string | undefined;
  if (role === "admin") return <Navigate to="/admin" replace />;
  if (role === "spoc") return <Navigate to="/dashboard/spoc" replace />;
  if (role === "expert") return <Navigate to="/dashboard/expert" replace />;
  if (role === "therapist") return <Navigate to="/dashboard/therapist" replace />;
  if (role === "intern") return <Navigate to="/dashboard/intern" replace />;

  const connectPortals = [
    { icon: Calendar, title: "Expert Connect", desc: "Book expert sessions", path: "/dashboard/appointments", gradient: "from-emerald-500 to-teal-500" },
    { icon: MessageCircle, title: "Peer Connect", desc: "Talk to trained interns", path: "/dashboard/peer-connect", gradient: "from-pink-500 to-rose-500" },
    { icon: Box, title: "BlackBox", desc: "Express anonymously", path: "/dashboard/blackbox", gradient: "from-violet-500 to-purple-500" },
  ];

  const selfHelpTools = [
    { icon: Music, title: "Sound Therapy", desc: "Meditate & relax", path: "/dashboard/sound-therapy", gradient: "from-cyan-500 to-blue-500" },
    { icon: Award, title: "Quest Cards", desc: "Daily wellbeing quests", path: "/dashboard/quest-cards", gradient: "from-amber-400 to-orange-500" },
    { icon: Sparkles, title: "Journaling", desc: "Reflective writing", path: "/dashboard/journaling", gradient: "from-emerald-400 to-teal-500" },
  ];

  const quickTools = [
    { name: "Tibetan Bowl", icon: Music, path: "/dashboard/self-help", color: "text-violet-400" },
    { name: "Wallet", icon: Coins, path: "/dashboard/credits", color: "text-emerald-400" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-5 pb-24">
        {/* Greeting */}
        <div>
          <p className="text-muted-foreground text-sm">{greeting.emoji} {greeting.text}</p>
          <h1 className="text-xl font-bold font-display">{profile?.username || "friend"}</h1>
        </div>

        {/* Motivational */}
        <div className="rounded-2xl p-4" style={{ background: "linear-gradient(135deg, hsl(var(--eternia-teal) / 0.12), hsl(var(--eternia-lavender) / 0.12))" }}>
          <Heart className="w-5 h-5 text-primary mb-2" />
          <p className="text-sm text-foreground/90 leading-relaxed">{quote}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-card p-4 text-center border border-border/50">
            <p className="text-xl font-bold">{profile?.streak_days || 0}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Streak 🔥</p>
          </div>
          <div className="rounded-2xl bg-card p-4 text-center border border-border/50">
            <p className="text-xl font-bold">{balance}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Wallet 💎</p>
          </div>
          <div className="rounded-2xl bg-card p-4 text-center border border-border/50">
            <p className="text-xl font-bold">{profile?.total_sessions || 0}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Sessions 📊</p>
          </div>
        </div>

        {/* Quick Tools */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Tools</p>
          <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide">
            {quickTools.map((tool) => (
              <Link key={tool.name} to={tool.path} className="flex flex-col items-center gap-1.5 shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-card border border-border/50 flex items-center justify-center active:scale-95 transition-transform min-w-[44px] min-h-[44px]">
                  <tool.icon className={`w-6 h-6 ${tool.color}`} />
                </div>
                <span className="text-[11px] text-muted-foreground text-center w-14 truncate">{tool.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Connect */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Connect</p>
          <div className="grid grid-cols-3 gap-3">
            {connectPortals.map((p) => (
              <Link key={p.path} to={p.path} className="rounded-2xl bg-card border border-border/40 p-3 active:scale-[0.97] transition-transform min-h-[44px]">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.gradient} flex items-center justify-center mb-2`}>
                  <p.icon className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xs font-semibold font-display mb-0.5">{p.title}</h3>
                <p className="text-[10px] text-muted-foreground leading-snug">{p.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Self-Help Tools */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Self-Help Tools</p>
          <div className="grid grid-cols-3 gap-3">
            {selfHelpTools.map((p) => (
              <Link key={p.title} to={p.path} className="rounded-2xl bg-card border border-border/40 p-3 active:scale-[0.97] transition-transform min-h-[44px]">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.gradient} flex items-center justify-center mb-2`}>
                  <p.icon className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xs font-semibold font-display mb-0.5">{p.title}</h3>
                <p className="text-[10px] text-muted-foreground leading-snug">{p.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default memo(MobileDashboard);
