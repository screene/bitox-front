<template>
  <header class="header">
    <div class="header__top">
      <div class="container">
        <div class="header__top-inner">
          <div class="header__top-left">
            <div v-if="header?.address" class="header__location">
              <svg width="9" height="11" viewBox="0 0 9 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.5 0C2.01866 0 0 1.87171 0 4.17241C0 8.11762 4.09132 10.8183 4.26549 10.9314C4.33585 10.9772 4.41808 11 4.5 11C4.58192 11 4.66415 10.9772 4.73451 10.9314C4.90868 10.8183 9 8.11762 9 4.17241C9 1.87171 6.98134 0 4.5 0ZM4.5 6.06897C3.37224 6.06897 2.45455 5.21808 2.45455 4.17241C2.45455 3.12675 3.37224 2.27586 4.5 2.27586C5.62776 2.27586 6.54545 3.12675 6.54545 4.17241C6.54545 5.21808 5.62776 6.06897 4.5 6.06897Z" fill="#FFDD2D" />
              </svg>

              <span>{{ header.address }}</span>
            </div>

            <div v-if="header?.time_work" class="header__time">
              <span>{{ header.time_work }}</span>
            </div>
          </div>

          <div class="header__top-right">

            <TgBotButtonLink :type="'header-1'" />

            <a
              v-for="contact in contacts"
              :key="contact.id"
              :href="contact.link || '#'"
              class="header__contact"
              :class="{ 'header__contact--phone': isPhoneContact(contact) }"
            >
              <span v-if="contact.svg_icon" v-html="contact.svg_icon" />
              <span>{{ contact.text }}</span>
            </a>

            <button
              v-if="header?.call_btn_text"
              type="button"
              class="header__callback"
              @click="openConsultationModal"
            >
              {{ header.call_btn_text }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="header__main">
      <div class="container">
        <div class="header__main-inner">
          <NuxtLink to="/" class="header__logo">
            <img
              v-if="headerLogoUrl"
              :src="headerLogoUrl"
              :alt="header?.text_logo || 'Bitox'"
            />
            <span v-else>{{ header?.text_logo || 'Bitox' }}</span>
          </NuxtLink>

          <nav class="header__nav">
            <div
              v-for="item in navItems"
              :key="item.label"
              class="header__nav-item"
              :class="{ 'header__nav-item--has-mega': item.mega?.length, 'header__nav-item--active': isNavItemActive(item) }"
            >
              <NuxtLink
                v-if="item.clickable !== false"
                :to="item.to"
                class="header__nav-link"
                @click="rememberNavSource(item, item.to)"
              >
                {{ item.label }}
              </NuxtLink>
              <div
                v-else
                class="header__nav-link header__nav-link--static"
              >
                {{ item.label }}
              </div>

              <div v-if="item.mega?.length" class="header__mega">
                <div class="container">
                  <div
                    class="header__mega-inner"
                    :class="{
                      'header__mega-inner--single': item.mega.length === 1 && !item.mega[0]?.columns,
                      'header__mega-inner--wide': item.mega.length === 1 && item.mega[0]?.columns,
                    }"
                  >
                    <div
                      v-for="card in item.mega"
                      :key="card.id"
                      class="header__mega-card"
                    >
                      <p v-if="card.title" class="header__mega-card-title">{{ card.title }}</p>

                      <ul
                        v-if="card.links.length"
                        class="header__mega-list"
                        :class="{ [`header__mega-list--cols-${card.columns}`]: card.columns }"
                      >
                        <li v-for="link in card.links" :key="link.key">
                          <NuxtLink :to="link.to" class="header__mega-link" @click="rememberNavSource(item, link.to)">
                            {{ link.label }}
                          </NuxtLink>
                        </li>
                      </ul>
                    </div>

                    <div class="header__mega-cta">
                      <AppBannerBtn type="button" @click="openCallbackModal">
                        Заказать консультацию
                      </AppBannerBtn>
                      <p class="header__mega-cta-text">
                        Подберем оптимальное решение вашей задачи
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          <AppButton @click="openConsultationModal">{{ header?.ctr_button_text }}</AppButton>
          
          <div class="header__burger" 
          @click="toggleBurgerMenu"
          :class="{ 'header__burger--active': toggleBurger }"
          >
            <span class="header__burger-line header__burger-line--v1"></span>
            <span class="header__burger-line header__burger-line--v2"></span>
            <span class="header__burger-line header__burger-line--v3"></span>
          </div>

        </div>
      </div>
    </div>
  </header>

  <div class="mob-menu" :class="{ 'mob-menu--active': toggleBurger }">
    <div class="mob-menu__panel">
      <div class="container">
 

        <nav class="mob-menu__nav">
          <div
            v-for="item in navItems"
            :key="item.label"
            class="mob-menu__nav-group"
          >
            <button
              v-if="item.mega?.length"
              type="button"
              class="mob-menu__nav-item"
              :class="{ 'mob-menu__nav-item--open': openMobAccordion === item.label }"
              @click="toggleMobAccordion(item.label)"
            >
              <span>{{ item.label }}</span>
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M1 2.5L4.5 6.5L8 2.5" fill="#606061" />
              </svg>
            </button>

            <NuxtLink
              v-else
              :to="item.to"
              class="mob-menu__nav-item"
              @click="closeMobMenu"
            >
              <span>{{ item.label }}</span>
            </NuxtLink>

            <div
              v-if="item.mega?.length && openMobAccordion === item.label"
              class="mob-menu__mega"
            >
              <div v-if="item.to" class="mob-menu__mega-card">
                <ul class="mob-menu__mega-list">
                  <li>
                    <NuxtLink
                      :to="item.to"
                      class="mob-menu__mega-link"
                      @click="closeMobMenu"
                    >
                      {{ item.mobAllLabel || item.label }}
                    </NuxtLink>
                  </li>
                </ul>
              </div>

              <div
                v-for="card in item.mega"
                :key="card.id"
                class="mob-menu__mega-card"
              >
                <p v-if="card.title" class="mob-menu__mega-title">{{ card.title }}</p>

                <ul v-if="card.links.length" class="mob-menu__mega-list">
                  <li v-for="link in card.links" :key="link.key">
                    <NuxtLink
                      :to="link.to"
                      class="mob-menu__mega-link"
                      @click="closeMobMenu"
                    >
                      {{ link.label }}
                    </NuxtLink>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </nav>

        <div class="mob-menu__cta">
          <p class="mob-menu__cta-text">Подберем оптимальное решение вашей задачи</p>

          <AppBannerBtn type="button" @click="openConsultationModalFromMenu">
            Заказать консультацию
          </AppBannerBtn>
        </div>

        <div class="mob-menu__contacts">
          <div v-if="header?.address" class="mob-menu__contact">
            <svg width="19" height="23" viewBox="0 0 9 11" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M4.5 0C2.01866 0 0 1.87171 0 4.17241C0 8.11762 4.09132 10.8183 4.26549 10.9314C4.33585 10.9772 4.41808 11 4.5 11C4.58192 11 4.66415 10.9772 4.73451 10.9314C4.90868 10.8183 9 8.11762 9 4.17241C9 1.87171 6.98134 0 4.5 0ZM4.5 6.06897C3.37224 6.06897 2.45455 5.21808 2.45455 4.17241C2.45455 3.12675 3.37224 2.27586 4.5 2.27586C5.62776 2.27586 6.54545 3.12675 6.54545 4.17241C6.54545 5.21808 5.62776 6.06897 4.5 6.06897Z" fill="#313132" />
            </svg>

            <div class="mob-menu__contact-body">
              <span>{{ header.address }}</span>
              <span v-if="header?.time_work">{{ header.time_work }}</span>
            </div>
          </div>

          <a
            v-for="contact in mobMenuContacts"
            :key="contact.id"
            :href="contact.link || '#'"
            class="mob-menu__contact mob-menu__contact--link"
          >
            <span v-if="contact.svg_icon" v-html="contact.svg_icon" />
            <span>{{ contact.text }}</span>
          </a>
        </div>

        <div v-if="socials.length" class="mob-menu__socials">


          <TgBotButtonLink :type="'header-2'" />

          <a
            v-for="social in socials"
            :key="social.id"
            :href="social.link || '#'"
            class="mob-menu__social-link"
            :aria-label="social.name"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              v-if="social.icon"
              :src="social.icon"
              :alt="social.name"
              width="18"
              height="18"
            />
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

