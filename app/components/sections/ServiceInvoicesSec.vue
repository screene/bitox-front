<template>
  <section v-if="section" ref="sectionRef" class="service-invoices-sec">
    <div class="container service-invoices-sec__inner">
      <h2 v-if="sectionTitle || section.title" class="service-invoices-sec__title">
        {{ sectionTitle || section.title }}
      </h2>

      <div class="service-invoices-sec__grid">
        <article
          v-for="card in cards"
          :key="card.id"
          class="service-invoices-sec__card"
          :class="{ 'service-invoices-sec__card--link': card.pageLink }"
        >
          <div class="service-invoices-sec__card-top">
            <div class="service-invoices-sec__card-media">
              <img
                v-if="card.image"
                :src="card.image"
                alt=""
                class="service-invoices-sec__card-img"
              />
            </div>

            <div class="service-invoices-sec__card-body">
              <!-- Если у карточки есть ссылка (page_link), название — ссылка на страницу -->
              <h3 v-if="card.title" class="service-invoices-sec__card-title">
                <NuxtLink v-if="card.pageLink" :to="card.pageLink" class="service-invoices-sec__card-title-link">{{ card.title }}</NuxtLink>
                <template v-else>{{ card.title }}</template>
              </h3>
              <p v-if="card.text" class="service-invoices-sec__card-text">{{ card.text }}</p>

              <div v-if="card.tags.length" class="service-invoices-sec__tags">
                <span
                  v-for="tag in card.tags"
                  :key="tag"
                  class="service-invoices-sec__tag"
                >
                  {{ tag }}
                </span>
              </div>

              
            </div>
          </div>
          

          <div v-if="card.pageLink" class="service-invoices-sec__card-link">
              <NuxtLink :to="card.pageLink" class="app-btn">
                Подробнее
              </NuxtLink>
            </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
import gsap from 'gsap'
import { getStrapiMediaUrl } from '~/utils/strapi'

const props = defineProps({
  section: {
    type: Object,
    required: true,
    
  },
  // Заголовок из кода вместо заголовка из админки (например, со страной)
  sectionTitle: {
    type: String,
    default: '',
  },
})

const apiUrl = useRuntimeConfig().public.apiUrl

const cards = computed(() =>
  (props.section.invoice_elements ?? []).map((item) => ({
    id: item.id,
    title: item.title,
    text: item.subtitle,
    image: getStrapiMediaUrl(item.invoice_image, apiUrl),
    pageLink: item.page_link?.trim() || '',
    tags: (item.invoice_element_list_items ?? [])
      .map((tag) => tag.name)
      .filter(Boolean),
  })),
)

const sectionRef = ref(null)

let sectionAnimation

onMounted(() => {
  if (!sectionRef.value) return

  sectionAnimation = gsap.context(() => {
    gsap.from('.service-invoices-sec__title', {
      opacity: 0,
      y: 24,
      duration: 0.6,
      ease: 'power2.out',
    })

    gsap.from('.service-invoices-sec__card', {
      opacity: 0,
      y: 24,
      duration: 0.6,
      stagger: 0.12,
      delay: 0.1,
      ease: 'power2.out',
    })
  }, sectionRef.value)
})

onUnmounted(() => {
  sectionAnimation?.revert()
})
</script>

<style scoped>
/* Карточки со ссылкой подсвечиваются при наведении */
.service-invoices-sec__card--link {
  transition: box-shadow 0.25s ease;
}

.service-invoices-sec__card--link:hover {
  box-shadow: 0 0 0 2px #FFDD2D, 0 12px 32px rgba(51, 51, 51, 0.12);
}

.service-invoices-sec__card-title-link {
  color: inherit;
  text-decoration: none;
  transition: color 0.2s ease;
}

.service-invoices-sec__card--link:hover .service-invoices-sec__card-title-link,
.service-invoices-sec__card-title-link:focus-visible {
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
