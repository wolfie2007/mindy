export interface Point {
  x: number;
  y: number;
}

const NUM_POINTS = 32;
const TWO_PI = Math.PI * 2;

function round2(val: number): number {
  return Math.round(val * 100) / 100;
}

/**
 * Generates Mindy's base teardrop-orb silhouette around (cx, cy).
 */
export function getHybridPoints(
  topLift = 0.12,
  cx = 100,
  cy = 110,
  rx = 74,
  ry = 66,
): Point[] {
  const points: Point[] = [];

  for (let i = 0; i < NUM_POINTS; i++) {
    const angle = (i / NUM_POINTS) * TWO_PI - Math.PI / 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const bottomFactor = (sin + 1) * 0.5;
    const topFactor = Math.max(0, 1 - bottomFactor);
    const taper = 1 - Math.pow(topFactor, 1.4) * topLift;
    const crownLift = Math.pow(topFactor, 2.0) * -3.0;

    points.push({
      x: cx + cos * (rx * taper),
      y: cy + sin * ry + crownLift,
    });
  }

  return points;
}

export const BASE_BODY_POINTS = getHybridPoints();

/**
 * Keeps apparent body volume constant during vertical squash and stretch.
 */
export function computeConservedScaleX(squashY: number): number {
  const safeY = Math.max(0.3, Math.min(2.5, squashY));
  return 1 / Math.sqrt(safeY);
}

/**
 * Smooth modal breathing using low-frequency cos(2θ) and sin(3θ) harmonics.
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

  return basePoints.map((pt) => {
    const angle = Math.atan2(pt.y - cy, pt.x - cx);
    const mode2 = Math.cos(2 * angle) * Math.sin(time * speed) * 0.72;
    const mode3 = Math.sin(3 * angle + time * speed * 0.8) * 0.28;
    const delta = amplitude * (mode2 + mode3);

    return {
      x: pt.x + Math.cos(angle) * delta,
      y: pt.y + Math.sin(angle) * delta,
    };
  });
}

/**
 * Converts closed polygon points into a smooth Catmull-Rom cubic Bezier SVG path.
 */
export function pointsToSvgPath(points: Point[]): string {
  const n = points.length;
  const first = points[0];
  if (n < 3 || !first) return '';

  let d = `M ${round2(first.x)} ${round2(first.y)}`;

  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n]!;
    const p1 = points[i]!;
    const p2 = points[(i + 1) % n]!;
    const p3 = points[(i + 2) % n]!;

    const cp1x = round2(p1.x + (p2.x - p0.x) / 6);
    const cp1y = round2(p1.y + (p2.y - p0.y) / 6);
    const cp2x = round2(p2.x - (p3.x - p1.x) / 6);
    const cp2y = round2(p2.y - (p3.y - p1.y) / 6);

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${round2(p2.x)} ${round2(p2.y)}`;
  }

  return `${d} Z`;
}
