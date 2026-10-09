---
name: blog-site
description: 维护本博客站点本身（Astro + GitHub Pages）的标准流程：配置与布局修改、依赖升级、CI/GitHub Pages/giscus 排错、搜索重建、新环境克隆还原（含隐藏文章密码还原）、上线验收与回退
whenToUse: 需要改站点配置/主题/布局、升级依赖、排查构建或部署故障、在新机器上重建博客环境、处理 Giscus 评论问题时
---

# 站点维护（blog-site）

> **先读 `blog-memory`**：环境速查（推送 443/SSH、npm 缓存、视觉 QA 工具链）、约定与红线、
> 用户协作习惯都在那里。本 skill 只讲站点本身的维护操作。

**角色设定**：本博客由 AI 以「鲸鱼娘」的身份维护（DeepSeek 模型驱动）。

## 零、看板娘（鲸鱼娘 Live2D）

- 配置：`src/config.ts` 的 `mascot` 段；渲染器 `public/live2d/pet-blog.js`；资产 `public/live2d/{model,vendor}`（自托管，约 5.1MB）
- 特性：idle 循环 + 视线跟随 + 点击气泡/随机动作 + 拖动/隐藏 + localStorage 记忆；移动端缩至 55%；reduced-motion 不渲染；加密页不加载
- 隐藏文章入口：导航「隐藏」→ `/hidden/`（加密目录页，由 `scripts/hidden.mjs` 的 rebuildIndex 自动生成/重加密，
  列出全部隐藏文章链接；robots 与 Pagefind 均已排除）
- **许可红线（最高优先级）**：模型美术为 **CC BY-NC-SA 4.0**（© 上善无形 / ZipZipPipe / 氵六青）。
  页脚署名**不可删**；**不可用于商业用途**（博客若商业化必须先替换模型或取得授权）；
  修改模型资产需按 SA 相同许可发布。代码（查看器）MIT，改编自 Andersen216/dsh-whale-girl-live2d，保留头部注释
- 视觉 QA：`node scripts/shot.mjs --legacy --url http://localhost:4399/ --out /tmp/x.png --wait 14000`
  （WSL 用 Windows Chrome：CHROME_PATH 指向 chrome.exe；`--dark` 截暗色；`--width/--height` 调视口；
  截图后用有视觉能力的 subagent 复核，或请用户人工确认）
- 已知限制（本机 WSL 环境实测）：Windows Chrome 的 CDP 调试端口只监听 Windows loopback，
  WSL 直连不通；`--remote-debugging-pipe` 也因 WSL 互操作不传继承句柄而失败；
  `--screenshot` 模式会在懒加载（5MB 模型）完成前截取，抓不到看板娘——**60 秒虚拟时间预算可解**
  （`--wait 60000`）；**移动端小视口截图不可信**：Chrome 强制最小窗口宽（~500px），
  图按请求尺寸截但布局按更宽视口算，会产生"每行被右缘裁切"的假阳性；真实手机宽度请用
  qa-probe 思路（iframe + dump-dom 读 innerWidth/scrollWidth）或直接请用户在真机确认。
  **可靠替代**：`chrome --headless --virtual-time-budget=20000 --dump-dom <url>` 检查
  `whalepet-wrap` 的 `data-ready="1"`（模型加载成功）与 `data-error`（失败原因），
  气泡文字也会出现在 DOM 里；**视觉复核用 deepseek-flash**（官方唯一视觉模型；
  deepseek-v4-pro 无视觉、deepseek-v4-flash-vision-exp 已下线），最终视觉确认请用户在真实浏览器里看
**遗留 TODO**：给站点加鲸鱼娘看板娘（live2d 组件），尚未实现——用户要求时再动工。

本博客 = Astro 5 静态站，仓库根 `/home/orange/blog`，远程 `git@github.com:NoBugEveryDay/NoBugEveryDay.github.io.git`。
main 分支 = 源码；`master` = 旧 Hexo 构建产物（回退存档）。GitHub Pages 由 Actions 部署。

## 一、环境注意（本机）

- npm 缓存指向项目内（系统缓存被沙箱拦截）：
  `npm_config_cache=/home/orange/blog/.npm-cache npm <子命令>`
