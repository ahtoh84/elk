# 002 — 补齐弹窗与移动抽屉的减少动态效果偏好

- **Status**: TODO
- **Commit**: 631b5ef5
- **Severity**: MEDIUM
- **Category**: Accessibility
- **Estimated scope**: 2 Vue components, CSS only

## Problem

应用已有局部 `prefers-reduced-motion` 规则，但通用弹窗与手机底部“更多”抽屉仍会移动、缩放。抽屉面板也会在手势结束后按常规时长回弹。敏感媒体遮罩的状态和交互不能因此改变。

`app/components/modal/ModalDialog.vue:172-193` 当前进入/退出均会变换位置：

```css
.dialog-visible-enter-active,
.dialog-visible-leave-active {
  transition-duration: 0.25s;
  .dialog-main {
    transition: opacity 0.25s ease, transform 0.25s ease;
  }
}
.dialog-visible-enter-from,
.dialog-visible-leave-to {
  .dialog-main {
    transform: translateY(50px);
    opacity: 0;
  }
}
```

`app/components/nav/NavBottomMoreMenu.vue:126-132` 对抽屉使用位移、缩放和透明度过渡；面板位移样式在 `143-154`。

## Target

系统偏好为 `reduce` 时：

- 通用弹窗移除 50px 位移，保留 **200ms `ease-out` 透明度反馈**。
- 移动抽屉移除打开/关闭时的位移和缩放，保留 **120ms `ease-out` 遮罩透明度反馈**。
- 用户手指拖动抽屉时仍保持直接跟手；放手后立即归位或关闭，不再额外播放位移动画。
- 不影响非减少动态效果模式下的正常过渡，也不改变焦点管理、遮罩点击关闭或手势阈值。

建议弹窗的减少动态效果规则采用如下精确目标（适配 scoped 样式选择器）：

```css
@media (prefers-reduced-motion: reduce) {
  .dialog-visible-enter-active,
  .dialog-visible-leave-active {
    transition-duration: 200ms;
  }

  .dialog-visible-enter-active .dialog-mask,
  .dialog-visible-leave-active .dialog-mask,
  .dialog-visible-enter-active .dialog-main,
  .dialog-visible-leave-active .dialog-main {
    transition: opacity 200ms ease-out;
  }

  .dialog-visible-enter-from .dialog-main,
  .dialog-visible-leave-to .dialog-main {
    transform: none;
  }
}
```

抽屉需在 003 先添加的面板类上实现等价策略：遮罩 120ms 透明度；面板 transform 时长为 0ms，并确保普通打开状态不保留 enter/leave 位移缩放。媒体查询不得用 `!important` 覆盖拖动时的行内 `transform`，直接跟手仍须工作。

## Repo conventions to follow

- 局部媒体查询示例：`app/components/main/MainContent.vue:136-140`、`app/components/nav/NavSide.vue:210-214`。
- 页面和底部导航减少动态效果示例：`app/styles/global.css:50-66`、`app/layouts/default.vue:116-121`。
- 此计划在 003 和 004 之后执行，以使用已经明确的抽屉面板类和弹窗 transition 类。

## Steps

1. 在 `ModalDialog.vue` 添加 scoped 减少动态效果规则：仅保留遮罩和内容的 200ms 透明度过渡，覆盖内容的位移状态为 `transform: none`。
2. 在 `NavBottomMoreMenu.vue` 为抽屉内容面板使用 003 引入的稳定类名；增加减少动态效果媒体查询，遮罩仅淡入淡出 120ms，面板 transform duration 设为 0ms。
3. 验证面板的行内拖动变换在减少动态效果模式下仍由触摸位置驱动；只禁用放手后的惯性/回弹，不禁用直接操控。
4. 不在本步骤扩展到所有 `animate-spin` 加载图标；加载状态语义和骨架屏的静态呈现由各自组件计划处理。

## Boundaries

- 不移除 opacity 状态反馈，不设全站 `* { animation:none }`。
- 不修改抽屉的 120px 关闭阈值、滚动锁定、安全区位置、层级或遮罩点击行为。
- 不更改 `StatusAttachment` 的 NSFW 遮罩、模糊强度、视频播放或揭示逻辑。
- 若 003 的面板类未存在，先按 003 实施，不临时用宽泛 `div` 选择器。

## Verification

- **Mechanical**: `pnpm lint`；在 DevTools 的 Rendering 面板分别启用/关闭 `prefers-reduced-motion: reduce`，检查计算样式。确认 drawer drag 时行内 transform 仍生效。
- **Feel check**: 在减少动态效果模式下打开、关闭普通弹窗及移动“更多”菜单：无位置移动或缩放，但仍有短暂透明度反馈；拖动菜单时面板贴手，放手后不滑行。关闭系统偏好后确认 003/004 的标准动画仍生效。
- **Done when**: 上述两个共用 UI 在减少动态效果模式中遵循目标；焦点圈闭、Escape 关闭和拖动行为不退化。

