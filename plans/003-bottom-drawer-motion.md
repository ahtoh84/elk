# 003 — 调整移动端更多抽屉的缓动与底边锚点

- **Status**: TODO
- **Commit**: 631b5ef5
- **Severity**: MEDIUM
- **Category**: Easing & duration; Physicality & origin
- **Estimated scope**: 1 Vue component, CSS classes and scoped styles

## Problem

移动端“更多”抽屉在 Vue Transition 外层使用 `ease-out`，但面板自己另有 `transform ease-in`；这使主要面板位移在打开及未达到关闭阈值后的回弹中以慢起步曲线运行。离场 transition 也使用 `ease-in`。此外，`scale-98` 没有底部锚点，抽屉底边打开时会向上缩进，而不是像贴着屏幕底部展开。

`app/components/nav/NavBottomMoreMenu.vue:126-132`：

```vue
<Transition
  enter-active-class="transition duration-250 ease-out"
  enter-from-class="opacity-0 children:(translate-y-2 scale-98)"
  enter-to-class="opacity-100 children:(translate-y-0)"
  leave-active-class="transition duration-250 ease-in"
  leave-from-class="opacity-100 children:(translate-y-0)"
  leave-to-class="opacity-0 children:(translate-y-2 scale-98)"
>
```

面板当前使用 `duration-250` / `duration-0` 类并声明 `transition="transform ease-in"`，见 `143-154`。

## Target

- 标准模式下抽屉进、退场均使用 **220ms `cubic-bezier(0.23, 1, 0.32, 1)`**，即快速响应的 `ease-out`。
- 给实际抽屉面板添加稳定类名，例如 `nav-bottom-drawer-panel`，并设 `transform-origin: bottom center`。
- 手势拖动期间仍是 1:1 跟手、transition 为 0；未越过阈值时回到原位使用 220ms ease-out；超过阈值仍沿现有关闭流程退出。
- 遮罩继续做淡入淡出；不更改抽屉高度、safe-area、滚动锁定或拖动阈值。

目标曲线和时长：

```css
transition: transform 220ms cubic-bezier(0.23, 1, 0.32, 1);
transform-origin: bottom center;
```

## Repo conventions to follow

- 相近的 drawer 曲线已出现在 `app/components/nav/NavSide.vue:187-207`，桌面更多菜单曲线位于 `app/styles/dropdown.css:24-35`。
- 面板的触摸手势状态由本组件 `dragging` 与 `dragDistance` 管理；复用现有状态，不新增手势库。
- Reduced motion 的规则由 002 补齐；执行 002 前应先保留可识别的 `nav-bottom-drawer-panel` 类名。

## Steps

1. 给 `nav-bottom-drawer` 内实际抽屉面板添加 `nav-bottom-drawer-panel` 类。
2. 将 Vue Transition 的离场曲线从 `ease-in` 调整为目标 `ease-out`，进场/离场时长统一为 220ms。
3. 将面板默认 transform transition 改为 `transform 220ms cubic-bezier(0.23, 1, 0.32, 1)`；拖动期间保留 duration 0。
4. 对 `nav-bottom-drawer-panel` 设置 `transform-origin: bottom center`，确保 Enter 中的 `scale-98` 围绕屏幕底边展开。
5. 确认拖动回弹只在手势结束后触发，手指移动期间无滞后；不改变 120px 关闭判定。

## Boundaries

- 不改动 NavSide 内桌面侧栏的高度＋透明度组合动画；这是有意保留的设计。
- 不改变底部导航弹簧指示条。
- 不改变抽屉内容、层级、滚动、safe-area 和点击关闭逻辑。
- 不用 transform-origin 样式覆盖用户拖动时的动态 transform。

## Verification

- **Mechanical**: `pnpm lint`；检查无额外依赖、重复 transform transition 或影响隐藏占位层的宽泛选择器。
- **Feel check**: 真机或移动设备模拟模式下连续打开、关闭；观察打开从底部边缘进入，关闭迅速离场；慢拉未达阈值能顺滑回位，快速滑过原有阈值仍正常关闭。DevTools 动画面板以 10% 速度检查缩放锚点。
- **Done when**: 抽屉不再慢起步，缩放时底边稳定贴合，直接拖动无延迟且原有手势语义不变。

