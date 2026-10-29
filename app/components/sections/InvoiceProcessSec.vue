<template>
  <section v-if="section" class="invoice-process-sec">
    <div class="container">
      <div class="invoice-process-sec__head">
        <h2 v-if="sectionTitle" class="invoice-process-sec__title">
          {{ sectionTitle }}
        </h2>
        <p v-if="sectionSubtitle" class="invoice-process-sec__subtitle">
          {{ sectionSubtitle }}
        </p>
      </div>

      <div v-if="steps.length" class="invoice-process-sec__grid">
        <article
          v-for="(step, index) in steps"
          :key="step.id || index"
          class="invoice-process-sec__card"
        >
          <span class="invoice-process-sec__num" aria-hidden="true">{{ index + 1 }}</span>
          <h3 v-if="step.title" class="invoice-process-sec__card-title">{{ step.title }}</h3>
          <p v-if="step.subtitle" class="invoice-process-sec__card-text">{{ step.subtitle }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
//функция для добавления страны в нужном падеже
import { getCountryPrepositional } from '~/utils/getCountryPrepositional'

const props = defineProps({
  countryName: {
    type: String,
    default: '',
  },
  // Свои шаги для конкретной страны (invoice_process_sec → process_item).
  // Если не заполнены — шаги из общего блока
  override: {
    type: Object,
    default: null,
  },
})

const urlApi = useRuntimeConfig().public.apiUrl

const { data: processResponse } = await useFetch(
  `${urlApi}/api/invoice-process-component?populate[process_item]=true`,
)

const section = processResponse.value?.data || null

// Метки страны в текстах шагов (в админке): «в {{куда}}» → «в Австрию», «в {{где}}» → «в Австрии»,
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

const sectionSubtitle = replaceCountryPlaceholder(section?.section_subtitle)

let sectionTitle = ''

if (section?.section_base_title) {
  sectionTitle = section.section_base_title

  if (props.countryName) {
    sectionTitle = sectionTitle + ' ' + getCountryPrepositional(props.countryName, 'prepositional')
  }
}

const steps = []

const ownItems = props.override?.process_item ?? []
const processItems = ownItems.length ? ownItems : (section?.process_item ?? [])

if (processItems.length) {
  for (let i = 0; i < processItems.length; i++) {
    const item = processItems[i]

    if (item.title || item.subtitle) {
      steps.push({
        ...item,
        title: replaceCountryPlaceholder(item.title),
        subtitle: replaceCountryPlaceholder(item.subtitle),
      })
    }
  }
}
</script>
