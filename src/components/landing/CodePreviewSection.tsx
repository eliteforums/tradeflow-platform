import { motion } from "framer-motion";

const CodePreviewSection = () => (
  <section className="py-28 px-6 relative">
    <div className="container mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 mb-6">
          <span className="text-xs font-medium text-primary uppercase tracking-wider">Developer-Friendly</span>
        </div>
        <h2 className="section-title">
          Secure architecture,{" "}
          <span className="text-gradient">clean APIs</span>
        </h2>
      </motion.div>

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-5 items-stretch">
        {/* Code block */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-border/30 bg-card/50 backdrop-blur-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-destructive/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-eternia-warning/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-eternia-success/40" />
            </div>
            <div className="flex gap-3">
              <span className="text-[10px] text-primary px-2 py-0.5 rounded bg-primary/10">onboarding.ts</span>
              <span className="text-[10px] text-muted-foreground/40 px-2 py-0.5">auth.ts</span>
            </div>
          </div>
          <pre className="p-5 text-[13px] leading-[1.8] overflow-x-auto font-mono">
            <code className="text-muted-foreground">
              <span className="text-eternia-lavender">{"// Three-layer validation"}</span>{"\n"}
              <span className="text-eternia-teal">const</span>{" onboard = "}<span className="text-eternia-teal">async</span>{" (code) => {"}{"\n"}
              {"  "}<span className="text-eternia-teal">const</span>{" inst = "}<span className="text-eternia-teal">await</span>{"\n"}
              {"    validateCode(code);"}{"\n"}
              {"  "}<span className="text-eternia-teal">const</span>{" verified = "}<span className="text-eternia-teal">await</span>{"\n"}
              {"    verifySPOC(inst.qr);"}{"\n"}
              {"  "}<span className="text-eternia-teal">const</span>{" user = "}<span className="text-eternia-teal">await</span>{"\n"}
              {"    createProfile({"}{"\n"}
              {"      username: genAlias(),"}{"\n"}
              {"      device: bindDevice(),"}{"\n"}
              {"      credits: "}<span className="text-eternia-warning">100</span>{","}{"\n"}
              {"    });"}{"\n"}
              {"  "}<span className="text-eternia-teal">return</span>{" { user, jwt };"}{"\n"}
              {"};"}
            </code>
          </pre>
        </motion.div>

        {/* Dashboard preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-border/30 bg-card/50 backdrop-blur-sm overflow-hidden"
        >
          <div className="flex items-center px-4 py-2.5 border-b border-border/30">
            <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">Live Preview — Student Profile</span>
          </div>
          <div className="p-5 space-y-5">
            {/* Profile header */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-eternia flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">CO</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">cosmic_owl_42</p>
                <p className="text-xs text-muted-foreground">Demo University • Student</p>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Credits", value: "100 ECC", color: "text-eternia-warning" },
                { label: "Modules", value: "5 Active", color: "text-eternia-success" },
                { label: "Encryption", value: "AES-256", color: "text-eternia-lavender" },
                { label: "Anonymity", value: "Full ✓", color: "text-primary" },
              ].map((item) => (
                <div key={item.label} className="rounded-lg bg-muted/20 border border-border/20 p-3">
                  <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider mb-0.5">{item.label}</p>
                  <p className={`text-sm font-semibold ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>

            {/* Activity */}
            <div className="rounded-lg bg-muted/20 border border-border/20 p-3">
              <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider mb-2">Recent Activity</p>
              <div className="space-y-2">
                {[
                  { text: "Completed Quest: Gratitude Journal", time: "2m ago" },
                  { text: "Peer Connect session ended", time: "1h ago" },
                  { text: "Sound Therapy: Deep Focus", time: "3h ago" },
                ].map((a) => (
                  <div key={a.text} className="flex items-center justify-between">
                    <span className="text-xs text-foreground/70">{a.text}</span>
                    <span className="text-[10px] text-muted-foreground/40">{a.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default CodePreviewSection;
