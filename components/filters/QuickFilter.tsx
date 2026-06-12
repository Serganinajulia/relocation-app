'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Home, Leaf, Stamp, Search, ChevronDown, Plus, Minus } from 'lucide-react'

type Traveler = {
  type: 'adult' | 'child'
  citizenship: string
}

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

export function QuickFilter() {
  const router = useRouter()

  const [budget, setBudget] = useState('1000')
  const [travelers, setTravelers] = useState<Traveler[]>([{ type: 'adult', citizenship: 'RU' }])
  const [housingType, setHousingType] = useState('apartment')
  const [bedrooms, setBedrooms] = useState('1')
  const [climateSelected, setClimateSelected] = useState<string[]>([])
  const [conditionsSelected, setConditionsSelected] = useState<string[]>([])

  const [travelersOpen, setTravelersOpen] = useState(false)
  const [housingOpen, setHousingOpen] = useState(false)
  const [climateOpen, setClimateOpen] = useState(false)
  const [conditionsOpen, setConditionsOpen] = useState(false)

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

  function addTraveler(type: 'adult' | 'child') {
    setTravelers(prev => [...prev, { type, citizenship: 'RU' }])
  }

  function removeTraveler(index: number) {
    if (travelers.length === 1) return
    setTravelers(prev => prev.filter((_, i) => i !== index))
  }

  function updateCitizenship(index: number, citizenship: string) {
    setTravelers(prev => prev.map((t, i) => i === index ? { ...t, citizenship } : t))
  }

  function toggleClimate(value: string) {
    setClimateSelected(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    )
  }

  function toggleCondition(value: string) {
    setConditionsSelected(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    )
  }

  function handleHousingType(type: string) {
    setHousingType(type)
    if (type === 'house' && bedrooms === '0') setBedrooms('1')
  }

  function handleApply() {
    const params = new URLSearchParams()
    const budgetNum = parseInt(budget)
    if (!isNaN(budgetNum) && budgetNum > 0) params.set('budget', String(budgetNum))
    params.set('housing_type', housingType)
    params.set('bedrooms', bedrooms)
    if (climateSelected.length) params.set('climate', climateSelected.join(','))
    conditionsSelected.forEach(c => params.set(c, '1'))
    const citizenships = [...new Set(travelers.map(t => t.citizenship))]
    params.set('citizenships', citizenships.join(','))
    params.set('adults', String(travelers.filter(t => t.type === 'adult').length))
    params.set('children', String(travelers.filter(t => t.type === 'child').length))
    router.push(`/?${params.toString()}`)
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
      const flags = children.map(t => CITIZENSHIPS.find(c => c.value === t.citizenship)?.flag ?? '').join(' ')
      parts.push(`${children.length} реб. ${flags}`)
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
                        <span className="text-xs text-steel w-12 shrink-0">
                          {t.type === 'adult' ? 'Взр.' : 'Реб.'}
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
  
          {/* Блок 2 — Бюджет */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-steel">Ваш бюджет на всех:</span>
            <div className={`${pillFilled} gap-1.5`}>
              <button
                onClick={() => setBudget(v => String(Math.max(0, (parseInt(v) || 0) - 50)))}
                className="text-steel hover:text-brand transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="text-steel text-sm shrink-0">до</span>
              <input
                type="text"
                value={budget}
                onChange={e => {
                  const val = e.target.value.replace(/[^0-9]/g, '')
                  setBudget(val)
                }}
                className="w-16 text-sm font-medium text-ink outline-none text-center bg-transparent"
                placeholder="1000"
              />
              <span className="text-steel text-sm shrink-0">$/мес</span>
              <button
                onClick={() => setBudget(v => String(Math.min(20000, (parseInt(v) || 0) + 50)))}
                className="text-steel hover:text-brand transition-colors"
              >
                <Plus size={14} />
              </button>
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
                        onClick={() => setBedrooms(b.value)}
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
  
          {/* Кнопка Найти — ml-auto прижимает вправо, при переносе встаёт слева */}
          <div className="flex flex-col gap-1 lg:ml-auto">
            <span className="text-xs text-steel opacity-0 pointer-events-none">-</span>
            <button
              onClick={handleApply}
              className="flex items-center gap-2 h-9 px-5 rounded-full bg-ink text-white text-sm font-medium hover:bg-ink/80 transition-colors whitespace-nowrap"
            >
              <Search size={14} />
              Найти
            </button>
          </div>
  
        </div>
      </div>
    </div>
  )}