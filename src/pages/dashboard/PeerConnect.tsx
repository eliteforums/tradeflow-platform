import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  Search,
  Circle,
  Phone,
  Video,
  Send,
  Smile,
  MoreVertical,
  Clock,
  Shield,
  Users,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DashboardLayout from "@/components/layout/DashboardLayout";
import VideoCallModal from "@/components/videosdk/VideoCallModal";
import { useAuth } from "@/contexts/AuthContext";
import { usePeerConnect } from "@/hooks/usePeerConnect";
import { format } from "date-fns";

const PeerConnect = () => {
  const [message, setMessage] = useState("");
  const [callModal, setCallModal] = useState<{ open: boolean; mode: "video" | "audio" }>({
    open: false,
    mode: "audio",
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { user, profile, creditBalance } = useAuth();
  const {
    interns,
    sessions,
    activeSession,
    messages,
    isLoading,
    activeSessionId,
    setActiveSessionId,
    requestSession,
    sendMessage,
    endSession,
    isRequesting,
    isSending,
  } = usePeerConnect();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Set active session if one exists
  useEffect(() => {
    if (activeSession && !activeSessionId) {
      setActiveSessionId(activeSession.id);
    }
  }, [activeSession, activeSessionId, setActiveSessionId]);

  const handleSendMessage = () => {
    if (!message.trim() || !activeSessionId) return;

    sendMessage({ sessionId: activeSessionId, content: message });
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStartSession = (internId: string) => {
    if (creditBalance < 20) {
      return;
    }
    requestSession(internId);
  };

  const handleEndSession = () => {
    if (activeSessionId) {
      endSession(activeSessionId);
    }
  };

  const statusColors: Record<string, string> = {
    online: "bg-eternia-success",
    busy: "bg-eternia-warning",
    offline: "bg-muted-foreground",
  };

  // Mock online status (in production this would come from presence)
  const getInternStatus = (internId: string) => {
    const index = interns.findIndex((i) => i.id === internId);
    if (index % 3 === 0) return "online";
    if (index % 3 === 1) return "busy";
    return "offline";
  };

  const selectedIntern = activeSessionId
    ? interns.find((i) => i.id === activeSession?.intern_id)
    : null;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold font-display mb-2">Peer Connect</h1>
          <p className="text-muted-foreground">
            Connect with trained psychology interns for anonymous support
          </p>
        </div>

        {/* Info Banner */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-eternia-subtle border border-border mb-6">
          <Shield className="w-6 h-6 text-primary shrink-0" />
          <p className="text-sm text-muted-foreground">
            Your identity remains completely anonymous. Interns only see your username during the
            session. Each session costs 20 ECC.
          </p>
        </div>

        {creditBalance < 20 && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 mb-6">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
            <p className="text-sm text-destructive">
              Insufficient credits. You need at least 20 ECC to start a Peer Connect session.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Intern List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search interns..." className="pl-9 bg-card" />
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : interns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No interns available</p>
              </div>
            ) : (
              <div className="space-y-2">
                {interns.map((intern) => {
                  const status = getInternStatus(intern.id);
                  const isSelected = activeSession?.intern_id === intern.id;

                  return (
                    <button
                      key={intern.id}
                      onClick={() => {
                        if (!activeSessionId && status === "online") {
                          handleStartSession(intern.id);
                        }
                      }}
                      className={`w-full p-4 rounded-xl text-left transition-all ${
                        isSelected ? "bg-primary/10 border-primary" : "bg-card hover:bg-muted/50"
                      } border border-border`}
                      disabled={status !== "online" || isRequesting || !!activeSessionId}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                          <Circle
                            className={`absolute -bottom-1 -right-1 w-4 h-4 ${statusColors[status]} rounded-full border-2 border-card`}
                            fill="currentColor"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold truncate">{intern.username}</h3>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                              Certified
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {intern.specialty || "General Support"}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            {status === "online"
                              ? "Available now"
                              : status === "busy"
                              ? "In session"
                              : "Offline"}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl flex flex-col h-[600px]">
            {activeSessionId && selectedIntern ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{selectedIntern.username}</h3>
                      <p className="text-xs text-muted-foreground">
                        {selectedIntern.specialty || "General Support"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCallModal({ open: true, mode: "audio" })}
                    >
                      <Phone className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCallModal({ open: true, mode: "video" })}
                    >
                      <Video className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={handleEndSession}>
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Session started! Say hello to begin the conversation.</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.sender_id === user?.id ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-2xl ${
                            msg.sender_id === user?.id
                              ? "bg-primary text-primary-foreground rounded-br-none"
                              : "bg-muted rounded-bl-none"
                          }`}
                        >
                          <p className="text-sm">{msg.content_encrypted}</p>
                          <p
                            className={`text-xs mt-1 ${
                              msg.sender_id === user?.id
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            }`}
                          >
                            {format(new Date(msg.created_at), "h:mm a")}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="flex-1 bg-muted/50"
                    />
                    <Button variant="ghost" size="icon">
                      <Smile className="w-5 h-5" />
                    </Button>
                    <Button
                      size="icon"
                      className="bg-primary text-primary-foreground"
                      onClick={handleSendMessage}
                      disabled={!message.trim() || isSending}
                    >
                      {isSending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mb-4">
                  <MessageCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold font-display mb-2">Start a Conversation</h3>
                <p className="text-muted-foreground max-w-sm">
                  Select an available intern from the list to begin your anonymous support session.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video/Audio Call Modal */}
      <VideoCallModal
        isOpen={callModal.open}
        onClose={() => setCallModal({ open: false, mode: "audio" })}
        participantName={profile?.username || "Student"}
        mode={callModal.mode}
      />
    </DashboardLayout>
  );
};

export default PeerConnect;