import TgBotButtonLink from '~/components/buttons/TgBotButtonLink.vue'
import { useModalStore, MODAL_NAMES } from '~/stores/modal'
import { getStrapiMediaUrl, mapStrapiBusinessPages, mapStrapiIndividualsPages } from '~/utils/strapi'

const urlApi = useRuntimeConfig().public.apiUrl

const toggleBurger = ref(false)
const openMobAccordion = ref(null)

const [
  { data: headerResponse },
  { data: footerResponse },
  { data: businessPagesResponse },
  { data: individualsPagesResponse },
  { data: transfersPagesResponse },
  { data: exchangePagesResponse },
] = await Promise.all([
  useFetch(`${urlApi}/api/header-component?populate[header_contacts_list]=true&populate[header_logo_img]=true`),
  useFetch(`${urlApi}/api/footer-component?populate[socials_media_links][populate]=icon`),
  useFetch(
    `${urlApi}/api/business-pages?fields[0]=title&fields[1]=slug&fields[2]=type_business_page&pagination[pageSize]=100`,
  ),
  useFetch(
    `${urlApi}/api/individuals-pages?fields[0]=title&fields[1]=slug&pagination[pageSize]=100`,
  ),
  useFetch(
    [
      `${urlApi}/api/transfers-pages?fields[0]=title`,
      'fields[1]=slug',
      'fields[2]=title_nav_meny',
      'fields[3]=add_to_nav_menu_individual',
      'fields[4]=add_to_nav_menu_import',
      'fields[5]=add_to_nav_menu_export',
      'fields[6]=nav_meny_title_individual',
      'fields[7]=nav_meny_title_import',
      'fields[8]=nav_meny_title_export',
      'fields[9]=nav_meny_title_transfers',
      'pagination[pageSize]=100',
    ].join('&'),
  ),
  useFetch(
    `${urlApi}/api/exchange-pages?fields[0]=title&fields[1]=slug&pagination[pageSize]=100&sort=title:desc`,
  ),
])

