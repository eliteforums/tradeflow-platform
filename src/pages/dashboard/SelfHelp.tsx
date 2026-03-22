import { Link } from "react-router-dom";
import { Lock, Award, PenLine, BarChart3, Heart } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

const activeTools = [
  { name: "Quest Cards", emoji: "🏆", icon: Award, description: "Daily micro-challenges for wellbeing", gradient: "from-amber-500 to-orange-500", path: "/dashboard/quest-cards" },
  { name: "Journaling", emoji: "📝", icon: PenLine, description: "Guided reflective writing prompts", gradient: "from-emerald-500 to-teal-500", path: "/dashboard/journaling" },
  { name: "Mood Tracker", emoji: "🎭", icon: BarChart3, description: "Track your emotional patterns", gradient: "from-cyan-500 to-blue-500", path: "/dashboard/mood-tracker" },
  { name: "Gratitude", emoji: "🙏", icon: Heart, description: "Daily gratitude practice", gradient: "from-pink-500 to-rose-500", path: "/dashboard/gratitude" },
  { name: "Wreck the Buddy", emoji: "🥊", icon: Heart, description: "Release stress through ragdoll bashing", gradient: "from-red-500 to-pink-500", path: "/dashboard/wreck-buddy" },
  { name: "Tibetan Bowl", emoji: "🔔", icon: Heart, description: "Interactive sound meditation", gradient: "from-violet-500 to-purple-500", path: "/dashboard/tibetan-bowl" },
];

const SelfHelp = () => {
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-5 pb-24">
        <div>
          <h1 className="text-2xl font-bold font-display">Self-Help Tools</h1>
          <p className="text-sm text-muted-foreground">Daily micro-wellbeing activities</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {activeTools.map((tool) => (
            <Link
              key={tool.name}
              to={tool.path}
              className="relative overflow-hidden rounded-2xl bg-card border border-border/40 p-4 hover:border-primary/30 active:scale-[0.97] transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center text-2xl mb-3 group-hover:scale-105 transition-transform`}>
                {tool.emoji}
              </div>
              <h3 className="text-sm font-semibold font-display mb-0.5">{tool.name}</h3>
              <p className="text-xs text-muted-foreground leading-snug">{tool.description}</p>
            </Link>
          ))}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default SelfHelp;
