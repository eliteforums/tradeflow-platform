import { Users, Heart, Brain, Music, Sparkles, Calendar, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Calendar,
    title: "Expert Appointments",
    description: "Book video & audio sessions with verified mental health professionals. Pay with Eternia Care Credits.",
    gradient: "from-emerald-500 to-teal-500",
    tag: "Video + Audio",
    span: "md:col-span-1",
  },
  {
    icon: Heart,
    title: "Peer Connect",
    description: "Real-time anonymous chat with trained psychology interns. Voice & video call support via VideoSDK.",
    gradient: "from-pink-500 to-rose-500",
    tag: "Real-time",
    span: "md:col-span-1",
  },
  {
    icon: Brain,
    title: "BlackBox",
    description: "A safe space for anonymous emotional expression. AI monitors for crisis signals with zero visibility to others.",
    gradient: "from-violet-500 to-purple-500",
    tag: "AI-Monitored",
    span: "md:col-span-1",
  },
  {
    icon: Music,
    title: "Sound Therapy",
    description: "Curated meditation, soundscapes, Tibetan bowls, and guided breathing exercises for daily calm.",
    gradient: "from-cyan-500 to-blue-500",
    tag: "Audio Library",
    span: "md:col-span-1",
  },
];

const FeaturesSection = () => (
  <section id="features" className="py-28 px-6 relative">
    {/* Subtle grid background */}
    <div className="absolute inset-0 opacity-[0.02]"
      style={{
        backgroundImage: `radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)`,
        backgroundSize: "24px 24px",
      }}
    />

    <div className="container mx-auto relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 mb-6">
          <span className="text-xs font-medium text-primary uppercase tracking-wider">Platform Features</span>
        </div>
        <h2 className="section-title mb-4 max-w-3xl mx-auto">
          Everything your campus needs for{" "}
          <span className="text-gradient">mental wellness</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Five powerful modules. One anonymous identity. Complete institutional control.
        </p>
      </motion.div>

      {/* Bento grid */}
      <div className="grid md:grid-cols-2 gap-4 max-w-5xl mx-auto">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08, duration: 0.5 }}
            className={`group relative rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm p-7 hover:bg-card/60 hover:border-primary/20 transition-all duration-500 ${feature.span}`}
          >
            {/* Hover glow */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), hsl(var(--primary) / 0.04), transparent 40%)` }}
            />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>

              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold font-display text-foreground">{feature.title}</h3>
                <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full border border-border/30 text-muted-foreground/60">
                  {feature.tag}
                </span>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Self-Help full-width card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-4 max-w-5xl mx-auto"
      >
        <div className="group rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm p-7 hover:bg-card/60 hover:border-primary/20 transition-all duration-500">
          <div className="flex items-start gap-5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold font-display text-foreground">Self-Help & Gamification</h3>
                <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full border border-border/30 text-muted-foreground/60">
                  XP System
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Daily quest cards, emotional release tools, and guided breathing exercises — all gamified with XP rewards to build healthy habits.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Quest Cards", "Wreck the Buddy", "Tibetan Bowl", "XP Rewards", "Streak Tracking"].map((tool) => (
                  <span key={tool} className="px-3 py-1.5 rounded-lg bg-muted/30 border border-border/20 text-xs text-muted-foreground">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default FeaturesSection;
