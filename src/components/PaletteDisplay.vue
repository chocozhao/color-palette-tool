<script setup lang="ts">
import { ref } from 'vue'
import type { Palette } from '../types'
import { getContrastColor, getContrastRatio, getWcagLevel } from '../engine'

const props = defineProps<{
  palette: Palette
}>()

const copiedHex = ref<string | null>(null)
let copyTimer: ReturnType<typeof setTimeout> | null = null

async function copyToClipboard(hex: string) {
  try {
    await navigator.clipboard.writeText(hex)
    copiedHex.value = hex
    if (copyTimer) clearTimeout(copyTimer)
    copyTimer = setTimeout(() => {
      copiedHex.value = null
    }, 1200)
  } catch {
    // fallback or ignore
  }
}

const typeLabel: Record<string, string> = {
  monochrome: '单色版',
  analogous: '邻近色版',
  complementary: '互补色版',
}

const typeDesc: Record<string, string> = {
  monochrome: '色相相同，明度均匀变化',
  analogous: '色相偏移 -30° ~ +30°',
  complementary: '围绕互补色 180° 生成',
}

function contrastInfo(hex: string) {
  const fg = getContrastColor(hex)
  const ratio = getContrastRatio(hex, fg)
  const level = getWcagLevel(ratio)
  return { fg, ratio: ratio.toFixed(2), level }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div>
      <h2 class="text-lg font-semibold text-gray-800">
        {{ typeLabel[props.palette.type] || props.palette.type }}
      </h2>
      <p class="mt-0.5 text-xs text-gray-500">{{ typeDesc[props.palette.type] }}</p>
    </div>
    <div class="flex flex-col gap-3 sm:grid sm:grid-cols-5">
      <div
        v-for="color in props.palette.colors"
        :key="color.hex"
        class="group relative cursor-pointer overflow-hidden rounded-xl shadow-sm transition-transform hover:scale-105"
        @click="copyToClipboard(color.hex)"
      >
        <div
          class="h-28 w-full sm:h-32"
          :style="{ backgroundColor: color.hex }"
        />
        <div
          class="absolute inset-0 flex flex-col items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
          :style="{ color: getContrastColor(color.hex) }"
        >
          <span class="text-lg font-bold">{{ color.hex }}</span>
          <span class="mt-1 text-xs opacity-90">点击复制</span>
        </div>
        <div
          v-if="copiedHex === color.hex"
          class="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-semibold text-white"
        >
          已复制
        </div>
        <div class="bg-white p-2 text-xs">
          <p class="truncate font-medium text-gray-800">{{ color.name }}</p>
          <p class="mt-1 font-mono text-gray-500">{{ color.hex }}</p>
          <p class="font-mono text-gray-500">
            rgb({{ color.rgb.r }}, {{ color.rgb.g }}, {{ color.rgb.b }})
          </p>
          <p class="font-mono text-gray-500">
            hsl({{ color.hsl.h }}°, {{ color.hsl.s }}%, {{ color.hsl.l }}%)
          </p>
          <!-- WCAG Contrast Badge -->
          <div class="mt-1.5 flex items-center gap-1.5">
            <span
              class="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold"
              :class="{
                'bg-green-100 text-green-700': contrastInfo(color.hex).level === 'AAA',
                'bg-blue-100 text-blue-700': contrastInfo(color.hex).level === 'AA',
                'bg-yellow-100 text-yellow-700': contrastInfo(color.hex).level === 'A',
                'bg-red-100 text-red-700': contrastInfo(color.hex).level === '失败',
              }"
            >
              {{ contrastInfo(color.hex).level }}
            </span>
            <span class="text-[10px] text-gray-400">
              对比度 {{ contrastInfo(color.hex).ratio }}:1
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
