import { useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Music, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Loader2, ChevronDown, Heart, Clock } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useSoundTherapy } from "@/hooks/useSoundTherapy";
import { motion, AnimatePresence } from "framer-motion";

const gradients = [
  "from-cyan-500 to-blue-600",
  "from-violet-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-pink-500 to-rose-600",
  "from-amber-500 to-orange-600",
  "from-indigo-500 to-blue-700",
  "from-fuchsia-500 to-pink-600",
  "from-teal-400 to-cyan-600",
];

const MobileSoundTherapy = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState([75]);
  const [progress, setProgress] = useState([0]);
  const [isMuted, setIsMuted] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [showExpanded, setShowExpanded] = useState(false);
  const [liked, setLiked] = useState<Set<string>>(new Set());
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
  const toggleLike = (id: string) => setLiked(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  if (isLoading) return <DashboardLayout><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></DashboardLayout>;

  const hasPlayer = !!currentTrackData;

  // Expanded full-screen player
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
          {/* Background glow */}
          <div className="absolute inset-0 overflow-hidden">
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[120%] aspect-square bg-gradient-to-b ${gradients[currentTrack % gradients.length]} opacity-15 blur-[100px] rounded-full`} />
          </div>

          <div className="relative z-10 flex flex-col flex-1 max-w-md mx-auto w-full">
            {/* Top bar */}
            <div className="flex items-center justify-between px-5 py-4">
              <button onClick={() => setShowExpanded(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-muted/30 active:scale-90">
                <ChevronDown className="w-6 h-6 text-foreground" />
              </button>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">Now Playing</p>
              <button onClick={() => toggleLike(currentTrackData.id)} className="w-10 h-10 flex items-center justify-center rounded-full bg-muted/30 active:scale-90">
                <Heart className={`w-5 h-5 ${liked.has(currentTrackData.id) ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
              </button>
            </div>

            {/* Album art */}
            <div className="flex-1 flex items-center justify-center px-10">
              <motion.div
                animate={{ scale: isPlaying ? 1 : 0.92 }}
                transition={{ type: "spring", damping: 20 }}
                className={`w-full max-w-[240px] aspect-square rounded-3xl bg-gradient-to-br ${gradients[currentTrack % gradients.length]} flex items-center justify-center shadow-2xl`}
              >
                <span className="text-7xl drop-shadow-lg">{currentTrackData.cover_emoji || "🎵"}</span>
              </motion.div>
            </div>

            {/* Controls */}
            <div className="px-6 pb-8 space-y-5">
              <div>
                <h2 className="text-xl font-bold font-display truncate">{currentTrackData.title}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">{currentTrackData.artist || "Unknown Artist"}</p>
              </div>

              <div>
                <Slider value={progress} onValueChange={setProgress} max={100} step={0.5} className="mb-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatDuration(Math.floor((progress[0] / 100) * (currentTrackData.duration_sec || 0)))}</span>
                  <span>{formatDuration(currentTrackData.duration_sec)}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-8">
                <button onClick={handlePrev} className="text-foreground/70 active:scale-90 transition-transform">
                  <SkipBack className="w-7 h-7" />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-[68px] h-[68px] rounded-full bg-foreground text-background flex items-center justify-center active:scale-95 shadow-xl"
                >
                  {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
                </button>
                <button onClick={handleNext} className="text-foreground/70 active:scale-90 transition-transform">
                  <SkipForward className="w-7 h-7" />
                </button>
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
      <div className="w-full max-w-lg mx-auto overflow-x-hidden space-y-4 pb-28">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold font-display">Sounds</h1>
          <p className="text-sm text-muted-foreground">Curated audio for healing & focus</p>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
          <button
            onClick={() => setActiveCategory("all")}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              activeCategory === "all"
                ? "bg-foreground text-background"
                : "bg-muted/40 text-muted-foreground active:scale-95"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeCategory === cat
                  ? "bg-foreground text-background"
                  : "bg-muted/40 text-muted-foreground active:scale-95"
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Featured card */}
        {filteredTracks.length > 0 && (
          <button
            onClick={() => handleTrackSelect(0)}
            className="w-full text-left active:scale-[0.98] transition-transform"
          >
            <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradients[0]} p-5 h-40 flex flex-col justify-end`}>
              <div className="absolute top-3 right-3 text-5xl opacity-25">{filteredTracks[0].cover_emoji || "🎵"}</div>
              <div className="relative z-10">
                <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-1">Featured</p>
                <h2 className="text-white text-lg font-bold font-display leading-tight">{filteredTracks[0].title}</h2>
                <p className="text-white/60 text-xs mt-0.5">{filteredTracks[0].artist || "Unknown Artist"}</p>
              </div>
              <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                {currentTrack === 0 && isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-0.5" />}
              </div>
            </div>
          </button>
        )}

        {/* Track list — Spotify row style */}
        {filteredTracks.length > 1 && (
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">All Tracks</h3>
            <div className="space-y-1.5">
              {filteredTracks.slice(1).map((track, idx) => {
                const realIndex = idx + 1;
                const isActive = currentTrack === realIndex && isPlaying;
                return (
                  <button
                    key={track.id}
                    onClick={() => handleTrackSelect(realIndex)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all active:scale-[0.98] ${
                      isActive ? "bg-primary/10 border border-primary/30" : "bg-card/60 border border-transparent hover:bg-muted/30"
                    }`}
                  >
                    {/* Album art */}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradients[realIndex % gradients.length]} flex items-center justify-center shrink-0 relative`}>
                      <span className="text-xl">{track.cover_emoji || "🎵"}</span>
                      {isActive && (
                        <div className="absolute inset-0 rounded-xl bg-black/30 flex items-center justify-center">
                          <div className="flex gap-0.5 items-end h-4">
                            {[1, 2, 3].map(i => (
                              <motion.div
                                key={i}
                                className="w-[3px] bg-white rounded-full"
                                animate={{ height: [4, 14, 8, 16, 4] }}
                                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${isActive ? "text-primary" : ""}`}>{track.title}</p>
                      <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                        {track.artist || "Unknown"} · <Clock className="w-3 h-3 inline" /> {formatDuration(track.duration_sec)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleLike(track.id); }}
                        className="w-8 h-8 flex items-center justify-center"
                      >
                        <Heart className={`w-4 h-4 ${liked.has(track.id) ? "fill-red-500 text-red-500" : "text-muted-foreground/50"}`} />
                      </button>
                      <div className="w-8 h-8 rounded-full bg-muted/40 flex items-center justify-center">
                        {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {filteredTracks.length === 0 && (
          <div className="text-center py-16">
            <Music className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No tracks in this category</p>
          </div>
        )}
      </div>

      {/* Mini Player */}
      {hasPlayer && !showExpanded && (
        <div
          className="fixed left-0 right-0 z-40"
          style={{ bottom: "calc(4rem + env(safe-area-inset-bottom, 0px))" }}
        >
          <div className="h-[2px] bg-muted/50 mx-4 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress[0]}%` }} />
          </div>
          <button
            onClick={() => setShowExpanded(true)}
            className="w-full flex items-center gap-3 px-4 py-2.5 bg-card/95 backdrop-blur-xl border-t border-border/30 active:bg-muted/30"
          >
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradients[currentTrack % gradients.length]} flex items-center justify-center text-lg shrink-0 shadow-lg`}>
              {currentTrackData.cover_emoji || "🎵"}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold truncate">{currentTrackData.title}</p>
              <p className="text-xs text-muted-foreground truncate">{currentTrackData.artist || "Unknown"}</p>
            </div>
            <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
              <button onClick={handlePrev} className="w-8 h-8 flex items-center justify-center active:scale-90">
                <SkipBack className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center active:scale-95"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
              <button onClick={handleNext} className="w-8 h-8 flex items-center justify-center active:scale-90">
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </button>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MobileSoundTherapy;