import type { Color, ColorHSL, ColorRGB, Palette, PaletteType } from './types'

/* ------------------------------------------------------------------ */
/*  Color Space Conversions                                            */
/* ------------------------------------------------------------------ */

export function hexToRgb(hex: string): ColorRGB {
  const clean = hex.replace('#', '')
  const bigint = parseInt(clean, 16)
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  }
}

export function rgbToHex(rgb: ColorRGB): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase()
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`
}

export function rgbToHsl(rgb: ColorRGB): ColorHSL {
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

export function hslToRgb(hsl: ColorHSL): ColorRGB {
  const h = hsl.h / 360
  const s = hsl.s / 100
  const l = hsl.l / 100
  let r: number
  let g: number
  let b: number

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  }
}

/* ------------------------------------------------------------------ */
/*  HEX Normalization                                                  */
/* ------------------------------------------------------------------ */

export function normalizeHex(input: string): string | null {
  const clean = input.trim().toUpperCase()
  if (!clean) return null

  // Remove # if present
  const body = clean.startsWith('#') ? clean.slice(1) : clean

  // 3-char shorthand
  if (/^[0-9A-F]{3}$/.test(body)) {
    const expanded = body
      .split('')
      .map((c) => c + c)
      .join('')
    return `#${expanded}`
  }

  // 6-char standard
  if (/^[0-9A-F]{6}$/.test(body)) {
    return `#${body}`
  }

  return null
}

/* ------------------------------------------------------------------ */
/*  Grayscale Strategy                                                 */
/* ------------------------------------------------------------------ */

export function applyGrayscaleStrategy(hsl: ColorHSL): ColorHSL {
  if (hsl.s === 0) {
    return { ...hsl, h: hsl.l > 50 ? 210 : 30 }
  }
  return hsl
}

/* ------------------------------------------------------------------ */
/*  Deterministic Naming Engine (Chinese)                              */
/* ------------------------------------------------------------------ */

const LIGHTNESS_WORDS = ['极暗', '深沉', '中等', '柔和', '浅淡']
const SATURATION_WORDS = ['灰调', '自然', '鲜明', '浓烈']
const HUE_WORDS = [
  '赤红', '朱红', '橙红', '琥珀', '金黄', '柠黄',
  '草绿', '翠绿', '薄荷', '青绿', '青色', '天蓝',
  '蔚蓝', '宝蓝', '靛蓝', '紫罗兰', '紫晶', '品红',
  '兰花', '玫瑰', '珊瑚', '宝石红', '猩红', '绯红',
]

// 200 single-character suffixes; combined in pairs for 40,000 unique suffixes
const SUFFIX_CHARS = [
  '霞', '雾', '光', '影', '焰', '波', '风', '晨', '暮', '霭',
  '星', '流', '响', '花', '霜', '烬', '潮', '气', '灵', '语',
  '线', '荫', '灯', '夜', '雨', '阳', '月', '辰', '云', '露',
  '雪', '叶', '瓣', '石', '沙', '木', '水', '火', '土', '风',
  '海', '天', '地', '心', '魂', '思', '目', '手', '声', '歌',
  '园', '原', '林', '河', '湖', '山', '谷', '峡', '岸', '际',
  '晶', '镜', '丝', '绒', '珠', '钻', '金', '银', '铜', '玉',
  '牙', '珀', '瑚', '瑙', '璃', '翠', '瑠', '琅', '玳', '珉',
  '珂', '珑', '珅', '琮', '瑄', '瑜', '璇', '瑾', '璟', '璐',
  '瑛', '琬', '琰', '琛', '琨', '玮', '珩', '珈', '珞', '珊',
  '珍', '瑰', '琼', '瑶', '琳', '玟', '玢', '玦', '珏', '珮',
  '珥', '珰', '珽', '琇', '琤', '琯', '琴', '琵', '琶', '筝',
  '笙', '箫', '笛', '鼓', '钟', '磬', '铃', '铛', '钥', '锁',
  '链', '环', '佩', '饰', '冠', '冕', '盔', '甲', '袍', '裳',
  '裙', '带', '巾', '扇', '伞', '杖', '剑', '刀', '枪', '弓',
  '箭', '盾', '旗', '帆', '舟', '车', '马', '骑', '步', '奔',
  '飞', '翔', '跃', '游', '潜', '攀', '登', '涉', '跨', '越',
  '穿', '行', '走', '跑', '跳', '翻', '滚', '爬', '挤', '推',
  '拉', '抬', '扛', '背', '抱', '捧', '托', '举', '提', '拎',
  '挎', '挽', '扶', '撑', '支', '架', '搭', '建', '筑', '造',
]

function getSuffixPair(index: number): string {
  const a = SUFFIX_CHARS[index % SUFFIX_CHARS.length]
  const b = SUFFIX_CHARS[Math.floor(index / SUFFIX_CHARS.length) % SUFFIX_CHARS.length]
  return a + b
}

