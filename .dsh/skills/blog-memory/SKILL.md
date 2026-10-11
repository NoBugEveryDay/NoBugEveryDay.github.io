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
- **shot.mjs 使用坑（2026-10 实测）**：`--legacy` 模式走 Chrome 自带 `--screenshot`，**不支持 `--script` 注入**；
  非 legacy 的 CDP 模式本机报"调试端口没起来"（不可用）。**单次 `--screenshot` 窗口高度超过 8192px
  会回绕重复顶部内容（下半段是假内容）**——长页面必须分段截（每段 ≤7000px）再拼接。
  同一端口重复起 python http.server 会静默 bind 失败，Chrome 截到的是旧服务的 404 白页——
  **截图前先 curl 验证内容**；质检代理可能遗留 http.server 进程占端口，起服务前先 `pgrep -af "http.server"`。
  PNG 像素取证可用 Node 内置 zlib 手写解码器（无 PIL/numpy/ImageMagick）；deepseek-flash 的像素坐标结论
  可能漏算 24px 页边距，**关键结论务必用自写解码器复核**。

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
8. **tmp_\* 中间文件约定（用户 2026-10 决定）**：每篇博文/任务的中间产物（笔记、草稿、截图、图源）
   放前缀 `tmp_` 的目录，`.gitignore` 已含 `tmp_*`，永不提交
