'use client'

import { useState } from 'react'
import { SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'

type Props = {
  onCollapsedChange?: (collapsed: boolean) => void
}

export function SidebarFilter({ onCollapsedChange }: Props) {
  const [collapsed, setCollapsed] = useState(false)

  function toggle() {
    const next = !collapsed
    setCollapsed(next)
    onCollapsedChange?.(next)
  }

  if (collapsed) {
    return (
      <div className="flex flex-col items-center pt-4">
        <button
          onClick={toggle}
          className="p-2 rounded-lg hover:bg-porcelain text-steel hover:text-ink transition-colors"
          title="Развернуть фильтры"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    )
  }

  return (
    <aside className="bg-card border border-border rounded-xl p-4 flex flex-col gap-4">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-ink font-semibold">
          <SlidersHorizontal size={18} className="text-brand" />
          Фильтры
        </div>
        <button
          onClick={toggle}
          className="p-1.5 rounded-lg hover:bg-porcelain text-steel hover:text-ink transition-colors"
          title="Свернуть фильтры"
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* Заглушка — секции фильтров появятся позже */}
      <div className="text-sm text-steel text-center py-8 border border-dashed border-border rounded-lg">
        Фильтры появятся здесь
      </div>
    </aside>
  )
}