const header = computed(() => headerResponse.value?.data)

const headerLogoUrl = computed(() =>
  getStrapiMediaUrl(header.value?.header_logo_img, urlApi),
)

const contacts = computed(() => header.value?.header_contacts_list ?? [])

const socials = computed(() =>
  (footerResponse.value?.data?.socials_media_links ?? []).map((item) => ({
    id: item.id,
    link: item.link,
    name: item.icon?.alternativeText || '',
    icon: getStrapiMediaUrl(item.icon, urlApi),
  })),
)

const mobMenuContacts = computed(() =>
  contacts.value.filter((contact) => {
    const link = contact.link || ''
    return link.startsWith('mailto:') || link.startsWith('tel:')
  }),
)

function closeMobMenu() {
  toggleBurger.value = false
  openMobAccordion.value = null
}

function toggleBurgerMenu() {
  toggleBurger.value = !toggleBurger.value

  if (!toggleBurger.value) {
    openMobAccordion.value = null
  }
}

function toggleMobAccordion(label) {
  openMobAccordion.value = openMobAccordion.value === label ? null : label
}

function openConsultationModalFromMenu() {
  closeMobMenu()
  openConsultationModal()
}

function isPhoneContact(contact) {
  return contact.link?.startsWith('tel:')
}

const modalStore = useModalStore()

function openConsultationModal() {
  modalStore.open(MODAL_NAMES.consultation)
}

function openCallbackModal() {
  modalStore.open(MODAL_NAMES.callback)
}

const TRANSFER_NAV_TITLE_FIELDS = {
  individual: 'nav_meny_title_individual',
  import: 'nav_meny_title_import',
  export: 'nav_meny_title_export',
  transfers: 'nav_meny_title_transfers',
}

function getTransferNavTitle(page, menuKey) {
  const specificTitle = page[TRANSFER_NAV_TITLE_FIELDS[menuKey]]?.trim()

  return specificTitle || page.title_nav_meny?.trim() || page.title
}

