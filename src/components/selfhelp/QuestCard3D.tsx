import { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text, Float, Environment } from "@react-three/drei";
import * as THREE from "three";

interface Card3DProps {
  title: string;
  xp: number;
  isCompleted: boolean;
  onComplete: () => void;
  index: number;
}

function FlipCard({ title, xp, isCompleted, onComplete, index }: Card3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [flipping, setFlipping] = useState(false);
  const targetRotation = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    if (flipping) {
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        targetRotation.current,
        delta * 4
      );
      if (Math.abs(meshRef.current.rotation.y - targetRotation.current) < 0.01) {
        setFlipping(false);
      }
    }
  });

  const handleClick = () => {
    if (isCompleted || flipping) return;
    setFlipping(true);
    targetRotation.current = Math.PI;
    setTimeout(() => onComplete(), 400);
  };

  const frontColor = isCompleted ? "#22c55e" : "#f59e0b";
  const backColor = "#22c55e";

  return (
    <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.1}>
      <group position={[(index - 1) * 2.2, 0, 0]}>
        <mesh
          ref={meshRef}
          onClick={handleClick}
          castShadow
          rotation={[0, isCompleted ? Math.PI : 0, 0]}
        >
          <boxGeometry args={[1.6, 2.2, 0.05]} />
          <meshStandardMaterial color={frontColor} roughness={0.3} metalness={0.2} />
        </mesh>

        {/* Front text */}
        {!isCompleted && (
          <group position={[0, 0, 0.03]} rotation={[0, isCompleted ? Math.PI : 0, 0]}>
            <Text
              position={[0, 0.4, 0]}
              fontSize={0.15}
              color="#ffffff"
              maxWidth={1.3}
              textAlign="center"
              anchorY="middle"
              font={undefined}
            >
              {title.slice(0, 30)}
            </Text>
            <Text
              position={[0, -0.5, 0]}
              fontSize={0.2}
              color="#ffffff"
              font={undefined}
            >
              +{xp} XP
            </Text>
            {/* Award icon stand-in */}
            <mesh position={[0, -0.1, 0]}>
              <octahedronGeometry args={[0.15]} />
              <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.5} />
            </mesh>
          </group>
        )}

        {/* Back face - completed */}
        <group position={[0, 0, -0.03]} rotation={[0, Math.PI, 0]}>
          <mesh>
            <planeGeometry args={[1.6, 2.2]} />
            <meshStandardMaterial color={backColor} roughness={0.3} />
          </mesh>
          <Text
            position={[0, 0.2, 0.01]}
            fontSize={0.25}
            color="#ffffff"
            font={undefined}
          >
            ✓ Done!
          </Text>
          <Text
            position={[0, -0.3, 0.01]}
            fontSize={0.15}
            color="#ffffff"
            font={undefined}
          >
            +{xp} XP earned
          </Text>
        </group>

        {/* Completion particles */}
        {isCompleted && <CompletionParticles />}
      </group>
    </Float>
  );
}

function CompletionParticles() {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(50 * 3);
    for (let i = 0; i < 50 * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 2;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.5;
    ref.current.children.forEach?.((_, i) => {});
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={50} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#ffd700" transparent opacity={0.8} />
    </points>
  );
}

interface QuestCard3DProps {
  quests: Array<{ id: string; title: string; xp_reward: number }>;
  completedIds: string[];
  onComplete: (id: string) => void;
}

export default function QuestCard3D({ quests, completedIds, onComplete }: QuestCard3DProps) {
  // Show up to 3 cards at a time
  const visibleQuests = quests.slice(0, 3);

  return (
    <div className="w-full h-[300px] rounded-2xl overflow-hidden bg-gradient-to-b from-amber-950/20 to-background border border-border">
      <Canvas
        camera={{ position: [0, 0.5, 5], fov: 45 }}
        shadows
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 5, 5]} intensity={0.8} castShadow />
        <pointLight position={[0, 2, 2]} intensity={0.5} color="#f59e0b" />
        {visibleQuests.map((quest, i) => (
          <FlipCard
            key={quest.id}
            title={quest.title}
            xp={quest.xp_reward}
            isCompleted={completedIds.includes(quest.id)}
            onComplete={() => onComplete(quest.id)}
            index={i}
          />
        ))}
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
