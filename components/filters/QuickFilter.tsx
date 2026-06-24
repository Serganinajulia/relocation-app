'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { Users, Home, Leaf, Stamp, ChevronDown, Plus, Minus, RotateCcw } from 'lucide-react'

type AgeGroup = 'baby' | 'toddler' | 'school'

type Traveler = {
  type: 'adult' | 'child'
  citizenship: string
  ageGroup?: AgeGroup  // только для детей
}

const AGE_GROUPS: { value: AgeGroup; label: string }[] = [
  { value: 'baby', label: 'До 2 лет' },
  { value: 'toddler', label: '2–6 лет' },
  { value: 'school', label: '7–18 лет' },
]

const CITIZENSHIPS = [
  { value: 'RU', label: 'Россия', flag: '🇷🇺' },
  { value: 'BY', label: 'Беларусь', flag: '🇧🇾' },
  { value: 'UA', label: 'Украина', flag: '🇺🇦' },
]

const CLIMATE_OPTIONS = [
  { value: 'eternal_summer', label: 'Вечное лето' },
  { value: 'mild', label: 'Мягкий климат' },
  { value: 'sea', label: 'Море' },
  { value: 'ocean', label: 'Океан' },
  { value: 'mountains', label: 'Горы' },
]

const CONDITIONS_OPTIONS = [
  { value: 'visa_free', label: 'Безвизовый въезд' },
  { value: 'vnj', label: 'ВНЖ для удалёнщиков' },
  { value: 'citizenship5', label: 'Гражданство до 5 лет' },
]

const HOUSING_TYPES = [
  { value: 'apartment', label: 'Квартира' },
  { value: 'house', label: 'Дом' },
]

