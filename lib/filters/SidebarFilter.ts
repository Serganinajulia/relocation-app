'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SlidersHorizontal, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { ExtendedFilters, FilterReferenceData, EMPTY_EXTENDED_FILTERS } from '@/lib/filters/types'
import { parseExtendedFilters, EXTENDED_FILTER_PARAM_KEYS, serializeExtendedFilterValue, isFilterActive } from '@/lib/filters/urlParams'
import {
  CountriesLanguagesBlock,
  ClimateBlock,
  PoliticsSafetyBlock,
  LegalizationBlock,
  HealthcareBlock,
} from '@/components/filters/ExtendedFilterBlocks'

type Props = {
  reference: FilterReferenceData
  onCollapsedChange?: (collapsed: boolean) => void
}

type Pill = { text: string; clear: () => Partial<ExtendedFilters> }

// Плоский список выбранных значений для зоны "Выбрано" наверху фильтра
function buildSelectedPills(filters: ExtendedFilters, reference: FilterReferenceData): Pill[] {
  const pills: Pill[] = []
  const allCountries = reference.clusters.flatMap(c => c.countries)

  filters.countryIds.forEach(id => {
    const country = allCountries.find(c => c.id === id)
    if (country) pills.push({ text: country.label, clear: () => ({ countryIds: filters.countryIds.filter(v => v !== id) }) })
  })
  filters.languageIds.forEach(id => {
    const lang = reference.languages.find(l => l.id === id)
    if (lang) pills.push({ text: lang.label, clear: () => ({ languageIds: filters.languageIds.filter(v => v !== id) }) })
  })
  if (filters.englishLevel) {
    const labels: Record<string, string> = { high: 'Высокий', medium: 'Средний', low: 'Низкий' }
    pills.push({ text: `Английский: ${labels[filters.englishLevel] ?? filters.englishLevel}`, clear: () => ({ englishLevel: null }) })
  }
  filters.climateTypeIds.forEach(id => {
    const c = reference.climateTypes.find(c => c.id === id)
    if (c) pills.push({ text: c.label, clear: () => ({ climateTypeIds: filters.climateTypeIds.filter(v => v !== id) }) })
  })
  filters.nature.forEach(n => pills.push({ text: n === 'sea' ? 'Море' : 'Горы', clear: () => ({ nature: filters.nature.filter(v => v !== n) }) }))
  if (filters.ecologyLevel !== null) pills.push({ text: `Экология: от ${filters.ecologyLevel}`, clear: () => ({ ecologyLevel: null }) })
  if (filters.tempSummerMin !== null || filters.tempSummerMax !== null) {
    pills.push({ text: `Лето ${filters.tempSummerMin ?? '…'}–${filters.tempSummerMax ?? '…'}°`, clear: () => ({ tempSummerMin: null, tempSummerMax: null }) })
  }
  if (filters.tempWinterMin !== null || filters.tempWinterMax !== null) {
    pills.push({ text: `Зима ${filters.tempWinterMin ?? '…'}–${filters.tempWinterMax ?? '…'}°`, clear: () => ({ tempWinterMin: null, tempWinterMax: null }) })
  }
  filters.freedomStatusIds.forEach(id => {
    const f = reference.freedomStatuses.find(f => f.id === id)
    if (f) pills.push({ text: f.label, clear: () => ({ freedomStatusIds: filters.freedomStatusIds.filter(v => v !== id) }) })
  })
  filters.regimeTypeIds.forEach(id => {
    const r = reference.regimeTypes.find(r => r.id === id)
    if (r) pills.push({ text: r.label, clear: () => ({ regimeTypeIds: filters.regimeTypeIds.filter(v => v !== id) }) })
  })
  if (filters.safetyLevel !== null) pills.push({ text: `Безопасность: от ${filters.safetyLevel}`, clear: () => ({ safetyLevel: null }) })
  filters.visaTypes.forEach(v => pills.push({ text: v, clear: () => ({ visaTypes: filters.visaTypes.filter(x => x !== v) }) }))
  filters.residencyTypeIds.forEach(id => {
    const r = reference.residencyTypes.find(r => r.id === id)
    if (r) pills.push({ text: r.label, clear: () => ({ residencyTypeIds: filters.residencyTypeIds.filter(v => v !== id) }) })
  })
  if (filters.incomeFits) pills.push({ text: 'Доход подходит', clear: () => ({ incomeFits: false }) })
  if (filters.citizenshipYearsMax !== null) pills.push({ text: `Гражданство до ${filters.citizenshipYearsMax} лет`, clear: () => ({ citizenshipYearsMax: null }) })
  if (filters.taxType) {
    const labels: Record<string, string> = { none: 'не облагает', reduced: 'льготный', full: 'полный' }
    pills.push({ text: `Налоги: ${labels[filters.taxType] ?? filters.taxType}`, clear: () => ({ taxType: null }) })
  }
  if (filters.healthcareLevel !== null) pills.push({ text: `Медицина: от ${filters.healthcareLevel}`, clear: () => ({ healthcareLevel: null }) })
  if (filters.freeHealthcare) pills.push({ text: 'Бесплатная медицина', clear: () => ({ freeHealthcare: false }) })
  if (filters.freeKindergarten) pills.push({ text: 'Бесплатный сад', clear: () => ({ freeKindergarten: false }) })
  if (filters.freeSchool) pills.push({ text: 'Бесплатная школа', clear: () => ({ freeSchool: false }) })

  return pills
}

