import { XMLParser } from 'fast-xml-parser'

const RATES_URL = 'https://bitox.net/exports/kurs.xml'

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  isArray: (name) => name === 'item',
})

// Последние непустые курсы: если выгрузка недоступна или пустая (например, ночью),
// отдаём их, чтобы калькулятор не оставался без курса
let lastRates = null

export async function fetchExchangeRates() {
  try {
    const xml = await $fetch(RATES_URL, {
      responseType: 'text',
    })

    const parsed = parser.parse(xml)
    const rates = parsed?.rates || {}
    const items = Array.isArray(rates.item) ? rates.item : []

    if (items.length) {
      lastRates = {
        generatedAt: rates.generated_at || null,
        items,
      }
      return lastRates
    }
  } catch (error) {
    if (!lastRates) throw error
  }

  return lastRates || { generatedAt: null, items: [] }
}
