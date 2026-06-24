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

  return (
    <div className="flex gap-6 items-start">
      <div className={`shrink-0 transition-all duration-300 ${
        filterCollapsed ? 'w-12' : 'w-[280px]'
      }`}>
        <SidebarFilter onCollapsedChange={setFilterCollapsed} />
      </div>

      <div className={`flex-1 grid gap-4 ${
        filterCollapsed
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          : 'grid-cols-1 md:grid-cols-2'
      }`}>
        {cities.map((city) => (
          <CityCard
            key={city.id}
            city={city}
            housingType={housingType}
            bedrooms={bedrooms}
            adults={adults}
            children={children}
          />
        ))}
      </div>
    </div>
  )
}