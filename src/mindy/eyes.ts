export type MindyEyeState =
  | 'capsule'
  | 'happy'
  | 'wide'
  | 'wince'
  | 'skeptical'
  | 'slit'
  | 'thinking'
  | 'hidden';

export const MINDY_EYE_STATES = [
  'capsule',
  'happy',
  'wide',
  'wince',
  'skeptical',
  'slit',
  'thinking',
  'hidden',
] as const satisfies readonly MindyEyeState[];

export const DEFAULT_EYE_LEAN = -10.5;

export interface EyeGlint {
  cx: number;
  cy: number;
  r: number;
  opacity: number;
}

export interface SphericalEyeLayout {
  leftD: string;
  rightD: string;
  visible: boolean;
  glintLeft: EyeGlint;
  glintRight: EyeGlint;
}

function f(val: number): string {
  return val.toFixed(2);
}

/**
 * Closed cubic Bezier capsule path rotated around (cx, cy).
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
  const k = 0.5522847498 * r;

  const tr = (lx: number, ly: number) =>
    `${f(cx + lx * cos - ly * sin)} ${f(cy + lx * sin + ly * cos)}`;

  return (
    `M ${tr(-halfW, top)}` +
    ` C ${tr(-halfW, top - k)}, ${tr(-halfW + r - k, -effH / 2)}, ${tr(-halfW + r, -effH / 2)}` +
    ` L ${tr(halfW - r, -effH / 2)}` +
    ` C ${tr(halfW - r + k, -effH / 2)}, ${tr(halfW, top - k)}, ${tr(halfW, top)}` +
    ` L ${tr(halfW, bot)}` +
    ` C ${tr(halfW, bot + k)}, ${tr(halfW - r + k, effH / 2)}, ${tr(halfW - r, effH / 2)}` +
    ` L ${tr(-halfW + r, effH / 2)}` +
    ` C ${tr(-halfW + r - k, effH / 2)}, ${tr(-halfW, bot + k)}, ${tr(-halfW, bot)} Z`
  );
}

function getSquirclePath(cx: number, cy: number, w: number, h: number, open = 1.0): string {
  const effH = Math.max(2.0, h * Math.max(0.04, open));
  const r = Math.min(8.0, effH / 2);
  const halfW = w / 2;
  const top = -effH / 2;
  const bot = effH / 2;

  return (
    `M ${f(cx - halfW + r)} ${f(cy + top)} ` +
    `L ${f(cx + halfW - r)} ${f(cy + top)} ` +
    `Q ${f(cx + halfW)} ${f(cy + top)} ${f(cx + halfW)} ${f(cy + top + r)} ` +
    `L ${f(cx + halfW)} ${f(cy + bot - r)} ` +
    `Q ${f(cx + halfW)} ${f(cy + bot)} ${f(cx + halfW - r)} ${f(cy + bot)} ` +
    `L ${f(cx - halfW + r)} ${f(cy + bot)} ` +
    `Q ${f(cx - halfW)} ${f(cy + bot)} ${f(cx - halfW)} ${f(cy + bot - r)} ` +
    `L ${f(cx - halfW)} ${f(cy + top + r)} ` +
    `Q ${f(cx - halfW)} ${f(cy + top)} ${f(cx - halfW + r)} ${f(cy + top)} Z`
  );
}

function getHappyCrescent(cx: number, cy: number, w: number, hMax: number, open = 1.0, flip = false): string {
  const h = hMax * Math.max(0.12, open);
  const yStart = flip ? h * 0.1 : h * 0.25;
  const yEnd = flip ? h * 0.25 : h * 0.1;

  return (
    `M ${f(cx - w * 0.5)} ${f(cy + yStart)} ` +
    `C ${f(cx - w * 0.28)} ${f(cy - h * 0.95)}, ${f(cx + w * 0.28)} ${f(cy - h * 0.95)}, ${f(cx + w * 0.5)} ${f(cy + yEnd)} ` +
    `C ${f(cx + w * 0.2)} ${f(cy - h * 0.25)}, ${f(cx - w * 0.2)} ${f(cy - h * 0.25)}, ${f(cx - w * 0.5)} ${f(cy + yStart)} Z`
  );
}

/**
 * Generates a rounded geometric chevron ('>' when dir=1, '<' when dir=-1) for wincing eyes.
 */
function getWinceChevronPath(
  cx: number,
  cy: number,
  dir: 1 | -1,
  persp = 1.0,
  open = 1.0,
): string {
  const ax = -7.5 * persp;
  const bx = 7.5 * persp;
  const hh = 10.5 * Math.max(0.32, open);
  const t = 2.6;

  const dx = bx - ax;
  const dy = hh;
  const len = Math.hypot(dx, dy);
  const nx = dy / len;
  const ny = -dx / len;
  const tx = dx / len;
  const ty = dy / len;

  const p = (lx: number, ly: number) => `${f(cx + lx * dir)} ${f(cy + ly)}`;

  const topOuter = p(ax + nx * t, -hh + ny * t);
  const tipUpper = p(bx + nx * t, ny * t);
  const tipApex = p(bx + t * 1.45, 0);
  const tipLower = p(bx + nx * t, -ny * t);
  const botOuter = p(ax + nx * t, hh - ny * t);
  const botCapCtrl = p(ax - tx * t * 1.5, hh - ty * t * 1.5);
  const botInner = p(ax - nx * t, hh + ny * t);
  const innerApex = p(bx - t * 1.45, 0);
  const topInner = p(ax - nx * t, -hh - ny * t);
  const topCapCtrl = p(ax - tx * t * 1.5, -hh - ty * t * 1.5);

  return (
    `M ${topOuter} ` +
    `L ${tipUpper} ` +
    `Q ${tipApex} ${tipLower} ` +
    `L ${botOuter} ` +
    `Q ${botCapCtrl} ${botInner} ` +
    `L ${innerApex} ` +
    `L ${topInner} ` +
    `Q ${topCapCtrl} ${topOuter} Z`
  );
}

