<template>
  <main class="contacts-page">
    <ContactsAccountsSec v-if="heroSections.length" :sections="heroSections" />
    <AboutContactsSec v-if="contact?.contacts_map_sec" :section="contact.contacts_map_sec" />
    <AboutOfficesSec v-if="contact?.contact_offices_sec" :section="contact.contact_offices_sec" />
    <ServiceContactSec />
  </main>
</template>

<script setup>
import { STRAPI_SEO_POPULATE_PARTS } from '~/utils/strapi'

const urlApi = useRuntimeConfig().public.apiUrl

const populate = [
  'populate[contacts_hero_sec][populate][telegram_img]=true',
  'populate[contacts_hero_sec][populate][tg_users]=true',
  'populate[contacts_map_sec][populate]=offices',
  'populate[contact_offices_sec][populate][offices_map_image]=true',
  'populate[contact_offices_sec][populate][offices_list]=true',
  ...STRAPI_SEO_POPULATE_PARTS,
].join('&')

const { data: contactResponse } = await useFetch(`${urlApi}/api/contact?${populate}`)

const contact = computed(() => contactResponse.value?.data)

const heroSections = computed(() => {
  const sections = contact.value?.contacts_hero_sec

  if (!sections) return []
  if (Array.isArray(sections)) return sections.filter(Boolean)

  return [sections]
})

const pageSeo = contactResponse.value?.data?.Seo
useStrapiSeo(pageSeo, { apiUrl: urlApi })
</script>
