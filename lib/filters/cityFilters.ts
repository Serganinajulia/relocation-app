import { ExtendedFilters } from './types'

// Слайдер задаёт МИНИМАЛЬНОЕ требуемое значение (0-100). null = "Любой", фильтр не применяется.
function meetsMinQuality(actualQuality: number | null, minRequired: number | null): boolean {
  if (minRequired === null) return true
  if (actualQuality === null || actualQuality === undefined) return false
  return actualQuality >= minRequired
}

// country_politics — one-to-one по country_id. В зависимости от того, распознал ли Supabase
// уникальный constraint, связь может прийти объектом ИЛИ массивом из одного элемента — подстраховываемся на оба случая.
export function getCountryPolitics(country: any): any {
  return country?.country_politics?.[0] ?? country?.country_politics ?? null
}

// Город матчится, только если его собственный диапазон ЦЕЛИКОМ укладывается в выбранные границы —
// не просто "пересекается" с ними. "Зимой от 10°" означает "в этом городе никогда не холоднее 10°",
// а не "где-то в его диапазоне встречается 10° и выше".
function cityWithinTempRange(
  cityMin: number | null,
  cityMax: number | null,
  filterMin: number | null,
  filterMax: number | null
): boolean {
  if (filterMin === null && filterMax === null) return true
  if (cityMin === null || cityMax === null) return false
  if (filterMin !== null && cityMin < filterMin) return false
  if (filterMax !== null && cityMax > filterMax) return false
  return true
}

// city — элемент результата getCities(), с вложенными countries/tourist_visas/country_politics/country_residency_options.
// Тип намеренно any — как и в остальном коде каталога (см. CityGrid), пока getCities не имеет строгого возвращаемого типа.
export function matchesExtendedFilters(city: any, filters: ExtendedFilters, travelerCitizenships: string[]): boolean {
  const country = city.countries

  if (filters.countryIds.length && !filters.countryIds.includes(city.country_id)) return false

  if (filters.languageIds.length) {
    const officialIds = (country?.country_languages ?? [])
      .filter((cl: any) => cl.is_official)
      .map((cl: any) => cl.languages?.id)
    if (!filters.languageIds.some(id => officialIds.includes(id))) return false
  }

  if (filters.englishLevel && city.english_level !== filters.englishLevel) return false

  if (filters.climateTypeIds.length) {
    if (city.climate_type_id === null || !filters.climateTypeIds.includes(city.climate_type_id)) return false
  }

  if (filters.nature.length) {
    const waterTypes = filters.nature.filter(n => n !== 'mountains')
    const matchesWater = waterTypes.length > 0 && waterTypes.includes(city.sea_type)
    const matchesMountains = filters.nature.includes('mountains') && city.has_mountains === true
    if (!matchesWater && !matchesMountains) return false
  }

  // Экология: переводим pollution_index (выше = хуже) в шкалу "чистоты" (выше = лучше) для слайдера
  const cleanliness = city.pollution_index !== null && city.pollution_index !== undefined ? 100 - city.pollution_index : null
  if (!meetsMinQuality(cleanliness, filters.ecologyLevel)) return false
  if (!meetsMinQuality(city.safety_index, filters.safetyLevel)) return false
  if (!meetsMinQuality(city.healthcare_quality_index, filters.healthcareLevel)) return false

  if (!cityWithinTempRange(city.temp_summer_min, city.temp_summer_max, filters.tempSummerMin, filters.tempSummerMax)) return false
  if (!cityWithinTempRange(city.temp_winter_min, city.temp_winter_max, filters.tempWinterMin, filters.tempWinterMax)) return false

  const politics = getCountryPolitics(country)

  if (filters.freedomStatusIds.length) {
    if (!politics || !filters.freedomStatusIds.includes(politics.fh_status_id)) return false
  }
  if (filters.regimeTypeIds.length) {
    if (!politics || !filters.regimeTypeIds.includes(politics.eiu_regime_type_id)) return false
  }

  if (filters.visaTypes.length) {
    const visas = country?.tourist_visas ?? []
    const citizenshipsToCheck = travelerCitizenships.length ? travelerCitizenships : ['RU']
    const allFit = citizenshipsToCheck.every(citizenship => {
      const visa = visas.find((v: any) => v.origin_country_id === citizenship)
      return visa && filters.visaTypes.includes(visa.visa_type)
    })
    if (!allFit) return false
  }

  if (filters.residencyTypeIds.length) {
    const options = country?.country_residency_options ?? []
    const availableIds = options.map((o: any) => o.residency_type_id)
    if (!filters.residencyTypeIds.some(id => availableIds.includes(id))) return false
  }

  if (filters.citizenshipYearsMax !== null) {
    if (country?.citizenship_years === null || country?.citizenship_years === undefined) return false
    if (country.citizenship_years > filters.citizenshipYearsMax) return false
  }

  if (filters.taxType && country?.remote_income_tax_type !== filters.taxType) return false

  if (filters.freeHealthcare && country?.healthcare_access !== 'free') return false
  if (filters.freeKindergarten && country?.kindergarten_is_free !== true) return false
  if (filters.freeSchool && country?.school_is_free !== true) return false

  // filters.incomeFits — beta, логика сравнения дохода с min_income_usd_per_adult/child добавится отдельным шагом

  return true
}