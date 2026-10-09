---
name: blog-post
description: 在本博客（Astro + GitHub Pages）发布/修改文章的标准流程：把用户提供的任意形式内容（markdown/纯文本/图片/链接）转成符合 schema 的博文，处理三类可见性（public/hidden/draft）、图片落盘、本地构建验证、git 提交推送与 CI 盯防
whenToUse: 用户要求发布新文章、修改或删除已有文章、转换隐藏文章可见性、批量更新博文时
---

# 发布博文（blog-post）

> **先读 `blog-memory`**：环境速查（推送 443/SSH、npm 缓存、视觉 QA）、约定与红线、
> 用户协作习惯都在那里。本 skill 只讲发文流程。

**角色设定**：本博客由 AI 以「鲸鱼娘」的身份维护（DeepSeek 模型驱动）。与博客相关的内容
以鲸鱼娘的口吻表达；文章正文由作者指定风格（旧文多为平实技术风+偶尔吐槽）。
**看板娘**：鲸鱼娘看板娘已上线（dsh-whale-musume，维护要点见 blog-site skill 的「看板娘」一节）。

本博客 = Astro 静态站，仓库根 `/home/orange/blog`，远程 `git@github.com:NoBugEveryDay/NoBugEveryDay.github.io.git`（main 分支，push 即由 GitHub Actions 自动部署）。

## 一、公开文章（默认）

1. **内容规范化**：把用户提供的任何形式（md/纯文本/Word 内容/图片/链接）整理成标准 Markdown。
   - 代码块必须标注语言；外部链接用 `[文字](url)`；正文中不写一级标题（`#` 留给页面标题）
   - 摘要：正文开头用 `<!-- more -->` 标记摘要截断点（旧站惯例保留），或写 `description` 字段
2. **文件位置**：`src/content/posts/<分类>/<子分类?>/<标题>.md`（中文文件名仅用于内容组织，不进 URL）。
3. **front-matter 规范**（与 `src/content.config.ts` 的 zod schema 一致）：
   ```yaml
   ---
   title: "文章标题"          # 显示标题，中文
   date: 2025-10-09T14:30    # YYYY-MM-DD 或带时间 YYYY-MM-DDTHH:mm，必填
   slug: english-post-slug   # 必填！英文扁平 URL（见下）
   categories: [分类, 子分类]  # 数组，可为空
   tags: [标签1, 标签2]        # 数组，可为空
   description: "一句话摘要"    # 可选
   ---
   ```
   **同日多篇的排序**：date 只写日期时按当天零点处理；同一天要按发布时间排序就写全时间
   `date: 2025-10-09T14:30`（时间不显示在页面上，只用于排序）；同时间戳的文章按 id 字母序稳定排序。
4. **slug 规则（重要）**：
   - URL = `/<slug>/`（扁平，不含分类路径）；站内所有链接经由 `postUrl()` 生成
   - 格式：小写字母/数字/连字符 `^[a-z0-9]+(-[a-z0-9]+)*$`，**全局唯一**
   - 拟定方法：翻译标题语义的简短英文短语（如《Linux挂载硬盘》→ `mount-new-disk-on-linux`）
   - 旧站中文 URL 已全部废弃且**不做跳转**（用户决定），404 页有说明与搜索入口
   - giscus 按 pathname 映射评论：**发布后不得再改 slug**（改 slug = 丢评论，需手工迁移讨论）
5. **图片**：图片放文章同名目录 `src/content/posts/<分类>/<标题>/*.png`，
   文中引用 `![描述](<标题>/xxx.png)`（相对文章文件所在目录）。
6. **本地验证**：`npm run build` 必须通过（注意本机需要 `npm_config_cache=/home/orange/blog/.npm-cache`，见「环境注意」）。
7. **提交推送**：`git add -A && git commit -m "post: <标题>" && git push origin main`，
   然后盯 GitHub Actions 构建（push 后无本地终端可看，直接依赖 Actions 结果；如失败按日志修复）。
8. **报告**：向用户报告文章 URL：`https://nobugeveryday.github.io/<slug>/`。

## 二、隐藏文章（Staticrypt 加密，统一密码）

**密码纪律（最高优先级）**：
- 密码只存在于本机 `private/passwords.md`（gitignore）；`scripts/hidden.mjs` 从该文件首行读取
- **严禁**把密码写入任何提交内容、commit message、`.hidden-posts.md`、skill 文档或对话摘要文件
- `git grep` 密码关键字是每次提交前的必检项（见文末检查清单）

流程：
1. 明文 markdown 写入 `private/hidden-posts/<分类>/<标题>.md`（front-matter 同公开文章；无需 visibility 字段）
2. `node scripts/hidden.mjs encrypt <relpath>` —— 产出 `public/h/<token>/index.html`（阅读页）+ `source.md.enc`（加密稿，**v2 格式：标题/日期等 meta 与正文一起加密，仓库零明文**；阅读页外壳标题统一为「隐藏文章」），token 自动生成并写回明文 front-matter 持久化
3. `node scripts/hidden.mjs verify` 确认全部加密页可用密码解密
4. 索引重建到本机 `.hidden-posts.md`（**gitignore，不同步 GitHub**；含标题/日期，可由加密稿+密码随时重建），
   并自动重建加密目录页 `public/hidden/index.html`（导航「隐藏」入口；零依赖环境会跳过并沿用旧版）
5. 提交推送：commit message 带标题与 URL（**不含密码**），如 `post(hidden): <标题> -> /h/xxxx/`
   ——注意：commit message 本身会公开出现在 GitHub 上，**不要写隐藏文章的真实标题**，统一用占位符或类别描述
6. **报告**：告知用户链接 `https://nobugeveryday.github.io/h/<token>/`；密码勿在对话中明示

修改隐藏文章：改 `private/hidden-posts/` 明文 → 重跑 `encrypt <relpath>`（token 不变）→ 提交。
还原（明文丢失/新环境）：`node scripts/hidden.mjs decrypt <token>`（单篇）或 `restore`（全部），
前提是本机密码本存在；没有密码本时先向用户索要密码并写入 `private/passwords.md` 首行。

## 三、草稿（draft）

front-matter 加 `draft: true`（schema 中 `visibility: draft` 亦可），构建自动跳过，站点上不存在。

## 四、环境注意

- 本机 npm 缓存需指向项目内：`npm_config_cache=/home/orange/blog/.npm-cache npm <命令>`
  （环境变量注入了系统缓存路径，会被沙箱拦截；CI 上无需）
- Node 版本见 `.nvmrc`（24）
- 构建命令实际为 `npm run build`（含 Pagefind 索引，postbuild 自动执行）

## 五、提交前检查清单

- [ ] `npm run build` 通过
- [ ] 公开文章：URL 结构与分类目录一致、图片存在且引用路径正确
- [ ] 隐藏文章：`verify` 通过、`.hidden-posts.md` 已更新、提交内容 `PW=$(tail -n 1 private/passwords.md); [ -n "$PW" ] && git grep -n "$PW" --cached` 无结果（密码在 passwords.md 最后一行；密文/二进制中的巧合子串不算）
- [ ] commit message 格式 `post: 标题` / `post(hidden): 标题 -> /h/<token>/` / `fix(post): …`
- [ ] push 后确认 Actions 绿（无法确认时告知用户）
