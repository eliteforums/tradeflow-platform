import { supabase } from "@/integrations/supabase/client";

export const getVideoSDKToken = async (): Promise<string> => {
  const { data, error } = await supabase.functions.invoke("videosdk-token", {
    body: { action: "get-token" },
  });

  if (error) throw new Error(error.message || "Failed to get VideoSDK token");
  return data.token;
};

export const createVideoSDKRoom = async (): Promise<{
  token: string;
  roomId: string;
}> => {
  const { data, error } = await supabase.functions.invoke("videosdk-token", {
    body: { action: "create-room" },
  });

  if (error) throw new Error(error.message || "Failed to create room");
  return { token: data.token, roomId: data.roomId };
};
