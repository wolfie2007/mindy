/**
 * 3D Spherical Vector Eye Engine for Mindy Mascot.
 *
 * 1. Eyes lean `\\` (-10.5 deg off vertical by default) for a soulful, intelligent gaze.
 * 2. Exact closed-path SVG cubic Bézier capsule generators with smooth blinking.
 * 3. 3D Spherical Geodesic Projection with balanced ocular centering and depth foreshortening.
 * 4. Expressions: capsule, thinking, happy, skeptical, wide, slit, hidden.
 */

export type MindyEyeState =
  | 'capsule'
  | 'happy'
  | 'skeptical'
  | 'wide'
  | 'slit'
  | 'thinking'
  | 'hidden';

export const MINDY_EYE_STATES = [
  'capsule',
  'happy',
  'wide',
  'skeptical',
  'slit',
  'thinking',
  'hidden',
] as const satisfies readonly MindyEyeState[];

export interface EyeGeom {
  cx: number;
  cy: number;
  w: number;
  h: number;
  open: number;
  rot: number;
  opacity: number;
}

export interface SphericalEyeLayout {
  left: EyeGeom;
  right: EyeGeom;
  leftD: string;
  rightD: string;
  glintLeft: { cx: number; cy: number; r: number; opacity: number };
  glintRight: { cx: number; cy: number; r: number; opacity: number };
}

export const DEFAULT_EYE_LEAN = -10.5;

function fastRound(val: number): string {
  return val.toFixed(2);
}

/**
 * Generates an exact closed cubic Bézier SVG path string for a capsule/pill.
 */
