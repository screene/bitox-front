<template>
  <div class="hero-calc">
    <!-- Вне рабочего времени курсы не считаем -->
    <div v-if="isOffline" class="hero-calc__offline">
      <p class="hero-calc__offline-badge">Сейчас калькулятор недоступен</p>
      <p class="hero-calc__offline-title">Работаем с 10:00 до 22:00 по МСК</p>
      <p class="hero-calc__offline-text">
        Оставьте заявку — менеджер ответит в рабочее время и рассчитает обмен.
      </p>
      <AppClientBtn class="hero-calc__btn" @click="openConsultationModal">
        Оставить заявку
      </AppClientBtn>
    </div>

    <template v-else>
      <div class="hero-calc__tabs" role="tablist" aria-label="Тип обмена">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          role="tab"
          class="hero-calc__tab"
          :class="{ 'hero-calc__tab--active': activeTab === tab.id }"
          :aria-selected="activeTab === tab.id"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="hero-calc__field">
        <span class="hero-calc__label">Отдаете</span>
        <div class="hero-calc__combo">
          <input
            v-model="amount"
            type="text"
            inputmode="decimal"
            class="hero-calc__amount"
            aria-label="Сумма"
          />
          <HeroCalcSelect
            v-model="selectedFrom"
            :options="fromSelectOptions"
            variant="inline"
            aria-label="Валюта, которую отдаете"
          />
        </div>
      </div>

      <div class="hero-calc__field">
        <span class="hero-calc__label">Получаете</span>
        <div class="hero-calc__combo">
          <span class="hero-calc__amount hero-calc__amount--result">{{ receiveText }}</span>
          <HeroCalcSelect
            v-model="selectedTo"
            :options="toSelectOptions"
            variant="inline"
            aria-label="Валюта, которую получаете"
          />
        </div>
      </div>

      <!-- Безнал: только страна. Наличные: страна и город в одну строку -->
      <div class="hero-calc__row" :class="{ 'hero-calc__row--2': isCash }">
        <HeroCalcSelect
          v-model="selectedCountry"
          :options="countrySelectOptions"
          aria-label="Страна"
        />

        <HeroCalcSelect
          v-if="isCash"
          v-model="selectedCity"
          :options="citySelectOptions"
          aria-label="Город"
        />
      </div>

      <p class="hero-calc__rate">{{ rateText }}</p>

      <AppClientBtn class="hero-calc__btn" @click="openTelegramBot">
        Перейти к заявке в Telegram
      </AppClientBtn>
    </template>
  </div>
</template>

<script setup>
import { getCurrencyName } from '~/data/currency-names'
import {
  buildUniqueFromOptions,
  buildUniqueToOptions,
  calcReceiveAmount,
  findRate,
  formatAmount,
  parseAmount,
} from './rate-utils'
import { getCityOptions, resolveCityCode, syncRefSelect } from './location-utils'
import HeroCalcSelect from './HeroCalcSelect.vue'
import { useModalStore, MODAL_NAMES } from '~/stores/modal'

const props = defineProps({
  openTab: {
    type: String,
    default: 'cashless',
  },
})

const tabs = [
  { id: 'cashless', label: 'Безналичный' },
  { id: 'cash', label: 'Наличный' },
]

const activeTab = ref(props.openTab === 'cash' ? 'cash' : 'cashless')
const isCash = computed(() => activeTab.value === 'cash')

const modalStore = useModalStore()
function openConsultationModal() {
  modalStore.open(MODAL_NAMES.consultation)
}

const urlApi = useRuntimeConfig().public.apiUrl
const isOffline = ref(false)

// Страны и города — из админки, как у большого калькулятора
const locationPopulate = [
  'populate[calc][populate][exchange_data][populate][without_cache]=true',
  'populate[calc][populate][exchange_data][populate][cache][populate][citys]=true',
].join('&')

const { data: calcResponse } = useFetch(`${urlApi}/api/exchange-calc-component?${locationPopulate}`)
const calcData = computed(() => calcResponse.value?.data?.calc?.exchange_data)
const countries = computed(() => (isCash.value ? calcData.value?.cache : calcData.value?.without_cache) ?? [])

// Курсы — из той же выгрузки, что и у большого калькулятора
const cashItems = ref([])
const cashlessItems = ref([])
const items = computed(() => (isCash.value ? cashItems.value : cashlessItems.value))

const selectedFrom = ref('')
const selectedTo = ref('')
const selectedCountry = ref('')
const selectedCity = ref('')
const amount = ref('100000')

