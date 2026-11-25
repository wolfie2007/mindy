import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { motion } from 'motion/react';
import { type MindyEyeState } from './eyes';
import { MindyFigure } from './mindy-figure';
import { deriveMindyColors, type MindyMood } from './moods';
import { type MindyAction, useMindyMotion } from './use-mindy-motion';

export interface MindyHandle {
  trigger: (action: MindyAction) => void;
}

export interface MindyProps {
  mood?: MindyMood;
  /** Override the eye expression instead of using the mood default. */
  eyeState?: MindyEyeState;
  /** Eye lean angle in degrees (default: -10.5). */
  eyeLean?: number;
  /** Width and height in pixels (default: 240). */
  size?: number;
  /** Base hex color; 3D highlights and shadows are derived automatically. */
  color?: string;
  /** Enables pointer gaze tracking and click-to-bounce physics. */
  interactive?: boolean;
  /** Shows a floating 3D notification pip. */
  hasNotification?: boolean;
  /** Overrides system prefers-reduced-motion. */
  reducedMotion?: boolean;
  /** Optionally stop the frame loop this many ms after a mood change. */
  holdAfterMs?: number;
  className?: string;
  onClick?: () => void;
}

export const Mindy = forwardRef<MindyHandle, MindyProps>(function Mindy(
  {
    mood = 'idle',
    eyeState,
    eyeLean,
    size = 240,
    color = '#006aed',
    interactive = true,
    hasNotification = false,
    reducedMotion: reducedMotionProp,
    holdAfterMs,
    className,
    onClick,
  },
  ref,
) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const [tabHidden, setTabHidden] = useState(false);
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);

  const [coarsePointer] = useState(
    () =>
      typeof window !== 'undefined' &&
      (window.matchMedia('(pointer: coarse)').matches ||
        window.matchMedia('(hover: none)').matches),
  );

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setSystemReducedMotion(query.matches);
    const onChange = (event: MediaQueryListEvent) => setSystemReducedMotion(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]) setInView(entries[0].isIntersecting);
      },
      { threshold: 0.05 },
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const sync = () => setTabHidden(document.hidden);
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, []);

  const reducedMotion = reducedMotionProp ?? systemReducedMotion;
  const animated = inView && !tabHidden;

  const motionValues = useMindyMotion({
    mood,
    eyeState,
    eyeLean,
    active: animated,
    reducedMotion,
    holdAfterMs,
  });

  useImperativeHandle(
    ref,
    () => ({
      trigger: (action: MindyAction) => motionValues.triggerAction(action),
    }),
    [motionValues],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!interactive || coarsePointer) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      motionValues.setGaze(nx, ny);
    },
    [interactive, coarsePointer, motionValues],
  );

  const handlePointerLeave = useCallback(() => {
    motionValues.setGaze(0, 0);
  }, [motionValues]);

  const handleClick = useCallback(() => {
    if (interactive) {
      motionValues.triggerAction('bounce');
    }
    onClick?.();
  }, [interactive, motionValues, onClick]);

  const colors = useMemo(() => deriveMindyColors(color), [color]);

  return (
    <motion.div
      ref={hostRef}
      aria-hidden
      className={`pointer-events-auto relative select-none ${className ?? ''}`}
      style={{
        width: '100%',
        maxWidth: size,
        aspectRatio: '1 / 1',
        cursor: interactive ? 'pointer' : 'default',
      }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      initial={{ scale: 0.88, opacity: 0, y: 6 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 18 }}
    >
      <MindyFigure
        motion={motionValues}
        mood={mood}
        colors={colors}
        hasNotification={hasNotification}
        animated={animated}
      />
    </motion.div>
  );
});
