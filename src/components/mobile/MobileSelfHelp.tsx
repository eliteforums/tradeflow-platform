import { Link } from "react-router-dom";
import { Lock, Award, PenLine, BarChart3, Heart } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

const activeTools = [
  { name: "Quest Cards", emoji: "🏆", icon: Award, description: "Daily micro-challenges for wellbeing", gradient: "from-amber-500 to-orange-500", path: "/dashboard/quest-cards" },
  { name: "Journaling", emoji: "📝", icon: PenLine, description: "Guided reflective writing prompts", gradient: "from-emerald-500 to-teal-500", path: "/dashboard/journaling" },
  { name: "Mood Tracker", emoji: "🎭", icon: BarChart3, description: "Track your emotional patterns", gradient: "from-cyan-500 to-blue-500", path: "/dashboard/mood-tracker" },
  { name: "Gratitude", emoji: "🙏", icon: Heart, description: "Daily gratitude practice", gradient: "from-pink-500 to-rose-500", path: "/dashboard/gratitude" },
  { name: "Wreck the Buddy", emoji: "🥊", icon: Heart, description: "Release stress through ragdoll bashing", gradient: "from-red-500 to-pink-500", path: "/dashboard/wreck-buddy" },
];

const comingSoonTools = [
  { name: "Tibetan Bowl", emoji: "🔔", description: "4-7-8 breathing with singing bowls", gradient: "from-violet-500 to-purple-500" },
];

const MobileSelfHelp = () => {
  return (
    <DashboardLayout>
      <div className="space-y-5 pb-24">
        <div>
          <h1 className="text-2xl font-bold font-display">Self-Help Tools</h1>
          <p className="text-sm text-muted-foreground">Daily micro-wellbeing activities</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {activeTools.map((tool) => (
            <Link
              key={tool.name}
              to={tool.path}
              className="relative overflow-hidden rounded-2xl bg-card border border-border/40 p-4 active:scale-[0.97] transition-all"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center text-2xl mb-3`}>
                {tool.emoji}
              </div>
              <h3 className="text-sm font-semibold font-display mb-0.5">{tool.name}</h3>
              <p className="text-xs text-muted-foreground leading-snug">{tool.description}</p>
            </Link>
          ))}
        </div>

        <div className="rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">Coming Soon</p>
            <p className="text-xs text-muted-foreground">More tools are being crafted with care!</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {comingSoonTools.map((tool) => (
            <div
              key={tool.name}
              className="relative overflow-hidden rounded-2xl bg-card border border-border/40 p-4 opacity-50 pointer-events-none select-none"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center text-2xl mb-3 grayscale`}>
                {tool.emoji}
              </div>
              <h3 className="text-sm font-semibold font-display mb-0.5">{tool.name}</h3>
              <p className="text-xs text-muted-foreground leading-snug">{tool.description}</p>
              <div className="absolute top-3 right-3">
                <Lock className="w-4 h-4 text-muted-foreground/50" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MobileSelfHelp;
