<template>
  <section v-if="stats.length" class="stats-sec">
    <div class="container">
      <div class="stats-sec__grid">
        <div v-for="item in stats" :key="item.id ?? item.value" class="stats-sec__item">
          <p class="stats-sec__value">{{ item.value }}</p>
          <p class="stats-sec__text">{{ item.text }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  // Свои цифры страницы (stats_sec из админки); если пусто — общий блок
  section: {
    type: Object,
    default: null,
  },
})

const urlApi = useRuntimeConfig().public.apiUrl

const useExternalSection = Boolean(props.section?.stats_element?.length)

const { data: statsResponse } = await useFetch(
  () => (useExternalSection
    ? null
    : `${urlApi}/api/stats-component?populate[stats_section][populate]=stats_element`),
)

const stats = computed(() => {
  const items = useExternalSection
    ? props.section.stats_element
    : statsResponse.value?.data?.stats_section?.stats_element

  if (!items?.length) return []

  return items.map((item) => ({
    id: item.id,
    value: item.title,
    text: item.subtitle,
  }))
})
</script>
