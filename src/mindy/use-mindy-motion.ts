/**
 * Master Motion Engine for Mindy Mascot.
 *
 * Implements hardware-accelerated continuous physics:
 * 1. Biological Stochastic Blinking (2.2s-3.8s interval, 30% double-blinks).
 * 2. Closed-Path Vector Eyes with 3D Spherical Geodesic Projection.
 * 3. Decoupled Gaze Lead & Head Lag.
 * 4. Autonomous Micro-Saccades during Idle / Confused.
 * 5. Volume-Conserved Mass Dynamics (scaleX = 1 / sqrt(scaleY)).
 * 6. Molten Liquid Loading State via SVG Goo Filter.
 */

import { useEffect, useRef, useState } from 'react';
import { useMotionValue, useSpring, useTransform, animate, type MotionValue } from 'motion/react';
import {
  SHAPE_POINTS,
  applyHarmonicWobble,
  pointsToSvgPath,
  computeConservedScaleX,
} from './geometry';
import { type MindyMood, MOOD_CONFIGS } from './moods';
import { computeSphericalEyeLayout, type MindyEyeState } from './eyes';
import { type RibbonMode } from './ribbons';

export interface MindyMotion {
  time: MotionValue<number>;
  bodyD: MotionValue<string>;
  bobY: MotionValue<number>;
  bodyRotate: MotionValue<number>;
  shakeX: MotionValue<number>;
  scaleX: MotionValue<number>;
  scaleY: MotionValue<number>;
  grayAmount: MotionValue<number>;

  eyeState: MindyEyeState;
  eyeScaleY: MotionValue<number>;
  eyeLeftD: MotionValue<string>;
  eyeRightD: MotionValue<string>;
  eyeLeftOp: MotionValue<number>;
  eyeRightOp: MotionValue<number>;

  acousticPingRadius: MotionValue<number>;
  acousticPingOpacity: MotionValue<number>;
  alertPulseScale: MotionValue<number>;

  neuralCoronaScale: MotionValue<number>;
  neuralCoronaOpacity: MotionValue<number>;
  synapticProgress: MotionValue<number>;

  impactRippleScale: MotionValue<number>;
  impactRippleOpacity: MotionValue<number>;
  sparkleScale: MotionValue<number>;
  sparkleRotate: MotionValue<number>;

  cheekBlushOpacity: MotionValue<number>;
  alertPipY: MotionValue<number>;
  alertPipScale: MotionValue<number>;
  alertPipOpacity: MotionValue<number>;

  questionGlyphY: MotionValue<number>;
  questionGlyphOpacity: MotionValue<number>;
  questionGlyphRotate: MotionValue<number>;

  synapticPulsePhase: MotionValue<number>;

  eyeGlintLeftX: MotionValue<number>;
  eyeGlintLeftY: MotionValue<number>;
  eyeGlintLeftR: MotionValue<number>;
  eyeGlintLeftOp: MotionValue<number>;
  eyeGlintRightX: MotionValue<number>;
  eyeGlintRightY: MotionValue<number>;
  eyeGlintRightR: MotionValue<number>;
  eyeGlintRightOp: MotionValue<number>;

  badgeFloatY: MotionValue<number>;

  metaballLeftX: MotionValue<number>;
  metaballLeftY: MotionValue<number>;
  metaballRightX: MotionValue<number>;
  metaballRightY: MotionValue<number>;
  metaballCenterX: MotionValue<number>;
  metaballCenterY: MotionValue<number>;
  metaballCenterR: MotionValue<number>;
  metaballOuterR: MotionValue<number>;
  metaballScale: MotionValue<number>;
  metaballOpacity: MotionValue<number>;

  ribbonMode: RibbonMode;
  ribbonOpacity: MotionValue<number>;

  shadowScale: MotionValue<number>;
  shadowOpacity: MotionValue<number>;

  setGaze: (x: number, y: number) => void;
  triggerAction: (action: 'exclamation' | 'spin' | 'jitter' | 'bounce') => void;
}

