import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';
import type { DieType } from '@dicecaster/react';
import { DieMesh } from './DieMesh';
import { getSides } from './dieConfigs';

interface DiceSceneProps {
  dieType: DieType;
  count: number;
  dieValues: number[];
  startedAt: number;
  onSettled: () => void;
}

// Floor + arena walls inside the physics world
function Arena() {
  return (
    <>
      <RigidBody type="fixed" position={[0, -0.5, 0]}>
        <CuboidCollider args={[6, 0.5, 6]} />
      </RigidBody>
      <RigidBody type="fixed" position={[0, 2, -6]}>
        <CuboidCollider args={[12, 4, 0.5]} />
      </RigidBody>
      <RigidBody type="fixed" position={[0, 2, 6]}>
        <CuboidCollider args={[12, 4, 0.5]} />
      </RigidBody>
      <RigidBody type="fixed" position={[-6, 2, 0]}>
        <CuboidCollider args={[0.5, 4, 12]} />
      </RigidBody>
      <RigidBody type="fixed" position={[6, 2, 0]}>
        <CuboidCollider args={[0.5, 4, 12]} />
      </RigidBody>
    </>
  );
}

function CameraSetup() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 8, 6);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
  }, [camera]);
  return null;
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.4} color="#404040" />
      <directionalLight position={[5, 8, 3]} intensity={1.2} />
      <directionalLight position={[-3, 4, -2]} intensity={0.4} />
    </>
  );
}

// Counts sleeping dice and triggers settled when all are asleep, with 5s fallback
function useSettleDetection(count: number, startedAt: number, onSettled: () => void) {
  const asleepCount = useRef(0);
  const settledRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset on new roll
  useEffect(() => {
    asleepCount.current = 0;
    settledRef.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!settledRef.current) {
        settledRef.current = true;
        onSettled();
      }
    }, 5000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [startedAt, onSettled]);

  const handleDieSleep = useCallback(() => {
    if (settledRef.current) return;
    asleepCount.current += 1;
    if (asleepCount.current >= count) {
      settledRef.current = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      onSettled();
    }
  }, [count, onSettled]);

  return handleDieSleep;
}

function SceneContent({ dieType, count, dieValues, startedAt, onSettled }: DiceSceneProps & { onSettled: () => void }) {
  const handleDieSleep = useSettleDetection(count, startedAt, onSettled);

  return (
    <>
      <CameraSetup />
      <Lights />
      <Physics gravity={[0, -9.81, 0]} key={`physics-${startedAt}`}>
        <Arena />
        {Array.from({ length: count }, (_, i) => (
          <DieMesh
            key={`${i}-${startedAt}`}
            dieType={dieType}
            faceValue={dieValues[i] ?? Math.ceil(Math.random() * getSides(dieType))}
            index={i}
            totalDice={count}
            onSleep={handleDieSleep}
          />
        ))}
      </Physics>
    </>
  );
}

export function DiceScene(props: DiceSceneProps) {
  return (
    <Canvas
      style={{ width: '100%', height: '100%' }}
      camera={{ fov: 50, near: 0.1, far: 100 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true }}
    >
      <SceneContent {...props} />
    </Canvas>
  );
}
