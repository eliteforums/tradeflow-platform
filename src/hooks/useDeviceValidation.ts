import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { generateDeviceFingerprint } from "@/lib/deviceFingerprint";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Validates the current device fingerprint against stored value.
 * Returns deviceMismatch = true if fingerprint doesn't match stored one.
 */
export function useDeviceValidation() {
  const { user, profile } = useAuth();
  const [deviceMismatch, setDeviceMismatch] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (!user || !profile || profile.role !== "student") return;

    const checkDevice = async () => {
      setIsChecking(true);
      try {
        const currentFingerprint = await generateDeviceFingerprint();

        const { data } = await supabase
          .from("user_private")
          .select("device_id_encrypted")
          .eq("user_id", user.id)
          .maybeSingle();

        if (data?.device_id_encrypted && data.device_id_encrypted !== currentFingerprint) {
          setDeviceMismatch(true);
        } else {
          setDeviceMismatch(false);
        }
      } catch {
        // Don't block on error
        setDeviceMismatch(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkDevice();
  }, [user, profile]);

  return { deviceMismatch, isChecking };
}
