<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Palette } from '../types'
import { exportToCSS, exportToJSON, exportToASE } from '../engine'

const props = defineProps<{
  palettes: Palette[]
}>()

const activeFormat = ref<'css' | 'json' | 'ase'>('css')
const showPreview = ref(false)

const cssContent = computed(() => exportToCSS(props.palettes))
const jsonContent = computed(() => exportToJSON(props.palettes))

function downloadFile(content: string | Uint8Array, filename: string, mimeType: string) {
  let blob: Blob
  if (content instanceof Uint8Array) {
    blob = new Blob([content], { type: mimeType })
  } else {
    blob = new Blob([content], { type: mimeType })
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function downloadCSS() {
  downloadFile(cssContent.value, 'palette.css', 'text/css')
}

function downloadJSON() {
  downloadFile(jsonContent.value, 'palette.json', 'application/json')
}

function downloadASE() {
  const aseBytes = exportToASE(props.palettes)
  downloadFile(aseBytes, 'palette.ase', 'application/octet-stream')
}

function handleDownload() {
  switch (activeFormat.value) {
    case 'css':
      downloadCSS()
      break
    case 'json':
      downloadJSON()
      break
    case 'ase':
      downloadASE()
      break
  }
}

const formatLabel: Record<string, string> = {
  css: 'CSS 变量',
  json: 'JSON',
  ase: 'ASE (Adobe)',
}

const formatDesc: Record<string, string> = {
  css: '导出为 :root CSS 自定义属性，可直接用于网页样式',
  json: '导出为结构化 JSON，包含 HEX、RGB、HSL 与中文名称',
  ase: '导出为 Adobe Swatch Exchange 格式，可导入 Photoshop / Illustrator',
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <h2 class="text-lg font-semibold text-gray-800">导出调色板</h2>

    <!-- Format selector -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="fmt in (['css', 'json', 'ase'] as const)"
        :key="fmt"
        class="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        :class="
          activeFormat === fmt
            ? 'bg-blue-600 text-white shadow-sm'
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
        "
        @click="activeFormat = fmt"
      >
        {{ formatLabel[fmt] }}
      </button>
    </div>

    <p class="text-xs text-gray-500">{{ formatDesc[activeFormat] }}</p>

    <!-- Preview toggle -->
    <div class="flex items-center gap-2">
      <button
        class="text-xs text-blue-600 hover:text-blue-800 underline"
        @click="showPreview = !showPreview"
      >
        {{ showPreview ? '隐藏预览' : '预览内容' }}
      </button>
    </div>

    <!-- Preview area -->
    <div
      v-if="showPreview"
      class="relative rounded-lg border border-gray-200 bg-gray-900 p-4"
    >
      <pre
        class="overflow-x-auto text-xs leading-relaxed"
        :class="activeFormat === 'ase' ? 'text-gray-400' : 'text-green-400 font-mono'"
      >{{ activeFormat === 'ase' ? '(ASE 为二进制格式，无法直接预览文本内容)' : (activeFormat === 'css' ? cssContent : jsonContent) }}</pre>
    </div>

    <!-- Download button -->
    <button
      class="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-800"
      @click="handleDownload"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      下载 {{ formatLabel[activeFormat] }}
    </button>
  </div>
</template>
