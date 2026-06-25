'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { SidebarFilter } from '@/components/filters/SidebarFilter'
import { CityCard } from '@/components/city/CityCard'

type Props = {
  cities: any[]
}

export function CityGrid({ cities }: Props) {
  const [filterCollapsed, setFilterCollapsed] = useState(false)
  const searchParams = useSearchParams()

  const housingType = searchParams.get('housing_type') ?? 'apartment'
  const bedrooms = searchParams.get('bedrooms') ? parseInt(searchParams.get('bedrooms')!) : null
  const adults = parseInt(searchParams.get('adults') ?? '1')
  const children = parseInt(searchParams.get('children') ?? '0')
  const lifestyle = (searchParams.get('lifestyle') ?? 'comfort') as 'economy' | 'comfort' | 'comfort_plus'
  const hasBaby = searchParams.get('has_baby') === 'true'
  const kidsInKindergarten = parseInt(searchParams.get('kids_in_kindergarten') ?? '0')
  const kidsInSchool = parseInt(searchParams.get('kids_in_school') ?? '0')
  
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
        {cities.map((city) => (
          <CityCard
          key={city.id}
          city={city}
          housingType={housingType}
          bedrooms={bedrooms}
          adults={adults}
          children={children}
          lifestyle={lifestyle}
          hasBaby={hasBaby}
          kidsInKindergarten={kidsInKindergarten}
          kidsInSchool={kidsInSchool}
        />
        ))}
      </div>

    </div>
  )
}