export function generateName(hsl: ColorHSL, rgb: ColorRGB): string {
  const hash = (rgb.r << 16) | (rgb.g << 8) | rgb.b

  const lIndex = hash % LIGHTNESS_WORDS.length
  const sIndex = Math.floor(hash / LIGHTNESS_WORDS.length) % SATURATION_WORDS.length
  const hIndex =
    Math.floor(hash / (LIGHTNESS_WORDS.length * SATURATION_WORDS.length)) %
    HUE_WORDS.length

  const suffixBase = Math.floor(
    hash / (LIGHTNESS_WORDS.length * SATURATION_WORDS.length * HUE_WORDS.length),
  )
  const suffix = getSuffixPair(suffixBase)

  return `${LIGHTNESS_WORDS[lIndex]}${SATURATION_WORDS[sIndex]}${HUE_WORDS[hIndex]}${suffix}`
}

/* ------------------------------------------------------------------ */
/*  Color Factory                                                      */
/* ------------------------------------------------------------------ */

export function createColor(hex: string): Color {
  const rgb = hexToRgb(hex)
  let hsl = rgbToHsl(rgb)
  hsl = applyGrayscaleStrategy(hsl)
  const name = generateName(hsl, rgb)
  return { hex, rgb, hsl, name }
}

/* ------------------------------------------------------------------ */
/*  Palette Generators                                                 */
/* ------------------------------------------------------------------ */

function normalizeHue(h: number): number {
  return ((h % 360) + 360) % 360
}

function generateMonochromeHSL(base: ColorHSL): ColorHSL[] {
  const center = Math.max(5, Math.min(95, base.l))
  const step = Math.min((center - 5) / 2, (95 - center) / 2, 20)

  if (step < 3) {
    // Extreme edge case: use fixed uniform distribution
    const fixed = [5, 25, 50, 75, 95]
    const closestIdx = fixed.reduce(
      (best, v, i) => (Math.abs(v - center) < Math.abs(fixed[best] - center) ? i : best),
      0,
    )
    const lightnesses = [...fixed]
    lightnesses[closestIdx] = center
    return lightnesses.map((l) => ({ h: base.h, s: base.s, l }))
  }

  return [
    { h: base.h, s: base.s, l: Math.round(center - 2 * step) },
    { h: base.h, s: base.s, l: Math.round(center - step) },
    { h: base.h, s: base.s, l: center },
    { h: base.h, s: base.s, l: Math.round(center + step) },
    { h: base.h, s: base.s, l: Math.round(center + 2 * step) },
  ]
}

function generateAnalogousHSL(base: ColorHSL): ColorHSL[] {
  const offsets = [-30, -15, 0, 15, 30]
  if (base.s === 0) {
    return offsets.map((offset, i) => ({
      h: normalizeHue(base.h + offset),
      s: 10 + i * 10,
      l: Math.max(10, Math.min(90, base.l + (i - 2) * 15)),
    }))
  }
  return offsets.map((offset) => ({
    h: normalizeHue(base.h + offset),
    s: base.s,
    l: base.l,
  }))
}

function generateComplementaryHSL(base: ColorHSL): ColorHSL[] {
  const compH = normalizeHue(base.h + 180)
  if (base.s === 0) {
    return [
      { h: base.h, s: 10, l: Math.max(10, Math.min(90, base.l)) },
      { h: base.h, s: 30, l: Math.max(10, Math.min(90, base.l + 10)) },
      { h: compH, s: 20, l: Math.max(10, Math.min(90, base.l - 10)) },
      { h: compH, s: 40, l: Math.max(10, Math.min(90, base.l + 20)) },
      { h: base.h, s: 50, l: 50 },
    ]
  }
  return [
    { h: base.h, s: base.s, l: base.l },
    { h: base.h, s: base.s, l: Math.min(base.l + 15, 90) },
    { h: compH, s: base.s, l: base.l },
    { h: compH, s: base.s, l: Math.min(base.l + 15, 90) },
    { h: base.h, s: Math.max(base.s - 40, 0), l: 50 },
  ]
}

/* ------------------------------------------------------------------ */
/*  Duplicate Resolution                                               */
/* ------------------------------------------------------------------ */

function hslToColor(hsl: ColorHSL): Color {
  const rgb = hslToRgb(hsl)
  const hex = rgbToHex(rgb)
  return createColor(hex)
}

