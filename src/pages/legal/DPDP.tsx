import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import EterniaLogo from "@/components/EterniaLogo";

const DPDP = () => (
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

      <h1 className="text-3xl font-bold font-display mb-6">DPDP Compliance</h1>
      <p className="text-muted-foreground text-sm mb-8">Digital Personal Data Protection Act, 2023 — Compliance Statement</p>

      <div className="space-y-6 text-sm leading-relaxed text-foreground/80">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">1. Purpose of Data Processing</h2>
          <p>Eternia processes personal data solely for the purpose of providing anonymous student wellbeing services as outlined in the Digital Personal Data Protection Act, 2023 (DPDP Act). We process data based on informed consent from our users.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">2. Data Minimization</h2>
          <p>In compliance with DPDP principles, Eternia collects only the minimum data necessary. We do not collect real names, personal emails, phone numbers, or Aadhaar/PAN details. Users interact through anonymous usernames.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">3. Consent</h2>
          <p>By registering on Eternia through your institution code, you provide informed consent for data processing. You may withdraw consent at any time by requesting account deletion.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">4. Data Principal Rights</h2>
          <p>As a Data Principal under the DPDP Act, you have the right to:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Access your personal data</li>
            <li>Request correction of inaccurate data</li>
            <li>Request erasure of your data</li>
            <li>Nominate another person to exercise rights on your behalf</li>
            <li>File grievances with the Data Protection Board of India</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">5. Data Protection Officer</h2>
          <p>For DPDP-related queries, contact our Data Protection Officer at <span className="text-primary">dpo@eternia.com</span></p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">6. Cross-Border Data</h2>
          <p>Eternia stores data within India-compliant infrastructure. Any cross-border transfers comply with DPDP Act provisions.</p>
        </section>
      </div>
    </div>
  </div>
);

export default DPDP;
