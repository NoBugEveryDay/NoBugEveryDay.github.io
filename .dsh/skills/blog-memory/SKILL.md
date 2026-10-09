---
name: blog-memory
description: 本博客项目的长期记忆与环境速查（处理 /home/orange/blog 任何任务前必读）：推送走 ssh.github.com:443、npm 用项目内缓存、视觉 QA 用 Windows Chrome+deepseek-flash、看板娘与隐藏文章体系、slug 不可改/密码纪律等约定、进行中的待办与用户协作习惯
whenToUse: 会话中首次涉及本博客（/home/orange/blog）的任务前必读；完成重要事项后回来更新本文件；新环境还原时先读本文件再读 README
---

# 博客项目长期记忆（blog-memory）

> 本文件由鲸鱼娘（AI）维护，随仓库 git 版本化。**每次会话开始处理博客任务前先读它**；
> 重要新事项（环境坑、用户决定、进行中工作）随手追加/更新，并 git 提交。

## 一、项目快照（截至 2026-10-09）

- 仓库：`/home/orange/blog`，远程 `NoBugEveryDay/NoBugEveryDay.github.io`（main 分支，**默认分支应为 main**）
- 站点：https://nobugeveryday.github.io/（Astro 5 + GitHub Pages Actions 自动部署 + Giscus 评论 + Pagefind 搜索）
- 内容：118 篇公开文章（英文扁平 slug URL）+ about/cv/about-english + 10 篇加密隐藏文章（/h/<token>/）
- 看板娘：鲸鱼娘（dsh-whale-musume 图片立绘引擎，2026-10 由 Live2D 切换；MIT 许可，vendor 于 public/assets/ 含 4 处 BLOG PATCH，见 public/assets/NOTICE.md）
- 公告文章：/blog-now-maintained-by-ai/（用户写的开头 + 鲸鱼娘续写，已发布）
- 旧域名 blog.sysu.tech：**用户已自行通过 DNS 解决跳转**（不再经旧服务器）；旧中文链接无逐篇跳转，由 404 引导页兜底
- **隐私历史清理（2026-10 用户要求）**：main 已重写为单提交历史（清除含隐藏文章明文的旧提交）；
  远程 master（旧 Hexo 构建，**曾包含后来转为隐藏的文章的完整 HTML**）已删除；
  旧站完整存档在本机 `NoBugEveryDay.github.io/`（gitignore）；仓库当前零明文，克隆不可见任何隐藏文章元数据

## 二、环境速查（最易忘的坑，务必照做）

- **推送 GitHub（SSH 22 端口被干扰、hz 跳板不稳定）**：远程地址已设为
  `ssh://git@ssh.github.com:443/NoBugEveryDay/NoBugEveryDay.github.io.git`；
  推送命令固定用 `GIT_SSH_COMMAND="ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o IdentityFile=~/.ssh/github.key -o IdentitiesOnly=yes -o ConnectTimeout=20" git push origin main`
  （网络抖动时循环重试，通常几分钟内成功）
- **npm**：环境注入了全局缓存路径（会被文件沙箱拦截），必须用
  `npm_config_cache=/home/orange/blog/.npm-cache npm <命令>`；CI 上无需
- **文件沙箱**：workspace-write 模式，只能写 /home/orange/blog 下；无 sudo；/mnt/c 只读不可写
- **HTTPS 出网**：api.github.com、nuget.org 等间歇性超时——API 轮询要带重试；git 走 443 SSH 通道最稳
- **Actions 部署偶发瞬时失败**（build 绿 deploy 挂、无描述）：空提交重触发即可
- Node 版本 `.nvmrc` = 24；构建已禁用遥测（package.json scripts 内置）

## 三、视觉 QA 工具链（本环境实测可用）

- **视觉模型 = `deepseek-flash`**（官方唯一视觉模型；deepseek-v4-pro 无视觉、
  deepseek-v4-flash-vision-exp 已下线、deepseek-v41-flash 不在 subagent 白名单）
  → workflow 工具里 `agent(prompt, { provider: 'deepseek-official', model: 'deepseek-flash' })`
