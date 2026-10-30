import { defineSitemapEventHandler } from '#imports'

const urlApi = useRuntimeConfig().public.apiUrl

// Главные страницы разделов. Дата обновления (lastmod) берётся из соответствующего раздела админки.
const PAGES = [
  { path: '', api: 'home' },
  { path: '/business', api: 'business' },
  { path: '/transfers', api: 'transfer' },
  { path: '/individuals', api: 'individuals-hub' },
  { path: '/crypto-exchange', api: 'exchange' },
  { path: '/about', api: 'about' },
  { path: '/partners', api: 'partnership' },
  { path: '/contacts', api: 'contact' },
  { path: '/blog', api: null },
  { path: '/business/invoice', api: 'invoice-singl' },
]

async function getUpdatedAt(api: string | null): Promise<string | undefined> {
  try {
    if (api) {
      const res = await $fetch<any>(`${urlApi}/api/${api}?fields[0]=updatedAt`)
      return res?.data?.updatedAt || undefined
    }

    // Блог: дата самой свежей статьи
    const res = await $fetch<any>(`${urlApi}/api/blog-posts?fields[0]=updatedAt&sort=updatedAt:desc&pagination[pageSize]=1`)
    return res?.data?.[0]?.updatedAt || undefined
  } catch {
    return undefined
  }
}

export default defineSitemapEventHandler(async () => {
  const dates = await Promise.all(PAGES.map((page) => getUpdatedAt(page.api)))

  return PAGES.map((page, index) => ({
    loc: `${urlApi}${page.path}`,
    ...(dates[index] ? { lastmod: dates[index] } : {}),
    _sitemap: 'pages',
  }))
})
