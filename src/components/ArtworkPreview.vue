<script setup lang="ts">
import { computed } from 'vue'
import type { Palette } from '../types'

const props = defineProps<{
  palette: Palette
}>()

const colors = computed(() => props.palette.colors)

const c = computed(() => ({
  bg: colors.value[0]?.hex || '#CCCCCC',
  sidebar: colors.value[1]?.hex || '#999999',
  card: colors.value[2]?.hex || '#666666',
  accent: colors.value[3]?.hex || '#333333',
  text: colors.value[4]?.hex || '#000000',
}))
</script>

<template>
  <div class="flex flex-col gap-4">
    <h2 class="text-lg font-semibold text-gray-800">作品预览</h2>
    <p class="text-xs text-gray-500">
      使用当前调色板五种颜色渲染的界面原型，每种颜色均有使用，无调色板外颜色
    </p>
    <svg
      viewBox="0 0 400 280"
      class="w-full rounded-xl shadow-sm"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- 背景 -->
      <rect x="0" y="0" width="400" height="280" :fill="c.bg" rx="8" />

      <!-- 顶部导航栏 -->
      <rect x="0" y="0" width="400" height="40" :fill="c.sidebar" rx="8" />
      <rect x="0" y="32" width="400" height="8" :fill="c.sidebar" />

      <!-- 导航栏内容 -->
      <circle cx="28" cy="20" r="10" :fill="c.accent" />
      <rect x="52" y="14" width="80" height="12" rx="4" :fill="c.text" opacity="0.8" />
      <rect x="300" y="14" width="24" height="12" rx="4" :fill="c.text" opacity="0.5" />
      <rect x="332" y="14" width="24" height="12" rx="4" :fill="c.text" opacity="0.5" />
      <rect x="364" y="14" width="24" height="12" rx="4" :fill="c.text" opacity="0.5" />

      <!-- 侧边栏 -->
      <rect x="0" y="40" width="80" height="240" :fill="c.sidebar" opacity="0.6" />
      <rect x="16" y="60" width="48" height="8" rx="2" :fill="c.text" opacity="0.7" />
      <rect x="16" y="80" width="40" height="6" rx="2" :fill="c.text" opacity="0.4" />
      <rect x="16" y="94" width="44" height="6" rx="2" :fill="c.text" opacity="0.4" />
      <rect x="16" y="108" width="36" height="6" rx="2" :fill="c.text" opacity="0.4" />
      <rect x="16" y="128" width="48" height="8" rx="2" :fill="c.text" opacity="0.7" />
      <rect x="16" y="148" width="40" height="6" rx="2" :fill="c.text" opacity="0.4" />
      <rect x="16" y="162" width="44" height="6" rx="2" :fill="c.text" opacity="0.4" />

      <!-- 主内容区卡片 1 -->
      <rect x="96" y="56" width="140" height="100" rx="6" :fill="c.card" />
      <rect x="112" y="72" width="60" height="10" rx="3" :fill="c.text" opacity="0.9" />
      <rect x="112" y="92" width="100" height="6" rx="2" :fill="c.text" opacity="0.5" />
      <rect x="112" y="104" width="90" height="6" rx="2" :fill="c.text" opacity="0.5" />
      <rect x="112" y="116" width="70" height="6" rx="2" :fill="c.text" opacity="0.5" />
      <rect x="112" y="132" width="48" height="16" rx="4" :fill="c.accent" />

      <!-- 主内容区卡片 2 -->
      <rect x="252" y="56" width="140" height="100" rx="6" :fill="c.card" />
      <rect x="268" y="72" width="60" height="10" rx="3" :fill="c.text" opacity="0.9" />
      <rect x="268" y="92" width="100" height="6" rx="2" :fill="c.text" opacity="0.5" />
      <rect x="268" y="104" width="90" height="6" rx="2" :fill="c.text" opacity="0.5" />
      <rect x="268" y="116" width="70" height="6" rx="2" :fill="c.text" opacity="0.5" />
      <rect x="268" y="132" width="48" height="16" rx="4" :fill="c.accent" />

      <!-- 底部统计区 -->
      <rect x="96" y="172" width="84" height="68" rx="6" :fill="c.card" />
      <rect x="112" y="188" width="32" height="8" rx="2" :fill="c.text" opacity="0.7" />
      <rect x="112" y="204" width="48" height="12" rx="3" :fill="c.text" opacity="0.9" />
      <rect x="112" y="222" width="40" height="6" rx="2" :fill="c.text" opacity="0.4" />

      <rect x="192" y="172" width="84" height="68" rx="6" :fill="c.card" />
      <rect x="208" y="188" width="32" height="8" rx="2" :fill="c.text" opacity="0.7" />
      <rect x="208" y="204" width="48" height="12" rx="3" :fill="c.text" opacity="0.9" />
      <rect x="208" y="222" width="40" height="6" rx="2" :fill="c.text" opacity="0.4" />

      <rect x="288" y="172" width="104" height="68" rx="6" :fill="c.card" />
      <rect x="304" y="188" width="32" height="8" rx="2" :fill="c.text" opacity="0.7" />
      <rect x="304" y="204" width="48" height="12" rx="3" :fill="c.text" opacity="0.9" />
      <rect x="304" y="222" width="40" height="6" rx="2" :fill="c.text" opacity="0.4" />

      <!-- 装饰性圆环 -->
      <circle cx="360" cy="216" r="20" :fill="c.accent" opacity="0.3" />
      <circle cx="360" cy="216" r="12" :fill="c.accent" opacity="0.6" />
      <circle cx="360" cy="216" r="4" :fill="c.accent" />
    </svg>
  </div>
</template>
