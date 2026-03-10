import { useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Music, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Clock, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useSoundTherapy } from "@/hooks/useSoundTherapy";

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

  const handleTrackSelect = useCallback((i: number) => { setCurrentTrack(i); setIsPlaying(true); setProgress([0]); }, []);
  const handleNext = useCallback(() => { setCurrentTrack((p) => p + 1 < filteredTracks.length ? (setProgress([0]), p + 1) : p); }, [filteredTracks.length]);
  const handlePrev = useCallback(() => { setCurrentTrack((p) => p > 0 ? (setProgress([0]), p - 1) : p); }, []);

  if (isLoading) return <DashboardLayout><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></DashboardLayout>;

  const hasPlayer = !!currentTrackData;

  const expandedPlayer = showExpanded && currentTrackData
    ? createPortal(
        <div className="fixed inset-0 z-[100] bg-background flex flex-col" style={{ paddingTop: "env(safe-area-inset-top, 0px)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
          <div className="flex items-center justify-between px-5 py-4">
            <button onClick={() => setShowExpanded(false)} className="text-muted-foreground"><ChevronDown className="w-7 h-7" /></button>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Now Playing</p>
            <div className="w-7" />
          </div>
          <div className="flex-1 flex items-center justify-center px-8">
            <div className="w-56 h-56 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-7xl shadow-2xl shadow-cyan-500/20">
              {currentTrackData.cover_emoji || "🎵"}
            </div>
          </div>
          <div className="px-6 pb-8 space-y-5">
            <div className="text-center">
              <h2 className="text-lg font-bold font-display truncate">{currentTrackData.title}</h2>
              <p className="text-sm text-muted-foreground">{currentTrackData.artist || "Unknown"}</p>
            </div>
            <div>
              <Slider value={progress} onValueChange={setProgress} max={100} step={1} className="mb-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatDuration(Math.floor((progress[0] / 100) * (currentTrackData.duration_sec || 0)))}</span>
                <span>{formatDuration(currentTrackData.duration_sec)}</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-6">
              <button onClick={handlePrev} className="text-muted-foreground active:scale-90"><SkipBack className="w-7 h-7" /></button>
              <button onClick={() => setIsPlaying(!isPlaying)} className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center active:scale-95 shadow-lg shadow-primary/30">
                {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-0.5" />}
              </button>
              <button onClick={handleNext} className="text-muted-foreground active:scale-90"><SkipForward className="w-7 h-7" /></button>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setIsMuted(!isMuted)}>{isMuted ? <VolumeX className="w-4 h-4 text-muted-foreground" /> : <Volume2 className="w-4 h-4 text-muted-foreground" />}</button>
              <Slider value={isMuted ? [0] : volume} onValueChange={setVolume} max={100} step={1} className="flex-1" />
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <DashboardLayout>
      {expandedPlayer}
      <div className="space-y-5 pb-24">
        <div>
          <h1 className="text-xl font-bold font-display">Sound Therapy</h1>
          <p className="text-sm text-muted-foreground">Curated audio for meditation & focus</p>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button onClick={() => setActiveCategory("all")} className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium ${activeCategory === "all" ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground"}`}>All</button>
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium ${activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground"}`}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Track List */}
        <div className={`space-y-2 ${hasPlayer ? "pb-20" : ""}`}>
          {filteredTracks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground"><Music className="w-10 h-10 mx-auto mb-3 opacity-50" /><p className="text-sm">No tracks</p></div>
          ) : filteredTracks.map((track, index) => {
            const isActive = currentTrack === index && isPlaying;
            return (
              <button key={track.id} onClick={() => handleTrackSelect(index)}
                className={`w-full p-3 rounded-2xl text-left flex items-center gap-3 active:scale-[0.98] ${isActive ? "bg-primary/10 border-primary/50" : "bg-card"} border border-border/50`}>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-xl shrink-0">{track.cover_emoji || "🎵"}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{track.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span className="truncate">{track.artist || "Unknown"}</span>
                    <span>·</span>
                    <span className="shrink-0 flex items-center gap-1"><Clock className="w-3 h-3" />{formatDuration(track.duration_sec)}</span>
                  </div>
                </div>
                <div className="shrink-0">
                  {isActive ? (
                    <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center"><Pause className="w-4 h-4 text-primary-foreground" /></div>
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-muted/60 flex items-center justify-center"><Play className="w-4 h-4 ml-0.5" /></div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Mini Player */}
        {hasPlayer && !showExpanded && (
          <div className="fixed left-0 right-0 z-40 bg-card/95 backdrop-blur-xl border-t border-border/40" style={{ bottom: "calc(4rem + env(safe-area-inset-bottom, 0px))" }}>
            <div className="h-0.5 bg-muted"><div className="h-full bg-primary transition-all" style={{ width: `${progress[0]}%` }} /></div>
            <button onClick={() => setShowExpanded(true)} className="w-full flex items-center gap-3 px-4 py-3 active:bg-muted/30">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-lg shrink-0">{currentTrackData.cover_emoji || "🎵"}</div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium truncate">{currentTrackData.title}</p>
                <p className="text-xs text-muted-foreground truncate">{currentTrackData.artist || "Unknown"}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handlePrev}><SkipBack className="w-4 h-4" /></Button>
                <Button size="icon" className="h-10 w-10 rounded-full bg-primary text-primary-foreground" onClick={() => setIsPlaying(!isPlaying)}>
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleNext}><SkipForward className="w-4 h-4" /></Button>
              </div>
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MobileSoundTherapy;