function deduplicateColors(colors: Color[]): Color[] {
  const result: Color[] = []

  for (let i = 0; i < colors.length; i++) {
    let color = colors[i]
    let attempts = 0
    const direction = i % 2 === 0 ? 1 : -1

    while (result.some((c) => c.hex === color.hex) && attempts < 10) {
      attempts++
      const newL = Math.max(2, Math.min(98, color.hsl.l + direction * attempts * 2))
      const newHsl = { ...color.hsl, l: newL }
      color = hslToColor(newHsl)
    }

    result.push(color)
  }

  return result
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

export function generatePalette(baseColor: Color, type: PaletteType): Palette {
  let hslColors: ColorHSL[]

  switch (type) {
    case 'monochrome':
      hslColors = generateMonochromeHSL(baseColor.hsl)
      break
    case 'analogous':
      hslColors = generateAnalogousHSL(baseColor.hsl)
      break
    case 'complementary':
      hslColors = generateComplementaryHSL(baseColor.hsl)
      break
    default:
      hslColors = generateMonochromeHSL(baseColor.hsl)
  }

  const colors = deduplicateColors(hslColors.map(hslToColor))

  return {
    type,
    baseColor,
    colors,
  }
}

/* ------------------------------------------------------------------ */
/*  Accessibility Helpers                                              */
/* ------------------------------------------------------------------ */

export function getLuminance(rgb: ColorRGB): number {
  const toLinear = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * toLinear(rgb.r) + 0.7152 * toLinear(rgb.g) + 0.0722 * toLinear(rgb.b)
}

export function getContrastColor(hex: string): string {
  const rgb = hexToRgb(hex)
  const lum = getLuminance(rgb)
  return lum > 0.5 ? '#000000' : '#FFFFFF'
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hexToRgb(hex1))
  const lum2 = getLuminance(hexToRgb(hex2))
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  return (lighter + 0.05) / (darker + 0.05)
}

export type WcagLevel = 'AAA' | 'AA' | 'A' | '失败'

export function getWcagLevel(ratio: number): WcagLevel {
  if (ratio >= 7) return 'AAA'
  if (ratio >= 4.5) return 'AA'
  if (ratio >= 3) return 'A'
  return '失败'
}

/* ------------------------------------------------------------------ */
/*  Export Utilities                                                   */
/* ------------------------------------------------------------------ */

export function exportToCSS(palettes: Palette[]): string {
  const lines: string[] = [':root {']
  const names = ['monochrome', 'analogous', 'complementary']
  palettes.forEach((palette, pi) => {
    const prefix = names[pi] || `palette-${pi}`
    palette.colors.forEach((color, ci) => {
      const varName = `--${prefix}-${ci + 1}`
      lines.push(`  ${varName}: ${color.hex};`)
    })
  })
  lines.push('}')
  return lines.join('\n')
}

export function exportToJSON(palettes: Palette[]): string {
  const data = palettes.map((palette) => ({
    type: palette.type,
    baseColor: palette.baseColor.hex,
    colors: palette.colors.map((color) => ({
      hex: color.hex,
      rgb: color.rgb,
      hsl: color.hsl,
      name: color.name,
    })),
  }))
  return JSON.stringify(data, null, 2)
}

export function exportToASE(palettes: Palette[]): Uint8Array {
  const allColors = palettes.flatMap((p) => p.colors)
  const blockCount = allColors.length

  // Pre-calculate total size
  let totalSize = 12 // header
  for (const color of allColors) {
    // Name in UTF-16 BE + null terminator
    const nameBytes = new TextEncoder().encode(color.name)
    // Need to convert to UTF-16 BE; we use a simple approach
    const utf16Units = color.name.length + 1 // +1 for null
    const nameByteLen = utf16Units * 2
    const blockLen = 2 + nameByteLen + 4 + 12 + 2 // nameLen + name + mode + RGB + type
    totalSize += 2 + 4 + blockLen // block type + block length + data
  }

  const buffer = new ArrayBuffer(totalSize)
  const view = new DataView(buffer)
  let offset = 0

  // Header
  writeString(view, offset, 'ASEF')
  offset += 4
  view.setUint16(offset, 1, false)
  offset += 2
  view.setUint16(offset, 0, false)
  offset += 2
  view.setUint32(offset, blockCount, false)
  offset += 4

  for (const color of allColors) {
    const utf16Units = color.name.length + 1
    const nameByteLen = utf16Units * 2
    const blockLen = 2 + nameByteLen + 4 + 12 + 2

    // Block type: color = 0x0001
    view.setUint16(offset, 1, false)
    offset += 2
    view.setUint32(offset, blockLen, false)
    offset += 4

    // Name length (UTF-16 code units including null)
    view.setUint16(offset, utf16Units, false)
    offset += 2

    // Name in UTF-16 BE
    for (let i = 0; i < color.name.length; i++) {
      view.setUint16(offset, color.name.charCodeAt(i), false)
      offset += 2
    }
    // Null terminator
    view.setUint16(offset, 0, false)
    offset += 2

    // Color mode: "RGB "
    writeString(view, offset, 'RGB ')
    offset += 4

    // R, G, B as float32 (0.0 - 1.0)
    view.setFloat32(offset, color.rgb.r / 255, false)
    offset += 4
    view.setFloat32(offset, color.rgb.g / 255, false)
    offset += 4
    view.setFloat32(offset, color.rgb.b / 255, false)
    offset += 4

    // Color type: 0 = global
    view.setUint16(offset, 0, false)
    offset += 2
  }

  return new Uint8Array(buffer)
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i))
  }
}
