import { useState, useCallback, useEffect, useRef } from "react";
import {
  Music,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Heart,
  Clock,
  Headphones,
  Loader2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useSoundTherapy } from "@/hooks/useSoundTherapy";

const SoundTherapy = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState([75]);
  const [progress, setProgress] = useState([0]);
  const [isMuted, setIsMuted] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [showPlayer, setShowPlayer] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
    setShowPlayer(true);
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

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display mb-1">Sound Therapy</h1>
          <p className="text-sm text-muted-foreground">
            Curated audio for meditation, relaxation, and focus
          </p>
        </div>

        {/* Categories — horizontal scroll */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          <Button
            variant={activeCategory === "all" ? "default" : "outline"}
            onClick={() => setActiveCategory("all")}
            size="sm"
            className={`shrink-0 ${activeCategory === "all" ? "bg-primary" : ""}`}
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              onClick={() => setActiveCategory(cat)}
              size="sm"
              className={`shrink-0 ${activeCategory === cat ? "bg-primary" : ""}`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
              <span className="ml-1.5 text-[10px] opacity-70">
                {tracks.filter((t) => t.category === cat).length}
              </span>
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Track List */}
          <div className="lg:col-span-2 space-y-2 sm:space-y-3">
            {filteredTracks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Music className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No tracks in this category yet</p>
              </div>
            ) : (
              filteredTracks.map((track, index) => (
                <button
                  key={track.id}
                  onClick={() => handleTrackSelect(index)}
                  className={`w-full p-3 sm:p-4 rounded-xl text-left transition-all flex items-center gap-3 ${
                    currentTrack === index && isPlaying
                      ? "bg-primary/10 border-primary"
                      : "bg-card hover:bg-muted/50"
                  } border border-border`}
                >
                  <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-xl sm:text-2xl shrink-0">
                    {track.cover_emoji || "🎵"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base truncate">{track.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{track.artist || "Unknown"}</p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <span className="text-[11px] sm:text-sm text-muted-foreground hidden sm:flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDuration(track.duration_sec)}
                    </span>
                    {currentTrack === index && isPlaying ? (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <Pause className="w-3.5 h-3.5 text-primary-foreground" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <Play className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Desktop Now Playing Panel */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-6 p-6 rounded-2xl bg-card border border-border">
              <div className="text-center mb-6">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-5xl mx-auto mb-4">
                  {currentTrackData?.cover_emoji || "🎵"}
                </div>
                <h3 className="font-semibold text-lg">{currentTrackData?.title || "Select a track"}</h3>
                <p className="text-sm text-muted-foreground">{currentTrackData?.artist || ""}</p>
              </div>
              <div className="mb-4">
                <Slider value={progress} onValueChange={setProgress} max={100} step={1} className="mb-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{currentTrackData ? formatDuration(Math.floor((progress[0] / 100) * (currentTrackData.duration_sec || 0))) : "0:00"}</span>
                  <span>{currentTrackData ? formatDuration(currentTrackData.duration_sec) : "0:00"}</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={handlePrev}><SkipBack className="w-5 h-5" /></Button>
                <Button size="icon" className="w-14 h-14 rounded-full bg-primary text-primary-foreground" onClick={() => setIsPlaying(!isPlaying)}>
                  {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={handleNext}><SkipForward className="w-5 h-5" /></Button>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={toggleMute}>
                  {isMuted ? <VolumeX className="w-5 h-5 text-muted-foreground" /> : <Volume2 className="w-5 h-5 text-muted-foreground" />}
                </Button>
                <Slider value={isMuted ? [0] : volume} onValueChange={setVolume} max={100} step={1} className="flex-1" />
              </div>
              <div className="mt-6 p-3 rounded-lg bg-muted/30">
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <Headphones className="w-4 h-4" />
                  Use headphones for the best experience
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Fixed Bottom Player — sits above bottom nav (h-16) */}
        {currentTrackData && (
          <div className="lg:hidden fixed bottom-16 left-0 right-0 z-40 bg-card/95 backdrop-blur-xl border-t border-border">
            {showPlayer && (
              <div className="px-3 pt-2.5 pb-0.5">
                <Slider value={progress} onValueChange={setProgress} max={100} step={1} className="mb-0.5" />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>{formatDuration(Math.floor((progress[0] / 100) * (currentTrackData.duration_sec || 0)))}</span>
                  <span>{formatDuration(currentTrackData.duration_sec)}</span>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2.5 px-3 py-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-base shrink-0">
                {currentTrackData.cover_emoji || "🎵"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold truncate">{currentTrackData.title}</p>
                <p className="text-[10px] text-muted-foreground truncate">{currentTrackData.artist || "Unknown"}</p>
              </div>
              <div className="flex items-center gap-0.5">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handlePrev}>
                  <SkipBack className="w-3.5 h-3.5" />
                </Button>
                <Button size="icon" className="h-8 w-8 rounded-full bg-primary text-primary-foreground" onClick={() => setIsPlaying(!isPlaying)}>
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleNext}>
                  <SkipForward className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowPlayer(!showPlayer)}>
                  {showPlayer ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SoundTherapy;
