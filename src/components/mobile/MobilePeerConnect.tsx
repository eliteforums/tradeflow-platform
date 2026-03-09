import { useState, useRef, useEffect } from "react";
import { MessageCircle, Search, Circle, Phone, Video, Send, X, Clock, Shield, Users, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DashboardLayout from "@/components/layout/DashboardLayout";
import VideoCallModal from "@/components/videosdk/VideoCallModal";
import { useAuth } from "@/contexts/AuthContext";
import { usePeerConnect } from "@/hooks/usePeerConnect";
import { format } from "date-fns";

const MobilePeerConnect = () => {
  const [message, setMessage] = useState("");
  const [callModal, setCallModal] = useState<{ open: boolean; mode: "video" | "audio" }>({ open: false, mode: "audio" });
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { user, profile, creditBalance } = useAuth();
  const { interns, sessions, activeSession, messages: chatMessages, isLoading, activeSessionId, setActiveSessionId, requestSession, sendMessage, endSession, isRequesting, isSending } = usePeerConnect();

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);
  useEffect(() => { if (activeSession && !activeSessionId) { setActiveSessionId(activeSession.id); setMobileView("chat"); } }, [activeSession, activeSessionId, setActiveSessionId]);

  const handleSendMessage = () => { if (!message.trim() || !activeSessionId) return; sendMessage({ sessionId: activeSessionId, content: message }); setMessage(""); };
  const handleStartSession = (internId: string) => { if (creditBalance < 20) return; requestSession(internId); setMobileView("chat"); };

  const statusColors: Record<string, string> = { online: "bg-eternia-success", busy: "bg-eternia-warning", offline: "bg-muted-foreground" };
  const getInternStatus = (internId: string) => { const i = interns.findIndex((x) => x.id === internId); return i % 3 === 0 ? "online" : i % 3 === 1 ? "busy" : "offline"; };
  const selectedIntern = activeSessionId ? interns.find((i) => i.id === activeSession?.intern_id) : null;

  return (
    <DashboardLayout>
      <div className="pb-24">
        {mobileView === "list" ? (
          <div className="space-y-3">
            <div>
              <h1 className="text-lg font-bold font-display">Peer Connect</h1>
              <p className="text-[11px] text-muted-foreground">Anonymous support from trained interns</p>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gradient-eternia-subtle border border-border">
              <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
              <p className="text-[9px] text-muted-foreground">Your identity remains anonymous. 20 ECC/session.</p>
            </div>

            {creditBalance < 20 && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-destructive/10 border border-destructive/20">
                <AlertCircle className="w-3.5 h-3.5 text-destructive shrink-0" />
                <p className="text-[9px] text-destructive">Need at least 20 ECC.</p>
              </div>
            )}

            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input placeholder="Search interns..." className="pl-8 bg-card h-8 text-xs" />
            </div>

            {isLoading ? <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              : interns.length === 0 ? <div className="text-center py-8 text-muted-foreground"><Users className="w-8 h-8 mx-auto mb-2 opacity-50" /><p className="text-xs">No interns available</p></div>
              : (
                <div className="space-y-1.5">
                  {interns.map((intern) => {
                    const status = getInternStatus(intern.id);
                    return (
                      <button key={intern.id} onClick={() => { if (!activeSessionId && status === "online") handleStartSession(intern.id); }}
                        className={`w-full p-2.5 rounded-xl text-left border ${activeSession?.intern_id === intern.id ? "bg-primary/10 border-primary" : "bg-card border-border"}`}
                        disabled={status !== "online" || isRequesting || !!activeSessionId}>
                        <div className="flex items-center gap-2.5">
                          <div className="relative shrink-0">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center"><Users className="w-4 h-4 text-white" /></div>
                            <Circle className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${statusColors[status]} rounded-full border-2 border-card`} fill="currentColor" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <h3 className="font-semibold text-xs truncate">{intern.username}</h3>
                              <span className="text-[8px] px-1 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">Certified</span>
                            </div>
                            <p className="text-[9px] text-muted-foreground">{status === "online" ? "Available now" : status === "busy" ? "In session" : "Offline"}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
          </div>
        ) : (
          <div className="flex flex-col h-[calc(100dvh-8rem)]">
            {activeSessionId && selectedIntern ? (
              <>
                <div className="p-2.5 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMobileView("list")}><ArrowLeft className="w-4 h-4" /></Button>
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center"><Users className="w-3.5 h-3.5 text-white" /></div>
                    <div><h3 className="font-semibold text-xs">{selectedIntern.username}</h3><p className="text-[9px] text-muted-foreground">{selectedIntern.specialty || "General"}</p></div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCallModal({ open: true, mode: "audio" })}><Phone className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCallModal({ open: true, mode: "video" })}><Video className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { endSession(activeSessionId); setMobileView("list"); }}><X className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {chatMessages.length === 0 ? <p className="text-center py-8 text-muted-foreground text-xs">Say hello!</p>
                    : chatMessages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] p-2 rounded-xl ${msg.sender_id === user?.id ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none"}`}>
                          <p className="text-xs">{msg.content_encrypted}</p>
                          <p className={`text-[8px] mt-0.5 ${msg.sender_id === user?.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{format(new Date(msg.created_at), "h:mm a")}</p>
                        </div>
                      </div>
                    ))}
                  <div ref={messagesEndRef} />
                </div>
                <div className="p-2.5 border-t border-border">
                  <div className="flex items-center gap-1.5">
                    <Input placeholder="Type a message..." value={message} onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} className="flex-1 bg-muted/50 h-9 text-xs" />
                    <Button size="icon" className="bg-primary text-primary-foreground h-9 w-9" onClick={handleSendMessage} disabled={!message.trim() || isSending}>
                      {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mb-3">
                  <MessageCircle className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-sm font-semibold font-display mb-1">Start a Conversation</h3>
                <p className="text-[10px] text-muted-foreground">Select an intern to begin.</p>
                <Button variant="outline" size="sm" className="mt-3 h-8 text-xs" onClick={() => setMobileView("list")}>Back to list</Button>
              </div>
            )}
          </div>
        )}
      </div>
      <VideoCallModal isOpen={callModal.open} onClose={() => setCallModal({ open: false, mode: "audio" })} participantName={profile?.username || "Student"} mode={callModal.mode} />
    </DashboardLayout>
  );
};

export default MobilePeerConnect;
