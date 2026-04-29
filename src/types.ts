export type ColorRGB = { r: number; g: number; b: number }

export type ColorHSL = { h: number; s: number; l: number }

export type Color = {
  hex: string
  rgb: ColorRGB
  hsl: ColorHSL
  name: string
}

export type PaletteType = 'monochrome' | 'analogous' | 'complementary'

export type Palette = {
  type: PaletteType
  baseColor: Color
  colors: Color[]
}
