import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { generateDeviceFingerprint } from "@/lib/deviceFingerprint";
import { useAuth } from "@/contexts/AuthContext";

// Session-level cache to avoid re-checking on every navigation
let cachedResult: { userId: string; mismatch: boolean } | null = null;

export function useDeviceValidation() {
  const { user, profile } = useAuth();
  const [deviceMismatch, setDeviceMismatch] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (!user || !profile || profile.role !== "student") return;

    // Use cached result if same user already validated this session
    if (cachedResult && cachedResult.userId === user.id) {
      setDeviceMismatch(cachedResult.mismatch);
      return;
    }

    const checkDevice = async () => {
      setIsChecking(true);
      try {
        const currentFingerprint = await generateDeviceFingerprint();

        const { data } = await supabase
          .from("user_private")
          .select("device_id_encrypted")
          .eq("user_id", user.id)
          .maybeSingle();

        const mismatch = !!(data?.device_id_encrypted && data.device_id_encrypted !== currentFingerprint);
        cachedResult = { userId: user.id, mismatch };
        setDeviceMismatch(mismatch);
      } catch {
        cachedResult = { userId: user.id, mismatch: false };
        setDeviceMismatch(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkDevice();
  }, [user, profile]);

  return { deviceMismatch, isChecking };
}
