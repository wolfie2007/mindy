import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { motion } from 'motion/react';

import { MindyFigure } from './mindy-figure';
import { type MindyEyeState } from './eyes';
import { deriveMindyColors, type MindyMood } from './moods';
import { useMindyMotion } from './use-mindy-motion';

export interface MindyProps {
  mood?: MindyMood;
  /** Optional eye expression override (defaults to the mood's built-in expression). */
  eyeState?: MindyEyeState;
  /** Eye lean angle in degrees (default: -10.5). */
  eyeLean?: number;
  size?: number;
  color?: string;
  interactive?: boolean;
  hasNotification?: boolean;
  reducedMotion?: boolean;
  holdAfterMs?: number;
  className?: string;
  onClick?: () => void;
}

export function Mindy({
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
}: MindyProps) {
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
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setSystemReducedMotion(motionQuery.matches);
    const onMotionChange = (event: MediaQueryListEvent) => setSystemReducedMotion(event.matches);
    motionQuery.addEventListener('change', onMotionChange);
    return () => motionQuery.removeEventListener('change', onMotionChange);
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) setInView(entry.isIntersecting);
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
      style={{ width: size, height: size, cursor: interactive ? 'pointer' : 'default' }}
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
}
