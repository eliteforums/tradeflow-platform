import { motion } from "framer-motion";

const CodePreviewSection = () => (
  <section className="py-24 px-6 border-t border-border/30">
    <div className="container mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <h2 className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
          Built to deploy anywhere
        </h2>
        <p className="section-title">
          Secure architecture,{" "}
          <span className="text-gradient">clean design.</span>
        </p>
      </motion.div>

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-start">
        {/* Code block */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-border/50 bg-card overflow-hidden"
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-destructive/60" />
              <div className="w-3 h-3 rounded-full bg-eternia-warning/60" />
              <div className="w-3 h-3 rounded-full bg-eternia-success/60" />
            </div>
            <span className="text-xs text-muted-foreground ml-2">onboarding.ts</span>
          </div>
          <pre className="p-5 text-xs leading-relaxed overflow-x-auto">
            <code className="text-muted-foreground">
              <span className="text-eternia-lavender">// Three-layer institutional validation</span>{"\n"}
              <span className="text-eternia-teal">const</span> onboard = <span className="text-eternia-teal">async</span> (code: <span className="text-foreground">string</span>) {"=> {"}{"\n"}
              {"  "}<span className="text-eternia-teal">const</span> institution = <span className="text-eternia-teal">await</span>{"\n"}
              {"    "}validateInstitutionCode(code);{"\n"}
              {"  "}<span className="text-eternia-teal">const</span> qrVerified = <span className="text-eternia-teal">await</span>{"\n"}
              {"    "}verifySPOC(institution.spoc_qr);{"\n"}
              {"  "}<span className="text-eternia-teal">const</span> user = <span className="text-eternia-teal">await</span>{"\n"}
              {"    "}createAnonymousProfile({"{"}{"\n"}
              {"      "}username: generateAlias(),{"\n"}
              {"      "}device_id: bindDevice(),{"\n"}
              {"      "}credits: <span className="text-eternia-warning">100</span>, <span className="text-eternia-lavender">// Welcome ECC</span>{"\n"}
              {"    "}{"}"});{"\n"}
              {"  "}<span className="text-eternia-teal">return</span> {"{ "}user, token: encrypt(user.id) {"}"};{"\n"}
              {"}"};
            </code>
          </pre>
        </motion.div>

        {/* Terminal output */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-border/50 bg-card overflow-hidden"
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
            <span className="text-xs text-muted-foreground">Preview — Student Dashboard</span>
          </div>
          <div className="p-5 space-y-4">
            {[
              { label: "Institution", value: "Demo University", color: "text-eternia-teal" },
              { label: "Username", value: "cosmic_owl_42", color: "text-foreground" },
              { label: "Credits", value: "100 ECC", color: "text-eternia-warning" },
              { label: "Modules", value: "5 Active", color: "text-eternia-success" },
              { label: "Encryption", value: "AES-256 ✓", color: "text-eternia-lavender" },
              { label: "Anonymity", value: "Full ✓", color: "text-primary" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{item.label}</span>
                <span className={`text-sm font-medium ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default CodePreviewSection;
