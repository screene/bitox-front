<template>
  <section class="how-start-sec">
    <div class="container">

      <div class="how-start-sec__title-wrapper">

        <div class="how-start-sec__title">
          {{ sectionTitle }}

        </div>

      </div>
      

      <div
        v-if="clusters.length > 1"
        class="how-start-sec__tabs"
        role="tablist"
        aria-label="Тип операции"
      >
        <!-- Заголовок H2 только у первой вкладки («Этапы проведения международного платежа»), остальные — обычный текст -->
        <component
          :is="index === 0 ? 'h2' : 'div'"
          v-for="(cluster, index) in clusters"
          :key="cluster.id"
          class="how-start-sec__tab"
          :class="{ 'how-start-sec__tab--active': activeTab === cluster.id }"
          role="tab"
          :aria-selected="activeTab === cluster.id"
          @click="activeTab = cluster.id"
        >
          {{ cluster.label }}
        </component>
      </div>

      <div class="how-start-sec__grid">
        <article
          v-for="step in currentSteps"
          :key="`${activeTab}-${step.id}`"
          class="how-start-sec__card"
        >
          <span class="how-start-sec__card-step">Шаг {{ step.step }}</span>
          <div class="how-start-sec__card-title">{{ step.title }}</div>
          <p class="how-start-sec__card-text">{{ step.text }}</p>
        </article>
      </div>

      <div v-if="buttonText" class="how-start-sec__btn-wrap">
        <AppButton @click="openConsultationModal">{{ buttonText }}</AppButton>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useModalStore, MODAL_NAMES } from '~/stores/modal'

const modalStore = useModalStore()


function openConsultationModal() {
  modalStore.open(MODAL_NAMES.consultation)
}

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const activeTab = ref(null)

const paymentSteps = [
  {
    id: 1,
    step: 1,
    title: 'Заявка на сделку',
    text: 'Укажите сумму, валюту и реквизиты вашей компании для приёма платежа. После получения заявки специалисты проанализируют параметры сделки и подберут оптимальную схему валютного перевода.',
  },
  {
    id: 2,
    step: 2,
    title: 'Заключение договора',
    text: 'Подписываем агентский договор, фиксируем валюту, сумму, курс и условия. Это обеспечивает прозрачность перевода за рубеж и юридическую защиту сторон.',
  },
  {
    id: 3,
    step: 3,
    title: 'Выбор агента для платежа',
    text: 'Мы предлагаем проверенных агентов, которые примут платеж от покупателя. Подбираем оптимальный маршрут платежа за границу с учетом страны получателя, валюты и банковских требований.',
  },
  {
    id: 4,
    step: 4,
    title: 'Оплата от покупателя',
    text: 'Покупатель переводит деньги агенту с российского счета и предоставляет необходимые документы: контракт, инвойс и сопроводительные файлы.',
  },
  {
    id: 5,
    step: 5,
    title: 'Выплата в рублях',
    text: 'Предоставляем все необходимые закрывающие документы. Вы получаете отчет и все необходимые документы для бухгалтерии.',
  },
]

const cryptoSteps = [
  {
    id: 1,
    step: 1,
    title: 'Заявка на операцию',
    text: 'Укажите сумму, валюту и направление обмена. После получения заявки специалисты проанализируют параметры сделки и подберут оптимальный курс и схему проведения операции.',
  },
  {
    id: 2,
    step: 2,
    title: 'Заключение договора',
    text: 'Подписываем договор, фиксируем валюту, сумму, курс и условия. Это обеспечивает прозрачность операции и юридическую защиту сторон.',
  },
  {
    id: 3,
    step: 3,
    title: 'Проверка документов',
    text: 'Проводим проверку документов и соответствие операции требованиям законодательства. При необходимости запрашиваем дополнительные материалы для безопасного проведения сделки.',
  },
  {
    id: 4,
    step: 4,
    title: 'Перевод средств',
    text: 'Вы переводите средства по согласованным реквизитам и предоставляете необходимые документы. Мы контролируем поступление и подтверждаем начало операции.',
  },
  {
    id: 5,
    step: 5,
    title: 'Зачисление криптовалюты',
    text: 'Предоставляем все необходимые закрывающие документы. Вы получаете криптовалюту на указанный кошелёк или рублёвую выплату — в зависимости от условий сделки.',
  },
]

const defaultClusters = [
  { id: 'payment', label: 'Международный платеж', steps: paymentSteps },
  { id: 'crypto', label: 'Операция с криптовалютой', steps: cryptoSteps },
]

const sectionTitle = computed(() => props.section.title || 'Как начать?')
const buttonText = computed(() => props.section.button_text || 'Начать взаимовыгодное сотрудничество')

const clusters = computed(() => {
  if (!props.section.clusters?.length) return defaultClusters

  return props.section.clusters.map((cluster, index) => ({
    id: cluster.id ?? index,
    label: cluster.title_cluster,
    steps: (cluster.items ?? []).map((item, stepIndex) => ({
      id: item.id,
      step: stepIndex + 1,
      title: item.title,
      text: item.subtitle,
    })),
  }))
})

watch(
  clusters,
  (items) => {
    if (!items.length) return

    const hasActiveTab = items.some((item) => item.id === activeTab.value)

    if (!hasActiveTab) {
      activeTab.value = items[0].id
    }
  },
  { immediate: true },
)

const currentSteps = computed(() => (
  clusters.value.find((cluster) => cluster.id === activeTab.value)?.steps ?? []
))
</script>
