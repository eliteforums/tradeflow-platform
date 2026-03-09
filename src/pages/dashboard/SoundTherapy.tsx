import { useState, useCallback, useEffect, useRef } from "react";
import {
  Music, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX,
  Clock, Headphones, Loader2, ChevronUp, ChevronDown, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useSoundTherapy } from "@/hooks/useSoundTherapy";
import { useIsMobile } from "@/hooks/use-mobile";

const SoundTherapy = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState([75]);
  const [progress, setProgress] = useState([0]);
  const [isMuted, setIsMuted] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [showExpanded, setShowExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isMobile = useIsMobile();

  const { tracks, categories, isLoading, formatDuration } = useSoundTherapy();

  const filteredTracks =
    activeCategory === "all" ? tracks : tracks.filter((t) => t.category === activeCategory);

  const currentTrackData = filteredTracks[currentTrack];

  useEffect(() => {
    if (currentTrackData?.file_url && isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      audioRef.current = new Audio(currentTrackData.file_url);
      audioRef.current.volume = isMuted ? 0 : volume[0] / 100;
      audioRef.current.play().catch(() => {});

      const audio = audioRef.current;
      const updateProgress = () => {
        if (audio.duration) setProgress([(audio.currentTime / audio.duration) * 100]);
      };
      audio.addEventListener("timeupdate", updateProgress);
      audio.addEventListener("ended", () => handleNext());

      return () => {
        audio.removeEventListener("timeupdate", updateProgress);
        audio.pause();
      };
    } else if (!isPlaying && audioRef.current) {
      audioRef.current.pause();
    }
  }, [currentTrack, isPlaying, currentTrackData?.file_url]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume[0] / 100;
  }, [volume, isMuted]);

  const handleTrackSelect = useCallback((index: number) => {
    setCurrentTrack(index);
    setIsPlaying(true);
    setProgress([0]);
  }, []);

  const handleNext = useCallback(() => {
    setCurrentTrack((prev) => {
      const next = prev + 1;
      if (next < filteredTracks.length) { setProgress([0]); return next; }
      return prev;
    });
  }, [filteredTracks.length]);

  const handlePrev = useCallback(() => {
    setCurrentTrack((prev) => {
      if (prev > 0) { setProgress([0]); return prev - 1; }
      return prev;
    });
  }, []);

  const toggleMute = useCallback(() => setIsMuted((prev) => !prev), []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const hasPlayer = !!currentTrackData;

  /* ─── MOBILE FULL-SCREEN PLAYER ─── */
  if (isMobile && showExpanded && currentTrackData) {
    return (
      <DashboardLayout>
        <div className="fixed inset-0 z-50 bg-background flex flex-col" style={{ paddingTop: "env(safe-area-inset-top, 0px)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
          {/* Close bar */}
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={() => setShowExpanded(false)} className="text-muted-foreground">
              <ChevronDown className="w-6 h-6" />
            </button>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Now Playing</p>
            <div className="w-6" />
          </div>

          {/* Art */}
          <div className="flex-1 flex items-center justify-center px-8">
            <div className="w-56 h-56 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-7xl shadow-2xl shadow-cyan-500/20">
              {currentTrackData.cover_emoji || "🎵"}
            </div>
          </div>

          {/* Info + Controls */}
          <div className="px-6 pb-6 space-y-5">
            <div className="text-center">
              <h2 className="text-lg font-bold font-display truncate">{currentTrackData.title}</h2>
              <p className="text-sm text-muted-foreground">{currentTrackData.artist || "Unknown"}</p>
            </div>

            {/* Progress */}
            <div>
              <Slider value={progress} onValueChange={setProgress} max={100} step={1} className="mb-1" />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>{formatDuration(Math.floor((progress[0] / 100) * (currentTrackData.duration_sec || 0)))}</span>
                <span>{formatDuration(currentTrackData.duration_sec)}</span>
              </div>
            </div>

            {/* Transport */}
            <div className="flex items-center justify-center gap-6">
              <button onClick={handlePrev} className="text-muted-foreground active:scale-90 transition-transform">
                <SkipBack className="w-7 h-7" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center active:scale-95 transition-transform shadow-lg shadow-primary/30"
              >
                {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
              </button>
              <button onClick={handleNext} className="text-muted-foreground active:scale-90 transition-transform">
                <SkipForward className="w-7 h-7" />
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-3">
              <button onClick={toggleMute}>
                {isMuted ? <VolumeX className="w-4 h-4 text-muted-foreground" /> : <Volume2 className="w-4 h-4 text-muted-foreground" />}
              </button>
              <Slider value={isMuted ? [0] : volume} onValueChange={setVolume} max={100} step={1} className="flex-1" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-3 sm:space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-lg sm:text-2xl font-bold font-display">Sound Therapy</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Curated audio for meditation & focus</p>
        </div>

        {/* Categories */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-0">
          <button
            onClick={() => setActiveCategory("all")}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeCategory === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-5">
          {/* Track List */}
          <div className={`lg:col-span-2 space-y-1.5 sm:space-y-2 ${hasPlayer ? "pb-24 lg:pb-0" : ""}`}>
            {filteredTracks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Music className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">No tracks in this category</p>
              </div>
            ) : (
              filteredTracks.map((track, index) => {
                const isActive = currentTrack === index && isPlaying;
                return (
                  <button
                    key={track.id}
                    onClick={() => handleTrackSelect(index)}
                    className={`w-full p-2.5 sm:p-3.5 rounded-xl text-left transition-all flex items-center gap-2.5 sm:gap-3 active:scale-[0.98] ${
                      isActive
                        ? "bg-primary/10 border-primary/50"
                        : "bg-card hover:bg-muted/40"
                    } border border-border/50`}
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-lg sm:text-xl shrink-0">
                      {track.cover_emoji || "🎵"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-[13px] sm:text-sm truncate">{track.title}</h3>
                      <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground">
                        <span className="truncate">{track.artist || "Unknown"}</span>
                        <span className="shrink-0">·</span>
                        <span className="shrink-0 flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          {formatDuration(track.duration_sec)}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {isActive ? (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <Pause className="w-3.5 h-3.5 text-primary-foreground" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center">
                          <Play className="w-3.5 h-3.5 ml-0.5" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Desktop Now Playing */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-6 p-5 rounded-2xl bg-card border border-border/50">
              <div className="text-center mb-5">
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-4xl mx-auto mb-3">
                  {currentTrackData?.cover_emoji || "🎵"}
                </div>
                <h3 className="font-semibold text-sm">{currentTrackData?.title || "Select a track"}</h3>
                <p className="text-xs text-muted-foreground">{currentTrackData?.artist || ""}</p>
              </div>
              <div className="mb-4">
                <Slider value={progress} onValueChange={setProgress} max={100} step={1} className="mb-1.5" />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>{currentTrackData ? formatDuration(Math.floor((progress[0] / 100) * (currentTrackData.duration_sec || 0))) : "0:00"}</span>
                  <span>{currentTrackData ? formatDuration(currentTrackData.duration_sec) : "0:00"}</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3 mb-5">
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handlePrev}><SkipBack className="w-4 h-4" /></Button>
                <Button size="icon" className="w-12 h-12 rounded-full bg-primary text-primary-foreground" onClick={() => setIsPlaying(!isPlaying)}>
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleNext}><SkipForward className="w-4 h-4" /></Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleMute}>
                  {isMuted ? <VolumeX className="w-4 h-4 text-muted-foreground" /> : <Volume2 className="w-4 h-4 text-muted-foreground" />}
                </Button>
                <Slider value={isMuted ? [0] : volume} onValueChange={setVolume} max={100} step={1} className="flex-1" />
              </div>
              <div className="mt-4 p-2.5 rounded-lg bg-muted/30">
                <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                  <Headphones className="w-3.5 h-3.5" />
                  Use headphones for best experience
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Mini Player — sits above bottom nav with safe area */}
        {hasPlayer && !showExpanded && (
          <div
            className="lg:hidden fixed left-0 right-0 z-40 bg-card/95 backdrop-blur-xl border-t border-border/40"
            style={{ bottom: "calc(4rem + env(safe-area-inset-bottom, 0px))" }}
          >
            {/* Progress bar on top */}
            <div className="h-0.5 bg-muted">
              <div className="h-full bg-primary transition-all" style={{ width: `${progress[0]}%` }} />
            </div>
            <button
              onClick={() => setShowExpanded(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2 active:bg-muted/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-base shrink-0">
                {currentTrackData.cover_emoji || "🎵"}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[13px] font-medium truncate leading-tight">{currentTrackData.title}</p>
                <p className="text-[10px] text-muted-foreground truncate">{currentTrackData.artist || "Unknown"}</p>
              </div>
              <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrev}>
                  <SkipBack className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="icon"
                  className="h-9 w-9 rounded-full bg-primary text-primary-foreground"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNext}>
                  <SkipForward className="w-3.5 h-3.5" />
                </Button>
              </div>
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SoundTherapy;
