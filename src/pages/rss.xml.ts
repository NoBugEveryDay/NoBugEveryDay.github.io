import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { site } from '../config';
import { postUrl } from '../lib/posts';

export async function GET(context: any) {
  const posts = (await getCollection('posts'))
    .filter((p) => p.data.visibility === 'public')
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  return rss({
    title: site.title,
    description: site.description,
    site: context.site ?? site.url,
    items: posts.map((p) => ({
      title: p.data.title,
      pubDate: p.data.date,
      link: postUrl(p),
      categories: p.data.categories,
    })),
  });
}
