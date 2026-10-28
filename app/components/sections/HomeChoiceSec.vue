<template>
  <section v-if="showSection" class="choice-sec">
    <div class="container">
      <h2 class="choice-sec__title">{{ sectionTitle }}</h2>

      <template v-if="rows.length">
        <div class="choice-sec__table" role="table" aria-label="Сравнение Bitox с банками и другими сервисами">
          <div class="choice-sec__head">
            <div class="choice-sec__row choice-sec__row--head" role="row">
              <div class="choice-sec__cell choice-sec__cell--label" role="columnheader">{{ headerLabels.label }}</div>
              <div
                class="choice-sec__cell choice-sec__cell--col-bitox choice-sec__cell--head-bitox"
                role="columnheader"
              >
                {{ headerLabels.bitox }}
              </div>
              <div class="choice-sec__cell choice-sec__cell--head" role="columnheader">
                {{ headerLabels.banks }}
              </div>
              <div class="choice-sec__cell choice-sec__cell--head" role="columnheader">
                {{ headerLabels.others }}
              </div>
            </div>
          </div>

          <div class="choice-sec__body">
            <div
              v-for="(row, index) in rows"
              :key="row.id ?? row.label"
              class="choice-sec__row"
              :class="index % 2 === 0 ? 'choice-sec__row--odd' : 'choice-sec__row--even'"
              role="row"
            >
              <div class="choice-sec__cell choice-sec__cell--label" role="rowheader">
                {{ row.label }}
              </div>

              <div
                class="choice-sec__cell choice-sec__cell--col-bitox choice-sec__cell--value"
                role="cell"
              >
                <span class="choice-sec__icon choice-sec__icon--yes" aria-hidden="true">
                  <svg width="14" height="11" viewBox="0 0 14 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 5.5L5 9.5L13 1.5" stroke="#313132" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
                <p class="choice-sec__text">{{ row.bitox }}</p>
              </div>

              <div class="choice-sec__cell choice-sec__cell--value" role="cell">
                <span class="choice-sec__icon choice-sec__icon--no" aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L11 11M11 1L1 11" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" />
                  </svg>
                </span>
                <p class="choice-sec__text">{{ row.banks }}</p>
              </div>

              <div class="choice-sec__cell choice-sec__cell--value" role="cell">
                <span class="choice-sec__icon choice-sec__icon--no" aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L11 11M11 1L1 11" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" />
                  </svg>
                </span>
                <p class="choice-sec__text">{{ row.others }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="choice-sec__mobile">
          <div class="choice-sec__tabs" role="tablist" aria-label="Сравнение сервисов">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              type="button"
              class="choice-sec__tab"
              :class="{
                'choice-sec__tab--active': activeTab === tab.id,
                'choice-sec__tab--bitox': tab.id === 'bitox',
              }"
              role="tab"
              :aria-selected="activeTab === tab.id"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>

          <div class="choice-sec__cards">
            <article
              v-for="(row, index) in rows"
              :key="row.id ?? row.label"
              class="choice-sec__card"
              :class="index % 2 === 0 ? 'choice-sec__card--odd' : 'choice-sec__card--even'"
            >
              <p class="choice-sec__card-label">{{ row.label }}</p>

              <div class="choice-sec__card-value">
                <span
                  class="choice-sec__icon"
                  :class="activeTab === 'bitox' ? 'choice-sec__icon--yes' : 'choice-sec__icon--no'"
                  aria-hidden="true"
                >
                  <svg
                    v-if="activeTab === 'bitox'"
                    width="14"
                    height="11"
                    viewBox="0 0 14 11"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M1 5.5L5 9.5L13 1.5" stroke="#313132" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  <svg
                    v-else
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M1 1L11 11M11 1L1 11" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" />
                  </svg>
                </span>

                <p class="choice-sec__card-text">{{ row[activeTab] }}</p>
              </div>
            </article>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  section: {
    type: Object,
    default: null,
  },
  // Заголовок из кода страницы (например, со страной) вместо заголовка из админки
  title: {
    type: String,
    default: '',
  },
  // Подписи колонок таблицы (например, только для главной); пустые — стандартные
  headers: {
    type: Object,
    default: null,
  },
})

const headerLabels = computed(() => ({
  label: props.headers?.label || '',
  bitox: props.headers?.bitox || 'Bitox',
  banks: props.headers?.banks || 'Банки',
  others: props.headers?.others || 'Другие сервисы',
}))

const urlApi = useRuntimeConfig().public.apiUrl

const tabs = computed(() => [
  { id: 'bitox', label: headerLabels.value.bitox },
  { id: 'banks', label: headerLabels.value.banks },
  { id: 'others', label: headerLabels.value.others },
])

const activeTab = ref('bitox')

function isChoiceSectionFilled(section) {
  if (!section) return false
  if (typeof section.title_section === 'string' && section.title_section.trim()) return true
  if (section.table_row?.length) return true
  return false
}

const useExternalSection = isChoiceSectionFilled(props.section)

const { data: choiceResponse, error: choiceError } = await useFetch(
  () => (useExternalSection ? null : `${urlApi}/api/choise-component?populate=table_row`),
)

function cellValue(value) {
  const text = typeof value === 'string' ? value.trim() : ''
  return text || '—'
}

const sectionData = computed(() => {
  if (useExternalSection) return props.section
  return choiceResponse.value?.data
})

const sectionTitle = computed(() => {
  if (props.title?.trim()) return props.title.trim()
  const title = sectionData.value?.title_section
  return typeof title === 'string' ? title.trim() : ''
})

const rows = computed(() => {
  const items = sectionData.value?.table_row

  if (!items?.length) return []

  return items
    .filter((item) => item?.title_row?.trim())
    .map((item) => ({
      id: item.id,
      label: item.title_row.trim(),
      bitox: cellValue(item.value_bitox),
      banks: cellValue(item.value_banks),
      others: cellValue(item.value_other),
    }))
})

const showSection = computed(() => {
  if (useExternalSection) return !!sectionTitle.value
  return !choiceError.value && !!sectionTitle.value
})
</script>
