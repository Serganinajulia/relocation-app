export type ExtendedFilters = {
  countryIds: string[]
  languageIds: number[]
  englishLevel: string | null
  climateTypeIds: number[]
  nature: string[]                          // 'sea' | 'ocean' | 'river' | 'lake' | 'mountains'
  ecologyLevel: number | null                // 0-100, шкала "чистоты" (100 - pollution_index), null = Любая
  tempSummerMin: number | null
  tempSummerMax: number | null
  tempWinterMin: number | null
  tempWinterMax: number | null
  freedomStatusIds: number[]
  regimeTypeIds: number[]
  safetyLevel: number | null                 // 0-100, минимальный safety_index, null = Любая
  visaTypes: string[]
  residencyTypeIds: number[]
  incomeFits: boolean                       // beta — UI есть, логика сравнения дохода будет добавлена отдельно
  citizenshipYearsMax: number | null
  taxType: string | null
  healthcareLevel: number | null             // 0-100, минимальный healthcare_quality_index, null = Любой
  freeHealthcare: boolean
  freeKindergarten: boolean
  freeSchool: boolean
}

export const EMPTY_EXTENDED_FILTERS: ExtendedFilters = {
  countryIds: [],
  languageIds: [],
  englishLevel: null,
  climateTypeIds: [],
  nature: [],
  ecologyLevel: null,
  tempSummerMin: null,
  tempSummerMax: null,
  tempWinterMin: null,
  tempWinterMax: null,
  freedomStatusIds: [],
  regimeTypeIds: [],
  safetyLevel: null,
  visaTypes: [],
  residencyTypeIds: [],
  incomeFits: false,
  citizenshipYearsMax: null,
  taxType: null,
  healthcareLevel: null,
  freeHealthcare: false,
  freeKindergarten: false,
  freeSchool: false,
}

// Справочники — тянутся один раз на сервере (см. lib/queries/referenceData.ts) и прокидываются пропсами
export type FilterReferenceData = {
  climateTypes: { id: number; label: string }[]
  clusters: { id: number; label: string; countries: { id: string; label: string }[] }[]
  languages: { id: number; label: string }[]
  freedomStatuses: { id: number; label: string }[]
  regimeTypes: { id: number; label: string }[]
  residencyTypes: { id: number; label: string }[]
}