- Node 版本见 `.nvmrc`（24）；构建已禁用遥测（package.json scripts 内置 `ASTRO_TELEMETRY_DISABLED=1`）
- 常用命令：`npm run dev`（开发）、`npm run build`（构建 + Pagefind 索引，postbuild 自动）、`npm run preview`（预览 dist）

## 二、新环境还原（clone 后完整流程）

1. `git clone git@github.com:NoBugEveryDay/NoBugEveryDay.github.io.git`（或 HTTPS）
2. 按 `.nvmrc` 装 Node → `npm install` → `npm run dev` —— 公开博客即可用
3. 隐藏文章还原：让用户提供密码 → 写入 `private/passwords.md` **首行**（gitignore，绝不入库）
   → `node scripts/hidden.mjs restore`（批量解出全部 markdown 到 `private/hidden-posts/`，并与 `.hidden-posts.md` 核对）
4. 还原后 `node scripts/hidden.mjs verify` 自检加密页

> 密码纪律：密码只存 `private/passwords.md`；任何 commit/文档/对话记录不得出现密码。

## 三、配置与定制

- **站点信息/Giscus/导航**：只改 `src/config.ts`（唯一配置入口）
- **布局与样式**：`src/layouts/`、`src/components/`、`src/styles/global.css`
- **内容 schema**：`src/content.config.ts`（front-matter 校验规则；generateId 保留大小写仅影响无 slug 时的回退 URL）
- **URL 方案（用户决定，勿改回）**：公开文章 URL = `/<英文slug>/`（front-matter 的 slug 字段，扁平、全可读字符、全局唯一）；旧站中文 URL 已废弃、不做跳转，`404.astro` 负责说明并提供搜索/归档/分类入口；slug 发布后不可改（giscus pathname 映射会丢评论）
- **构建行为**：`astro.config.mjs`（trailingSlash 必须保持 `always`）
- **页面路由**：`src/pages/`——首页分页手工实现（`index.astro` + `page/[page].astro`），月归档在 `archives/[year]/[month]/[...page].astro`；Astro 5 的 `paginate()` 需要路由含 page 参数，勿改回旧写法；文章路由 `[...slug].astro` 以 slug 生成 params

## 四、发布与 CI

- push main → `.github/workflows/deploy.yml`：npm ci → build → upload artifact → deploy-pages
- Pages 设置：Settings → Pages → Source = **GitHub Actions**（一次性）
- 排错：Actions 日志定位；本地 `npm run build` 复现；常见坑：
  - 图片缺失 → `[ImageNotFound]`，修引用或补图
  - front-matter 非法 → zod 报错，按 schema 修
  - 路由 404 → 检查文件名与 getStaticPaths 的 params 是否一致

## 五、Giscus 评论

- 配置：`src/config.ts` 的 `giscus` 段（repo/repoId/category/categoryId 来自 giscus.app）
- 一次性设置：仓库开启 Discussions → giscus.app 安装 App → 填 repo_id/category_id → `enabled: true`
- 未配置时文章页自动降级（无评论区）；隐藏文章永不加载评论

## 六、搜索 / RSS / sitemap

- Pagefind：`npm run build` 自动生成 `dist/pagefind/`；隐藏页带 `data-pagefind-ignore` 自动排除
- 搜索 UI：`src/components/Search.astro` + `src/lib/search.ts`（运行时加载 `/pagefind/pagefind.js`，勿改成打包导入）
- RSS：`src/pages/rss.xml.ts`；sitemap：`@astrojs/sitemap` 集成自动生成；`public/robots.txt` 已 Disallow `/h/`

## 七、回退方案

远程 `master` 分支完整保留旧 Hexo 站点产物：Settings → Pages → Source 改回 "Deploy from a branch: master" 即恢复旧站。
本地旧数据存档在 `blog/` 与 `NoBugEveryDay.github.io/`（均 gitignore）。

## 八、依赖升级

- `npm outdated` 查看；升级后必须 `npm run build` 全绿 + 抽查首页/文章页/归档页/一个隐藏页
- 重点回归项：大小写 URL（`/Benchmark/SSD测试记录/`）、`/page/2/`、`/archives/yyyy/mm/`、Pagefind 搜索、Giscus 加载
- `staticrypt` 升级后重跑 `node scripts/hidden.mjs encrypt --all` 并 `verify`
