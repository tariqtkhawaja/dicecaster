import * as THREE from 'three';
import { DieType } from '@dicecaster/react';
import { DIE_CONFIGS, getSides } from './dieConfigs';

// ─── Single-face texture canvas ──────────────────────────────────────

export function createFaceTexture(dieType: DieType, faceValue: number): HTMLCanvasElement {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const colors = DIE_CONFIGS[dieType].colors;

  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 8;
  roundRect(ctx, 16, 16, size - 32, size - 32, 20);
  ctx.stroke();

  ctx.fillStyle = colors.text;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const fontSize = faceValue > 9 ? 140 : 180;
  ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
  ctx.fillText(String(faceValue), size / 2, size / 2);

  return canvas;
}

function roundRect(
  ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ─── Materials array from face textures ──────────────────────────────

export function createFaceMaterials(
  dieType: Exclude<DieType, 'D100'>,
  groupToValue: number[],
): THREE.MeshStandardMaterial[] {
  return groupToValue.map(value => {
    const canvas = createFaceTexture(dieType, value);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.4, metalness: 0.1 });
  });
}

// ─── Grouped geometries with face→value mappings ─────────────────────

/** D6: BoxGeometry has 6 groups. Map each group to a face value. */
export function buildGroupedD6Geo(): THREE.BufferGeometry {
  return new THREE.BoxGeometry(1.4, 1.4, 1.4);
}
export const D6_GROUP_TO_VALUE = [3, 4, 1, 6, 2, 5];

/** Merge co-planar triangles in a geometry into groups so each planar face
 *  is one group. Returns { geometry, groupCenters }. */
export function mergeCoplanarFaces(geometry: THREE.BufferGeometry): {
  geometry: THREE.BufferGeometry;
  groupCenters: THREE.Vector3[];
} {
  const index = geometry.getIndex()!;
  const pos = geometry.getAttribute('position');
  const triCount = index.count / 3;

  // Per-triangle data (using push to avoid noUncheckedIndexedAccess issues)
  const triNormals: THREE.Vector3[] = [];
  const triCenters: THREE.Vector3[] = [];
  const triVerts: number[][] = [];

  for (let t = 0; t < triCount; t++) {
    const ia = index.getX(t * 3);
    const ib = index.getX(t * 3 + 1);
    const ic = index.getX(t * 3 + 2);

    const pa = new THREE.Vector3(pos.getX(ia), pos.getY(ia), pos.getZ(ia));
    const pb = new THREE.Vector3(pos.getX(ib), pos.getY(ib), pos.getZ(ib));
    const pc = new THREE.Vector3(pos.getX(ic), pos.getY(ic), pos.getZ(ic));

    const v1 = new THREE.Vector3().subVectors(pb, pa);
    const v2 = new THREE.Vector3().subVectors(pc, pa);
    triNormals.push(new THREE.Vector3().crossVectors(v1, v2).normalize());
    triCenters.push(new THREE.Vector3().add(pa).add(pb).add(pc).divideScalar(3));
    triVerts.push([ia, ib, ic]);
  }

  // Union-find
  const parent: number[] = [];
  for (let i = 0; i < triCount; i++) parent.push(i);

  function find(x: number): number {
    let r = x;
    while (parent[r] !== r) r = parent[r]!;
    while (parent[x] !== r) {
      const px = parent[x]!;
      parent[x] = r;
      x = px;
    }
    return r;
  }

  function union(a: number, b: number) {
    const ra = find(a), rb = find(b);
    if (ra !== rb) parent[ra] = rb;
  }

  for (let i = 0; i < triCount; i++) {
    const vi = triVerts[i]!;
    const ni = triNormals[i]!;
    for (let j = i + 1; j < triCount; j++) {
      const vj = triVerts[j]!;
      const shared = vi.some(v => vj.includes(v));
      if (!shared) continue;
      if (ni.dot(triNormals[j]!) > 0.99) {
        union(i, j);
      }
    }
  }

  // Collect groups
  const groupMap = new Map<number, number[]>();
  for (let t = 0; t < triCount; t++) {
    const root = find(t);
    let g = groupMap.get(root);
    if (!g) { g = []; groupMap.set(root, g); }
    g.push(t);
  }

  const sortedGroups = Array.from(groupMap.values());
  const groupCenters: THREE.Vector3[] = [];

  // Rebuild index buffer with contiguous groups
  const newIndexArr: number[] = [];
  for (const tris of sortedGroups) {
    const center = new THREE.Vector3();
    for (const t of tris) {
      center.add(triCenters[t]!);
    }
    center.divideScalar(tris.length);
    groupCenters.push(center);

    for (const t of tris) {
      newIndexArr.push(index.getX(t * 3), index.getX(t * 3 + 1), index.getX(t * 3 + 2));
    }
  }

  geometry.clearGroups();
  geometry.setIndex(newIndexArr);

  let idxOffset = 0;
  for (let gi = 0; gi < sortedGroups.length; gi++) {
    const g = sortedGroups[gi]!;
    geometry.addGroup(idxOffset, g.length * 3, gi);
    idxOffset += g.length * 3;
  }

  return { geometry, groupCenters };
}

