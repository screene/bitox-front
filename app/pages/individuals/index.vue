<template>
  <!-- Хаб для физлиц /individuals/ — по образцу /business/, данные из single type «Individuals hub» -->
  <main v-if="hub" class="service-page">
    <ServiceHeroSec v-if="hub.service_hero_sec" :section="hub.service_hero_sec" />
    <HomeStatsSec :section="hub.stats_sec" />
    <!-- Карточки со ссылками на страницы физлиц (медицина, образование, недвижимость, авто) -->
    <ServiceInvoicesSec v-if="hub.services_invoice_sec" :section="hub.services_invoice_sec" />
    <!-- Свои тексты, если заполнены в админке; пустые поля — из общего блока -->
    <ServiceEconomySec :override="hub.service_economy_sec" />
    
    <HomeBenefitsSec :section="hub.services_benefits_sec" />
    <BusinessCountriesSec
      v-if="transfersPages.length"
      :title="hub.service_county_sec_v2?.title_section"
      :countries="transfersPages"
      link-base="/transfers"
    />
    <BusinessOtherSec :items="otherServices" />
    <ServiceExamplesSec
      v-if="hub.services_invoice_example_sec"
      :section="hub.services_invoice_example_sec"
    />
    <HomeReviewsSec />
    <HomeMediaSec v-if="hub.service_media_about_us_sec" :section="hub.service_media_about_us_sec" />
    <HomeFaqSec v-if="hub.services_faq_sec" :section="hub.services_faq_sec" />
    <ServiceContactSec />
  </main>
</template>

<script setup>
import { mapStrapiInvoices, STRAPI_SEO_POPULATE_PARTS } from '~/utils/strapi'

const urlApi = useRuntimeConfig().public.apiUrl

const populate = [
  'populate[service_hero_sec][populate]=image',
  'populate[stats_sec][populate]=stats_element',
  'populate[services_invoice_sec][populate][invoice_elements][populate][invoice_image]=true',
  'populate[services_invoice_sec][populate][invoice_elements][populate][invoice_element_list_items]=true',
  'populate[service_economy_sec][populate][economy_list_items][populate]=image',
  'populate[services_benefits_sec][populate][benefits_items]=true',
  'populate[services_benefits_sec][populate][image_for_box_2]=true',
  'populate[service_county_sec_v2]=true',
  'populate[services_invoice_example_sec][populate][examples_items][populate][blog][populate]=post_image',
  'populate[service_media_about_us_sec][populate][posts][populate]=logo',
  'populate[services_faq_sec][populate]=questions_list',
  ...STRAPI_SEO_POPULATE_PARTS,
].join('&')

const [{ data: hubResponse }, { data: transfersPagesResponse }] = await Promise.all([
  useFetch(`${urlApi}/api/individuals-hub?${populate}`),
  useFetch(
    `${urlApi}/api/transfers-pages?fields[0]=title&fields[1]=slug&populate=flag&pagination[pageSize]=100`,
  ),
])

const hub = computed(() => hubResponse.value?.data)

// «Другие наши услуги» — перелинковка на разделы сайта (тексты по ТЗ)
const otherServices = [
  {
    title: 'Обмен криптовалюты',
    subtitle: 'Покупка и продажа стейблкоинов USDT/USDC за рубли, прием наличных и переводов с карт',
    link: '/crypto-exchange',
    image: '/uploads/Oplata_valyutnogo_kontrakta_b42a8d8886.webp',
  },
  {
    title: 'Оплата инвойсов',
    subtitle: 'Проведем платежи на покупку оборудования и других товаров физическими лицами у поставщиков за границей',
    link: '/business/invoice',
    image: '/uploads/Vozvrat_valyutnoj_vyruchki_2d37b6c72c.webp',
  },
  {
    title: 'Переводы с карты на карту за рубеж',
    subtitle: 'Принимаем рубли внутри РФ, конвертируем в нужную валюту и переводим их на карту зарубежного банка',
    link: '/transfers',
    image: '/uploads/O_kompanii_O_Bitox_v_czifrah_55a55464f2.webp',
  },
]

const transfersPages = computed(() =>
  mapStrapiInvoices(transfersPagesResponse.value?.data ?? [], urlApi),
)

if (!hubResponse.value?.data) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Страница не найдена',
  })
}

useStrapiSeo(hubResponse.value.data.Seo, { apiUrl: urlApi })
</script>
