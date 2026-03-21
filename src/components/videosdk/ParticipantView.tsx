import { useEffect, useRef } from "react";
import { useParticipant, VideoPlayer } from "@videosdk.live/react-sdk";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";

interface ParticipantViewProps {
  participantId: string;
  audioOnly?: boolean;
}

const ParticipantView = ({ participantId, audioOnly = false }: ParticipantViewProps) => {
  const micRef = useRef<HTMLAudioElement>(null);
  const { micStream, webcamOn, micOn, isLocal, displayName } =
    useParticipant(participantId);

  useEffect(() => {
    if (micRef.current) {
      if (micOn && micStream) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(micStream.track);
        micRef.current.srcObject = mediaStream;
        micRef.current
          .play()
          .catch((error) => console.error("Audio play failed", error));
      } else {
        micRef.current.srcObject = null;
      }
    }
  }, [micStream, micOn]);

  const showVideo = !audioOnly && webcamOn;

  return (
    <div className="relative rounded-2xl overflow-hidden bg-muted border border-border">
      {showVideo ? (
        <VideoPlayer
          participantId={participantId}
          type="video"
          containerStyle={{
            height: "100%",
            width: "100%",
            aspectRatio: "16/9",
          }}
          className="h-full w-full"
          classNameVideo="h-full w-full object-cover"
          videoStyle={{}}
        />
      ) : (
        <div className="aspect-video flex items-center justify-center bg-muted">
          <div className="w-20 h-20 rounded-full bg-gradient-eternia flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-foreground font-display">
              {(displayName || "U").charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      )}

      {/* Overlay info */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-background/80 to-transparent">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            {displayName || "Participant"} {isLocal && "(You)"}
          </span>
          <div className="flex items-center gap-1.5">
            {micOn ? (
              <Mic className="w-4 h-4 text-primary" />
            ) : (
              <MicOff className="w-4 h-4 text-destructive" />
            )}
            {!audioOnly && (
              webcamOn ? (
                <Video className="w-4 h-4 text-primary" />
              ) : (
                <VideoOff className="w-4 h-4 text-destructive" />
              )
            )}
          </div>
        </div>
      </div>

      <audio ref={micRef} autoPlay playsInline muted={isLocal} />
    </div>
  );
};

export default ParticipantView;
