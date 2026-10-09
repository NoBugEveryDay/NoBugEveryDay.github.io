# 看板娘资源 Vendoring 说明（NOTICE）

本目录（`public/assets/`）自托管 DeepSeek Harness 桌宠「鲸鱼娘」的运行时资源，
来自上游仓库 [Sutera-Diffusus/dsh-whale-musume](https://github.com/Sutera-Diffusus/dsh-whale-musume)：

- **上游版本**：v2.2.1
- **锁定 commit**：`6e5e9f510cfe816a4bdb8d90a9c2bd38cfab004a`（2026-10-08）
- **许可**：MIT © Sutera-Diffusus（代码与立绘整体 MIT；立绘作者 SuteraWu）

## 文件清单

| 本目录文件 | 上游路径 | 说明 |
|---|---|---|
| `dsh-whale-moe.css` | `assets/dsh-whale-moe.css` | 表现层样式 |
| `whale-moe-core.js` | `assets/whale-moe-core.js` | 纯状态机（无 DOM） |
| `dsh-whale-moe.js` | `assets/dsh-whale-moe.js` | 表现层（自建根节点、渲染、交互） |
| `generated/*.webp` | `assets/generated/*.webp` | 92 张立绘（仅预载 5 张，其余按需加载） |
| `peek-calibration.json` | `assets/peek-calibration.json` | 探头立绘校准表 |

路径约定：表现层硬编码资源根 `/assets/generated/` 与校准表 `/assets/peek-calibration.json`，
与 Astro `public/` 的静态文件根一致，故无需改写路径。

## 本地补丁（均带 `BLOG PATCH` 注释标记，升级上游时须重新合入）

1. `dsh-whale-moe.js` · `resolveLayout` float 分支：视口宽 < 640px 时立绘从 200px 缩至 140px（70%），减少移动端遮挡。
2. `dsh-whale-moe.js` · `preloadRest`：检测到 `window.__BLOG_NO_REST_PRELOAD__`（BaseLayout 注入）时跳过全量预热（约 4MB），只保留 5 张核心姿势预热；静态博客无 DSH 工作态，全量预热不划算。
3. `dsh-whale-moe.js` · `showContextMenu`：博客没有 DSH 设置面板，右键菜单的「打开看板娘设置」改为仅在检测到宿主设置入口时展示（否则是死条目）。
4. `whale-moe-core.js` · `LINES.idle`：待机台词换成博客语境（欢迎/搜索提示/公告链接等）。

## 升级步骤

```bash
git clone --depth 1 https://github.com/Sutera-Diffusus/dsh-whale-musume.git /tmp/up
# 对比 /tmp/up/assets 与本目录，覆盖文件后重新合入上述 4 处 BLOG PATCH，
# 然后 npm run build + 视觉 QA（scripts/shot.mjs --legacy），确认无回归。
```

## 行为差异说明（相对 DSH 宿主）

- 博客页面没有 DSH 结构标记（工具卡/会话运行/终端等），状态机恒处 `idle`，
  只会出现待机/点击互动/节日换装等与内容无关的行为，不会读任何页面内容。
- 天气（Open-Meteo）默认关闭；余额、关键词感知、TTS 播报等默认关闭 —— 默认零外部请求。
