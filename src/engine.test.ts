import { describe, expect, it } from 'vitest'
import {
  applyGrayscaleStrategy,
  createColor,
  generatePalette,
  getContrastColor,
  hexToRgb,
  hslToRgb,
  normalizeHex,
  rgbToHex,
  rgbToHsl,
} from './engine'
import type { PaletteType } from './types'

describe('HEX Normalization', () => {
  it('normalizes 6-char with hash', () => {
    expect(normalizeHex('#E34F5B')).toBe('#E34F5B')
    expect(normalizeHex('#e34f5b')).toBe('#E34F5B')
  })

  it('normalizes 6-char without hash', () => {
    expect(normalizeHex('E34F5B')).toBe('#E34F5B')
    expect(normalizeHex('e34f5b')).toBe('#E34F5B')
  })

  it('expands 3-char shorthand', () => {
    expect(normalizeHex('#FFF')).toBe('#FFFFFF')
    expect(normalizeHex('abc')).toBe('#AABBCC')
  })

  it('trims whitespace', () => {
    expect(normalizeHex('  #E34F5B  ')).toBe('#E34F5B')
  })

  it('rejects invalid input', () => {
    expect(normalizeHex('')).toBeNull()
    expect(normalizeHex('GGGGGG')).toBeNull()
    expect(normalizeHex('#E34F5')).toBeNull()
    expect(normalizeHex('#E34F5BB')).toBeNull()
    expect(normalizeHex('FF')).toBeNull()
  })
})

describe('Color Space Conversions', () => {
  it('converts hex to rgb', () => {
    expect(hexToRgb('#E34F5B')).toEqual({ r: 227, g: 79, b: 91 })
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 })
    expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 })
  })

  it('converts rgb to hex', () => {
    expect(rgbToHex({ r: 227, g: 79, b: 91 })).toBe('#E34F5B')
    expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe('#000000')
    expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe('#FFFFFF')
  })

  it('round-trips hex -> rgb -> hex', () => {
    const colors = ['#E34F5B', '#000000', '#FFFFFF', '#808080', '#123456']
    colors.forEach((hex) => {
      expect(rgbToHex(hexToRgb(hex))).toBe(hex)
    })
  })

  it('converts rgb to hsl', () => {
    expect(rgbToHsl({ r: 0, g: 0, b: 0 })).toEqual({ h: 0, s: 0, l: 0 })
    expect(rgbToHsl({ r: 255, g: 255, b: 255 })).toEqual({ h: 0, s: 0, l: 100 })
    const hsl = rgbToHsl({ r: 255, g: 0, b: 0 })
    expect(hsl.h).toBe(0)
    expect(hsl.s).toBe(100)
    expect(hsl.l).toBe(50)
  })

  it('round-trips hsl -> rgb -> hsl approximately', () => {
    const testCases = [
      { h: 0, s: 100, l: 50 },
      { h: 120, s: 100, l: 50 },
      { h: 240, s: 100, l: 50 },
      { h: 180, s: 50, l: 50 },
    ]
    testCases.forEach((hsl) => {
      const rgb = hslToRgb(hsl)
      const back = rgbToHsl(rgb)
      expect(back.h).toBeCloseTo(hsl.h, 0)
      expect(back.s).toBeCloseTo(hsl.s, 0)
      expect(back.l).toBeCloseTo(hsl.l, 0)
    })
  })
})

describe('Grayscale Strategy', () => {
  it('assigns cool hue for light gray', () => {
    const result = applyGrayscaleStrategy({ h: 0, s: 0, l: 60 })
    expect(result.h).toBe(210)
    expect(result.s).toBe(0)
    expect(result.l).toBe(60)
  })

  it('assigns warm hue for dark gray', () => {
    const result = applyGrayscaleStrategy({ h: 0, s: 0, l: 40 })
    expect(result.h).toBe(30)
    expect(result.s).toBe(0)
    expect(result.l).toBe(40)
  })

  it('does not modify non-grayscale colors', () => {
    const hsl = { h: 120, s: 50, l: 50 }
    expect(applyGrayscaleStrategy(hsl)).toEqual(hsl)
  })
})

