import { supabase } from '@/lib/supabase'

const WATER_SEA_TYPES = ['sea', 'ocean', 'lake', 'river'] as const

export type CitiesFilter = {
  has_sea?: boolean
  has_mountains?: boolean
  safety_index_min?: number
  timezone_offsets?: number[]
  english_level?: string
  temp_summer_min?: number
  temp_summer_max?: number
  temp_winter_min?: number
  temp_winter_max?: number
  budget_max?: number
  visa_options?: string[]
  politics_ids?: number[]
}

export async function getCities(filter: CitiesFilter = {}) {
  let query = supabase
    .from('cities')
    .select(`
      id,
      name_i18n,
      country_id,
      sea_type,
      has_mountains,
      safety_index,
      timezone_offset,
      english_level,
      population,
      image_url,
      temp_summer_min,
      temp_summer_max,
      temp_winter_min,
      temp_winter_max,
      countries!fk_cities_country (
        name_i18n,
        healthcare_access,
        school_is_free,
        kindergarten_is_free,
        tourist_visas!fk_visa_destination (
          origin_country_id,
          visa_type,
          allowed_days,
          conditions_i18n
        ),
        country_languages (
          is_official,
          is_widely_spoken,
          languages (
            name_i18n,
            code
          )
        ),
        country_politics (
          fh_score,
          eiu_regime_type_id,
          eiu_regime_types!country_politics_eiu_regime_type_id_fkey (
            name_i18n
          )
        )
      ),
      costs (
        groceries_usd,
        cafes_usd,
        internet_home_usd,
        mobile_plan_usd,
        transport_monthly_pass_usd,
        transport_single_ticket_usd,
        taxi_ride_avg_usd,
        beauty_base_index_usd,
        fitness_usd,
        coworking_usd,
        insurance_private_usd,
        kindergarten_usd,
        school_usd,
        kids_club_activity_usd,
        baby_supplies_usd
      ),
      rent_options (
        accommodation_type,
        bedrooms_count,
        price_usd_min,
        price_usd_max,
        utilities_usd_min,
        utilities_usd_max
      )
    `)

  if (filter.has_sea === true) {
    query = query.in('sea_type', [...WATER_SEA_TYPES])
  }
  if (filter.has_sea === false) {
    query = query.not('sea_type', 'in', `(${WATER_SEA_TYPES.join(',')})`)
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
  if (filter.temp_summer_min !== undefined) {
    query = query.gte('temp_summer_min', filter.temp_summer_min)
  }
  if (filter.temp_summer_max !== undefined) {
    query = query.lte('temp_summer_max', filter.temp_summer_max)
  }
  if (filter.temp_winter_min !== undefined) {
    query = query.gte('temp_winter_min', filter.temp_winter_min)
  }
  if (filter.temp_winter_max !== undefined) {
    query = query.lte('temp_winter_max', filter.temp_winter_max)
  }

  const { data, error } = await query

  if (error) {
    console.error('getCities error:', error)
    return []
  }

  return data
}