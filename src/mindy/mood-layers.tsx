import { motion } from 'motion/react';
import { type MindyColors } from './moods';
import { type MindyMotion } from './use-mindy-motion';

interface LayerProps {
  m: MindyMotion;
  colors: MindyColors;
  ids: {
    glow: string;
    shadowBlur: string;
    alertGrad: string;
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

/** Back arc + rear phase of the 3D orbital ring. */
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

/** Front arc + luminous orbital pearl + subtle overhead crown reflection. */
export function ThinkingFrontOrbit({ m, colors, ids }: LayerProps) {
  return (
    <g>
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
 * Clean, unboxed 3D exclamation glyph anchored inside Mindy's transform stack.
 */
export function AlertPip({ m, ids }: LayerProps) {
  return (
    <motion.g
      filter={`url(#${ids.glow})`}
      style={{
        y: m.alertPipY,
        scale: m.alertPipScale,
        opacity: m.alertPipOpacity,
        transformBox: 'fill-box',
        transformOrigin: '100px 0px',
      }}
    >
      {/* Subtle drop shadow */}
      <rect x="96.8" y="-14.5" width="8.5" height="19" rx="4.25" fill="rgba(15, 23, 42, 0.35)" />
      <circle cx="101.2" cy="11.2" r="4.2" fill="rgba(15, 23, 42, 0.35)" />

      {/* Tapered pill bar */}
      <path
        d="M 95.6 -13 C 95.6 -16 104.4 -16 104.4 -13 L 103.3 1.2 C 103.1 3.2 96.9 3.2 96.7 1.2 Z"
        fill={`url(#${ids.alertGrad})`}
      />
      <rect x="97.8" y="-13" width="2" height="11" rx="1" fill="#ffffff" opacity="0.7" />

      {/* Dot */}
      <circle cx="100" cy="9.5" r="4.1" fill={`url(#${ids.alertGrad})`} />
      <circle cx="98.8" cy="8.3" r="1.3" fill="#ffffff" opacity="0.75" />
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

/** Sculpted '?' glyph + curiosity motes anchored inside Mindy's transform stack. */
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