export function useMindyMotion({
  mood,
  eyeState: eyeStateOverride,
  eyeLean,
  active,
  reducedMotion,
  holdAfterMs,
}: {
  mood: MindyMood;
  eyeState?: MindyEyeState;
  eyeLean?: number;
  active: boolean;
  reducedMotion: boolean;
  holdAfterMs?: number;
}): MindyMotion {
  const config = MOOD_CONFIGS[mood];
  const targetEyeState = eyeStateOverride ?? config.eyeState;
  const [currentEyeState, setCurrentEyeState] = useState<MindyEyeState>(targetEyeState);
  const [currentRibbonMode, setCurrentRibbonMode] = useState<RibbonMode>(config.ribbonMode);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentEyeState(targetEyeState);
      setCurrentRibbonMode(config.ribbonMode);
    }, 45);
    return () => clearTimeout(timer);
  }, [mood, targetEyeState, config.ribbonMode]);

  const basePoints = SHAPE_POINTS.hybrid;
  const bodyD = useMotionValue<string>(pointsToSvgPath(basePoints));
  const time = useMotionValue(0);
  const bobY = useMotionValue(0);
  const swayRotate = useMotionValue(0);
  const actionRotate = useMotionValue(0);
  const bodyRotate = useTransform(
    [swayRotate, actionRotate],
    ([s, r]: number[]) => (s ?? 0) + (r ?? 0),
  );
  const shakeX = useMotionValue(0);
  const squashY = useMotionValue(1);
  const squashX = useTransform(squashY, (sy) => computeConservedScaleX(sy ?? 1));
  const grayAmount = useMotionValue(0);

  const eyeScaleY = useMotionValue(1);
  const initialLayout = computeSphericalEyeLayout(0, 0, targetEyeState, 1, eyeLean);
  const eyeLeftD = useMotionValue<string>(initialLayout.leftD);
  const eyeRightD = useMotionValue<string>(initialLayout.rightD);
  const eyeLeftOp = useMotionValue(1);
  const eyeRightOp = useMotionValue(1);

  const gazeRawX = useMotionValue(0);
  const gazeRawY = useMotionValue(0);
  const gazeEyeX = useSpring(gazeRawX, { stiffness: 420, damping: 28 });
  const gazeEyeY = useSpring(gazeRawY, { stiffness: 420, damping: 28 });
  const headGazeX = useSpring(gazeRawX, { stiffness: 120, damping: 18 });
  const headGazeY = useSpring(gazeRawY, { stiffness: 120, damping: 18 });

  const acousticPingRadius = useMotionValue(20);
  const acousticPingOpacity = useMotionValue(0);
  const alertPulseScale = useMotionValue(1);

  const neuralCoronaScale = useMotionValue(0.85);
  const neuralCoronaOpacity = useMotionValue(0);
  const synapticProgress = useMotionValue(0);

  const impactRippleScale = useMotionValue(0.8);
  const impactRippleOpacity = useMotionValue(0);
  const sparkleScale = useMotionValue(1);
  const sparkleRotate = useMotionValue(0);

  const badgeFloatY = useMotionValue(0);
  const cheekBlushOpacity = useMotionValue(0);
  const alertPipY = useMotionValue(22);
  const alertPipScale = useMotionValue(0);
  const alertPipOpacity = useMotionValue(0);
  const questionGlyphY = useMotionValue(46);
  const questionGlyphOpacity = useMotionValue(0);
  const questionGlyphRotate = useMotionValue(0);
  const synapticPulsePhase = useMotionValue(0);

  const eyeGlintLeftX = useMotionValue(initialLayout.glintLeft.cx);
  const eyeGlintLeftY = useMotionValue(initialLayout.glintLeft.cy);
  const eyeGlintLeftR = useMotionValue(initialLayout.glintLeft.r);
  const eyeGlintLeftOp = useMotionValue(initialLayout.glintLeft.opacity);
  const eyeGlintRightX = useMotionValue(initialLayout.glintRight.cx);
  const eyeGlintRightY = useMotionValue(initialLayout.glintRight.cy);
  const eyeGlintRightR = useMotionValue(initialLayout.glintRight.r);
  const eyeGlintRightOp = useMotionValue(initialLayout.glintRight.opacity);

  const metaballLeftX = useMotionValue(100);
  const metaballLeftY = useMotionValue(110);
  const metaballRightX = useMotionValue(100);
  const metaballRightY = useMotionValue(110);
  const metaballCenterX = useMotionValue(100);
  const metaballCenterY = useMotionValue(110);
  const metaballCenterR = useMotionValue(34);
  const metaballOuterR = useMotionValue(0.1);
  const metaballScale = useMotionValue(1);
  const metaballOpacity = useMotionValue(0);

  const ribbonOpacity = useMotionValue(0);
  const shadowScale = useMotionValue(1);
  const shadowOpacity = useMotionValue(0.45);

  const tRef = useRef(0);
  const nextBlinkRef = useRef(2.4);
  const blinkStartRef = useRef(0);
  const isDoubleBlinkRef = useRef(false);
  const blinkStageRef = useRef(0);

  const nextSaccadeRef = useRef(2.0);
  const saccadeHoldUntilRef = useRef(0);

  useEffect(() => {
    if (!active) return;

    let last = performance.now() / 1000;
    const holdAt = holdAfterMs === undefined ? Infinity : tRef.current + holdAfterMs / 1000;

    if (reducedMotion) {
      const stepReduced = (timestampMs: number) => {
        const now = timestampMs / 1000;
        const dt = Math.min(now - last, 0.05);
        last = now;
        tRef.current += dt;
        const t = tRef.current;
        time.set(t);

        const activePoints = applyHarmonicWobble(basePoints, t, 0.35, 1.0, 100, 110);
        bodyD.set(pointsToSvgPath(activePoints));

        bobY.set(Math.sin(t * 1.2) * 1.4);
        swayRotate.set(0);

        let currentBlinkScale = 1.0;
        if (mood !== 'loading') {
          if (t >= nextBlinkRef.current) {
            const blinkDuration = 0.22;
            const pBlink = (t - nextBlinkRef.current) / blinkDuration;
            if (pBlink >= 1.0) {
              nextBlinkRef.current = t + 3.0 + Math.random() * 2.0;
              currentBlinkScale = 1.0;
            } else {
              currentBlinkScale =
                pBlink < 0.5 ? 1.0 - (pBlink / 0.5) * 0.95 : 0.05 + ((pBlink - 0.5) / 0.5) * 0.95;
            }
          }
        }
        eyeScaleY.set(currentBlinkScale);

        const eyeLayout = computeSphericalEyeLayout(
          gazeEyeX.get(),
          gazeEyeY.get(),
          currentEyeState,
          currentBlinkScale,
          eyeLean,
        );
        eyeLeftD.set(eyeLayout.leftD);
        eyeRightD.set(eyeLayout.rightD);
        eyeLeftOp.set(eyeLayout.left.opacity);
        eyeRightOp.set(eyeLayout.right.opacity);

        eyeGlintLeftX.set(eyeLayout.glintLeft.cx);
        eyeGlintLeftY.set(eyeLayout.glintLeft.cy);
        eyeGlintLeftR.set(eyeLayout.glintLeft.r);
        eyeGlintLeftOp.set(eyeLayout.glintLeft.opacity);
        eyeGlintRightX.set(eyeLayout.glintRight.cx);
        eyeGlintRightY.set(eyeLayout.glintRight.cy);
        eyeGlintRightR.set(eyeLayout.glintRight.r);
        eyeGlintRightOp.set(eyeLayout.glintRight.opacity);

        badgeFloatY.set(Math.sin(t * 1.2) * 1.2);
        cheekBlushOpacity.set(mood === 'happy' ? 0.75 : 0);
        alertPipOpacity.set(mood === 'alert' ? 1.0 : 0);
        alertPipScale.set(mood === 'alert' ? 1.0 : 0);
        alertPipY.set(22);
        questionGlyphOpacity.set(mood === 'confused' ? 0.95 : 0);
        questionGlyphY.set(46);
        questionGlyphRotate.set(-6);

        if (mood === 'loading') {
          const p = (t % 2.8) / 2.8;
          const sep = 68 * ((1 - Math.cos(p * Math.PI * 2)) / 2);
          metaballCenterX.set(100);
          metaballCenterY.set(110);
          metaballCenterR.set(27);
          metaballLeftX.set(100 - sep);
          metaballLeftY.set(110);
          metaballRightX.set(100 + sep);
          metaballRightY.set(110);
          metaballOuterR.set(23);
          shadowScale.set(0.6 + (sep / 68) * 0.45);
          shadowOpacity.set(0.32 + (1 - sep / 68) * 0.14);
        }

        frameId = requestAnimationFrame(stepReduced);
      };

      let frameId = requestAnimationFrame(stepReduced);
      return () => cancelAnimationFrame(frameId);
    }

    const step = (timestampMs: number) => {
      const now = timestampMs / 1000;
      const dt = Math.min(now - last, 0.05);
      last = now;
      tRef.current += dt;
      const t = tRef.current;
      time.set(t);

      const activePoints = applyHarmonicWobble(
        basePoints,
        t,
        config.wobAmp,
        config.wobSpeed,
        100,
        110,
      );
      bodyD.set(pointsToSvgPath(activePoints));

      let currentBlinkScale = 1.0;
      if (mood !== 'loading') {
        if (t >= nextBlinkRef.current && blinkStageRef.current === 0) {
          blinkStartRef.current = t;
          blinkStageRef.current = 1;
          isDoubleBlinkRef.current = Math.random() < 0.3;
        }

        if (blinkStageRef.current === 1) {
          const blinkDuration = 0.2;
          const progress = (t - blinkStartRef.current) / blinkDuration;
          if (progress >= 1.0) {
            if (isDoubleBlinkRef.current) {
              blinkStageRef.current = 2;
              blinkStartRef.current = t;
            } else {
              blinkStageRef.current = 0;
              nextBlinkRef.current = t + 2.2 + Math.random() * 1.8;
            }
            currentBlinkScale = 1.0;
          } else if (progress < 0.38) {
            currentBlinkScale = Math.max(0.04, 1.0 - Math.pow(progress / 0.38, 2) * 0.96);
          } else {
            const rec = (progress - 0.38) / 0.62;
            currentBlinkScale = Math.min(1.0, 0.04 + Math.pow(rec, 1.3) * 0.96);
          }
        } else if (blinkStageRef.current === 2) {
          if (t - blinkStartRef.current >= 0.12) {
            blinkStageRef.current = 3;
            blinkStartRef.current = t;
          }
          currentBlinkScale = 1.0;
        } else if (blinkStageRef.current === 3) {
          const secondDuration = 0.12;
          const progress = (t - blinkStartRef.current) / secondDuration;
          if (progress >= 1.0) {
            blinkStageRef.current = 0;
            nextBlinkRef.current = t + 2.2 + Math.random() * 2.0;
            currentBlinkScale = 1.0;
          } else if (progress < 0.42) {
            currentBlinkScale = Math.max(0.05, 1.0 - Math.pow(progress / 0.42, 2) * 0.95);
          } else {
            const rec = (progress - 0.42) / 0.58;
            currentBlinkScale = Math.min(1.0, 0.05 + Math.pow(rec, 1.2) * 0.95);
          }
        }
      }
      eyeScaleY.set(currentBlinkScale);

      if (mood === 'idle' || mood === 'confused') {
        if (t >= nextSaccadeRef.current && saccadeHoldUntilRef.current === 0) {
          const glanceAngle = Math.random() * Math.PI * 2;
          const glanceDist = 0.08 + Math.random() * 0.14;
          gazeRawX.set(Math.cos(glanceAngle) * glanceDist);
          gazeRawY.set(Math.sin(glanceAngle) * glanceDist * 0.6);
          saccadeHoldUntilRef.current = t + 0.7 + Math.random() * 0.7;
        } else if (saccadeHoldUntilRef.current > 0 && t >= saccadeHoldUntilRef.current) {
          gazeRawX.set(0);
          gazeRawY.set(0);
          saccadeHoldUntilRef.current = 0;
          nextSaccadeRef.current = t + 2.2 + Math.random() * 2.0;
        }
      }

      badgeFloatY.set(Math.sin(t * 1.8) * 1.6);

      if (mood === 'idle') {
        const breath = Math.sin(t * 1.35);
        bobY.set(breath * 2.2 + headGazeY.get() * 4.5);
        swayRotate.set(Math.sin(t * 0.85) * 1.4 + headGazeX.get() * 8.0);
        squashY.set(1 + 0.025 * breath);
        shadowScale.set(1 - 0.035 * breath);
        shadowOpacity.set(0.42 + 0.04 * breath);
        cheekBlushOpacity.set(0);
        alertPipOpacity.set(0);
        questionGlyphOpacity.set(0);
        neuralCoronaOpacity.set(0);
        ribbonOpacity.set(0);
      } else if (mood === 'thinking') {
        bobY.set(Math.sin(t * 1.6) * 2.2);
        swayRotate.set(3.5 + Math.sin(t * 0.8) * 1.2 + headGazeX.get() * 8.0);
        gazeRawX.set(0.38 + 0.12 * Math.sin(t * 1.4));
        gazeRawY.set(-0.52 + 0.08 * Math.cos(t * 2.8));
        synapticProgress.set((t * 0.4) % 1);
        synapticPulsePhase.set((t * 0.8) % 1);
        neuralCoronaScale.set(0.95 + 0.08 * Math.sin(t * 2.2));
        neuralCoronaOpacity.set(0.75 + 0.25 * Math.sin(t * 2.2));
        cheekBlushOpacity.set(0);
        alertPipOpacity.set(0);
        questionGlyphOpacity.set(0);
      } else if (mood === 'loading') {
        const cyclePeriod = 2.8;
        const p = (t % cyclePeriod) / cyclePeriod;
        let sep = 0;
        let wave = 0;

        if (p < 0.03) {
          sep = 0;
          wave = 0;
        } else if (p < 0.4) {
          const u = (p - 0.03) / 0.37;
          sep = ((1 - Math.cos(u * Math.PI)) / 2) * 68;
          wave = Math.sin(u * Math.PI) * 2.0;
        } else if (p < 0.72) {
          const u = (p - 0.4) / 0.32;
          sep = 68 + Math.sin(u * Math.PI) * 4.0;
          wave = Math.sin(u * Math.PI * 2) * 6.5;
        } else if (p < 0.97) {
          const u = (p - 0.72) / 0.25;
          sep = ((1 + Math.cos(u * Math.PI)) / 2) * 68;
          wave = Math.sin(u * Math.PI) * 2.5;
        }

        metaballCenterX.set(100);
        metaballCenterY.set(110 - wave * 0.35);
        metaballCenterR.set(27);
        metaballLeftX.set(100 - sep);
        metaballLeftY.set(110 + wave);
        metaballRightX.set(100 + sep);
        metaballRightY.set(110 - wave);
        metaballOuterR.set(23);

        shadowScale.set(0.6 + (sep / 68) * 0.45);
        shadowOpacity.set(0.32 + (1 - sep / 68) * 0.14);
        bobY.set(0);
        cheekBlushOpacity.set(0);
        alertPipOpacity.set(0);
        questionGlyphOpacity.set(0);
      } else if (mood === 'alert') {
        bobY.set(-6 + Math.sin(t * 2.5) * 1.6);
        swayRotate.set(headGazeX.get() * 8.0);
        squashY.set(1.06 + 0.02 * Math.sin(t * 2.5));

        const pingProgress = (t % 1.2) / 1.2;
        acousticPingRadius.set(18 + pingProgress * 64);
        acousticPingOpacity.set(Math.max(0, (1 - pingProgress) * 0.85));
        alertPulseScale.set(1.0 + 0.08 * Math.sin(t * 3.5));

        alertPipY.set(22 + Math.sin(t * 3.5) * 3.0);
        alertPipScale.set(1.0 + 0.05 * Math.sin(t * 3.5));
        alertPipOpacity.set(1.0);
        cheekBlushOpacity.set(0);
        questionGlyphOpacity.set(0);
      } else if (mood === 'happy') {
        const bouncePeriod = 0.95;
        const p = (t % bouncePeriod) / bouncePeriod;
        const height = 13.0;
        const sinP = Math.sin(p * Math.PI);
        const yBounce = -height * Math.pow(sinP, 1.35);
        const sqY = 1.0 - 0.14 * Math.cos(p * Math.PI * 2);

        bobY.set(yBounce + 2.5 * (1 - sinP));
        squashY.set(sqY);
        swayRotate.set(Math.sin(p * Math.PI * 2) * 1.8 + headGazeX.get() * 6.0);
        cheekBlushOpacity.set(0.65 + 0.25 * sinP);
        sparkleScale.set(0.8 + 0.25 * sinP);
        sparkleRotate.set((t * 45) % 360);
        shadowScale.set(0.7 + 0.4 * (1 - sinP));
        shadowOpacity.set(0.24 + 0.32 * (1 - sinP));
        alertPipOpacity.set(0);
        questionGlyphOpacity.set(0);
      } else if (mood === 'confused') {
        swayRotate.set(-13.5 + Math.sin(t * 1.6) * 3.0 + headGazeX.get() * 8.0);
        bobY.set(Math.sin(t * 1.6) * 2.2);
        gazeRawX.set(Math.sin(t * 1.2) * 0.35);
        gazeRawY.set(0.08 + Math.cos(t * 1.2) * 0.15);
        questionGlyphY.set(46 + Math.sin(t * 2.0 + 0.6) * 3.5);
        questionGlyphRotate.set(-6 + Math.sin(t * 2.0) * 8.0);
        questionGlyphOpacity.set(0.95);
        alertPipOpacity.set(0);
        cheekBlushOpacity.set(0);
      } else if (mood === 'error') {
        shakeX.set(Math.sin(t * 7.5) * 2.0 * Math.exp(-0.25 * (t % 2.2)));
        bobY.set(Math.sin(t * 1.4) * 1.2);
        swayRotate.set(Math.sin(t * 1.8) * 3.5);
        squashY.set(0.95 + 0.03 * Math.sin(t * 1.4));
        alertPipOpacity.set(0);
        questionGlyphOpacity.set(0);
        cheekBlushOpacity.set(0);
      } else if (mood === 'excited') {
        const exPeriod = 1.1;
        const p = (t % exPeriod) / exPeriod;
        const hopPhase = p < 0.45 ? p / 0.45 : (p - 0.45) / 0.55;
        const hopHeight = p < 0.45 ? 8.0 : 14.0;
        const sinHop = Math.sin(hopPhase * Math.PI);
        const yHop = -hopHeight * Math.pow(sinHop, 1.25);
        const sqY = 1.0 - 0.12 * Math.cos(hopPhase * Math.PI * 2);

        bobY.set(yHop + 2.0 * (1 - sinHop));
        swayRotate.set(Math.sin(p * Math.PI * 4) * 2.8 + headGazeX.get() * 10.0);
        squashY.set(sqY);

        const ripP = (t % 0.55) / 0.55;
        impactRippleScale.set(0.8 + ripP * 0.65);
        impactRippleOpacity.set(Math.max(0, (1 - ripP) * 0.75));
        sparkleScale.set(0.85 + 0.25 * Math.sin(t * 4.5));
        sparkleRotate.set((t * 60) % 360);
        ribbonOpacity.set(1.0);
        alertPipOpacity.set(0);
        questionGlyphOpacity.set(0);
        cheekBlushOpacity.set(0);
      }

      const eyeLayout = computeSphericalEyeLayout(
        gazeEyeX.get(),
        gazeEyeY.get(),
        currentEyeState,
        currentBlinkScale,
        eyeLean,
      );

      eyeLeftD.set(eyeLayout.leftD);
      eyeRightD.set(eyeLayout.rightD);
      eyeLeftOp.set(eyeLayout.left.opacity);
      eyeRightOp.set(eyeLayout.right.opacity);

      eyeGlintLeftX.set(eyeLayout.glintLeft.cx);
      eyeGlintLeftY.set(eyeLayout.glintLeft.cy);
      eyeGlintLeftR.set(eyeLayout.glintLeft.r);
      eyeGlintLeftOp.set(eyeLayout.glintLeft.opacity);
      eyeGlintRightX.set(eyeLayout.glintRight.cx);
      eyeGlintRightY.set(eyeLayout.glintRight.cy);
      eyeGlintRightR.set(eyeLayout.glintRight.r);
      eyeGlintRightOp.set(eyeLayout.glintRight.opacity);

      if (t >= holdAt && blinkStageRef.current === 0) return;
      frameId = requestAnimationFrame(step);
    };

    let frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [
    active,
    reducedMotion,
    holdAfterMs,
    mood,
    currentEyeState,
    eyeLean,
    basePoints,
    config,
    bodyD,
    bobY,
    swayRotate,
    time,
    eyeScaleY,
    eyeLeftD,
    eyeRightD,
    eyeLeftOp,
    eyeRightOp,
    gazeRawX,
    gazeRawY,
    gazeEyeX,
    gazeEyeY,
    headGazeX,
    headGazeY,
    squashY,
    shadowScale,
    shadowOpacity,
    neuralCoronaScale,
    neuralCoronaOpacity,
    synapticProgress,
    sparkleScale,
    sparkleRotate,
    alertPulseScale,
    badgeFloatY,
    metaballLeftX,
    metaballLeftY,
    metaballRightX,
    metaballRightY,
    metaballCenterX,
    metaballCenterY,
    metaballCenterR,
    metaballOuterR,
    acousticPingRadius,
    acousticPingOpacity,
    shakeX,
    impactRippleScale,
    impactRippleOpacity,
    eyeGlintLeftX,
    eyeGlintLeftY,
    eyeGlintLeftR,
    eyeGlintLeftOp,
    eyeGlintRightX,
    eyeGlintRightY,
    eyeGlintRightR,
    eyeGlintRightOp,
    cheekBlushOpacity,
    alertPipY,
    alertPipScale,
    alertPipOpacity,
    questionGlyphY,
    questionGlyphOpacity,
    questionGlyphRotate,
    synapticPulsePhase,
    ribbonOpacity,
  ]);

  useEffect(() => {
    if (mood === 'alert') {
      animate(ribbonOpacity, 0, { duration: 0.2 });
      animate(metaballOpacity, 0, { duration: 0.2 });
    }

    if (mood === 'thinking') {
      animate(neuralCoronaOpacity, 1, { duration: 0.3 });
      animate(ribbonOpacity, 1, { duration: 0.35 });
      animate(metaballOpacity, 0, { duration: 0.2 });
    } else {
      animate(neuralCoronaOpacity, 0, { duration: 0.2 });
    }

    if (mood === 'loading') {
      animate(metaballOpacity, 1, { duration: 0.25 });
      animate(metaballScale, [0, 1.15, 1], { duration: 0.6, ease: 'backOut' });
      animate(ribbonOpacity, 0, { duration: 0.2 });
    } else {
      animate(metaballOpacity, 0, { duration: 0.2 });
      animate(metaballScale, 0, { duration: 0.2 });
    }

    if (mood === 'excited') {
      animate(actionRotate, [0, 360], { duration: 0.95, ease: [0.25, 1, 0.5, 1] });
      animate(ribbonOpacity, 1, { duration: 0.3 });
    }

    if (mood === 'error') {
      animate(shakeX, [0, -10, 8, -6, 4, -2, 0], { duration: 0.55, ease: 'easeOut' });
      animate(grayAmount, 0.55, { duration: 0.2 });
      setTimeout(() => animate(grayAmount, 0, { duration: 0.6 }), 1200);
    }
  }, [
    mood,
    neuralCoronaOpacity,
    ribbonOpacity,
    metaballOpacity,
    metaballScale,
    actionRotate,
    shakeX,
    grayAmount,
  ]);

  return {
    time,
    bodyD,
    bobY,
    bodyRotate,
    shakeX,
    scaleX: squashX,
    scaleY: squashY,
    grayAmount,
    eyeState: currentEyeState,
    eyeScaleY,
    eyeLeftD,
    eyeRightD,
    eyeLeftOp,
    eyeRightOp,
    eyeGlintLeftX,
    eyeGlintLeftY,
    eyeGlintLeftR,
    eyeGlintLeftOp,
    eyeGlintRightX,
    eyeGlintRightY,
    eyeGlintRightR,
    eyeGlintRightOp,
    cheekBlushOpacity,
    alertPipY,
    alertPipScale,
    alertPipOpacity,
    questionGlyphY,
    questionGlyphOpacity,
    questionGlyphRotate,
    synapticPulsePhase,
    acousticPingRadius,
    acousticPingOpacity,
    alertPulseScale,
    neuralCoronaScale,
    neuralCoronaOpacity,
    synapticProgress,
    impactRippleScale,
    impactRippleOpacity,
    sparkleScale,
    sparkleRotate,
    badgeFloatY,
    metaballLeftX,
    metaballLeftY,
    metaballRightX,
    metaballRightY,
    metaballCenterX,
    metaballCenterY,
    metaballCenterR,
    metaballOuterR,
    metaballScale,
    metaballOpacity,
    ribbonMode: currentRibbonMode,
    ribbonOpacity,
    shadowScale,
    shadowOpacity,
    setGaze: (x: number, y: number) => {
      gazeRawX.set(Math.max(-1, Math.min(1, x)));
      gazeRawY.set(Math.max(-1, Math.min(1, y)));
    },
    triggerAction: (action: 'exclamation' | 'spin' | 'jitter' | 'bounce') => {
      if (action === 'bounce') {
        animate(squashY, [1, 0.74, 1.26, 0.92, 1.05, 1], {
          duration: 0.75,
          ease: [0.34, 1.56, 0.64, 1],
        });
      } else if (action === 'spin') {
        animate(actionRotate, [0, 360], {
          duration: 0.85,
          ease: [0.25, 1, 0.5, 1],
        });
      } else if (action === 'jitter') {
        animate(shakeX, [0, -8, 8, -6, 6, -3, 3, 0], {
          duration: 0.45,
          ease: 'easeInOut',
        });
      }
    },
  };
}
