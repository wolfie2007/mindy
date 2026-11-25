import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, Grid, Moon, RotateCcw, Sun } from 'lucide-react';
import {
  DEFAULT_EYE_LEAN,
  MINDY_EYE_STATES,
  MINDY_MOODS,
  Mindy,
  type MindyEyeState,
  type MindyMood,
} from './mindy';

const COLOR_SWATCHES = [
  { name: 'Cobalt', hex: '#006aed' },
  { name: 'Obsidian', hex: '#0c0d0e' },
  { name: 'Emerald', hex: '#059669' },
  { name: 'Crimson', hex: '#e11d48' },
  { name: 'Violet', hex: '#7c3aed' },
  { name: 'Amber', hex: '#d97706' },
  { name: 'Slate', hex: '#475569' },
] as const;

const SIZE_PRESETS = [48, 96, 160, 240] as const;

type ReducedMotionMode = 'auto' | 'on' | 'off';

export default function App() {
  const [mood, setMood] = useState<MindyMood>('idle');
  const [eyeOverride, setEyeOverride] = useState<MindyEyeState | 'auto'>('auto');
  const [eyeLean, setEyeLean] = useState<number>(DEFAULT_EYE_LEAN);
  const [color, setColor] = useState<string>('#006aed');
  const [size, setSize] = useState<number>(220);
  const [interactive, setInteractive] = useState<boolean>(true);
  const [hasNotification, setHasNotification] = useState<boolean>(false);
  const [reducedMode, setReducedMode] = useState<ReducedMotionMode>('auto');

  const [stageTheme, setStageTheme] = useState<'dark' | 'light'>('dark');
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // Keyboard shortcuts 1–8 for moods
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      const idx = Number(e.key) - 1;
      if (idx >= 0 && idx < MINDY_MOODS.length) {
        const next = MINDY_MOODS[idx];
        if (next) setMood(next);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const codeSnippet = useMemo(() => {
    const props: string[] = [];
    if (mood !== 'idle') props.push(`mood="${mood}"`);
    if (eyeOverride !== 'auto') props.push(`eyeState="${eyeOverride}"`);
    if (Math.abs(eyeLean - DEFAULT_EYE_LEAN) > 0.05) props.push(`eyeLean={${eyeLean}}`);
    if (color.toLowerCase() !== '#006aed') props.push(`color="${color}"`);
    if (size !== 240) props.push(`size={${size}}`);
    if (!interactive) props.push(`interactive={false}`);
    if (hasNotification) props.push(`hasNotification`);
    if (reducedMode !== 'auto') props.push(`reducedMotion={${reducedMode === 'on'}}`);

    if (props.length === 0) return '<Mindy />';
    if (props.length <= 2) return `<Mindy ${props.join(' ')} />`;
    return `<Mindy\n  ${props.join('\n  ')}\n/>`;
  }, [mood, eyeOverride, eyeLean, color, size, interactive, hasNotification, reducedMode]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard API unavailable
    }
  };

  const handleReset = () => {
    setMood('idle');
    setEyeOverride('auto');
    setEyeLean(DEFAULT_EYE_LEAN);
    setColor('#006aed');
    setSize(220);
    setInteractive(true);
    setHasNotification(false);
    setReducedMode('auto');
  };

  const isLightStage = stageTheme === 'light';

  return (
    <div className="flex min-h-screen flex-col bg-[#09090b] text-[#f4f4f5]">
      {/* Top Bar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.08] px-5 sm:px-7">
        <div className="flex items-center gap-3">
          <Mindy mood={mood} color={color} size={28} interactive={false} />
          <div className="flex items-baseline gap-2.5">
            <span className="text-sm font-semibold tracking-tight text-white">mindy</span>
            <span className="font-mono text-[11px] text-zinc-500">v0.1.0 · MIT</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/[0.07] hover:text-white"
            title="Reset all parameters"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </header>

      {/* Main Studio Workspace */}
      <main className="flex flex-1 flex-col lg:flex-row">
        {/* Left: Interactive Stage */}
        <section
          aria-label="Mascot Stage"
          className="relative flex flex-1 flex-col items-center justify-between p-5 sm:p-8"
        >
          <div
            className={`relative flex min-h-[380px] w-full flex-1 flex-col items-center justify-center overflow-hidden rounded-2xl border transition-colors duration-300 ${
              isLightStage
                ? 'border-black/[0.08] bg-[#f5f4f0] text-zinc-900'
                : 'border-white/[0.08] bg-[#0e0e12] text-zinc-100'
            }`}
          >
            {/* Optional subtle dot grid */}
            {showGrid && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-45"
                style={{
                  backgroundImage: isLightStage
                    ? 'radial-gradient(rgba(0,0,0,0.14) 1px, transparent 1px)'
                    : 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />
            )}

            {/* Corner registration marks */}
            <CornerMarks light={isLightStage} />

            {/* Stage Top-Right Controls */}
            <div className="absolute right-3.5 top-3.5 z-10 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowGrid((g) => !g)}
                aria-pressed={showGrid}
                title="Toggle stage grid"
                className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                  isLightStage
                    ? 'border-black/10 bg-white/70 text-zinc-700 hover:bg-white'
                    : 'border-white/10 bg-black/40 text-zinc-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Grid className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setStageTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
                title={isLightStage ? 'Switch to dark stage' : 'Switch to light stage'}
                className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                  isLightStage
                    ? 'border-black/10 bg-white/70 text-zinc-700 hover:bg-white'
                    : 'border-white/10 bg-black/40 text-zinc-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {isLightStage ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* Stage Top-Left Live Readout */}
            <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span
                className={`font-mono text-[11px] uppercase tracking-wider ${
                  isLightStage ? 'text-zinc-500' : 'text-zinc-500'
                }`}
              >
                {mood} · {size}px
              </span>
            </div>

            {/* Mindy Centerpiece */}
            <div className="relative z-10 flex items-center justify-center p-8">
              <Mindy
                mood={mood}
                eyeState={eyeOverride === 'auto' ? undefined : eyeOverride}
                eyeLean={eyeLean}
                color={color}
                size={size}
                interactive={interactive}
                hasNotification={hasNotification}
                reducedMotion={reducedMode === 'auto' ? undefined : reducedMode === 'on'}
              />
            </div>

            {/* Subtle interaction hint */}
            <p
              className={`pointer-events-none absolute bottom-3.5 font-mono text-[11px] ${
                isLightStage ? 'text-zinc-400' : 'text-zinc-600'
              }`}
            >
              {interactive ? 'Move pointer for gaze · Click to bounce · Keys 1–8' : 'Keys 1–8 for moods'}
            </p>
          </div>

          {/* Bottom Mood Bar */}
          <div className="mt-4 flex w-full flex-wrap items-center justify-center gap-1.5">
            {MINDY_MOODS.map((candidate, idx) => {
              const active = mood === candidate;
              return (
                <button
                  key={candidate}
                  type="button"
                  onClick={() => setMood(candidate)}
                  aria-pressed={active}
                  className={`group inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium capitalize transition-all ${
                    active
                      ? 'border-white/25 bg-white text-zinc-950 shadow-sm'
                      : 'border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:border-white/15 hover:bg-white/[0.06] hover:text-zinc-200'
                  }`}
                >
                  <span
                    className={`font-mono text-[10px] ${
                      active ? 'text-zinc-500' : 'text-zinc-600 group-hover:text-zinc-500'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  {candidate}
                </button>
              );
            })}
          </div>
        </section>

        {/* Right: Simple Tuning Panel */}
        <aside
          aria-label="Tuning Controls"
          className="w-full shrink-0 border-t border-white/[0.08] bg-[#0b0b0e] p-5 sm:p-6 lg:w-[372px] lg:border-l lg:border-t-0"
        >
          <div className="flex flex-col gap-6">
            {/* 1. Color */}
            <ControlSection label="Color" value={color.toUpperCase()}>
              <div className="flex flex-wrap items-center gap-2">
                {COLOR_SWATCHES.map((swatch) => {
                  const active = color.toLowerCase() === swatch.hex.toLowerCase();
                  return (
                    <button
                      key={swatch.hex}
                      type="button"
                      onClick={() => setColor(swatch.hex)}
                      title={swatch.name}
                      aria-label={`Color ${swatch.name}`}
                      aria-pressed={active}
                      className={`relative h-7 w-7 rounded-full border transition-transform hover:scale-110 ${
                        active
                          ? 'scale-110 border-white ring-2 ring-white/25'
                          : 'border-white/15'
                      }`}
                      style={{ backgroundColor: swatch.hex }}
                    />
                  );
                })}

                {/* Custom Color Picker */}
                <label
                  title="Custom hex color"
                  className="relative flex h-7 w-7 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-white/25 bg-white/[0.04] text-[11px] text-zinc-300 transition-colors hover:border-white/50"
                >
                  <span className="pointer-events-none font-mono">+</span>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    aria-label="Custom color picker"
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                </label>
              </div>
            </ControlSection>

            {/* 2. Face / Eyes */}
            <ControlSection
              label="Face / Eyes"
              value={eyeOverride === 'auto' ? 'auto' : eyeOverride}
            >
              <div className="flex flex-wrap gap-1.5">
                <Chip active={eyeOverride === 'auto'} onClick={() => setEyeOverride('auto')}>
                  Auto
                </Chip>
                {MINDY_EYE_STATES.map((state) => (
                  <Chip
                    key={state}
                    active={eyeOverride === state}
                    onClick={() => setEyeOverride(state)}
                  >
                    {state}
                  </Chip>
                ))}
              </div>

              {/* Eye Lean */}
              <div className="mt-3 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Eye lean</span>
                  <div className="flex items-center gap-2">
                    {Math.abs(eyeLean - DEFAULT_EYE_LEAN) > 0.05 && (
                      <button
                        type="button"
                        onClick={() => setEyeLean(DEFAULT_EYE_LEAN)}
                        className="font-mono text-[10px] text-zinc-500 underline hover:text-zinc-300"
                      >
                        reset
                      </button>
                    )}
                    <span className="font-mono tabular-nums text-zinc-300">
                      {eyeLean.toFixed(1)}°
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min={-24}
                  max={24}
                  step={0.5}
                  value={eyeLean}
                  onChange={(e) => setEyeLean(Number(e.target.value))}
                  className="studio-slider w-full bg-white/10"
                />
              </div>
            </ControlSection>

            {/* 3. Scale */}
            <ControlSection label="Size" value={`${size}px`}>
              <input
                type="range"
                min={48}
                max={320}
                step={4}
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="studio-slider w-full bg-white/10"
              />
              <div className="mt-2.5 flex gap-1.5">
                {SIZE_PRESETS.map((preset) => (
                  <Chip key={preset} active={size === preset} onClick={() => setSize(preset)}>
                    {preset}px
                  </Chip>
                ))}
              </div>
            </ControlSection>

            {/* 4. Behavior */}
            <ControlSection label="Behavior">
              <div className="flex flex-col gap-2">
                <ToggleRow
                  label="Pointer gaze & click bounce"
                  checked={interactive}
                  onChange={setInteractive}
                />
                <ToggleRow
                  label="Notification badge"
                  checked={hasNotification}
                  onChange={setHasNotification}
                />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-zinc-300">Reduced motion</span>
                  <div className="flex gap-1">
                    {(['auto', 'on', 'off'] as const).map((opt) => (
                      <Chip
                        key={opt}
                        active={reducedMode === opt}
                        onClick={() => setReducedMode(opt)}
                      >
                        {opt}
                      </Chip>
                    ))}
                  </div>
                </div>
              </div>
            </ControlSection>

            {/* 5. Export JSX */}
            <ControlSection label="JSX">
              <div className="relative rounded-xl border border-white/[0.08] bg-[#09090b] p-3">
                <pre className="overflow-x-auto pr-12 font-mono text-[11px] leading-relaxed text-zinc-300">
                  <code>{codeSnippet}</code>
                </pre>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.05] px-2 py-1 font-mono text-[10px] text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </ControlSection>
          </div>
        </aside>
      </main>
    </div>
  );
}

function ControlSection({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2.5 border-b border-white/[0.06] pb-5 last:border-b-0 last:pb-0">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
          {label}
        </span>
        {value && (
          <span className="font-mono text-[11px] tabular-nums text-zinc-500">{value}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium capitalize transition-colors ${
        active
          ? 'border-white/25 bg-white text-zinc-950'
          : 'border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:bg-white/[0.07] hover:text-zinc-200'
      }`}
    >
      {children}
    </button>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between py-0.5 text-left"
    >
      <span className="text-xs text-zinc-300">{label}</span>
      <span
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors ${
          checked
            ? 'border-white/20 bg-white'
            : 'border-white/10 bg-white/[0.06]'
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 rounded-full transition-transform ${
            checked ? 'translate-x-4 bg-zinc-950' : 'translate-x-0.5 bg-zinc-400'
          }`}
        />
      </span>
    </button>
  );
}

function CornerMarks({ light }: { light: boolean }) {
  const color = light ? 'text-black/20' : 'text-white/20';
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-3 font-mono text-[10px] ${color}`}>
      <span className="absolute left-0 top-0">+</span>
      <span className="absolute right-0 top-0">+</span>
      <span className="absolute bottom-0 left-0">+</span>
      <span className="absolute bottom-0 right-0">+</span>
    </div>
  );
}