export function getCapsulePath(
  cx: number,
  cy: number,
  w: number,
  h: number,
  open = 1.0,
  rotDeg = DEFAULT_EYE_LEAN,
): string {
  const effH = Math.max(2.0, h * Math.max(0.04, open));
  const r = Math.min(w / 2, effH / 2);
  const top = -effH / 2 + r;
  const bot = effH / 2 - r;
  const halfW = w / 2;
  const rad = (rotDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  function tr(lx: number, ly: number): string {
    const x = lx * cos - ly * sin;
    const y = lx * sin + ly * cos;
    return `${fastRound(cx + x)} ${fastRound(cy + y)}`;
  }

  const k = 0.5522847498 * r;

  let d = `M ${tr(-halfW, top)}`;
  d += ` C ${tr(-halfW, top - k)}, ${tr(-halfW + r - k, -effH / 2)}, ${tr(-halfW + r, -effH / 2)}`;
  d += ` L ${tr(halfW - r, -effH / 2)}`;
  d += ` C ${tr(halfW - r + k, -effH / 2)}, ${tr(halfW, top - k)}, ${tr(halfW, top)}`;
  d += ` L ${tr(halfW, bot)}`;
  d += ` C ${tr(halfW, bot + k)}, ${tr(halfW - r + k, effH / 2)}, ${tr(halfW - r, effH / 2)}`;
  d += ` L ${tr(-halfW + r, effH / 2)}`;
  d += ` C ${tr(-halfW + r - k, effH / 2)}, ${tr(-halfW, bot + k)}, ${tr(-halfW, bot)}`;
  d += ' Z';
  return d;
}

/**
 * Generates an inquisitive rounded squircle path for the left eye in Confused state.
 */
export function getSquirclePath(cx: number, cy: number, w: number, h: number, open = 1.0): string {
  const effH = Math.max(2.0, h * Math.max(0.04, open));
  const r = Math.min(8.0, effH / 2);
  const halfW = w / 2;
  const top = -effH / 2;
  const bot = effH / 2;

  return (
    `M ${fastRound(cx - halfW + r)} ${fastRound(cy + top)} ` +
    `L ${fastRound(cx + halfW - r)} ${fastRound(cy + top)} ` +
    `Q ${fastRound(cx + halfW)} ${fastRound(cy + top)} ${fastRound(cx + halfW)} ${fastRound(cy + top + r)} ` +
    `L ${fastRound(cx + halfW)} ${fastRound(cy + bot - r)} ` +
    `Q ${fastRound(cx + halfW)} ${fastRound(cy + bot)} ${fastRound(cx + halfW - r)} ${fastRound(cy + bot)} ` +
    `L ${fastRound(cx - halfW + r)} ${fastRound(cy + bot)} ` +
    `Q ${fastRound(cx - halfW)} ${fastRound(cy + bot)} ${fastRound(cx - halfW)} ${fastRound(cy + bot - r)} ` +
    `L ${fastRound(cx - halfW)} ${fastRound(cy + top + r)} ` +
    `Q ${fastRound(cx - halfW)} ${fastRound(cy + top)} ${fastRound(cx - halfW + r)} ${fastRound(cy + top)} Z`
  );
}

/**
 * Generates Happy Smiling Crescents (^ ^).
 */
export function getHappyLeftCrescent(cx: number, cy: number, open = 1.0): string {
  const w = 24;
  const h = 14 * Math.max(0.12, open);
  return (
    `M ${fastRound(cx - w * 0.5)} ${fastRound(cy + h * 0.25)} ` +
    `C ${fastRound(cx - w * 0.28)} ${fastRound(cy - h * 0.95)}, ${fastRound(cx + w * 0.28)} ${fastRound(cy - h * 0.95)}, ${fastRound(cx + w * 0.5)} ${fastRound(cy + h * 0.1)} ` +
    `C ${fastRound(cx + w * 0.2)} ${fastRound(cy - h * 0.25)}, ${fastRound(cx - w * 0.2)} ${fastRound(cy - h * 0.25)}, ${fastRound(cx - w * 0.5)} ${fastRound(cy + h * 0.25)} Z`
  );
}

export function getHappyRightCrescent(cx: number, cy: number, open = 1.0): string {
  const w = 22;
  const h = 13 * Math.max(0.12, open);
  return (
    `M ${fastRound(cx - w * 0.5)} ${fastRound(cy + h * 0.1)} ` +
    `C ${fastRound(cx - w * 0.28)} ${fastRound(cy - h * 0.95)}, ${fastRound(cx + w * 0.28)} ${fastRound(cy - h * 0.95)}, ${fastRound(cx + w * 0.5)} ${fastRound(cy + h * 0.25)} ` +
    `C ${fastRound(cx + w * 0.2)} ${fastRound(cy - h * 0.25)}, ${fastRound(cx - w * 0.2)} ${fastRound(cy - h * 0.25)}, ${fastRound(cx - w * 0.5)} ${fastRound(cy + h * 0.1)} Z`
  );
}

/**
 * Computes 3D spherical geodesic projection and produces exact SVG path strings and glints.
 */
export function computeSphericalEyeLayout(
  gazeX: number,
  gazeY: number,
  state: MindyEyeState = 'capsule',
  blinkOpen = 1.0,
  customLean?: number,
): SphericalEyeLayout {
  const gx = Math.max(-1, Math.min(1, gazeX));
  const gy = Math.max(-1, Math.min(1, gazeY));

  const sphereR = 56;
  const baseTheta = 0.04;
  const basePhi = -0.04;

  const theta = baseTheta + gx * 0.52;
  const phi = basePhi + gy * 0.42;

  const eyeSep = 0.21;
  const thetaL = theta - eyeSep;
  const thetaR = theta + eyeSep;

  const cxL = 100 + sphereR * Math.sin(thetaL) * Math.cos(phi);
  const cyL = 110 + sphereR * Math.sin(phi);

  const cxR = 100 + sphereR * Math.sin(thetaR) * Math.cos(phi);
  const cyR = 110 + sphereR * Math.sin(phi);

  const baseCosL = Math.cos(baseTheta - eyeSep);
  const baseCosR = Math.cos(baseTheta + eyeSep);
  const cosL = Math.max(0.1, Math.cos(thetaL));
  const cosR = Math.max(0.1, Math.cos(thetaR));

  const perspL = Math.max(0.65, Math.min(1.2, cosL / baseCosL));
  const perspR = Math.max(0.65, Math.min(1.2, cosR / baseCosR));

  const baseRot = customLean ?? DEFAULT_EYE_LEAN;
  const glintOp = Math.max(0, Math.min(0.9, (blinkOpen - 0.2) * 1.12));

  if (state === 'hidden') {
    return {
      left: { cx: cxL, cy: cyL, w: 0, h: 0, open: 0, rot: 0, opacity: 0 },
      right: { cx: cxR, cy: cyR, w: 0, h: 0, open: 0, rot: 0, opacity: 0 },
      leftD: '',
      rightD: '',
      glintLeft: { cx: cxL, cy: cyL, r: 0, opacity: 0 },
      glintRight: { cx: cxR, cy: cyR, r: 0, opacity: 0 },
    };
  }

  if (state === 'happy') {
    return {
      left: { cx: cxL, cy: cyL, w: 24, h: 14, open: blinkOpen, rot: 0, opacity: 1 },
      right: { cx: cxR, cy: cyR, w: 22, h: 13, open: blinkOpen, rot: 0, opacity: 1 },
      leftD: getHappyLeftCrescent(cxL, cyL + 3, blinkOpen),
      rightD: getHappyRightCrescent(cxR, cyR + 3, blinkOpen),
      glintLeft: { cx: cxL, cy: cyL, r: 0, opacity: 0 },
      glintRight: { cx: cxR, cy: cyR, r: 0, opacity: 0 },
    };
  }

  if (state === 'wide') {
    const wL = 20 * perspL;
    const hL = 40 * (0.96 + 0.04 * perspL);
    const wR = 17 * perspR;
    const hR = 37 * (0.96 + 0.04 * perspR);
    return {
      left: { cx: cxL, cy: cyL, w: wL, h: hL, open: blinkOpen, rot: baseRot + 3, opacity: 1 },
      right: { cx: cxR, cy: cyR, w: wR, h: hR, open: blinkOpen, rot: baseRot + 3, opacity: 1 },
      leftD: getCapsulePath(cxL, cyL, wL, hL, blinkOpen, baseRot + 3),
      rightD: getCapsulePath(cxR, cyR, wR, hR, blinkOpen, baseRot + 3),
      glintLeft: { cx: cxL - 2.5, cy: cyL - 8, r: 2.8 * blinkOpen, opacity: glintOp },
      glintRight: { cx: cxR - 2.5, cy: cyR - 8, r: 2.8 * blinkOpen, opacity: glintOp },
    };
  }

  if (state === 'skeptical') {
    const wL = 22 * perspL;
    const hL = 21;
    const wR = 22 * perspR;
    const hR = 5.0;
    return {
      left: { cx: cxL, cy: cyL, w: wL, h: hL, open: blinkOpen, rot: -2, opacity: 1 },
      right: { cx: cxR, cy: cyR, w: wR, h: hR, open: blinkOpen, rot: 2, opacity: 1 },
      leftD: getSquirclePath(cxL, cyL, wL, hL, blinkOpen),
      rightD: getCapsulePath(cxR, cyR, wR, hR, blinkOpen, 2),
      glintLeft: { cx: cxL - 3.5, cy: cyL - 4, r: 2.4 * blinkOpen, opacity: glintOp },
      glintRight: { cx: cxR, cy: cyR, r: 0, opacity: 0 },
    };
  }

  if (state === 'slit') {
    const wL = 22 * perspL;
    const hL = 4.5;
    const wR = 22 * perspR;
    const hR = 4.5;
    return {
      left: { cx: cxL, cy: cyL, w: wL, h: hL, open: blinkOpen, rot: -2, opacity: 1 },
      right: { cx: cxR, cy: cyR, w: wR, h: hR, open: blinkOpen, rot: 2, opacity: 1 },
      leftD: getCapsulePath(cxL, cyL, wL, hL, blinkOpen, -2),
      rightD: getCapsulePath(cxR, cyR, wR, hR, blinkOpen, 2),
      glintLeft: { cx: cxL, cy: cyL, r: 0, opacity: 0 },
      glintRight: { cx: cxR, cy: cyR, r: 0, opacity: 0 },
    };
  }

  if (state === 'thinking') {
    const wL = 17 * perspL;
    const hL = 36;
    const wR = 15 * perspR;
    const hR = 33;
    return {
      left: { cx: cxL, cy: cyL - 6, w: wL, h: hL, open: blinkOpen, rot: baseRot + 2, opacity: 1 },
      right: { cx: cxR, cy: cyR - 6, w: wR, h: hR, open: blinkOpen, rot: baseRot + 2, opacity: 1 },
      leftD: getCapsulePath(cxL, cyL - 6, wL, hL, blinkOpen, baseRot + 2),
      rightD: getCapsulePath(cxR, cyR - 6, wR, hR, blinkOpen, baseRot + 2),
      glintLeft: { cx: cxL - 2.5, cy: cyL - 12, r: 2.2 * blinkOpen, opacity: glintOp },
      glintRight: { cx: cxR - 2.5, cy: cyR - 12, r: 2.2 * blinkOpen, opacity: glintOp },
    };
  }

  const wL = 17 * perspL;
  const hL = 38;
  const wR = 15 * perspR;
  const hR = 35;
  return {
    left: { cx: cxL, cy: cyL, w: wL, h: hL, open: blinkOpen, rot: baseRot, opacity: 1 },
    right: { cx: cxR, cy: cyR, w: wR, h: hR, open: blinkOpen, rot: baseRot, opacity: 1 },
    leftD: getCapsulePath(cxL, cyL, wL, hL, blinkOpen, baseRot),
    rightD: getCapsulePath(cxR, cyR, wR, hR, blinkOpen, baseRot),
    glintLeft: { cx: cxL - 2.5, cy: cyL - 8, r: 2.5 * blinkOpen, opacity: glintOp },
    glintRight: { cx: cxR - 2.5, cy: cyR - 8, r: 2.5 * blinkOpen, opacity: glintOp },
  };
}
