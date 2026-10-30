<template>
  <div class="consultation-modal" role="dialog" aria-modal="true" aria-labelledby="consultation-modal-title">
    <button
      type="button"
      class="consultation-modal__close"
      aria-label="Закрыть"
      @click="modalStore.close()"
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M1 1L17 17M17 1L1 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
    </button>

    <!-- Хаб для физлиц /individuals/ — свои тексты и ссылка на Telegram-бота -->
    <template v-if="isIndividualsHub">
      <p class="consultation-modal__subtitle">Перезвоним за 30 минут (с 10:00 до 22:00 по МСК)</p>

      <h2 id="consultation-modal-title" class="consultation-modal__title consultation-modal__title--compact">
        Укажите номер телефона — рассчитаем актуальный курс и ответим на вопросы по оплате.
      </h2>

      <p class="consultation-modal__tg">
        <a href="#" class="consultation-modal__tg-link" @click.prevent="openTelegramBot">Или напишите в наш Телеграм-бот</a>.
      </p>
    </template>

    <template v-else>
      <p class="consultation-modal__subtitle">Позвоним вам в течении 30 минут</p>

      <h2 id="consultation-modal-title" class="consultation-modal__title">
        Менеджер ответит на вопросы и расскажет про возможности и преимущества нашего сервиса
      </h2>
    </template>

    <form class="consultation-modal__form" @submit.prevent="handleSubmit">
      <label class="consultation-modal__field">
        <span class="consultation-modal__label">Номер телефона</span>

        <div class="consultation-modal__control consultation-modal__control--phone">
          <img :src="flagRu" alt="" class="consultation-modal__flag" width="24" height="16" />
          <input
            :value="phone"
            type="tel"
            maxlength="18"
            inputmode="numeric"
            class="consultation-modal__input"
            placeholder="+7 (999) 999 99 99"
            autocomplete="tel"
            @keydown="onPhoneKeydown"
            @input="onPhoneInput"
          />
        </div>
      </label>

      <label class="consultation-modal__checkbox">
        <input v-model="personalConsent" type="checkbox" />
        <span class="consultation-modal__checkbox-text">
          Я даю согласие на обработку своих персональных данных
        </span>
      </label>

      <label class="consultation-modal__checkbox">
        <input v-model="offerConsent" type="checkbox" />
        <span class="consultation-modal__checkbox-text">
          Согласен с условиями публичной оферты о заключении договора оказания
          информационно-консультационных услуг
        </span>
      </label>

      <label class="consultation-modal__checkbox">
        <input v-model="marketingConsent" type="checkbox" />
        <span class="consultation-modal__checkbox-text">
          Я даю согласие на получение рекламной и информационной рассылки
        </span>
      </label>

      <button
        type="submit"
        class="app-btn consultation-modal__submit"
        :disabled="!canSubmit || isSubmitting"
      >
        {{ isSubmitting ? 'Отправка...' : 'Отправить' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { useModalStore } from '~/stores/modal'
import flagRu from '~/assets/images/flags/russian.png'

const modalStore = useModalStore()
const { isSubmitting, submit } = useFormSubmit()

// Свой вариант попапа только на хабе /individuals/ (не на /individuals/medicine и т.п.)
const route = useRoute()
const isIndividualsHub = computed(() => route.path.replace(/\/+$/, '') === '/individuals')

const { $TgAnalitika } = useNuxtApp()

async function openTelegramBot() {
  // Вкладку открываем сразу по клику, иначе браузер может заблокировать её как всплывающее окно
  const tab = window.open('', '_blank')
  try {
    const result = await $TgAnalitika.trackEvent()
    const link = result?.data?.link
    if (tab && link) tab.location.href = link
    else if (link) window.location.href = link
    else tab?.close()
  } catch {
    tab?.close()
  }
}

const phone = ref('+7 ')
const personalConsent = ref(true)
const offerConsent = ref(true)
const marketingConsent = ref(true)

const canSubmit = computed(
  () => phone.value.replace(/\D/g, '').length === 11 && personalConsent.value && offerConsent.value,
)

function onPhoneKeydown(event) {
  const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End']
  if (allowed.includes(event.key) || event.ctrlKey || event.metaKey) return
  if (!/^\d$/.test(event.key)) event.preventDefault()
}

function onPhoneInput({ target }) {
  const n = target.value.replace(/\D/g, '').replace(/^7|^8/, '').slice(0, 10)
  phone.value = n
    ? `+7 (${n.slice(0, 3)}${n.length > 3 ? `) ${n.slice(3, 6)}` : ''}${n.length > 6 ? ` ${n.slice(6, 8)}` : ''}${n.length > 8 ? ` ${n.slice(8, 10)}` : ''}`
    : '+7 '
  target.value = phone.value
}

async function handleSubmit() {
  if (isSubmitting.value) return

  await submit('/api/forms/consultation', {
    title_form: 'Консультация',
    phone: phone.value.trim(),
    personalConsent: personalConsent.value,
    offerConsent: offerConsent.value,
    marketingConsent: marketingConsent.value,
  }, {
    validate: () => canSubmit.value,
  })
}
</script>

<style scoped>
.consultation-modal__title--compact {
  margin-bottom: 16px;
  font-size: 28px;
  line-height: 1.05;
}

.consultation-modal__tg {
  margin: 0 0 32px;
  font-size: 16px;
  line-height: 1.3;
}

.consultation-modal__tg-link {
  color: #2f6fd6;
  text-decoration: underline;
}

@media (max-width: 767px) {
  .consultation-modal__title--compact {
    font-size: 22px;
  }
}
</style>
