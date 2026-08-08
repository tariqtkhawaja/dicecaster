import * as THREE from 'three';

// Build a pentagonal trapezohedron geometry for D10.
export function buildD10Geometry(): THREE.BufferGeometry {
  const vertices = new Float32Array([
    // Top apex (0)
    0, 1.2, 0,
    // Bottom apex (1)
    0, -1.2, 0,
    // Upper ring (2-6), wider
    0.7, 0.3, 0,
    0.21, 0.3, 0.67,
    -0.54, 0.3, 0.41,
    -0.54, 0.3, -0.41,
    0.21, 0.3, -0.67,
    // Lower ring (7-11), narrower, offset by π/5
    0.31, -0.3, 0.56,
    -0.39, -0.3, 0.39,
    -0.39, -0.3, -0.39,
    0.31, -0.3, -0.56,
    0.56, -0.3, 0,
  ]);

  const indices = [
    // Upper faces (top apex → upper ring edges)
    0, 2, 3,
    0, 3, 4,
    0, 4, 5,
    0, 5, 6,
    0, 6, 2,
    // Lower faces (bottom apex → lower ring edges)
    1, 8, 7,
    1, 9, 8,
    1, 10, 9,
    1, 11, 10,
    1, 7, 11,
    // Side bridges (upper ↔ lower ring)
    2, 7, 8,
    2, 8, 3,
    3, 8, 9,
    3, 9, 4,
    4, 9, 10,
    4, 10, 5,
    5, 10, 11,
    5, 11, 6,
    6, 11, 7,
    6, 7, 2,
  ];

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}
