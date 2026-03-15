import { supabase } from "@/integrations/supabase/client";
import { FunctionsHttpError } from "@supabase/supabase-js";

async function invokeVideoSDK(action: string): Promise<Record<string, any>> {
  // Get current session explicitly
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;

  if (!accessToken) {
    throw new Error("You must be logged in to start a call. Please sign in and try again.");
  }

  const { data, error } = await supabase.functions.invoke("videosdk-token", {
    body: { action },
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (error) {
    // Try to extract detailed error from the response
    if (error instanceof FunctionsHttpError) {
      try {
        const errBody = await error.context.json();
        const detail = errBody.details || errBody.error || "Unknown server error";
        throw new Error(detail);
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

export const createVideoSDKRoom = async (): Promise<{
  token: string;
  roomId: string;
}> => {
  const data = await invokeVideoSDK("create-room");
  return { token: data.token, roomId: data.roomId };
};