function mapTransferNavLinks(pages, menuKey) {
  return [...pages]
    .map((page) => ({
      key: page.documentId,
      label: getTransferNavTitle(page, menuKey),
      to: `/transfers/${page.slug}`,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, 'ru'))
}

const businessMega = computed(() => {
  const pages = mapStrapiBusinessPages(businessPagesResponse.value?.data ?? [])
  const transfersPages = transfersPagesResponse.value?.data ?? []

  const importLinks = [
    { key: 'business-invoice', label: 'Оплата инвойсов', to: '/business/invoice' },
    { key: 'business-invoice-servers', label: 'Платежи для селлеров', to: '/business/invoice' },
    ...pages
      .filter((page) => page.type === 'import')
      .map((page) => ({
        key: page.documentId,
        label: page.title,
        to: `/business/${page.slug}`,
      })),
    ...mapTransferNavLinks(
      transfersPages.filter((page) => page.add_to_nav_menu_import),
      'import',
    ),
  ]

  const exportLinks = [
    ...pages
      .filter((page) => page.type === 'export')
      .map((page) => ({
        key: page.documentId,
        label: page.title,
        to: `/business/${page.slug}`,
      })),
    ...mapTransferNavLinks(
      transfersPages.filter((page) => page.add_to_nav_menu_export),
      'export',
    ),
  ]

  return [
    {
      id: 'business-1',
      title: 'Импортерам',
      links: importLinks,
    },
    {
      id: 'business-2',
      title: 'Экспортерам',
      links: exportLinks,
    },
  ]
})

const privateClientsMega = computed(() => {
  const individualsPages = mapStrapiIndividualsPages(individualsPagesResponse.value?.data ?? [])
  const transfersPages = transfersPagesResponse.value?.data ?? []

  const servicesLinks = individualsPages.map((page) => ({
    key: page.documentId,
    label: page.title,
    to: `/individuals/${page.slug}`,
  }))

  const transfersLinks = mapTransferNavLinks(
    transfersPages.filter((page) => page.add_to_nav_menu_individual),
    'individual',
  )

  return [
    {
      id: 'private-1',
      title: 'Все услуги',
      links: servicesLinks,
    },
    {
      id: 'private-2',
      title: 'Переводы в страны',
      links: transfersLinks,
      columns: 2,
    },
  ]
})

const exchangeMega = computed(() => {
  const pages = mapStrapiIndividualsPages(exchangePagesResponse.value?.data ?? [])

  const links = pages.map((page) => ({
    key: page.documentId,
    label: page.title,
    to: `/crypto-exchange/${page.slug}`,
  }))

  if (!links.length) return []

  return [
    {
      id: 'exchange-1',
      title: 'Обмен криптовалюты',
      links,
      columns: 1,
    },
  ]
})

const transfersMega = computed(() => {
  const transfersPages = transfersPagesResponse.value?.data ?? []

  const links = mapTransferNavLinks(transfersPages, 'transfers')

  if (!links.length) return []

  return [
    {
      id: 'transfers-1',
      title: 'Переводы в страны',
      links,
      columns: 4,
    },
  ]
})

const aboutMega = [
  {
    id: 'about-1',
    title: 'О компании',
    links: [
      { key: 'about', label: 'О компании', to: '/about' },
      { key: 'partners', label: 'Партнерская программа', to: '/partners' },
      { key: 'contacts', label: 'Официальные аккаунты', to: '/contacts' },
      { key: 'blog', label: 'Блог', to: '/blog' },
    ],
    columns: 1,
  },
]

const navItems = computed(() => [
  // mobAllLabel — подпись ссылки на страницу раздела в мобильном меню, чтобы не дублировать название раздела
  { label: 'Бизнесу', to: '/business', mega: businessMega.value, mobAllLabel: 'Все услуги для бизнеса' },
  { label: 'Частным клиентам', to: '/individuals', mega: privateClientsMega.value, mobAllLabel: 'Все услуги для частных клиентов' },
  { label: 'Международные расчеты', to: '/transfers', mega: transfersMega.value, mobAllLabel: 'Все страны' },
  { label: 'Обмен криптовалюты', to: '/crypto-exchange', mega: exchangeMega.value, mobAllLabel: 'Все направления обмена' },
  { label: 'О компании', mega: aboutMega, clickable: false },
])

const route = useRoute()

function isPathUnder(path, base) {
  return base && base !== '/' && (path === base || path.startsWith(`${base}/`))
}

function navItemMatchesRoute(item) {
  const paths = [
    item.to,
    ...(item.mega || []).flatMap((card) => (card.links || []).map((link) => link.to)),
  ]
  return paths.some((p) => isPathUnder(route.path, p))
}

// Из какого пункта меню перешли на страницу
const navSource = useState('header-nav-source', () => null)

function rememberNavSource(item, to) {
  navSource.value = { label: item.label, path: to }
}

// Если ссылка на страницу есть в нескольких пунктах меню, подсвечиваем один:
// тот, из которого перешли, а если перешли не из меню — раздел, к которому страница относится по адресу
const activeNavLabel = computed(() => {
  const matches = navItems.value.filter(navItemMatchesRoute)
  if (matches.length <= 1) return matches[0]?.label ?? null

  const source = navSource.value
  if (source && source.path === route.path && matches.some((item) => item.label === source.label)) {
    return source.label
  }

  const ownSection = matches.find((item) => isPathUnder(route.path, item.to))
  return (ownSection ?? matches[0]).label
})

function isNavItemActive(item) {
  return activeNavLabel.value === item.label
}

watch(() => route.path, closeMobMenu)
</script>
