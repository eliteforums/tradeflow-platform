import { Link } from "react-router-dom";
import { Shield, Users, Heart, Music, Brain, Sparkles, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const Landing = () => {
  const features = [
    {
      icon: Users,
      title: "Expert Appointments",
      description: "Book sessions with verified mental health professionals through a secure, anonymous interface.",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      icon: Heart,
      title: "Peer Connect",
      description: "Connect with trained psychology interns for real-time anonymous support conversations.",
      gradient: "from-pink-500 to-rose-500",
    },
    {
      icon: Brain,
      title: "BlackBox",
      description: "A safe space for anonymous emotional expression with AI-powered crisis detection.",
      gradient: "from-violet-500 to-purple-500",
    },
    {
      icon: Music,
      title: "Sound Therapy",
      description: "Access curated audio experiences including meditation, soundscapes, and breathing exercises.",
      gradient: "from-cyan-500 to-blue-500",
    },
  ];

  const stats = [
    { value: "100%", label: "Anonymous" },
    { value: "24/7", label: "Available" },
    { value: "DPDP", label: "Compliant" },
    { value: "Secure", label: "Encrypted" },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-eternia flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-background" />
            </div>
            <span className="text-xl font-bold font-display">Eternia</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <a href="#security" className="text-muted-foreground hover:text-foreground transition-colors">Security</a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Sign In
              </Button>
            </Link>
            <Link to="/institution-code">
              <Button className="btn-primary">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-eternia-teal/20 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-eternia-lavender/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-in">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Institutional Student Wellbeing Platform</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold font-display mb-6 animate-fade-in-up">
              Your Mental Health,{" "}
              <span className="text-gradient">Completely Anonymous</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Access professional counselling, peer support, and self-help tools through a secure, 
              institution-controlled platform. Your identity stays protected.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <Link to="/institution-code">
                <Button size="lg" className="btn-primary text-lg px-8 py-6 group">
                  Enter Institution Code
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-border hover:bg-muted">
                  I Have an Account
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-3xl mx-auto">
            {stats.map((stat, index) => (
              <div 
                key={stat.label} 
                className="text-center animate-fade-in-up"
                style={{ animationDelay: `${0.6 + index * 0.1}s` }}
              >
                <div className="text-3xl font-bold text-gradient font-display">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">
              Everything You Need for{" "}
              <span className="text-gradient">Mental Wellness</span>
            </h2>
            <p className="section-subtitle mx-auto">
              Five core modules designed to support your emotional wellbeing while maintaining complete anonymity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="card-interactive group animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold font-display mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Self-Help Tools */}
          <div className="mt-12 max-w-5xl mx-auto">
            <div className="card-interactive">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold font-display mb-2">Self-Help Tools</h3>
                  <p className="text-muted-foreground mb-4">
                    Daily micro-wellbeing tools including Quest Cards for reflection prompts, Wreck the Buddy for emotional release, and Tibetan Bowl for guided breathing.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Quest Cards", "Wreck the Buddy", "Tibetan Bowl"].map((tool) => (
                      <span key={tool} className="px-3 py-1 rounded-full bg-muted text-sm text-muted-foreground">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">
              <span className="text-gradient">Secure</span> Three-Step Onboarding
            </h2>
            <p className="section-subtitle mx-auto">
              Our institution-controlled access ensures only verified students can use the platform.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Enter Institution Code",
                description: "Your college or university provides a unique Eternia code that validates your institutional access."
              },
              {
                step: "02",
                title: "Verify with SPOC",
                description: "Scan the QR code from your institution's grievance officer to confirm your enrollment."
              },
              {
                step: "03",
                title: "Create Your Identity",
                description: "Choose a username and password. No email or phone required — your real identity stays protected."
              },
            ].map((item, index) => (
              <div 
                key={item.step}
                className="flex gap-6 mb-8 last:mb-0 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-eternia flex items-center justify-center">
                    <span className="text-2xl font-bold font-display text-background">{item.step}</span>
                  </div>
                </div>
                <div className="pt-2">
                  <h3 className="text-xl font-semibold font-display mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="section-title mb-6">
                  Privacy & Security{" "}
                  <span className="text-gradient">By Design</span>
                </h2>
                <p className="text-muted-foreground mb-8">
                  Eternia is built from the ground up to protect your identity. We follow the strictest 
                  data protection standards including India's DPDP Act 2023.
                </p>
                
                <div className="space-y-4">
                  {[
                    "AES-256 encryption for all personal data",
                    "Device-level binding for accountability",
                    "Institution-controlled data access",
                    "Complete anonymity in peer interactions",
                    "Formal escalation protocols for emergencies",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                      <span className="text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-eternia rounded-3xl blur-3xl opacity-20" />
                <div className="relative glass rounded-3xl p-8">
                  <Shield className="w-16 h-16 text-primary mb-6" />
                  <h3 className="text-2xl font-bold font-display mb-4">Your Data, Your Control</h3>
                  <p className="text-muted-foreground">
                    Personal information is encrypted and stored separately. Only you and designated 
                    institutional authorities (under formal protocols) can access identifying data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center glass rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-eternia-subtle" />
            <div className="relative z-10">
              <h2 className="section-title mb-4">
                Ready to Start Your{" "}
                <span className="text-gradient">Wellness Journey?</span>
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Join thousands of students who have found support through Eternia's 
                secure and anonymous platform.
              </p>
              <Link to="/institution-code">
                <Button size="lg" className="btn-primary text-lg px-10 py-6">
                  Get Started Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-eternia flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-background" />
              </div>
              <span className="font-bold font-display">Eternia</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              © 2024 Eternia. Institutional Student Wellbeing Platform. All rights reserved.
            </p>
            
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
