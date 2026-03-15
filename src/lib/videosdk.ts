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
  /session|jwt|token|unauthorized|auth|expired/i.test(message);

const parseInvokeError = async (error: unknown): Promise<ParsedFunctionError> => {
  if (error instanceof FunctionsHttpError) {
    const status = error.context?.status;
    let details = "Video service request failed";
    let code: string | undefined;

    try {
      const raw = await error.context.text();
      const json = JSON.parse(raw) as { error?: string; details?: string; message?: string };
      details = json.details || json.message || json.error || details;
      code = json.error;
    } catch {
      if (error.message) details = error.message;
    }

    return {
      message: details,
      status,
      code,
      retryableAuth: status === 401 || code === "SESSION_INVALID" || isAuthErrorMessage(details),
    };
  }

  const message = error instanceof Error ? error.message : String(error);
  return {
    message: message || "Video service request failed",
    retryableAuth: isAuthErrorMessage(message),
  };
};

const invokeRaw = async (action: VideoSDKAction, accessToken: string): Promise<Record<string, any>> => {
  const { data, error } = await supabase.functions.invoke("videosdk-token", {
    body: { action, accessToken },
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (error) throw error;
  if (!data) throw new Error("Empty response from video service");

  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      throw new Error("Invalid response from video service");
    }
  }

  return data as Record<string, any>;
};

const requireAccessToken = async (): Promise<string> => {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw new Error("Session expired. Please sign in again.");
  if (session?.access_token) return session.access_token;

  const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
  if (refreshError || !refreshedSession?.access_token) {
    throw new Error("Session expired. Please sign in again.");
  }

  return refreshedSession.access_token;
};

async function invokeVideoSDK(action: VideoSDKAction): Promise<Record<string, any>> {
  let accessToken = await requireAccessToken();

  try {
    return await invokeRaw(action, accessToken);
  } catch (err) {
    const parsed = await parseInvokeError(err);

    if (parsed.retryableAuth) {
      const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
      if (!refreshError && session?.access_token) {
        accessToken = session.access_token;
        try {
          return await invokeRaw(action, accessToken);
        } catch (retryErr) {
          const retryParsed = await parseInvokeError(retryErr);
          throw new Error(retryParsed.message);
        }
      }
      throw new Error("Session expired. Please sign in again.");
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