const fromOptions = computed(() => buildUniqueFromOptions(items.value))
const toOptions = computed(() => buildUniqueToOptions(items.value, selectedFrom.value))
const cityOptions = computed(() => (isCash.value ? getCityOptions(countries.value, selectedCountry.value) : []))
const cityCode = computed(() => (isCash.value ? resolveCityCode(selectedCity.value) : null))

// Варианты для выпадающих списков: { value, label }
const fromSelectOptions = computed(() => fromOptions.value.map((item) => ({ value: item.from, label: item.nameRuFrom })))
const toSelectOptions = computed(() => toOptions.value.map((item) => ({ value: item.to, label: item.nameRuTo })))
const countrySelectOptions = computed(() => countries.value.map((item) => ({ value: item.name_country, label: item.name_country })))
const citySelectOptions = computed(() => cityOptions.value.map((city) => ({ value: city, label: city })))

const rateItem = computed(() => findRate(items.value, selectedFrom.value, selectedTo.value, cityCode.value))

// Для наличных курс показываем только для Москвы и Санкт-Петербурга
const selectedRate = computed(() => {
  if (!rateItem.value) return null
  if (isCash.value && !cityCode.value) return null
  return rateItem.value
})

const receiveText = computed(() => {
  if (!selectedRate.value) return '—'
  return `≈ ${formatAmount(calcReceiveAmount(parseAmount(amount.value), selectedRate.value), 2)}`
})

const rateText = computed(() => {
  if (!selectedRate.value) return isCash.value ? 'Курс уточняйте у менеджера' : ''
  const rateIn = Number(selectedRate.value.in)
  const rateOut = Number(selectedRate.value.out)
  if (!Number.isFinite(rateIn) || !Number.isFinite(rateOut)) return ''
  return `Курс ≈ ${formatAmount(Math.max(rateIn, rateOut), 4)}`
})

// Данные расчёта уходят в админку вместе с меткой, по ней бот покажет их клиенту
function getCalcLeadData() {
  const fromAmount = parseAmount(amount.value)
  const rate = selectedRate.value
  const toAmount = rate ? calcReceiveAmount(fromAmount, rate) : null
  const rateValue = rate ? Math.max(Number(rate.in), Number(rate.out)) : null

  return {
    calc_type: activeTab.value,
    calc_from_amount: fromAmount || null,
    calc_from_currency: selectedFrom.value || null,
    calc_from_name: fromOptions.value.find((item) => item.from === selectedFrom.value)?.nameRuFrom || null,
    calc_to_amount: Number.isFinite(toAmount) ? Math.round(toAmount * 100) / 100 : null,
    calc_to_currency: selectedTo.value || null,
    calc_to_name: toOptions.value.find((item) => item.to === selectedTo.value)?.nameRuTo || null,
    calc_rate: Number.isFinite(rateValue) ? rateValue : null,
    calc_country: selectedCountry.value || null,
    calc_city: isCash.value ? selectedCity.value || null : null,
  }
}

const { $TgAnalitika } = useNuxtApp()
const isOpeningBot = ref(false)

async function openTelegramBot() {
  if (isOpeningBot.value) return
  isOpeningBot.value = true

  // Вкладку открываем сразу по клику, иначе браузер может заблокировать её как всплывающее окно
  const tab = window.open('', '_blank')

  try {
    const result = await $TgAnalitika.trackEvent(getCalcLeadData())
    const link = result?.data?.link

    if (tab && link) tab.location.href = link
    else if (link) window.location.href = link
    else tab?.close()
  } finally {
    isOpeningBot.value = false
  }
}

watch(countries, (list) => syncRefSelect(selectedCountry, list, (item) => item.name_country), { immediate: true })
watch(cityOptions, (list) => syncRefSelect(selectedCity, list), { immediate: true })
watch(fromOptions, (list) => syncRefSelect(selectedFrom, list, (item) => item.from), { immediate: true })
watch(toOptions, (list) => syncRefSelect(selectedTo, list, (item) => item.to), { immediate: true })

onMounted(async () => {
  // Ночной заглушки нет: калькулятор работает всегда, сервер отдаёт последние найденные курсы
  try {
    const data = await $fetch('/nuxt-api/exchange-rates')
    const list = data?.items || []

    for (let i = 0; i < list.length; i++) {
      const item = list[i]
      const newItem = { nameRuFrom: getCurrencyName(item.from), nameRuTo: getCurrencyName(item.to), ...item }
      if (item.from.includes('CASH') || item.to.includes('CASH')) cashItems.value.push(newItem)
      else cashlessItems.value.push(newItem)
    }
  } catch (error) {
    console.error('Failed to load exchange rates', error)
  }
})
</script>
