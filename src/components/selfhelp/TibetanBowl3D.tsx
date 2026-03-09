import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import * as THREE from "three";

interface BowlProps {
  phase: "inhale" | "hold" | "exhale" | "idle";
}

function SingingBowl({ phase }: BowlProps) {
  const bowlRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const ringsRef = useRef<THREE.Group>(null);

  const intensity = phase === "inhale" ? 1.3 : phase === "hold" ? 1.0 : phase === "exhale" ? 0.6 : 0.2;
  const targetScale = phase === "inhale" ? 1.1 : phase === "exhale" ? 0.95 : 1.0;

  useFrame((state, delta) => {
    if (!bowlRef.current || !glowRef.current) return;

    // Gentle rotation
    bowlRef.current.rotation.y += delta * (phase === "idle" ? 0.1 : 0.3);

    // Scale breathing
    const s = THREE.MathUtils.lerp(bowlRef.current.scale.x, targetScale, delta * 1.5);
    bowlRef.current.scale.set(s, s, s);

    // Glow pulsing
    const glowMat = glowRef.current.material as THREE.MeshStandardMaterial;
    glowMat.emissiveIntensity = THREE.MathUtils.lerp(
      glowMat.emissiveIntensity,
      intensity,
      delta * 2
    );

    // Vibration
    if (phase !== "idle" && bowlRef.current) {
      bowlRef.current.position.y = Math.sin(state.clock.elapsedTime * 8) * 0.01 * intensity;
    }

    // Ring animation
    if (ringsRef.current) {
      ringsRef.current.children.forEach((ring, i) => {
        const ringScale = phase !== "idle"
          ? 1 + Math.sin(state.clock.elapsedTime * 2 + i * 1.5) * 0.15 * intensity
          : 1;
        ring.scale.set(ringScale, ringScale, ringScale);
        (ring as THREE.Mesh).material = (ring as THREE.Mesh).material as THREE.MeshStandardMaterial;
        const mat = (ring as THREE.Mesh).material as THREE.MeshStandardMaterial;
        mat.opacity = phase !== "idle" ? 0.3 * intensity : 0.05;
      });
    }
  });

  const bowlColor = useMemo(() => {
    if (phase === "inhale") return "#8b5cf6";
    if (phase === "hold") return "#a78bfa";
    if (phase === "exhale") return "#6d28d9";
    return "#7c3aed";
  }, [phase]);

  return (
    <group ref={bowlRef}>
      {/* Bowl body - using lathe geometry for bowl shape */}
      <mesh castShadow>
        <latheGeometry args={[
          [
            new THREE.Vector2(0, 0),
            new THREE.Vector2(0.3, 0),
            new THREE.Vector2(0.8, 0.1),
            new THREE.Vector2(1.0, 0.3),
            new THREE.Vector2(1.05, 0.5),
            new THREE.Vector2(1.0, 0.7),
            new THREE.Vector2(0.95, 0.75),
            new THREE.Vector2(0.9, 0.7),
            new THREE.Vector2(0.85, 0.5),
            new THREE.Vector2(0.85, 0.3),
            new THREE.Vector2(0.7, 0.1),
          ],
          64,
        ]} />
        <meshStandardMaterial
          color={bowlColor}
          metalness={0.8}
          roughness={0.15}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Inner glow */}
      <mesh ref={glowRef} position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color="#a78bfa"
          emissive="#7c3aed"
          emissiveIntensity={0.2}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Sound wave rings */}
      <group ref={ringsRef}>
        {[1.2, 1.5, 1.8].map((radius, i) => (
          <mesh key={i} position={[0, 0.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[radius, 0.02, 8, 64]} />
            <meshStandardMaterial
              color="#a78bfa"
              transparent
              opacity={0.05}
              emissive="#7c3aed"
              emissiveIntensity={0.5}
            />
          </mesh>
        ))}
      </group>

      {/* Striker/Mallet */}
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
        <group position={[1.3, 0.8, 0]} rotation={[0, 0, -0.3]}>
          <mesh>
            <cylinderGeometry args={[0.04, 0.04, 0.8, 16]} />
            <meshStandardMaterial color="#8b4513" roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.45, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color="#654321" roughness={0.4} />
          </mesh>
        </group>
      </Float>
    </group>
  );
}

function FloatingParticles({ phase }: { phase: string }) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(200 * 3);
    for (let i = 0; i < 200 * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 6;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.05;
    const mat = ref.current.material as THREE.PointsMaterial;
    mat.opacity = phase !== "idle" ? 0.6 : 0.2;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={200} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#a78bfa" transparent opacity={0.2} />
    </points>
  );
}

interface TibetanBowl3DProps {
  phase: "inhale" | "hold" | "exhale" | "idle";
}

export default function TibetanBowl3D({ phase }: TibetanBowl3DProps) {
  return (
    <div className="w-full h-[350px] rounded-2xl overflow-hidden bg-gradient-to-b from-violet-950/30 to-background border border-border">
      <Canvas
        camera={{ position: [0, 2, 3.5], fov: 40 }}
        shadows
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[3, 5, 3]} intensity={0.8} castShadow />
        <pointLight position={[0, 2, 0]} intensity={phase !== "idle" ? 1.5 : 0.3} color="#7c3aed" />
        <SingingBowl phase={phase} />
        <FloatingParticles phase={phase} />
        <Environment preset="night" />
        {/* Floor */}
        <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[3, 32]} />
          <meshStandardMaterial color="#0f0a1e" roughness={0.9} />
        </mesh>
      </Canvas>
    </div>
  );
}
