import { useId } from 'react';
import { motion, useTransform } from 'motion/react';
import { type MindyColors, type MindyMood } from './moods';
import {
  AlertCrownFlare,
  ConfusedOverlay,
  ExcitedOverlay,
  GroundRipples,
  HappyOverlay,
  NotificationBadge,
  ThinkingBackOrbit,
  ThinkingFrontOrbit,
} from './mood-layers';
import { type MindyMotion } from './use-mindy-motion';

export interface MindyFigureProps {
  motion: MindyMotion;
  mood: MindyMood;
  colors: MindyColors;
  hasNotification?: boolean;
  animated?: boolean;
}

export function MindyFigure({
  motion: m,
  mood,
  colors,
  hasNotification = false,
  animated = true,
}: MindyFigureProps) {
  const uid = useId().replace(/:/g, '');
  const ids = {
    goo: `mindy-goo-${uid}`,
    glow: `mindy-glow-${uid}`,
    shadowBlur: `mindy-shadow-${uid}`,
    blushBlur: `mindy-blush-blur-${uid}`,
    bodyGrad: `mindy-body-${uid}`,
    blushGrad: `mindy-blush-${uid}`,
    badgeGrad: `mindy-badge-${uid}`,
    orbitGrad: `mindy-orbit-${uid}`,
  };

  const grayFilter = useTransform(m.grayAmount, (v) => `grayscale(${v})`);
  const broadShadowRx = useTransform(m.shadowScale, (s) => (s ?? 1) * 58);
  const broadShadowRy = useTransform(m.shadowScale, (s) => (s ?? 1) * 8);
  const tightShadowRx = useTransform(m.shadowScale, (s) => (s ?? 1) * 40);
  const tightShadowRy = useTransform(m.shadowScale, (s) => (s ?? 1) * 5.5);

  const rippleStroke = mood === 'excited' ? colors.accent : colors.rimLight;
  const contourEchoStroke = mood === 'error' ? '#fb7185' : colors.rimLight;

  return (
    <svg
      viewBox="0 0 200 215"
      width="100%"
      height="100%"
      data-mood={mood}
      aria-hidden
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <filter id={ids.goo} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="17" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 34 -13"
          />
        </filter>

        <filter id={ids.glow} x="-45%" y="-45%" width="190%" height="190%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id={ids.shadowBlur} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" />
        </filter>

        <filter id={ids.blushBlur} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5.5" />
        </filter>

        <radialGradient id={ids.bodyGrad} gradientUnits="userSpaceOnUse" cx="84" cy="84" r="96">
          <stop offset="0%" stopColor={colors.highlight} />
          <stop offset="56%" stopColor={colors.main} />
          <stop offset="100%" stopColor={colors.shadow} />
        </radialGradient>

        <radialGradient id={ids.blushGrad} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff3b6b" stopOpacity="0.88" />
          <stop offset="55%" stopColor="#ff6b8b" stopOpacity="0.38" />
          <stop offset="100%" stopColor="#ff6b8b" stopOpacity="0" />
        </radialGradient>

        <linearGradient id={ids.orbitGrad} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={colors.rimLight} stopOpacity="0.15" />
          <stop offset="50%" stopColor={colors.accent} stopOpacity="0.95" />
          <stop offset="100%" stopColor={colors.rimLight} stopOpacity="0.15" />
        </linearGradient>

        <radialGradient id={ids.badgeGrad} cx="32%" cy="28%" r="68%">
          <stop offset="0%" stopColor="#ff6b6b" />
          <stop offset="45%" stopColor="#e11d48" />
          <stop offset="100%" stopColor="#881337" />
        </radialGradient>
      </defs>

      {/* Ground ambient occlusion & contact shadow */}
      <motion.ellipse
        cx="100"
        cy="192"
        rx={broadShadowRx}
        ry={broadShadowRy}
        fill={colors.ambientShadow}
        style={{ opacity: m.shadowOpacity }}
      />
      <motion.ellipse
        cx="100"
        cy="191"
        rx={tightShadowRx}
        ry={tightShadowRy}
        fill={colors.contactShadow}
        opacity="0.52"
      />

      {animated && (mood === 'happy' || mood === 'excited') && (
        <GroundRipples m={m} stroke={rippleStroke} />
      )}

      {/* Main character stack: everything attached to Mindy moves together here */}
      <motion.g style={{ x: m.shakeX, y: m.bobY }}>
        <motion.g
          style={{
            rotate: m.bodyRotate,
            transformBox: 'fill-box',
            transformOrigin: '100px 110px',
          }}
        >
          {/* Back half of 3D thinking orbit (behind Mindy, moves with bob & tilt) */}
          {animated && mood === 'thinking' && <ThinkingBackOrbit m={m} colors={colors} ids={ids} />}

          {/* Body-hugging contour echo wave for alert & error */}
          {animated && (mood === 'alert' || mood === 'error') && (
            <motion.path
              d={m.bodyD}
              fill="none"
              stroke={contourEchoStroke}
              strokeWidth="2.4"
              style={{
                scale: m.contourEchoScale,
                opacity: m.contourEchoOpacity,
                transformBox: 'fill-box',
                transformOrigin: '100px 110px',
              }}
            />
          )}

          <motion.g
            style={{
              scaleX: m.scaleX,
              scaleY: m.scaleY,
              transformBox: 'fill-box',
              transformOrigin: '100px 110px',
            }}
          >
            {mood !== 'loading' ? (
              <motion.g style={{ filter: grayFilter }}>
                <motion.path d={m.bodyD} fill={`url(#${ids.bodyGrad})`} />

                {/* Top-left specular highlight */}
                <path
                  d="M 66 64 C 82 49 116 49 132 63 C 118 54 82 54 66 64 Z"
                  fill={colors.specular}
                  opacity="0.4"
                />

                {/* Subtle lower subsurface bounce rim */}
                <path
                  d="M 62 162 C 82 173 118 173 138 162 C 118 168 82 168 62 162 Z"
                  fill={colors.rimLight}
                  opacity="0.34"
                />

                {/* Happy cheek blush */}
                <motion.g style={{ opacity: m.cheekBlushOpacity }}>
                  <ellipse
                    cx="56"
                    cy="125"
                    rx="16"
                    ry="9"
                    fill={`url(#${ids.blushGrad})`}
                    filter={`url(#${ids.blushBlur})`}
                  />
                  <ellipse
                    cx="144"
                    cy="125"
                    rx="16"
                    ry="9"
                    fill={`url(#${ids.blushGrad})`}
                    filter={`url(#${ids.blushBlur})`}
                  />
                </motion.g>

                {/* Alert crown flash */}
                {mood === 'alert' && (
                  <motion.path
                    d="M 78 48 C 92 41 108 41 122 48"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="3.4"
                    strokeLinecap="round"
                    filter={`url(#${ids.glow})`}
                    style={{ opacity: m.alertCrownFlash }}
                  />
                )}
              </motion.g>
            ) : (
              <g filter={`url(#${ids.goo})`}>
                <motion.circle
                  cx={m.metaballCenterX}
                  cy={m.metaballCenterY}
                  r="27"
                  fill={`url(#${ids.bodyGrad})`}
                />
                <motion.circle
                  cx={m.metaballLeftX}
                  cy={m.metaballLeftY}
                  r="23"
                  fill={`url(#${ids.bodyGrad})`}
                />
                <motion.circle
                  cx={m.metaballRightX}
                  cy={m.metaballRightY}
                  r="23"
                  fill={`url(#${ids.bodyGrad})`}
                />
              </g>
            )}

            {/* Eyes & ocular glints */}
            {mood !== 'loading' && (
              <motion.g fill="#ffffff" style={{ opacity: m.eyeVisible }}>
                <motion.path d={m.eyeLeftD} />
                <motion.path d={m.eyeRightD} />
                <motion.circle
                  cx={m.eyeGlintLeftX}
                  cy={m.eyeGlintLeftY}
                  r={m.eyeGlintLeftR}
                  style={{ opacity: m.eyeGlintLeftOp }}
                />
                <motion.circle
                  cx={m.eyeGlintRightX}
                  cy={m.eyeGlintRightY}
                  r={m.eyeGlintRightR}
                  style={{ opacity: m.eyeGlintRightOp }}
                />
              </motion.g>
            )}
          </motion.g>

          {/* Body-locked mood layers (move & tilt as one with Mindy) */}
          {animated && mood === 'thinking' && (
            <ThinkingFrontOrbit m={m} colors={colors} ids={ids} />
          )}
          {animated && mood === 'alert' && <AlertCrownFlare m={m} colors={colors} ids={ids} />}
          {animated && mood === 'confused' && <ConfusedOverlay m={m} colors={colors} ids={ids} />}
        </motion.g>
      </motion.g>

      {/* Ambient sparkle fields around Mindy */}
      {animated && mood === 'happy' && <HappyOverlay m={m} colors={colors} ids={ids} />}
      {animated && mood === 'excited' && <ExcitedOverlay m={m} colors={colors} ids={ids} />}

      {hasNotification && <NotificationBadge m={m} colors={colors} ids={ids} />}
    </svg>
  );
}
