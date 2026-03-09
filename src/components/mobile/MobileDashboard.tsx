import { Link, Navigate } from "react-router-dom";
import {
  Calendar, MessageCircle, Box, Music, Sparkles, Coins,
  ArrowRight, Award, Heart, AlertCircle, Sunrise, Sun, Moon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/hooks/useCredits";
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

const MobileDashboard = () => {
  const { profile } = useAuth();
  const { balance } = useCredits();
  const greeting = getGreeting();
  const quote = quotes[Math.floor(Math.random() * quotes.length)];

  if (profile?.role === "admin" || profile?.role === "spoc") return <Navigate to="/admin" replace />;
  if (profile?.role === "expert") return <Navigate to="/dashboard/expert" replace />;
  if (profile?.role === "intern") return <Navigate to="/dashboard/intern" replace />;

  const portals = [
    { icon: Calendar, title: "Appointments", desc: "Book expert sessions", path: "/dashboard/appointments", gradient: "from-emerald-500 to-teal-500" },
    { icon: MessageCircle, title: "Peer Connect", desc: "Talk to trained interns", path: "/dashboard/peer-connect", gradient: "from-pink-500 to-rose-500" },
    { icon: Box, title: "BlackBox", desc: "Express anonymously", path: "/dashboard/blackbox", gradient: "from-violet-500 to-purple-500" },
    { icon: Music, title: "Sound Therapy", desc: "Meditate & relax", path: "/dashboard/sound-therapy", gradient: "from-cyan-500 to-blue-500" },
  ];

  const quickTools = [
    { name: "Quest Cards", icon: Award, path: "/dashboard/self-help", color: "text-amber-400" },
    { name: "Wreck Buddy", icon: Sparkles, path: "/dashboard/self-help", color: "text-pink-400" },
    { name: "Tibetan Bowl", icon: Music, path: "/dashboard/self-help", color: "text-violet-400" },
    { name: "Credits", icon: Coins, path: "/dashboard/credits", color: "text-emerald-400" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4 pb-24">
        {/* Greeting */}
        <div>
          <p className="text-muted-foreground text-xs">{greeting.emoji} {greeting.text}</p>
          <h1 className="text-lg font-bold font-display">{profile?.username || "friend"}</h1>
        </div>

        {/* Motivational */}
        <div className="rounded-xl p-3" style={{ background: "linear-gradient(135deg, hsl(var(--eternia-teal) / 0.12), hsl(var(--eternia-lavender) / 0.12))" }}>
          <Heart className="w-4 h-4 text-primary mb-1.5" />
          <p className="text-xs text-foreground/90 leading-relaxed">{quote}</p>
        </div>

        {/* Low Balance */}
        {balance < 5 && (
          <Link to="/dashboard/credits" className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 active:scale-[0.97] transition-transform">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium">Your care energy is low.</p>
              <p className="text-[10px] text-muted-foreground">Earn credits through self-help.</p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          </Link>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-card p-2.5 text-center border border-border/50">
            <p className="text-base font-bold">{profile?.streak_days || 0}</p>
            <p className="text-[10px] text-muted-foreground">Streak 🔥</p>
          </div>
          <div className="rounded-xl bg-card p-2.5 text-center border border-border/50">
            <p className="text-base font-bold">{balance}</p>
            <p className="text-[10px] text-muted-foreground">Credits 💎</p>
          </div>
          <div className="rounded-xl bg-card p-2.5 text-center border border-border/50">
            <p className="text-base font-bold">{profile?.total_sessions || 0}</p>
            <p className="text-[10px] text-muted-foreground">Sessions 📊</p>
          </div>
        </div>

        {/* Quick Tools */}
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Quick Tools</p>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {quickTools.map((tool) => (
              <Link key={tool.name} to={tool.path} className="flex flex-col items-center gap-1 shrink-0">
                <div className="w-12 h-12 rounded-xl bg-card border border-border/50 flex items-center justify-center active:scale-95 transition-transform">
                  <tool.icon className={`w-5 h-5 ${tool.color}`} />
                </div>
                <span className="text-[9px] text-muted-foreground text-center w-12 truncate">{tool.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Portals */}
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Your Space</p>
          <div className="grid grid-cols-2 gap-2">
            {portals.map((p) => (
              <Link key={p.path} to={p.path} className="rounded-xl bg-card border border-border/40 p-3 active:scale-[0.97] transition-transform">
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${p.gradient} flex items-center justify-center mb-2`}>
                  <p.icon className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xs font-semibold font-display mb-0.5">{p.title}</h3>
                <p className="text-[10px] text-muted-foreground leading-snug">{p.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Self-Help Banner */}
        <Link to="/dashboard/self-help" className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/40 active:scale-[0.98] transition-transform">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-semibold font-display">Self-Help & Wellbeing</h3>
            <p className="text-[10px] text-muted-foreground">Quest cards, breathing & more</p>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        </Link>

        {/* Tip */}
        <div className="rounded-xl bg-muted/30 p-3">
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground/80">💡 Tip:</span> Complete daily quests to earn XP and build your streak!
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MobileDashboard;
