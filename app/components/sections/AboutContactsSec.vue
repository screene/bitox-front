<template>
  <section v-if="section" ref="sectionRef" class="about-contacts-sec">
    <div class="container">
      <div class="about-contacts-sec__box">
        <div class="about-contacts-sec__head" :class="{ 'about-contacts-sec__head--with-tabs': offices.length > 1 }">
          <h2 class="about-contacts-sec__title">{{ section.title }}</h2>
          <p class="about-contacts-sec__subtitle">{{ section.subtitle }}</p>
        </div>

        <div v-if="offices.length > 1" class="about-contacts-sec__tabs" role="tablist" aria-label="Офисы">
          <button
            v-for="office in offices"
            :key="office.id"
            type="button"
            class="about-contacts-sec__tab"
            :class="{ 'about-contacts-sec__tab--active': office.id === activeOffice.id }"
            role="tab"
            :aria-selected="office.id === activeOffice.id"
            @click="activeOfficeId = office.id"
          >
            {{ office.city }}
          </button>
        </div>

        <div class="about-contacts-sec__grid">
          <article
            v-for="item in contacts"
            :key="item.id"
            class="about-contacts-sec__card"
          >
            <span class="about-contacts-sec__card-icon" v-html="item.icon" />
            <p class="about-contacts-sec__card-text">              
              <span
                v-if="item.id === 'telegram'"
                class="about-contacts-sec__card-link"
                role="link"
                tabindex="0"
                style="cursor: pointer"
                @click="openTelegramBot"
                @keydown.enter="openTelegramBot"
              >
                {{ item.text }}
              </span>
              <a
                v-else-if="item.href"
                :href="item.href"
                class="about-contacts-sec__card-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ item.text }}
              </a>
              
              <template v-else>{{ item.text }}</template>
            </p>
          </article>
        </div>

        <div class="about-contacts-sec__map">
          <ClientOnly>
            <Map1 :key="activeOffice.id" :map-data="mapData" />
          </ClientOnly>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import gsap from 'gsap'
import Map1 from '~/components/maps/map-1.vue'
import { parseMapCoordinates } from '~/utils/strapi'

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const sectionRef = ref(null)

const { $TgAnalitika } = useNuxtApp()

async function openTelegramBot() {
  const result = await $TgAnalitika.trackEvent()
  if (result?.data?.link) window.open(result.data.link, '_blank')
}

// Офисы из админки (список offices). Если список пуст — один офис из старых полей блока
const offices = computed(() => {
  const list = (props.section.offices ?? []).filter((office) => office?.location || office?.map_coordinates_yandex)

  if (list.length) {
    return list.map((office, index) => ({
      id: office.id ?? index,
      city: office.city || `Офис ${index + 1}`,
      location: office.location,
      coordinates: office.map_coordinates_yandex,
    }))
  }

  return [{
    id: 'main',
    city: '',
    location: props.section.location,
    coordinates: props.section.map_coordinates_yandex,
  }]
})

const activeOfficeId = ref(null)
const activeOffice = computed(() => offices.value.find((office) => office.id === activeOfficeId.value) ?? offices.value[0])

const mapData = computed(() => {
  return parseMapCoordinates(activeOffice.value.coordinates) ?? {
    karta_dolgota: 37.537,
    karta_shirota: 55.7495,
  }
})

