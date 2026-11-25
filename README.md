# Mindy

An open-source animated SVG mascot for React apps, AI assistants, and loading states.

I wanted a character that actually feels alive instead of a looping Lottie file or a static icon. Mindy is pure vector SVG driven by Motion springs and a small frame loop—she tracks your cursor with 3D-projected eyes, blinks naturally (with occasional double-blinks), squashes when you click her, and switches between 8 moods.

You can play with the colors, eye expressions, tilt, and moods in the [live tuning studio](https://mindymascot.vercel.app) and copy the exact `<Mindy />` JSX into your project.

---

## What's inside

- **8 expressive moods** — `idle`, `thinking`, `loading`, `alert`, `happy`, `confused`, `error`, and `excited`
- **3D spherical eye projection** — eyes wrap along a sphere with depth foreshortening, gaze lead, head lag, and idle micro-saccades
- **One-hex color theming** — pass any hex color (`color="#006aed"`) and Mindy derives her own 3D highlights, rim light, and shadows
- **Molten goo loader** — the `loading` state morphs into three coalescing liquid droplets using an SVG goo filter
- **Respects your browser** — pauses when off-screen or in a background tab, and scales down cleanly under `prefers-reduced-motion`
- **Interactive tuning studio** — test light/dark backdrops, tweak eye expressions and tilt, trigger actions, and copy ready-to-use JSX

---

## Run the tuning studio locally

```bash
git clone https://github.com/wolfie2007/mindy.git
cd mindy
npm install
npm run dev
```

---

## Use `<Mindy />` in your React app

Mindy only needs React (18 or 19) and `motion`.

```bash
npm install motion
```

Copy `src/mindy/` into your project and render `<Mindy />` anywhere:

```tsx
import { Mindy } from './mindy';

export function AssistantAvatar() {
  return (
    <Mindy
      mood="thinking"
      color="#006aed"
      size={180}
      interactive
    />
  );
}
```

### Triggering actions with a ref

If you want to make Mindy bounce, spin, or wiggle on an event (like a message arriving or a form error):

```tsx
import { useRef } from 'react';
import { Mindy, type MindyHandle } from './mindy';

export function Example() {
  const mindyRef = useRef<MindyHandle>(null);

  return (
    <>
      <Mindy ref={mindyRef} />
      <button onClick={() => mindyRef.current?.trigger('bounce')}>
        Bounce
      </button>
    </>
  );
}
```

---

## Props

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `mood` | `'idle' \| 'thinking' \| 'loading' \| 'alert' \| 'happy' \| 'confused' \| 'error' \| 'excited'` | `'idle'` | Sets Mindy's pose, animation loop, and mood effects |
| `eyeState` | `'capsule' \| 'happy' \| 'wide' \| 'wince' \| 'skeptical' \| 'slit' \| 'thinking' \| 'hidden'` | from `mood` | Overrides the default eye expression for the active mood |
| `eyeLean` | `number` | `-10.5` | Rotates the eyes in degrees |
| `size` | `number` | `240` | Width and height in pixels |
| `color` | `string` | `'#006aed'` | Base hex color used to compute 3D shading and rim light |
| `interactive` | `boolean` | `true` | Enables cursor gaze tracking and click-to-bounce |
| `hasNotification` | `boolean` | `false` | Renders a floating 3D notification pip |
| `reducedMotion` | `boolean` | system setting | Overrides `prefers-reduced-motion` |
| `holdAfterMs` | `number` | `undefined` | Optionally stops the animation loop after a mood settles |
| `onClick` | `() => void` | `undefined` | Click handler |

---

## Lightweight loading-only variant

If you just want the molten droplet loader without the interactive motion hook, import `LoadingMindy`:

```tsx
import { LoadingMindy } from './mindy';

export function PageLoader() {
  return <LoadingMindy size={120} color="#006aed" />;
}
```

---

## License

MIT — use it in personal sites, AI chat widgets, SaaS products, or wherever else you want.
