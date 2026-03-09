import { useState } from "react";
import { Calendar, Clock, User, Video, Phone, CheckCircle, Coins, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import DashboardLayout from "@/components/layout/DashboardLayout";
import VideoCallModal from "@/components/videosdk/VideoCallModal";
import { useAuth } from "@/contexts/AuthContext";
import { useAppointments } from "@/hooks/useAppointments";
import { useCredits } from "@/hooks/useCredits";
import { format } from "date-fns";

const MobileAppointments = () => {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [callModal, setCallModal] = useState<{ open: boolean; mode: "video" | "audio" }>({ open: false, mode: "video" });
  const [bookingDialog, setBookingDialog] = useState<{ open: boolean; expert?: any; slot?: any }>({ open: false });
  const [sessionType, setSessionType] = useState<"video" | "audio">("video");

  const { profile } = useAuth();
  const { balance } = useCredits();
  const { experts, slots, upcomingAppointments, pastAppointments, isLoading, bookAppointment, cancelAppointment, isBooking } = useAppointments();

  const handleBookSlot = (expert: any, slot: any) => setBookingDialog({ open: true, expert, slot });
  const confirmBooking = () => {
    if (!bookingDialog.expert || !bookingDialog.slot) return;
    bookAppointment({ expertId: bookingDialog.expert.id, slotId: bookingDialog.slot.id, slotTime: bookingDialog.slot.start_time, sessionType, creditCost: 50 });
    setBookingDialog({ open: false });
  };
  const getExpertSlots = (expertId: string) => slots.filter((s) => s.expert_id === expertId);

  if (isLoading) return <DashboardLayout><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-3 pb-24">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold font-display">Appointments</h1>
            <p className="text-[11px] text-muted-foreground">Book sessions with professionals</p>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-card border border-border">
            <Coins className="w-3 h-3 text-primary" /><span className="font-semibold text-[11px]">{balance} ECC</span>
          </div>
        </div>

        {/* My Appointments */}
        <div className="rounded-xl bg-card border border-border/50 p-3">
          <h2 className="text-xs font-semibold font-display mb-2">My Appointments</h2>
          <div className="flex gap-1.5 mb-3">
            <Button variant={activeTab === "upcoming" ? "default" : "ghost"} onClick={() => setActiveTab("upcoming")} size="sm" className="h-7 text-[10px] px-2">
              Upcoming ({upcomingAppointments.length})
            </Button>
            <Button variant={activeTab === "past" ? "default" : "ghost"} onClick={() => setActiveTab("past")} size="sm" className="h-7 text-[10px] px-2">Past</Button>
          </div>
          <div className="space-y-2">
            {(activeTab === "upcoming" ? upcomingAppointments : pastAppointments).length === 0 ? (
              <p className="text-center py-6 text-muted-foreground text-[10px]">No {activeTab} appointments</p>
            ) : (activeTab === "upcoming" ? upcomingAppointments : pastAppointments).map((apt) => (
              <div key={apt.id} className="p-2.5 rounded-xl bg-muted/30 border border-border">
                <div className="flex items-start gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h3 className="font-semibold text-xs truncate">{apt.expert?.username || "Expert"}</h3>
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] shrink-0 ${
                        apt.status === "confirmed" ? "bg-eternia-success/10 text-eternia-success" :
                        apt.status === "pending" ? "bg-eternia-warning/10 text-eternia-warning" :
                        apt.status === "completed" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                      }`}>{apt.status}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-0.5"><Calendar className="w-2.5 h-2.5" />{format(new Date(apt.slot_time), "MMM d")}</span>
                      <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{format(new Date(apt.slot_time), "h:mm a")}</span>
                    </div>
                    {activeTab === "upcoming" && (apt.status === "confirmed" || apt.status === "pending") && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Button variant="outline" size="sm" onClick={() => setCallModal({ open: true, mode: apt.session_type === "video" ? "video" : "audio" })} className="gap-1 h-6 text-[9px] px-1.5">
                          {apt.session_type === "video" ? <Video className="w-2.5 h-2.5" /> : <Phone className="w-2.5 h-2.5" />}Join
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => cancelAppointment(apt.id)} className="text-destructive h-6 text-[9px] px-1.5">
                          <X className="w-2.5 h-2.5 mr-0.5" />Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Experts */}
        <div>
          <h2 className="text-xs font-semibold font-display mb-2">Available Experts</h2>
          {experts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground bg-card rounded-xl border border-border"><User className="w-8 h-8 mx-auto mb-2 opacity-50" /><p className="text-[10px]">No experts available</p></div>
          ) : (
            <div className="space-y-2">
              {experts.map((expert) => {
                const expertSlots = getExpertSlots(expert.id);
                return (
                  <div key={expert.id} className="p-3 rounded-xl bg-card border border-border">
                    <div className="flex items-start gap-2.5 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-xs">{expert.username}</h3>
                        <p className="text-[10px] text-muted-foreground">{expert.specialty || "Mental Health Professional"}</p>
                        <div className="flex items-center gap-2 text-[9px] text-muted-foreground mt-0.5">
                          <span>⭐ 4.9</span><span>{expert.total_sessions} sessions</span>
                        </div>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] shrink-0 ${expertSlots.length > 0 ? "bg-eternia-success/10 text-eternia-success" : "bg-muted text-muted-foreground"}`}>
                        {expertSlots.length > 0 ? "Available" : "No slots"}
                      </span>
                    </div>
                    {expertSlots.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {expertSlots.slice(0, 3).map((slot) => (
                          <Button key={slot.id} variant="outline" size="sm" onClick={() => handleBookSlot(expert, slot)} className="text-[9px] h-6 px-1.5">
                            {format(new Date(slot.start_time), "MMM d, h:mm a")}
                          </Button>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <p className="font-semibold text-[10px] flex items-center gap-1"><Coins className="w-3 h-3 text-primary" />50 ECC</p>
                      {expertSlots.length > 0 && (
                        <Button size="sm" className="h-7 text-[10px] px-2.5" onClick={() => handleBookSlot(expert, expertSlots[0])}>Book Now</Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Dialog open={bookingDialog.open} onOpenChange={(open) => setBookingDialog({ open })}>
        <DialogContent className="max-w-[calc(100vw-2rem)]">
          <DialogHeader>
            <DialogTitle className="text-sm">Book Appointment</DialogTitle>
            <DialogDescription className="text-xs">With {bookingDialog.expert?.username}</DialogDescription>
          </DialogHeader>
          {bookingDialog.slot && (
            <div className="space-y-3 py-1">
              <div className="p-2.5 rounded-lg bg-muted/30 border border-border space-y-1.5">
                <p className="text-xs flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-primary" />{format(new Date(bookingDialog.slot.start_time), "EEE, MMM d")}</p>
                <p className="text-xs flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-primary" />{format(new Date(bookingDialog.slot.start_time), "h:mm a")}</p>
              </div>
              <div className="flex gap-2">
                <Button variant={sessionType === "video" ? "default" : "outline"} onClick={() => setSessionType("video")} className="flex-1 gap-1 h-8 text-xs"><Video className="w-3.5 h-3.5" />Video</Button>
                <Button variant={sessionType === "audio" ? "default" : "outline"} onClick={() => setSessionType("audio")} className="flex-1 gap-1 h-8 text-xs"><Phone className="w-3.5 h-3.5" />Audio</Button>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-primary/5 border border-primary/20">
                <span className="text-xs">Cost</span>
                <span className="font-semibold text-xs flex items-center gap-1"><Coins className="w-3.5 h-3.5 text-primary" />50 ECC</span>
              </div>
              {balance < 50 && <p className="text-[10px] text-destructive">Insufficient credits.</p>}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setBookingDialog({ open: false })} size="sm" className="h-8 text-xs">Cancel</Button>
            <Button onClick={confirmBooking} disabled={isBooking || balance < 50} size="sm" className="h-8 text-xs gap-1">
              {isBooking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <VideoCallModal isOpen={callModal.open} onClose={() => setCallModal({ open: false, mode: "video" })} participantName={profile?.username || "Student"} mode={callModal.mode} />
    </DashboardLayout>
  );
};

export default MobileAppointments;
