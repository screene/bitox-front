<template>
  <section v-if="faqItems.length" class="faq-sec">
    <div class="container">
      <h2 v-if="faqTitle" class="faq-sec__title">{{ faqTitle }}</h2>

      <div class="faq-sec__list">
        <FaqItem
          v-for="item in faqItems"
          :key="item.id"
          :question="item.question"
          :answer="item.answer"
        />
      </div>
    </div>
  </section>
</template>

<script setup>

import { getCountryPrepositional } from '~/utils/getCountryPrepositional'

const props = defineProps({
  countryName: {
    type: String,
    default: '',
  },
  // Свой FAQ страницы (invoice_faq_sec); если пустой — показываем общий из Invoice faq
  section: {
    type: Object,
    default: null,
  },
})

const urlApi = useRuntimeConfig().public.apiUrl

const useExternalSection = Boolean(props.section?.questions_list?.length)

const { data: faqResponse } = await useFetch(
  () => (useExternalSection
    ? null
    : `${urlApi}/api/invoice-faq?populate[faq_sec][populate]=questions_list`),
)

const section = useExternalSection ? props.section : (faqResponse.value?.data?.faq_sec || null)



// Метки страны в текстах (в админке): «в {{куда}}» или «в {{}}» → «в Австрию», «в {{где}}» → «в Австрии»,
// «из {{откуда}}» → «из Австрии», {{кому}}, {{чем}}, {{что}} — остальные падежи
const COUNTRY_CASES = { '': 'accusative', 'куда': 'accusative', 'где': 'prepositional', 'откуда': 'genitive', 'кому': 'dative', 'чем': 'instrumental', 'что': 'nominative' }
// Если страны нет, вместо метки подставляем слово «страна» в том же падеже
const FALLBACK = { accusative: 'страну', prepositional: 'стране', genitive: 'страны', dative: 'стране', instrumental: 'страной', nominative: 'страна' }

function replaceCountryPlaceholder(text) {
  if (!text) return ''

  return text.replace(/\{\{\s*([а-яё]*)\s*\}\}/gi, (match, key) => {
    const caseName = COUNTRY_CASES[key.toLowerCase()]
    if (!caseName) return match
    return props.countryName ? getCountryPrepositional(props.countryName, caseName) : FALLBACK[caseName]
  })
}

let faqTitle = ''

if (section?.title) {
  faqTitle = replaceCountryPlaceholder(section.title)
}

const faqItems = []

if (section?.questions_list) {
  for (let i = 0; i < section.questions_list.length; i++) {
    const item = section.questions_list[i]
    const question = replaceCountryPlaceholder(item.title || '')
    const answer = replaceCountryPlaceholder(item.text || '')

    if (!question && !answer) continue

    faqItems.push({
      id: item.id || i + 1,
      question,
      answer,
    })
  }
}
</script>