export function SidebarFilter({ reference, onCollapsedChange }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [collapsed, setCollapsed] = useState(false)

  const filters = parseExtendedFilters(searchParams)

  function applyPartial(partial: Partial<ExtendedFilters>) {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(partial).forEach(([key, value]) => {
      const paramKey = EXTENDED_FILTER_PARAM_KEYS[key as keyof ExtendedFilters]
      const serialized = serializeExtendedFilterValue(value)
      if (serialized === null) params.delete(paramKey)
      else params.set(paramKey, serialized)
    })
    router.replace(`/?${params.toString()}`)
  }

  function update<K extends keyof ExtendedFilters>(key: K, value: ExtendedFilters[K]) {
    applyPartial({ [key]: value } as Partial<ExtendedFilters>)
  }

  function resetAll() {
    const params = new URLSearchParams(searchParams.toString())
    Object.values(EXTENDED_FILTER_PARAM_KEYS).forEach(paramKey => params.delete(paramKey))
    router.replace(`/?${params.toString()}`)
  }

  function toggle() {
    const next = !collapsed
    setCollapsed(next)
    onCollapsedChange?.(next)
  }

  if (collapsed) {
    return (
      <div className="flex flex-col items-center pt-4">
        <button onClick={toggle} className="p-2 rounded-lg hover:bg-porcelain text-steel hover:text-ink transition-colors" title="Развернуть фильтры">
          <ChevronRight size={20} />
        </button>
      </div>
    )
  }

  const activeCount = (Object.keys(EMPTY_EXTENDED_FILTERS) as (keyof ExtendedFilters)[])
    .filter(key => isFilterActive(filters[key])).length
  const pills = buildSelectedPills(filters, reference)

  return (
    <aside className="bg-card border border-border rounded-xl p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-ink font-semibold">
          <SlidersHorizontal size={18} className="text-brand" />
          Фильтры {activeCount > 0 && <span className="text-xs text-brand font-normal">({activeCount})</span>}
        </div>
        <button onClick={toggle} className="p-1.5 rounded-lg hover:bg-porcelain text-steel hover:text-ink transition-colors" title="Свернуть фильтры">
          <ChevronLeft size={18} />
        </button>
      </div>

      {pills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pb-3 border-b border-border">
          {pills.map((pill, i) => (
            <button
              key={i}
              onClick={() => applyPartial(pill.clear())}
              className="flex items-center gap-1 px-2.5 h-7 rounded-full text-xs bg-positive-bg text-brand border border-brand/30 hover:bg-porcelain transition-colors"
            >
              {pill.text}
              <X size={11} />
            </button>
          ))}
          <button onClick={resetAll} className="text-xs text-steel hover:text-warning px-2 transition-colors">
            Сбросить всё
          </button>
        </div>
      )}

      <div className="flex flex-col gap-4 [&>*:not(:first-child)]:pt-4 [&>*:not(:first-child)]:border-t [&>*:not(:first-child)]:border-border">
        <CountriesLanguagesBlock filters={filters} update={update} updateMany={applyPartial} reference={reference} />
        <ClimateBlock filters={filters} update={update} updateMany={applyPartial} reference={reference} />
        <PoliticsSafetyBlock filters={filters} update={update} updateMany={applyPartial} reference={reference} />
        <LegalizationBlock filters={filters} update={update} updateMany={applyPartial} reference={reference} />
        <HealthcareBlock filters={filters} update={update} updateMany={applyPartial} reference={reference} />
      </div>
    </aside>
  )
}