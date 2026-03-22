import { useIsMobile } from "@/hooks/use-mobile";
import MobilePeerConnect from "@/components/mobile/MobilePeerConnect";
import { useState, useRef, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import { MessageCircle, Search, Circle, Phone, Send, X, Clock, Shield, Users, Loader2, AlertCircle, Flag, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DashboardLayout from "@/components/layout/DashboardLayout";
const LazyVideoCallModal = lazy(() => import("@/components/videosdk/VideoCallModal"));
import { useAuth } from "@/contexts/AuthContext";
import { usePeerConnect } from "@/hooks/usePeerConnect";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { format } from "date-fns";

const PeerConnect = () => {
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const urlSessionId = searchParams.get("sessionId");
  const { user, profile, creditBalance } = useAuth();
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [callModal, setCallModal] = useState<{ open: boolean; mode: "video" | "audio" }>({ open: false, mode: "audio" });
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    interns, sessions, activeSession, messages: chatMessages, isLoading,
    activeSessionId, setActiveSessionId, requestSession, sendMessage, endSession,
    flagSession, isRequesting, isSending, isFlagging, internStatuses,
    hasMoreMessages, isLoadingMore, loadMoreMessages,
  } = usePeerConnect(urlSessionId);

  const debouncedSearch = useDebouncedValue(searchTerm, 300);

  const filteredInterns = useMemo(() => {
    if (!debouncedSearch) return interns;
    const q = debouncedSearch.toLowerCase();
    return interns.filter(
      (i) => i.username.toLowerCase().includes(q) || (i.specialty || "").toLowerCase().includes(q)
    );
  }, [interns, debouncedSearch]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);
  useEffect(() => { if (activeSession && !activeSessionId) { setActiveSessionId(activeSession.id); setMobileView("chat"); } }, [activeSession, activeSessionId, setActiveSessionId]);

  const isIntern = profile?.role === "intern";
  const trainingStatus = (profile as any)?.training_status || "not_started";
  const isTrainingComplete = trainingStatus === "active" || trainingStatus === "completed";

  if (isIntern && !isTrainingComplete) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
          <div className="w-16 h-16 rounded-2xl bg-eternia-warning/10 flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-eternia-warning" />
          </div>
          <h2 className="text-xl font-bold font-display mb-2">Training Required</h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            Complete all 7 training modules before you can access Peer Connect sessions. Head to your Intern Dashboard to continue training.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const handleSendMessage = useCallback(() => {
    if (!message.trim() || !activeSessionId) return;
    sendMessage({ sessionId: activeSessionId, content: message });
    setMessage("");
  }, [message, activeSessionId, sendMessage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  }, [handleSendMessage]);

  const handleStartSession = useCallback((internId: string) => {
    if (creditBalance < 20) return;
    requestSession(internId);
    setMobileView("chat");
  }, [creditBalance, requestSession]);

  const handleEndSession = useCallback(() => {
    if (activeSessionId) { endSession(activeSessionId); setMobileView("list"); }
  }, [activeSessionId, endSession]);

  const statusColors: Record<string, string> = { online: "bg-eternia-success", busy: "bg-eternia-warning", offline: "bg-muted-foreground" };
  const selectedIntern = activeSessionId ? interns.find((i) => i.id === activeSession?.intern_id) : null;

  if (isMobile) return <MobilePeerConnect />;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6"><h1 className="text-3xl font-bold font-display mb-1">Peer Connect</h1><p className="text-sm text-muted-foreground">Connect with trained psychology interns anonymously</p></div>
        <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-eternia-subtle border border-border mb-6"><Shield className="w-5 h-5 text-primary shrink-0" /><p className="text-sm text-muted-foreground">Your identity remains anonymous. Each session costs 20 ECC.</p></div>
        {creditBalance < 20 && <div className="flex items-center gap-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20 mb-6"><AlertCircle className="w-5 h-5 text-destructive shrink-0" /><p className="text-sm text-destructive">Insufficient credits. You need at least 20 ECC.</p></div>}

        <div className="grid grid-cols-3 gap-6">
          {/* Intern List */}
          <div className="col-span-1">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search interns..." className="pl-9 bg-card h-9 text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              {isLoading ? <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                : filteredInterns.length === 0 ? <div className="text-center py-8 text-muted-foreground"><Users className="w-8 h-8 mx-auto mb-2 opacity-50" /><p className="text-sm">{searchTerm ? "No matching interns" : "No interns available"}</p></div>
                : <div className="space-y-2">{filteredInterns.map((intern) => {
                  const status = internStatuses[intern.id] || "offline";
                  return (
                    <button key={intern.id} onClick={() => { if (!activeSessionId && status === "online") handleStartSession(intern.id); }}
                      className={`w-full p-4 rounded-xl text-left transition-all ${activeSession?.intern_id === intern.id ? "bg-primary/10 border-primary" : "bg-card hover:bg-muted/50"} border border-border`} disabled={status !== "online" || isRequesting || !!activeSessionId}>
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0"><div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center"><Users className="w-5 h-5 text-white" /></div><Circle className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 ${statusColors[status]} rounded-full border-2 border-card`} fill="currentColor" /></div>
                        <div className="flex-1 min-w-0"><div className="flex items-center justify-between mb-0.5"><h3 className="font-semibold text-sm truncate">{intern.username}</h3><span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary shrink-0 ml-2">Certified</span></div><p className="text-xs text-muted-foreground truncate">{intern.specialty || "General Support"}</p><p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" />{status === "online" ? "Available now" : status === "busy" ? "In session" : "Offline"}</p></div>
                      </div>
                    </button>
                  );
                })}</div>}
            </div>
          </div>

          {/* Chat Area */}
          <div className="col-span-2">
            <div className="bg-card border border-border rounded-2xl flex flex-col h-[600px]">
              {activeSessionId && selectedIntern ? (
                <>
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center"><Users className="w-5 h-5 text-white" /></div><div><h3 className="font-semibold text-sm">{selectedIntern.username}</h3><p className="text-[11px] text-muted-foreground">{selectedIntern.specialty || "General Support"}</p></div></div>
                    <div className="flex items-center gap-1">
                      {isIntern && activeSessionId && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-eternia-warning" title="Flag session for review" disabled={isFlagging || activeSession?.is_flagged}
                          onClick={() => flagSession({ sessionId: activeSessionId, reason: "Intern flagged during session" })}>
                          <Flag className={`w-4 h-4 ${activeSession?.is_flagged ? "fill-current" : ""}`} />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCallModal({ open: true, mode: "audio" })}><Phone className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={handleEndSession}><X className="w-4 h-4" /></Button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {hasMoreMessages && (
                      <div className="text-center">
                        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={loadMoreMessages} disabled={isLoadingMore}>
                          {isLoadingMore ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <ChevronUp className="w-3 h-3 mr-1" />}
                          Load earlier messages
                        </Button>
                      </div>
                    )}
                    {chatMessages.length === 0 ? <div className="text-center py-8 text-muted-foreground text-sm">Session started! Say hello.</div>
                      : chatMessages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[70%] p-3 rounded-2xl ${msg.sender_id === user?.id ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none"}`}>
                            <p className="text-sm">{msg.content_encrypted}</p>
                            <p className={`text-[10px] mt-1 ${msg.sender_id === user?.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{format(new Date(msg.created_at), "h:mm a")}</p>
                          </div>
                        </div>
                      ))}
                    <div ref={messagesEndRef} />
                  </div>
                  <div className="p-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Input placeholder="Type your message..." value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={handleKeyPress} className="flex-1 bg-muted/50 h-10 text-sm" />
                      <Button size="icon" className="bg-primary text-primary-foreground h-10 w-10" onClick={handleSendMessage} disabled={!message.trim() || isSending}>{isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}</Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mb-4"><MessageCircle className="w-10 h-10 text-white" /></div>
                  <h3 className="text-lg font-semibold font-display mb-1">Start a Conversation</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">Select an available intern to begin.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Suspense fallback={null}>
        <LazyVideoCallModal isOpen={callModal.open} onClose={() => setCallModal({ open: false, mode: "audio" })} participantName={profile?.username || "Student"} mode={callModal.mode} />
      </Suspense>
    </DashboardLayout>
  );
};

export default PeerConnect;
