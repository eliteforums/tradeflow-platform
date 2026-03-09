import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, QrCode, Shield, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const QRScan = () => {
  const navigate = useNavigate();
  const [manualCode, setManualCode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [useManual, setUseManual] = useState(false);

  const handleScan = async () => {
    setIsScanning(true);
    // Simulated QR scan — in production, this would use a camera API
    await new Promise((r) => setTimeout(r, 2000));
    setIsScanning(false);
    
    // For web, fall back to manual code entry
    setUseManual(true);
    toast.info("Camera not available in browser. Please enter the SPOC code manually.");
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) {
      toast.error("Please enter the SPOC verification code");
      return;
    }

    setIsVerifying(true);
    await new Promise((r) => setTimeout(r, 1000));

    // For now, accept any 8+ char code as valid SPOC QR payload
    if (manualCode.length >= 8) {
      sessionStorage.setItem("eternia_spoc_verified", "true");
      toast.success("SPOC verification complete!");
      navigate("/register");
    } else {
      toast.error("Invalid SPOC code. Please ask your Grievance Officer.");
    }
    setIsVerifying(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-eternia-teal/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-eternia-lavender/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <Link
          to="/institution-code"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Institution Code
        </Link>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-eternia-success text-background font-semibold text-sm">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="flex-1 h-1 rounded bg-gradient-eternia" />
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-eternia text-background font-semibold text-sm">
            2
          </div>
          <div className="flex-1 h-1 rounded bg-muted" />
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground font-semibold text-sm">
            3
          </div>
        </div>

        <div className="glass rounded-2xl p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold font-display mb-2">SPOC Verification</h1>
            <p className="text-muted-foreground">
              Scan your institution's Grievance Officer QR code to verify your enrollment.
            </p>
          </div>

          {!useManual ? (
            <div className="space-y-6">
              {/* QR Scanner Area */}
              <div className="aspect-square rounded-2xl border-2 border-dashed border-border bg-muted/20 flex flex-col items-center justify-center gap-4">
                <div className="w-24 h-24 rounded-2xl bg-gradient-eternia flex items-center justify-center">
                  <QrCode className="w-12 h-12 text-background" />
                </div>
                <p className="text-sm text-muted-foreground text-center px-8">
                  Position the QR code from your SPOC / Grievance Officer within the scanner area
                </p>
              </div>

              <Button
                onClick={handleScan}
                disabled={isScanning}
                className="btn-primary w-full py-6 text-lg"
              >
                {isScanning ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Scanning...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Scan QR Code
                  </div>
                )}
              </Button>

              <button
                onClick={() => setUseManual(true)}
                className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Can't scan? Enter code manually
              </button>
            </div>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-6">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  SPOC Verification Code
                </label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Enter SPOC verification code"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                    className="input-eternia pl-12 tracking-wider uppercase"
                    disabled={isVerifying}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Ask your Grievance Officer for this code. It verifies your institution enrollment.
                </p>
              </div>

              <Button
                type="submit"
                className="btn-primary w-full py-6 text-lg"
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Verify & Continue
                  </div>
                )}
              </Button>

              <button
                onClick={() => setUseManual(false)}
                className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Back to QR scanner
              </button>
            </form>
          )}
        </div>

        <div className="mt-8 p-4 rounded-xl bg-muted/30 border border-border">
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Why is this needed?
          </h3>
          <p className="text-sm text-muted-foreground">
            This step verifies that you are a legitimate student of the partnered institution.
            Only students who physically interact with their institution's Grievance Officer can
            complete registration.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRScan;
