# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A **Vue 3 + Vite + TypeScript + Tailwind CSS** color palette generation tool with a deterministic, pure-function color engine. The authoritative specification is **`color-palette-prd.md`** (Chinese); it defines the data schemas, color engine logic, and artwork preview requirements. Treat it as the source of truth for architectural decisions.

A legacy `pom.xml` exists from the initial Java scaffold but is not part of the active build.

## Build Commands

- `npm run dev` — Start Vite dev server
- `npm run build` — Type-check with `vue-tsc` and build for production
- `npm run preview` — Preview the production build
- `npm run test` — Run Vitest unit tests (watch mode)
- `npx vitest run` — Run tests once (CI mode)

## Architecture

### Layer separation
- **`src/engine.ts`** — Pure functions only. No DOM or Vue dependencies. Handles HEX normalization, RGB/HSL conversions, grayscale strategy, deterministic naming, palette generation, duplicate resolution, accessibility helpers (contrast / WCAG), and export formatting (CSS/JSON/ASE).
- **`src/types.ts`** — Core TypeScript types: `Color`, `ColorRGB`, `ColorHSL`, `Palette`, `PaletteType`.
- **`src/composables/`** — Vue reactivity wrappers for stateful concerns (e.g., `useColorHistory` persists to `localStorage`).
- **`src/components/`** — UI components. `App.vue` orchestrates three computed palettes (`monochrome`, `analogous`, `complementary`) from a single `currentHex` ref.

### Color Engine Rules (from PRD)
- **Grayscale handling**: When `s === 0`, assign `h = l > 50 ? 210 : 30` (cool vs warm gray).
- **Duplicate prevention**: If the 5-color palette produces duplicate HEX values, apply deterministic `±2%` lightness adjustments to adjacent colors.
- **Deterministic naming**: Covers all 16,777,216 colors without hardcoded lookup tables. Uses 24 hue buckets (15° steps), 4 saturation buckets, 5 lightness buckets, and a hash-based suffix: `hash = (r << 16) | (g << 8) | b`, `suffixIndex = hash % suffixWords.length`.
- **Palette generation**:
  - Monochrome: `h ± 5°`, lightness distributed evenly while avoiding extreme black/white.
  - Analogous: offsets `-30°, -15°, 0°, +15°, +30°` with modulo 360°.
  - Complementary: base + base lighter + `180°` complement + complement lighter + gray/neutral derivative.

### Artwork Preview
- Rendered with **SVG** (not simple rectangles) in `ArtworkPreview.vue`.
- Color mapping: `canvasBg` (colors[0]), `mainShape` (colors[1]), `subDetail` (colors[2]), `accent` (colors[3]), `typography` (colors[4]).
- **Constraint**: No colors outside the current palette may appear (no default black lines or backgrounds). Opacity variations are allowed.

### Performance & UX Patterns
- Color conversions live inside Vue `computed` properties.
- Input validation uses a 100ms `debounce` in `watch`.
- Clipboard: `navigator.clipboard.writeText` with UI feedback lasting ≥ 1 second.

## Testing

- Framework: **Vitest** with `jsdom` environment (configured in `vite.config.ts`).
- Test file: `src/engine.test.ts` covers conversions, grayscale strategy, naming, palette generation (including edge cases like `#000000` and `#FFFFFF`), and accessibility helpers.
- When modifying the engine, run `npm run test` to verify palette uniqueness invariants, especially for extreme values.
