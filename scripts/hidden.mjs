#!/usr/bin/env node
/**
 * 隐藏文章管理脚本（方案④：Staticrypt 加密阅读页 + AES 加密 markdown 双轨）
 *
 * 用法：
 *   node scripts/hidden.mjs encrypt <relpath>   加密/重加密一篇（明文在 private/hidden-posts/<relpath>）
 *   node scripts/hidden.mjs encrypt --all       批量加密全部
 *   node scripts/hidden.mjs decrypt <token>     用密码还原单篇原始 markdown 到 private/hidden-posts/
 *   node scripts/hidden.mjs restore             批量还原全部（新环境用）+ 与索引核对
 *   node scripts/hidden.mjs list                列出全部隐藏文章
 *   node scripts/hidden.mjs index               仅重建 .hidden-posts.md 索引
 *
 * 密码来源：private/passwords.md 首行（本机文件，已被 .gitignore 排除，绝不入库）。
 * 每个 token 产出两个提交文件：
 *   public/h/<token>/index.html       Staticrypt 加密的文章阅读页（图片 base64 内嵌）
 *   public/h/<token>/source.md.enc    AES-256-GCM 加密的原始 markdown（含元数据，可字节级还原）
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
// 注意：gray-matter 与 marked 只在 encrypt 时按需动态导入，
// 保证 decrypt/restore/list/index 在未安装依赖的新环境也能运行（还原只需密码与 Node）。

const ROOT = path.resolve('.');
const PRIVATE = path.join(ROOT, 'private');
const PRIVATE_POSTS = path.join(PRIVATE, 'hidden-posts');
const PASSWORD_FILE = path.join(PRIVATE, 'passwords.md');
const H_DIR = path.join(ROOT, 'public', 'h');
const INDEX_FILE = path.join(ROOT, '.hidden-posts.md');
const SITE = 'https://nobugeveryday.github.io';

// ── 密码 ──
function readPassword() {
  const text = fs.readFileSync(PASSWORD_FILE, 'utf8');
  const line = text.split('\n').map((s) => s.trim()).find((s) => s && !s.startsWith('#'));
  if (!line) throw new Error(`未在 ${PASSWORD_FILE} 找到密码（首行非注释行）`);
  return line;
}

// ── AES-256-GCM（PBKDF2 派生密钥）──
const KDF = { name: 'pbkdf2', salt: null, iterations: 200_000, hash: 'sha256' };

function aesEncrypt(plaintext, password) {
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const key = crypto.pbkdf2Sync(password, salt, KDF.iterations, 32, KDF.hash);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return { salt, iv, tag: cipher.getAuthTag(), data: ct };
}

function aesDecrypt(payload, password) {
  const key = crypto.pbkdf2Sync(password, Buffer.from(payload.kdf.salt, 'base64'), payload.kdf.iterations, 32, payload.kdf.hash);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(payload.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(payload.tag, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(payload.data, 'base64')), decipher.final()]).toString('utf8');
}

// ── 工具 ──
function randomToken(len = 10) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  let out = '';
  const buf = crypto.randomBytes(len);
  for (let i = 0; i < len; i++) out += chars[buf[i] % chars.length];
  return out;
}

const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml' };

/** 无扩展名文件按魔数嗅探 MIME */
function sniffMime(buf) {
  if (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png';
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.length >= 6 && buf.slice(0, 6).toString('ascii') === 'GIF87a') return 'image/gif';
  if (buf.length >= 6 && buf.slice(0, 6).toString('ascii') === 'GIF89a') return 'image/gif';
  return null;
}

/** 把渲染后的 HTML 里的相对图片内嵌为 base64 data URI */
function inlineImages(html, mdDir) {
  return html.replace(/<img[^>]*\bsrc="([^"]+)"[^>]*>/g, (tag, srcRaw) => {
    const src = (() => {
      try {
        return decodeURIComponent(srcRaw); // marked 会对 URL 做百分号编码
      } catch {
        return srcRaw;
      }
    })();
    if (/^(https?:|data:|#|\/)/.test(src)) return tag; // 外链/绝对路径/data URI 不动
    const abs = path.resolve(mdDir, src);
    if (!fs.existsSync(abs)) {
      console.warn(`  [warn] 图片缺失: ${src}`);
      return tag;
    }
    const mime = MIME[path.extname(abs).toLowerCase()] ?? sniffMime(fs.readFileSync(abs));
    if (!mime) return tag;
    const b64 = fs.readFileSync(abs).toString('base64');
    return tag.replace(`src="${srcRaw}"`, `src="data:${mime};base64,${b64}"`);
  });
}

