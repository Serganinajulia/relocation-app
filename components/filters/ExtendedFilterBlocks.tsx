'use client'

import { ExtendedFilters, FilterReferenceData } from '@/lib/filters/types'
import {
  MultiSelectDropdown,
  SingleSelectDropdown,
  ThresholdSlider,
  PillsSelect,
  TempRangeInput,
  CheckboxRow,
} from '@/components/filters/FilterPrimitives'

type BlockProps = {
  filters: ExtendedFilters
  update: <K extends keyof ExtendedFilters>(key: K, value: ExtendedFilters[K]) => void
  updateMany: (partial: Partial<ExtendedFilters>) => void
  reference: FilterReferenceData
}

const ENGLISH_LEVELS = [
  { id: 'high', label: 'Высокий' },
  { id: 'medium', label: 'Средний' },
  { id: 'low', label: 'Низкий' },
]

export function CountriesLanguagesBlock({ filters, update, reference }: BlockProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-ink">Страны и языки</p>
      <MultiSelectDropdown
        label="Страны"
        groups={reference.clusters.map(c => ({ id: c.id, label: c.label, options: c.countries }))}
        selected={filters.countryIds}
        onChange={next => update('countryIds', next as string[])}
      />
      <MultiSelectDropdown
        label="Официальные языки"
        options={reference.languages}
        selected={filters.languageIds}
        onChange={next => update('languageIds', next as number[])}
      />
      <SingleSelectDropdown
        label="Английский"
        options={ENGLISH_LEVELS}
        value={filters.englishLevel}
        onChange={next => update('englishLevel', next)}
      />
    </div>
  )
}

// Полный список реальных значений sea_type — не бинарное "есть вода/нет воды"
const NATURE_OPTIONS = [
  { id: 'sea', label: 'Море' },
  { id: 'ocean', label: 'Океан' },
  { id: 'river', label: 'Река' },
  { id: 'lake', label: 'Озеро' },
  { id: 'mountains', label: 'Горы' },
]

export function ClimateBlock({ filters, update, updateMany, reference }: BlockProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-ink">Климат и природа</p>
      <MultiSelectDropdown
        label="Тип климата"
        options={reference.climateTypes}
        selected={filters.climateTypeIds}
        onChange={next => update('climateTypeIds', next as number[])}
      />
      <MultiSelectDropdown
        label="Природа"
        options={NATURE_OPTIONS}
        selected={filters.nature}
        onChange={next => update('nature', next as string[])}
      />
      <ThresholdSlider
        label="Экология"
        value={filters.ecologyLevel}
        onChange={next => update('ecologyLevel', next)}
        acceptableFrom={35}
        highFrom={60}
      />
      {/* Оба поля меняются ОДНИМ вызовом updateMany — раздельные update() гонялись друг с другом за URL и стирали значения */}
      <TempRangeInput
        label="Температура летом"
        min={filters.tempSummerMin}
        max={filters.tempSummerMax}
        onChange={(min, max) => updateMany({ tempSummerMin: min, tempSummerMax: max })}
      />
      <TempRangeInput
        label="Температура зимой"
        min={filters.tempWinterMin}
        max={filters.tempWinterMax}
        onChange={(min, max) => updateMany({ tempWinterMin: min, tempWinterMax: max })}
      />
    </div>
  )
}

export function PoliticsSafetyBlock({ filters, update, reference }: BlockProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-ink">Политика и безопасность</p>
      <MultiSelectDropdown
        label="Свобода"
        options={reference.freedomStatuses}
        selected={filters.freedomStatusIds}
        onChange={next => update('freedomStatusIds', next as number[])}
      />
      <MultiSelectDropdown
        label="Политический режим"
        options={reference.regimeTypes}
        selected={filters.regimeTypeIds}
        onChange={next => update('regimeTypeIds', next as number[])}
      />
      <ThresholdSlider
        label="Безопасность"
        value={filters.safetyLevel}
        onChange={next => update('safetyLevel', next)}
        acceptableFrom={45}
        highFrom={65}
      />
    </div>
  )
}

const VISA_OPTIONS = [
  { id: 'visa_free', label: 'Безвизовый въезд' },
  { id: 'visa_free_conditional', label: 'Условный безвиз' },
  { id: 'visa_required', label: 'Виза требуется' },
]

const CITIZENSHIP_PILLS: { value: number | null; text: string }[] = [
  { value: null, text: 'Любое' },
  { value: 2, text: 'До 2 лет' },
  { value: 5, text: 'До 5 лет' },
  { value: 10, text: 'До 10 лет' },
  { value: 999, text: 'От 10 лет' },
]

const TAX_OPTIONS = [
  { id: 'none', label: 'Не облагает' },
  { id: 'reduced', label: 'Льготный' },
  { id: 'full', label: 'Полный' },
]

export function LegalizationBlock({ filters, update, reference }: BlockProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-ink">Легализация и гражданство</p>
      <MultiSelectDropdown
        label="Туристическая виза"
        options={VISA_OPTIONS}
        selected={filters.visaTypes}
        onChange={next => update('visaTypes', next as string[])}
      />
      <MultiSelectDropdown
        label="Основание для ВНЖ"
        options={reference.residencyTypes}
        selected={filters.residencyTypeIds}
        onChange={next => update('residencyTypeIds', next as number[])}
      />

      {/* Доход семьи подходит под наш бюджет — закомментировано до реализации логики сравнения
          с min_income_usd_per_adult/min_income_usd_per_child по всем country_residency_options.
          Раскомментировать вместе с подключением этой логики.
      <label className="flex items-center gap-2 my-2 px-3 py-2.5 rounded-lg bg-brand text-white text-sm cursor-pointer select-none">
        <span className="relative flex items-center justify-center w-4 h-4 rounded border border-white shrink-0">
          <input
            type="checkbox"
            checked={filters.incomeFits}
            onChange={e => update('incomeFits', e.target.checked)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          {filters.incomeFits && <Check size={12} className="text-white" strokeWidth={3} />}
        </span>
        Доход семьи подходит под наш бюджет <sup className="text-[10px]">beta</sup>
      </label>
      */}

      <PillsSelect
        label="Гражданство (сроки)"
        value={filters.citizenshipYearsMax}
        onChange={next => update('citizenshipYearsMax', next)}
        options={CITIZENSHIP_PILLS}
      />
      <SingleSelectDropdown
        label="Налоги на удалённый доход"
        options={TAX_OPTIONS}
        value={filters.taxType}
        onChange={next => update('taxType', next)}
      />
    </div>
  )
}

export function HealthcareBlock({ filters, update }: BlockProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-ink">Медицина и образование</p>
      <ThresholdSlider
        label="Уровень медицины"
        value={filters.healthcareLevel}
        onChange={next => update('healthcareLevel', next)}
        acceptableFrom={55}
        highFrom={72}
      />
      <CheckboxRow label="Бесплатная медицина" checked={filters.freeHealthcare} onChange={next => update('freeHealthcare', next)} />
      <CheckboxRow label="Бесплатный сад" checked={filters.freeKindergarten} onChange={next => update('freeKindergarten', next)} />
      <CheckboxRow label="Бесплатная школа" checked={filters.freeSchool} onChange={next => update('freeSchool', next)} />
    </div>
  )
}