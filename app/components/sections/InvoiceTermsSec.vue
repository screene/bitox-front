<template>
  <section v-if="section && items.length" class="invoice-terms-sec">
    <div class="container">
      <h2 v-if="section.title_section" class="invoice-terms-sec__title">
        {{ section.title_section }}
      </h2>

      <div class="invoice-terms-sec__card">
        <div class="invoice-terms-sec__layout">
          <div class="invoice-terms-sec__list">
            <article
              v-for="(item, index) in items"
              :key="item.id"
              class="invoice-terms-sec__item"
              :class="{ 'invoice-terms-sec__item--active': activeId === item.id }"
            >
              <button
                type="button"
                class="invoice-terms-sec__header"
                :aria-expanded="activeId === item.id"
                @click="selectItem(item.id)"
              >
                <span class="invoice-terms-sec__num">{{ index + 1 }}.</span>
                <span class="invoice-terms-sec__question">{{ item.title }}</span>
                <span class="invoice-terms-sec__arrow" aria-hidden="true">
                  <svg width="8" height="12" viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.5 1L6.5 6L1.5 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
              </button>

              <ClientOnly>
                <Vue3SlideUpDown :model-value="activeId === item.id" :duration="400" class="invoice-terms-sec__mobile-panel">
                  <div class="invoice-terms-sec__body">
                    <div v-if="item.html" class="invoice-terms-sec__text invoice-terms-sec__text--rich" v-html="item.html" />
                    <p v-else-if="item.text" class="invoice-terms-sec__text">{{ item.text }}</p>
                  </div>
                </Vue3SlideUpDown>
              </ClientOnly>
            </article>
          </div>

          <div class="invoice-terms-sec__panel">
            <template v-if="activeItem">
              <h3 v-if="activeItem.title" class="invoice-terms-sec__subtitle">{{ activeItem.title }}</h3>
              <div v-if="activeItem.html" class="invoice-terms-sec__text invoice-terms-sec__text--rich" v-html="activeItem.html" />
              <p v-else-if="activeItem.text" class="invoice-terms-sec__text">{{ activeItem.text }}</p>
            </template>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { Vue3SlideUpDown } from 'vue3-slide-up-down'

//функция для добавления страны в нужном падеже
import { getCountryPrepositional } from '~/utils/getCountryPrepositional'
import MarkdownIt from 'markdown-it'

// HTML в тексте экранируется (html: false), поэтому v-html безопасен
const md = new MarkdownIt()

const props = defineProps({
  countryName: {
    type: String,
    default: '',
  },
  // Свой блок условий для конкретной страны (invoice_terms_sec). Если не заполнен — общий блок
  section: {
    type: Object,
    default: null,
  },
})

const urlApi = useRuntimeConfig().public.apiUrl

const useExternalSection = Boolean(props.section?.term_items?.length)

const { data: termsResponse } = await useFetch(
  () => (useExternalSection
    ? null
    : `${urlApi}/api/invoice-terms-component?populate[term_items]=true`),
)

const section = useExternalSection ? props.section : (termsResponse.value?.data || null)

function replaceCountryPlaceholder(text) {
  if (!text) return ''
  if (!props.countryName) return text
  if (!text.includes('{{}}')) return text

  const countryForm = getCountryPrepositional(props.countryName, 'accusative')

  return text.split('{{}}').join(countryForm)
}

const items = []

if (section?.term_items) {
  for (let i = 0; i < section.term_items.length; i++) {
    const item = section.term_items[i]

    if (!item.title && !item.text) continue

    const text = replaceCountryPlaceholder(item.text || '')

    items.push({
      id: item.id || i + 1,
      title: replaceCountryPlaceholder(item.title || ''),
      text,
      // В своём блоке страны текст поддерживает списки (Markdown)
      html: useExternalSection && text ? md.render(text) : '',
    })
  }
}

const activeId = ref(items[0]?.id ?? null)

const activeItem = computed(() => {
  for (let i = 0; i < items.length; i++) {
    if (items[i].id === activeId.value) return items[i]
  }

  return null
})

function selectItem(id) {
  activeId.value = id
}
</script>
