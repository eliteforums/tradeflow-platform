import { useState } from "react";
import {
  MessageCircle,
  Search,
  Circle,
  Phone,
  Video,
  Send,
  Smile,
  Paperclip,
  MoreVertical,
  Clock,
  Shield,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DashboardLayout from "@/components/layout/DashboardLayout";
import VideoCallModal from "@/components/videosdk/VideoCallModal";
import { useAuth } from "@/contexts/AuthContext";

const PeerConnect = () => {
  const [selectedIntern, setSelectedIntern] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [callModal, setCallModal] = useState<{
    open: boolean;
    mode: "video" | "audio";
  }>({ open: false, mode: "audio" });
  const { profile } = useAuth();

  const interns = [
    {
      id: 1,
      name: "Intern A",
      status: "online",
      specialty: "Anxiety & Stress",
      badge: "Certified",
      waitTime: "~2 min",
    },
    {
      id: 2,
      name: "Intern B",
      status: "online",
      specialty: "Academic Pressure",
      badge: "Certified",
      waitTime: "~5 min",
    },
    {
      id: 3,
      name: "Intern C",
      status: "busy",
      specialty: "Relationships",
      badge: "Senior",
      waitTime: "~15 min",
    },
    {
      id: 4,
      name: "Intern D",
      status: "offline",
      specialty: "Depression",
      badge: "Certified",
      waitTime: "Unavailable",
    },
  ];

  const messages = [
    {
      id: 1,
      sender: "intern",
      text: "Hello! Welcome to Peer Connect. I'm here to listen and support you. How are you feeling today?",
      time: "2:30 PM",
    },
    {
      id: 2,
      sender: "user",
      text: "Hi, I've been feeling really overwhelmed with my exams coming up.",
      time: "2:31 PM",
    },
    {
      id: 3,
      sender: "intern",
      text: "I understand. Exam stress is very common, and it's completely normal to feel this way. Let's talk about what's been weighing on you the most.",
      time: "2:32 PM",
    },
  ];

  const statusColors = {
    online: "bg-eternia-success",
    busy: "bg-eternia-warning",
    offline: "bg-muted-foreground",
  };

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
            Your identity remains completely anonymous. Interns only see your username during the session.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Intern List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search interns..." className="pl-9 bg-card" />
            </div>

            <div className="space-y-2">
              {interns.map((intern) => (
                <button
                  key={intern.id}
                  onClick={() => setSelectedIntern(intern.id)}
                  className={`w-full p-4 rounded-xl text-left transition-all ${
                    selectedIntern === intern.id
                      ? "bg-primary/10 border-primary"
                      : "bg-card hover:bg-muted/50"
                  } border border-border`}
                  disabled={intern.status === "offline"}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <Circle
                        className={`absolute -bottom-1 -right-1 w-4 h-4 ${
                          statusColors[intern.status as keyof typeof statusColors]
                        } rounded-full border-2 border-card`}
                        fill="currentColor"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold truncate">{intern.name}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {intern.badge}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {intern.specialty}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        Wait: {intern.waitTime}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl flex flex-col h-[600px]">
            {selectedIntern ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {interns.find((i) => i.id === selectedIntern)?.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {interns.find((i) => i.id === selectedIntern)?.specialty}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setCallModal({ open: true, mode: "audio" })
                      }
                    >
                      <Phone className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setCallModal({ open: true, mode: "video" })
                      }
                    >
                      <Video className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-2xl ${
                          msg.sender === "user"
                            ? "bg-primary text-primary-foreground rounded-br-none"
                            : "bg-muted rounded-bl-none"
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <p
                          className={`text-xs mt-1 ${
                            msg.sender === "user"
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Paperclip className="w-5 h-5" />
                    </Button>
                    <Input
                      placeholder="Type your message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="flex-1 bg-muted/50"
                    />
                    <Button variant="ghost" size="icon">
                      <Smile className="w-5 h-5" />
                    </Button>
                    <Button size="icon" className="bg-primary text-primary-foreground">
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mb-4">
                  <MessageCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold font-display mb-2">
                  Start a Conversation
                </h3>
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
