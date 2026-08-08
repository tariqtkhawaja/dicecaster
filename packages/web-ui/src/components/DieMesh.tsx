import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import type { DieType } from '@dicecaster/react';
import type { RapierRigidBody } from '@react-three/rapier';
import { RigidBody } from '@react-three/rapier';
import { RoundedBox } from '@react-three/drei';
import { createDieTexture } from './dieTextures';
import { buildD10Geometry } from './d10Geometry';
import { getDieScale } from './dieConfigs';

export function DieMesh({
  dieType, faceValue, index, totalDice, onSleep,
}: {
  dieType: DieType;
  faceValue: number;
  index: number;
  totalDice: number;
  onSleep?: () => void;
}) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);

  // Scatter dice across the arena
  const spread = Math.min(totalDice * 0.4, 3);
  const offsetX = (index % 3 - 1) * spread;
  const offsetZ = (Math.floor(index / 3) - Math.floor(totalDice / 6)) * spread;

  const startPos = useMemo(() => [
    offsetX + (Math.random() - 0.5) * 0.5,
    4 + Math.random() * 2,
    offsetZ + (Math.random() - 0.5) * 0.5,
  ], [offsetX, offsetZ]);

  const linvel = useMemo(() => ({
    x: (Math.random() - 0.5) * 5,
    y: 0,
    z: (Math.random() - 0.5) * 5,
  }), []);

  const angvel = useMemo(() => ({
    x: (Math.random() - 0.5) * 10,
    y: (Math.random() - 0.5) * 10,
    z: (Math.random() - 0.5) * 10,
  }), []);

  // Apply initial velocity on mount
  useEffect(() => {
    if (!rigidBodyRef.current) return;
    rigidBodyRef.current.setLinvel(linvel, true);
    rigidBodyRef.current.setAngvel(angvel, true);
  }, [linvel, angvel]);

  const scale = getDieScale(dieType);
  const d10Geo = useMemo(() => buildD10Geometry(), []);

  // Primary texture with face value
  const texture = useMemo(() => {
    const canvas = createDieTexture(dieType, faceValue);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [dieType, faceValue]);

  // Blue-tinted texture for D100 tens die
  const tensTexture = useMemo(() => {
    const canvas = createDieTexture('D10', faceValue);
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
    ctx.fillRect(0, 0, 512, 512);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [faceValue]);

  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: texture, roughness: 0.4, metalness: 0.1 }),
    [texture],
  );

  const tensMat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: tensTexture, roughness: 0.4, metalness: 0.1 }),
    [tensTexture],
  );

  return (
    <group position={startPos as [number, number, number]}>
      <RigidBody
        ref={rigidBodyRef}
        colliders="hull"
        restitution={0.5}
        friction={0.6}
        density={50}
        canSleep
        onSleep={onSleep}
      >
        {dieType === 'D4' && (
          <mesh material={mat}>
            <tetrahedronGeometry args={[scale, 0]} />
          </mesh>
        )}
        {dieType === 'D6' && (
          <mesh material={mat}>
            <RoundedBox args={[scale * 1.4, scale * 1.4, scale * 1.4]} radius={0.08} smoothness={4} />
          </mesh>
        )}
        {dieType === 'D8' && (
          <mesh material={mat}>
            <octahedronGeometry args={[scale, 0]} />
          </mesh>
        )}
        {dieType === 'D10' && (
          <mesh material={mat} geometry={d10Geo} />
        )}
        {dieType === 'D12' && (
          <mesh material={mat}>
            <dodecahedronGeometry args={[scale, 0]} />
          </mesh>
        )}
        {dieType === 'D20' && (
          <mesh material={mat}>
            <icosahedronGeometry args={[scale, 0]} />
          </mesh>
        )}
        {dieType === 'D100' && (
          <>
            <mesh material={mat} geometry={d10Geo.clone()} position={[0.3, 0, 0]} />
            <mesh material={tensMat} geometry={d10Geo.clone()} position={[-0.3, 0, 0]} />
          </>
        )}
      </RigidBody>
    </group>
  );
}
