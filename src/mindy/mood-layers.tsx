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
    confusedGrad: string;
    badgeGrad: string;
    sweatGrad: string;
    orbitGrad: string;
  };
}

/** Floor ripples shared by alert, happy, and excited states. */
export function GroundRipples({ m, stroke }: { m: MindyMotion; stroke: string }) {
  return (
    <>
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
      <motion.ellipse
        cx="100"
        cy="192"
        rx={m.rippleOuterRx}
        ry={m.rippleOuterRy}
        fill="none"
        stroke={stroke}
        strokeWidth="1.2"
        style={{ opacity: m.rippleOuterOpacity }}
      />
    </>
  );
}

/** Back half of the 3D orbital rings rendered behind Mindy's body. */
export function ThinkingBackOrbit({ m, ids }: LayerProps) {
  return (
    <g>
      <ellipse
        cx="100"
        cy="108"
        rx="88"
        ry="22"
        fill="none"
        stroke={`url(#${ids.orbitGrad})`}
        strokeWidth="1.6"
        strokeDasharray="3 5"
        opacity="0.28"
        transform="rotate(-16 100 108)"
      />
      <ellipse
        cx="100"
        cy="106"
        rx="82"
        ry="20"
        fill="none"
        stroke={`url(#${ids.orbitGrad})`}
        strokeWidth="1.4"
        strokeDasharray="3 5"
        opacity="0.22"
        transform="rotate(18 100 106)"
      />
      <motion.circle
        cx={m.orbit1X}
        cy={m.orbit1Y}
        r="5.5"
        fill="#7dd3fc"
        style={{
          scale: m.orbit1Scale,
          opacity: m.orbit1BackOp,
          transformBox: 'fill-box',
          transformOrigin: 'center',
        }}
      />
      <motion.circle
        cx={m.orbit2X}
        cy={m.orbit2Y}
        r="4.8"
        fill="#c4b5fd"
        style={{
          scale: m.orbit2Scale,
          opacity: m.orbit2BackOp,
          transformBox: 'fill-box',
          transformOrigin: 'center',
        }}
      />
    </g>
  );
}

/** Front half of the 3D orbital pearls + rising thought trail rendered in front of Mindy. */
export function ThinkingFrontOverlay({ m, ids }: LayerProps) {
  return (
    <g>
      <motion.g
        filter={`url(#${ids.glow})`}
        style={{
          scale: m.orbit1Scale,
          opacity: m.orbit1FrontOp,
          transformBox: 'fill-box',
          transformOrigin: 'center',
        }}
      >
        <motion.circle cx={m.orbit1X} cy={m.orbit1Y} r="5.5" fill="#38bdf8" />
        <motion.circle cx={m.orbit1X} cy={m.orbit1Y} r="2.2" fill="#ffffff" />
      </motion.g>

      <motion.g
        filter={`url(#${ids.glow})`}
        style={{
          scale: m.orbit2Scale,
          opacity: m.orbit2FrontOp,
          transformBox: 'fill-box',
          transformOrigin: 'center',
        }}
      >
        <motion.circle cx={m.orbit2X} cy={m.orbit2Y} r="4.8" fill="#a78bfa" />
        <motion.circle cx={m.orbit2X} cy={m.orbit2Y} r="1.9" fill="#ffffff" />
      </motion.g>

      {/* Rising frosted thought pearls above right brow */}
      <motion.circle
        cx="134"
        cy={m.thoughtPearl1Y}
        r="3.2"
        fill="#bae6fd"
        opacity="0.85"
      />
      <motion.circle
        cx="146"
        cy={m.thoughtPearl2Y}
        r="4.8"
        fill="#7dd3fc"
        opacity="0.92"
      />
      <motion.g filter={`url(#${ids.glow})`}>
        <motion.circle cx="160" cy={m.thoughtPearl3Y} r="7.2" fill="#e0f2fe" />
        <motion.circle cx="158" cy={m.thoughtPearl3Y} r="2.6" fill="#ffffff" opacity="0.9" />
      </motion.g>
    </g>
  );
}

/** Kinetic radial attention rays + sculpted pill exclamation mark. */
export function AlertOverlay({ m, ids }: LayerProps) {
  return (
    <g>
      {/* Radial attention sparks */}
      <motion.g
        filter={`url(#${ids.glow})`}
        style={{
          scale: m.alertRaysScale,
          opacity: m.alertRaysOpacity,
          transformBox: 'fill-box',
          transformOrigin: '100px 38px',
        }}
      >
        <line
          x1="74"
          y1="28"
          x2="64"
          y2="16"
          stroke="#fbbf24"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <line
          x1="126"
          y1="28"
          x2="136"
          y2="16"
          stroke="#fbbf24"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <line
          x1="56"
          y1="44"
          x2="44"
          y2="37"
          stroke="#fde68a"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <line
          x1="144"
          y1="44"
          x2="156"
          y2="37"
          stroke="#fde68a"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </motion.g>

      {/* Sculpted 3D pill exclamation mark */}
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
        <rect
          x="96"
          y="-16"
          width="8"
          height="18"
          rx="4"
          fill={`url(#${ids.alertGrad})`}
        />
        <rect x="97.8" y="-14" width="2.2" height="12" rx="1.1" fill="#ffffff" opacity="0.65" />
        <circle cx="100" cy="8.5" r="4" fill={`url(#${ids.alertGrad})`} />
        <circle cx="99" cy="7.5" r="1.3" fill="#ffffff" opacity="0.7" />
      </motion.g>
    </g>
  );
}

