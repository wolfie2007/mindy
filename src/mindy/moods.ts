/**
 * Mindy Mascot Mood Vocabulary, Shapes, Eye Mappings & Color Derivation.
 */

import { type MindyShapeType } from './geometry';
import { type MindyEyeState } from './eyes';
import { type RibbonMode } from './ribbons';

export type MindyMood =
  | 'idle'
  | 'thinking'
  | 'loading'
  | 'alert'
  | 'happy'
  | 'confused'
  | 'error'
  | 'excited';

export const MINDY_MOODS = [
  'idle',
  'thinking',
  'loading',
  'alert',
  'happy',
  'confused',
  'error',
  'excited',
] as const satisfies readonly MindyMood[];

export interface MoodConfig {
  shape: MindyShapeType;
  eyeState: MindyEyeState;
  ribbonMode: RibbonMode;
  bobAmp: number;
  swayDeg: number;
  wobAmp: number;
  wobSpeed: number;
  springStiffness: number;
  springDamping: number;
  squashX: number;
  squashY: number;
}

export const MOOD_CONFIGS: Record<MindyMood, MoodConfig> = {
  idle: {
    shape: 'hybrid',
    eyeState: 'capsule',
    ribbonMode: 'none',
    bobAmp: 3.5,
    swayDeg: 1.8,
    wobAmp: 1.0,
    wobSpeed: 1.8,
    springStiffness: 240,
    springDamping: 22,
    squashX: 1.0,
    squashY: 1.0,
  },
  thinking: {
    shape: 'hybrid',
    eyeState: 'thinking',
    ribbonMode: 'orbit',
    bobAmp: 2.8,
    swayDeg: 1.4,
    wobAmp: 1.4,
    wobSpeed: 2.4,
    springStiffness: 260,
    springDamping: 20,
    squashX: 0.97,
    squashY: 1.03,
  },
  loading: {
    shape: 'hybrid',
    eyeState: 'hidden',
    ribbonMode: 'none',
    bobAmp: 0,
    swayDeg: 0,
    wobAmp: 0,
    wobSpeed: 0,
    springStiffness: 340,
    springDamping: 18,
    squashX: 1.0,
    squashY: 1.0,
  },
  alert: {
    shape: 'hybrid',
    eyeState: 'wide',
    ribbonMode: 'none',
    bobAmp: 2.2,
    swayDeg: 0,
    wobAmp: 0.8,
    wobSpeed: 1.2,
    springStiffness: 380,
    springDamping: 18,
    squashX: 0.94,
    squashY: 1.06,
  },
  happy: {
    shape: 'hybrid',
    eyeState: 'happy',
    ribbonMode: 'none',
    bobAmp: 5.5,
    swayDeg: 2.5,
    wobAmp: 1.5,
    wobSpeed: 2.2,
    springStiffness: 320,
    springDamping: 18,
    squashX: 1.08,
    squashY: 0.92,
  },
  confused: {
    shape: 'hybrid',
    eyeState: 'skeptical',
    ribbonMode: 'none',
    bobAmp: 2.6,
    swayDeg: 6.5,
    wobAmp: 1.2,
    wobSpeed: 1.5,
    springStiffness: 250,
    springDamping: 20,
    squashX: 0.98,
    squashY: 1.02,
  },
  error: {
    shape: 'hybrid',
    eyeState: 'slit',
    ribbonMode: 'none',
    bobAmp: 1.0,
    swayDeg: 0,
    wobAmp: 0.8,
    wobSpeed: 1.0,
    springStiffness: 360,
    springDamping: 22,
    squashX: 1.02,
    squashY: 0.98,
  },
  excited: {
    shape: 'hybrid',
    eyeState: 'wide',
    ribbonMode: 'orbit',
    bobAmp: 6.5,
    swayDeg: 4.0,
    wobAmp: 2.0,
    wobSpeed: 3.2,
    springStiffness: 340,
    springDamping: 16,
    squashX: 1.06,
    squashY: 0.94,
  },
};

export interface MindyColors {
  main: string;
  highlight: string;
  shadow: string;
  specular: string;
  ambientShadow: string;
  contactShadow: string;
}

/**
 * Derives 3D volumetric colors and subtle highlight accents from a single brand hex.
 */
export function deriveMindyColors(baseHex: string): MindyColors {
  const { h, s, l } = hexToHsl(baseHex);

  if (l < 0.15) {
    return {
      main: baseHex,
      highlight: '#2a324b',
      shadow: '#040507',
      specular: 'rgba(255, 255, 255, 0.40)',
      ambientShadow: 'rgba(0, 0, 0, 0.45)',
      contactShadow: 'rgba(0, 0, 0, 0.70)',
    };
  }

  return {
    main: baseHex,
    highlight: hslToHex(h, Math.max(0, s - 0.12), Math.min(0.95, l + 0.16)),
    shadow: hslToHex(h, Math.min(1.0, s + 0.1), Math.max(0.08, l - 0.18)),
    specular: 'rgba(255, 255, 255, 0.50)',
    ambientShadow: 'rgba(15, 23, 42, 0.28)',
    contactShadow: 'rgba(15, 23, 42, 0.45)',
  };
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const value = hex.replace('#', '');
  const full =
    value.length === 3
      ? value
          .split('')
          .map((c) => c + c)
          .join('')
      : value;
  if (full.length !== 6) return { h: 213, s: 1, l: 0.46 };
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return { h: 213, s: 1, l: 0.46 };
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { h: h * 360, s, l };
}

function hslToHex(h: number, s: number, l: number): string {
  const hue = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = l - c / 2;
  const segment = Math.floor(hue / 60) % 6;
  const table: Array<[number, number, number]> = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ];
  const [r = 0, g = 0, b = 0] = table[segment] ?? [];
  const to255 = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${to255(r)}${to255(g)}${to255(b)}`;
}
