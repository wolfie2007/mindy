import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Copy, Grid, Link2, Moon, RotateCcw, Sun } from 'lucide-react';
import {
  DEFAULT_EYE_LEAN,
  MINDY_EYE_STATES,
  MINDY_MOODS,
  Mindy,
  type MindyEyeState,
  type MindyHandle,
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
type CodeTab = 'usage' | 'setup';

function readInitialState() {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const moodParam = params.get('mood') as MindyMood | null;
  const eyeParam = params.get('eye') as MindyEyeState | null;
  const colorParam = params.get('color');
  const sizeParam = Number(params.get('size'));
  const leanParam = Number(params.get('lean'));

  return {
    mood: moodParam && MINDY_MOODS.includes(moodParam) ? moodParam : undefined,
    eye: eyeParam && MINDY_EYE_STATES.includes(eyeParam) ? eyeParam : undefined,
    color:
      colorParam && /^#?[0-9a-fA-F]{6}$/.test(colorParam)
        ? colorParam.startsWith('#')
          ? colorParam
          : `#${colorParam}`
        : undefined,
    size: Number.isFinite(sizeParam) && sizeParam >= 48 && sizeParam <= 320 ? sizeParam : undefined,
    lean: Number.isFinite(leanParam) && leanParam >= -24 && leanParam <= 24 ? leanParam : undefined,
    badge: params.get('badge') === '1',
  };
}

export default function App() {
  const initial = useMemo(() => readInitialState(), []);
  const mindyRef = useRef<MindyHandle>(null);

  const [mood, setMood] = useState<MindyMood>(initial.mood ?? 'idle');
  const [eyeOverride, setEyeOverride] = useState<MindyEyeState | 'auto'>(initial.eye ?? 'auto');
  const [eyeLean, setEyeLean] = useState<number>(initial.lean ?? DEFAULT_EYE_LEAN);
  const [color, setColor] = useState<string>(initial.color ?? '#006aed');
  const [hexInput, setHexInput] = useState<string>(initial.color ?? '#006aed');
  const [size, setSize] = useState<number>(initial.size ?? 220);
  const [interactive, setInteractive] = useState<boolean>(true);
  const [hasNotification, setHasNotification] = useState<boolean>(initial.badge ?? false);
  const [reducedMode, setReducedMode] = useState<ReducedMotionMode>('auto');

  const [stageTheme, setStageTheme] = useState<'dark' | 'light'>('dark');
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [codeTab, setCodeTab] = useState<CodeTab>('usage');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Keyboard shortcuts 1–8 for moods
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const idx = Number(e.key) - 1;
      if (idx >= 0 && idx < MINDY_MOODS.length) {
        const next = MINDY_MOODS[idx];
        if (next) setMood(next);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleHexChange = (value: string) => {
    setHexInput(value);
    const normalized = value.startsWith('#') ? value : `#${value}`;
    if (/^#[0-9a-fA-F]{6}$/.test(normalized)) {
      setColor(normalized.toLowerCase());
    }
  };

  const selectSwatch = (hex: string) => {
    setColor(hex);
    setHexInput(hex);
  };

  const jsxSnippet = useMemo(() => {
    const props: string[] = [];
    if (mood !== 'idle') props.push(`mood="${mood}"`);
    if (eyeOverride !== 'auto') props.push(`eyeState="${eyeOverride}"`);
    if (Math.abs(eyeLean - DEFAULT_EYE_LEAN) > 0.05) props.push(`eyeLean={${eyeLean}}`);
    if (color.toLowerCase() !== '#006aed') props.push(`color="${color}"`);
    if (size !== 240) props.push(`size={${size}}`);
    if (!interactive) props.push(`interactive={false}`);
    if (hasNotification) props.push(`hasNotification`);
    if (reducedMode !== 'auto') props.push(`reducedMotion={${reducedMode === 'on'}}`);

    if (props.length === 0) return `<Mindy />`;
    if (props.length <= 2) return `<Mindy ${props.join(' ')} />`;
    return `<Mindy\n  ${props.join('\n  ')}\n/>`;
  }, [mood, eyeOverride, eyeLean, color, size, interactive, hasNotification, reducedMode]);

  const setupSnippet = useMemo(
    () =>
      `# 1. Install peer dependency\nnpm install motion\n\n# 2. Copy src/mindy/ into your project\n# 3. Render Mindy anywhere:\nimport { Mindy } from './mindy';\n\nexport function App() {\n  return ${jsxSnippet.replace(/\n/g, '\n  ')};\n}`,
    [jsxSnippet],
  );

  const activeSnippet = codeTab === 'usage' ? jsxSnippet : setupSnippet;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(activeSnippet);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1600);
    } catch {
      // Clipboard unavailable
    }
  };

  const copyShareUrl = async () => {
    try {
      const url = new URL(window.location.href);
      url.search = '';
      if (mood !== 'idle') url.searchParams.set('mood', mood);
      if (eyeOverride !== 'auto') url.searchParams.set('eye', eyeOverride);
      if (Math.abs(eyeLean - DEFAULT_EYE_LEAN) > 0.05) url.searchParams.set('lean', String(eyeLean));
      if (color.toLowerCase() !== '#006aed') url.searchParams.set('color', color.replace('#', ''));
      if (size !== 220) url.searchParams.set('size', String(size));
      if (hasNotification) url.searchParams.set('badge', '1');

      window.history.replaceState({}, '', url.toString());
      await navigator.clipboard.writeText(url.toString());
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 1600);
    } catch {
      // Clipboard unavailable
    }
  };

  const handleReset = () => {
    setMood('idle');
    setEyeOverride('auto');
    setEyeLean(DEFAULT_EYE_LEAN);
    setColor('#006aed');
    setHexInput('#006aed');
    setSize(220);
    setInteractive(true);
    setHasNotification(false);
    setReducedMode('auto');
    window.history.replaceState({}, '', window.location.pathname);
  };

  const isLightStage = stageTheme === 'light';

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#09090b] text-[#f4f4f5]">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.1] px-4 sm:px-6">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Mindy mood={mood} color={color} size={28} interactive={false} />
          <div className="flex items-baseline gap-2.5">
            <span className="text-[15px] font-semibold tracking-tight text-white">Mindy</span>
            <span className="hidden text-xs text-[#a1a1aa] md:inline">
              Open-source animated mascot for React
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={copyShareUrl}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.12] bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-[#e4e4e7] transition-colors hover:bg-white/[0.09] hover:text-white"
            title="Copy shareable link with current tuning"
          >
            {copiedLink ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Copied</span>
              </>
            ) : (
              <>
                <Link2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Share</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.12] bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-[#e4e4e7] transition-colors hover:bg-white/[0.09] hover:text-white"
            title="Reset all controls"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <a
            href="https://github.com/wolfie2007/mindy"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.14] bg-white px-3 py-1.5 text-xs font-semibold text-zinc-950 transition-opacity hover:opacity-90"
          >
            GitHub
          </a>
        </div>
      </header>

      {/* Main Studio */}
      <main className="flex flex-1 flex-col lg:flex-row">
        {/* Stage */}
        <section
          aria-label="Mascot Stage"
          className="flex flex-1 flex-col p-3 sm:p-6"
        >
          <div
            className={`relative flex min-h-[340px] w-full flex-1 flex-col items-center justify-between overflow-hidden rounded-2xl border p-3 transition-colors duration-300 sm:min-h-[440px] sm:p-4 ${
              isLightStage
                ? 'border-black/[0.1] bg-[#f5f4f0] text-zinc-900'
                : 'border-white/[0.1] bg-[#0e0e13] text-zinc-100'
            }`}
          >
            {showGrid && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                  backgroundImage: isLightStage
                    ? 'radial-gradient(rgba(0,0,0,0.16) 1px, transparent 1px)'
                    : 'radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />
            )}

            {/* Top bar inside stage */}
            <div className="relative z-10 flex w-full items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {(['bounce', 'spin', 'wiggle'] as const).map((action) => (
                  <button
                    key={action}
                    type="button"
                    onClick={() => mindyRef.current?.trigger(action)}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                      isLightStage
                        ? 'border-black/10 bg-white/85 text-zinc-800 hover:bg-white'
                        : 'border-white/12 bg-black/45 text-zinc-200 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {action}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowGrid((g) => !g)}
                  aria-pressed={showGrid}
                  title="Toggle dot grid"
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                    isLightStage
                      ? 'border-black/10 bg-white/85 text-zinc-800 hover:bg-white'
                      : 'border-white/12 bg-black/45 text-zinc-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Grid className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setStageTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
                  title={isLightStage ? 'Switch to dark backdrop' : 'Switch to light backdrop'}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                    isLightStage
                      ? 'border-black/10 bg-white/85 text-zinc-800 hover:bg-white'
                      : 'border-white/12 bg-black/45 text-zinc-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {isLightStage ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Center area: Left mood rail (desktop) + Mindy */}
            <div className="relative z-10 flex w-full flex-1 flex-col items-center justify-center py-4 md:py-0">
              {/* Desktop: vertical mood rail inside left side of stage */}
              <div
                role="group"
                aria-label="Moods"
                className="hidden md:absolute md:left-0 md:top-1/2 md:z-20 md:flex md:-translate-y-1/2 md:flex-col md:gap-1.5"
              >
                {MINDY_MOODS.map((candidate) => {
                  const active = mood === candidate;
                  return (
                    <button
                      key={candidate}
                      type="button"
                      onClick={() => setMood(candidate)}
                      aria-pressed={active}
                      className={`rounded-xl border px-3 py-1.5 text-left text-[13px] font-medium capitalize transition-all ${
                        active
                          ? isLightStage
                            ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm'
                            : 'border-white bg-white text-zinc-950 shadow-sm'
                          : isLightStage
                            ? 'border-black/[0.1] bg-white/80 text-zinc-700 hover:border-black/25 hover:bg-white hover:text-zinc-950'
                            : 'border-white/[0.12] bg-black/45 text-[#d4d4d8] hover:border-white/25 hover:bg-white/[0.1] hover:text-white'
                      }`}
                    >
                      {candidate}
                    </button>
                  );
                })}
              </div>

              {/* Mindy centered (slightly padded left on md+ so it never crowds the rail) */}
              <div className="flex max-w-full items-center justify-center px-4 md:pl-24">
                <Mindy
                  ref={mindyRef}
                  mood={mood}
                  eyeState={eyeOverride === 'auto' ? undefined : eyeOverride}
                  eyeLean={eyeLean}
                  color={color}
                  size={size}
                  interactive={interactive}
                  hasNotification={hasNotification}
                  reducedMotion={reducedMode === 'auto' ? undefined : reducedMode === 'on'}
                  className="max-w-full"
                />
              </div>
            </div>

            {/* Bottom inside stage: mobile mood pills + desktop hint */}
            <div className="relative z-10 flex w-full flex-col items-center gap-2.5">
              {/* Mobile mood pills inside bottom of stage */}
              <div
                role="group"
                aria-label="Moods"
                className="flex w-full flex-wrap items-center justify-center gap-1.5 md:hidden"
              >
                {MINDY_MOODS.map((candidate) => {
                  const active = mood === candidate;
                  return (
                    <button
                      key={candidate}
                      type="button"
                      onClick={() => setMood(candidate)}
                      aria-pressed={active}
                      className={`rounded-full border px-3 py-1 text-xs font-medium capitalize transition-all ${
                        active
                          ? isLightStage
                            ? 'border-zinc-900 bg-zinc-900 text-white'
                            : 'border-white bg-white text-zinc-950'
                          : isLightStage
                            ? 'border-black/[0.12] bg-white/80 text-zinc-700'
                            : 'border-white/[0.12] bg-black/45 text-[#d4d4d8]'
                      }`}
                    >
                      {candidate}
                    </button>
                  );
                })}
              </div>

              {interactive && (
                <p
                  className={`pointer-events-none text-center text-[11px] sm:text-xs ${
                    isLightStage ? 'text-zinc-600' : 'text-zinc-400'
                  }`}
                >
                  <span className="hidden sm:inline">Hover Mindy to steer her gaze · Click to bounce</span>
                  <span className="sm:hidden">Tap Mindy to bounce</span>
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Right / Mobile Bottom: Tuning & Export Panel */}
        <aside
          aria-label="Tuning Controls"
          className="w-full min-w-0 shrink-0 border-t border-white/[0.1] bg-[#0c0c10] p-4 sm:p-6 lg:w-[392px] lg:border-l lg:border-t-0"
        >
          <div className="flex flex-col gap-5">
            {/* Color */}
            <Section label="Color">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {COLOR_SWATCHES.map((swatch) => {
                    const active = color.toLowerCase() === swatch.hex.toLowerCase();
                    return (
                      <button
                        key={swatch.hex}
                        type="button"
                        onClick={() => selectSwatch(swatch.hex)}
                        title={swatch.name}
                        aria-label={`Color ${swatch.name}`}
                        aria-pressed={active}
                        className={`h-7 w-7 rounded-full border transition-transform hover:scale-110 ${
                          active
                            ? 'scale-110 border-white ring-2 ring-white/30'
                            : 'border-white/20'
                        }`}
                        style={{ backgroundColor: swatch.hex }}
                      />
                    );
                  })}

                  <label
                    title="Custom color picker"
                    className="relative flex h-7 w-7 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-white/35 bg-white/[0.05] text-xs text-white transition-colors hover:border-white/60"
                  >
                    <span className="pointer-events-none">+</span>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => selectSwatch(e.target.value)}
                      aria-label="Custom color picker"
                      className="absolute inset-0 cursor-pointer opacity-0"
                    />
                  </label>
                </div>

                <input
                  type="text"
                  value={hexInput}
                  onChange={(e) => handleHexChange(e.target.value)}
                  maxLength={7}
                  spellCheck={false}
                  aria-label="Hex color code"
                  className="w-[84px] rounded-lg border border-white/[0.14] bg-[#09090b] px-2.5 py-1.5 font-mono text-xs text-white outline-none focus:border-white/40"
                />
              </div>
            </Section>

            {/* Face & Eyes */}
            <Section label="Face & eyes" readout={eyeOverride === 'auto' ? 'Auto' : eyeOverride}>
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

              <div className="mt-3 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs text-[#d4d4d8]">
                  <span>Eye tilt</span>
                  <div className="flex items-center gap-2">
                    {Math.abs(eyeLean - DEFAULT_EYE_LEAN) > 0.05 && (
                      <button
                        type="button"
                        onClick={() => setEyeLean(DEFAULT_EYE_LEAN)}
                        className="text-[11px] text-[#a1a1aa] underline hover:text-white"
                      >
                        Reset
                      </button>
                    )}
                    <span className="font-mono tabular-nums text-white">
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
                  aria-label="Eye tilt angle"
                  className="studio-slider w-full bg-white/15"
                />
              </div>
            </Section>

            {/* Size */}
            <Section label="Size" readout={`${size}px`}>
              <input
                type="range"
                min={48}
                max={320}
                step={4}
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                aria-label="Mascot size"
                className="studio-slider w-full bg-white/15"
              />
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {SIZE_PRESETS.map((preset) => (
                  <Chip key={preset} active={size === preset} onClick={() => setSize(preset)}>
                    {preset}px
                  </Chip>
                ))}
              </div>
            </Section>

            {/* Behavior */}
            <Section label="Behavior">
              <div className="flex flex-col gap-2.5">
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
                <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                  <span className="text-[13px] text-[#e4e4e7]">Reduced motion</span>
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
            </Section>

            {/* Get the Code */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 rounded-lg border border-white/[0.1] bg-[#09090b] p-0.5">
                  {(['usage', 'setup'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setCodeTab(tab)}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                        codeTab === tab
                          ? 'bg-white text-zinc-950'
                          : 'text-[#a1a1aa] hover:text-white'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={copyCode}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.14] bg-white/[0.05] px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-white/[0.12]"
                >
                  {copiedCode ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="rounded-xl border border-white/[0.1] bg-[#09090b] p-3.5">
                <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-[#e4e4e7]">
                  <code>{activeSnippet}</code>
                </pre>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

function Section({
  label,
  readout,
  children,
}: {
  label: string;
  readout?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2.5 border-b border-white/[0.08] pb-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wide text-[#e4e4e7]">{label}</span>
        {readout && (
          <span className="font-mono text-xs tabular-nums text-[#a1a1aa] capitalize">
            {readout}
          </span>
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
      className={`rounded-lg border px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
        active
          ? 'border-white bg-white text-zinc-950'
          : 'border-white/[0.12] bg-white/[0.04] text-[#d4d4d8] hover:border-white/25 hover:bg-white/[0.08] hover:text-white'
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
      <span className="text-[13px] text-[#e4e4e7]">{label}</span>
      <span
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors ${
          checked ? 'border-white bg-white' : 'border-white/20 bg-white/[0.08]'
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 rounded-full transition-transform ${
            checked ? 'translate-x-4 bg-zinc-950' : 'translate-x-0.5 bg-zinc-300'
          }`}
        />
      </span>
    </button>
  );
}
