import { useState } from "react";
import { useMeeting } from "@videosdk.live/react-sdk";
import { Loader2 } from "lucide-react";
import ParticipantView from "./ParticipantView";
import MeetingControls from "./MeetingControls";

interface MeetingViewProps {
  meetingId: string;
  onMeetingLeave: () => void;
  audioOnly?: boolean;
}

const MeetingView = ({ meetingId, onMeetingLeave, audioOnly = false }: MeetingViewProps) => {
  const [joined, setJoined] = useState<string | null>(null);

  const { join, participants } = useMeeting({
    onMeetingJoined: () => setJoined("JOINED"),
    onMeetingLeft: () => onMeetingLeave(),
  });

  const joinMeeting = () => {
    setJoined("JOINING");
    join();
  };

  if (joined === "JOINING") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Joining the session...</p>
      </div>
    );
  }

  if (joined !== "JOINED") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">Session ID</p>
          <p className="text-lg font-mono text-foreground">{meetingId}</p>
        </div>
        <button
          onClick={joinMeeting}
          className="btn-primary text-lg px-10 py-4 rounded-xl"
        >
          Join Session
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 overflow-y-auto">
        <div
          className={`grid gap-4 h-full ${
            participants.size <= 1
              ? "grid-cols-1"
              : participants.size <= 4
              ? "grid-cols-2"
              : "grid-cols-3"
          }`}
        >
          {[...participants.keys()].map((participantId) => (
            <ParticipantView
              key={participantId}
              participantId={participantId}
              audioOnly={audioOnly}
            />
          ))}
        </div>
      </div>
      <MeetingControls audioOnly={audioOnly} />
    </div>
  );
};

export default MeetingView;
