# 生命不息 折腾不止

丰光南的个人博客。**由 AI 全自动维护**：基于 [Astro](https://astro.build) 构建、GitHub Actions 自动部署到
[nobugeveryday.github.io](https://nobugeveryday.github.io)、Giscus（GitHub Discussions）评论、Pagefind 全文搜索。

## 目录结构

```
├── src/content/posts/…/   公开博文（分类子目录 + 同名图片目录，URL = 目录路径）
├── src/pages/             首页/分类/标签/归档/关于/CV/404/分页
├── src/layouts/           布局（BaseLayout、PostLayout、PageLayout）
├── src/components/        PostCard、Giscus、Search 等
├── src/config.ts          站点与 Giscus 配置（唯一配置入口）
├── scripts/hidden.mjs     隐藏文章加/解密（encrypt/decrypt/restore/verify/list）
├── scripts/shot.mjs       看板娘视觉 QA 截图工具（WSL + Windows Chrome）
├── .dsh/skills/           项目专用 AI 技能（blog-memory 记忆 / blog-post 发文 / blog-site 维护）
├── public/h/<token>/      隐藏文章（Staticrypt 加密阅读页 + AES 加密 markdown）
├── .hidden-posts.md       隐藏文章索引（不含密码）
└── private/               仅本机（gitignore）：隐藏文章明文工作副本 + 密码本
```

## 本地开发

```bash
npm install        # 依赖（Node 版本见 .nvmrc）
npm run dev        # 开发预览 http://localhost:4321
npm run build      # 构建 dist/ + Pagefind 索引
npm run preview    # 预览构建产物
```

## 发布

推送到 `main` 分支即自动部署（`.github/workflows/deploy.yml`）：构建 → Pagefind 索引 → GitHub Pages。
本仓库即为 GitHub Pages 源（main 分支）。旧 Hexo 站点存档在本机 `NoBugEveryDay.github.io/` 目录
（gitignore；2026-10 隐私清理时已删除远程旧分支，回退方法见 skill 或询问 AI）。

## 文章可见性三档

| 档位 | front-matter | 行为 |
|---|---|---|
| `public`（默认） | 无 | 正常发布，URL = `/<slug>/`（英文扁平 slug） |
| `hidden` | — | Staticrypt 加密页 + AES 加密稿，见下 |
| `draft` | `draft: true` | 不构建，站点上不存在 |

**URL 约定**：公开文章 URL 为英文扁平 slug（front-matter `slug` 字段，小写字母/数字/连字符、
全局唯一），如 `https://nobugeveryday.github.io/mount-new-disk-on-linux/`。旧站中文 URL 已废弃
且不做跳转（用户决定）；404 页说明旧链接失效并提供搜索/归档/分类入口。slug 发布后不可改
（giscus 按 pathname 映射评论，改 slug 会丢评论）。

**隐藏文章**（`public/h/<token>/`）：

- 每个 token 两个提交文件：`index.html`（浏览器输密码阅读，图片已内嵌，**外壳标题为通用「隐藏文章」不泄露文章名**）与
  `source.md.enc`（AES-256-GCM 加密，**v2 格式：标题/日期/路径等元数据与正文一起加密**，仓库中零明文）
- 明文 markdown 与密码本只存本机 `private/`；`.hidden-posts.md` 索引**仅本机**（gitignore），
  可由 `node scripts/hidden.mjs index` 从加密稿+密码随时重建
- 不进首页/分类/标签/归档/RSS/sitemap/搜索，无评论区，`noindex`
- **导航「隐藏」入口 → `/hidden/`**：加密目录页，输密码后列出全部隐藏文章链接
  （每次索引重建自动再生成；robots/Pagefind 已排除）
- 维护命令（密码自动从本机 `private/passwords.md` 首行读取，脚本绝不硬编码）：

```bash
node scripts/hidden.mjs encrypt <relpath>   # 加密/重加密一篇（改明文后重跑即更新）
node scripts/hidden.mjs decrypt <token>     # 还原单篇原始 markdown 到 private/
node scripts/hidden.mjs restore             # 批量还原全部（新环境用）
node scripts/hidden.mjs verify              # 本地复现浏览器解密，校验加密页
node scripts/hidden.mjs list                # 列出全部 + URL
```

## 新环境还原指南（重要，clone 后必读）

> 本指南只记录流程，**密码本身不在此仓库的任何位置**，由你在新环境提供。

1. `git clone git@github.com:NoBugEveryDay/NoBugEveryDay.github.io.git`
2. 按 `.nvmrc` 装 Node；公开博客要本地预览需 `npm install` + `npm run dev`
   —— **公开博客内容、页面、配置全在仓库里，无需密码**
3. 还原隐藏文章（**无需安装任何依赖**，只需 Node 与密码）：
   - 建立本机密码本：`private/passwords.md`，**第一行**写隐藏文章统一密码
   - 运行 `node scripts/hidden.mjs restore`
     —— 遍历 `public/h/*/source.md.enc`，批量解出全部原始 markdown 到
     `private/hidden-posts/`（还原到原分类子目录），并与 `.hidden-posts.md` 索引核对
4. 至此项目完整还原：公开文章可直接维护；隐藏文章可改明文 → `encrypt` 重加密 → 提交
   （加密需要 `npm install` 后的依赖：marked、gray-matter、staticrypt）

**还原保证范围**：`restore` 从仓库还原隐藏文章的**原始 markdown（字节级一致）**与
**正文引用的全部图片**（从加密阅读页内嵌的 data URI 提取落盘）。未在正文引用的本地附件
（如作者随手放的未使用图片/文档）不进仓库、不参与还原，只存在于原机器的 `private/`。

本机私密区（`private/`）丢失时，只要仓库的加密稿还在、密码还在，就能完整还原全部隐藏文章。

## 评论系统（Giscus）

配置入口：`src/config.ts` 的 `giscus` 段。一次性设置：

1. 仓库 Settings → General → Features → 勾选 **Discussions**
2. 打开 https://giscus.app → 填 `NoBugEveryDay/NoBugEveryDay.github.io` → 安装 giscus App
3. 把生成的 `repo_id` / `category_id` 填入 `src/config.ts`，并把 `enabled` 改为 `true`
4. 未配置时文章页优雅降级（不显示评论区）

## 看板娘（鲸鱼娘 Live2D）

- 配置入口：`src/config.ts` 的 `mascot` 段（启用/高度/点击台词）；渲染器 `public/live2d/pet-blog.js`（defer 懒加载）
- 模型与运行时自托管于 `public/live2d/`（约 5.1MB），无 CDN 依赖
- 交互：点击弹台词 + 随机动作、可拖动（贴边吸附）、可隐藏/恢复，位置记忆于 localStorage；移动端自动缩小；`prefers-reduced-motion` 时不渲染
- 隐藏文章（加密页）不走 BaseLayout，**不会加载看板娘**
- **许可（务必遵守）**：代码（查看器）MIT（改编自 Andersen216/dsh-whale-girl-live2d）；模型美术
  **CC BY-NC-SA 4.0**（© 上善无形 / ZipZipPipe / 氵六青，署名-非商业-相同方式共享），
  许可文件在 `public/live2d/NOTICE.md`、`AUTHORS.md`、`PROVENANCE.md`，页脚署名**不可删除**；
  博客若商业化须替换模型或取得原作者授权
- 视觉 QA 工具：`node scripts/shot.mjs --legacy --url http://localhost:4399/ --out /tmp/x.png`
  （WSL 下用 Windows Chrome 截图；`--dark` 截暗色主题）

## 旧站迁移记录

- 一次性迁移脚本与新旧 URL 对照报告因**含隐藏文章明文元数据，已从仓库移除**（隐私清理，2026-10）；
  数据源为服务器打包的 `blog/root-dir/source/_posts/`，118 篇公开文章 URL 曾与旧站逐篇一致
- 旧站未发布文章（共 10 篇）→ 全部转为加密隐藏文章，相关细节不在此公开
- 已知差异：旧站 `/archives/1997/02/`（about 页日期造成的空归档）与空月份页不再生成；
  一篇源文件日期在旧站最后一次构建后被修改（2021-02-28 → 2021-03-01），新站按最新日期归档
