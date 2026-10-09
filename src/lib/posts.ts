import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

/** 全部公开文章，按日期（含时间）倒序；同时间戳时按 id 字母序稳定排序 */
export async function getPublicPosts() {
  return (await getCollection('posts'))
    .filter((p) => p.data.visibility === 'public')
    .sort(
      (a, b) =>
        b.data.date.valueOf() - a.data.date.valueOf() || a.id.localeCompare(b.id),
    );
}

/** 文章 URL：优先英文扁平 slug（/文章英文/），无 slug 时回退到文件相对路径 */
export function postUrl(post: CollectionEntry<'posts'>) {
  return `/${post.data.slug ?? post.id}/`;
}
