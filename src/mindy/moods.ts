import { type MindyEyeState } from './eyes';

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
  eyeState: MindyEyeState;
  wobAmp: number;
  wobSpeed: number;
}

export const MOOD_CONFIGS: Record<MindyMood, MoodConfig> = {
  idle: { eyeState: 'capsule', wobAmp: 1.0, wobSpeed: 1.8 },
  thinking: { eyeState: 'thinking', wobAmp: 1.4, wobSpeed: 2.4 },
  loading: { eyeState: 'hidden', wobAmp: 0, wobSpeed: 0 },
  alert: { eyeState: 'wide', wobAmp: 0.8, wobSpeed: 1.2 },
  happy: { eyeState: 'happy', wobAmp: 1.5, wobSpeed: 2.2 },
  confused: { eyeState: 'skeptical', wobAmp: 1.2, wobSpeed: 1.5 },
  error: { eyeState: 'wince', wobAmp: 0.7, wobSpeed: 1.0 },
  excited: { eyeState: 'wide', wobAmp: 2.0, wobSpeed: 3.2 },
};

export interface MindyColors {
  main: string;
  highlight: string;
  shadow: string;
  rimLight: string;
  accent: string;
  specular: string;
  ambientShadow: string;
  contactShadow: string;
}

/**
 * Derives 3D shading tones, rim bounce light, and accents from one hex color.
 */
export function deriveMindyColors(baseHex: string): MindyColors {
  const { h, s, l } = hexToHsl(baseHex);

  if (l < 0.15) {
    return {
      main: baseHex,
      highlight: '#2a334d',
      shadow: '#040507',
      rimLight: '#64748b',
      accent: '#93c5fd',
      specular: 'rgba(255, 255, 255, 0.42)',
      ambientShadow: 'rgba(0, 0, 0, 0.45)',
      contactShadow: 'rgba(0, 0, 0, 0.72)',
    };
  }

  return {
    main: baseHex,
    highlight: hslToHex(h, Math.max(0, s - 0.12), Math.min(0.95, l + 0.16)),
    shadow: hslToHex(h, Math.min(1.0, s + 0.1), Math.max(0.08, l - 0.18)),
    rimLight: hslToHex(h, Math.max(0.15, s * 0.85), Math.min(0.88, l + 0.28)),
    accent: hslToHex((h + 24) % 360, Math.min(1, s + 0.12), Math.min(0.84, Math.max(0.64, l + 0.2))),
    specular: 'rgba(255, 255, 255, 0.52)',
    ambientShadow: 'rgba(15, 23, 42, 0.26)',
    contactShadow: 'rgba(15, 23, 42, 0.46)',
  };
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const raw = hex.replace('#', '');
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => c + c)
          .join('')
      : raw;

  if (full.length !== 6) return { h: 213, s: 1, l: 0.46 };

  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return { h: 213, s: 1, l: 0.46 };
  }

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
