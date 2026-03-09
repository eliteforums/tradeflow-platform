import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import EterniaLogo from "@/components/EterniaLogo";

const Privacy = () => (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto px-5 py-8 max-w-3xl">
      <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <EterniaLogo size={36} />
        <span className="text-xl font-bold font-display">Eternia</span>
      </div>

      <h1 className="text-3xl font-bold font-display mb-6">Privacy Policy</h1>
      <p className="text-muted-foreground text-sm mb-8">Last updated: March 9, 2026</p>

      <div className="space-y-6 text-sm leading-relaxed text-foreground/80">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">1. Information We Collect</h2>
          <p>Eternia collects minimal information necessary to provide anonymous student wellbeing services. We collect your institution code, anonymous username, and usage data. We do <strong>not</strong> collect your real name, email, phone number, or any personally identifiable information.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">2. How We Use Your Information</h2>
          <p>Your data is used solely to provide and improve our services, including peer counseling, expert sessions, and self-help tools. All sensitive content (BlackBox entries, session notes) is encrypted end-to-end.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">3. Data Storage & Security</h2>
          <p>All data is stored on secure, encrypted servers. We employ industry-standard encryption protocols. Your BlackBox entries and session communications are encrypted and cannot be read by Eternia staff.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">4. Data Sharing</h2>
          <p>We do not sell, trade, or share your personal data with third parties. Anonymized, aggregated statistics may be shared with partnered institutions to improve campus wellbeing programs.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">5. Your Rights</h2>
          <p>You can request deletion of your account and all associated data at any time. Contact your institution's SPOC or reach out to us directly.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">6. Contact</h2>
          <p>For privacy-related inquiries, contact us at <span className="text-primary">privacy@eternia.com</span></p>
        </section>
      </div>
    </div>
  </div>
);

export default Privacy;
