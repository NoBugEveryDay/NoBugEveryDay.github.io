/**
 * Pagefind 运行时按需加载封装。
 * 浏览器端使用构建生成的 /pagefind/pagefind.js（CI 构建后由 pagefind CLI 产出）。
 * 索引未生成（本地首次 dev 等）时优雅降级为空实现。
 */
type PagefindModule = {
  init: () => Promise<void>;
  search: (query: string) => Promise<{
    results: Array<{ data: () => Promise<{ url: string; meta: { title: string }; excerpt: string }> }>;
  } | null>;
};

async function load(): Promise<PagefindModule> {
  try {
    // 运行时从站点根加载构建产物；变量形式避免打包器静态解析
    const specifier = '/pagefind/pagefind.js';
    const mod = (await import(/* @vite-ignore */ specifier)) as PagefindModule;
    if (typeof mod.init === 'function') await mod.init();
    return mod;
  } catch {
    return {
      init: async () => {},
      search: async () => null,
    };
  }
}

export const pagefind = {
  async search(query: string) {
    const mod = await load();
    return mod.search(query);
  },
};
