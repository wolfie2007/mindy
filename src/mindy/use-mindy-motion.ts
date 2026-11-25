import { useEffect, useRef, useState } from 'react';
import {
  animate,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';
import {
  BASE_BODY_POINTS,
  applyHarmonicWobble,
  computeConservedScaleX,
  pointsToSvgPath,
} from './geometry';
import { computeSphericalEyeLayout, type MindyEyeState } from './eyes';
import { MOOD_CONFIGS, type MindyMood } from './moods';

export type MindyAction = 'bounce' | 'spin' | 'wiggle';

export interface MindyMotion {
  bodyD: MotionValue<string>;
  bobY: MotionValue<number>;
  bodyRotate: MotionValue<number>;
  shakeX: MotionValue<number>;
  scaleX: MotionValue<number>;
  scaleY: MotionValue<number>;
  grayAmount: MotionValue<number>;

  eyeState: MindyEyeState;
  eyeLeftD: MotionValue<string>;
  eyeRightD: MotionValue<string>;
  eyeVisible: MotionValue<number>;
  eyeGlintLeftX: MotionValue<number>;
  eyeGlintLeftY: MotionValue<number>;
  eyeGlintLeftR: MotionValue<number>;
  eyeGlintLeftOp: MotionValue<number>;
  eyeGlintRightX: MotionValue<number>;
  eyeGlintRightY: MotionValue<number>;
  eyeGlintRightR: MotionValue<number>;
  eyeGlintRightOp: MotionValue<number>;

  shadowScale: MotionValue<number>;
  shadowOpacity: MotionValue<number>;
  rippleRx: MotionValue<number>;
  rippleRy: MotionValue<number>;
  rippleOpacity: MotionValue<number>;

  orbitX: MotionValue<number>;
  orbitY: MotionValue<number>;
  orbitScale: MotionValue<number>;
  orbitFrontOp: MotionValue<number>;
  orbitBackOp: MotionValue<number>;
  orbitCrownGlow: MotionValue<number>;

  alertPipY: MotionValue<number>;
  alertPipScale: MotionValue<number>;
  alertPipOpacity: MotionValue<number>;

  cheekBlushOpacity: MotionValue<number>;
  glint1Scale: MotionValue<number>;
  glint2Scale: MotionValue<number>;
  glint3Scale: MotionValue<number>;
  glint4Scale: MotionValue<number>;
  glint5Scale: MotionValue<number>;
  glint6Scale: MotionValue<number>;
  excitedArcOffset: MotionValue<number>;

  questionY: MotionValue<number>;
  questionRotate: MotionValue<number>;
  questionOpacity: MotionValue<number>;
  mote1Y: MotionValue<number>;
  mote2Y: MotionValue<number>;

  metaballLeftX: MotionValue<number>;
  metaballLeftY: MotionValue<number>;
  metaballRightX: MotionValue<number>;
  metaballRightY: MotionValue<number>;
  metaballCenterX: MotionValue<number>;
  metaballCenterY: MotionValue<number>;

  badgeFloatY: MotionValue<number>;

  setGaze: (x: number, y: number) => void;
  triggerAction: (action: MindyAction) => void;
}

function projectOrbitPoint(
  t: number,
  speed: number,
  rx: number,
  ry: number,
  tiltDeg: number,
  cx = 100,
  cy = 96,
) {
  const angle = t * speed;
  const lx = rx * Math.cos(angle);
  const ly = ry * Math.sin(angle);
  const rad = (tiltDeg * Math.PI) / 180;
  const cosT = Math.cos(rad);
  const sinT = Math.sin(rad);

  const depth = Math.sin(angle);
  const isFront = depth >= 0;

  return {
    x: cx + lx * cosT - ly * sinT,
    y: cy + lx * sinT + ly * cosT,
    scale: 0.72 + ((depth + 1) / 2) * 0.45,
    frontOp: isFront ? 0.75 + depth * 0.25 : 0,
    backOp: isFront ? 0 : 0.2 + (1 + depth) * 0.35,
    crownGlow: Math.max(0, -depth) * 0.65,
  };
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

  useEffect(() => {
    const timer = setTimeout(() => setCurrentEyeState(targetEyeState), 45);
    return () => clearTimeout(timer);
  }, [targetEyeState]);

  const bodyD = useMotionValue<string>(pointsToSvgPath(BASE_BODY_POINTS));
  const bobY = useMotionValue(0);
  const swayRotate = useMotionValue(0);
  const actionRotate = useMotionValue(0);
  const bodyRotate = useTransform(
    [swayRotate, actionRotate],
    ([s, r]: number[]) => (s ?? 0) + (r ?? 0),
  );
  const shakeX = useMotionValue(0);
  const squashY = useMotionValue(1);
  const scaleX = useTransform(squashY, (sy) => computeConservedScaleX(sy ?? 1));
  const grayAmount = useMotionValue(0);

  const gazeRawX = useMotionValue(0);
  const gazeRawY = useMotionValue(0);
  const gazeEyeX = useSpring(gazeRawX, { stiffness: 420, damping: 28 });
  const gazeEyeY = useSpring(gazeRawY, { stiffness: 420, damping: 28 });
  const headGazeX = useSpring(gazeRawX, { stiffness: 120, damping: 18 });
  const headGazeY = useSpring(gazeRawY, { stiffness: 120, damping: 18 });

  const initialLayout = computeSphericalEyeLayout(0, 0, targetEyeState, 1, eyeLean);
  const eyeLeftD = useMotionValue<string>(initialLayout.leftD);
  const eyeRightD = useMotionValue<string>(initialLayout.rightD);
  const eyeVisible = useMotionValue(initialLayout.visible ? 1 : 0);
  const eyeGlintLeftX = useMotionValue(initialLayout.glintLeft.cx);
  const eyeGlintLeftY = useMotionValue(initialLayout.glintLeft.cy);
  const eyeGlintLeftR = useMotionValue(initialLayout.glintLeft.r);
  const eyeGlintLeftOp = useMotionValue(initialLayout.glintLeft.opacity);
  const eyeGlintRightX = useMotionValue(initialLayout.glintRight.cx);
  const eyeGlintRightY = useMotionValue(initialLayout.glintRight.cy);
  const eyeGlintRightR = useMotionValue(initialLayout.glintRight.r);
  const eyeGlintRightOp = useMotionValue(initialLayout.glintRight.opacity);

  const shadowScale = useMotionValue(1);
  const shadowOpacity = useMotionValue(0.42);
  const rippleRx = useMotionValue(24);
  const rippleRy = useMotionValue(4);
  const rippleOpacity = useMotionValue(0);

  const orbitX = useMotionValue(190);
  const orbitY = useMotionValue(96);
  const orbitScale = useMotionValue(1);
  const orbitFrontOp = useMotionValue(1);
  const orbitBackOp = useMotionValue(0);
  const orbitCrownGlow = useMotionValue(0);

  const alertPipY = useMotionValue(20);
  const alertPipScale = useMotionValue(0);
  const alertPipOpacity = useMotionValue(0);

  const cheekBlushOpacity = useMotionValue(0);
  const glint1Scale = useMotionValue(0);
  const glint2Scale = useMotionValue(0);
  const glint3Scale = useMotionValue(0);
  const glint4Scale = useMotionValue(0);
  const glint5Scale = useMotionValue(0);
  const glint6Scale = useMotionValue(0);
  const excitedArcOffset = useMotionValue(0);

  const questionY = useMotionValue(34);
  const questionRotate = useMotionValue(8);
  const questionOpacity = useMotionValue(0);
  const mote1Y = useMotionValue(24);
  const mote2Y = useMotionValue(44);

  const metaballLeftX = useMotionValue(100);
  const metaballLeftY = useMotionValue(110);
  const metaballRightX = useMotionValue(100);
  const metaballRightY = useMotionValue(110);
  const metaballCenterX = useMotionValue(100);
  const metaballCenterY = useMotionValue(110);

  const badgeFloatY = useMotionValue(0);

  const tRef = useRef(0);
  const nextBlinkRef = useRef(2.4);
  const blinkStartRef = useRef(0);
  const isDoubleBlinkRef = useRef(false);
  const blinkStageRef = useRef(0);
  const nextSaccadeRef = useRef(2.0);
  const saccadeHoldUntilRef = useRef(0);

  // Clean resets across mood transitions
  useEffect(() => {
    if (mood !== 'happy') cheekBlushOpacity.set(0);
    if (mood !== 'alert') alertPipOpacity.set(0);
    if (mood !== 'confused') questionOpacity.set(0);
    if (mood !== 'happy' && mood !== 'excited') {
      rippleOpacity.set(0);
      glint1Scale.set(0);
      glint2Scale.set(0);
      glint3Scale.set(0);
      glint4Scale.set(0);
      glint5Scale.set(0);
      glint6Scale.set(0);
    }
    if (mood !== 'thinking') {
      orbitFrontOp.set(0);
      orbitBackOp.set(0);
      orbitCrownGlow.set(0);
    }
  }, [
    mood,
    cheekBlushOpacity,
    alertPipOpacity,
    questionOpacity,
    rippleOpacity,
    glint1Scale,
    glint2Scale,
    glint3Scale,
    glint4Scale,
    glint5Scale,
    glint6Scale,
    orbitFrontOp,
    orbitBackOp,
    orbitCrownGlow,
  ]);

  useEffect(() => {
    if (!active) return;

    let last = performance.now() / 1000;
    const holdAt = holdAfterMs === undefined ? Infinity : tRef.current + holdAfterMs / 1000;

    const updateEyes = (blinkOpen: number) => {
      const layout = computeSphericalEyeLayout(
        gazeEyeX.get(),
        gazeEyeY.get(),
        currentEyeState,
        blinkOpen,
        eyeLean,
      );
      eyeLeftD.set(layout.leftD);
      eyeRightD.set(layout.rightD);
      eyeVisible.set(layout.visible ? 1 : 0);
      eyeGlintLeftX.set(layout.glintLeft.cx);
      eyeGlintLeftY.set(layout.glintLeft.cy);
      eyeGlintLeftR.set(layout.glintLeft.r);
      eyeGlintLeftOp.set(layout.glintLeft.opacity);
      eyeGlintRightX.set(layout.glintRight.cx);
      eyeGlintRightY.set(layout.glintRight.cy);
      eyeGlintRightR.set(layout.glintRight.r);
      eyeGlintRightOp.set(layout.glintRight.opacity);
    };

    const computeBlink = (t: number): number => {
      if (mood === 'loading') return 1.0;

      if (reducedMotion) {
        if (t < nextBlinkRef.current) return 1.0;
        const p = (t - nextBlinkRef.current) / 0.22;
        if (p >= 1.0) {
          nextBlinkRef.current = t + 3.0 + Math.random() * 2.0;
          return 1.0;
        }
        return p < 0.5 ? 1.0 - (p / 0.5) * 0.95 : 0.05 + ((p - 0.5) / 0.5) * 0.95;
      }

      if (t >= nextBlinkRef.current && blinkStageRef.current === 0) {
        blinkStartRef.current = t;
        blinkStageRef.current = 1;
        isDoubleBlinkRef.current = Math.random() < 0.3;
      }

      if (blinkStageRef.current === 1) {
        const p = (t - blinkStartRef.current) / 0.2;
        if (p >= 1.0) {
          if (isDoubleBlinkRef.current) {
            blinkStageRef.current = 2;
            blinkStartRef.current = t;
          } else {
            blinkStageRef.current = 0;
            nextBlinkRef.current = t + 2.2 + Math.random() * 1.8;
          }
          return 1.0;
        }
        return p < 0.38
          ? Math.max(0.04, 1.0 - Math.pow(p / 0.38, 2) * 0.96)
          : Math.min(1.0, 0.04 + Math.pow((p - 0.38) / 0.62, 1.3) * 0.96);
      }

      if (blinkStageRef.current === 2) {
        if (t - blinkStartRef.current >= 0.12) {
          blinkStageRef.current = 3;
          blinkStartRef.current = t;
        }
        return 1.0;
      }

      if (blinkStageRef.current === 3) {
        const p = (t - blinkStartRef.current) / 0.12;
        if (p >= 1.0) {
          blinkStageRef.current = 0;
          nextBlinkRef.current = t + 2.2 + Math.random() * 2.0;
          return 1.0;
        }
        return p < 0.42
          ? Math.max(0.05, 1.0 - Math.pow(p / 0.42, 2) * 0.95)
          : Math.min(1.0, 0.05 + Math.pow((p - 0.42) / 0.58, 1.2) * 0.95);
      }

      return 1.0;
    };

    const step = (timestampMs: number) => {
      const now = timestampMs / 1000;
      const dt = Math.min(now - last, 0.05);
      last = now;
      tRef.current += dt;
      const t = tRef.current;

      const wobAmp = reducedMotion ? 0.35 : config.wobAmp;
      const wobSpeed = reducedMotion ? 1.0 : config.wobSpeed;
      bodyD.set(
        pointsToSvgPath(applyHarmonicWobble(BASE_BODY_POINTS, t, wobAmp, wobSpeed, 100, 110)),
      );

      const blinkOpen = computeBlink(t);
      badgeFloatY.set(Math.sin(t * 1.8) * (reducedMotion ? 1.0 : 1.6));

      if (reducedMotion) {
        bobY.set(Math.sin(t * 1.2) * 1.4);
        swayRotate.set(0);
        squashY.set(1);
        cheekBlushOpacity.set(mood === 'happy' ? 0.72 : 0);
        alertPipOpacity.set(mood === 'alert' ? 1 : 0);
        alertPipScale.set(mood === 'alert' ? 1 : 0);
        alertPipY.set(16);
        questionOpacity.set(mood === 'confused' ? 1 : 0);
        questionY.set(34);
        questionRotate.set(8);
        glint1Scale.set(mood === 'happy' || mood === 'excited' ? 0.9 : 0);
        glint2Scale.set(mood === 'happy' || mood === 'excited' ? 0.8 : 0);
        glint3Scale.set(mood === 'happy' || mood === 'excited' ? 0.85 : 0);
        glint4Scale.set(mood === 'happy' || mood === 'excited' ? 0.75 : 0);

        if (mood === 'loading') {
          const sep = 68 * ((1 - Math.cos(((t % 2.8) / 2.8) * Math.PI * 2)) / 2);
          metaballCenterX.set(100);
          metaballCenterY.set(110);
          metaballLeftX.set(100 - sep);
          metaballLeftY.set(110);
          metaballRightX.set(100 + sep);
          metaballRightY.set(110);
          shadowScale.set(0.65 + (sep / 68) * 0.45);
          shadowOpacity.set(0.32 + (1 - sep / 68) * 0.14);
        }

        updateEyes(blinkOpen);
        frameId = requestAnimationFrame(step);
        return;
      }

      if (mood === 'idle' || mood === 'confused') {
        if (t >= nextSaccadeRef.current && saccadeHoldUntilRef.current === 0) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 0.08 + Math.random() * 0.14;
          gazeRawX.set(Math.cos(angle) * dist);
          gazeRawY.set(Math.sin(angle) * dist * 0.6);
          saccadeHoldUntilRef.current = t + 0.7 + Math.random() * 0.7;
        } else if (saccadeHoldUntilRef.current > 0 && t >= saccadeHoldUntilRef.current) {
          gazeRawX.set(0);
          gazeRawY.set(0);
          saccadeHoldUntilRef.current = 0;
          nextSaccadeRef.current = t + 2.2 + Math.random() * 2.0;
        }
      }

      if (mood === 'idle') {
        const breath = Math.sin(t * 1.35);
        bobY.set(breath * 2.2 + headGazeY.get() * 4.5);
        swayRotate.set(Math.sin(t * 0.85) * 1.4 + headGazeX.get() * 8.0);
        squashY.set(1 + 0.025 * breath);
        shadowScale.set(1 - 0.035 * breath);
        shadowOpacity.set(0.42 + 0.04 * breath);
      } else if (mood === 'thinking') {
        bobY.set(Math.sin(t * 1.6) * 2.2);
        swayRotate.set(3.2 + Math.sin(t * 0.8) * 1.2 + headGazeX.get() * 8.0);
        squashY.set(1.015 + Math.sin(t * 1.6) * 0.012);
        gazeRawX.set(0.36 + 0.12 * Math.sin(t * 1.35));
        gazeRawY.set(-0.5 + 0.08 * Math.cos(t * 2.6));

        const orb = projectOrbitPoint(t, 1.85, 88, 22, -13, 100, 96);
        orbitX.set(orb.x);
        orbitY.set(orb.y);
        orbitScale.set(orb.scale);
        orbitFrontOp.set(orb.frontOp);
        orbitBackOp.set(orb.backOp);
        orbitCrownGlow.set(orb.crownGlow);

        shadowScale.set(0.96);
        shadowOpacity.set(0.38);
      } else if (mood === 'loading') {
        const p = (t % 2.8) / 2.8;
        let sep = 0;
        let wave = 0;

        if (p >= 0.03 && p < 0.4) {
          const u = (p - 0.03) / 0.37;
          sep = ((1 - Math.cos(u * Math.PI)) / 2) * 68;
          wave = Math.sin(u * Math.PI) * 2.0;
        } else if (p >= 0.4 && p < 0.72) {
          const u = (p - 0.4) / 0.32;
          sep = 68 + Math.sin(u * Math.PI) * 4.0;
          wave = Math.sin(u * Math.PI * 2) * 6.5;
        } else if (p >= 0.72 && p < 0.97) {
          const u = (p - 0.72) / 0.25;
          sep = ((1 + Math.cos(u * Math.PI)) / 2) * 68;
          wave = Math.sin(u * Math.PI) * 2.5;
        }

        metaballCenterX.set(100);
        metaballCenterY.set(110 - wave * 0.35);
        metaballLeftX.set(100 - sep);
        metaballLeftY.set(110 + wave);
        metaballRightX.set(100 + sep);
        metaballRightY.set(110 - wave);
        bobY.set(0);
        swayRotate.set(0);
        squashY.set(1);
        shadowScale.set(0.65 + (sep / 68) * 0.55);
        shadowOpacity.set(0.3 + (1 - sep / 68) * 0.16);
      } else if (mood === 'alert') {
        // Alert: upright attentive perk + crisp periodic hop + body-locked '!'
        const cycle = (t % 1.45) / 1.45;
        const hop = cycle < 0.24 ? Math.sin((cycle / 0.24) * Math.PI) : 0;

        bobY.set(-5.0 - hop * 4.5 + Math.sin(t * 2.2) * 0.8);
        swayRotate.set(headGazeX.get() * 8.0);
        squashY.set(1.06 + hop * 0.06);

        alertPipY.set(16 - hop * 2.5 + Math.sin(t * 2.8) * 1.6);
        alertPipOpacity.set(1);
        shadowScale.set(0.86 - hop * 0.08);
        shadowOpacity.set(0.35 - hop * 0.08);
      } else if (mood === 'happy') {
        const p = (t % 0.95) / 0.95;
        const sinP = Math.sin(p * Math.PI);
        bobY.set(-13.0 * Math.pow(sinP, 1.35) + 2.5 * (1 - sinP));
        squashY.set(1.0 - 0.14 * Math.cos(p * Math.PI * 2));
        swayRotate.set(Math.sin(p * Math.PI * 2) * 2.0 + headGazeX.get() * 6.0);
        cheekBlushOpacity.set(0.62 + 0.28 * sinP);

        glint1Scale.set(Math.pow(Math.max(0, Math.sin(t * 2.8)), 1.6));
        glint2Scale.set(Math.pow(Math.max(0, Math.sin(t * 2.8 + 1.5)), 1.6));
        glint3Scale.set(Math.pow(Math.max(0, Math.sin(t * 2.8 + 3.1)), 1.6));
        glint4Scale.set(Math.pow(Math.max(0, Math.sin(t * 2.8 + 4.4)), 1.6));

        const ripP = (p + 0.06) % 1;
        rippleRx.set(42 + ripP * 38);
        rippleRy.set((42 + ripP * 38) * 0.14);
        rippleOpacity.set(Math.max(0, (1 - ripP * 1.4) * 0.55));

        shadowScale.set(0.7 + 0.4 * (1 - sinP));
        shadowOpacity.set(0.24 + 0.32 * (1 - sinP));
      } else if (mood === 'confused') {
        swayRotate.set(-13.5 + Math.sin(t * 1.6) * 2.8 + headGazeX.get() * 8.0);
        bobY.set(Math.sin(t * 1.6) * 2.2);
        squashY.set(1.0 + Math.sin(t * 1.6) * 0.015);
        gazeRawX.set(Math.sin(t * 1.2) * 0.35);
        gazeRawY.set(0.08 + Math.cos(t * 1.2) * 0.15);

        questionY.set(34 + Math.sin(t * 2.1 + 0.5) * 2.8);
        questionRotate.set(12 + Math.sin(t * 1.6) * -4.0);
        questionOpacity.set(1);
        mote1Y.set(22 + Math.sin(t * 2.4 + 1.2) * 2.5);
        mote2Y.set(42 + Math.sin(t * 2.0 + 2.5) * 2.2);
        shadowScale.set(0.98);
        shadowOpacity.set(0.4);
      } else if (mood === 'error') {
        // Pure physical wince: damped recoil shiver + tucked droop
        const cycle = (t % 2.3) / 2.3;
        const burst = cycle < 0.32 ? Math.sin((cycle / 0.32) * Math.PI * 5) * (1 - cycle / 0.32) : 0;

        shakeX.set(burst * 4.5);
        bobY.set(3.2 + Math.sin(t * 1.5) * 1.1);
        swayRotate.set(burst * 2.0 + Math.sin(t * 1.6) * 2.0);
        squashY.set(0.92 - Math.abs(burst) * 0.03 + Math.sin(t * 1.5) * 0.015);

        shadowScale.set(1.05);
        shadowOpacity.set(0.46);
      } else if (mood === 'excited') {
        const p = (t % 1.1) / 1.1;
        const hopPhase = p < 0.45 ? p / 0.45 : (p - 0.45) / 0.55;
        const hopHeight = p < 0.45 ? 8.5 : 14.5;
        const sinHop = Math.sin(hopPhase * Math.PI);

        bobY.set(-hopHeight * Math.pow(sinHop, 1.25) + 2.0 * (1 - sinHop));
        swayRotate.set(Math.sin(p * Math.PI * 4) * 2.8 + headGazeX.get() * 10.0);
        squashY.set(1.0 - 0.12 * Math.cos(hopPhase * Math.PI * 2));

        const ripP = (t % 0.55) / 0.55;
        rippleRx.set(40 + ripP * 44);
        rippleRy.set((40 + ripP * 44) * 0.14);
        rippleOpacity.set(Math.max(0, (1 - ripP) * 0.68));

        glint1Scale.set(Math.pow(Math.max(0, Math.sin(t * 4.4)), 1.3));
        glint2Scale.set(Math.pow(Math.max(0, Math.sin(t * 4.4 + 1.0)), 1.3));
        glint3Scale.set(Math.pow(Math.max(0, Math.sin(t * 4.4 + 2.1)), 1.3));
        glint4Scale.set(Math.pow(Math.max(0, Math.sin(t * 4.4 + 3.2)), 1.3));
        glint5Scale.set(Math.pow(Math.max(0, Math.sin(t * 4.4 + 4.2)), 1.3));
        glint6Scale.set(Math.pow(Math.max(0, Math.sin(t * 4.4 + 5.1)), 1.3));
        excitedArcOffset.set(-t * 145);

        shadowScale.set(0.72 + 0.36 * (1 - sinHop));
        shadowOpacity.set(0.25 + 0.28 * (1 - sinHop));
      }

      updateEyes(blinkOpen);

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
    config.wobAmp,
    config.wobSpeed,
    bodyD,
    bobY,
    swayRotate,
    squashY,
    shakeX,
    eyeLeftD,
    eyeRightD,
    eyeVisible,
    gazeRawX,
    gazeRawY,
    gazeEyeX,
    gazeEyeY,
    headGazeX,
    headGazeY,
    shadowScale,
    shadowOpacity,
    rippleRx,
    rippleRy,
    rippleOpacity,
    orbitX,
    orbitY,
    orbitScale,
    orbitFrontOp,
    orbitBackOp,
    orbitCrownGlow,
    alertPipY,
    alertPipScale,
    alertPipOpacity,
    cheekBlushOpacity,
    glint1Scale,
    glint2Scale,
    glint3Scale,
    glint4Scale,
    glint5Scale,
    glint6Scale,
    excitedArcOffset,
    questionY,
    questionRotate,
    questionOpacity,
    mote1Y,
    mote2Y,
    metaballLeftX,
    metaballLeftY,
    metaballRightX,
    metaballRightY,
    metaballCenterX,
    metaballCenterY,
    badgeFloatY,
    eyeGlintLeftX,
    eyeGlintLeftY,
    eyeGlintLeftR,
    eyeGlintLeftOp,
    eyeGlintRightX,
    eyeGlintRightY,
    eyeGlintRightR,
    eyeGlintRightOp,
  ]);

  useEffect(() => {
    if (mood === 'excited') {
      animate(actionRotate, [0, 360], { duration: 0.9, ease: [0.22, 1, 0.36, 1] });
    }
    if (mood === 'alert') {
      animate(squashY, [0.84, 1.14, 1.06], { duration: 0.38, ease: 'easeOut' });
      animate(alertPipScale, [0, 1.25, 0.94, 1], { duration: 0.48, ease: 'easeOut' });
    } else {
      animate(alertPipScale, 0, { duration: 0.15 });
    }
    if (mood === 'error') {
      animate(shakeX, [0, -10, 8, -6, 4, -2, 0], { duration: 0.5, ease: 'easeOut' });
      animate(grayAmount, [0, 0.38, 0.12], { duration: 0.9, times: [0, 0.25, 1] });
    } else {
      animate(grayAmount, 0, { duration: 0.2 });
      animate(shakeX, 0, { duration: 0.15 });
    }
  }, [mood, actionRotate, squashY, alertPipScale, shakeX, grayAmount]);

  return {
    bodyD,
    bobY,
    bodyRotate,
    shakeX,
    scaleX,
    scaleY: squashY,
    grayAmount,
    eyeState: currentEyeState,
    eyeLeftD,
    eyeRightD,
    eyeVisible,
    eyeGlintLeftX,
    eyeGlintLeftY,
    eyeGlintLeftR,
    eyeGlintLeftOp,
    eyeGlintRightX,
    eyeGlintRightY,
    eyeGlintRightR,
    eyeGlintRightOp,
    shadowScale,
    shadowOpacity,
    rippleRx,
    rippleRy,
    rippleOpacity,
    orbitX,
    orbitY,
    orbitScale,
    orbitFrontOp,
    orbitBackOp,
    orbitCrownGlow,
    alertPipY,
    alertPipScale,
    alertPipOpacity,
    cheekBlushOpacity,
    glint1Scale,
    glint2Scale,
    glint3Scale,
    glint4Scale,
    glint5Scale,
    glint6Scale,
    excitedArcOffset,
    questionY,
    questionRotate,
    questionOpacity,
    mote1Y,
    mote2Y,
    metaballLeftX,
    metaballLeftY,
    metaballRightX,
    metaballRightY,
    metaballCenterX,
    metaballCenterY,
    badgeFloatY,
    setGaze: (x: number, y: number) => {
      gazeRawX.set(Math.max(-1, Math.min(1, x)));
      gazeRawY.set(Math.max(-1, Math.min(1, y)));
    },
    triggerAction: (action: MindyAction) => {
      if (action === 'bounce') {
        animate(squashY, [1, 0.74, 1.24, 0.92, 1.05, 1], {
          duration: 0.72,
          ease: [0.34, 1.56, 0.64, 1],
        });
      } else if (action === 'spin') {
        animate(actionRotate, [0, 360], {
          duration: 0.85,
          ease: [0.22, 1, 0.36, 1],
        });
      } else if (action === 'wiggle') {
        animate(shakeX, [0, -9, 9, -7, 7, -3, 3, 0], {
          duration: 0.48,
          ease: 'easeInOut',
        });
      }
    },
  };
}
