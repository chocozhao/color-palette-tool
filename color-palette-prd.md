# 技术设计文档：Color Palette Tool

## 1. 项目愿景与架构原则
*   **目标**: 构建一个基于 Vue 3 的高性能色彩生成工具，强调数学精确度、架构解耦以及极致的边缘情况处理。
*   **核心原则**:
    *   **逻辑解耦**: 所有色彩引擎逻辑必须是**纯函数（Pure Functions）**，不依赖 DOM 或组件状态，确保输入 $\rightarrow$ 输出唯一确定。
    *   **响应式性能**: 避免全量重绘，利用 Vue 的 `computed` 机制实现细粒度更新。
    *   **鲁棒性**: 对极端色彩（黑/白/灰）提供高级别的视觉降级方案。

## 2. 核心数据结构定义 (Data Schema)
为确保全模块字段一致，禁止使用松散的字符串或对象。

```typescript
type ColorRGB = { r: number; g: number; b: number }
type ColorHSL = { h: number; s: number; l: number }

type Color = {
  hex: string      // 标准化后的 HEX (如 #E34F5B)
  rgb: ColorRGB
  hsl: ColorHSL
  name: string     // 确定性生成的 3-5 词名称
}

type PaletteType = "monochrome" | "analogous" | "complementary"

type Palette = {
  type: PaletteType
  baseColor: Color
  colors: Color[]  // 固定包含 5 个互不相同的 Color 对象
}
```

## 3. 色彩引擎实现规范

### A. 极端值处理：灰色降级算法 (Grayscale Strategy)
[cite_start]当输入为纯灰色（$s=0$）或极端黑白时，HSL 的色相（Hue）是未定义的。
*   **处理逻辑**:
    ```javascript
    if (s === 0) {
      // 智能灰色处理：根据亮度决定冷暖基调，提升高级感
      h = l > 50 ? 210 : 30; // 浅灰偏冷(蓝)，深灰偏暖(橙)
    }

```
*   **重复检查**: [cite_start]若生成算法导致 5 色中出现相同 HEX，必须对相邻色的亮度（$l$）进行 $\pm2\%$ 的确定性微调，确保视觉独立。

### B. 确定性色彩命名系统 (Naming Engine)
[cite_start]必须覆盖 $16,777,216$ 种颜色且无硬编码查表。
*   **空间划分**:
    *   **Hue Buckets (24)**: 每 $15^{\circ}$ 一个步长。
    *   **Saturation Buckets (4)**: 如 [Muted, Natural, Vibrant, Intense]。
    *   **Lightness Buckets (5)**: 如 [Darkest, Deep, Medium, Soft, Pale]。
*   **唯一性哈希策略**:
    [cite_start]利用位运算将 RGB 转换为索引，结合后缀词库确保唯一性：
    $$(hash = (r \ll 16) | (g \ll 8) | b)$$
    `const suffixIndex = hash % suffixWords.length;`
*   **结果示例**: `#E34F5B` $\rightarrow$ "Vibrant Coral Morning Glow"

### C. 调色板逻辑与和谐度
*   [cite_start]**Monochrome**: 保持 $h \pm 5^{\circ}$，亮度 $l$ 均匀分布，步长计算需避开极黑/极白区域。
*   [cite_start]**Analogous**: 严格执行偏移量 $-30^{\circ}, -15^{\circ}, 0^{\circ}, +15^{\circ}, +30^{\circ}$，并进行 $360^{\circ}$ 取模运算。
*   [cite_start]**Complementary**: 基准色 + 基准色变亮 + $180^{\circ}$ 互补色 + 互补色变亮 + 灰色/中性衍生。

## 4. 艺术预览模块 (Artwork Preview)
[cite_start]预览图必须是具象场景（如 UI Mockup 或 SVG 场景），禁止使用简单矩形。
*   **实现建议**: 使用 **SVG 渲染** 以获得最佳性能。
*   **颜色分配协议 (Color Mapping)**:
    ```javascript
    const artworkMapping = {
      canvasBg: colors[0],   // 往往是主基调
      mainShape: colors[1],  // 主视觉
      subDetail: colors[2],  // 辅助
      accent: colors[3],     // 强调点
      typography: colors[4]  // 文字或描边
    }
    ```
*   [cite_start]**硬性约束**: 画面禁止出现任何非当前调色板的颜色（包括黑色线条或默认背景）。

## 5. 性能与响应策略
*   **响应式更新**: [cite_start]所有转换逻辑应封装在 `computed` 中。对于输入校验，建议在 `watch` 中加入 100ms 的 `debounce` 以防止高频输入导致的抖动。
*   **剪贴板交互**: [cite_start]使用 `navigator.clipboard.writeText` 实现，复制成功后需触发状态变更，UI 反馈时长 $\ge 1$ 秒。

## 6. 面试级 README 交付要求 (Design Trade-offs)
README 不仅是使用说明，更是工程表达能力的体现，需包含：

### 项目思考
*   **为什么选择 HSL?** 相比 RGB，HSL 更符合人类对颜色深浅和色调变化的直觉认知，且在生成调色板时数学计算更简单。
*   **确定性命名的挑战**: 解释如何通过 Hash 算法在不依赖海量字典的情况下解决 $1,677$ 万色的唯一性。
*   **可访问性设计**: 如何实现自动计算前景色（黑/白）以匹配背景亮度的算法。

### 未来扩展
*   支持 **OKLCH** 色彩空间，解决 HSL 在感知亮度上的不均匀问题。
*   符合 **WCAG 2.1** 标准的对比度自动检测报告。

---

### 给 Claude Code 的执行指令 (Prompt Hint)
> "请基于此文档进行开发。首先初始化 Vue 3 + Tailwind CSS 环境，然后按照 **第 2 章定义核心类型**。接着实现 **第 3 章的色彩纯函数引擎**，并为此引擎编写单元测试，确保极端值（如 #000000）能正确生成 5 个唯一色。之后再进行 UI 开发。"
```