/**
 * Projects Mindy's eyes onto a 3D sphere centered at (100, 110) with foreshortening.
 */
export function computeSphericalEyeLayout(
  gazeX: number,
  gazeY: number,
  state: MindyEyeState = 'capsule',
  blinkOpen = 1.0,
  customLean?: number,
): SphericalEyeLayout {
  if (state === 'hidden') {
    return {
      leftD: '',
      rightD: '',
      visible: false,
      glintLeft: { cx: 100, cy: 110, r: 0, opacity: 0 },
      glintRight: { cx: 100, cy: 110, r: 0, opacity: 0 },
    };
  }

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

  const perspL = Math.max(0.65, Math.min(1.2, Math.max(0.1, Math.cos(thetaL)) / Math.cos(baseTheta - eyeSep)));
  const perspR = Math.max(0.65, Math.min(1.2, Math.max(0.1, Math.cos(thetaR)) / Math.cos(baseTheta + eyeSep)));

  const baseRot = customLean ?? DEFAULT_EYE_LEAN;
  const glintOp = Math.max(0, Math.min(0.92, (blinkOpen - 0.2) * 1.15));

  if (state === 'happy') {
    return {
      leftD: getHappyCrescent(cxL, cyL + 3, 24, 14, blinkOpen, false),
      rightD: getHappyCrescent(cxR, cyR + 3, 22, 13, blinkOpen, true),
      visible: true,
      glintLeft: { cx: cxL, cy: cyL, r: 0, opacity: 0 },
      glintRight: { cx: cxR, cy: cyR, r: 0, opacity: 0 },
    };
  }

  if (state === 'wince') {
    return {
      leftD: getWinceChevronPath(cxL - 1, cyL + 1, 1, perspL, blinkOpen),
      rightD: getWinceChevronPath(cxR + 1, cyR + 1, -1, perspR, blinkOpen),
      visible: true,
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
      leftD: getCapsulePath(cxL, cyL, wL, hL, blinkOpen, baseRot + 3),
      rightD: getCapsulePath(cxR, cyR, wR, hR, blinkOpen, baseRot + 3),
      visible: true,
      glintLeft: { cx: cxL - 2.5, cy: cyL - 8, r: 2.8 * blinkOpen, opacity: glintOp },
      glintRight: { cx: cxR - 2.5, cy: cyR - 8, r: 2.8 * blinkOpen, opacity: glintOp },
    };
  }

  if (state === 'skeptical') {
    const wL = 22 * perspL;
    const wR = 22 * perspR;

    return {
      leftD: getSquirclePath(cxL, cyL, wL, 21, blinkOpen),
      rightD: getCapsulePath(cxR, cyR, wR, 5.0, blinkOpen, 2),
      visible: true,
      glintLeft: { cx: cxL - 3.5, cy: cyL - 4, r: 2.4 * blinkOpen, opacity: glintOp },
      glintRight: { cx: cxR, cy: cyR, r: 0, opacity: 0 },
    };
  }

  if (state === 'slit') {
    const wL = 22 * perspL;
    const wR = 22 * perspR;

    return {
      leftD: getCapsulePath(cxL, cyL, wL, 4.8, blinkOpen, -4),
      rightD: getCapsulePath(cxR, cyR, wR, 4.8, blinkOpen, 4),
      visible: true,
      glintLeft: { cx: cxL, cy: cyL, r: 0, opacity: 0 },
      glintRight: { cx: cxR, cy: cyR, r: 0, opacity: 0 },
    };
  }

  if (state === 'thinking') {
    const wL = 17 * perspL;
    const wR = 15 * perspR;

    return {
      leftD: getCapsulePath(cxL, cyL - 6, wL, 36, blinkOpen, baseRot + 2),
      rightD: getCapsulePath(cxR, cyR - 6, wR, 33, blinkOpen, baseRot + 2),
      visible: true,
      glintLeft: { cx: cxL - 2.5, cy: cyL - 12, r: 2.2 * blinkOpen, opacity: glintOp },
      glintRight: { cx: cxR - 2.5, cy: cyR - 12, r: 2.2 * blinkOpen, opacity: glintOp },
    };
  }

  const wL = 17 * perspL;
  const wR = 15 * perspR;

  return {
    leftD: getCapsulePath(cxL, cyL, wL, 38, blinkOpen, baseRot),
    rightD: getCapsulePath(cxR, cyR, wR, 35, blinkOpen, baseRot),
    visible: true,
    glintLeft: { cx: cxL - 2.5, cy: cyL - 8, r: 2.5 * blinkOpen, opacity: glintOp },
    glintRight: { cx: cxR - 2.5, cy: cyR - 8, r: 2.5 * blinkOpen, opacity: glintOp },
  };
}
