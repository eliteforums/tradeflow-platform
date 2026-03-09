import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

interface WreckBuddy3DProps {
  hitCount: number;
  onHit: () => void;
}

/* ── Mobile 2D version — full-width, no aspect-square constraint ── */
function WreckBuddy2D({ hitCount, onHit }: WreckBuddy3DProps) {
  const [flash, setFlash] = useState(false);
  const damage = Math.min(hitCount / 30, 1);

  const handleClick = () => {
    onHit();
    setFlash(true);
    setTimeout(() => setFlash(false), 150);
  };

  return (
    <div className="w-full rounded-2xl overflow-hidden bg-gradient-to-b from-rose-950/30 to-background border border-border/50 flex items-center justify-center py-8">
      <motion.button
        onClick={handleClick}
        whileTap={{ scale: 0.9 }}
        className="relative flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{
            rotate: flash ? [0, -8, 8, -4, 0] : 0,
            scale: 1 - damage * 0.08,
          }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          <div
            className="w-28 h-32 rounded-full flex items-center justify-center text-6xl"
            style={{
              background: `hsl(0, ${70 + damage * 30}%, ${55 - damage * 25}%)`,
            }}
          >
            {hitCount > 20 ? "😵" : hitCount > 10 ? "😣" : "😶"}
          </div>
          {flash && (
            <motion.div
              initial={{ opacity: 0.5, scale: 0.8 }}
              animate={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 rounded-full bg-red-500/30"
            />
          )}
        </motion.div>
        <p className="text-xs text-muted-foreground mt-1">Tap to hit!</p>
      </motion.button>
    </div>
  );
}

/* ── 3D Buddy mesh ── */
function Buddy({ hitCount, onHit }: WreckBuddy3DProps) {
  const group = useRef<THREE.Group>(null);
  const [flash, setFlash] = useState(false);
  const damage = Math.min(hitCount / 30, 1);

  useFrame(() => {
    if (!group.current) return;
    group.current.rotation.z *= 0.92;
    group.current.rotation.x *= 0.92;
  });

  const handleClick = () => {
    onHit();
    if (group.current) {
      group.current.rotation.z = (Math.random() - 0.5) * 0.5;
      group.current.rotation.x = (Math.random() - 0.5) * 0.3;
    }
    setFlash(true);
    setTimeout(() => setFlash(false), 150);
  };

  const bodyColor = new THREE.Color().setHSL(0, 0.7 + damage * 0.3, 0.55 - damage * 0.25);
  const headColor = new THREE.Color().setHSL(0, 0.7 + damage * 0.3, 0.5 - damage * 0.2);

  return (
    <group ref={group} onClick={handleClick} scale={1 - damage * 0.1}>
      <mesh position={[0, -0.2, 0]}>
        <capsuleGeometry args={[0.55, 1.0, 16, 16]} />
        <meshStandardMaterial color={bodyColor} roughness={0.4} metalness={0.1} />
      </mesh>
      <mesh position={[0, 1.15, 0]}>
        <sphereGeometry args={[0.48, 32, 32]} />
        <meshStandardMaterial color={headColor} roughness={0.35} metalness={0.1} />
      </mesh>
      <mesh position={[-0.16, 1.22, 0.4]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      <mesh position={[0.16, 1.22, 0.4]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      <mesh position={[0, hitCount > 15 ? 1.0 : 0.98, 0.42]} rotation={[hitCount > 15 ? 0.3 : -0.3, 0, 0]}>
        <torusGeometry args={[0.12, 0.025, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      <mesh position={[-0.65, 0.1, 0]} rotation={[0, 0, 0.3]}>
        <capsuleGeometry args={[0.12, 0.6, 8, 8]} />
        <meshStandardMaterial color={bodyColor} roughness={0.4} />
      </mesh>
      <mesh position={[0.65, 0.1, 0]} rotation={[0, 0, -0.3]}>
        <capsuleGeometry args={[0.12, 0.6, 8, 8]} />
        <meshStandardMaterial color={bodyColor} roughness={0.4} />
      </mesh>
      {flash && (
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[1.2, 16, 16]} />
          <meshBasicMaterial color="#ff4444" transparent opacity={0.2} />
        </mesh>
      )}
    </group>
  );
}

export default function WreckBuddy3D(props: WreckBuddy3DProps) {
  const isMobile = useIsMobile();

  if (isMobile) return <WreckBuddy2D {...props} />;

  return (
    <div className="w-full max-w-[320px] mx-auto aspect-square rounded-2xl overflow-hidden bg-gradient-to-b from-rose-950/30 to-background border border-border/50">
      <Canvas camera={{ position: [0, 0.5, 4], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 5, 3]} intensity={0.8} />
        <pointLight position={[-2, 2, 2]} intensity={0.4} color="#ff6b6b" />
        <Buddy hitCount={props.hitCount} onHit={props.onHit} />
        <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 1.8} minPolarAngle={Math.PI / 4} />
      </Canvas>
    </div>
  );
}
