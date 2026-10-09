import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

/**
 * 博文集合。front-matter 规范（blog-post skill 亦遵循此 schema）：
 * - title: 必填
 * - date: 必填（YYYY-MM-DD）
 * - categories / tags: 字符串数组
 * - visibility: public（默认，正常发布）| hidden（走 Staticrypt 加密双文件，
 *   由 scripts/hidden.mjs 管理，不进本集合）| draft（不构建、站点上不存在）
 * - description: 可选，首页卡片摘要；缺省时取正文开头
 *
 * 注意：自定义 generateId 保留文件路径原始大小写（默认 slug 会小写化，
 * 破坏旧站 URL 如 /Benchmark/SSD测试记录/ 的兼容性）。
 */
const posts = defineCollection({
  loader: glob({
    base: './src/content/posts',
    pattern: '**/*.md',
    generateId: ({ entry, base }) => {
      // entry 可能为绝对或相对路径字符串；base 为 URL
      const basePath = fileURLToPath(base);
      const abs = path.isAbsolute(entry as string)
        ? (entry as string)
        : path.resolve(basePath, entry as string);
      const rel = path.relative(basePath, abs);
      if (rel.startsWith('..')) throw new Error(`内容路径越界: ${entry}`);
      return rel.replace(/\.md$/, '').split(path.sep).join('/');
    },
  }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    /** 英文扁平 slug（小写字母/数字/连字符，全局唯一）；URL = /<slug>/ */
    slug: z
      .string()
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/)
      .optional(),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    visibility: z.enum(['public', 'hidden', 'draft']).default('public'),
    description: z.string().optional(),
  }),
});

export const collections = { posts };
