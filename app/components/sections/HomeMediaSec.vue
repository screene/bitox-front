<template>
  <section v-if="section || allPublications.length" class="media-sec">
    <div class="container">
      <div class="media-sec__head">
        <h2 class="media-sec__title">
          {{ sectionTitle }}
          <span v-if="sectionSubtitle" class="media-sec__badge">{{ sectionSubtitle }}</span>
        </h2>
      </div>

      <div class="media-sec__grid">
        <a
          v-for="item in visiblePublications"
          :key="item.id"
          :href="item.href"
          class="media-sec__card"
          :class="{ 'media-sec__card--with-text': item.description }"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div class="media-sec__card-header">
            <img
              v-if="item.logo"
              :src="item.logo"
              :alt="item.source"
              class="media-sec__card-logo"
              loading="lazy"
            />
            <span v-else class="media-sec__card-logo-text">{{ item.source }}</span>

            <span class="media-sec__card-arrow" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.4908 13.0345L21.532 12.5362L22.0303 12.5774L21.9891 13.0757L21.4908 13.0345ZM12.6578 21.1726C12.4471 21.3511 12.1316 21.325 11.9531 21.1143C11.7746 20.9036 11.8007 20.588 12.0114 20.4096L12.3346 20.7911L12.6578 21.1726ZM15.8532 12.5679L15.8945 12.0697L21.532 12.5362L21.4908 13.0345L21.4496 13.5328L15.812 13.0662L15.8532 12.5679ZM21.4908 13.0345L21.9891 13.0757L21.5226 18.7133L21.0243 18.6721L20.526 18.6308L20.9925 12.9932L21.4908 13.0345ZM21.4908 13.0345L21.814 13.416L12.6578 21.1726L12.3346 20.7911L12.0114 20.4096L21.1676 12.653L21.4908 13.0345Z" fill="currentColor" />
              </svg>
            </span>
          </div>

          <h3 class="media-sec__card-title">{{ item.title }}</h3>

          <p v-if="item.description" class="media-sec__card-text">{{ item.description }}</p>
        </a>
      </div>

      <div v-if="hasMorePublications && !showAll" class="media-sec__btn-wrap">
        <AppButton type="button" @click="showAll = true">Все публикации</AppButton>
      </div>
    </div>
  </section>
</template>

<script setup>
import logoRbk from '~/assets/images/media/logo-rbk.svg'
import { getStrapiMediaUrl } from '~/utils/strapi'

const props = defineProps({
  section: {
    type: Object,
    default: null,
  },
})

const apiUrl = useRuntimeConfig().public.apiUrl
const DEFAULT_VISIBLE_COUNT = 3

const showAll = ref(false)

const defaultPublications = [
  {
    id: 1,
    href: '#',
    source: 'РБК',
    logo: logoRbk,
    title: 'Промышленная революция: как крипто-обмен в России вышли на новый этап',
  },
  {
    id: 2,
    href: '#',
    source: 'Forbes',
    logo: null,
    title: '«Обречена на популярность»: перспективы технологии криптовалютных расчётов',
  },
  {
    id: 3,
    href: '#',
    source: 'РБК',
    logo: logoRbk,
    title: 'Самый простой путь в крипто-обмен: на примере компании bitox.global',
  },
]

const sectionTitle = computed(() => props.section?.title || 'СМИ о нас')
const sectionSubtitle = computed(() => props.section?.subtitle || null)

const allPublications = computed(() => {
  if (!props.section?.posts?.length) return defaultPublications

  return props.section.posts.map((post) => ({
    id: post.id,
    href: post.link || '#',
    source: post.logo?.alternativeText || '',
    logo: getStrapiMediaUrl(post.logo, apiUrl),
    title: post.title,
    description: post.description?.trim() || '',
  }))
})

const hasMorePublications = computed(() => allPublications.value.length > DEFAULT_VISIBLE_COUNT)

const visiblePublications = computed(() => {
  if (showAll.value || !hasMorePublications.value) {
    return allPublications.value
  }

  return allPublications.value.slice(0, DEFAULT_VISIBLE_COUNT)
})

</script>
