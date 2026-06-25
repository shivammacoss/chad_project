import { apiGet } from '@/lib/api'
import type { Country } from '@/types/app'

export function fetchCountries(): Promise<Country[]> {
  return apiGet<Country[]>('/api/countries').catch(() => [{ code: 'TD', name: 'Chad', flag: '🇹🇩' }])
}
