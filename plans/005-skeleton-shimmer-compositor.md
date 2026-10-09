# 005 — 将骨架屏闪动改为合成层位移

- **Status**: TODO
- **Commit**: 631b5ef5
- **Severity**: LOW
- **Category**: Performance; Accessibility
- **Estimated scope**: 1 global CSS file

## Problem

骨架屏当前通过无限循环改变 `background-position` 实现闪动；这个属性需要重复绘制背景，时间线骨架中多个头像和文字条同时使用它。

`app/styles/global.css:509-527`：

```css
.skeleton-loading-bg {
  background: linear-gradient(90deg, ...);
  background-size: 400% 100%;
  animation: skeleton-loading 1.4s ease infinite;
}

@keyframes skeleton-loading {
  0% { background-position: 100% 50%; }
  to { background-position: 0 50%; }
}
```

骨架屏被 `StatusCardSkeleton.vue`、`SearchResultSkeleton.vue`、`TagCardSkeleton.vue`、`AccountBigCardSkeleton.vue` 等复用。

## Target

- 将底色设为静态，闪光部分放入绝对定位伪元素。
- 仅动画伪元素的 `transform`：1.4s `linear infinite`，从 `translateX(-100%)` 移至 `translateX(100%)`；不动画 `background-position`、尺寸或布局属性。
- 伪元素继承父级圆角，不拦截指针事件；圆形头像、圆角条和大矩形骨架都维持现有轮廓。
- `prefers-reduced-motion: reduce` 时隐藏闪光伪元素，只留静态骨架底色。

建议的目标结构（保留当前项目色值，不新增视觉色板）：

```css
.skeleton-loading-bg {
  position: relative;
  overflow: hidden;
  background: rgba(190, 190, 190, 0.2);
}

.skeleton-loading-bg::after {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(90deg, transparent 25%, rgba(129, 129, 129, 0.24) 50%, transparent 75%);
  content: '';
  pointer-events: none;
  transform: translateX(-100%);
  animation: skeleton-shimmer 1.4s linear infinite;
}

@keyframes skeleton-shimmer {
  to { transform: translateX(100%); }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-loading-bg::after { content: none; }
}
```

## Repo conventions to follow

- 全站共享骨架屏样式位于 `app/styles/global.css`；不要逐个修改 skeleton 组件。
- 现有减少动态效果媒体查询示例位于同文件 `50-66` 和 `154-158`。
- 骨架元素轮廓由调用处 UnoCSS 圆角控制；伪元素需 `border-radius: inherit`，不得覆盖组件尺寸。

## Steps

1. 盘点所有 `.skeleton-loading-bg` 调用，确认其内容为空占位容器且圆角来自父元素 utility。
2. 将 `.skeleton-loading-bg` 的静态背景与 `::after` 的闪光层分离，动画属性仅保留 `transform`。
3. 替换旧 `skeleton-loading` keyframes，添加 `skeleton-shimmer` 和 reduced-motion 静态状态。
4. 在浅色、深色主题与圆形/条形/大矩形骨架中检查对比度和边缘裁切；若伪元素在某主题不可辨，调整其透明度但不改变现有配色语义。

## Boundaries

- 不改骨架屏数量、大小、间距、组件显示逻辑或加载时机。
- 不新增依赖，不动画 width/height/background-position/filter。
- 不把骨架屏变成纯空白；减少动态效果时仍显示静态 placeholder。

## Verification

- **Mechanical**: `pnpm lint`；`rg -n "skeleton-loading|skeleton-shimmer|background-position" app/styles/global.css` 确认旧动画 keyframes 不再被引用，骨架 shimmer 只动画 transform。
- **Feel check**: 在延迟网络下打开时间线、搜索和账号页面；对照原始视觉确认 shimmer 方向/速度仍轻柔、圆角没有溢出。开启 `prefers-reduced-motion` 后所有骨架保持静态，不出现闪光。
- **Performance check**: DevTools Performance 录制 skeleton 可见时的帧；确认持续动画不再反复产生背景绘制，CPU/paint 负担不高于当前版本。
- **Done when**: 正常模式保留同等轻柔的加载提示，减少动态效果模式是静态骨架，动画轨道仅改变伪元素 transform。

