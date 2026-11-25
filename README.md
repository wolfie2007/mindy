# Mindy

An open-source animated SVG mascot for React, extracted from SiteMind AI and packaged with an interactive tuning studio.

Mindy renders pure vector geometry with:
- **3D spherical geodesic eyes** with decoupled gaze tracking, micro-saccades, and biological blinking
- **8 expressive moods** (`idle`, `thinking`, `loading`, `alert`, `happy`, `confused`, `error`, `excited`)
- **Modal harmonic breathing** and volume-conserved squash-and-stretch physics
- **Molten SVG goo metaball loader** for the `loading` state
- **Single-hex color derivation** that generates 3D highlights, shadows, and speculars from any brand color
- **Reduced-motion & visibility-aware** animation loop (pauses when off-screen or in background tabs)

## Quick Start (Studio)

```bash
npm install
npm run dev
```

## Using `<Mindy />` in Your App

Copy `src/mindy/` into your React project (requires `motion` and React 18/19):

```tsx
import { Mindy } from './mindy';

export function Example() {
  return (
    <Mindy
      mood="happy"
      color="#006aed"
      size={220}
      interactive
    />
  );
}
```

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `mood` | `MindyMood` | `'idle'` | `'idle' \| 'thinking' \| 'loading' \| 'alert' \| 'happy' \| 'confused' \| 'error' \| 'excited'` |
| `eyeState` | `MindyEyeState` | auto (from mood) | Override eye expression: `'capsule' \| 'happy' \| 'wide' \| 'skeptical' \| 'slit' \| 'thinking' \| 'hidden'` |
| `eyeLean` | `number` | `-10.5` | Eye lean angle in degrees |
| `size` | `number` | `240` | Width & height in pixels |
| `color` | `string` | `'#006aed'` | Any hex color; 3D highlights & shadows are derived automatically |
| `interactive` | `boolean` | `true` | Enables pointer gaze tracking and click bounce |
| `hasNotification` | `boolean` | `false` | Renders the 3D enamel notification pip |
| `reducedMotion` | `boolean` | system preference | Overrides `prefers-reduced-motion` |
| `holdAfterMs` | `number` | `undefined` | Optionally stops the animation loop after settling |

## License

MIT
