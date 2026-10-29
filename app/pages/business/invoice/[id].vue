<template>
  <main v-if="invoice" class="service-page">
    <!-- <ServiceHeroSec v-if="invoice.service_hero_sec" :section="invoice.service_hero_sec" /> -->
    
    <InvoiceHeroSec 
    v-if="invoice.service_hero_sec" 
    :section="invoice.service_hero_sec" 
    :countryName="invoice.title"/>
   
    <!-- <CryptoExchangeCalcSec :sectionTitle="'Калькулятор инвойса'"/> -->

    <InvoiceStatsSec :countryName="invoice.title" />

    <InvoiceTermsSec :country-name="invoice.title" :section="invoice.invoice_terms_sec" />

    <ServiceInvoicesSec
      v-if="invoice.services_invoice_sec"
      :section="invoice.services_invoice_sec"
      :sectionTitle="`Какие инвойсы в ${getCountryPrepositional(invoice.title, 'accusative')} мы помогаем оплачивать`"
    />
    
    <ServiceEconomySec :sectionTitle="`Экономия на оплате инвойсов в ${getCountryPrepositional(invoice.title, 'accusative')} с Bitox`"/>

    <InvoiceProcessSec :country-name="invoice.title" />

    <HomeChoiceSec />

    <HomeBenefitsSec />

    <BusinessCountriesSec
      v-if="invoices.length"
      :title="invoice.service_county_sec_v2?.title_section"
      :countries="invoices"
    />
    <BusinessOtherSec />

    <ServiceExamplesSec
      v-if="invoice.services_invoice_example_sec"
      :section="invoice.services_invoice_example_sec"
    />
    <HomeReviewsSec />

    <HomeMediaSec v-if="invoice.service_media_about_us_sec" :section="invoice.service_media_about_us_sec" />
    
    <InvoiceFaqSec :country-name="invoice.title" />
    
    <ServiceContactSec :sectionTitle="`Оплатить инвойс в ${getCountryPrepositional(invoice.title, 'prepositional')}`" />
  </main>
</template>

<script setup>
import { buildStrapiSlugFilter, mapStrapiInvoices, STRAPI_SEO_POPULATE_PARTS } from '~/utils/strapi'

//функция для добавления страны в нужном падеже
import { getCountryPrepositional } from '~/utils/getCountryPrepositional'

const urlApi = useRuntimeConfig().public.apiUrl
const route = useRoute()

const slug = computed(() => route.params.id)

const populate = [
  'populate[service_hero_sec][populate]=image',
  'populate[services_invoice_sec][populate][invoice_elements][populate][invoice_image]=true',
  'populate[services_invoice_sec][populate][invoice_elements][populate][invoice_element_list_items]=true',
  'populate[service_county_sec_v2]=true',
  'populate[services_invoice_example_sec][populate][examples_items][populate][blog][populate]=post_image',
  'populate[service_media_about_us_sec][populate][posts][populate]=logo',
  'populate[invoices_pages_region]=true',
  'populate[invoice_terms_sec][populate]=term_items',
  ...STRAPI_SEO_POPULATE_PARTS,
].join('&')

const { data: invoiceResponse } = await useFetch(
  () => (slug.value ? `${urlApi}/api/invoices?${buildStrapiSlugFilter(slug.value)}&${populate}` : null),
  { watch: [slug] },
)

// список всех инвойсов (стран) для секции BusinessCountriesSec
const { data: invoicesResponse } = await useFetch(
  `${urlApi}/api/invoices?fields[0]=title&fields[1]=slug&populate[0]=flag&populate[1]=invoices_pages_region&pagination[pageSize]=100`,
)

const invoice = computed(() => invoiceResponse.value?.data?.[0])

function getInvoiceRegionKey(item) {
  const region = item?.invoices_pages_region
  if (!region) return null
  return region.documentId || region.id || null
}

const invoices = computed(() => {
  const allInvoices = invoicesResponse.value?.data ?? []
  const current = invoice.value
  const currentRegionKey = getInvoiceRegionKey(current)
  const currentKey = current?.documentId || current?.id || current?.slug

  let list = []

  for (let i = 0; i < allInvoices.length; i++) {
    const item = allInvoices[i]
    const itemKey = item.documentId || item.id || item.slug

    if (currentKey && itemKey === currentKey) continue
    if (current?.slug && item.slug === current.slug) continue

    list.push(item)
  }

  if (currentRegionKey) {
    const sameRegion = []

    for (let i = 0; i < list.length; i++) {
      if (getInvoiceRegionKey(list[i]) === currentRegionKey) {
        sameRegion.push(list[i])
      }
    }

    if (sameRegion.length) {
      list = sameRegion
    }
  }

  return mapStrapiInvoices(list, urlApi)
})

if (!slug.value || !invoice.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Инвойс не найден',
  })
}

useStrapiSeo(invoice.value.Seo, { apiUrl: urlApi })
</script>