const PAGE_CSS = `
  :root{--bg:#ffffff;--fg:#24292f;--muted:#6e7781;--accent:#1f6feb;--border:#d8dee4;--code:#f6f8fa}
  *{box-sizing:border-box} body{margin:0;background:var(--bg);color:var(--fg);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Hiragino Sans GB','Microsoft YaHei','Noto Sans CJK SC',sans-serif;line-height:1.75}
  .wrap{max-width:760px;margin:0 auto;padding:2rem 1.25rem}
  h1.title{font-size:1.8rem;line-height:1.35;margin:0 0 .4rem}
  .meta{color:var(--muted);font-size:.88rem;margin-bottom:1.5rem;padding-bottom:.8rem;border-bottom:1px solid var(--border)}
  .body{font-size:1.02rem} .body h1{font-size:1.5rem}.body h2{font-size:1.3rem;border-bottom:1px solid var(--border);padding-bottom:.3rem}.body h3{font-size:1.15rem}
  .body img{max-width:100%;height:auto;border-radius:6px}
  .body pre{background:var(--code);border:1px solid var(--border);border-radius:8px;padding:.9rem 1rem;overflow-x:auto;font-size:.88rem;line-height:1.6}
  .body :not(pre)>code{background:var(--code);border:1px solid var(--border);border-radius:4px;padding:.1em .35em;font-size:.88em}
  .body blockquote{margin:1em 0;padding:.2em 1em;border-left:4px solid var(--accent);color:var(--muted);background:var(--code)}
  .body table{border-collapse:collapse;display:block;overflow-x:auto}.body th,.body td{border:1px solid var(--border);padding:.4em .8em}
  a{color:var(--accent)} .foot{color:var(--muted);font-size:.82rem;text-align:center;margin-top:2.5rem;padding-top:1rem;border-top:1px solid var(--border)}
`;