9. **HTML 正文博文工作流（2026-10 验证可行）**：内容集合只认 `**/*.md`，但 Astro markdown 管线
   内置 rehype-raw → `.md` 正文可写**纯 HTML**（front-matter 照常）。要点：
   - 图片：原始 `<img>` 不被 Astro 处理，**必须放 `public/` 用绝对路径**（如 `/assets/dft/x.png`）；
     暗色模式用 `<picture><source media="(prefers-color-scheme: dark)" srcset="...-dark.png">` 双图
   - 摘要：`<!-- more -->` 之前的文字必须是**纯文本**（PostCard 对原始源码做文本匹配，HTML 标签会残留进卡片）
   - 正文 `<style>` 类名加前缀（如 `dft-`）防与全局冲突；颜色用主题变量
     `var(--accent)/var(--border)/var(--code-bg)/var(--muted)` 自适应明暗，自定义色注意暗色下对比度 ≥4.5:1
   - **坑（2026-10 实测）**：① 全角引号转换绝不能波及 `<style>` 内的 `content: "…"`（CSS 只认直引号，
     否则 ::before 标签整行消失）；② 暗色覆盖规则必须写在基础规则之后（同特异性后者胜）；
     ③ 全局 `.post-body table{display:block}` 会让表格行收缩到内容宽，要撑满正文列需在文章内
     `.post-body .dft-lesson table{display:table;width:100%;max-width:100%}` 覆盖

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
- [x] **DFT 教学项目（完结，2026-10-09 → 2026-10-11）**：教用户 DFT 入门以读懂 XLSDFT 论文（SC26 Gordon
      Bell）。7 课讲义+术语表+论文双语全文在 `tmp_dft_learning/`；用户已阅读第 1–6 课（第 1–3 课经聊天讲授，第 4–6 课用户直接读课件提问）（用户真实问答已收录 11 条（第 1 课 5 条：|ψ|² 概率密度/薛定谔方程抽象理解/吉他弦驻波/3N 坐标输入/输出意义；第 2 课：密度精确定义；第 3 课：KS 方程与四步拆解的关系；第 5 课：H×vector 与正交化成本的来由；第 6 课 2 条（2026-10-11，已并进正文）：g(λₙ) 占据函数与第 3 课 ρ=2Σᵢ|φᵢ|² 的零温等价（金属费米面硬台阶→σ 展宽）、密度矩阵非对角元"往来账/键级"理解）；用户以"讲下一课"方式推进，未逐课回答小测验），
      等用户下一步指令继续第 6–7 课。**教学方式（2026-10 用户决定）**：聊天纯文本无法渲染上下标，改为每课一个独立 HTML 课件（`tmp_dft_learning/lessons/lesson-0N.html`，由 `make_lessons.py` 从博文草稿抽取生成，含真上下标、悬停提示、插图明暗变体、折叠答案；本地服务器 http://127.0.0.1:8930/ 供用户浏览器阅读），用户在 HTML 里读课、回聊天提问。聊天记号约定（Unicode 单字母下标 + 中文词 + 括号上标）见 tmp 术语表笔记。**第 5–6 课 2026-10-10 大改**：第 5 课"第 ③ 步的细节：迭代法只做两种操作"段重排为"问题→答案→成本"四道工序叙事（幂迭代/滤波/正交化/RR 投影），CheFSI 对照移到段尾论文框，引号统一中文弯引号，② 成本口径改 O(N_d)–O(N_d²)；第 6 课整课重写为"O(N³) 是怎么一步步变成 O(N) 的"：三件套分工剧透 → 换变量/近视性(切空间许可证)/D&C(大问题→K 个小问题，K×常数=O(N))/CheFSI(压常数) → 旧流程 vs 新流程 SCF 五步对照表 → "20 亿年 vs 18 分钟"放大倍率表 → 论文 Fig.2 账单，两课均已过视觉验收。**2026-10-10 博客语境验收**：草稿曾混入相对路径 `img/scf-cycle.png`（课件页正常、博客页 404 裂图）已改 `/assets/dft/` 并重建复验；本地 `npm run build` 通过，`.post-body` 容器下表格满宽/表头灰底/2px 线均正常（正文列实际内宽 720px=760−2×1.25rem padding）；探针页切分必须保留完整 `<section class="dft-lesson">` 开标签与 `main.site-main>article.post>div.post-body` 容器链，否则假阳性（表格变窄/表头白/标签泄漏）；质检代理偶尔在仓库根留 `.qa7/`、`.tmp_slice/` 之类未加 tmp_ 前缀的裁图目录，发现即 mv 到 `tmp_qaN/`。**同日暗色验收+图像修正**：第 5–6 课暗色模式全过（表格/框体/图 1 图 3 暗色变体均正常）；图 3 暗色版一行小字对比度 4.0:1 修到 7.3:1——**SVG 里 `fill="..."` 属性会被 SVG 内 `<style>` 的类规则覆盖（类特异性更高），改字色必须用 `style="fill:..."`**；SVG 重渲染 PNG 流程：写无 margin 包装 html（bg 同主题色）→ Windows Chrome `--screenshot` 截 http 页（**Windows Chrome 读不了 WSL 的 file:// 路径，必须起本地 http.server 供图**）→ 像素解码验证目标区域再替换三处副本（figures 源/public/assets/dft/lessons img）。核心对照表列宽 16/30/34/20 → 19/29/33/19（第一列不再把"③ 解 KS 方程"断词），⑤ 标签改"混合/收敛"。**同日收尾**：slug 已正式改为 `dft-from-zero`（dist 正常出 `dft-from-zero/index.html`），学习后记已按真实学习轨迹写好初稿（7 课路线、第 5-6 课返工史、O(N³)→O(N) 三句话总结、疑问驱动心得），第 7 课+术语表+后记均已过博客语境视觉验收——只等用户宣布学会并审阅 HTML。**用户审阅服务器已预启动**：http://127.0.0.1:8944/dft-from-zero/（dist 目录，随构建自动最新；用户宣布学会后直接给这个 URL 审阅整页 HTML）。**2026-10-11 补充**：第 6 课"第一件"按用户反馈补写"为什么可以换"两步论证（信息不丢：D 对角=ρ/2 且携带占据子空间全部信息；写法合法：D 在本征基中=对角 g(λₙ)）；g(λₙ) 零温指示器解释与非对角元"往来账/键级"图景已并入正文。**公式排版（用户 2026-10-11 决定）**：公式一律用 e 的幂写法（不用 exp()），指数写竖分数（`.dft-formula .frac`：fnum/fden 上下堆叠、currentColor 1px 横线、fnum padding-bottom ≥0.06em 防贴线），如 D = g(H;μ,σ) = (1 + e^[(H−μI)/σ])⁻¹（⁻¹ 用 Unicode 上标字符）；本机 Windows Chrome 截图偶发 %TEMP% 中转丢文件，重试 1–2 次即可。**运维（2026-10-11 实测）**：隔夜 Windows 关机后 WSL 里所有 nohup 服务器全灭且 Windows 侧 localhost 转发失效（Chrome 报 ERR_CONNECTION_REFUSED）——重启机器后必须重启 8930（课件）/8944（审阅 dist）服务，并用 `cmd.exe /c curl.exe` 验证 Windows 侧连通再截图。**2026-10-11 用户宣布基本学会，进入发布前定稿**：博文标题改《从0开始的XLSDFT》（frontmatter title 带弯引号）、date=2026-10-11、三张手绘图→四张示意图（描述/导语/摘要三处）、dft-qa 标签"我当时的疑问"→"你可能想问"（CSS content 直引号内，全 7 课+博客页生效）；已全量构建+页顶视觉验收通过；**用户审阅后要求删改（同日）**：删掉文章开头长导语两段与"这篇文章是什么？"框（含 .dft-lead CSS 明暗两处）与"学习后记"整节——`<!-- more -->` 前保留一行摘要"从波函数到 1 亿原子：一份零基础读懂 XLSDFT（SC26 Gordon Bell）论文的学习全记录。"供首页卡片用；删除后页面结构=标题→元信息→一行导语→课程目录→七课→术语表，已重建+视觉验收通过。**审阅继续增改（同日）**：摘要行改为内容概括"为什么传统 DFT 只能算几千原子，XLSDFT 却能算 1 亿？七课拆解：……三件套。"（frontmatter description 同步，去除"学习记录"字样；#学习记录 标签仍在 tags 里，用户未要求删）；摘要后新增 `.dft-disclaimer` 免责声明框（"本内容完全由 AI 全自动生成，不对任何正确性负责……"），明暗双模式像素验收通过。**2026-10-11 已发布上线**：commit `ef0c3e8` post + `a47eff3` docs(memory)，443 SSH 推送成功、Actions 部署 success，线上 https://nobugeveryday.github.io/dft-from-zero/ 200 且含新标题。发布前密码检查：passwords.md 最后一行（6 字符）在既有仓库文件里命中 3 处——token 页 HTML 的十六进制密钥串中间（巧合子串）+ 2 个旧 PNG 二进制（巧合字节），本次新文件零命中，判定不算泄漏。QA 裁图/解码脚本类 tmp 目录（tmp_qa* 等）已全部清理，仅保留 tmp_dft_learning（教学中间产物）。另记 Chrome 截图坑：窗口高 3200–3300px 时页面中段会漏栅格化出纯白带（同 URL 复现、内容上移），长页截图窗口高取 ≥4000 或分段。博文《DFT从零入门记录》（slug `dft-from-zero` 已预留）草稿在
      `src/content/posts/论文研读/DFT从零入门记录.md`（slug 临时 `tmp-dft-rehearsal`，第 1 课已成稿、
      2–7 课已写全文+折叠参考答案，学习后记待用户宣布学会后补写），8 张图（4 明 4 暗：
      SCF 循环/长度尺度鸿沟/D&C 子域/三阶段工作流，已多轮视觉质检）在 `public/assets/dft/`。
      **用户审阅门：未经用户审阅 HTML 批准，不 commit 不 push**（当前全部变更未提交：
      `.gitignore` 的 `tmp_*`、博文、图片）

## 七、本文件的维护规则

- 重要事项（用户决定、环境变化、踩坑解法）随手追加到对应小节，commit message 用 `docs(memory): ...`
- 待办完成打 [x] 并注明日期；新环境还原先读本文件（环境速查/QA 工具链都在这里）
