import { useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";

interface TibetanBowl3DProps {
  phase: "inhale" | "hold" | "exhale" | "idle";
}

export default function TibetanBowl3D({ phase }: TibetanBowl3DProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (phase !== "idle" && !audioRef.current) {
      audioRef.current = new Audio("/sounds/tibetan-bowl.mp3");
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(() => {});
    }
    if (phase === "idle" && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [phase]);

  const intensity = phase === "inhale" ? 1 : phase === "hold" ? 0.7 : phase === "exhale" ? 0.4 : 0.15;
  const bowlScale = phase === "inhale" ? 1.08 : phase === "exhale" ? 0.95 : 1;

  return (
    <div className="relative w-full max-w-[300px] mx-auto aspect-square flex items-center justify-center">
      {/* Sound wave rings */}
      {phase !== "idle" && [1.4, 1.7, 2.0].map((r, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: [0, intensity * 0.3, 0],
            scale: [0.9, r, r + 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeOut",
          }}
          className="absolute rounded-full border border-violet-400/30"
          style={{ width: "60%", height: "60%" }}
        />
      ))}

      {/* Bowl */}
      <motion.div
        animate={{ scale: bowlScale }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="relative z-10"
      >
        {/* Bowl body */}
        <div className="w-28 h-16 sm:w-36 sm:h-20 rounded-b-[50%] bg-gradient-to-b from-violet-400 to-violet-700 shadow-xl shadow-violet-500/20 mx-auto" />
        {/* Rim */}
        <div className="w-32 h-5 sm:w-40 sm:h-6 rounded-[50%] bg-gradient-to-r from-violet-300 via-violet-400 to-violet-500 -mt-3 mx-auto shadow-inner" />
        {/* Inner glow */}
        <motion.div
          animate={{ opacity: intensity }}
          className="absolute top-1 left-1/2 -translate-x-1/2 w-20 sm:w-24 h-10 sm:h-12 rounded-b-[50%] bg-gradient-to-b from-violet-300/40 to-transparent"
        />
      </motion.div>

      {/* Phase label */}
      {phase !== "idle" && (
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center"
        >
          <p className="text-xs font-medium text-violet-400/70 uppercase tracking-widest">
            {phase === "inhale" ? "Breathe In" : phase === "hold" ? "Hold" : "Breathe Out"}
          </p>
        </motion.div>
      )}

      {/* Floating particles */}
      {phase !== "idle" && Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, intensity * 0.5, 0],
            y: [-20, -60 - Math.random() * 40],
            x: (Math.random() - 0.5) * 80,
          }}
          transition={{
            duration: 2 + Math.random(),
            repeat: Infinity,
            delay: i * 0.3,
          }}
          className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-violet-400/40"
        />
      ))}
    </div>
  );
}
