'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { SidebarFilter } from '@/components/filters/SidebarFilter'
import { CityCard } from '@/components/city/CityCard'
import { getCityCalcResult } from '@/lib/calc/getCityCalcResult'
import { useLifestyleStore } from '@/lib/store/lifestyleStore'
import { parseExtendedFilters } from '@/lib/filters/urlParams'
import { matchesExtendedFilters, getCountryPolitics } from '@/lib/filters/cityFilters'
import { FilterReferenceData } from '@/lib/filters/types'
import { CatalogToolbar } from '@/components/city/CatalogToolbar'

type Props = {
  cities: any[]
  reference: FilterReferenceData
}

export function CityGrid({ cities, reference }: Props) {
  const [filterCollapsed, setFilterCollapsed] = useState(false)
  const searchParams = useSearchParams()

  const selectedCustomId = useLifestyleStore(s => s.selectedCustomId)
  const customLifestyles = useLifestyleStore(s => s.customLifestyles)
  const selectedCustom = selectedCustomId
    ? customLifestyles.find(c => c.id === selectedCustomId)
    : null

  const housingType = searchParams.get('housing_type') ?? 'apartment'
  const bedrooms = searchParams.get('bedrooms') ? parseInt(searchParams.get('bedrooms')!) : null
  const adults = parseInt(searchParams.get('adults') ?? '1')
  const children = parseInt(searchParams.get('children') ?? '0')
  const lifestyleParam = (searchParams.get('lifestyle') ?? 'comfort') as 'economy' | 'comfort' | 'comfort_plus'
  const hasBaby = searchParams.get('has_baby') === 'true'
  const kidsInKindergarten = parseInt(searchParams.get('kids_in_kindergarten') ?? '0')
  const kidsInSchool = parseInt(searchParams.get('kids_in_school') ?? '0')
  const travelerCitizenships = (searchParams.get('citizenships') ?? 'RU').split(',')

  const budgetParam = searchParams.get('budget')
  const budget = budgetParam ? parseInt(budgetParam) : null
  const searchQuery = (searchParams.get('q') ?? '').trim().toLowerCase()

  const extendedFilters = parseExtendedFilters(searchParams)

  const calcParams = {
    housingType,
    bedrooms,
    adults,
    children,
    lifestyle: selectedCustom ? ('comfort' as const) : lifestyleParam,
    hasBaby,
    kidsInKindergarten,
    kidsInSchool,
    overrides: selectedCustom?.values,
  }

  const citiesWithResult = cities.map(city => ({
    city,
    result: getCityCalcResult(city, calcParams),
  }))

  // Два независимых прохода: бюджет (расчётный) и расширенный фильтр (по полям города/страны)
  const visibleCities = citiesWithResult.filter(({ city, result }) => {
    if (!result) return false
    if (searchQuery && !(city.name_i18n?.ru ?? '').toLowerCase().includes(searchQuery)) return false
    if (budget !== null && budget < result.total) return false
    if (!matchesExtendedFilters(city, extendedFilters, travelerCitizenships)) return false
    return true
  })

  // Третий проход — сортировка. 'popularity' (дефолт) не трогает порядок, пришедший из БД.
  const sort = searchParams.get('sort') ?? 'popularity'
  const dir = searchParams.get('dir') === 'desc' ? -1 : 1
  const sortedCities = [...visibleCities].sort((a, b) => {
    switch (sort) {
      case 'budget':
        return dir * ((a.result?.total ?? 0) - (b.result?.total ?? 0))
      case 'rent': {
        const rentA = a.result ? (a.result.rentMin + a.result.rentMax) / 2 : 0
        const rentB = b.result ? (b.result.rentMin + b.result.rentMax) / 2 : 0
        return dir * (rentA - rentB)
      }
      case 'safety':
        return dir * ((a.city.safety_index ?? 0) - (b.city.safety_index ?? 0))
      case 'freedom':
        return dir * ((getCountryPolitics(a.city.countries)?.fh_score ?? 0) - (getCountryPolitics(b.city.countries)?.fh_score ?? 0))
      default:
        return 0
    }
  })

  return (
    <div className="flex gap-6 items-start">

      {/* Боковой фильтр — только на xl+ */}
      <div className={`hidden xl:block shrink-0 transition-all duration-300 ${
        filterCollapsed ? 'w-12' : 'w-[280px]'
      }`}>
        <SidebarFilter reference={reference} onCollapsedChange={setFilterCollapsed} />
      </div>

      {/* Карточки */}
      <div className="flex-1">
        <CatalogToolbar count={sortedCities.length} />
        <div className={`grid gap-4 grid-cols-1 lg:grid-cols-2 ${
          filterCollapsed ? 'xl:grid-cols-3' : 'xl:grid-cols-2'
        }`}>
          {sortedCities.map(({ city, result }) => (
            <CityCard
              key={city.id}
              city={city}
              result={result}
              budget={budget}
            />
          ))}
        </div>
      </div>

    </div>
  )
}