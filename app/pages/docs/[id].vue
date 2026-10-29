<template>
  <main v-if="doc" class="docs-page">
    <section class="docs-page-sec">
      <div class="container">
        <nav class="blog-post-hero-sec__breadcrumbs" aria-label="Хлебные крошки">
          <NuxtLink to="/" class="blog-post-hero-sec__breadcrumb-link">Главная</NuxtLink>
          <span class="blog-post-hero-sec__breadcrumb-sep">/</span>
          <span class="blog-post-hero-sec__breadcrumb-current">{{ doc.title }}</span>
        </nav>

        <div class="docs-page-sec__wrapper">
          <h1 class="docs-page-sec__title">{{ doc.title }}</h1>

          <div v-if="doc.text_editor" class="docs-page-sec__content-wrapper">
            <div class="text-editor" v-html="renderMarkdown(doc.text_editor)" />
          </div>
        </div>
      </div>
    </section>

    <ServiceContactSec />
  </main>
</template>

<script setup>
import { getStrapiMediaUrl } from '~/utils/strapi'
import MarkdownIt from 'markdown-it';

const urlApi = useRuntimeConfig().public.apiUrl
const route = useRoute()

const slug = computed(() => route.params.id)


const { data: docResponse } = await useFetch(
  () => `${urlApi}/api/docs-pages?filters[slug][$eq]=${slug.value}&populate[seo][populate]=shareImage`,
  { watch: [slug] },
)

const doc = computed(() => docResponse.value?.data?.[0])

if (!slug.value || !docResponse.value?.data?.[0]) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Страница не найдена',
  })
}


const md = new MarkdownIt();

function renderMarkdown(text) {
    if (!text) {
        return '';
    }

    const spaced = text.replace(/\n{3,}/g, (match) => '\n\n' + '&nbsp;\n\n'.repeat(match.length - 2));

    return md.render(spaced).replace(/<p>\u00a0<\/p>/g, '<div class="docs-page-sec__spacer"></div>');
}



const pageSeo = docResponse.value.data[0].seo

// useSeoMeta({
//   title: pageSeo.metaTitle,
//   description: pageSeo.metaDescription,
//   ogImage: getStrapiMediaUrl(pageSeo.shareImage, urlApi),
// })
useStrapiSeo(pageSeo, { apiUrl: urlApi })
</script>