- **截图**：`CHROME_PATH="/mnt/c/Program Files/Google/Chrome/Application/chrome.exe" node scripts/shot.mjs --legacy --url <URL> --out /tmp/x.png --wait 14000 --width 1280 --height 860`
  - 看板娘（dsh-whale-musume）只预载 5 张立绘（~1MB），`--wait 14000` 足够；`--states` 截待机/摸头两态
  - `--dark` 截暗色；`--dsf` 不可靠；**小视口截图不可信**（Chrome 强制最小窗口宽 ~500px，图与布局错位）
  - 真实手机宽度请用户真机确认；或用 iframe+探针思路（dump-dom 读 innerWidth/scrollWidth）
- **DOM 证据**：`chrome --headless --virtual-time-budget=20000 --dump-dom <url>` 查
  `[data-dsh-whale-root]` 与 `data-dsh-whale-mode="float"`（看板娘已挂载）；
  状态细节用 `scripts/shot.mjs`（CDP 模式）读 `window.__dshWhaleMoeDebug`
- 截图后派 deepseek-flash 复核是成熟流程；我自己（默认模型）无视觉能力，别浪费时间

## 四、约定与红线（违反会出事）

1. **slug 发布后不可改**（giscus pathname 映射绑定评论）；格式小写字母/数字/连字符，全局唯一
2. **密码纪律**：隐藏文章统一密码只存本机 `private/passwords.md`（gitignore），
   严禁进入任何提交/commit message/文档/对话记录（含本 skill 与 README，不得写字面量）；
   提交前 `PW=$(tail -n 1 private/passwords.md); [ -n "$PW" ] && git grep -n "$PW" --cached` 无结果必检
   （注：passwords.md 可带注释行，密码在**最后一行**；上面检查只认文本文件命中，密文/二进制里的
   巧合子串不算泄漏，但出现时需人工确认匹配位置）
3. **隐藏文章零明文（用户 2026-10 决定）**：`source.md.enc` 为 v2 格式（标题/日期等 meta 与正文一起加密）；
   阅读页外壳标题统一「隐藏文章」；`.hidden-posts.md` 索引仅本机（gitignore），由加密稿+密码随时重建；
   GitHub 上只有 token 目录与密文
4. **看板娘许可**：2026-10 起为 dsh-whale-musume（MIT © Sutera-Diffusus，代码与立绘整体 MIT，
   立绘作者 SuteraWu），无署名/商用限制，页脚致谢仍保留；vendor 于 `public/assets/`，
   4 处本地补丁带 `BLOG PATCH` 标记（升级上游须重新合入，见 `public/assets/NOTICE.md`）；
   资源根硬编码 `/assets/generated/`，不可移动位置；`window.__BLOG_NO_REST_PRELOAD__`
   由 BaseLayout 注入以跳过约 4MB 全量预热
5. **front-matter**：date 可用时间（同日多篇排序）；首页摘要用 `<!-- more -->` 标记，
   卡片只显示摘要文字（不显示「摘要」标题）
6. Astro 5 的 markdown 页面布局从 `Astro.props.frontmatter`/`content` 嵌套取字段（顶层拿不到）
7. 人设：博客由鲸鱼娘（DeepSeek 驱动）维护，相关沟通用鲸鱼娘口吻

## 五、用户协作习惯

- 用户是细节控，会亲自目检线上效果并精确报问题（日期、标题、溢出都抓到过）——改完要如实报告验证证据
- 文章内容偏好：用户写开头/草稿 → 我给续写或整理 → **用户确认后再发布**（公告文章即此流程）
- 用户会自己处理外部账号操作（DNS、GitHub 设置、giscus 授权），只需给精确步骤
- 旧博文风格：平实技术风 + 偶尔吐槽，`## 摘要` + `<!-- more -->` 惯例

## 六、进行中 / 待办

- [x] 看板娘打磨——2026-10 整体切换为 dsh-whale-musume 后自然解决：气泡自带尾巴；
      移动端经 BLOG PATCH 缩至 70%（140px）；原 Live2D 方案废弃
- [ ] 未来博文由用户投喂素材，鲸鱼娘按 blog-post skill 全流程处理（含隐藏/草稿档）
- [x] 隐藏文章导航「隐藏」→ /hidden/ 加密目录页（自动重建）——已上线
- [x] 英文扁平 slug、404 引导页、giscus、看板娘——均已上线

## 七、本文件的维护规则

- 重要事项（用户决定、环境变化、踩坑解法）随手追加到对应小节，commit message 用 `docs(memory): ...`
- 待办完成打 [x] 并注明日期；新环境还原先读本文件（环境速查/QA 工具链都在这里）
