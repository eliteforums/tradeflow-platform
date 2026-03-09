import { useRef, useState, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import * as THREE from "three";

interface DollProps {
  onClick: () => void;
  hitCount: number;
}

function BuddyDoll({ onClick, hitCount }: DollProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [wobble, setWobble] = useState({ x: 0, z: 0 });
  const [isHit, setIsHit] = useState(false);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    // Spring back from hits
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, wobble.x, delta * 3);
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, wobble.z, delta * 3);
    // Decay wobble
    setWobble(prev => ({
      x: THREE.MathUtils.lerp(prev.x, 0, delta * 2),
      z: THREE.MathUtils.lerp(prev.z, 0, delta * 2),
    }));
  });

  const handleClick = useCallback((e: any) => {
    e.stopPropagation();
    const dir = e.point;
    setWobble({
      x: (Math.random() - 0.5) * 0.8,
      z: (Math.random() - 0.5) * 0.8,
    });
    setIsHit(true);
    setTimeout(() => setIsHit(false), 150);
    onClick();
  }, [onClick]);

  const damage = Math.min(hitCount / 30, 1);
  const bodyColor = new THREE.Color().lerpColors(
    new THREE.Color("#ff6b6b"),
    new THREE.Color("#8b0000"),
    damage
  );

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={groupRef} onClick={handleClick} scale={isHit ? 0.92 : 1}>
        {/* Body */}
        <mesh position={[0, 0, 0]} castShadow>
          <capsuleGeometry args={[0.6, 1.2, 16, 32]} />
          <meshStandardMaterial color={bodyColor} roughness={0.4} metalness={0.1} />
        </mesh>
        {/* Head */}
        <mesh position={[0, 1.4, 0]} castShadow>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color={bodyColor} roughness={0.3} metalness={0.1} />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.15, 1.5, 0.42]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color={isHit ? "#ff0000" : "#111111"} />
        </mesh>
        <mesh position={[0.15, 1.5, 0.42]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color={isHit ? "#ff0000" : "#111111"} />
        </mesh>
        {/* Mouth - changes based on hits */}
        <mesh position={[0, 1.25, 0.45]} rotation={[0, 0, hitCount > 15 ? Math.PI : 0]}>
          <torusGeometry args={[0.12, 0.03, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
        {/* Arms */}
        <mesh position={[-0.8, 0.2, 0]} rotation={[0, 0, isHit ? 0.5 : 0.3]}>
          <capsuleGeometry args={[0.12, 0.8, 8, 16]} />
          <meshStandardMaterial color={bodyColor} roughness={0.4} />
        </mesh>
        <mesh position={[0.8, 0.2, 0]} rotation={[0, 0, isHit ? -0.5 : -0.3]}>
          <capsuleGeometry args={[0.12, 0.8, 8, 16]} />
          <meshStandardMaterial color={bodyColor} roughness={0.4} />
        </mesh>
        {/* Stars when hit */}
        {isHit && Array.from({ length: 5 }).map((_, i) => (
          <mesh key={i} position={[
            Math.sin(i * 1.2) * 0.8,
            1.8 + Math.cos(i * 0.8) * 0.3,
            Math.cos(i * 1.5) * 0.5,
          ]}>
            <octahedronGeometry args={[0.06]} />
            <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={2} />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

function HitParticles({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.5;
  });

  if (count === 0) return null;

  const particles = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) {
    particles[i] = (Math.random() - 0.5) * 3;
  }

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles, 3]}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#ff4444" transparent opacity={0.6} />
    </points>
  );
}

interface WreckBuddy3DProps {
  hitCount: number;
  onHit: () => void;
}

export default function WreckBuddy3D({ hitCount, onHit }: WreckBuddy3DProps) {
  return (
    <div className="w-full h-[400px] rounded-2xl overflow-hidden bg-gradient-to-b from-rose-950/30 to-background border border-border">
      <Canvas
        camera={{ position: [0, 1, 4], fov: 45 }}
        shadows
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <pointLight position={[-3, 2, 2]} intensity={0.5} color="#ff6b6b" />
        <BuddyDoll onClick={onHit} hitCount={hitCount} />
        <HitParticles count={Math.min(hitCount, 30)} />
        <Environment preset="sunset" />
        {/* Floor */}
        <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[3, 32]} />
          <meshStandardMaterial color="#1a1a2e" roughness={0.8} />
        </mesh>
      </Canvas>
    </div>
  );
}
