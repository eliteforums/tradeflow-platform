import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  MessageCircle, Search, Circle, Send, X, Shield, Users,
  Loader2, AlertCircle, ArrowLeft, Flag, ChevronUp, CheckCheck, Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EmojiPicker from "@/components/chat/EmojiPicker";

import { useAuth } from "@/contexts/AuthContext";
import { usePeerConnect } from "@/hooks/usePeerConnect";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { format, isToday, isYesterday } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

const MobilePeerConnect = () => {
  const [searchParams] = useSearchParams();
  const urlSessionId = searchParams.get("sessionId");
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [mobileView, setMobileView] = useState<"list" | "chat" | "newchat">("list");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { user, profile, creditBalance } = useAuth();
  const {
    interns, sessions, activeSession, messages: chatMessages, isLoading,
    activeSessionId, setActiveSessionId, requestSession, sendMessage, endSession,
    flagSession, isRequesting, isSending, isFlagging, internStatuses, lastMessages,
    hasMoreMessages, isLoadingMore, loadMoreMessages, hasOpenSession,
  } = usePeerConnect(urlSessionId);
  const isIntern = profile?.role === "intern";

  const debouncedSearch = useDebouncedValue(searchTerm, 300);

  const filteredInterns = useMemo(() => {
    if (!debouncedSearch) return interns;
    const q = debouncedSearch.toLowerCase();
    return interns.filter(
      (i) => i.username.toLowerCase().includes(q) || (i.specialty || "").toLowerCase().includes(q)
    );
  }, [interns, debouncedSearch]);

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => {
      const aTime = lastMessages[a.id]?.created_at || a.created_at;
      const bTime = lastMessages[b.id]?.created_at || b.created_at;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });
  }, [sessions, lastMessages]);

  const filteredSessions = useMemo(() => {
    if (!debouncedSearch) return sortedSessions;
    const q = debouncedSearch.toLowerCase();
    return sortedSessions.filter((s) => {
      const name = isIntern ? (s as any)?.student?.username || "" : (s as any)?.intern?.username || "";
      return name.toLowerCase().includes(q);
    });
  }, [sortedSessions, debouncedSearch, isIntern]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);
  useEffect(() => { if (activeSession && !activeSessionId) { setActiveSessionId(activeSession.id); setMobileView("chat"); } }, [activeSession, activeSessionId, setActiveSessionId]);

  const handleSendMessage = useCallback(() => {
    if (!message.trim() || !activeSessionId) return;
    sendMessage({ sessionId: activeSessionId, content: message });
    setMessage("");
  }, [message, activeSessionId, sendMessage]);

  const handleStartSession = useCallback((internId: string) => {
    if (creditBalance < 20) return;
    requestSession(internId);
    setMobileView("chat");
  }, [creditBalance, requestSession]);

  const statusColors: Record<string, string> = { online: "bg-eternia-success", busy: "bg-eternia-warning", offline: "bg-muted-foreground" };

  const getPartnerName = (session: any) => {
    return isIntern ? session?.student?.username || "Student" : session?.intern?.username || "Intern";
  };

  const formatMessageTime = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return format(date, "h:mm a");
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMM d");
  };

  const groupedMessages = useMemo(() => {
    const groups: { date: string; messages: typeof chatMessages }[] = [];
    let currentDate = "";
    for (const msg of chatMessages) {
      const msgDate = format(new Date(msg.created_at), "yyyy-MM-dd");
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: msgDate, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    }
    return groups;
  }, [chatMessages]);

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMMM d, yyyy");
  };

  // ═══ NEW CHAT VIEW (select intern) ═══
  if (mobileView === "newchat" && !isIntern) {
    return (
      <DashboardLayout>
        <div className="pb-24">
          <div className="flex items-center gap-3 px-1 mb-4">
            <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setMobileView("list")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold font-display">New Chat</h1>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search interns..." className="pl-10 bg-card h-10 text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          {creditBalance < 20 && (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-destructive/10 border border-destructive/20 mb-4">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
              <p className="text-xs text-destructive">Need at least 20 ECC to start a session.</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : filteredInterns.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No interns available</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredInterns.map((intern) => {
                const status = internStatuses[intern.id] || "offline";
                return (
                  <button
                    key={intern.id}
                    onClick={() => status === "online" && handleStartSession(intern.id)}
                    disabled={status !== "online" || isRequesting || hasOpenSession}
                    className="w-full px-4 py-3.5 flex items-center gap-3 rounded-2xl hover:bg-muted/50 transition-colors disabled:opacity-50"
                  >
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <Circle className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 ${statusColors[status]} rounded-full border-2 border-background`} fill="currentColor" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-semibold truncate">{intern.username}</p>
                      <p className="text-xs text-muted-foreground">{intern.specialty || "General Support"}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {status === "online" ? "Available" : status === "busy" ? "Busy" : "Offline"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // ═══ CHAT VIEW ═══
  if (mobileView === "chat") {
    return (
      <DashboardLayout>
        <div className="flex flex-col h-[calc(100dvh-7rem)]">
          {activeSessionId && activeSession ? (
            <>
              {/* Chat Header */}
              <div className="px-2 py-2.5 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => { setMobileView("list"); }}>
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                    isIntern ? "bg-gradient-to-br from-blue-500 to-cyan-500" : "bg-gradient-to-br from-accent to-primary"
                  }`}>
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm leading-tight">{getPartnerName(activeSession)}</h3>
                    <p className="text-[10px] text-muted-foreground">
                      {activeSession.status === "active" ? "Online" : activeSession.status}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  {isIntern && (
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-eternia-warning"
                      disabled={isFlagging || activeSession?.is_flagged}
                      onClick={() => flagSession({ sessionId: activeSessionId, reason: "Intern flagged during session" })}>
                      <Flag className={`w-4 h-4 ${activeSession?.is_flagged ? "fill-current" : ""}`} />
                    </Button>
                  )}
                  {activeSession.status === "active" && (
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive"
                      onClick={() => { endSession(activeSessionId); setMobileView("list"); }}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3 py-2 bg-background/50">
                {hasMoreMessages && (
                  <div className="text-center mb-2">
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={loadMoreMessages} disabled={isLoadingMore}>
                      {isLoadingMore ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <ChevronUp className="w-3 h-3 mr-1" />}
                      Load earlier
                    </Button>
                  </div>
                )}
                {groupedMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <p className="text-sm">Say hello! 👋</p>
                  </div>
                ) : (
                  groupedMessages.map((group) => (
                    <div key={group.date}>
                      <div className="flex items-center justify-center my-3">
                        <span className="px-3 py-0.5 rounded-full bg-muted text-[10px] text-muted-foreground font-medium">
                          {getDateLabel(group.date)}
                        </span>
                      </div>
                      {group.messages.map((msg) => {
                        const isMine = msg.sender_id === user?.id;
                        return (
                          <div key={msg.id} className={`flex mb-1.5 ${isMine ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[80%] px-3 py-2 rounded-2xl ${
                              isMine
                                ? "bg-primary text-primary-foreground rounded-br-sm"
                                : "bg-card border border-border rounded-bl-sm"
                            }`}>
                              <p className="text-sm">{msg.content_encrypted}</p>
                              <div className={`flex items-center justify-end gap-1 mt-0.5 ${isMine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                                <span className="text-[10px]">{format(new Date(msg.created_at), "h:mm a")}</span>
                                {isMine && <CheckCheck className="w-3 h-3" />}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              {activeSession.status === "active" ? (
                <div className="px-3 py-2.5 border-t border-border bg-card">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                      className="flex-1 bg-muted/50 h-10 text-sm border-none"
                    />
                    <Button size="icon" className="bg-primary text-primary-foreground h-10 w-10 rounded-full" onClick={handleSendMessage} disabled={!message.trim() || isSending}>
                      {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              ) : (
              <div className="px-3 py-3 border-t border-border bg-muted/30 text-center space-y-2">
                  <p className="text-xs text-muted-foreground">This session has ended</p>
                  {!isIntern && (
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => setMobileView("newchat")}>
                      <Plus className="w-3 h-3 mr-1" /> Start New Chat
                    </Button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <MessageCircle className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No active session</p>
              <Button variant="outline" className="mt-3 h-9 text-sm" onClick={() => setMobileView("list")}>Back to chats</Button>
            </div>
          )}
        </div>
        
      </DashboardLayout>
    );
  }

  // ═══ LIST VIEW (WhatsApp-like conversation list) ═══
  return (
    <DashboardLayout>
      <div className="pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold font-display">Chats</h1>
            <p className="text-xs text-muted-foreground">{isIntern ? "Student sessions" : "Anonymous peer support"}</p>
          </div>
          {!isIntern && (
            <Button variant="ghost" size="icon" className="h-10 w-10 bg-primary/10" onClick={() => setMobileView("newchat")}>
              <Plus className="w-5 h-5 text-primary" />
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-10 bg-card h-10 text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        {/* Start New Chat prominent button */}
        {!isIntern && !hasOpenSession && filteredSessions.length > 0 && (
          <Button className="w-full mb-4" onClick={() => setMobileView("newchat")}>
            <Plus className="w-4 h-4 mr-2" /> Start New Chat
          </Button>
        )}

        {/* Conversation List */}
        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : filteredSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MessageCircle className="w-12 h-12 text-muted-foreground/20 mb-3" />
            <p className="text-sm text-muted-foreground mb-1">No conversations yet</p>
            {!isIntern && (
              <Button variant="link" className="text-xs" onClick={() => setMobileView("newchat")}>
                Start a new chat
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-0.5">
            {filteredSessions.map((session) => {
              const partnerName = getPartnerName(session);
              const lastMsg = lastMessages[session.id];
              const isActive = session.status === "active";
              const timeStr = lastMsg ? formatMessageTime(lastMsg.created_at) : formatMessageTime(session.created_at);

              return (
                <button
                  key={session.id}
                  onClick={() => { setActiveSessionId(session.id); setMobileView("chat"); }}
                  className="w-full px-3 py-3.5 flex items-center gap-3 rounded-2xl hover:bg-muted/50 transition-colors"
                >
                  <div className="relative shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isIntern ? "bg-gradient-to-br from-blue-500 to-cyan-500" : "bg-gradient-to-br from-accent to-primary"
                    }`}>
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    {isActive && (
                      <Circle className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-eternia-success rounded-full border-2 border-background" fill="currentColor" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-sm font-semibold truncate">{partnerName}</p>
                      <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{timeStr}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {lastMsg?.sender_id === user?.id && <CheckCheck className="w-3 h-3 text-primary shrink-0" />}
                      <p className="text-xs text-muted-foreground truncate">
                        {lastMsg
                          ? lastMsg.content_encrypted.substring(0, 35) + (lastMsg.content_encrypted.length > 35 ? "..." : "")
                          : isActive ? "Session active" : session.status === "completed" ? "Session ended" : "Pending"
                        }
                      </p>
                    </div>
                  </div>
                  {session.is_flagged && <Flag className="w-3.5 h-3.5 text-destructive shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MobilePeerConnect;
