'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'
import { ExtendedFilters, FilterReferenceData, EMPTY_EXTENDED_FILTERS } from '@/lib/filters/types'
import { parseExtendedFilters, isFilterActive } from '@/lib/filters/urlParams'
import { ExtendedFiltersPanel } from '@/components/filters/ExtendedFiltersPanel'

type Props = {
  reference: FilterReferenceData
  onCollapsedChange?: (collapsed: boolean) => void
}

// Тонкая обёртка для десктопа: сворачивание/разворачивание + заголовок со счётчиком активных
// фильтров. Само тело фильтра (пилюли + блоки) — в ExtendedFiltersPanel, переиспользуется
// и здесь, и в полноэкранной модалке QuickFilter для узких экранов.
export function SidebarFilter({ reference, onCollapsedChange }: Props) {
  const searchParams = useSearchParams()
  const [collapsed, setCollapsed] = useState(false)

  const filters = parseExtendedFilters(searchParams)
  const activeCount = (Object.keys(EMPTY_EXTENDED_FILTERS) as (keyof ExtendedFilters)[])
    .filter(key => isFilterActive(filters[key])).length

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

      <ExtendedFiltersPanel reference={reference} />
    </aside>
  )
}