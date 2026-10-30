<template>
  <section v-if="section" ref="sectionRef" class="service-hero-sec">
    <div class="container service-hero-sec__inner">
      <div class="service-hero-sec__content">
        <nav class="service-hero-sec__breadcrumbs" aria-label="Хлебные крошки">
          <NuxtLink to="/" class="service-hero-sec__breadcrumb-link">Главная</NuxtLink>
          <span class="service-hero-sec__breadcrumb-sep">/</span>
          <span class="service-hero-sec__breadcrumb-current">{{ section.title }}</span>
        </nav>

        <h1 v-if="section.title" class="service-hero-sec__title">{{ section.title }}</h1>

        <p v-if="section.subtitle" class="service-hero-sec__text">{{ section.subtitle }}</p>

        <AppClientBtn class="service-hero-sec__btn" @click="openConsultationModal">
          Оставить заявку
        </AppClientBtn>

        <!-- Подпись под кнопкой (поле button_note в админке), например «Минимальная сумма: от 500 USD» -->
        <p v-if="section.button_note" class="service-hero-sec__btn-note">{{ section.button_note }}</p>
      </div>

      <div v-if="heroImageUrl" class="service-hero-sec__media">
        <img
          :src="heroImageUrl"
          alt=""
          class="service-hero-sec__img"
          width="606"
          height="606"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import gsap from 'gsap'
import { useModalStore, MODAL_NAMES } from '~/stores/modal'
import { getStrapiMediaUrl } from '~/utils/strapi'

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const apiUrl = useRuntimeConfig().public.apiUrl
const modalStore = useModalStore()

const heroImageUrl = computed(
  () => getStrapiMediaUrl(props.section.image, apiUrl) || '',
)

function openConsultationModal() {
  modalStore.open(MODAL_NAMES.consultation)
}

const sectionRef = ref(null)

let heroAnimation

onMounted(() => {
  if (!sectionRef.value) return

  heroAnimation = gsap.context(() => {
    const timeline = gsap.timeline()

    timeline
      .from('.service-hero-sec__breadcrumbs', {
        opacity: 0,
        y: 16,
        duration: 0.5,
        ease: 'power2.out',
      })
      .from('.service-hero-sec__title', {
        opacity: 0,
        y: 24,
        duration: 0.6,
        ease: 'power2.out',
      }, '-=0.3')
      .from('.service-hero-sec__text', {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: 'power2.out',
      }, '-=0.35')
      .from('.service-hero-sec__btn', {
        opacity: 0,
        y: 16,
        duration: 0.45,
        ease: 'power2.out',
      }, '-=0.3')
      .from('.service-hero-sec__img', {
        opacity: 0,
        scale: 0.92,
        duration: 0.7,
        ease: 'power2.out',
      }, '-=0.4')
  }, sectionRef.value)
})

onUnmounted(() => {
  heroAnimation?.revert()
})
</script>

<style scoped>
.service-hero-sec__btn-note {
  margin-top: 12px;
  font-size: 14px;
  line-height: 1.4;
  color: #838383;
}
</style>
