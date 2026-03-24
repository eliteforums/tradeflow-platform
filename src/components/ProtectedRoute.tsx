import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("student" | "intern" | "expert" | "spoc" | "admin" | "therapist")[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, isLoading } = useAuth();
  const location = useLocation();
  const { deviceMismatch, isChecking: isCheckingDevice } = useDeviceValidation();

  // Check if user has completed recovery setup (only for students)
  const { data: hasRecoverySetup, isLoading: isCheckingRecovery } = useQuery({
    queryKey: ["recovery-check", user?.id],
    queryFn: async () => {
      if (!user) return true;
      const { data, error } = await supabase
        .from("recovery_credentials")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) return true; // Don't block on error
      return !!data;
    },
    enabled: !!user && profile?.role === "student",
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 15,
  });

  if (isLoading || (profile?.role === "student" && isCheckingRecovery)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-eternia flex items-center justify-center animate-pulse">
            <Sparkles className="w-8 h-8 text-background" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Device mismatch warning for students
  if (profile?.role === "student" && deviceMismatch) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-xl font-bold font-display">Unrecognized Device</h2>
          <p className="text-sm text-muted-foreground">
            This device doesn't match the one registered to your account. 
            Please contact your institution's SPOC to reset your device binding.
          </p>
        </div>
      </div>
    );
  }

  // Redirect students to recovery setup if not completed
  if (
    profile?.role === "student" &&
    hasRecoverySetup === false &&
    location.pathname !== "/dashboard/recovery-setup"
  ) {
    return <Navigate to="/dashboard/recovery-setup" replace />;
  }

  return <>{children}</>;
}