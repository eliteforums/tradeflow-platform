import { useState, useRef, useEffect } from "react";
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

  const { tracks, categories, isLoading, formatDuration } = useSoundTherapy();

  const filteredTracks =
    activeCategory === "all" ? tracks : tracks.filter((t) => t.category === activeCategory);

  const handleTrackSelect = (index: number) => {
    setCurrentTrack(index);
    setIsPlaying(true);
    setProgress([0]);
  };

  const handleNext = () => {
    if (currentTrack < filteredTracks.length - 1) {
      setCurrentTrack((prev) => prev + 1);
      setProgress([0]);
    }
  };

  const handlePrev = () => {
    if (currentTrack > 0) {
      setCurrentTrack((prev) => prev - 1);
      setProgress([0]);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Simulate progress (in production, use actual audio element)
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev[0] + 0.5;
        if (newProgress >= 100) {
          handleNext();
          return [0];
        }
        return [newProgress];
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isPlaying, currentTrack]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const currentTrackData = filteredTracks[currentTrack];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-display mb-2">Sound Therapy</h1>
          <p className="text-muted-foreground">
            Curated audio experiences for meditation, relaxation, and focus
          </p>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={activeCategory === "all" ? "default" : "outline"}
            onClick={() => setActiveCategory("all")}
            className={activeCategory === "all" ? "bg-primary" : ""}
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              onClick={() => setActiveCategory(cat)}
              className={activeCategory === cat ? "bg-primary" : ""}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
              <span className="ml-2 text-xs opacity-70">
                {tracks.filter((t) => t.category === cat).length}
              </span>
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Track List */}
          <div className="lg:col-span-2 space-y-3">
            {filteredTracks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No tracks in this category yet</p>
              </div>
            ) : (
              filteredTracks.map((track, index) => (
                <button
                  key={track.id}
                  onClick={() => handleTrackSelect(index)}
                  className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-4 ${
                    currentTrack === index && isPlaying
                      ? "bg-primary/10 border-primary"
                      : "bg-card hover:bg-muted/50"
                  } border border-border`}
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-2xl">
                    {track.cover_emoji || "🎵"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{track.title}</h3>
                    <p className="text-sm text-muted-foreground">{track.artist || "Unknown"}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDuration(track.duration_sec)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Toggle favorite
                      }}
                    >
                      <Heart className="w-5 h-5" />
                    </Button>
                    {currentTrack === index && isPlaying ? (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <Pause className="w-4 h-4 text-primary-foreground" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <Play className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Now Playing */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 p-6 rounded-2xl bg-card border border-border">
              <div className="text-center mb-6">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-5xl mx-auto mb-4">
                  {currentTrackData?.cover_emoji || "🎵"}
                </div>
                <h3 className="font-semibold text-lg">
                  {currentTrackData?.title || "Select a track"}
                </h3>
                <p className="text-sm text-muted-foreground">{currentTrackData?.artist || ""}</p>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <Slider
                  value={progress}
                  onValueChange={setProgress}
                  max={100}
                  step={1}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {currentTrackData
                      ? formatDuration(
                          Math.floor((progress[0] / 100) * (currentTrackData.duration_sec || 0))
                        )
                      : "0:00"}
                  </span>
                  <span>{currentTrackData ? formatDuration(currentTrackData.duration_sec) : "0:00"}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={handlePrev}>
                  <SkipBack className="w-6 h-6" />
                </Button>
                <Button
                  size="icon"
                  className="w-14 h-14 rounded-full bg-primary text-primary-foreground"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={handleNext}>
                  <SkipForward className="w-6 h-6" />
                </Button>
              </div>

              {/* Volume */}
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={toggleMute}>
                  {isMuted ? (
                    <VolumeX className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-muted-foreground" />
                  )}
                </Button>
                <Slider
                  value={isMuted ? [0] : volume}
                  onValueChange={setVolume}
                  max={100}
                  step={1}
                  className="flex-1"
                />
              </div>

              {/* Tip */}
              <div className="mt-6 p-3 rounded-lg bg-muted/30">
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <Headphones className="w-4 h-4" />
                  Use headphones for the best experience
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SoundTherapy;
