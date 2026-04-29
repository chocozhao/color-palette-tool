<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Color } from '../types'
import { createColor, getContrastColor, normalizeHex } from '../engine'

const props = defineProps<{
  modelValue: string
  history?: string[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'selectHistory', value: string): void
  (e: 'removeHistory', value: string): void
}>()

const inputValue = ref(props.modelValue)
const error = ref('')
const suggestedHex = ref<string | null>(null)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(
  () => props.modelValue,
  (val) => {
    inputValue.value = val
    error.value = ''
    suggestedHex.value = null
  },
)

watch(inputValue, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  error.value = ''
  suggestedHex.value = null
  debounceTimer = setTimeout(() => {
    const clean = val.trim()
    if (!clean) {
      error.value = '请输入十六进制颜色'
      return
    }

    // 3-char shorthand: show suggestion instead of auto-applying
    const isShorthand = /^#?[0-9A-Fa-f]{3}$/.test(clean)
    if (isShorthand) {
      const normalized = normalizeHex(clean)
      if (normalized) {
        suggestedHex.value = normalized
      }
      return
    }

    const normalized = normalizeHex(clean)
    if (!normalized) {
      error.value = '请输入有效的十六进制颜色，如 #E34F5B 或 FFF'
      return
    }
    emit('update:modelValue', normalized)
  }, 100)
})

function applySuggestion() {
  if (suggestedHex.value) {
    emit('update:modelValue', suggestedHex.value)
    suggestedHex.value = null
  }
}

const previewColor = computed<Color | null>(() => {
  const hex = suggestedHex.value || props.modelValue
  if (/^#[0-9A-F]{6}$/.test(hex)) {
    return createColor(hex)
  }
  return null
})

const contrast = computed(() => {
  if (previewColor.value) {
    return getContrastColor(previewColor.value.hex)
  }
  return '#000000'
})

const rgbString = computed(() => {
  const c = previewColor.value
  if (!c) return ''
  return `rgb(${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b})`
})

const hslString = computed(() => {
  const c = previewColor.value
  if (!c) return ''
  return `hsl(${c.hsl.h}°, ${c.hsl.s}%, ${c.hsl.l}%)`
})

function selectHistory(hex: string) {
  emit('selectHistory', hex)
}

function removeHistory(hex: string, event: MouseEvent) {
  event.stopPropagation()
  emit('removeHistory', hex)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <label class="text-sm font-medium text-gray-700">输入基础色</label>
    <div class="flex items-center gap-3">
      <input
        v-model="inputValue"
        type="text"
        placeholder="#E34F5B"
        class="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-mono uppercase focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-200': error }"
      />
      <div
        class="h-10 w-10 rounded-lg border border-gray-200 shadow-sm"
        :style="{ backgroundColor: previewColor?.hex || '#CCCCCC' }"
      />
    </div>
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

    <!-- Shorthand suggestion -->
    <div
      v-if="suggestedHex"
      class="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3"
    >
      <div
        class="h-8 w-8 rounded border border-gray-200"
        :style="{ backgroundColor: suggestedHex }"
      />
      <div class="flex-1">
        <p class="text-sm text-gray-700">
          检测到简写颜色
          <code class="rounded bg-white px-1 py-0.5 text-xs font-mono">{{ inputValue.trim() }}</code>
        </p>
        <p class="text-xs text-gray-500">展开为 {{ suggestedHex }}</p>
      </div>
      <button
        class="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
        @click="applySuggestion"
      >
        应用
      </button>
    </div>

    <!-- History -->
    <div v-if="history && history.length > 0" class="flex flex-col gap-2">
      <span class="text-xs text-gray-500">最近使用</span>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="hex in history"
          :key="hex"
          class="group relative inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-mono shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50"
          @click="selectHistory(hex)"
        >
          <span
            class="inline-block h-3 w-3 rounded-full"
            :style="{ backgroundColor: hex }"
          />
          <span>{{ hex }}</span>
          <span
            class="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-gray-400 hover:bg-red-100 hover:text-red-500"
            @click="(e) => removeHistory(hex, e)"
          >
            ×
          </span>
        </button>
      </div>
    </div>

    <div
      v-if="previewColor"
      class="rounded-lg px-4 py-3 text-sm"
      :style="{ backgroundColor: previewColor.hex, color: contrast }"
    >
      <p class="font-semibold">{{ previewColor.name }}</p>
      <div class="mt-2 grid grid-cols-1 gap-1 font-mono text-xs opacity-90 sm:grid-cols-3">
        <span>HEX: {{ previewColor.hex }}</span>
        <span>RGB: {{ rgbString }}</span>
        <span>HSL: {{ hslString }}</span>
      </div>
    </div>
  </div>
</template>
