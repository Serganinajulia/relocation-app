import { supabase } from '@/lib/supabase'
import { FilterReferenceData } from '@/lib/filters/types'

function label(i18n: any): string {
  return i18n?.ru ?? ''
}

function logError(source: string, response: { error: unknown; status?: number; statusText?: string }) {
  if (!response.error) return
  console.error(`getFilterReferenceData ${source} error [status ${response.status} ${response.statusText}]:`, JSON.stringify(response.error, Object.getOwnPropertyNames(response.error as object)))
}

export async function getFilterReferenceData(): Promise<FilterReferenceData> {
  const [climate, clusters, countries, languages, freedom, regimes, residency] = await Promise.all([
    supabase.from('climate_types').select('id, name_i18n'),
    supabase.from('country_clusters').select('id, name_i18n'),
    supabase.from('countries').select('id, name_i18n, cluster_id'),
    supabase.from('languages').select('id, name_i18n'),
    supabase.from('fh_statuses').select('id, name_i18n'),
    supabase.from('eiu_regime_types').select('id, name_i18n'),
    supabase.from('residency_types').select('id, name_i18n'),
  ])

  logError('climate_types', climate)
  logError('country_clusters', clusters)
  logError('countries', countries)
  logError('languages', languages)
  logError('fh_statuses', freedom)
  logError('eiu_regime_types', regimes)
  logError('residency_types', residency)

  const clusterList = (clusters.data ?? []).map(c => ({
    id: c.id,
    label: label(c.name_i18n),
    countries: (countries.data ?? [])
      .filter(country => country.cluster_id === c.id)
      .map(country => ({ id: country.id, label: label(country.name_i18n) })),
  }))

  return {
    climateTypes: (climate.data ?? []).map(c => ({ id: c.id, label: label(c.name_i18n) })),
    clusters: clusterList,
    languages: (languages.data ?? []).map(l => ({ id: l.id, label: label(l.name_i18n) })),
    freedomStatuses: (freedom.data ?? []).map(f => ({ id: f.id, label: label(f.name_i18n) })),
    regimeTypes: (regimes.data ?? []).map(r => ({ id: r.id, label: label(r.name_i18n) })),
    residencyTypes: (residency.data ?? []).map(r => ({ id: r.id, label: label(r.name_i18n) })),
  }
}