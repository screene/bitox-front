export function getStrapiMediaUrl(media, apiUrl) {
  if (!media?.url) return null

  return `${apiUrl}${media.url}`
}

export function buildStrapiSlugFilter(slug) {
  if (!slug) return ''

  return `filters[slug][$eq]=${encodeURIComponent(slug)}`
}

export const STRAPI_BLOG_POSTS_API = '/api/blog-posts'

export function getStrapiSeoPopulateParts(fieldName = 'Seo') {
  return [
    `populate[${fieldName}][populate][shareImage]=true`,
    `populate[${fieldName}][populate][twitterImage]=true`,
  ]
}

export const STRAPI_SEO_POPULATE_PARTS = getStrapiSeoPopulateParts('Seo')

export function formatSeoRobots(value) {
  if (!value) return 'index, follow'

  return value.replace(/,\s*/g, ', ')
}

export function parseMapCoordinates(value) {
  if (!value) return null

  const [lat, lng] = value.split(',').map((part) => Number.parseFloat(part.trim()))

  if (Number.isNaN(lat) || Number.isNaN(lng)) return null

  return {
    karta_shirota: lat,
    karta_dolgota: lng,
  }
}

export function splitParagraphs(text) {
  if (!text) return []

  return text.split(/\n\n+/).filter(Boolean)
}

const REVIEW_AVATAR_COLORS = [
  '#9A9A9A',
  '#4A7FD4',
  '#0073FA',
  '#F5A623',
  '#6B7280',
  '#8B5CF6',
  '#10B981',
  '#EC4899',
  '#3B82F6',
]

export function getReviewInitials(firstName, lastName) {
  const first = (firstName || '').trim().charAt(0)
  const last = (lastName || '').trim().charAt(0)

  return `${first}${last}`.toUpperCase() || '?'
}

export function formatReviewDate(dateStr) {
  if (!dateStr) return ''

  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr))
}

export function mapStrapiReviews(items, apiUrl) {
  return items.map((item, index) => {
    const categoryName = item.reviews_category?.name_category

    return {
      id: item.id,
      categoryId: item.reviews_category?.id ?? null,
      initials: getReviewInitials(item.first_name, item.last_name),
      name: [item.first_name, item.last_name].filter(Boolean).join(' ').trim(),
      date: formatReviewDate(item.date || item.publishedAt || item.createdAt),
      avatarColor: REVIEW_AVATAR_COLORS[index % REVIEW_AVATAR_COLORS.length],
      text: item.text,
      rate: item.rate ?? 5,
      source: categoryName ? `Отзыв из ${categoryName}` : 'Отзыв',
      link: item.link,
    }
  })
}

export function formatCategoryRate(rate) {
  if (rate == null || rate === '') return ''

  const num = Number(rate)

  if (Number.isNaN(num)) return ''

  return num.toFixed(1)
}

export function mapStrapiReviewCategories(items, apiUrl) {
  return items.map((item) => ({
    id: item.id,
    label: formatCategoryRate(item.rate_category),
    href: item.link || null,
    icon: getStrapiMediaUrl(item.img, apiUrl),
    alt: item.name_category || '',
  }))
}

export function formatShortDate(dateStr) {
  if (!dateStr) return ''

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateStr))
}

export function mapStrapiServices(items, apiUrl) {
  return items.map((item) => ({
    slug: item.slug,
    documentId: item.documentId,
    title: item.title,
    subtitle: item.subtitle,
    image: getStrapiMediaUrl(item.service_hero_sec?.image, apiUrl),
  }))
}

export function mapStrapiBusinessPages(items, apiUrl) {
  return items.map((item) => ({
    id: item.id,
    documentId: item.documentId,
    slug: item.slug,
    title: item.title,
    type: item.type_business_page,
    subtitle: item.subtitle,
    image: apiUrl ? getStrapiMediaUrl(item.preview_image, apiUrl) : null,
  }))
}

export function mapStrapiIndividualsPages(items, apiUrl) {
  return items.map((item) => ({
    id: item.id,
    documentId: item.documentId,
    slug: item.slug,
    title: item.title,
    subtitle: item.subtitle,
    image: apiUrl ? getStrapiMediaUrl(item.preview_image, apiUrl) : null,
  }))
}

// Списки стран всегда по алфавиту (иначе порядок зависит от внутренних ID Strapi и меняется после публикаций)
export function mapStrapiInvoices(items, apiUrl) {
  return items
    .map((item) => ({
      id: item.id,
      documentId: item.documentId,
      slug: item.slug,
      name: item.title,
      flag: getStrapiMediaUrl(item.flag, apiUrl),
    }))
    .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ru'))
}

export function mapStrapiServiceCategories(categories, apiUrl) {
  return categories.map((category) => ({
    id: category.id,
    title: category.title,
    subtitle: category.subtitle,
    image: getStrapiMediaUrl(category.image, apiUrl),
    services: (category.services ?? []).map((service) => ({
      slug: service.slug,
      documentId: service.documentId,
      title: service.title,
      text: service.subtitle,
    })),
  }))
}
