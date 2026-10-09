# 004 — 优化弹窗进入曲线并让快捷命令面板即时打开

- **Status**: TODO
- **Commit**: 631b5ef5
- **Severity**: LOW
- **Category**: Purpose & frequency; Easing & duration
- **Estimated scope**: 2 Vue components and dialog CSS

## Problem

所有 `ModalDialog` 共用 250ms `ease` 位移与透明度过渡；命令面板也通过 Ctrl/Cmd+K、Ctrl/Cmd+/ 打开，因此键盘高频入口同样等待弹窗动画。

`app/components/modal/ModalDialog.vue:172-193`：

```css
.dialog-visible-enter-active,
.dialog-visible-leave-active {
  transition-duration: 0.25s;
  .dialog-mask { transition: opacity 0.25s ease; }
  .dialog-main { transition: opacity 0.25s ease, transform 0.25s ease; }
}
.dialog-visible-enter-from,
.dialog-visible-leave-to {
  .dialog-mask { opacity: 0; }
  .dialog-main { transform: translateY(50px); opacity: 0; }
}
```

命令面板实例位于 `app/components/modal/ModalContainer.vue:89-91`；快捷键监听位于 `26-34`。

## Target

- 普通弹窗保留 250ms 透明度＋位移反馈，但将进入/退出 easing 改为 **`cubic-bezier(0.23, 1, 0.32, 1)`**。
- `ModalDialog` 新增 `motion?: 'standard' | 'instant'` 可选 prop，默认 `standard`；命令面板单独传 `motion="instant"`，打开/关闭不等待 CSS 动画。
- 其他 dialog 使用者无需修改，继续获得默认 `standard` 过渡。
- 由于 instant 模式不会触发 CSS `transitionend`，焦点圈闭激活要挂在 Vue Transition 的 `after-enter` 生命周期，而不是依赖子元素的 `transitionend`。

## Repo conventions to follow

- `ModalDialog.vue` 使用 Vue `<Transition>` 并通过 `defineProps` 暴露可选行为；项目组件可选 props 均设默认值。
- 命令面板的唯一实例在 `ModalContainer.vue`，不要将全局默认弹窗都设成即时。
- Reduced-motion 的 opacity-only 行为由 002 在本计划之后添加。

## Steps

1. 在 `ModalDialog.vue` 定义 `motion` prop，类型为 `'standard' | 'instant'`，默认 `'standard'`。
2. 按 prop 选择 Vue Transition name：`dialog-visible` 或无 CSS transition 的 `dialog-instant`；instant 状态不得附带 50px translate 或 opacity 初始值。
3. 将标准模式的 mask opacity 和 dialog opacity/transform transition 改为 250ms `cubic-bezier(0.23, 1, 0.32, 1)`；保持 50px 初始位移不变，便于隔离本计划只改曲线。
4. 将焦点激活钩子改为 `@after-enter`，确认标准与 instant 模式都能激活 focus trap。
5. 在 `ModalContainer.vue` 的命令面板实例传入 `motion="instant"`；不要给其他实例传该值。

## Boundaries

- 不改变弹窗尺寸、遮罩不透明度、关闭快捷键、Escape 行为、焦点恢复或 mask 点击行为。
- 不删除标准弹窗动画，也不增加依赖。
- 不改变 Media Preview 内的图片缩放/滑动动画。
- 如果焦点 trap 不能在 instant 模式可靠激活，停止并修复生命周期钩子，不要回退成不可访问的无动画实现。

## Verification

- **Mechanical**: `pnpm lint` 和 `pnpm test:typecheck`；检查所有既有 `ModalDialog` 调用无需提供新 prop。
- **Feel check**: Ctrl/Cmd+K 打开命令面板，确认快捷键反馈即时、焦点仍进入面板；确认确认框、错误框和媒体预览保留 ease-out 标准动画。用 DevTools 10% 播放速度检查普通弹窗的进入曲线。
- **Done when**: 命令面板没有进退场动画；其他弹窗仍在 250ms 内顺畅进入/退出，且焦点捕获和恢复不变。

