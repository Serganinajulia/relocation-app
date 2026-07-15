'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { SidebarFilter } from '@/components/filters/SidebarFilter'
import { CityCard } from '@/components/city/CityCard'
import { getCityCalcResult } from '@/lib/calc/getCityCalcResult'
import { useLifestyleStore } from '@/lib/store/lifestyleStore'

type Props = {
  cities: any[]
}

export function CityGrid({ cities }: Props) {
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

  const budgetParam = searchParams.get('budget')
  const budget = budgetParam ? parseInt(budgetParam) : null

  // Если выбран кастомный стиль — используем его values как оверрайды и нейтральный
  // 'comfort' как lifestyle-заглушку (она ни на что не влияет, т.к. все поля уже заполнены).
  // Если кастомный не выбран — обычный системный пресет из URL, без оверрайдов.
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

  // Считаем результат один раз на город — используется и для фильтрации, и для отображения
  const citiesWithResult = cities.map(city => ({
    city,
    result: getCityCalcResult(city, calcParams),
  }))

  // Отсев по бюджету: город скрывается, если бюджет введён и не хватает даже на выбранный стиль.
  // Города без результата расчёта (null) тоже скрываются — см. getCityCalcResult.
  const visibleCities = citiesWithResult.filter(({ result }) => {
    if (!result) return false
    if (budget === null) return true
    return budget >= result.total
  })

  return (
    <div className="flex gap-6 items-start">

      {/* Боковой фильтр — только на xl+ */}
      <div className={`hidden xl:block shrink-0 transition-all duration-300 ${
        filterCollapsed ? 'w-12' : 'w-[280px]'
      }`}>
        <SidebarFilter onCollapsedChange={setFilterCollapsed} />
      </div>

      {/* Карточки */}
      <div className={`flex-1 grid gap-4 grid-cols-1 lg:grid-cols-2 ${
        filterCollapsed ? 'xl:grid-cols-3' : 'xl:grid-cols-2'
      }`}>
        {visibleCities.map(({ city, result }) => (
          <CityCard
            key={city.id}
            city={city}
            result={result}
            budget={budget}
          />
        ))}
      </div>

    </div>
  )
}