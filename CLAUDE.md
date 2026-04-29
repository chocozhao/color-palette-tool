# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains a **Color Palette Tool**. The intended implementation is a **Vue 3 + Tailwind CSS** web application with a pure-function color engine, though the current codebase is a minimal Java Maven scaffold.

The authoritative specification is **`color-palette-prd.md`** (Chinese). It defines the full technical design including data schemas, color engine logic, and artwork preview requirements. Treat this document as the source of truth for architectural decisions.

## Build System

This is an **Apache Maven** project targeting **Java 8**.

Common commands:
- `mvn compile` — Compile the project
- `mvn test` — Run tests
- `mvn package` — Build the JAR
- `mvn clean` — Clean build artifacts

## Architecture (from PRD)

### Core Data Types
All color data uses strict TypeScript-style structures (to be implemented in Vue 3):
- `ColorRGB`: `{ r: number; g: number; b: number }`
- `ColorHSL`: `{ h: number; s: number; l: number }`
- `Color`: `{ hex: string; rgb: ColorRGB; hsl: ColorHSL; name: string }`
- `PaletteType`: `"monochrome" | "analogous" | "complementary"`
- `Palette`: `{ type: PaletteType; baseColor: Color; colors: Color[] }` (always 5 distinct colors)

### Color Engine Rules
- **Pure functions only**: No DOM or component state dependencies.
- **Grayscale handling**: When `s === 0`, assign `h = l > 50 ? 210 : 30` (cool vs warm gray).
- **Duplicate prevention**: If the 5-color palette produces duplicate HEX values, apply deterministic `±2%` lightness adjustments to adjacent colors.
- **Deterministic naming**: Cover all 16,777,216 colors without hardcoded lookup tables. Use 24 hue buckets (15° steps), 4 saturation buckets, 5 lightness buckets, and a hash-based suffix: `hash = (r << 16) | (g << 8) | b`, `suffixIndex = hash % suffixWords.length`.
- **Palette generation**:
  - Monochrome: `h ± 5°`, lightness distributed evenly while avoiding extreme black/white.
  - Analogous: offsets `-30°, -15°, 0°, +15°, +30°` with modulo 360°.
  - Complementary: base + base lighter + `180°` complement + complement lighter + gray/neutral derivative.

### Artwork Preview
- Render with **SVG** (not simple rectangles).
- Color mapping: `canvasBg` (colors[0]), `mainShape` (colors[1]), `subDetail` (colors[2]), `accent` (colors[3]), `typography` (colors[4]).
- **Constraint**: No colors outside the current palette may appear (no default black lines or backgrounds).

### Performance
- Color conversions must live inside Vue `computed` properties.
- Input validation should use a 100ms `debounce` in `watch`.
- Clipboard: use `navigator.clipboard.writeText` with UI feedback lasting ≥ 1 second.

## Development Direction

The PRD includes the following explicit execution instruction for Claude Code:

> "请基于此文档进行开发。首先初始化 Vue 3 + Tailwind CSS 环境，然后按照 **第 2 章定义核心类型**。接着实现 **第 3 章的色彩纯函数引擎**，并为此引擎编写单元测试，确保极端值（如 #000000）能正确生成 5 个唯一色。之后再进行 UI 开发。"

Translation: Initialize Vue 3 + Tailwind CSS, define core types per Chapter 2, implement the pure-function color engine per Chapter 3 with unit tests (verify edge cases like `#000000` produce 5 unique colors), then build the UI.

## Notes

- The project currently has no `src/test/` directory and no testing dependencies configured.
- No README.md exists yet.