/** Build grouped geometry + face→value mapping for platonic solid dice. */
export function buildGroupedPlatonicWithMapping(
  dieType: 'D4' | 'D8' | 'D12' | 'D20',
): { geometry: THREE.BufferGeometry; groupToValue: number[] } {
  let baseGeo: THREE.BufferGeometry;
  switch (dieType) {
    case 'D4': baseGeo = new THREE.TetrahedronGeometry(1, 0); break;
    case 'D8': baseGeo = new THREE.OctahedronGeometry(1, 0); break;
    case 'D12': baseGeo = new THREE.DodecahedronGeometry(1, 0); break;
    case 'D20': baseGeo = new THREE.IcosahedronGeometry(1, 0); break;
  }

  const { geometry, groupCenters } = mergeCoplanarFaces(baseGeo);
  const numGroups = groupCenters.length;
  const sides = getSides(dieType);

  if (numGroups !== sides) {
    console.warn(`${dieType}: expected ${sides} faces, got ${numGroups} groups`);
  }

  // Sort faces by Y descending (topmost first)
  const indexed: { index: number; dotY: number }[] = [];
  for (let i = 0; i < numGroups; i++) {
    indexed.push({ index: i, dotY: groupCenters[i]!.y });
  }
  indexed.sort((a, b) => b.dotY - a.dotY);

  // Assign values: top = 1, bottom = sides, middle pairs sum to sides+1
  const groupToValue: number[] = [];
  for (let i = 0; i < numGroups; i++) groupToValue.push(0);

  const topEntry = indexed[0]!;
  const bottomEntry = indexed[numGroups - 1]!;
  groupToValue[topEntry.index] = 1;
  groupToValue[bottomEntry.index] = sides;

  const remaining = indexed.slice(1, numGroups - 1);
  for (let i = 0; i < remaining.length; i++) {
    const val = i + 2;
    const rItem = remaining[i]!;
    if (groupToValue[rItem.index] === 0) {
      groupToValue[rItem.index] = val;
    }
    const mirrorI = remaining.length - 1 - i;
    if (mirrorI !== i) {
      const mItem = remaining[mirrorI]!;
      if (groupToValue[mItem.index] === 0) {
        groupToValue[mItem.index] = sides + 1 - val;
      }
    }
  }

  // Fill any remaining zeros (e.g., odd-numbered solids like D4)
  const usedValues = new Set(groupToValue.filter(v => v !== 0));
  for (let i = 0; i < groupToValue.length; i++) {
    if (groupToValue[i] === 0) {
      for (let v = 1; v <= sides; v++) {
        if (!usedValues.has(v)) {
          groupToValue[i] = v;
          usedValues.add(v);
          break;
        }
      }
    }
  }

  return { geometry, groupToValue };
}
