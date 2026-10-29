<template>
  <section v-if="section" ref="sectionRef" class="about-offices-sec">
    <div class="container">
      <h2 class="about-offices-sec__title">{{ section.title_sec }}</h2>

      <div class="about-offices-sec__inner">
        <div class="about-offices-sec__map-wrapper">
          <img
            v-if="mapImageUrl"
            :src="mapImageUrl"
            alt="Карта офисов Bitox по России"
            class="about-offices-sec__map"
            width="555"
            height="420"
          />
        </div>

        <div class="about-offices-sec__list-card">
          <h3 class="about-offices-sec__list-title">{{ section.list_title || 'Список всех городов' }}</h3>

          <ul class="about-offices-sec__list">
            <li
              v-for="office in section.offices_list"
              :key="office.id"
              class="about-offices-sec__city"
            >
              {{ office.name_office }}
            </li>
          </ul>
        </div>
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
})

const apiUrl = useRuntimeConfig().public.apiUrl

const mapImageUrl = computed(() => getStrapiMediaUrl(props.section.offices_map_image, apiUrl))

const sectionRef = ref(null)

let sectionAnimation

onMounted(() => {
  if (!sectionRef.value) return

  sectionAnimation = gsap.context(() => {
    gsap.from('.about-offices-sec__title', {
      opacity: 0,
      y: 24,
      duration: 0.6,
      ease: 'power2.out',
    })

    gsap.from('.about-offices-sec__inner', {
      opacity: 0,
      y: 20,
      duration: 0.5,
      delay: 0.1,
      ease: 'power2.out',
    })
  }, sectionRef.value)
})

onUnmounted(() => {
  sectionAnimation?.revert()
})
</script>
