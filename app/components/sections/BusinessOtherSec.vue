<template>
  <section v-if="otherServices.length" ref="sectionRef" class="service-other-sec">
    <div class="container">
      <!-- Со своим списком (props.items) заголовок — не тег заголовка, а div (по ТЗ) -->
      <div v-if="items" class="service-other-sec__title">Другие наши услуги</div>
      <h3 v-else class="service-other-sec__title">Другие наши услуги</h3>

      <div class="service-other-sec__nav">
        <button
          type="button"
          class="service-other-sec__arrow"
          aria-label="Предыдущий слайд"
          :disabled="swiperReady && isBeginning"
          @click="prev()"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 12L5.64645 12.3536L5.29289 12L5.64645 11.6464L6 12ZM18 11.5C18.2761 11.5 18.5 11.7239 18.5 12C18.5 12.2761 18.2761 12.5 18 12.5L18 12L18 11.5ZM10 16L9.64645 16.3536L5.64645 12.3536L6 12L6.35356 11.6464L10.3536 15.6464L10 16ZM6 12L5.64645 11.6464L9.64645 7.64645L10 8L10.3536 8.35355L6.35356 12.3536L6 12ZM6 12L6 11.5L18 11.5L18 12L18 12.5L6 12.5L6 12Z" fill="white" />
          </svg>
        </button>

        <button
          type="button"
          class="service-other-sec__arrow"
          aria-label="Следующий слайд"
          :disabled="swiperReady && isEnd"
          @click="next()"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 12L18.3536 11.6464L18.7071 12L18.3536 12.3536L18 12ZM6 12.5C5.72386 12.5 5.5 12.2761 5.5 12C5.5 11.7239 5.72386 11.5 6 11.5V12V12.5ZM14 8L14.3536 7.64645L18.3536 11.6464L18 12L17.6464 12.3536L13.6464 8.35355L14 8ZM18 12L18.3536 12.3536L14.3536 16.3536L14 16L13.6464 15.6464L17.6464 11.6464L18 12ZM18 12V12.5H6V12V11.5H18V12Z" fill="white" />
          </svg>
        </button>
      </div>

      <div class="service-other-sec__grid">
        <NuxtLink
          v-for="item in otherServices"
          :key="item.link"
          :to="item.link"
          class="service-other-sec__card"
        >
          <div class="service-other-sec__preview">
            <img
              :src="item.image || ''"
              alt=""
              class="service-other-sec__preview-img"
            />
          </div>

          <div class="service-other-sec__body">
            <p class="service-other-sec__card-title">{{ item.title }}</p>
            <p v-if="item.subtitle" class="service-other-sec__card-text">{{ item.subtitle }}</p>
          </div>
        </NuxtLink>
      </div>

      <div class="service-other-sec__slider-wrap">
        <ClientOnly>
          <swiper-container ref="swiperRef" :init="false" class="service-other-sec__slider">
            <swiper-slide v-for="item in otherServices" :key="`slide-${item.link}`">
              <NuxtLink
                :to="item.link"
                class="service-other-sec__card service-other-sec__card--slide"
              >
                <div class="service-other-sec__preview">
                  <img
                    :src="item.image || ''"
                    alt=""
                    class="service-other-sec__preview-img"
                  />
                </div>

                <div class="service-other-sec__body">
                  <p class="service-other-sec__card-title">{{ item.title }}</p>
                  <p v-if="item.subtitle" class="service-other-sec__card-text">{{ item.subtitle }}</p>
                </div>
              </NuxtLink>
            </swiper-slide>
          </swiper-container>
        </ClientOnly>
      </div>
    </div>
  </section>
</template>

<script setup>
import gsap from 'gsap'
import { mapStrapiBusinessPages } from '~/utils/strapi'

const props = defineProps({
  // Свой список карточек вместо страниц /business/…: [{ title, subtitle, link, image }]
  // image — путь из медиатеки Strapi (/uploads/…) или полный адрес
  items: {
    type: Array,
    default: null,
  },
})

const urlApi = useRuntimeConfig().public.apiUrl
const route = useRoute()

const { data: businessPagesResponse } = await useFetch(
  () => (props.items
    ? null
    : `${urlApi}/api/business-pages?fields[0]=title&fields[1]=slug&fields[2]=subtitle&populate=preview_image&pagination[pageSize]=100`),
)

const sectionRef = ref(null)
const swiperRef = ref(null)
const swiperReady = ref(false)

const excludedSlug = computed(() => {
  const match = route.path.match(/^\/business\/([^/]+)$/)

  return match?.[1] ?? null
})

const otherServices = computed(() => {
  if (props.items) {
    return props.items.map((item) => ({
      ...item,
      image: item.image?.startsWith('/') ? `${urlApi}${item.image}` : item.image,
    }))
  }

  const pages = mapStrapiBusinessPages(businessPagesResponse.value?.data ?? [], urlApi)
    .map((page) => ({ ...page, link: `/business/${page.slug}` }))

  if (!excludedSlug.value) {
    return pages
  }

  return pages.filter((page) => page.slug !== excludedSlug.value)
})

const { next, prev, isBeginning, isEnd, reInitialize } = useSwiper(swiperRef, {
  slidesPerView: 1,
  spaceBetween: 0,
  speed: 500,
})

watch(swiperRef, async (el) => {
  if (!el) return

  await nextTick()
  reInitialize()
  swiperReady.value = true
})

watch(otherServices, async () => {
  if (!swiperRef.value) return

  await nextTick()
  reInitialize()
})

let sectionAnimation

onMounted(() => {
  if (!sectionRef.value) return

  sectionAnimation = gsap.context(() => {
    gsap.from('.service-other-sec__title', {
      opacity: 0,
      y: 24,
      duration: 0.6,
      ease: 'power2.out',
    })

    gsap.from('.service-other-sec__slider-wrap', {
      opacity: 0,
      y: 24,
      duration: 0.6,
      delay: 0.15,
      ease: 'power2.out',
    })
  }, sectionRef.value)
})

onUnmounted(() => {
  sectionAnimation?.revert()
})
</script>
