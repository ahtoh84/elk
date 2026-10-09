# 001 — 移除时间线帖子批量进场动画

- **Status**: TODO
- **Commit**: 631b5ef5
- **Severity**: MEDIUM
- **Category**: Purpose & frequency; Easing & duration
- **Estimated scope**: 1 CSS file, 1 small rule cleanup

## Problem

`TimelinePaginator.vue` 为每条渲染的 `StatusCard` 都添加 `timeline-post` 类；全局样式因此会在每条帖子挂载时运行 360ms 的淡入上移关键帧动画。初次装载或追加一批帖子时，多行同时移动；再次挂载时关键帧会从起点重播。它还会与 `NuxtPage` 的路由过渡叠加。

位置：`app/components/timeline/TimelinePaginator.vue:38-44` 当前两个分支都使用：

```vue
<StatusCard class="timeline-post" :followed-tag="getFollowedTag(item)" :status="item" :context="context" :older="older" :newer="newer" :account="account" />
```

位置：`app/styles/global.css:120-123`：

```css
.timeline-post {
  border-radius: 0 !important;
  animation: timeline-post-enter 360ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
```

关键帧只由该规则使用，定义于 `app/styles/global.css:142-152`；减少动态效果规则位于 `154-158`。

## Target

- 移除 `.timeline-post` 的 `animation` 声明及不再使用的 `@keyframes timeline-post-enter`。
- 保留 `.timeline-post` 的边角与相邻帖子分隔样式。
- 不为整批初次加载、分页追加或虚拟滚动挂载的帖子播放入场动画。
- 不改变 `NuxtPage` 路由转场、帖子交互反馈或媒体加载过渡。

## Repo conventions to follow

- 全局视觉样式位于 `app/styles/global.css`。
- 项目现有减少动态效果 CSS 示例：`app/styles/global.css:50-66`。
- 时间线帖子类由 `app/components/timeline/TimelinePaginator.vue` 统一设置；本计划不需要改其状态或列表结构。

## Steps

1. 在 `app/styles/global.css` 中删除 `.timeline-post` 上的动画声明。
2. 搜索 `timeline-post-enter`；确认无其他使用后删除对应 `@keyframes` 和只为该动画服务的 `prefers-reduced-motion` 规则。
3. 保留 `.timeline-post`、相邻帖子边框、分隔线以及 hover 样式。

## Boundaries

- 不改动 `TimelinePaginator` 的加载、排序、虚拟滚动或状态 key。
- 不移除 `StatusCard` 的交互或页面路由过渡。
- 不给媒体、NSFW 遮罩或视频播放添加新动画。
- 若基线提交或选择器与本计划不符，停止并报告，不自行扩大改动。

## Verification

- **Mechanical**: `rg -n "timeline-post-enter|\.timeline-post" app/styles/global.css app/components/timeline/TimelinePaginator.vue`；确认 keyframes 和 animation 不再存在，其他 `.timeline-post` 样式仍在。运行 `pnpm lint`。
- **Feel check**: 打开时间线，观察初次载入、滚动触发下一页、虚拟列表复用及切换时间线；帖子本身不再成批淡入上移，页面导航与动作按钮反馈仍正常。
- **Done when**: 任意新挂载的时间线帖子都不播放 `timeline-post-enter`，且布局、分页和帖子交互没有变化。

