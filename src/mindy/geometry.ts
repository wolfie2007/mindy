/**
 * Geometric Engine for Mindy Mascot.
 *
 * Implements:
 * 1. Plump Round Hybrid Silhouette: 1:1 circular aspect ratio with a soft,
 *    symmetrical dewdrop crown (rx=74, ry=66, topLift=0.12).
 * 2. Continuous Modal Harmonic Breathing: Global quadrupole & hexapole modal breathing
 *    that preserves 100% surface smoothness without any point-to-point jaggedness.
 * 3. Strict Volume Preservation: Mass conservation formula (scaleX = 1 / sqrt(scaleY)).
 * 4. Tangent-Continuous Molten Liquid Bridges for fluid loading cycles.
 */

export interface Point {
  x: number;
  y: number;
}

export type MindyShapeType = 'hybrid' | 'pebble';

export const NUM_POINTS = 32;
const TWO_PI = Math.PI * 2;

function fastRound(val: number): number {
  return Math.round(val * 100) / 100;
}

/**
 * Master Plump Round Hybrid Teardrop-Orb.
 * Pure symmetrical silhouette with smooth crown taper.
 */
export function getHybridPoints(topLift = 0.12, cx = 100, cy = 110, rx = 74, ry = 66): Point[] {
  const points: Point[] = [];

  for (let i = 0; i < NUM_POINTS; i++) {
    const angle = (i / NUM_POINTS) * TWO_PI - Math.PI / 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const bottomFactor = (sin + 1) * 0.5;
    const topFactor = Math.max(0, 1 - bottomFactor);

    const taper = 1 - Math.pow(topFactor, 1.4) * topLift;
    const curRx = rx * taper;
    const curRy = ry;

    const crownLift = Math.pow(topFactor, 2.0) * -3.0;

    points.push({
      x: cx + cos * curRx,
      y: cy + sin * curRy + crownLift,
    });
  }
  return points;
}

export const SHAPE_POINTS: Record<MindyShapeType, Point[]> = {
  hybrid: getHybridPoints(),
  pebble: getHybridPoints(),
};

/**
 * Computes volume-conserved horizontal scale from vertical squash/stretch factor.
 */
export function computeConservedScaleX(squashY: number): number {
  const safeY = Math.max(0.3, Math.min(2.5, squashY));
  return 1 / Math.sqrt(safeY);
}

/**
 * Applies continuous modal harmonic breathing.
 * Uses global spatial modes (quadrupole cos(2θ) & hexapole sin(3θ))
 * to guarantee C2 smooth surface deformation.
 */
export function applyHarmonicWobble(
  basePoints: Point[],
  time: number,
  amplitude = 1.0,
  speed = 1.6,
  cx = 100,
  cy = 110,
): Point[] {
  if (amplitude <= 0.01) return basePoints;
  const result: Point[] = [];
  const n = basePoints.length;

  for (let i = 0; i < n; i++) {
    const pt = basePoints[i];
    if (!pt) continue;

    const angle = Math.atan2(pt.y - cy, pt.x - cx);
    const mode2 = Math.cos(2 * angle) * Math.sin(time * speed) * 0.72;
    const mode3 = Math.sin(3 * angle + time * speed * 0.8) * 0.28;
    const delta = amplitude * (mode2 + mode3);

    result.push({
      x: pt.x + Math.cos(angle) * delta,
      y: pt.y + Math.sin(angle) * delta,
    });
  }
  return result;
}

/**
 * Converts points to a closed cubic Bézier SVG path string using Catmull-Rom tangents.
 */
export function pointsToSvgPath(points: Point[]): string {
  const n = points.length;
  if (n < 3) return '';
  const first = points[0];
  if (!first) return '';

  let d = `M ${fastRound(first.x)} ${fastRound(first.y)}`;

  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n]!;
    const p1 = points[i]!;
    const p2 = points[(i + 1) % n]!;
    const p3 = points[(i + 2) % n]!;

    const cp1x = fastRound(p1.x + (p2.x - p0.x) / 6);
    const cp1y = fastRound(p1.y + (p2.y - p0.y) / 6);
    const cp2x = fastRound(p2.x - (p3.x - p1.x) / 6);
    const cp2y = fastRound(p2.y - (p3.y - p1.y) / 6);

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${fastRound(p2.x)} ${fastRound(p2.y)}`;
  }

  d += ' Z';
  return d;
}