/** 渲染明文 markdown 为完整 HTML（供 staticrypt 加密） */
async function renderPage(rel, data, body) {
  const { marked } = await import('marked');
  const mdDir = path.join(PRIVATE_POSTS, path.dirname(rel));
  const html = inlineImages(marked.parse(body), mdDir);
  const date = String(data.date ?? '').slice(0, 10);
  const cats = (data.categories ?? []).join(' / ');
  return `<!doctype html>
<html lang="zh-CN"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${escapeHtml(data.title ?? '')}</title>
<style>${PAGE_CSS}</style></head>
<body>
<div class="wrap">
<h1 class="title">${escapeHtml(data.title ?? '')}</h1>
<div class="meta">${escapeHtml(date)}${cats ? ' · ' + escapeHtml(cats) : ''}</div>
<div class="body">${html}</div>
<div class="foot">🔒 隐藏文章 · 由 Staticrypt 加密</div>
</div></body></html>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** 调用 staticrypt CLI 加密 HTML 文件 */
function staticryptEncrypt(inputFile, outputDir, password, title) {
  fs.mkdirSync(outputDir, { recursive: true });
  execFileSync(
    'npx',
    [
      'staticrypt', inputFile,
      '-d', outputDir,
      '-c', 'false',
      '--remember', 'false',
      '--short',
      '--template-title', title,
      '--template-instructions', '输入密码查看本篇隐藏文章',
      '--template-button', '解锁',
      '--template-placeholder', '密码',
      '--template-color-primary', '#1f6feb',
      '--template-color-secondary', '#24292f',
    ],
    {
      cwd: ROOT,
      env: { ...process.env, STATICRYPT_PASSWORD: password },
      stdio: ['ignore', 'pipe', 'inherit'],
    },
  );
}

/** 加密后处理：确保 noindex / Pagefind 排除 */
function postProcess(outputFile) {
  let html = fs.readFileSync(outputFile, 'utf8');
  if (!/<meta name="robots"/.test(html)) {
    html = html.replace(/<head>/, '<head>\n<meta name="robots" content="noindex, nofollow">');
  }
  html = html.replace(/<body([^>]*)>/, (_m, attrs) => `<body${attrs} data-pagefind-ignore="all">`);
  fs.writeFileSync(outputFile, html);
}

// ── 收集明文 ──
function collectPlaintext() {
  const out = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, e.name);
      if (e.isDirectory()) walk(abs);
      else if (e.name.endsWith('.md')) out.push(abs);
    }
  };
  if (fs.existsSync(PRIVATE_POSTS)) walk(PRIVATE_POSTS);
  return out;
}

// ── encrypt ──
async function encryptOne(rel) {
  const { default: matter } = await import('gray-matter');
  const abs = path.join(PRIVATE_POSTS, rel);
  if (!fs.existsSync(abs)) throw new Error(`明文不存在: ${rel}`);
  let raw = fs.readFileSync(abs, 'utf8');
  const parsed = matter(raw);
  let token = parsed.data.hiddenToken;
  if (!token) {
    token = randomToken();
    parsed.data.hiddenToken = token;
    // 写回 front-matter，保证 token 持久稳定
    const fm = matter.stringify(parsed.content, parsed.data).trimEnd() + '\n';
    fs.writeFileSync(abs, fm);
    raw = fm;
  }
  const password = readPassword();
  // meta 记录完整相对路径（restore 时还原到原分类子目录）；日期格式化为 YYYY-MM-DD
  const dateVal = parsed.data.date;
  const dateStr = dateVal instanceof Date
    ? `${dateVal.getUTCFullYear()}-${String(dateVal.getUTCMonth() + 1).padStart(2, '0')}-${String(dateVal.getUTCDate()).padStart(2, '0')}`
    : String(dateVal ?? '').slice(0, 10);

  // 1) 加密 markdown 原稿（v2：meta 一并进密文，仓库中不含任何标题/日期明文）
  const meta = { title: String(parsed.data.title ?? rel), date: dateStr, filename: rel };
  const payloadPlain = JSON.stringify({ meta, markdown: raw });
  const encPayload = {
    v: 2,
    kdf: { ...KDF, salt: null },
    iv: null,
    tag: null,
    data: null,
  };
  const { salt, iv, tag, data } = aesEncrypt(payloadPlain, password);
  encPayload.kdf.salt = salt.toString('base64');
  encPayload.iv = iv.toString('base64');
  encPayload.tag = tag.toString('base64');
  encPayload.data = data.toString('base64');
  const tokenDir = path.join(H_DIR, token);
  fs.mkdirSync(tokenDir, { recursive: true });
  fs.writeFileSync(path.join(tokenDir, 'source.md.enc'), JSON.stringify(encPayload, null, 2));

  // 2) 渲染 + staticrypt 加密阅读页
  const tmp = fs.mkdtempSync(path.join(ROOT, '.tmp-hidden-'));
  try {
    const page = await renderPage(rel, parsed.data, parsed.content);
    const input = path.join(tmp, 'index.html');
    fs.writeFileSync(input, page);
    staticryptEncrypt(input, tokenDir, password, '隐藏文章');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  postProcess(path.join(tokenDir, 'index.html'));

  console.log(`✔ ${meta.title}`);
  console.log(`  URL: ${SITE}/h/${token}/`);
  console.log(`  明文: private/hidden-posts/${rel}`);
  return { token, rel, meta };
}

async function encryptAll() {
  const files = collectPlaintext().map((abs) => path.relative(PRIVATE_POSTS, abs));
  if (!files.length) {
    console.log('private/hidden-posts/ 下没有明文文章。');
    return;
  }
  console.log(`共 ${files.length} 篇，开始加密…`);
  const done = [];
  for (const rel of files) done.push(await encryptOne(rel));
  rebuildIndex();
  console.log(`\n索引已更新: ${INDEX_FILE}`);
  return done;
}

// ── decrypt / restore ──
function decryptOne(token) {
  const encFile = path.join(H_DIR, token, 'source.md.enc');
  if (!fs.existsSync(encFile)) throw new Error(`不存在: public/h/${token}/source.md.enc`);
  const payload = JSON.parse(fs.readFileSync(encFile, 'utf8'));
  const password = readPassword();
  const plaintext = aesDecrypt(payload, password);
  let meta;
  let markdown;
  if (payload.v === 2) {
    // v2：meta 与正文一起加密
    const obj = JSON.parse(plaintext);
    meta = obj.meta;
    markdown = obj.markdown;
  } else {
    // v1 兼容：meta 在密文外层
    meta = payload.meta;
    markdown = plaintext;
  }
  const dest = path.join(PRIVATE_POSTS, meta.filename);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, markdown);
  console.log(`✔ 已还原: ${meta.filename}（${meta.title}）`);
  // 从加密阅读页还原内嵌图片（重新加密时不丢图）
  const pageFile = path.join(H_DIR, token, 'index.html');
  if (fs.existsSync(pageFile)) {
    try {
      const pageHtml = decryptStaticryptPage(fs.readFileSync(pageFile, 'utf8'), password);
      restoreImages(meta.filename, markdown, collectEmbeddedImages(pageHtml));
    } catch (e) {
      console.warn(`  [warn] 图片还原跳过（${e.message}）`);
    }
  }
  return meta;
}

function restoreAll() {
  const tokens = fs.readdirSync(H_DIR).filter((t) => fs.existsSync(path.join(H_DIR, t, 'source.md.enc')));
  if (!tokens.length) {
    console.log('public/h/ 下没有加密稿。');
    return;
  }
  console.log(`共 ${tokens.length} 篇加密稿，开始还原…`);
  for (const token of tokens) {
    try {
      decryptOne(token);
    } catch (e) {
      console.error(`✘ ${token}: ${e.message}`);
    }
  }
  rebuildIndex();
  console.log(`\n全部还原完成，索引已重建: ${INDEX_FILE}`);
}

// ── 索引 ──
function rebuildIndex() {
  const password = readPassword();
  const rows = [];
  for (const token of fs.readdirSync(H_DIR)) {
    const encFile = path.join(H_DIR, token, 'source.md.enc');
    if (!fs.existsSync(encFile)) continue;
    try {
      const payload = JSON.parse(fs.readFileSync(encFile, 'utf8'));
      const plaintext = aesDecrypt(payload, password);
      // v2：meta 在密文内；v1 兼容：meta 在密文外
      const meta = payload.v === 2 ? JSON.parse(plaintext).meta : payload.meta;
      rows.push({ token, ...meta });
    } catch {
      continue;
    }
  }
  rows.sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const lines = [
    '# 隐藏文章索引（由 scripts/hidden.mjs 自动维护，勿手改）',
    '',
    '> 隐藏文章在站点上无任何入口：不索引、不进列表/搜索/RSS/sitemap，无评论区。',
    '> 导航「隐藏」入口 /hidden/ 是加密目录页，输密码后列出全部隐藏文章链接。',
    '> 原始 markdown 加密存于 `public/h/<token>/source.md.enc`，可用',
    '> `node scripts/hidden.mjs decrypt <token>`（单篇）或 `restore`（全部）还原。',
    '',
    '| # | 标题 | Token | URL | 日期 | 明文路径 |',
    '|---|------|-------|-----|------|----------|',
    ...rows.map((r, i) => `| ${i + 1} | ${r.title} | ${r.token} | ${SITE}/h/${r.token}/ | ${r.date} | private/hidden-posts/${r.filename} |`),
    '',
  ];
  fs.writeFileSync(INDEX_FILE, lines.join('\n'));
  // 同步重建加密目录页（/hidden/）。零依赖还原环境里可能没有 staticrypt，
  // 此时跳过并保留已提交的旧目录页——不能因此破坏 restore 流程。
  try {
    buildHiddenIndexPage(rows);
  } catch (e) {
    console.warn(`[warn] 加密目录页未重建（${e.message}），沿用已提交版本`);
  }
  return rows;
}

/** 渲染并加密「隐藏文章目录页」到 public/hidden/index.html（导航「隐藏」入口） */
function buildHiddenIndexPage(rows) {
  const listHtml = rows
    .map(
      (r) => `
      <li>
        <a href="/h/${r.token}/">${escapeHtml(r.title)}</a>
        <span class="date">${escapeHtml(String(r.date).slice(0, 10))}</span>
      </li>`,
    )
    .join('');
  const html = `<!doctype html>
<html lang="zh-CN"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>隐藏文章</title>
<style>
body{margin:0;background:#fafbfc;color:#24292f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif;line-height:1.75}
.wrap{max-width:640px;margin:0 auto;padding:2.5rem 1.25rem 4rem}
h1{font-size:1.6rem;margin:0 0 .4rem}
p.tip{color:#6e7781;font-size:.9rem;margin:0 0 1.5rem;padding-bottom:1rem;border-bottom:1px solid #d8dee4}
ul{list-style:none;padding:0;margin:0}
li{display:flex;justify-content:space-between;gap:1rem;padding:.55rem 0;border-bottom:1px dashed #e4e8ec}
a{color:#1f6feb;text-decoration:none;word-break:break-all}
a:hover{text-decoration:underline}
.date{color:#6e7781;font-size:.85rem;flex-shrink:0;padding-top:.2rem}
.foot{color:#9aa3ab;font-size:.8rem;text-align:center;margin-top:2rem}
</style></head>
<body>
<div class="wrap">
<h1>🐋 隐藏文章</h1>
<p class="tip">共 ${rows.length} 篇。点击标题进入对应加密页（每篇需再输入一次密码）。</p>
<ul>${listHtml}
</ul>
<div class="foot">🔒 本页由 Staticrypt 加密 · 密码仅存于作者本机</div>
</div></body></html>`;

  const tmp = fs.mkdtempSync(path.join(ROOT, '.tmp-hiddenidx-'));
  try {
    const input = path.join(tmp, 'index.html');
    fs.writeFileSync(input, html);
    staticryptEncrypt(input, path.join(ROOT, 'public', 'hidden'), readPassword(), '隐藏文章');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  postProcess(path.join(ROOT, 'public', 'hidden', 'index.html'));
  console.log(`✔ 加密目录页已更新: public/hidden/index.html（${rows.length} 篇）`);
}

function listAll() {
  const rows = rebuildIndex();
  console.log(`共 ${rows.length} 篇隐藏文章：`);
  for (const r of rows) {
    console.log(`  ${r.date}  ${r.title}\n    ${SITE}/h/${r.token}/`);
  }
}

// ── Staticrypt 页面解密（纯 Node 实现，与浏览器端 cryptoEngine/codec 逻辑等价）──
// 密码哈希三轮：PBKDF2-SHA1(1000) → PBKDF2-SHA256(14000) → PBKDF2-SHA256(585000)，
// 每轮输出 32 字节 hex；盐以 hex 文本的 UTF-8 字节参与派生。
function staticryptHashPassword(password, saltHex) {
  const saltText = saltHex; // 注意：盐是 hex 字符串本身（UTF-8 编码）参与 PBKDF2
  const k1 = crypto.pbkdf2Sync(password, saltText, 1000, 32, 'sha1').toString('hex');
  const k2 = crypto.pbkdf2Sync(k1, saltText, 14000, 32, 'sha256').toString('hex');
  return crypto.pbkdf2Sync(k2, saltText, 585000, 32, 'sha256').toString('hex');
}

/** 提取 staticryptConfig（salt 与 signedMsg 内联在页面脚本中） */
function extractStaticryptConfig(html) {
  const m = html.match(/staticryptConfig = (\{[^}]*\})/);
  if (!m) throw new Error('未找到 staticryptConfig');
  return JSON.parse(m[1]);
}

/** 用密码解密加密页 → 原始 HTML 文本 */
function decryptStaticryptPage(html, password) {
  const cfg = extractStaticryptConfig(html);
  const salt = cfg.staticryptSaltUniqueVariableName;
  const signedMsg = cfg.staticryptEncryptedMsgUniqueVariableName;
  const hashedPassword = staticryptHashPassword(password, salt);
  const key = Buffer.from(hashedPassword, 'hex');
  const ivHex = signedMsg.substring(64, 96);
  const ctHex = signedMsg.substring(96);
  // HMAC 校验（对 iv+密文 hex 文本的 UTF-8 字节签名）
  const expect = signedMsg.substring(0, 64);
  const actual = crypto.createHmac('sha256', key).update(Buffer.from(signedMsg.substring(64), 'utf8')).digest('hex');
  if (!crypto.timingSafeEqual(Buffer.from(expect, 'hex'), Buffer.from(actual, 'hex'))) {
    throw new Error('密码错误或页面损坏');
  }
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(ivHex, 'hex'));
  const pt = Buffer.concat([decipher.update(Buffer.from(ctHex, 'hex')), decipher.final()]);
  return pt.toString('utf8');
}

/** 从解密后的页面 HTML 中按文档顺序收集内嵌图片（alt 为原文件名） */
function collectEmbeddedImages(html) {
  const out = [];
  const tagRe = /<img[^>]*>/g;
  const attrRe = /\b(alt|src)="([^"]*)"/g;
  let tag;
  while ((tag = tagRe.exec(html)) !== null) {
    const attrs = {};
    let a;
    while ((a = attrRe.exec(tag[0])) !== null) attrs[a[1]] = a[2];
    if (!attrs.src || !attrs.src.startsWith('data:')) continue;
    const m = attrs.src.match(/^data:([^;]+);base64,(.+)$/);
    if (!m) continue;
    out.push({ alt: attrs.alt ?? '', mime: m[1], data: Buffer.from(m[2], 'base64') });
  }
  return out;
}

/** 把还原出的明文 md 里引用的图片从加密页落盘（目录结构按 md 引用路径） */
function restoreImages(mdRel, plaintextMd, embeddedImages) {
  const mdDir = path.join(PRIVATE_POSTS, path.dirname(mdRel));
  const used = new Set();
  const refRe = /!\[([^\]]*)\]\(([^)\s]+)\)/g;
  let m;
  while ((m = refRe.exec(plaintextMd)) !== null) {
    const [, alt, refPath] = m;
    if (/^(https?:|data:|#|\/)/.test(refPath)) continue;
    const dest = path.resolve(mdDir, refPath);
    if (fs.existsSync(dest)) continue;
    // 优先按 alt（原文件名）匹配，其次按出现顺序
    let img = embeddedImages.find((x, i) => x.alt === alt && !used.has(i));
    if (!img) img = embeddedImages.find((x, i) => !used.has(i));
    if (!img) {
      console.warn(`  [warn] 图片无法还原: ${refPath}`);
      continue;
    }
    used.add(embeddedImages.indexOf(img));
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, img.data);
    console.log(`  ✔ 图片还原: ${refPath}`);
  }
  // 未被 md 引用的剩余内嵌图片（如有）落到 md 同目录并警告
  embeddedImages.forEach((img, i) => {
    if (used.has(i)) return;
    const dest = path.join(mdDir, img.alt || `image-${i}`);
    fs.mkdirSync(mdDir, { recursive: true });
    fs.writeFileSync(dest, img.data);
    console.warn(`  [warn] 未引用图片已保存: ${img.alt || dest}`);
  });
}
// ── verify：纯 Node 复现浏览器解密，验证加密页可正确解锁（零依赖）──
function verifyAll() {
  const tokens = fs.readdirSync(H_DIR).filter((t) => fs.existsSync(path.join(H_DIR, t, 'index.html')));
  const extraPages = [];
  if (fs.existsSync(path.join(ROOT, 'public', 'hidden', 'index.html'))) extraPages.push('hidden');
  if (!tokens.length && !extraPages.length) {
    console.log('public/h/ 与 public/hidden/ 下没有加密页。');
    return;
  }
  const password = readPassword();
  let ok = 0;
  let fail = 0;
  const check = (label, htmlFile) => {
    try {
      const plain = decryptStaticryptPage(fs.readFileSync(htmlFile, 'utf8'), password);
      if (plain.includes('</html>')) {
        const titleMatch = plain.match(/<h1 class="title">([^<]*)<\/h1>/) || plain.match(/<h1>([^<]*)<\/h1>/);
        console.log(`✔ ${label}（${titleMatch ? titleMatch[1] : '未知标题'}）可用密码正确解密`);
        ok++;
      } else {
        throw new Error('解密内容异常');
      }
    } catch (e) {
      console.error(`✘ ${label}: ${e.message}`);
      fail++;
    }
  };
  for (const token of tokens) {
    check(token, path.join(H_DIR, token, 'index.html'));
  }
  for (const label of extraPages) {
    check(`/hidden/`, path.join(ROOT, 'public', 'hidden', 'index.html'));
  }
  console.log(`\n验证完成: ${ok} 成功 / ${fail} 失败`);
  if (fail) process.exitCode = 1;
}

// ── 入口 ──
const [cmd, arg] = process.argv.slice(2);
try {
  if (cmd === 'encrypt' && arg === '--all') await encryptAll();
  else if (cmd === 'encrypt') {
    await encryptOne(arg);
    rebuildIndex();
  } else if (cmd === 'decrypt') decryptOne(arg);
  else if (cmd === 'restore') restoreAll();
  else if (cmd === 'index') rebuildIndex();
  else if (cmd === 'list') listAll();
  else if (cmd === 'verify') verifyAll();
  else {
    console.log(`用法:
  node scripts/hidden.mjs encrypt <relpath>  加密/重加密一篇
  node scripts/hidden.mjs encrypt --all      批量加密全部
  node scripts/hidden.mjs decrypt <token>    还原单篇原始 markdown
  node scripts/hidden.mjs restore            批量还原全部（新环境）
  node scripts/hidden.mjs list               列出全部
  node scripts/hidden.mjs verify             本地复现浏览器解密，验证加密页
  node scripts/hidden.mjs index              仅重建索引`);
    process.exit(1);
  }
} catch (e) {
  console.error(`错误: ${e.message}`);
  process.exit(1);
}
