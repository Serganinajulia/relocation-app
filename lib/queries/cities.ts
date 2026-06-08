import { supabase } from '@/lib/supabase'

export type CitiesFilter = {
  climate_type_id?: number
  has_sea?: boolean
  has_mountains?: boolean
  safety_index_min?: number
  timezone_offsets?: number[]
  english_level?: string
}

export async function getCities(filter: CitiesFilter = {}) {
  let query = supabase
  .from('cities')
  .select(`
    id,
    name_i18n,
    country_id,
    has_sea,
    has_mountains,
    safety_index,
    timezone_offset,
    english_level,
    population,
    climate_type_id,
    temp_summer_max,
    temp_winter_min,
    climate_types!fk_cities_climate_type (
      name_i18n
    ),
    countries!fk_cities_country (
      name_i18n
    ),
    costs (
      groceries_usd,
      cafes_usd,
      utilities_usd,
      internet_home_usd,
      transport_basic_usd
    ),
    rent_options (
      accommodation_type,
      bedrooms_count,
      price_usd_min
    )
  `)

  if (filter.climate_type_id) {
    query = query.eq('climate_type_id', filter.climate_type_id)
  }
  if (filter.has_sea !== undefined) {
    query = query.eq('has_sea', filter.has_sea)
  }
  if (filter.has_mountains !== undefined) {
    query = query.eq('has_mountains', filter.has_mountains)
  }
  if (filter.safety_index_min !== undefined) {
    query = query.gte('safety_index', filter.safety_index_min)
  }
  if (filter.timezone_offsets?.length) {
    query = query.in('timezone_offset', filter.timezone_offsets)
  }
  if (filter.english_level) {
    query = query.eq('english_level', filter.english_level)
  }

  const { data, error } = await query

  if (error) {
    console.error('getCities error:', error)
    return []
  }

  return data
}