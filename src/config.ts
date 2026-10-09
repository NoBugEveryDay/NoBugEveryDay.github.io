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
 * 看板娘（鲸鱼娘）配置。
 * 2026-10 起由 Live2D 模型切换为 DSH 桌宠 dsh-whale-musume（MIT © Sutera-Diffusus）：
 * 纯前端图片立绘引擎，vendor 于 public/assets/（含本地补丁，见 NOTICE.md）。
 */
export const mascot = {
  enabled: true,
} as const;
