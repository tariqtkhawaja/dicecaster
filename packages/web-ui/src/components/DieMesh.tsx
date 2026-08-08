import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import type { DieType } from '@dicecaster/react';
import type { RapierRigidBody } from '@react-three/rapier';
import { RigidBody } from '@react-three/rapier';
import { buildD10Geometry } from './d10Geometry';
import { getDieScale } from './dieConfigs';
import {
  createFaceMaterials,
  buildGroupedD6Geo,
  D6_GROUP_TO_VALUE,
  buildGroupedPlatonicWithMapping,
} from './multiFaceTextures';
import { getTargetQuaternion } from './faceOrientations';

// Ease-out cubic
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

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

  // Settlement animation state
  const settlingRef = useRef(false);
  const settleStartRef = useRef(0);
  const settleDuration = 400; // ms
  const currentQuatRef = useRef(new THREE.Quaternion());
  const targetQuatRef = useRef(new THREE.Quaternion());

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

  // ── Multi-face materials (one material per physical face) ──

  // D6: BoxGeometry has 6 groups, each mapped to a face value
  const d6Geo = useMemo(() => buildGroupedD6Geo(), []);
  const d6Materials = useMemo(
    () => createFaceMaterials('D6', D6_GROUP_TO_VALUE),
    [],
  );

  // Platonic solids: grouped geometry with per-face materials
  const d4Data = useMemo(() => buildGroupedPlatonicWithMapping('D4'), []);
  const d4Materials = useMemo(() => createFaceMaterials('D4', d4Data.groupToValue), [d4Data.groupToValue]);

  const d8Data = useMemo(() => buildGroupedPlatonicWithMapping('D8'), []);
  const d8Materials = useMemo(() => createFaceMaterials('D8', d8Data.groupToValue), [d8Data.groupToValue]);

  const d12Data = useMemo(() => buildGroupedPlatonicWithMapping('D12'), []);
  const d12Materials = useMemo(() => createFaceMaterials('D12', d12Data.groupToValue), [d12Data.groupToValue]);

  const d20Data = useMemo(() => buildGroupedPlatonicWithMapping('D20'), []);
  const d20Materials = useMemo(() => createFaceMaterials('D20', d20Data.groupToValue), [d20Data.groupToValue]);

  // Legacy single-texture material for D10 (multi-face TBD)
  const legacyTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    const cfg = { bg: '#a855f7', text: '#ffffff' };
    ctx.fillStyle = cfg.bg;
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 8;
    ctx.strokeRect(16, 16, 480, 480);
    ctx.fillStyle = cfg.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 140px system-ui, sans-serif';
    ctx.fillText(String(faceValue), 256, 256);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [faceValue]);

  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: legacyTexture, roughness: 0.4, metalness: 0.1 }),
    [legacyTexture],
  );

  // D100: split into tens and units dice
  const d100Tens = useMemo(() => {
    const val = faceValue % 100;
    return val === 0 ? 0 : Math.floor(val / 10) * 10;
  }, [faceValue]);

  const d100Units = useMemo(() => {
    const val = faceValue % 100;
    return val % 10;
  }, [faceValue]);

  const d100TensTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 8;
    ctx.strokeRect(16, 16, 480, 480);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 140px system-ui, sans-serif';
    ctx.fillText(String(d100Tens), 256, 256);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [d100Tens]);

  const d100UnitsTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 8;
    ctx.strokeRect(16, 16, 480, 480);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 140px system-ui, sans-serif';
    ctx.fillText(String(d100Units), 256, 256);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [d100Units]);

  const d100TensMat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: d100TensTexture, roughness: 0.4, metalness: 0.1 }),
    [d100TensTexture],
  );

  const d100UnitsMat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: d100UnitsTexture, roughness: 0.4, metalness: 0.1 }),
    [d100UnitsTexture],
  );

  // Handle sleep: start settlement animation
  const handleSleep = useMemo(() => {
    return () => {
      onSleep?.();

      if (settlingRef.current) return;
      if (dieType === 'D100') return; // Handled separately

      const body = rigidBodyRef.current;
      if (!body) return;

      // Compute target rotation for the predetermined face value
      const excludeDieType = dieType as Exclude<DieType, 'D100'>;
      const targetQ = getTargetQuaternion(excludeDieType, faceValue);

      // Capture current rotation
      const currentEuler = new THREE.Euler();
      body.linvel(); // no-op to check body is alive
      try {
        const angle = body.rotation();
        currentQuatRef.current.set(angle.x, angle.y, angle.z, angle.w);
      } catch {
        return; // Body may be destroyed
      }

      targetQuatRef.current.copy(targetQ);
      settleStartRef.current = performance.now();
      settlingRef.current = true;
    };
  }, [onSleep, dieType, faceValue]);

  // Settlement animation loop
  useFrame(() => {
    if (!settlingRef.current) return;
    if (!rigidBodyRef.current) return;

    const elapsed = performance.now() - settleStartRef.current;
    const t = Math.min(elapsed / settleDuration, 1);
    const eased = easeOutCubic(t);

    const slerped = new THREE.Quaternion().slerpQuaternions(
      currentQuatRef.current,
      targetQuatRef.current,
      eased,
    );

    try {
      rigidBodyRef.current.setRotation(slerped, false);
    } catch {
      settlingRef.current = false;
    }

    if (t >= 1) {
      settlingRef.current = false;
    }
  });

  return (
    <group position={startPos as [number, number, number]}>
      <RigidBody
        ref={rigidBodyRef}
        colliders="hull"
        restitution={0.5}
        friction={0.6}
        density={50}
        canSleep
        onSleep={handleSleep}
      >
        {dieType === 'D4' && (
          <group scale={scale}>
            <mesh geometry={d4Data.geometry} material={d4Materials as unknown as THREE.Material} />
          </group>
        )}
        {dieType === 'D6' && (
          <group scale={scale}>
            <mesh geometry={d6Geo} material={d6Materials as unknown as THREE.Material} />
          </group>
        )}
        {dieType === 'D8' && (
          <group scale={scale}>
            <mesh geometry={d8Data.geometry} material={d8Materials as unknown as THREE.Material} />
          </group>
        )}
        {dieType === 'D10' && (
          <mesh material={mat} geometry={d10Geo} scale={scale} />
        )}
        {dieType === 'D12' && (
          <group scale={scale}>
            <mesh geometry={d12Data.geometry} material={d12Materials as unknown as THREE.Material} />
          </group>
        )}
        {dieType === 'D20' && (
          <group scale={scale}>
            <mesh geometry={d20Data.geometry} material={d20Materials as unknown as THREE.Material} />
          </group>
        )}
        {dieType === 'D100' && (
          <>
            <mesh material={d100TensMat} geometry={d10Geo.clone()} position={[0.3, 0, 0]} scale={scale} />
            <mesh material={d100UnitsMat} geometry={d10Geo.clone()} position={[-0.3, 0, 0]} scale={scale} />
          </>
        )}
      </RigidBody>
    </group>
  );
}
