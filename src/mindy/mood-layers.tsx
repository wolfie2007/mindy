import { motion } from 'motion/react';
import { type MindyColors } from './moods';
import { type MindyMotion } from './use-mindy-motion';

interface LayerProps {
  m: MindyMotion;
  colors: MindyColors;
  ids: {
    glow: string;
    shadowBlur: string;
    badgeGrad: string;
    orbitGrad: string;
  };
}

/** Floor ripples shared by happy and excited bounce landings. */
export function GroundRipples({ m, stroke }: { m: MindyMotion; stroke: string }) {
  return (
    <motion.ellipse
      cx="100"
      cy="192"
      rx={m.rippleRx}
      ry={m.rippleRy}
      fill="none"
      stroke={stroke}
      strokeWidth="2"
      style={{ opacity: m.rippleOpacity }}
    />
  );
}

/**
 * Back arc + rear phase of the 3D orbital ring.
 * Rendered inside Mindy's bob/rotate group so it moves as one with her.
 */
export function ThinkingBackOrbit({ m, colors, ids }: LayerProps) {
  return (
    <g>
      <g transform="rotate(-13 100 96)">
        <path
          d="M 12 96 A 88 22 0 0 1 188 96"
          fill="none"
          stroke={`url(#${ids.orbitGrad})`}
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.35"
        />
      </g>
      <motion.circle
        cx={m.orbitX}
        cy={m.orbitY}
        r="5.5"
        fill={colors.accent}
        style={{
          scale: m.orbitScale,
          opacity: m.orbitBackOp,
          transformBox: 'fill-box',
          transformOrigin: 'center',
        }}
      />
    </g>
  );
}

/**
 * Front arc + luminous orbital pearl + subtle overhead crown reflection.
 * Rendered inside Mindy's bob/rotate group so it stays locked to her movement.
 */
export function ThinkingFrontOrbit({ m, colors, ids }: LayerProps) {
  return (
    <g>
      {/* Soft crown illumination as the orb passes overhead */}
      <motion.path
        d="M 74 49 C 90 42 110 42 126 49"
        fill="none"
        stroke={colors.rimLight}
        strokeWidth="3.5"
        strokeLinecap="round"
        filter={`url(#${ids.glow})`}
        style={{ opacity: m.orbitCrownGlow }}
      />

      <g transform="rotate(-13 100 96)">
        <path
          d="M 188 96 A 88 22 0 0 1 12 96"
          fill="none"
          stroke={`url(#${ids.orbitGrad})`}
          strokeWidth="2.0"
          strokeLinecap="round"
          opacity="0.72"
        />
      </g>

      <motion.g
        filter={`url(#${ids.glow})`}
        style={{
          scale: m.orbitScale,
          opacity: m.orbitFrontOp,
          transformBox: 'fill-box',
          transformOrigin: 'center',
        }}
      >
        <motion.circle cx={m.orbitX} cy={m.orbitY} r="5.5" fill={colors.accent} />
        <motion.circle cx={m.orbitX} cy={m.orbitY} r="2.2" fill="#ffffff" />
      </motion.g>
    </g>
  );
}

/**
 * Tight geometric crown flare attached directly above Mindy's apex.
 * Rendered inside Mindy's bob/rotate group so it jumps and tilts with her.
 */
export function AlertCrownFlare({ m, colors, ids }: LayerProps) {
  return (
    <motion.g
      filter={`url(#${ids.glow})`}
      style={{
        scale: m.alertFlareScale,
        opacity: m.alertFlareOpacity,
        transformBox: 'fill-box',
        transformOrigin: '100px 40px',
      }}
    >
      {/* Center crisp flare ray */}
      <line
        x1="100"
        y1="30"
        x2="100"
        y2="16"
        stroke="#ffffff"
        strokeWidth="3.6"
        strokeLinecap="round"
      />
      {/* Left & right angled rays */}
      <line
        x1="83"
        y1="34"
        x2="75"
        y2="22"
        stroke={colors.rimLight}
        strokeWidth="3.0"
        strokeLinecap="round"
      />
      <line
        x1="117"
        y1="34"
        x2="125"
        y2="22"
        stroke={colors.rimLight}
        strokeWidth="3.0"
        strokeLinecap="round"
      />
    </motion.g>
  );
}

/** Four independently twinkling diamond glints for the happy state. */
export function HappyOverlay({ m, colors, ids }: LayerProps) {
  return (
    <g filter={`url(#${ids.glow})`}>
      <DiamondSpark x={164} y={50} size={7.5} fill="#fbbf24" scale={m.glint1Scale} />
      <DiamondSpark x={35} y={64} size={6.0} fill={colors.rimLight} scale={m.glint2Scale} />
      <DiamondSpark x={169} y={132} size={5.2} fill="#fcd34d" scale={m.glint3Scale} />
      <DiamondSpark x={32} y={136} size={5.8} fill="#ffffff" scale={m.glint4Scale} />
    </g>
  );
}

