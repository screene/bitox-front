<template>
  <main class="blog-page">
    <BlogTagsSec v-if="categories?.data?.length > 0" :categories="categories.data" @activeTag="activeTagFunction" />

    <template v-if="categories?.data?.length > 0">
      <template v-if="activeTag === null">
        <template v-for="category in categories.data" :key="category.id">
          <BlogCategorySec
            :title="category.name"
            :posts="getCurrentPosts(category.id)"
          />
        </template>
      </template>

      <template v-else>
        <template v-for="category in categories.data" :key="category.id">
          <BlogCategorySec
            v-if="+activeTag === +category.id"
            :title="category.name"
            :posts="getCurrentPosts(category.id)"
          />
        </template>
      </template>
    </template>

    <ServiceContactSec />
  </main>
</template>

<script setup>
import BlogTagsSec from '~/components/sections/BlogTagsSec.vue'
import BlogCategorySec from '~/components/sections/BlogCategorySec.vue'

import { STRAPI_BLOG_POSTS_API } from '~/utils/strapi'

const activeTag = ref(null)
const urlApi = useRuntimeConfig().public.apiUrl

const { data: categories } = await useFetch(`${urlApi}/api/categories`)

const { data: posts } = await useFetch(
  `${urlApi}/api/blog-posts?status=published&populate[post_image]=true&populate[category]=true`,
)

console.log('posts', posts.value)

function getCurrentPosts(categoryId) {
  if (!posts.value?.data?.length) return []

  return posts.value.data.filter(
    (post) => post.category?.id === categoryId,
  )
}

function activeTagFunction(tagId) {
  activeTag.value = tagId
}

const requestUrl = useRequestURL()
const route = useRoute()

useSeoMeta({
  title: 'Блог — Bitox',
  description: 'Статьи и новости Bitox о международных платежах, криптовалюте и финансовых решениях для бизнеса и частных клиентов.',
})

useHead({
  link: [
    {
      rel: 'canonical',
      href: 'https://bitox.global/blog',
    },
  ],
})
</script>
