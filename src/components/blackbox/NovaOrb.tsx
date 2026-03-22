import { motion } from "framer-motion";

interface NovaOrbProps {
  isActive?: boolean;
  isPulsing?: boolean;
  size?: number;
}

const NovaOrb = ({ isActive = false, isPulsing = false, size = 220 }: NovaOrbProps) => {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Outer glow */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(var(--primary) / 0.3) 0%, transparent 70%)",
        }}
        animate={isPulsing || isActive ? { scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] } : {}}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Main orb */}
      <motion.div
        className="relative rounded-full"
        style={{
          width: size * 0.85,
          height: size * 0.85,
          background: `radial-gradient(circle at 40% 35%, hsl(195 90% 75%), hsl(var(--primary)) 50%, hsl(210 60% 30%) 100%)`,
          boxShadow: `
            0 0 ${size * 0.3}px hsl(var(--primary) / 0.4),
            0 0 ${size * 0.6}px hsl(var(--primary) / 0.15),
            inset 0 -${size * 0.1}px ${size * 0.2}px hsl(210 60% 20% / 0.5),
            inset 0 ${size * 0.05}px ${size * 0.15}px hsl(195 90% 85% / 0.3)
          `,
        }}
        animate={
          isActive
            ? { scale: [1, 1.04, 1, 1.02, 1], rotate: [0, 1, -1, 0] }
            : isPulsing
            ? { scale: [1, 1.06, 1] }
            : {}
        }
        transition={{
          duration: isActive ? 3 : 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Highlight reflection */}
        <div
          className="absolute rounded-full"
          style={{
            top: "12%",
            left: "18%",
            width: "35%",
            height: "25%",
            background: "radial-gradient(ellipse, hsl(195 90% 90% / 0.4), transparent)",
            filter: "blur(8px)",
          }}
        />
      </motion.div>
    </div>
  );
};

export default NovaOrb;