const contacts = computed(() => [
  {
    id: 'address',
    text: activeOffice.value.location,
    icon: `<svg width="18" height="22" viewBox="0 0 9 11" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.5 0C2.01866 0 0 1.87171 0 4.17241C0 8.11762 4.09132 10.8183 4.26549 10.9314C4.33585 10.9772 4.41808 11 4.5 11C4.58192 11 4.66415 10.9772 4.73451 10.9314C4.90868 10.8183 9 8.11762 9 4.17241C9 1.87171 6.98134 0 4.5 0ZM4.5 6.06897C3.37224 6.06897 2.45455 5.21808 2.45455 4.17241C2.45455 3.12675 3.37224 2.27586 4.5 2.27586C5.62776 2.27586 6.54545 3.12675 6.54545 4.17241C6.54545 5.21808 5.62776 6.06897 4.5 6.06897Z" fill="#FFDD2D"/></svg>`,
  },
  {
    id: 'email',
    text: props.section.email,
    href: props.section.email ? `mailto:${props.section.email}` : null,
    icon: `<svg width="18" height="18" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.4122 5.93855C5.72554 6.14745 6.27534 6.14748 6.58875 5.93853L11.9295 2.37799C11.7544 1.87137 11.2729 1.50639 10.7074 1.50639H1.2934C0.727966 1.50639 0.246486 1.87137 0.0712891 2.37799L5.41203 5.93846L6.58891 5.93844L11.9295 2.37799Z" fill="#FFDD2D"/><path d="M6.97848 6.52336C6.70404 6.70632 6.35196 6.79775 6 6.79775C5.64797 6.79775 5.29603 6.70634 5.02173 6.52346L0 3.17567V9.20084C0 9.91374 0.580012 10.4937 1.29296 10.4937H10.7071C11.42 10.4937 12 9.91374 12 9.20084V3.17567L6.97848 6.52336Z" fill="#FFDD2D"/></svg>`,
  },
  {
    id: 'phone',
    text: props.section.phone,
    href: props.section.phone ? `tel:${props.section.phone.replace(/\s/g, '')}` : null,
    icon: `<svg width="18" height="18" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M11.7803 10.5552C11.7006 10.6347 11.6046 10.7362 11.5027 10.8437C11.2484 11.1135 10.9308 11.449 10.7318 11.585C9.68439 12.3007 8.28317 11.9583 7.29202 11.5453C5.98453 11.0005 4.56102 9.99625 3.28287 8.71786C2.00352 7.43938 0.999457 6.01535 0.454677 4.70854C0.042196 3.71712 -0.300984 2.31555 0.414835 1.26789C0.550766 1.06867 0.886962 0.75153 1.15643 0.496785C1.26424 0.395206 1.36502 0.299229 1.4447 0.219799C1.58617 0.0790262 1.77762 0 1.97719 0C2.17676 0 2.36821 0.0790262 2.50968 0.219799L4.43681 2.14647C4.5775 2.28794 4.65647 2.47935 4.65647 2.67887C4.65647 2.87839 4.5775 3.0698 4.43681 3.21127L3.91183 3.73522C3.73651 3.90927 3.62207 4.13528 3.58555 4.37962C3.54902 4.62396 3.59237 4.87356 3.70913 5.09128C4.4312 6.45419 5.54595 7.56881 6.90891 8.29069C7.12656 8.40742 7.3761 8.45071 7.62036 8.41412C7.86461 8.37754 8.09051 8.26303 8.26442 8.08765L8.78811 7.56367C8.92958 7.4229 9.12103 7.34387 9.3206 7.34387C9.52017 7.34387 9.71161 7.4229 9.85308 7.56367L11.7803 9.49067C11.921 9.63209 12 9.82347 12 10.023C12 10.2224 11.921 10.4138 11.7803 10.5552Z" fill="#FFDD2D"/></svg>`,
  },
  {
    id: 'telegram',
    text: props.section.telegram_title,
    href: props.section.telegram_link?.startsWith('http')
      ? props.section.telegram_link
      : `https://t.me/${(props.section.telegram_link || props.section.telegram_title || '').replace('@', '')}`,
    icon: `<svg width="18" height="17" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.725 0.466725L12.3958 12.6265C12.5265 12.6265 12.0699 13.4696 11.1746 13.0653L5.80055 8.79825L5.77563 8.78567C6.50154 8.11068 12.1306 2.86956 12.3766 2.63199C12.7575 2.26406 12.521 2.04502 12.0788 2.32295L3.76401 7.79105L0.55617 6.67334C0.55617 6.67334 0.0513494 6.48739 0.00278445 6.08306C-0.0464195 5.67806 0.572784 5.45902 0.572784 5.45902L13.6502 0.146434C13.6502 0.146434 14.725 -0.342604 14.725 0.466725V0.466725Z" fill="#FFDD2D"/></svg>`,
  },
].filter((item) => item.text))

let sectionAnimation

onMounted(() => {
  if (!sectionRef.value) return

  sectionAnimation = gsap.context(() => {
    gsap.from('.about-contacts-sec__box', {
      opacity: 0,
      y: 24,
      duration: 0.6,
      ease: 'power2.out',
    })
  }, sectionRef.value)
})

onUnmounted(() => {
  sectionAnimation?.revert()
})
</script>