/** Four independently twinkling diamond glints for the happy state. */
export function HappyOverlay({ m, ids }: LayerProps) {
  return (
    <g filter={`url(#${ids.glow})`}>
      <DiamondSpark x={164} y={50} size={7.5} fill="#fbbf24" scale={m.glint1Scale} />
      <DiamondSpark x={35} y={64} size={6.0} fill="#fde68a" scale={m.glint2Scale} />
      <DiamondSpark x={169} y={132} size={5.2} fill="#fcd34d" scale={m.glint3Scale} />
      <DiamondSpark x={32} y={136} size={5.8} fill="#ffffff" scale={m.glint4Scale} />
    </g>
  );
}

/** Sculpted floating '?' glyph + curiosity motes for the confused state. */
export function ConfusedOverlay({ m, ids }: LayerProps) {
  return (
    <g>
      <motion.circle cx="136" cy={m.mote1Y} r="2.8" fill="#a78bfa" opacity="0.75" />
      <motion.circle cx="172" cy={m.mote2Y} r="2.2" fill="#c4b5fd" opacity="0.7" />

      <motion.g
        filter={`url(#${ids.glow})`}
        style={{
          y: m.questionY,
          rotate: m.questionRotate,
          opacity: m.questionOpacity,
          transformBox: 'fill-box',
          transformOrigin: '156px 0px',
        }}
      >
        {/* Soft shadow offset */}
        <path
          d="M 149 -10 C 149 -18 163 -18 163 -10 C 163 -5 156 -4 156 1"
          fill="none"
          stroke="rgba(15, 23, 42, 0.35)"
          strokeWidth="6.5"
          strokeLinecap="round"
          transform="translate(1.5 2)"
        />
        {/* Sculpted '?' curve */}
        <path
          d="M 149 -10 C 149 -18 163 -18 163 -10 C 163 -5 156 -4 156 1"
          fill="none"
          stroke={`url(#${ids.confusedGrad})`}
          strokeWidth="5.5"
          strokeLinecap="round"
        />
        {/* Inner specular highlight */}
        <path
          d="M 150.5 -11.5 C 151 -16 160 -16.5 161.2 -11"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.7"
        />
        <circle cx="156" cy="9" r="3.1" fill={`url(#${ids.confusedGrad})`} />
        <circle cx="155" cy="8" r="1.0" fill="#ffffff" opacity="0.75" />
      </motion.g>
    </g>
  );
}

/** Dynamic sweeping motion arcs + staggered starbursts for the excited state. */
export function ExcitedOverlay({ m, colors, ids }: LayerProps) {
  return (
    <g>
      {/* Sweeping velocity arcs around left & right flanks */}
      <motion.path
        d="M 24 134 C 14 96 28 56 58 38"
        fill="none"
        stroke="#38bdf8"
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

      {/* Staggered celebration bursts */}
      <g filter={`url(#${ids.glow})`}>
        <DiamondSpark x={162} y={42} size={8} fill="#67e8f9" scale={m.glint1Scale} />
        <DiamondSpark x={38} y={54} size={6.5} fill="#fcd34d" scale={m.glint2Scale} />
        <DiamondSpark x={176} y={118} size={6} fill="#ffffff" scale={m.glint3Scale} />
        <DiamondSpark x={24} y={122} size={5.5} fill="#c084fc" scale={m.glint4Scale} />
        <DiamondSpark x={136} y={24} size={5} fill="#fbbf24" scale={m.glint5Scale} />
        <DiamondSpark x={64} y={26} size={4.8} fill="#38bdf8" scale={m.glint6Scale} />
      </g>
    </g>
  );
}

/** Expressive sliding brow droplet for the error state. */
export function ErrorOverlay({ m, ids }: LayerProps) {
  return (
    <motion.g
      style={{
        y: m.sweatDropY,
        opacity: m.sweatDropOpacity,
      }}
    >
      <path
        d="M 156 -8 C 160 -2 162 1.5 162 4 A 6 6 0 1 1 150 4 C 150 1.5 152 -2 156 -8 Z"
        fill={`url(#${ids.sweatGrad})`}
        stroke="rgba(255,255,255,0.65)"
        strokeWidth="1.1"
      />
      <ellipse cx="154" cy="3.5" rx="1.5" ry="2.6" fill="#ffffff" opacity="0.8" />
    </motion.g>
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