/**
 * Sculpted '?' glyph + curiosity motes anchored inside Mindy's transform stack
 * and color-harmonized with her active palette.
 */
export function ConfusedOverlay({ m, colors, ids }: LayerProps) {
  return (
    <g>
      <motion.circle cx="136" cy={m.mote1Y} r="2.6" fill={colors.rimLight} opacity="0.78" />
      <motion.circle cx="170" cy={m.mote2Y} r="2.1" fill={colors.accent} opacity="0.72" />

      <motion.g
        filter={`url(#${ids.glow})`}
        style={{
          y: m.questionY,
          rotate: m.questionRotate,
          opacity: m.questionOpacity,
          transformBox: 'fill-box',
          transformOrigin: '154px 0px',
        }}
      >
        <path
          d="M 148 -9 C 148 -17 161 -17 161 -9 C 161 -4.5 154.5 -3.5 154.5 1"
          fill="none"
          stroke="rgba(15, 23, 42, 0.35)"
          strokeWidth="6"
          strokeLinecap="round"
          transform="translate(1.2 1.8)"
        />
        <path
          d="M 148 -9 C 148 -17 161 -17 161 -9 C 161 -4.5 154.5 -3.5 154.5 1"
          fill="none"
          stroke={colors.rimLight}
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M 149.5 -10.5 C 150 -15 158.5 -15.5 159.5 -10"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.75"
        />
        <circle cx="154.5" cy="8.5" r="2.8" fill={colors.rimLight} />
        <circle cx="153.8" cy="7.8" r="1.0" fill="#ffffff" opacity="0.8" />
      </motion.g>
    </g>
  );
}

/** Dynamic sweeping motion arcs + staggered starbursts for the excited state. */
export function ExcitedOverlay({ m, colors, ids }: LayerProps) {
  return (
    <g>
      <motion.path
        d="M 24 134 C 14 96 28 56 58 38"
        fill="none"
        stroke={colors.rimLight}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeDasharray="34 26"
        filter={`url(#${ids.glow})`}
        style={{ strokeDashoffset: m.excitedArcOffset }}
      />
      <motion.path
        d="M 176 76 C 186 114 172 154 142 170"
        fill="none"
        stroke={colors.accent}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeDasharray="34 26"
        filter={`url(#${ids.glow})`}
        style={{ strokeDashoffset: m.excitedArcOffset }}
      />

      <g filter={`url(#${ids.glow})`}>
        <DiamondSpark x={162} y={42} size={8} fill={colors.rimLight} scale={m.glint1Scale} />
        <DiamondSpark x={38} y={54} size={6.5} fill="#fcd34d" scale={m.glint2Scale} />
        <DiamondSpark x={176} y={118} size={6} fill="#ffffff" scale={m.glint3Scale} />
        <DiamondSpark x={24} y={122} size={5.5} fill={colors.accent} scale={m.glint4Scale} />
        <DiamondSpark x={136} y={24} size={5} fill="#fbbf24" scale={m.glint5Scale} />
        <DiamondSpark x={64} y={26} size={4.8} fill="#ffffff" scale={m.glint6Scale} />
      </g>
    </g>
  );
}

/** Floating 3D enamel notification bead. */
export function NotificationBadge({ m, ids }: LayerProps) {
  return (
    <motion.g
      style={{
        y: m.badgeFloatY,
        transformBox: 'fill-box',
        transformOrigin: '156px 42px',
      }}
    >
      <ellipse
        cx="156"
        cy="47"
        rx="9"
        ry="4.5"
        fill="rgba(15, 23, 42, 0.45)"
        filter={`url(#${ids.shadowBlur})`}
      />
      <circle
        cx="156"
        cy="42"
        r="11"
        fill={`url(#${ids.badgeGrad})`}
        stroke="#ffffff"
        strokeWidth="2.2"
      />
      <ellipse
        cx="153"
        cy="38"
        rx="4.2"
        ry="2.0"
        fill="rgba(255, 255, 255, 0.85)"
        transform="rotate(-15 153 38)"
      />
      <circle cx="156" cy="42" r="3.2" fill="#ffffff" />
    </motion.g>
  );
}

function DiamondSpark({
  x,
  y,
  size,
  fill,
  scale,
}: {
  x: number;
  y: number;
  size: number;
  fill: string;
  scale: MindyMotion['glint1Scale'];
}) {
  const inner = size * 0.28;
  return (
    <g transform={`translate(${x}, ${y})`}>
      <motion.polygon
        points={`0,${-size} ${inner},${-inner} ${size},0 ${inner},${inner} 0,${size} ${-inner},${inner} ${-size},0 ${-inner},${-inner}`}
        fill={fill}
        style={{
          scale,
          transformBox: 'fill-box',
          transformOrigin: 'center',
        }}
      />
    </g>
  );
}
