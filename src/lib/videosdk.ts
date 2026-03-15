import { supabase } from "@/integrations/supabase/client";
import { FunctionsHttpError } from "@supabase/supabase-js";

type VideoSDKAction = "get-token" | "create-room";

interface ParsedFunctionError {
  message: string;
  status?: number;
  code?: string;
  retryableAuth: boolean;
}

const isAuthErrorMessage = (message: string) =>
  /session|jwt|token|unauthorized|auth/i.test(message);

const parseInvokeError = async (error: unknown): Promise<ParsedFunctionError> => {
  if (error instanceof FunctionsHttpError) {
    const status = error.context.status;
    const raw = await error.context.text();

    let details = "Video service request failed";
    let code: string | undefined;

    try {
      const json = JSON.parse(raw) as { error?: string; details?: string; message?: string };
      details = json.details || json.message || json.error || details;
      code = json.error;
    } catch {
      if (raw?.trim()) details = raw;
    }

    return {
      message: details,
      status,
      code,
      retryableAuth: status === 401 || code === "SESSION_INVALID" || isAuthErrorMessage(details),
    };
  }

  const message = error instanceof Error ? error.message : "Video service request failed";
  return {
    message,
    retryableAuth: isAuthErrorMessage(message),
  };
};

const invokeRaw = async (action: VideoSDKAction): Promise<Record<string, any>> => {
  console.log("[VideoSDK] Invoking edge function with action:", action);
  const { data, error } = await supabase.functions.invoke("videosdk-token", {
    body: { action },
  });

  console.log("[VideoSDK] Response - data:", data, "error:", error);
  
  if (error) {
    console.error("[VideoSDK] Edge function error:", error, "type:", typeof error, "constructor:", error?.constructor?.name);
    throw error;
  }
  
  if (!data) {
    throw new Error("Empty response from video service");
  }
  
  // Handle case where data might be returned as a string
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      throw new Error("Invalid response from video service");
    }
  }
  
  return data as Record<string, any>;
};

async function invokeVideoSDK(action: VideoSDKAction): Promise<Record<string, any>> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("Session expired. Please sign in again.");
  }

  try {
    return await invokeRaw(action);
  } catch (err) {
    const parsed = await parseInvokeError(err);

    if (parsed.retryableAuth) {
      const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
      if (!refreshError && session?.access_token) {
        try {
          return await invokeRaw(action);
        } catch (retryErr) {
          const retryParsed = await parseInvokeError(retryErr);
          throw new Error(retryParsed.message);
        }
      }
    }

    throw new Error(parsed.message);
  }
}

export const getVideoSDKToken = async (): Promise<string> => {
  const data = await invokeVideoSDK("get-token");
  return data.token;
};

export const createVideoSDKRoom = async (): Promise<{ token: string; roomId: string }> => {
  const data = await invokeVideoSDK("create-room");
  return { token: data.token, roomId: data.roomId };
};