const BEDROOM_OPTIONS_APARTMENT = [
  { value: '0', label: 'Студия' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
]

const BEDROOM_OPTIONS_HOUSE = [
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
]
const LIFESTYLE_OPTIONS = [
  { value: 'economy', label: 'Эконом' },
  { value: 'comfort', label: 'Базовый' },
  { value: 'comfort_plus', label: 'Комфорт+' },
]

export function QuickFilter() {
  const router = useRouter()

  const searchParams = useSearchParams()

  const [budget, setBudget] = useState(searchParams.get('budget') ?? '1000')
  const [housingType, setHousingType] = useState(searchParams.get('housing_type') ?? 'apartment')
  const [bedrooms, setBedrooms] = useState(searchParams.get('bedrooms') ?? '0')
  const [climateSelected, setClimateSelected] = useState<string[]>(
    searchParams.get('climate')?.split(',').filter(Boolean) ?? []
  )
  const [conditionsSelected, setConditionsSelected] = useState<string[]>([])
  const [lifestyle, setLifestyle] = useState(
    searchParams.get('lifestyle') ?? 'comfort'
  )
  const [travelers, setTravelers] = useState<Traveler[]>(() => {
    const adults = parseInt(searchParams.get('adults') ?? '1')
    const children = parseInt(searchParams.get('children') ?? '0')
    const citizenships = searchParams.get('citizenships')?.split(',') ?? ['RU']
    const result: Traveler[] = []
    for (let i = 0; i < adults; i++) {
      result.push({ type: 'adult', citizenship: citizenships[i] ?? 'RU' })
    }
    for (let i = 0; i < children; i++) {
      result.push({ type: 'child', citizenship: citizenships[adults + i] ?? 'RU' })
    }
    return result
  })

  const [travelersOpen, setTravelersOpen] = useState(false)
  const [housingOpen, setHousingOpen] = useState(false)
  const [climateOpen, setClimateOpen] = useState(false)
  const [conditionsOpen, setConditionsOpen] = useState(false)
  const [agePickerOpen, setAgePickerOpen] = useState(false)

  const travelersRef = useRef<HTMLDivElement>(null)
  const housingRef = useRef<HTMLDivElement>(null)
  const climateRef = useRef<HTMLDivElement>(null)
  const conditionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (travelersRef.current && !travelersRef.current.contains(e.target as Node)) setTravelersOpen(false)
      if (housingRef.current && !housingRef.current.contains(e.target as Node)) setHousingOpen(false)
      if (climateRef.current && !climateRef.current.contains(e.target as Node)) setClimateOpen(false)
      if (conditionsRef.current && !conditionsRef.current.contains(e.target as Node)) setConditionsOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const applyFilter = useCallback((overrides: Partial<{
    budget: string
    housingType: string
    bedrooms: string
    climateSelected: string[]
    conditionsSelected: string[]
    lifestyle?: string
    travelers: Traveler[]
  }> = {}) => {
    const b = overrides.budget ?? budget
    const ht = overrides.housingType ?? housingType
    const bd = overrides.bedrooms ?? bedrooms
    const cl = overrides.climateSelected ?? climateSelected
    const cond = overrides.conditionsSelected ?? conditionsSelected
    const tr = overrides.travelers ?? travelers
    const ls = overrides.lifestyle ?? lifestyle

    const params = new URLSearchParams()
    const budgetNum = parseInt(b)
    if (!isNaN(budgetNum) && budgetNum > 0) params.set('budget', String(budgetNum))
    params.set('housing_type', ht)
    params.set('bedrooms', bd)
    params.set('lifestyle', ls)
    if (cl.length) params.set('climate', cl.join(','))
    cond.forEach(c => params.set(c, '1'))
    const citizenships = [...new Set(tr.map(t => t.citizenship))]
    params.set('citizenships', citizenships.join(','))
    params.set('adults', String(tr.filter(t => t.type === 'adult').length))

    const childrenList = tr.filter(t => t.type === 'child')
    params.set('children', String(childrenList.length))
    params.set('has_baby', String(childrenList.some(c => c.ageGroup === 'baby')))
    params.set('kids_in_kindergarten', String(childrenList.filter(c => c.ageGroup === 'toddler').length))
    params.set('kids_in_school', String(childrenList.filter(c => c.ageGroup === 'school').length))

    router.replace(`/?${params.toString()}`)
  }, [budget, housingType, bedrooms, climateSelected, conditionsSelected, travelers, router])

  function addTraveler(type: 'adult' | 'child') {
    if (type === 'adult') {
      const next = [...travelers, { type: 'adult', citizenship: 'RU' }]
      setTravelers(next)
      applyFilter({ travelers: next })
    } else {
      // для ребёнка сначала открываем выбор возраста
      setAgePickerOpen(true)
    }
  }
  
  function selectAgeGroup(ageGroup: AgeGroup) {
    const next = [...travelers, { type: 'child' as const, citizenship: 'RU', ageGroup }]
    setTravelers(next)
    setAgePickerOpen(false)
    applyFilter({ travelers: next })
  }

  function removeTraveler(index: number) {
    if (travelers.length === 1) return
    const next = travelers.filter((_, i) => i !== index)
    setTravelers(next)
    applyFilter({ travelers: next })
  }

  function updateCitizenship(index: number, citizenship: string) {
    const next = travelers.map((t, i) => i === index ? { ...t, citizenship } : t)
    setTravelers(next)
    applyFilter({ travelers: next })
  }

  function toggleClimate(value: string) {
    const next = climateSelected.includes(value)
      ? climateSelected.filter(v => v !== value)
      : [...climateSelected, value]
    setClimateSelected(next)
    applyFilter({ climateSelected: next })
  }

  function toggleCondition(value: string) {
    const next = conditionsSelected.includes(value)
      ? conditionsSelected.filter(v => v !== value)
      : [...conditionsSelected, value]
    setConditionsSelected(next)
    applyFilter({ conditionsSelected: next })
  }

  function handleHousingType(type: string) {
    const newBedrooms = type === 'house' && bedrooms === '0' ? '1' : bedrooms
    setHousingType(type)
    if (type === 'house' && bedrooms === '0') setBedrooms('1')
    applyFilter({ housingType: type, bedrooms: newBedrooms })
  }

  function handleBedroomsChange(value: string) {
    setBedrooms(value)
    applyFilter({ bedrooms: value })
  }

  function handleBudgetChange(value: string) {
    setBudget(value)
  }

  function handleBudgetBlur() {
    applyFilter({ budget })
  }

  function handleBudgetStep(delta: number) {
    const next = String(Math.min(20000, Math.max(0, (parseInt(budget) || 0) + delta)))
    setBudget(next)
    applyFilter({ budget: next })
  }
  function handleReset() {
    setBudget('1000')
    setHousingType('apartment')
    setBedrooms('0')
    setClimateSelected([])
    setConditionsSelected([])
    setTravelers([{ type: 'adult', citizenship: 'RU' }])
    setLifestyle('comfort')
    router.replace('/')
  }
  function travelersLabel() {
    const adults = travelers.filter(t => t.type === 'adult')
    const children = travelers.filter(t => t.type === 'child')
    const parts = []
    if (adults.length) {
      const flags = adults.map(t => CITIZENSHIPS.find(c => c.value === t.citizenship)?.flag ?? '').join(' ')
      parts.push(`${adults.length} взр. ${flags}`)
    }
    if (children.length) {
      parts.push(`${children.length} реб.`)
    }
    return parts.join(' · ')
  }

  function housingLabel() {
    const type = HOUSING_TYPES.find(h => h.value === housingType)?.label ?? ''
    const opts = housingType === 'house' ? BEDROOM_OPTIONS_HOUSE : BEDROOM_OPTIONS_APARTMENT
    const bed = opts.find(b => b.value === bedrooms)?.label ?? ''
    return `${type} · ${bed}`
  }

  const pillBase = 'flex items-center gap-1.5 px-3 h-9 rounded-full text-sm border transition-all cursor-pointer select-none whitespace-nowrap bg-white'
  const pillFilled = `${pillBase} border-brand text-ink hover:bg-porcelain`
  const pillDefault = `${pillBase} border-border text-ink hover:border-brand hover:text-brand`
  const pillActive = `${pillBase} border-brand text-brand bg-positive-bg`

  const bedroomOptions = housingType === 'house' ? BEDROOM_OPTIONS_HOUSE : BEDROOM_OPTIONS_APARTMENT

  return (
    <div className="bg-white border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="hidden sm:flex flex-wrap items-end gap-3">

          {/* Блок 1 — Релоканты */}
          <div className="flex flex-col gap-1" ref={travelersRef}>
            <span className="text-xs text-steel">Кто переезжает:</span>
            <div className="relative">
              <button
                onClick={() => setTravelersOpen(p => !p)}
                className={pillFilled}
              >
                <Users size={14} className="text-brand shrink-0" />
                <span>{travelersLabel()}</span>
                <ChevronDown size={13} className={`text-steel transition-transform ${travelersOpen ? 'rotate-180' : ''}`} />
              </button>
              {travelersOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-border rounded-xl shadow-lg p-3 z-50 min-w-[240px]">
                  <div className="flex flex-col gap-2">
                  {travelers.map((t, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs text-steel w-20 shrink-0">
                        {t.type === 'adult' ? 'Взр.' : AGE_GROUPS.find(a => a.value === t.ageGroup)?.label ?? 'Реб.'}
                      </span>
                      <select
                        value={t.citizenship}
                        onChange={e => updateCitizenship(i, e.target.value)}
                        className="flex-1 h-8 px-2 rounded-lg border border-border text-xs text-ink outline-none focus:border-brand"
                      >
                        {CITIZENSHIPS.map(c => (
                          <option key={c.value} value={c.value}>{c.flag} {c.label}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => removeTraveler(i)}
                        disabled={travelers.length === 1}
                        className="text-steel hover:text-warning disabled:opacity-30 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                    </div>
                  ))}

                  {/* Выбор возраста */}
                  {agePickerOpen && (
                    <div className="mt-2 pt-2 border-t border-border">
                      <p className="text-xs text-steel mb-2">Возраст ребёнка:</p>
                      <div className="flex flex-col gap-1">
                        {AGE_GROUPS.map(ag => (
                          <button
                            key={ag.value}
                            onClick={() => selectAgeGroup(ag.value)}
                            className="text-left px-3 h-8 rounded-lg text-sm border border-border text-ink hover:border-brand hover:text-brand transition-all"
                          >
                            {ag.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  </div>
                  <div className="flex gap-3 mt-3 pt-3 border-t border-border">
                    <button onClick={() => addTraveler('adult')} className="flex items-center gap-1 text-xs text-brand hover:text-positive transition-colors">
                      <Plus size={12} /> Взрослый
                    </button>
                    <button onClick={() => addTraveler('child')} className="flex items-center gap-1 text-xs text-brand hover:text-positive transition-colors">
                      <Plus size={12} /> Ребёнок
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Блок 3 — Жильё */}
          <div className="flex flex-col gap-1" ref={housingRef}>
            <span className="text-xs text-steel">Тип жилья:</span>
            <div className="relative">
              <button
                onClick={() => setHousingOpen(p => !p)}
                className={pillFilled}
              >
                <Home size={14} className="text-brand shrink-0" />
                <span>{housingLabel()}</span>
                <ChevronDown size={13} className={`text-steel transition-transform ${housingOpen ? 'rotate-180' : ''}`} />
              </button>
              {housingOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-border rounded-xl shadow-lg p-3 z-50 min-w-[280px]">
                  <p className="text-xs text-steel mb-2">Тип жилья</p>
                  <div className="flex gap-2 mb-3">
                    {HOUSING_TYPES.map(h => (
                      <button
                        key={h.value}
                        onClick={() => handleHousingType(h.value)}
                        className={`flex-1 h-8 rounded-lg text-sm border transition-all ${
                          housingType === h.value
                            ? 'bg-brand border-brand text-white'
                            : 'border-border text-ink hover:border-brand hover:text-brand'
                        }`}
                      >
                        {h.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-steel mb-2">Спальни</p>
                  <div className="flex gap-2">
                    {bedroomOptions.map(b => (
                      <button
                        key={b.value}
                        onClick={() => handleBedroomsChange(b.value)}
                        className={`flex-1 h-8 rounded-lg text-sm border transition-all ${
                          bedrooms === b.value
                            ? 'bg-brand border-brand text-white'
                            : 'border-border text-ink hover:border-brand hover:text-brand'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Блок 2 — Стиль жизни */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-steel">Стиль жизни:</span>
            <div className="flex gap-1 p-1 border border-brand rounded-full">
              {LIFESTYLE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setLifestyle(opt.value)
                    applyFilter({ lifestyle: opt.value })
                  }}
                  className={`px-3 h-7 rounded-full text-sm transition-all whitespace-nowrap ${
                    lifestyle === opt.value
                      ? 'bg-brand hover:bg-positive text-white font-medium'
                      : 'text-steel hover:text-ink'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {/* Разделитель */}
          <div className="h-9 w-px bg-border self-end shrink-0" />

          {/* Блок 4 — Климат */}
          <div className="flex flex-col gap-1" ref={climateRef}>
            <span className="text-xs text-steel opacity-0 pointer-events-none">-</span>
            <div className="relative">
              <button
                onClick={() => setClimateOpen(p => !p)}
                className={climateSelected.length > 0 ? pillActive : pillDefault}
              >
                <Leaf size={14} className={climateSelected.length > 0 ? 'text-brand' : 'text-steel'} />
                Климат и природа
                {climateSelected.length > 0 && (
                  <span className="bg-brand text-white text-xs px-1.5 py-0.5 rounded-full leading-none">
                    {climateSelected.length}
                  </span>
                )}
                <ChevronDown size={13} className={`text-steel transition-transform ${climateOpen ? 'rotate-180' : ''}`} />
              </button>
              {climateOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-border rounded-xl shadow-lg p-3 z-50 min-w-[220px]">
                  <div className="flex flex-wrap gap-2">
                    {CLIMATE_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => toggleClimate(opt.value)}
                        className={`px-3 h-8 rounded-full text-sm border transition-all ${
                          climateSelected.includes(opt.value)
                            ? 'bg-brand border-brand text-white'
                            : 'border-border text-ink hover:border-brand hover:text-brand'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Блок 5 — Легализация */}
          <div className="flex flex-col gap-1" ref={conditionsRef}>
            <span className="text-xs text-steel opacity-0 pointer-events-none">-</span>
            <div className="relative">
              <button
                onClick={() => setConditionsOpen(p => !p)}
                className={conditionsSelected.length > 0 ? pillActive : pillDefault}
              >
                <Stamp size={14} className={conditionsSelected.length > 0 ? 'text-brand' : 'text-steel'} />
                Легализация
                {conditionsSelected.length > 0 && (
                  <span className="bg-brand text-white text-xs px-1.5 py-0.5 rounded-full leading-none">
                    {conditionsSelected.length}
                  </span>
                )}
                <ChevronDown size={13} className={`text-steel transition-transform ${conditionsOpen ? 'rotate-180' : ''}`} />
              </button>
              {conditionsOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-border rounded-xl shadow-lg p-3 z-50 min-w-[240px]">
                  <div className="flex flex-wrap gap-2">
                    {CONDITIONS_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => toggleCondition(opt.value)}
                        className={`px-3 h-8 rounded-full text-sm border transition-all ${
                          conditionsSelected.includes(opt.value)
                            ? 'bg-brand border-brand text-white'
                            : 'border-border text-ink hover:border-brand hover:text-brand'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Сброс */}
            <div className="flex flex-col gap-1 lg:ml-auto">
              <span className="text-xs text-steel opacity-0 pointer-events-none">-</span>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 h-9 px-4 rounded-full border border-border text-sm text-steel hover:text-warning hover:border-warning transition-colors whitespace-nowrap"
              >
                <RotateCcw size={13} />
                Сбросить
              </button>
            </div>
        </div>
        <div className="hidden sm:flex flex-wrap items-end gap-3">
          {/* Блок 2 — Бюджет 
          <div className="flex flex-col gap-1">
            <span className="text-xs text-steel">Ваш бюджет на всех:</span>
            <div className={`${pillFilled} gap-1.5`}>
              <button
                onClick={() => handleBudgetStep(-50)}
                className="text-steel hover:text-brand transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="text-steel text-sm shrink-0">до</span>
              <input
                type="text"
                value={budget}
                onChange={e => handleBudgetChange(e.target.value.replace(/[^0-9]/g, ''))}
                onBlur={handleBudgetBlur}
                className="w-16 text-sm font-medium text-ink outline-none text-center bg-transparent"
                placeholder="1000"
              />
              <span className="text-steel text-sm shrink-0">$/мес</span>
              <button
                onClick={() => handleBudgetStep(50)}
                className="text-steel hover:text-brand transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>*/}
        </div>
      </div>
    </div>
  )
}