<script setup lang="ts">
import { computed, ref } from 'vue'
import { createColor, generatePalette } from './engine'
import { useColorHistory } from './composables/useColorHistory'
import ColorInput from './components/ColorInput.vue'
import PaletteDisplay from './components/PaletteDisplay.vue'
import ArtworkPreview from './components/ArtworkPreview.vue'
import ExportPanel from './components/ExportPanel.vue'

const currentHex = ref('#E34F5B')
const { history, removeFromHistory } = useColorHistory(currentHex)

const baseColor = computed(() => createColor(currentHex.value))
const monoPalette = computed(() => generatePalette(baseColor.value, 'monochrome'))
const analogPalette = computed(() => generatePalette(baseColor.value, 'analogous'))
const compPalette = computed(() => generatePalette(baseColor.value, 'complementary'))

const allPalettes = computed(() => [monoPalette.value, analogPalette.value, compPalette.value])

function selectHistory(hex: string) {
  currentHex.value = hex
}
</script>

<template>
  <div class="mx-auto max-w-6xl p-4 sm:p-6">
    <header class="mb-8 text-center">
      <h1 class="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
        色彩调色板工具
      </h1>
      <p class="mt-2 text-sm text-gray-500 sm:text-base">
        输入基础色，生成单色版、邻近色版与互补色版三套协调调色板
      </p>
    </header>

    <main class="flex flex-col gap-10">
      <!-- Color Input -->
      <ColorInput
        v-model="currentHex"
        :history="history"
        @select-history="selectHistory"
        @remove-history="removeFromHistory"
      />

      <!-- Three Palettes -->
      <div class="flex flex-col gap-10">
        <PaletteDisplay :palette="monoPalette" />
        <PaletteDisplay :palette="analogPalette" />
        <PaletteDisplay :palette="compPalette" />
      </div>

      <!-- Artwork Preview -->
      <ArtworkPreview :palette="analogPalette" />

      <!-- Export Panel -->
      <ExportPanel :palettes="allPalettes" />
    </main>

    <footer class="mt-12 text-center text-xs text-gray-400">
      <p>基于 Vue 3 + Tailwind CSS + 确定性色彩引擎构建</p>
    </footer>
  </div>
</template>
