import { useMeeting } from "@videosdk.live/react-sdk";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MonitorUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const MeetingControls = () => {
  const { leave, toggleMic, toggleWebcam, localMicOn, localWebcamOn } =
    useMeeting();

  return (
    <div className="flex items-center justify-center gap-3 p-4 bg-card border-t border-border">
      <Button
        variant={localMicOn ? "outline" : "destructive"}
        size="icon"
        className="rounded-full w-12 h-12"
        onClick={() => toggleMic()}
      >
        {localMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
      </Button>

      <Button
        variant={localWebcamOn ? "outline" : "destructive"}
        size="icon"
        className="rounded-full w-12 h-12"
        onClick={() => toggleWebcam()}
      >
        {localWebcamOn ? (
          <Video className="w-5 h-5" />
        ) : (
          <VideoOff className="w-5 h-5" />
        )}
      </Button>

      <Button
        variant="destructive"
        size="icon"
        className="rounded-full w-14 h-14"
        onClick={() => leave()}
      >
        <PhoneOff className="w-6 h-6" />
      </Button>
    </div>
  );
};

export default MeetingControls;
