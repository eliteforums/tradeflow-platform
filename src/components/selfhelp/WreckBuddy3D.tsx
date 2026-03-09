import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface BuddyProps {
  hitCount: number;
  onHit: () => void;
}

function Buddy({ hitCount, onHit }: BuddyProps) {
  const group = useRef<THREE.Group>(null);
  const [flash, setFlash] = useState(false);
  const damage = Math.min(hitCount / 30, 1);

  // Wobble on hit
  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.z *= 0.92; // dampen wobble
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
      {/* Body — capsule */}
      <mesh position={[0, -0.2, 0]}>
        <capsuleGeometry args={[0.55, 1.0, 16, 16]} />
        <meshStandardMaterial color={bodyColor} roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.15, 0]}>
        <sphereGeometry args={[0.48, 32, 32]} />
        <meshStandardMaterial color={headColor} roughness={0.35} metalness={0.1} />
      </mesh>

      {/* Left eye */}
      <mesh position={[-0.16, 1.22, 0.4]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Right eye */}
      <mesh position={[0.16, 1.22, 0.4]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Mouth — frown when damaged */}
      <mesh position={[0, hitCount > 15 ? 1.0 : 0.98, 0.42]} rotation={[hitCount > 15 ? 0.3 : -0.3, 0, 0]}>
        <torusGeometry args={[0.12, 0.025, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Left arm */}
      <mesh position={[-0.65, 0.1, 0]} rotation={[0, 0, 0.3]}>
        <capsuleGeometry args={[0.12, 0.6, 8, 8]} />
        <meshStandardMaterial color={bodyColor} roughness={0.4} />
      </mesh>

      {/* Right arm */}
      <mesh position={[0.65, 0.1, 0]} rotation={[0, 0, -0.3]}>
        <capsuleGeometry args={[0.12, 0.6, 8, 8]} />
        <meshStandardMaterial color={bodyColor} roughness={0.4} />
      </mesh>

      {/* Hit flash */}
      {flash && (
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[1.2, 16, 16]} />
          <meshBasicMaterial color="#ff4444" transparent opacity={0.2} />
        </mesh>
      )}
    </group>
  );
}

interface WreckBuddy3DProps {
  hitCount: number;
  onHit: () => void;
}

export default function WreckBuddy3D({ hitCount, onHit }: WreckBuddy3DProps) {
  return (
    <div className="w-full max-w-[320px] mx-auto aspect-square rounded-2xl overflow-hidden bg-gradient-to-b from-rose-950/30 to-background border border-border/50">
      <Canvas camera={{ position: [0, 0.5, 4], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 5, 3]} intensity={0.8} />
        <pointLight position={[-2, 2, 2]} intensity={0.4} color="#ff6b6b" />
        <Buddy hitCount={hitCount} onHit={onHit} />
        <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 1.8} minPolarAngle={Math.PI / 4} />
      </Canvas>
    </div>
  );
}
