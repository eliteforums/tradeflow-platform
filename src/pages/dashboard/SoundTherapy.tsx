import { useState } from "react";
import {
  Music,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Repeat,
  Shuffle,
  Heart,
  Clock,
  Headphones,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import DashboardLayout from "@/components/layout/DashboardLayout";

const SoundTherapy = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState([75]);

  const categories = [
    { id: "meditation", name: "Meditation", count: 12 },
    { id: "nature", name: "Nature Sounds", count: 18 },
    { id: "focus", name: "Focus", count: 8 },
    { id: "sleep", name: "Sleep", count: 15 },
    { id: "stress", name: "Stress Relief", count: 10 },
  ];

  const tracks = [
    {
      id: 1,
      title: "Calm Ocean Waves",
      artist: "Nature Collection",
      duration: "15:00",
      category: "nature",
      cover: "🌊",
    },
    {
      id: 2,
      title: "Guided Mindfulness",
      artist: "Dr. Peace",
      duration: "10:30",
      category: "meditation",
      cover: "🧘",
    },
    {
      id: 3,
      title: "Forest Rain",
      artist: "Nature Collection",
      duration: "20:00",
      category: "nature",
      cover: "🌲",
    },
    {
      id: 4,
      title: "Deep Focus Beats",
      artist: "Study Sounds",
      duration: "45:00",
      category: "focus",
      cover: "🎯",
    },
    {
      id: 5,
      title: "Sleep Stories",
      artist: "Dreamland",
      duration: "30:00",
      category: "sleep",
      cover: "🌙",
    },
    {
      id: 6,
      title: "Tibetan Singing Bowl",
      artist: "Ancient Sounds",
      duration: "12:00",
      category: "meditation",
      cover: "🔔",
    },
  ];

  const [activeCategory, setActiveCategory] = useState("all");

  const filteredTracks =
    activeCategory === "all"
      ? tracks
      : tracks.filter((t) => t.category === activeCategory);

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
              key={cat.id}
              variant={activeCategory === cat.id ? "default" : "outline"}
              onClick={() => setActiveCategory(cat.id)}
              className={activeCategory === cat.id ? "bg-primary" : ""}
            >
              {cat.name}
              <span className="ml-2 text-xs opacity-70">{cat.count}</span>
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Track List */}
          <div className="lg:col-span-2 space-y-3">
            {filteredTracks.map((track, index) => (
              <button
                key={track.id}
                onClick={() => {
                  setCurrentTrack(index);
                  setIsPlaying(true);
                }}
                className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-4 ${
                  currentTrack === index
                    ? "bg-primary/10 border-primary"
                    : "bg-card hover:bg-muted/50"
                } border border-border`}
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-2xl">
                  {track.cover}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{track.title}</h3>
                  <p className="text-sm text-muted-foreground">{track.artist}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {track.duration}
                  </span>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
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
            ))}
          </div>

          {/* Now Playing */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 p-6 rounded-2xl bg-card border border-border">
              <div className="text-center mb-6">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-5xl mx-auto mb-4">
                  {filteredTracks[currentTrack]?.cover || "🎵"}
                </div>
                <h3 className="font-semibold text-lg">
                  {filteredTracks[currentTrack]?.title || "Select a track"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {filteredTracks[currentTrack]?.artist || ""}
                </p>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <Slider defaultValue={[33]} max={100} step={1} className="mb-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>3:15</span>
                  <span>{filteredTracks[currentTrack]?.duration || "0:00"}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <Shuffle className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <SkipBack className="w-6 h-6" />
                </Button>
                <Button
                  size="icon"
                  className="w-14 h-14 rounded-full bg-primary text-primary-foreground"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? (
                    <Pause className="w-7 h-7" />
                  ) : (
                    <Play className="w-7 h-7 ml-1" />
                  )}
                </Button>
                <Button variant="ghost" size="icon">
                  <SkipForward className="w-6 h-6" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <Repeat className="w-5 h-5" />
                </Button>
              </div>

              {/* Volume */}
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-muted-foreground" />
                <Slider
                  value={volume}
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