describe('Deterministic Naming', () => {
  it('produces the same name for the same color', () => {
    const c1 = createColor('#E34F5B')
    const c2 = createColor('#E34F5B')
    expect(c1.name).toBe(c2.name)
  })

  it('produces different names for different colors', () => {
    const c1 = createColor('#FF0000')
    const c2 = createColor('#00FF00')
    expect(c1.name).not.toBe(c2.name)
  })

  it('covers extreme values', () => {
    expect(createColor('#000000').name).toBeTruthy()
    expect(createColor('#FFFFFF').name).toBeTruthy()
  })

  it('generates Chinese names', () => {
    const c = createColor('#E34F5B')
    expect(c.name).toMatch(/[\u4e00-\u9fa5]+/)
  })

  it('uses gray-scale words for grayscale colors', () => {
    const grayNames = ['墨黑', '炭黑', '铁灰', '铅灰', '中灰', '银灰', '烟白', '雪白']
    const grayHexes = ['#000000', '#404040', '#808080', '#C0C0C0', '#FFFFFF']

    grayHexes.forEach((hex) => {
      const c = createColor(hex)
      const hasGrayWord = grayNames.some((w) => c.name.includes(w))
      expect(hasGrayWord).toBe(true)
    })
  })

  it('does not use hue words for grayscale colors', () => {
    const hueWords = ['赤红', '朱红', '橙红', '琥珀', '金黄', '柠黄']
    const grayHexes = ['#000000', '#808080', '#FFFFFF']

    grayHexes.forEach((hex) => {
      const c = createColor(hex)
      hueWords.forEach((w) => {
        expect(c.name).not.toContain(w)
      })
    })
  })
})

describe('Palette Generation', () => {
  const types: PaletteType[] = ['monochrome', 'analogous', 'complementary']

  types.forEach((type) => {
    it(`generates 5 unique colors for ${type}`, () => {
      const base = createColor('#E34F5B')
      const palette = generatePalette(base, type)
      expect(palette.colors).toHaveLength(5)

      const hexes = palette.colors.map((c) => c.hex)
      const uniqueHexes = new Set(hexes)
      expect(uniqueHexes.size).toBe(5)
    })
  })

  it('generates 5 unique colors for black (#000000) in all types', () => {
    const base = createColor('#000000')
    const types: PaletteType[] = ['monochrome', 'analogous', 'complementary']

    types.forEach((type) => {
      const palette = generatePalette(base, type)
      expect(palette.colors).toHaveLength(5)
      const hexes = palette.colors.map((c) => c.hex)
      const uniqueHexes = new Set(hexes)
      expect(uniqueHexes.size).toBe(5)
    })
  })

  it('generates 5 unique colors for white (#FFFFFF) in all types', () => {
    const base = createColor('#FFFFFF')
    const types: PaletteType[] = ['monochrome', 'analogous', 'complementary']

    types.forEach((type) => {
      const palette = generatePalette(base, type)
      expect(palette.colors).toHaveLength(5)
      const hexes = palette.colors.map((c) => c.hex)
      const uniqueHexes = new Set(hexes)
      expect(uniqueHexes.size).toBe(5)
    })
  })

  it('generates 5 unique colors for medium gray (#808080) in all types', () => {
    const base = createColor('#808080')
    const types: PaletteType[] = ['monochrome', 'analogous', 'complementary']

    types.forEach((type) => {
      const palette = generatePalette(base, type)
      expect(palette.colors).toHaveLength(5)
      const hexes = palette.colors.map((c) => c.hex)
      const uniqueHexes = new Set(hexes)
      expect(uniqueHexes.size).toBe(5)
    })
  })

  it('monochrome palette keeps hue identical', () => {
    const base = createColor('#4A90D9')
    const palette = generatePalette(base, 'monochrome')
    const hues = palette.colors.map((c) => c.hsl.h)
    const uniqueH = new Set(hues)
    // All 5 colors should have the same hue (or very close after dedup)
    expect(uniqueH.size).toBeLessThanOrEqual(2)
  })

  it('analogous palette varies hue', () => {
    const base = createColor('#4A90D9')
    const palette = generatePalette(base, 'analogous')
    const hues = palette.colors.map((c) => c.hsl.h)
    const uniqueH = new Set(hues)
    expect(uniqueH.size).toBe(5)
  })

  it('complementary palette includes the complement hue', () => {
    const base = createColor('#FF0000') // h = 0
    const palette = generatePalette(base, 'complementary')
    const hues = palette.colors.map((c) => c.hsl.h)
    expect(hues).toContain(180)
  })
})

describe('Accessibility Helpers', () => {
  it('returns white text on dark backgrounds', () => {
    expect(getContrastColor('#000000')).toBe('#FFFFFF')
    expect(getContrastColor('#123456')).toBe('#FFFFFF')
  })

  it('returns black text on light backgrounds', () => {
    expect(getContrastColor('#FFFFFF')).toBe('#000000')
    expect(getContrastColor('#E0E0E0')).toBe('#000000')
  })
})
