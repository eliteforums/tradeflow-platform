import { supabase } from "@/integrations/supabase/client";
import { FunctionsHttpError } from "@supabase/supabase-js";

async function invokeVideoSDK(action: string): Promise<Record<string, any>> {
  // Pre-check session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("Session expired. Please sign in again.");
  }

  // Let supabase client handle auth naturally - do NOT pass manual Authorization header
  const { data, error } = await supabase.functions.invoke("videosdk-token", {
    body: { action },
  });

  if (error) {
    if (error instanceof FunctionsHttpError) {
      try {
        const errBody = await error.context.json();
        throw new Error(errBody.details || errBody.error || "Unknown server error");
      } catch (parseErr) {
        if (parseErr instanceof Error && parseErr.message !== "Unknown server error") {
          throw parseErr;
        }
      }
    }
    throw new Error(error.message || "Failed to reach video service");
  }

  return data;
}

export const getVideoSDKToken = async (): Promise<string> => {
  const data = await invokeVideoSDK("get-token");
  return data.token;
};

export const createVideoSDKRoom = async (): Promise<{ token: string; roomId: string }> => {
  const data = await invokeVideoSDK("create-room");
  return { token: data.token, roomId: data.roomId };
};
