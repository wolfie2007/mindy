import { useId } from 'react';
import { motion, useTransform } from 'motion/react';
import { type MindyMotion } from './use-mindy-motion';
import { type MindyMood, type MindyColors } from './moods';

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
  const gooFilterId = `mindy-goo-${uid}`;
  const glowFilterId = `mindy-glow-${uid}`;
  const shadowBlurId = `mindy-shadow-blur-${uid}`;
  const bodyGradId = `mindy-body-grad-${uid}`;
  const coronaGradientId = `mindy-corona-${uid}`;
  const synapticGradId = `mindy-synaptic-${uid}`;
  const badge3DGradId = `mindy-badge-3d-${uid}`;
  const alertPingGradId = `mindy-alert-ping-${uid}`;
  const blushGradId = `mindy-blush-${uid}`;
  const blushBlurId = `mindy-blush-blur-${uid}`;
  const alertPipGradId = `mindy-alert-pip-${uid}`;
  const confusedQGradId = `mindy-confused-q-${uid}`;

  const grayFilter = useTransform(m.grayAmount, (v) => `grayscale(${v})`);

  const pingRy = useTransform(m.acousticPingRadius, (r) => (r ?? 20) * 0.16);
  const alertPingOuterRx = useTransform(m.acousticPingRadius, (r) => (r ?? 20) * 1.25);
  const alertPingOuterRy = useTransform(pingRy, (r) => (r ?? 3) * 1.25);
  const alertPingOuterOpacity = useTransform(m.acousticPingOpacity, (o) => (o ?? 0) * 0.45);
  const impactRippleRx = useTransform(m.shadowScale, (s) => (s ?? 1) * 58);
  const impactRippleRy = useTransform(m.shadowScale, (s) => (s ?? 1) * 8.0);
  const tightShadowRx = useTransform(m.shadowScale, (s) => (s ?? 1) * 40);
  const tightShadowRy = useTransform(m.shadowScale, (s) => (s ?? 1) * 5.5);
  const synapticDash = useTransform(m.synapticProgress, (p) => (1 - (p ?? 0)) * 120);

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
        <filter id={gooFilterId} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="17" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 34 -13"
          />
        </filter>

        <filter id={glowFilterId} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id={shadowBlurId} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" />
        </filter>

        <filter id={blushBlurId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5.5" />
        </filter>

        <radialGradient id={bodyGradId} gradientUnits="userSpaceOnUse" cx="86" cy="88" r="95">
          <stop offset="0%" stopColor={colors.highlight} />
          <stop offset="55%" stopColor={colors.main} />
          <stop offset="100%" stopColor={colors.shadow} />
        </radialGradient>

        <radialGradient id={blushGradId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff3366" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#ff6688" stopOpacity="0.40" />
          <stop offset="100%" stopColor="#ff6688" stopOpacity="0" />
        </radialGradient>

        <radialGradient id={coronaGradientId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
          <stop offset="60%" stopColor="#818cf8" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
        </radialGradient>

        <linearGradient id={synapticGradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#818cf8" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#c084fc" stopOpacity="0.3" />
        </linearGradient>

        <linearGradient id={alertPingGradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
        </linearGradient>

        <linearGradient id={alertPipGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="60%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>

        <linearGradient id={confusedQGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>

        <radialGradient id={badge3DGradId} cx="32%" cy="28%" r="68%">
          <stop offset="0%" stopColor="#ff6b6b" />
          <stop offset="45%" stopColor="#e11d48" />
          <stop offset="100%" stopColor="#881337" />
        </radialGradient>
      </defs>

      {/* Ground Ambient Occlusion & Contact Shadow */}
      <motion.ellipse
        cx="100"
        cy="192"
        rx={impactRippleRx}
        ry={impactRippleRy}
        fill={colors.ambientShadow}
        style={{
          scale: m.shadowScale,
          opacity: m.shadowOpacity,
          transformBox: 'fill-box',
          transformOrigin: 'center',
        }}
      />
      <motion.ellipse
        cx="100"
        cy="191"
        rx={tightShadowRx}
        ry={tightShadowRy}
        fill={colors.contactShadow}
        style={{
          scale: m.shadowScale,
          opacity: 0.55,
          transformBox: 'fill-box',
          transformOrigin: 'center',
        }}
      />

      {mood === 'alert' && animated && (
        <>
          <motion.ellipse
            cx="100"
            cy="192"
            rx={m.acousticPingRadius}
            ry={pingRy}
            fill="none"
            stroke={`url(#${alertPingGradId})`}
            strokeWidth="2.2"
            style={{
              opacity: m.acousticPingOpacity,
              transformBox: 'fill-box',
              transformOrigin: 'center',
            }}
          />
          <motion.ellipse
            cx="100"
            cy="192"
            rx={alertPingOuterRx}
            ry={alertPingOuterRy}
            fill="none"
            stroke={`url(#${alertPingGradId})`}
            strokeWidth="1.2"
            style={{
              opacity: alertPingOuterOpacity,
              transformBox: 'fill-box',
              transformOrigin: 'center',
            }}
          />
        </>
      )}

      {(mood === 'excited' || mood === 'happy') && animated && (
        <motion.ellipse
          cx="100"
          cy="192"
          rx={impactRippleRx}
          ry={impactRippleRy}
          fill="none"
          stroke={colors.highlight}
          strokeWidth="1.8"
          style={{
            opacity: m.impactRippleOpacity,
            scale: m.impactRippleScale,
            transformBox: 'fill-box',
            transformOrigin: 'center',
          }}
        />
      )}

      {mood === 'thinking' && animated && (
        <>
          <motion.circle
            cx="100"
            cy="48"
            r="44"
            fill={`url(#${coronaGradientId})`}
            filter={`url(#${glowFilterId})`}
            style={{
              scale: m.neuralCoronaScale,
              opacity: m.neuralCoronaOpacity,
              transformBox: 'fill-box',
              transformOrigin: '100px 48px',
            }}
          />
          <motion.ellipse
            cx="100"
            cy="52"
            rx="48"
            ry="16"
            fill="none"
            stroke={`url(#${synapticGradId})`}
            strokeWidth="3.0"
            strokeDasharray="25 15 45 15"
            filter={`url(#${glowFilterId})`}
            transform="rotate(-8 100 52)"
            style={{ strokeDashoffset: synapticDash }}
          />
          <motion.g filter={`url(#${glowFilterId})`} style={{ opacity: m.neuralCoronaOpacity }}>
            <circle cx="66" cy="44" r="3.8" fill="#ffffff" />
            <circle cx="140" cy="54" r="3.0" fill="#67e8f9" />
            <polygon
              points="154,32 156,28 160,27 156,26 154,22 152,26 148,27 152,28"
              fill="#c084fc"
            />
          </motion.g>
        </>
      )}

      {mood === 'happy' && animated && (
        <motion.g
          filter={`url(#${glowFilterId})`}
          style={{
            scale: m.sparkleScale,
            rotate: m.sparkleRotate,
            transformBox: 'fill-box',
            transformOrigin: '100px 100px',
          }}
        >
          <polygon
            points="168,48 170,42 176,40 170,38 168,32 166,38 160,40 166,42"
            fill="#fbbf24"
          />
          <polygon
            points="34,68 35.5,63 40,61.5 35.5,60 34,55 32.5,60 28,61.5 32.5,63"
            fill="#fcd34d"
          />
        </motion.g>
      )}

      {mood === 'excited' && animated && (
        <motion.g
          filter={`url(#${glowFilterId})`}
          style={{
            opacity: m.ribbonOpacity,
            rotate: m.sparkleRotate,
            scale: m.sparkleScale,
            transformBox: 'fill-box',
            transformOrigin: '100px 110px',
          }}
        >
          <g transform="translate(162, 54)">
            <polygon points="0,-7 2,-2 7,0 2,2 0,7 -2,2 -7,0 -2,-2" fill="#67e8f9" />
          </g>
          <g transform="translate(38, 72)">
            <polygon
              points="0,-5.5 1.6,-1.6 5.5,0 1.6,1.6 0,5.5 -1.6,1.6 -5.5,0 -1.6,-1.6"
              fill="#fcd34d"
            />
          </g>
          <g transform="translate(168, 142)">
            <polygon
              points="0,-4.5 1.3,-1.3 4.5,0 1.3,1.3 0,4.5 -1.3,1.3 -4.5,0 -1.3,-1.3"
              fill="#38bdf8"
            />
          </g>
          <g transform="translate(32, 148)">
            <polygon
              points="0,-4 1.2,-1.2 4,0 1.2,1.2 0,4 -1.2,1.2 -4,0 -1.2,-1.2"
              fill="#a78bfa"
            />
          </g>
        </motion.g>
      )}

      {mood === 'alert' && animated && (
        <motion.g
          filter={`url(#${glowFilterId})`}
          style={{
            y: m.alertPipY,
            scale: m.alertPipScale,
            opacity: m.alertPipOpacity,
            transformBox: 'fill-box',
            transformOrigin: '100px 22px',
          }}
        >
          <circle
            cx="100"
            cy="0"
            r="14"
            fill={`url(#${alertPipGradId})`}
            stroke="#ffffff"
            strokeWidth="2.0"
          />
          <path d="M 98 -7.5 L 102 -7.5 L 101.3 0.5 L 98.7 0.5 Z" fill="#ffffff" />
          <circle cx="100" cy="5" r="1.7" fill="#ffffff" />
        </motion.g>
      )}

      {mood === 'confused' && animated && (
        <motion.g
          filter={`url(#${glowFilterId})`}
          style={{
            y: m.questionGlyphY,
            rotate: m.questionGlyphRotate,
            opacity: m.questionGlyphOpacity,
            transformBox: 'fill-box',
            transformOrigin: '154px 46px',
          }}
        >
          <circle
            cx="154"
            cy="0"
            r="13"
            fill={`url(#${confusedQGradId})`}
            stroke="#ffffff"
            strokeWidth="2.0"
          />
          <path
            d="M 150.5 -4.5 C 150.5 -8.5 157.5 -8.5 157.5 -4.5 C 157.5 -2 154 -1.5 154 1"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <circle cx="154" cy="5" r="1.5" fill="#ffffff" />
        </motion.g>
      )}

      {/* Main Character Body Stack */}
      <motion.g style={{ x: m.shakeX, y: m.bobY }}>
        <motion.g
          style={{
            rotate: m.bodyRotate,
            transformBox: 'fill-box',
            transformOrigin: '100px 110px',
          }}
        >
          <motion.g
            style={{
              scaleX: m.scaleX,
              scaleY: m.scaleY,
              transformBox: 'fill-box',
              transformOrigin: '100px 110px',
            }}
          >
            {mood !== 'loading' && (
              <motion.g style={{ filter: grayFilter }}>
                <motion.path d={m.bodyD} fill={`url(#${bodyGradId})`} />
                <path
                  d="M 68 64 C 84 50 116 50 132 64 C 118 55 82 55 68 64 Z"
                  fill={colors.specular}
                  opacity="0.38"
                />
                <motion.g style={{ opacity: m.cheekBlushOpacity }}>
                  <ellipse
                    cx="56"
                    cy="124"
                    rx="16"
                    ry="9"
                    fill={`url(#${blushGradId})`}
                    filter={`url(#${blushBlurId})`}
                  />
                  <ellipse
                    cx="144"
                    cy="124"
                    rx="16"
                    ry="9"
                    fill={`url(#${blushGradId})`}
                    filter={`url(#${blushBlurId})`}
                  />
                </motion.g>
                {mood === 'alert' && (
                  <motion.path
                    d="M 80 48 C 94 42 106 42 120 48"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="3.6"
                    strokeLinecap="round"
                    filter={`url(#${glowFilterId})`}
                    style={{ opacity: m.alertPulseScale }}
                  />
                )}
              </motion.g>
            )}

            {mood === 'loading' && (
              <g filter={`url(#${gooFilterId})`}>
                <motion.circle
                  cx={m.metaballCenterX}
                  cy={m.metaballCenterY}
                  r={m.metaballCenterR}
                  fill={`url(#${bodyGradId})`}
                />
                <motion.circle
                  cx={m.metaballLeftX}
                  cy={m.metaballLeftY}
                  r={m.metaballOuterR}
                  fill={`url(#${bodyGradId})`}
                />
                <motion.circle
                  cx={m.metaballRightX}
                  cy={m.metaballRightY}
                  r={m.metaballOuterR}
                  fill={`url(#${bodyGradId})`}
                />
              </g>
            )}

            {m.eyeState !== 'hidden' && mood !== 'loading' && (
              <g fill="#ffffff">
                <motion.path d={m.eyeLeftD} style={{ opacity: m.eyeLeftOp }} />
                <motion.path d={m.eyeRightD} style={{ opacity: m.eyeRightOp }} />
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
              </g>
            )}
          </motion.g>
        </motion.g>
      </motion.g>

      {hasNotification && (
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
            filter={`url(#${shadowBlurId})`}
          />
          <circle
            cx="156"
            cy="42"
            r="11"
            fill={`url(#${badge3DGradId})`}
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
      )}
    </svg>
  );
}
