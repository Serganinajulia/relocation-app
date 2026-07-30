'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronDown, ArrowUpDown } from 'lucide-react'

// "Арендная плата" уже есть (через rentMin/rentMax), "Качество жизни" пока не включена — открытый
// продуктовый вопрос (см. EXTENDED_FILTER_SPEC.md, нет решения по составу и весам агрегата)
const SORT_OPTIONS = [
  { value: 'popularity', label: 'По умолчанию' },
  { value: 'budget', label: 'Бюджет в месяц' },
  { value: 'rent', label: 'Арендная плата' },
  { value: 'safety', label: 'Безопасность' },
  { value: 'freedom', label: 'Свобода' },
]

// Разумное направление по умолчанию при переключении на поле: для денег — дешевле сначала,
// для качественных показателей — выше сначала
const DEFAULT_DIR: Record<string, 'asc' | 'desc'> = {
  budget: 'asc',
  rent: 'asc',
  safety: 'desc',
  freedom: 'desc',
}

export function CatalogToolbar({ count }: { count: number }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sort = searchParams.get('sort') ?? 'popularity'
  const dir = (searchParams.get('dir') as 'asc' | 'desc') ?? (DEFAULT_DIR[sort] ?? 'asc')

  function handleFieldChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'popularity') {
      params.delete('sort')
      params.delete('dir')
    } else {
      params.set('sort', value)
      params.set('dir', DEFAULT_DIR[value] ?? 'asc')
    }
    router.replace(`/?${params.toString()}`, { scroll: false })
  }

  function toggleDirection() {
    const params = new URLSearchParams(searchParams.toString())
    params.set('dir', dir === 'asc' ? 'desc' : 'asc')
    router.replace(`/?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex items-center justify-between mb-4">
      <p className="text-sm text-steel">
        Подходящих городов: <span className="text-ink font-medium">{count}</span>
      </p>
      <div className="flex items-center gap-2">
        <span className="text-sm text-steel shrink-0">Сортировка:</span>
        <div className="relative flex items-center">
          <select
            value={sort}
            onChange={e => handleFieldChange(e.target.value)}
            className="h-9 pl-3 pr-8 rounded-lg border border-border text-sm text-ink outline-none focus:border-brand bg-white appearance-none"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 pointer-events-none text-steel" />
        </div>
        {sort !== 'popularity' && (
          <button
            onClick={toggleDirection}
            title={dir === 'asc' ? 'По возрастанию' : 'По убыванию'}
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-border text-steel hover:border-brand hover:text-brand transition-colors"
          >
            {dir === 'asc' ? <ArrowUpDown size={15} /> : <ArrowUpDown size={15} className="scale-y-[-1]" />}
          </button>
        )}
      </div>
    </div>
  )
}