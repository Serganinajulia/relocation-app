'use client'

import { useState } from 'react'
import { SidebarFilter } from '@/components/filters/SidebarFilter'
import { CityCard } from '@/components/city/CityCard'

type Props = {
  cities: any[]
}

export function CityGrid({ cities }: Props) {
  const [filterCollapsed, setFilterCollapsed] = useState(false)

  return (
    <div className="flex gap-6 items-start">

      {/* Левая панель — фильтр */}
      <div className={`shrink-0 transition-all duration-300 ${
        filterCollapsed ? 'w-12' : 'w-[280px]'
      }`}>
        <SidebarFilter onCollapsedChange={setFilterCollapsed} />
      </div>

      {/* Правая зона — карточки */}
      <div className={`flex-1 grid gap-4 ${
        filterCollapsed
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          : 'grid-cols-1 md:grid-cols-2'
      }`}>
        {cities.map((city) => (
          <CityCard key={city.id} city={city} />
        ))}
      </div>

    </div>
  )
}