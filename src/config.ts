/**
 * 站点全局配置 —— AI 维护博客时的唯一配置入口。
 * 改站点信息、评论系统、作者等，只改这里。
 */
export const site = {
  /** 站点标题（旧站：生命不息 折腾不止） */
  title: '生命不息 折腾不止',
  /** 一句话描述 */
  description: '丰光南的个人博客：高性能计算、网络、Linux 与生活折腾记录',
  /** 生产站点地址（GitHub Pages） */
  url: 'https://nobugeveryday.github.io',
  /** 作者名 */
  author: 'NoBugEveryDay',
  /** 语言 */
  lang: 'zh-CN',
  /** 首页每页文章数 */
  pageSize: 10,
} as const;

/**
 * Giscus 评论配置（GitHub Discussions 驱动，用户已完成一次性设置）。
 */
export const giscus = {
  enabled: true,
  repo: 'NoBugEveryDay/NoBugEveryDay.github.io',
  repoId: 'MDEwOlJlcG9zaXRvcnkzMDQ1NjA5MTc=',
  category: 'Comments',
  categoryId: 'DIC_kwDOEic7Fc4DHYkI',
  mapping: 'pathname',
  strict: '1',
  reactionsEnabled: '1',
  inputPosition: 'bottom',
  theme: 'preferred_color_scheme',
  lang: 'zh-CN',
  loading: 'lazy',
} as const;

/** 导航菜单 */
export const nav = [
  { label: '首页', href: '/' },
  { label: '关于', href: '/about/' },
  { label: '分类', href: '/categories/' },
  { label: '标签', href: '/tags/' },
  { label: '归档', href: '/archives/' },
  { label: '隐藏', href: '/hidden/' },
] as const;

/**
 * 看板娘（鲸鱼娘 Live2D）配置。
 * 模型美术 © 上善无形 / ZipZipPipe / 氵六青（CC BY-NC-SA 4.0，署名-非商业-相同方式共享），
 * 许可文件见 public/live2d/NOTICE.md、AUTHORS.md；署名展示在页脚，勿删。
 */
export const mascot = {
  enabled: true,
  /** 桌面端画布目标高度（CSS px）；移动端自动缩至 55% */
  height: 320,
  /** 点击看板娘随机显示的台词 */
  lines: [
    '欢迎来看博客~ 🐋',
    '有问题欢迎在评论区留言~',
    '新博客由鲸鱼娘维护，详情见公告：/blog-now-maintained-by-ai/',
    '生命不息，折腾不止！',
  ],
} as const;
