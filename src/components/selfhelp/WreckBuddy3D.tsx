import { motion } from "framer-motion";
import { Zap } from "lucide-react";

interface WreckBuddy3DProps {
  hitCount: number;
  onHit: () => void;
}

export default function WreckBuddy3D({ hitCount, onHit }: WreckBuddy3DProps) {
  const damage = Math.min(hitCount / 30, 1);
  const scale = 1 - damage * 0.15;

  // Color transitions from red to dark red as damage increases
  const hue = 0;
  const saturation = 70 + damage * 30;
  const lightness = 55 - damage * 25;

  return (
    <div className="relative w-full max-w-[280px] mx-auto aspect-square flex items-center justify-center select-none">
      {/* Background rings */}
      <div className="absolute inset-0 rounded-full border-2 border-rose-500/10 animate-pulse" />
      <div className="absolute inset-4 rounded-full border border-rose-500/5" />

      {/* Hit flash */}
      <motion.div
        key={hitCount}
        initial={{ opacity: 0.6, scale: 1.2 }}
        animate={{ opacity: 0, scale: 1.5 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 rounded-full bg-rose-500/20 pointer-events-none"
      />

      {/* Buddy */}
      <motion.button
        onClick={onHit}
        whileTap={{ scale: 0.85, rotate: Math.random() > 0.5 ? 8 : -8 }}
        animate={{ scale }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className="relative w-36 h-44 sm:w-40 sm:h-48 focus:outline-none cursor-pointer"
        aria-label="Hit the buddy"
      >
        {/* Body */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 sm:w-28 h-32 sm:h-36 rounded-[2rem] shadow-lg transition-colors duration-200"
          style={{ backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)` }}
        />

        {/* Head */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-16 sm:w-20 h-16 sm:h-20 rounded-full shadow-md transition-colors duration-200"
          style={{ backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)` }}
        >
          {/* Eyes */}
          <div className="absolute top-5 sm:top-6 left-3 sm:left-4 w-2.5 h-2.5 rounded-full bg-background" />
          <div className="absolute top-5 sm:top-6 right-3 sm:right-4 w-2.5 h-2.5 rounded-full bg-background" />

          {/* Mouth */}
          <div
            className={`absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 w-6 h-3 rounded-b-full border-b-2 border-x-2 border-background/80 transition-transform ${
              hitCount > 15 ? "rotate-180 translate-y-1" : ""
            }`}
          />
        </div>

        {/* Arms */}
        <div
          className="absolute top-14 sm:top-16 -left-1 w-4 sm:w-5 h-14 sm:h-16 rounded-full transition-colors duration-200"
          style={{ backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness + 3}%)`, transform: "rotate(15deg)" }}
        />
        <div
          className="absolute top-14 sm:top-16 -right-1 w-4 sm:w-5 h-14 sm:h-16 rounded-full transition-colors duration-200"
          style={{ backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness + 3}%)`, transform: "rotate(-15deg)" }}
        />

        {/* Hit stars */}
        {hitCount > 0 && hitCount % 5 === 0 && (
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6 }}
            className="absolute -top-4 left-1/2 -translate-x-1/2 text-amber-400 text-lg"
          >
            <Zap className="w-5 h-5 fill-amber-400" />
          </motion.div>
        )}
      </motion.button>

      {/* Hit counter ring */}
      <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
        <circle
          cx="50%"
          cy="50%"
          r="48%"
          fill="none"
          stroke="hsl(var(--primary) / 0.1)"
          strokeWidth="3"
        />
        <circle
          cx="50%"
          cy="50%"
          r="48%"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="3"
          strokeDasharray={`${(hitCount / 30) * 100} 100`}
          strokeLinecap="round"
          className="transition-all duration-200"
          pathLength="100"
        />
      </svg>
    </div>
  );
}
