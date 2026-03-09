import { useRef, useState } from "react";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import { Text, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

interface Quest {
  id: string;
  title: string;
  xp_reward: number;
}

interface CardProps {
  quest: Quest;
  isCompleted: boolean;
  onComplete: () => void;
  position: [number, number, number];
}

function QuestCard({ quest, isCompleted, onComplete, position }: CardProps) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.position.y = position[1] + Math.sin(t * 1.2 + position[0] * 2) * 0.05;
    // Subtle tilt on hover
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, hovered ? 0.15 : 0, 0.08);
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, hovered ? -0.05 : 0.05, 0.08);
  });

  const baseColor = isCompleted ? "#22c55e" : "#f59e0b";
  const bgColor = isCompleted ? "#14532d" : "#451a03";

  return (
    <group
      ref={ref}
      position={position}
      onPointerOver={() => { setHovered(true); document.body.style.cursor = isCompleted ? "default" : "pointer"; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = "default"; }}
      onClick={() => !isCompleted && onComplete()}
      scale={hovered && !isCompleted ? 1.06 : 1}
    >
      {/* Card body */}
      <RoundedBox args={[2, 2.6, 0.15]} radius={0.15} smoothness={4}>
        <meshStandardMaterial
          color={bgColor}
          roughness={0.6}
          metalness={0.1}
          transparent
          opacity={0.9}
        />
      </RoundedBox>

      {/* Top accent strip */}
      <mesh position={[0, 1.05, 0.08]}>
        <planeGeometry args={[1.7, 0.3]} />
        <meshBasicMaterial color={baseColor} transparent opacity={0.3} />
      </mesh>

      {/* Icon sphere */}
      <mesh position={[0, 0.5, 0.12]}>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshStandardMaterial color={baseColor} roughness={0.3} metalness={0.4} />
      </mesh>

      {/* Title */}
      <Text
        position={[0, -0.15, 0.09]}
        fontSize={0.18}
        maxWidth={1.6}
        textAlign="center"
        color="white"
        anchorY="top"
        font="https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2"
      >
        {quest.title.length > 40 ? quest.title.slice(0, 37) + "..." : quest.title}
      </Text>

      {/* XP badge */}
      <group position={[0, -0.9, 0.09]}>
        <RoundedBox args={[0.8, 0.3, 0.05]} radius={0.1} smoothness={2}>
          <meshStandardMaterial color={baseColor} roughness={0.4} metalness={0.2} transparent opacity={0.7} />
        </RoundedBox>
        <Text
          position={[0, 0, 0.04]}
          fontSize={0.13}
          color="white"
          font="https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2"
        >
          {isCompleted ? "✓ Done" : `+${quest.xp_reward} XP`}
        </Text>
      </group>
    </group>
  );
}

interface QuestCard3DProps {
  quests: Quest[];
  completedIds: string[];
  onComplete: (id: string) => void;
}

export default function QuestCard3D({ quests, completedIds, onComplete }: QuestCard3DProps) {
  const visibleQuests = quests.slice(0, 3);

  // Position cards side by side
  const positions: [number, number, number][] = visibleQuests.length === 1
    ? [[0, 0, 0]]
    : visibleQuests.length === 2
    ? [[-1.2, 0, 0], [1.2, 0, 0]]
    : [[-2.3, 0, 0], [0, 0, 0], [2.3, 0, 0]];

  return (
    <div className="w-full h-[220px] sm:h-[280px] rounded-2xl overflow-hidden bg-gradient-to-b from-amber-950/20 to-background border border-border/50">
      <Canvas camera={{ position: [0, 0, 6.5], fov: 40 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 5]} intensity={0.7} />
        <pointLight position={[-3, 2, 2]} intensity={0.3} color="#f59e0b" />
        {visibleQuests.map((quest, i) => (
          <QuestCard
            key={quest.id}
            quest={quest}
            isCompleted={completedIds.includes(quest.id)}
            onComplete={() => onComplete(quest.id)}
            position={positions[i] || [0, 0, 0]}
          />
        ))}
      </Canvas>
    </div>
  );
}
