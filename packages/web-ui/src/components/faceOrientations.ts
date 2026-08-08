import * as THREE from 'three';
import { DieType } from '@dicecaster/react';
import { getSides } from './dieConfigs';
import { buildGroupedD6Geo, D6_GROUP_TO_VALUE } from './multiFaceTextures';

/** Face orientation: which local-space normal corresponds to each face value.
 *  Used by the settlement system to compute target quaternions. */
export interface FaceOrientation {
  value: number;
  normal: THREE.Vector3;
}

const cache = new Map<string, readonly FaceOrientation[]>();

export function getFaceOrientations(dieType: Exclude<DieType, 'D100'>): readonly FaceOrientation[] {
  if (cache.has(dieType)) return cache.get(dieType)!;
  const orientations = buildOrientations(dieType);
  cache.set(dieType, orientations);
  return orientations;
}

function buildOrientations(dieType: Exclude<DieType, 'D100'>): readonly FaceOrientation[] {
  switch (dieType) {
    case 'D6': return buildD6Orientations();
    case 'D4': return buildPlatonicOrientations(new THREE.TetrahedronGeometry(1, 0), 4);
    case 'D8': return buildPlatonicOrientations(new THREE.OctahedronGeometry(1, 0), 8);
    case 'D12': return buildPlatonicOrientations(new THREE.DodecahedronGeometry(1, 0), 12);
    case 'D20': return buildPlatonicOrientations(new THREE.IcosahedronGeometry(1, 0), 20);
    case 'D10': return buildD10Orientations();
  }
}

/** D6: analytically known normals mapped to values. */
function buildD6Orientations(): readonly FaceOrientation[] {
  // BoxGeometry groups: +Z(0)=val3, -Z(1)=val4, +Y(2)=val1, -Y(3)=val6, +X(4)=val2, -X(5)=val5
  return [
    { value: 1, normal: new THREE.Vector3(0, 1, 0) },     // top (+Y)
    { value: 2, normal: new THREE.Vector3(1, 0, 0) },     // right (+X)
    { value: 3, normal: new THREE.Vector3(0, 0, 1) },     // front (+Z)
    { value: 4, normal: new THREE.Vector3(0, 0, -1) },    // back (-Z)
    { value: 5, normal: new THREE.Vector3(-1, 0, 0) },    // left (-X)
    { value: 6, normal: new THREE.Vector3(0, -1, 0) },    // bottom (-Y)
  ];
}

/** Build orientations for a platonic solid by extracting face normals from geometry.
 *  Values are assigned top-down (highest Y = 1). */
function buildPlatonicOrientations(
  baseGeo: THREE.BufferGeometry,
  sides: number,
): readonly FaceOrientation[] {
  const pos = baseGeo.getAttribute('position');
  const index = baseGeo.getIndex();
  if (!index) throw new Error('requires indexed geometry');

  const triCount = index.count / 3;
  const faceNormals = new Map<string, { normal: THREE.Vector3; count: number }>();

  for (let t = 0; t < triCount; t++) {
    const ia = index.getX(t * 3);
    const ib = index.getX(t * 3 + 1);
    const ic = index.getX(t * 3 + 2);

    const pa = new THREE.Vector3(pos.getX(ia), pos.getY(ia), pos.getZ(ia));
    const pb = new THREE.Vector3(pos.getX(ib), pos.getY(ib), pos.getZ(ib));
    const pc = new THREE.Vector3(pos.getX(ic), pos.getY(ic), pos.getZ(ic));

    const v1 = new THREE.Vector3().subVectors(pb, pa);
    const v2 = new THREE.Vector3().subVectors(pc, pa);
    const n = new THREE.Vector3().crossVectors(v1, v2).normalize();

    // Key by rounded normal components to group co-planar triangles
    const key = `${n.x.toFixed(4)},${n.y.toFixed(4)},${n.z.toFixed(4)}`;
    const existing = faceNormals.get(key);
    if (existing) {
      existing.count++;
    } else {
      faceNormals.set(key, { normal: n.clone(), count: 1 });
    }
  }

  const uniqueNormals = Array.from(faceNormals.values())
    .sort((a, b) => b.normal.y - a.normal.y); // sort by Y descending

  if (uniqueNormals.length !== sides) {
    console.warn(`${sides}-sided die: expected ${sides} faces, got ${uniqueNormals.length}`);
  }

  return uniqueNormals.map((f, i) => ({
    value: i + 1,
    normal: f.normal,
  }));
}

