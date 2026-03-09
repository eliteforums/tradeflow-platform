import { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface BowlMeshProps {
  phase: "inhale" | "hold" | "exhale" | "idle";
}

function Bowl({ phase }: BowlMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const ringsRef = useRef<THREE.Mesh[]>([]);
  const intensity = phase === "inhale" ? 1 : phase === "hold" ? 0.7 : phase === "exhale" ? 0.4 : 0.1;

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    // Gentle bob
    groupRef.current.rotation.y = t * 0.15;
    const breathScale = phase !== "idle" ? 1 + Math.sin(t * 2) * 0.02 * intensity : 1;
    groupRef.current.scale.setScalar(breathScale);

    // Animate rings
    ringsRef.current.forEach((ring, i) => {
      if (!ring) return;
      const s = 1 + Math.sin(t * 1.5 + i * 1.2) * 0.15 * intensity;
      ring.scale.set(s, s, s);
      (ring.material as THREE.MeshBasicMaterial).opacity = phase !== "idle" ? 0.15 + Math.sin(t * 2 + i) * 0.1 * intensity : 0;
    });
  });

  const bowlColor = new THREE.Color("#8b5cf6");
  const rimColor = new THREE.Color("#a78bfa");

  return (
    <>
      <group ref={groupRef}>
        {/* Bowl body — lathe geometry for realistic shape */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
          <latheGeometry args={[
            [
              new THREE.Vector2(0, 0.6),
              new THREE.Vector2(0.2, 0.58),
              new THREE.Vector2(0.6, 0.45),
              new THREE.Vector2(0.85, 0.2),
              new THREE.Vector2(0.9, 0),
              new THREE.Vector2(0.88, -0.05),
              new THREE.Vector2(0.5, -0.1),
              new THREE.Vector2(0.3, -0.12),
            ],
            32,
          ]} />
          <meshStandardMaterial color={bowlColor} roughness={0.25} metalness={0.7} side={THREE.DoubleSide} />
        </mesh>

        {/* Rim highlight */}
        <mesh position={[0, 0.58, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.2, 0.03, 8, 32]} />
          <meshStandardMaterial color={rimColor} roughness={0.2} metalness={0.8} />
        </mesh>

        {/* Inner glow */}
        <mesh position={[0, 0.3, 0]}>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshBasicMaterial color="#c4b5fd" transparent opacity={intensity * 0.15} />
        </mesh>
      </group>

      {/* Sound wave rings */}
      {[1.4, 1.8, 2.2].map((size, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) ringsRef.current[i] = el; }}
          position={[0, 0.2, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[size * 0.5 - 0.02, size * 0.5, 48]} />
          <meshBasicMaterial color="#a78bfa" transparent opacity={0} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* Floating particles when active */}
      {phase !== "idle" && Array.from({ length: 12 }).map((_, i) => (
        <FloatingParticle key={i} index={i} intensity={intensity} />
      ))}
    </>
  );
}

function FloatingParticle({ index, intensity }: { index: number; intensity: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const angle = (index / 12) * Math.PI * 2;
  const radius = 0.6 + Math.random() * 0.4;

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime() + index * 0.5;
    ref.current.position.x = Math.cos(angle + t * 0.3) * radius;
    ref.current.position.z = Math.sin(angle + t * 0.3) * radius;
    ref.current.position.y = 0.3 + Math.sin(t * 1.5) * 0.5 * intensity;
    (ref.current.material as THREE.MeshBasicMaterial).opacity = 0.3 + Math.sin(t * 2) * 0.2;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.025, 8, 8]} />
      <meshBasicMaterial color="#c4b5fd" transparent opacity={0.3} />
    </mesh>
  );
}

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

  return (
    <div className="w-full max-w-[320px] mx-auto aspect-square rounded-2xl overflow-hidden bg-gradient-to-b from-violet-950/30 to-background border border-border/50">
      <Canvas camera={{ position: [0, 1.5, 3], fov: 40 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 5, 3]} intensity={0.7} />
        <pointLight position={[-2, 2, 2]} intensity={0.5} color="#8b5cf6" />
        <Bowl phase={phase} />
        <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2.2} minPolarAngle={Math.PI / 6} />
      </Canvas>
    </div>
  );
}
