import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { createPortal } from "react-dom";
import { Music, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Loader2, ChevronDown, Clock } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useSoundTherapy } from "@/hooks/useSoundTherapy";
import { useEccEarn } from "@/hooks/useEccEarn";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

const gradients = [
  "from-cyan-500 to-blue-600",
  "from-violet-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-pink-500 to-rose-600",
  "from-amber-500 to-orange-600",
  "from-indigo-500 to-blue-700",
];

const MobileSoundTherapy = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState([75]);
  const [progress, setProgress] = useState([0]);
  const [isMuted, setIsMuted] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [showExpanded, setShowExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { tracks, categories, isLoading, formatDuration } = useSoundTherapy();
  const filteredTracks = activeCategory === "all" ? tracks : tracks.filter((t) => t.category === activeCategory);
  const currentTrackData = filteredTracks[currentTrack];

  useEffect(() => {
    if (currentTrackData?.file_url && isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      audioRef.current = new Audio(currentTrackData.file_url);
      audioRef.current.volume = isMuted ? 0 : volume[0] / 100;
      audioRef.current.play().catch(() => {});
      const audio = audioRef.current;
      const update = () => { if (audio.duration) setProgress([(audio.currentTime / audio.duration) * 100]); };
      audio.addEventListener("timeupdate", update);
      audio.addEventListener("ended", () => handleNext());
      return () => { audio.removeEventListener("timeupdate", update); audio.pause(); };
    } else if (!isPlaying && audioRef.current) { audioRef.current.pause(); }
  }, [currentTrack, isPlaying, currentTrackData?.file_url]);

  useEffect(() => { if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume[0] / 100; }, [volume, isMuted]);

  const handleTrackSelect = useCallback((i: number) => {
    if (!filteredTracks[i]?.file_url) { toast({ title: "No audio file", description: "This track has no audio file yet", variant: "destructive" }); return; }
    setCurrentTrack(i); setIsPlaying(true); setProgress([0]);
  }, [filteredTracks]);
  const handleSeek = useCallback((val: number[]) => { if (audioRef.current?.duration) audioRef.current.currentTime = (val[0] / 100) * audioRef.current.duration; }, []);
  const handleNext = useCallback(() => { setCurrentTrack((p) => p + 1 < filteredTracks.length ? (setProgress([0]), p + 1) : p); }, [filteredTracks.length]);
  const handlePrev = useCallback(() => { setCurrentTrack((p) => p > 0 ? (setProgress([0]), p - 1) : p); }, []);

  if (isLoading) return <DashboardLayout><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></DashboardLayout>;

  const hasPlayer = !!currentTrackData;

  const expandedPlayer = showExpanded && currentTrackData
    ? createPortal(
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="fixed inset-0 z-[100] bg-background flex flex-col"
          style={{ paddingTop: "env(safe-area-inset-top, 0px)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[120%] aspect-square bg-gradient-to-b ${gradients[currentTrack % gradients.length]} opacity-15 blur-[100px] rounded-full`} />
          </div>

          <div className="relative z-10 flex flex-col flex-1 w-full px-5">
            {/* Top bar */}
            <div className="flex items-center justify-between py-4">
              <button onClick={() => setShowExpanded(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-muted/30">
                <ChevronDown className="w-6 h-6 text-foreground" />
              </button>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">Now Playing</p>
              <div className="w-10" />
            </div>

            {/* Album art */}
            <div className="flex-1 flex items-center justify-center">
              <motion.div
                animate={{ scale: isPlaying ? 1 : 0.92 }}
                transition={{ type: "spring", damping: 20 }}
                className={`w-48 h-48 rounded-3xl bg-gradient-to-br ${gradients[currentTrack % gradients.length]} flex items-center justify-center shadow-2xl`}
              >
                <span className="text-6xl">{currentTrackData.cover_emoji || "🎵"}</span>
              </motion.div>
            </div>

            {/* Controls */}
            <div className="pb-8 space-y-4">
              <div className="text-center">
                <h2 className="text-lg font-bold font-display truncate">{currentTrackData.title}</h2>
                <p className="text-sm text-muted-foreground">{currentTrackData.artist || "Unknown Artist"}</p>
              </div>

              <div>
                <Slider value={progress} onValueChange={setProgress} onValueCommit={handleSeek} max={100} step={0.5} className="mb-1.5" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatDuration(Math.floor((progress[0] / 100) * (currentTrackData.duration_sec || 0)))}</span>
                  <span>{formatDuration(currentTrackData.duration_sec)}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-8">
                <button onClick={handlePrev} className="text-foreground/70"><SkipBack className="w-6 h-6" /></button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-16 h-16 rounded-full bg-foreground text-background flex items-center justify-center shadow-xl"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                </button>
                <button onClick={handleNext} className="text-foreground/70"><SkipForward className="w-6 h-6" /></button>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={() => setIsMuted(!isMuted)}>
                  {isMuted ? <VolumeX className="w-4 h-4 text-muted-foreground" /> : <Volume2 className="w-4 h-4 text-muted-foreground" />}
                </button>
                <Slider value={isMuted ? [0] : volume} onValueChange={setVolume} max={100} step={1} className="flex-1" />
              </div>
            </div>
          </div>
        </motion.div>,
        document.body
      )
    : null;

  return (
    <DashboardLayout>
      <AnimatePresence>{expandedPlayer}</AnimatePresence>
      <div className="w-full space-y-4 pb-28 overflow-hidden">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold font-display">Sound Therapy</h1>
          <p className="text-xs text-muted-foreground">Curated audio for healing & focus</p>
        </div>

        {/* Categories - horizontal scroll */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
          <button
            onClick={() => setActiveCategory("all")}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeCategory === "all" ? "bg-primary text-primary-foreground" : "bg-muted/40 text-muted-foreground"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-muted/40 text-muted-foreground"
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Track list */}
        {filteredTracks.length === 0 ? (
          <div className="text-center py-16">
            <Music className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">No tracks yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Your admin will add sounds here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTracks.map((track, index) => {
              const isActive = currentTrack === index && isPlaying;
              return (
                <button
                  key={track.id}
                  onClick={() => handleTrackSelect(index)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                    isActive ? "bg-primary/10 border border-primary/30" : "bg-card border border-border/50"
                  }`}
                >
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradients[index % gradients.length]} flex items-center justify-center shrink-0 relative`}>
                    <span className="text-lg">{track.cover_emoji || "🎵"}</span>
                    {isActive && (
                      <div className="absolute inset-0 rounded-xl bg-black/30 flex items-center justify-center">
                        <div className="flex gap-0.5 items-end h-3">
                          {[1, 2, 3].map(i => (
                            <motion.div
                              key={i}
                              className="w-[2px] bg-white rounded-full"
                              animate={{ height: [3, 10, 6, 12, 3] }}
                              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isActive ? "text-primary" : ""}`}>{track.title}</p>
                    <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                      {track.artist || "Unknown"} · <Clock className="w-3 h-3" /> {formatDuration(track.duration_sec)}
                      {!track.file_url && <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive ml-1">No audio</span>}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-muted/40 flex items-center justify-center shrink-0">
                    {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Mini Player */}
      {hasPlayer && !showExpanded && (
        <div
          className="fixed left-0 right-0 z-40"
          style={{ bottom: "calc(4rem + env(safe-area-inset-bottom, 0px))" }}
        >
          <div className="h-[2px] bg-muted/50 mx-3 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress[0]}%` }} />
          </div>
          <button
            onClick={() => setShowExpanded(true)}
            className="w-full flex items-center gap-3 px-3 py-2 bg-card/95 backdrop-blur-xl border-t border-border/30"
          >
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradients[currentTrack % gradients.length]} flex items-center justify-center text-base shrink-0`}>
              {currentTrackData.cover_emoji || "🎵"}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-semibold truncate">{currentTrackData.title}</p>
              <p className="text-[10px] text-muted-foreground truncate">{currentTrackData.artist || "Unknown"}</p>
            </div>
            <div className="flex items-center gap-0 shrink-0" onClick={(e) => e.stopPropagation()}>
              <button onClick={handlePrev} className="w-8 h-8 flex items-center justify-center">
                <SkipBack className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-9 h-9 rounded-full bg-foreground text-background flex items-center justify-center"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <button onClick={handleNext} className="w-8 h-8 flex items-center justify-center">
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>
          </button>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MobileSoundTherapy;
