<template>
  <main v-if="transfer" class="service-page">
    <!-- Шапка с формой «Рассчитайте платеж» вместо картинки -->
    <InvoiceHeroSec v-if="transfer.service_hero_sec" :section="transfer.service_hero_sec" calc-title="Рассчитайте перевод денег за рубеж" />

    <!-- Калькулятор показывается, только если в админке включено show_calc_sec -->
    <CryptoExchangeCalcSec v-if="transfer.show_calc_sec" />
    
    <HomeStatsSec />

    <ServiceInvoicesSec v-if="transfer.services_invoice_sec" :section="transfer.services_invoice_sec" />

    <ServiceEconomySec :featureOverrides="[{ text: 'Вы платите в рублях внутри РФ. Bitox переводит деньги получателю за рубежом с зарубежного счёта.' }]" :override="transfer.service_economy_sec" />

    <HomeChoiceSec :section="transfer.transfer_choice_sec?.title_section ? transfer.transfer_choice_sec : null" :patch="transfer.transfer_choice_sec" />

    <HomeBenefitsSec />

    <BusinessCountriesSec
      v-if="transfersPages.length"
      :title="transfer.service_county_sec_v2?.title_section"
      :countries="transfersPages"
      link-base="/transfers"
    />

    <BusinessOtherSec />

    <ServiceExamplesSec
      v-if="transfer.services_invoice_example_sec"
      :section="transfer.services_invoice_example_sec"
    />

    <HomeReviewsSec />

    <HomeMediaSec v-if="transfer.service_media_about_us_sec" :section="transfer.service_media_about_us_sec" />

    <HomeFaqSec v-if="transfer.services_faq_sec" :section="transfer.services_faq_sec" />

    <ServiceContactSec />
  </main>
</template>

<script setup>
import { mapStrapiInvoices, STRAPI_SEO_POPULATE_PARTS } from '~/utils/strapi'

const urlApi = useRuntimeConfig().public.apiUrl

const populate = [
  'populate[service_hero_sec][populate]=image',
  'populate[services_invoice_sec][populate][invoice_elements][populate][invoice_image]=true',
  'populate[services_invoice_sec][populate][invoice_elements][populate][invoice_element_list_items]=true',
  'populate[service_county_sec_v2]=true',
  'populate[services_invoice_example_sec][populate][examples_items][populate][blog][populate]=post_image',
  'populate[service_media_about_us_sec][populate][posts][populate]=logo',
  'populate[services_faq_sec][populate]=questions_list',
  'populate[service_economy_sec][populate][economy_list_items][populate]=image',
  'populate[transfer_choice_sec][populate]=table_row',
  ...STRAPI_SEO_POPULATE_PARTS,
].join('&')

const [{ data: transferResponse }, { data: transfersPagesResponse }] = await Promise.all([
  useFetch(`${urlApi}/api/transfer?${populate}`),
  useFetch(
    `${urlApi}/api/transfers-pages?fields[0]=title&fields[1]=slug&populate=flag&pagination[pageSize]=100`,
  ),
])

const transfer = computed(() => transferResponse.value?.data)

const transfersPages = computed(() =>
  mapStrapiInvoices(transfersPagesResponse.value?.data ?? [], urlApi),
)

if (!transferResponse.value?.data) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Страница не найдена',
  })
}

useStrapiSeo(transferResponse.value.data.Seo, { apiUrl: urlApi })
</script>
