import { ExtendedFilters } from './types'

const num = (v: string | null) => (v ? Number(v) : null)
const nums = (v: string | null) => (v ? v.split(',').map(Number) : [])
const strs = (v: string | null) => (v ? v.split(',') : [])

export function parseExtendedFilters(params: URLSearchParams): ExtendedFilters {
  return {
    countryIds: strs(params.get('ext_countries')),
    languageIds: nums(params.get('ext_languages')),
    englishLevel: params.get('ext_english'),
    climateTypeIds: nums(params.get('ext_climate')),
    nature: strs(params.get('ext_nature')),
    ecologyLevel: num(params.get('ext_ecology')),
    tempSummerMin: num(params.get('ext_temp_summer_min')),
    tempSummerMax: num(params.get('ext_temp_summer_max')),
    tempWinterMin: num(params.get('ext_temp_winter_min')),
    tempWinterMax: num(params.get('ext_temp_winter_max')),
    freedomStatusIds: nums(params.get('ext_freedom')),
    regimeTypeIds: nums(params.get('ext_regime')),
    safetyLevel: num(params.get('ext_safety')),
    visaTypes: strs(params.get('ext_visa')),
    residencyTypeIds: nums(params.get('ext_residency')),
    incomeFits: params.get('ext_income_fits') === 'true',
    citizenshipYearsMax: num(params.get('ext_citizenship')),
    taxTypes: strs(params.get('ext_tax')),
    healthcareLevel: num(params.get('ext_healthcare')),
    freeHealthcare: params.get('ext_free_healthcare') === 'true',
    freeKindergarten: params.get('ext_free_kindergarten') === 'true',
    freeSchool: params.get('ext_free_school') === 'true',
  }
}

// null/false/[] → удаляем параметр из URL, иначе сериализуем в строку
export function serializeExtendedFilterValue(value: unknown): string | null {
  if (value === null || value === undefined || value === false) return null
  if (Array.isArray(value)) return value.length ? value.join(',') : null
  if (value === true) return 'true'
  return String(value)
}

export const EXTENDED_FILTER_PARAM_KEYS: Record<keyof ExtendedFilters, string> = {
  countryIds: 'ext_countries',
  languageIds: 'ext_languages',
  englishLevel: 'ext_english',
  climateTypeIds: 'ext_climate',
  nature: 'ext_nature',
  ecologyLevel: 'ext_ecology',
  tempSummerMin: 'ext_temp_summer_min',
  tempSummerMax: 'ext_temp_summer_max',
  tempWinterMin: 'ext_temp_winter_min',
  tempWinterMax: 'ext_temp_winter_max',
  freedomStatusIds: 'ext_freedom',
  regimeTypeIds: 'ext_regime',
  safetyLevel: 'ext_safety',
  visaTypes: 'ext_visa',
  residencyTypeIds: 'ext_residency',
  incomeFits: 'ext_income_fits',
  citizenshipYearsMax: 'ext_citizenship',
  taxTypes: 'ext_tax',
  healthcareLevel: 'ext_healthcare',
  freeHealthcare: 'ext_free_healthcare',
  freeKindergarten: 'ext_free_kindergarten',
  freeSchool: 'ext_free_school',
}

export function isFilterActive(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'boolean') return value === true
  return value !== null && value !== undefined
}