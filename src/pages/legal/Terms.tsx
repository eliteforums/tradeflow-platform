import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import EterniaLogo from "@/components/EterniaLogo";

const Terms = () => (
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

      <h1 className="text-3xl font-bold font-display mb-6">Terms of Service</h1>
      <p className="text-muted-foreground text-sm mb-8">Last updated: March 9, 2026</p>

      <div className="space-y-6 text-sm leading-relaxed text-foreground/80">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">1. Acceptance of Terms</h2>
          <p>By accessing or using Eternia, you agree to be bound by these Terms of Service. If you do not agree, do not use the platform.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">2. Eligibility</h2>
          <p>Eternia is available only to students, staff, and authorized personnel of partnered institutions. You must have a valid institution code to register.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">3. Account & Anonymity</h2>
          <p>Your account is anonymous. You are responsible for maintaining the confidentiality of your credentials. Do not share your login details with others.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">4. Acceptable Use</h2>
          <p>You agree not to use Eternia for harassment, abuse, or any illegal activity. Peer sessions and BlackBox entries must respect community guidelines. Content flagged by AI moderation may be reviewed.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">5. Credits (ECC)</h2>
          <p>Eternia Credits are non-transferable and have no monetary value outside the platform. Credits are earned through activities and used for services within the platform.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">6. Disclaimer</h2>
          <p>Eternia is a wellbeing support platform and is <strong>not</strong> a substitute for professional medical or psychiatric treatment. In case of emergency, please contact local emergency services.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">7. Changes to Terms</h2>
          <p>We may update these terms from time to time. Continued use of the platform constitutes acceptance of the updated terms.</p>
        </section>
      </div>
    </div>
  </div>
);

export default Terms;
