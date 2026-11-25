import { deriveMindyColors } from './moods';

export interface LoadingMindyProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * Lightweight liquid metaball loader variant of Mindy.
 */
export function LoadingMindy({
  size = 240,
  color = '#006aed',
  className,
}: LoadingMindyProps) {
  const colors = deriveMindyColors(color);
  const gooFilterId = 'mindy-loading-goo';
  const bodyGradId = 'mindy-loading-body';

  return (
    <div
      aria-hidden
      className={`pointer-events-auto relative select-none ${className ?? ''}`}
      style={{ width: '100%', maxWidth: size, aspectRatio: '1 / 1' }}
    >
      <svg
        viewBox="0 0 200 215"
        width="100%"
        height="100%"
        data-mood="loading"
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
          <radialGradient id={bodyGradId} gradientUnits="userSpaceOnUse" cx="86" cy="88" r="95">
            <stop offset="0%" stopColor={colors.highlight} />
            <stop offset="55%" stopColor={colors.main} />
            <stop offset="100%" stopColor={colors.shadow} />
          </radialGradient>
        </defs>

        <ellipse cx="100" cy="192" rx="34" ry="5" fill={colors.ambientShadow} opacity="0.52" />
        <g filter={`url(#${gooFilterId})`}>
          <circle cx="100" cy="110" r="27" fill={`url(#${bodyGradId})`} />
          <circle cx="100" cy="110" r="23" fill={`url(#${bodyGradId})`}>
            <animate
              attributeName="cx"
              dur="2.8s"
              repeatCount="indefinite"
              values="100;32;100"
              keyTimes="0;0.5;1"
              calcMode="spline"
              keySplines="0.42 0 0.58 1;0.42 0 0.58 1"
            />
          </circle>
          <circle cx="100" cy="110" r="23" fill={`url(#${bodyGradId})`}>
            <animate
              attributeName="cx"
              dur="2.8s"
              repeatCount="indefinite"
              values="100;168;100"
              keyTimes="0;0.5;1"
              calcMode="spline"
              keySplines="0.42 0 0.58 1;0.42 0 0.58 1"
            />
          </circle>
        </g>
      </svg>
    </div>
  );
}