/** D10: derive face normals from the custom geometry. */
function buildD10Orientations(): readonly FaceOrientation[] {
  // Inline the d10 vertex data to avoid import issues
  const vertices = [
    // Top apex (0)
    0, 1.2, 0,
    // Bottom apex (1)
    0, -1.2, 0,
    // Upper ring (2-6)
    0.7, 0.3, 0,
    0.21, 0.3, 0.67,
    -0.54, 0.3, 0.41,
    -0.54, 0.3, -0.41,
    0.21, 0.3, -0.67,
    // Lower ring (7-11)
    0.31, -0.3, 0.56,
    -0.39, -0.3, 0.39,
    -0.39, -0.3, -0.39,
    0.31, -0.3, -0.56,
    0.56, -0.3, 0,
  ];

  const indices = [
    0, 2, 3, 0, 3, 4, 0, 4, 5, 0, 5, 6, 0, 6, 2,
    1, 8, 7, 1, 9, 8, 1, 10, 9, 1, 11, 10, 1, 7, 11,
    2, 7, 8, 2, 8, 3, 3, 8, 9, 3, 9, 4, 4, 9, 10,
    4, 10, 5, 5, 10, 11, 5, 11, 6, 6, 11, 7, 6, 7, 2,
  ];

  const vec = (i: number) => new THREE.Vector3(vertices[i * 3]!, vertices[i * 3 + 1]!, vertices[i * 3 + 2]!);

  // Compute per-triangle normals, then merge co-planar ones
  const faceNormals = new Map<string, THREE.Vector3>();
  for (let t = 0; t < indices.length / 3; t++) {
    const pa = vec(indices[t * 3]!);
    const pb = vec(indices[t * 3 + 1]!);
    const pc = vec(indices[t * 3 + 2]!);
    const n = new THREE.Vector3()
      .crossVectors(
        new THREE.Vector3().subVectors(pb, pa),
        new THREE.Vector3().subVectors(pc, pa),
      ).normalize();
    const key = `${n.x.toFixed(3)},${n.y.toFixed(3)},${n.z.toFixed(3)}`;
    if (!faceNormals.has(key)) {
      faceNormals.set(key, n.clone());
    }
  }

  const normals = Array.from(faceNormals.values()).sort((a, b) => b.y - a.y);

  // D10 uses values 0-9
  return normals.map((n, i) => ({ value: i % 10, normal: n }));
}

/** Compute the target quaternion that orients a given face value to point up (+Y). */
export function getTargetQuaternion(
  dieType: Exclude<DieType, 'D100'>,
  faceValue: number,
): THREE.Quaternion {
  const orientations = getFaceOrientations(dieType);
  const face = orientations.find(f => f.value === faceValue);
  if (!face) {
    console.warn(`Unknown face value ${faceValue} for ${dieType}, defaulting to face 1`);
    const fallback = orientations[0]!;
    const q = new THREE.Quaternion().setFromUnitVectors(fallback.normal, new THREE.Vector3(0, 1, 0));
    return q;
  }

  const up = new THREE.Vector3(0, 1, 0);
  const q = new THREE.Quaternion().setFromUnitVectors(face.normal, up);

  // Random yaw around Y for natural variation
  const yaw = new THREE.Quaternion().setFromAxisAngle(up, Math.random() * Math.PI * 2);
  q.premultiply(yaw);

  return q;
}

/** Determine which face is currently pointing up for a given body rotation. */
export function getCurrentFace(
  dieType: Exclude<DieType, 'D100'>,
  rotation: THREE.Quaternion,
): number {
  const orientations = getFaceOrientations(dieType);
  const up = new THREE.Vector3(0, 1, 0);
  let maxDot = -Infinity;
  let topFace = orientations[0]!.value;

  for (const face of orientations) {
    const worldNormal = face.normal.clone().applyQuaternion(rotation);
    const dot = worldNormal.dot(up);
    if (dot > maxDot) {
      maxDot = dot;
      topFace = face.value;
    }
  }

  return topFace;
}
