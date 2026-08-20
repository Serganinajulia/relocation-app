'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { Users, Home, ChevronDown, Plus, Minus, RotateCcw, X, Smile, Wallet, Pencil, Trash2 } from 'lucide-react'
import { type LifeStyle, type LifestyleOverrides, resolveOverrides } from '@/lib/calc/formulas'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CounterField, ServiceModeField, CheckboxField, LifestyleLevelField, HousingLevelField } from '@/components/filters/CustomLifestyleFields'
import { useLifestyleStore } from '@/lib/store/lifestyleStore'
import { ExtendedFiltersPanel } from '@/components/filters/ExtendedFiltersPanel'
import type { FilterReferenceData } from '@/lib/filters/types'

type AgeGroup = 'baby' | 'toddler' | 'school'

type Traveler = {
  type: 'adult' | 'child'
  citizenship: string
  ageGroup?: AgeGroup
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

const LIFESTYLE_OPTIONS: { value: LifeStyle; label: string }[] = [
  { value: 'economy', label: 'Эконом' },
  { value: 'comfort', label: 'Базовый' },
  { value: 'comfort_plus', label: 'Комфорт+' },
]

type Props = {
  reference: FilterReferenceData
}

export function QuickFilter({ reference }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [budget, setBudget] = useState(searchParams.get('budget') ?? '')
  const [housingType, setHousingType] = useState(searchParams.get('housing_type') ?? 'apartment')
  const [bedrooms, setBedrooms] = useState(searchParams.get('bedrooms') ?? '0')
  const [lifestyle, setLifestyle] = useState<LifeStyle>((searchParams.get('lifestyle') as LifeStyle) ?? 'comfort')
  // Кастомный стиль стейт
  const [customModalOpen, setCustomModalOpen] = useState(false)
  const [draftOverrides, setDraftOverrides] = useState<LifestyleOverrides>({})   // ← эта строка пропала
  const [editingCustomId, setEditingCustomId] = useState<string | null>(null)
  const [namingStep, setNamingStep] = useState(false)
  const [nameInput, setNameInput] = useState('')
  
  const customLifestyles = useLifestyleStore(s => s.customLifestyles)
  const selectedCustomId = useLifestyleStore(s => s.selectedCustomId)
  const addOrUpdateCustomLifestyle = useLifestyleStore(s => s.addOrUpdateCustomLifestyle)
  const removeCustomLifestyle = useLifestyleStore(s => s.removeCustomLifestyle)
  const selectCustom = useLifestyleStore(s => s.selectCustom)

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

  // Desktop dropdown states
  const [travelersOpen, setTravelersOpen] = useState(false)
  const [housingOpen, setHousingOpen] = useState(false)
  const [agePickerOpen, setAgePickerOpen] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Mobile dropdown states (separate)
  const [mobileTravelersOpen, setMobileTravelersOpen] = useState(false)
  const [mobileHousingOpen, setMobileHousingOpen] = useState(false)
  const [mobileAgePickerOpen, setMobileAgePickerOpen] = useState(false)

  // Desktop refs
  const travelersRef = useRef<HTMLDivElement>(null)
  const housingRef = useRef<HTMLDivElement>(null)

  // Mobile refs
  const mobileTravelersRef = useRef<HTMLDivElement>(null)
  const mobileHousingRef = useRef<HTMLDivElement>(null)

  // Mobile local state
  const [mobileTravelers, setMobileTravelers] = useState<Traveler[]>(travelers)
  const [mobileHousingType, setMobileHousingType] = useState(housingType)
  const [mobileBedrooms, setMobileBedrooms] = useState(bedrooms)
  const [mobileLifestyle, setMobileLifestyle] = useState(lifestyle)
  const [mobileBudget, setMobileBudget] = useState(budget)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (travelersRef.current && !travelersRef.current.contains(e.target as Node)) setTravelersOpen(false)
      if (housingRef.current && !housingRef.current.contains(e.target as Node)) setHousingOpen(false)
      if (mobileTravelersRef.current && !mobileTravelersRef.current.contains(e.target as Node)) setMobileTravelersOpen(false)
      if (mobileHousingRef.current && !mobileHousingRef.current.contains(e.target as Node)) setMobileHousingOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

const applyFilter = useCallback((overrides: Partial<{
  budget: string
  housingType: string
  bedrooms: string
  lifestyle?: LifeStyle
  travelers: Traveler[]
}> = {}) => {
  const b = overrides.budget ?? budget
  const ht = overrides.housingType ?? housingType
  const bd = overrides.bedrooms ?? bedrooms
  const tr = overrides.travelers ?? travelers
  const ls = overrides.lifestyle ?? lifestyle

  const params = new URLSearchParams(searchParams.toString())
  const budgetNum = parseInt(b)
  if (!isNaN(budgetNum) && budgetNum > 0) params.set('budget', String(budgetNum))
  else params.delete('budget')
  params.set('housing_type', ht)
  params.set('bedrooms', bd)
  params.set('lifestyle', ls)
  const citizenships = [...new Set(tr.map(t => t.citizenship))]
  params.set('citizenships', citizenships.join(','))
  params.set('adults', String(tr.filter(t => t.type === 'adult').length))
  const childrenList = tr.filter(t => t.type === 'child')
  params.set('children', String(childrenList.length))
  params.set('has_baby', String(childrenList.some(c => c.ageGroup === 'baby')))
  params.set('kids_in_kindergarten', String(childrenList.filter(c => c.ageGroup === 'toddler').length))
  params.set('kids_in_school', String(childrenList.filter(c => c.ageGroup === 'school').length))
  router.replace(`/?${params.toString()}`)
}, [budget, housingType, bedrooms, travelers, lifestyle, router, searchParams])

  // Desktop handlers
  function addTraveler(type: 'adult' | 'child') {
    if (type === 'adult') {
      const next = [...travelers, { type: 'adult' as const, citizenship: 'RU' }]
      setTravelers(next)
      applyFilter({ travelers: next })
    } else {
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

  function openCustomLifestyleModal() {
    setDraftOverrides({})
    setEditingCustomId(null)
    setNameInput('')
    setCustomModalOpen(true)
  }

  function selectCustomLifestyle(id: string) {
    selectCustom(id)
  }
  
  function openEditCustomLifestyle(id: string) {
    const cl = customLifestyles.find(c => c.id === id)
    if (!cl) return
    setDraftOverrides(cl.values)
    setEditingCustomId(id)
    setNameInput(cl.name)
    setCustomModalOpen(true)
  }
  
  function requestDeleteCustomLifestyle(id: string) {
    if (!window.confirm('Удалить этот стиль жизни? Это действие необратимо.')) return
    removeCustomLifestyle(id)
  }

  function saveCustomLifestyle(name: string) {
    const trimmedName = name.trim().slice(0, 16)
    if (!trimmedName) return

    const newCustom = {
      id: editingCustomId ?? crypto.randomUUID(),
      name: trimmedName,
      values: effective,
    }

    addOrUpdateCustomLifestyle(newCustom)
    selectCustom(newCustom.id)

    setCustomModalOpen(false)
    setNamingStep(false)
    setNameInput('')
    setDraftOverrides({})
    setEditingCustomId(null)
  }

  function handleReset() {
    setBudget('')
    setHousingType('apartment')
    setBedrooms('0')
    setTravelers([{ type: 'adult', citizenship: 'RU' }])
    setLifestyle('comfort')
    router.replace('/')
  }

  // Mobile handlers
  function applyMobileFilter() {
    setTravelers(mobileTravelers)
    setHousingType(mobileHousingType)
    setBedrooms(mobileBedrooms)
    setLifestyle(mobileLifestyle)
    setBudget(mobileBudget)
    applyFilter({
      travelers: mobileTravelers,
      housingType: mobileHousingType,
      bedrooms: mobileBedrooms,
      lifestyle: mobileLifestyle,
      budget: mobileBudget,
    })
  }

  function resetMobileFilter() {
    const defaultTravelers: Traveler[] = [{ type: 'adult', citizenship: 'RU' }]
    const defaultHousingType = 'apartment'
    const defaultBedrooms = '0'
    const defaultLifestyle = 'comfort'
    const defaultBudget = ''
  
    setMobileTravelers(defaultTravelers)
    setMobileHousingType(defaultHousingType)
    setMobileBedrooms(defaultBedrooms)
    setMobileLifestyle(defaultLifestyle)
    setMobileBudget(defaultBudget)
  
    setTravelers(defaultTravelers)
    setHousingType(defaultHousingType)
    setBedrooms(defaultBedrooms)
    setLifestyle(defaultLifestyle)
    setBudget(defaultBudget)
  
    applyFilter({
      travelers: defaultTravelers,
      housingType: defaultHousingType,
      bedrooms: defaultBedrooms,
      lifestyle: defaultLifestyle,
      budget: defaultBudget,
    })
  }

  function travelersLabel() {
    const adults = travelers.filter(t => t.type === 'adult')
    const children = travelers.filter(t => t.type === 'child')
    const parts = []
    if (adults.length) {
      const flags = adults.map(t => CITIZENSHIPS.find(c => c.value === t.citizenship)?.flag ?? '').join(' ')
      parts.push(`${adults.length} взр. ${flags}`)
    }
    if (children.length) parts.push(`${children.length} реб.`)
    return parts.join(' · ')
  }

  function housingLabel() {
    const type = HOUSING_TYPES.find(h => h.value === housingType)?.label ?? ''
    const opts = housingType === 'house' ? BEDROOM_OPTIONS_HOUSE : BEDROOM_OPTIONS_APARTMENT
    const bed = opts.find(b => b.value === bedrooms)?.label ?? ''
    return `${type} · ${bed}`
  }
  const adultsCount = travelers.filter(t => t.type === 'adult').length
  const childrenCount = travelers.filter(t => t.type === 'child').length
  const hasChildren = childrenCount > 0
  const effective = resolveOverrides(lifestyle, adultsCount, childrenCount, draftOverrides)
  const pillBase = 'flex items-center gap-1.5 px-3 h-9 rounded-full text-sm border transition-all cursor-pointer select-none whitespace-nowrap bg-white'
  const pillFilled = `${pillBase} border-brand text-ink hover:bg-porcelain`
  const pillDefault = `${pillBase} border-border text-ink hover:border-brand hover:text-brand`
  const pillActive = `${pillBase} border-brand text-brand bg-positive-bg`
  const bedroomOptions = housingType === 'house' ? BEDROOM_OPTIONS_HOUSE : BEDROOM_OPTIONS_APARTMENT

  return (
    <div className="bg-white border-b border-border">

      {/* ===== ДЕСКТОП (xl+) ===== */}
      <div className="hidden xl:block">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-end gap-3">

            {/* Релоканты */}
            <div className="flex flex-col gap-1" ref={travelersRef}>
              <span className="text-xs text-steel">Кто переезжает:</span>
              <div className="relative">
                <button onClick={() => setTravelersOpen(p => !p)} className={pillFilled}>
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
                          <button onClick={() => removeTraveler(i)} disabled={travelers.length === 1} className="text-steel hover:text-warning disabled:opacity-30 transition-colors">
                            <Minus size={14} />
                          </button>
                        </div>
                      ))}
                      {agePickerOpen && (
                        <div className="mt-2 pt-2 border-t border-border">
                          <p className="text-xs text-steel mb-2">Возраст ребёнка:</p>
                          <div className="flex flex-col gap-1">
                            {AGE_GROUPS.map(ag => (
                              <button key={ag.value} onClick={() => selectAgeGroup(ag.value)} className="text-left px-3 h-8 rounded-lg text-sm border border-border text-ink hover:border-brand hover:text-brand transition-all">
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

            {/* Жильё */}
            <div className="flex flex-col gap-1" ref={housingRef}>
              <span className="text-xs text-steel">Тип жилья:</span>
              <div className="relative">
                <button onClick={() => setHousingOpen(p => !p)} className={pillFilled}>
                  <Home size={14} className="text-brand shrink-0" />
                  <span>{housingLabel()}</span>
                  <ChevronDown size={13} className={`text-steel transition-transform ${housingOpen ? 'rotate-180' : ''}`} />
                </button>
                {housingOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-border rounded-xl shadow-lg p-3 z-50 min-w-[280px]">
                    <p className="text-xs text-steel mb-2">Тип жилья</p>
                    <div className="flex gap-2 mb-3">
                      {HOUSING_TYPES.map(h => (
                        <button key={h.value} onClick={() => handleHousingType(h.value)} className={`flex-1 h-8 rounded-lg text-sm border transition-all ${housingType === h.value ? 'bg-brand border-brand text-white' : 'border-border text-ink hover:border-brand hover:text-brand'}`}>
                          {h.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-steel mb-2">Спальни</p>
                    <div className="flex gap-2">
                      {bedroomOptions.map(b => (
                        <button key={b.value} onClick={() => handleBedroomsChange(b.value)} className={`flex-1 h-8 rounded-lg text-sm border transition-all ${bedrooms === b.value ? 'bg-brand border-brand text-white' : 'border-border text-ink hover:border-brand hover:text-brand'}`}>
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

          {/* Стиль жизни */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-steel">Стиль жизни:</span>
            <div className="flex items-center gap-2">
              <div className="flex gap-1 p-1 border border-brand rounded-full">
                  {LIFESTYLE_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => { setLifestyle(opt.value); selectCustom(null); applyFilter({ lifestyle: opt.value }) }} className={`px-3 h-7 rounded-full cursor-pointer text-sm transition-all whitespace-nowrap ${!selectedCustomId && lifestyle === opt.value ? 'bg-brand hover:bg-positive text-white font-medium' : 'text-steel hover:text-ink'}`}>
                      {opt.label}
                    </button>
                  ))}
                 {customLifestyles.map(cl => (
                  <div key={cl.id} className="relative group">
                    <button
                      onClick={() => selectCustomLifestyle(cl.id)}
                      className={`px-3 h-7 rounded-full cursor-pointer text-sm transition-all whitespace-nowrap ${selectedCustomId === cl.id ? 'bg-brand text-white hover:bg-positive font-medium' : 'hover:text-ink'}`}
                    >
                      {cl.name}
                    </button>
                    <div className="absolute -top-1.5 -right-1.5 hidden group-hover:flex gap-0.5 z-10">
                      <button
                        onClick={(e) => { e.stopPropagation(); openEditCustomLifestyle(cl.id) }}
                        className="w-4 h-4 flex items-center justify-center rounded-full bg-white border border-border text-steel hover:text-brand hover:border-brand transition-colors"
                      >
                        <Pencil size={9} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); requestDeleteCustomLifestyle(cl.id) }}
                        className="w-4 h-4 flex items-center justify-center rounded-full bg-white border border-border text-steel hover:text-warning hover:border-warning transition-colors"
                      >
                        <Trash2 size={9} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={openCustomLifestyleModal}
                className="flex items-center gap-1 px-3 h-9 hover:bg-porcelain cursor-pointer rounded-full text-sm border border-dashed border-brand text-brand hover:border-brand hover:text-brand transition-all whitespace-nowrap"
              >
                <Plus size={13} />
                Свой стиль <sup className="text-[10px]">beta</sup>
              </button>
            </div>
          </div>

            <div className="h-9 w-px bg-border self-end shrink-0" />

          {/* Бюджет */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-steel">Ежемесячный бюджет:</span>
            <div className={`${pillFilled} gap-1.5`}>
            <button
              onClick={() => {
                const newVal = String(Math.max(0, (parseInt(budget) || 0) - 50))
                setBudget(newVal)
                applyFilter({ budget: newVal })
              }}
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
                onBlur={() => applyFilter({ budget })}
                className="w-16 text-sm font-medium text-ink outline-none text-center bg-transparent"
              />
              <span className="text-steel text-sm shrink-0">$/мес</span>
              <button
                onClick={() => {
                  const newVal = String(Math.min(20000, (parseInt(budget) || 0) + 50))
                  setBudget(newVal)
                  applyFilter({ budget: newVal })
                }}
                className="text-steel hover:text-brand transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

            {/* Сброс */}
            <div className="flex flex-col gap-1 ml-auto">
              <span className="text-xs text-steel opacity-0 pointer-events-none">-</span>
              <button onClick={handleReset} className="flex items-center gap-1.5 h-9 px-4 rounded-full border border-border text-sm text-steel hover:text-warning hover:border-warning transition-colors whitespace-nowrap">
                <RotateCcw size={13} />
                Сбросить
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ===== МОБИЛКА / ПЛАНШЕТ / MD-ДИАПАЗОН (до xl) ===== */}
      <div className="xl:hidden flex flex-col gap-3 bg-porcelain px-5 py-5">
        <div className="container flex flex-col gap-3 mx-auto bg-white rounded-2xl px-10 py-10 shadow-sm">
          {/* Кто переезжает */}
          <div ref={mobileTravelersRef}>
            <button
              onClick={() => setMobileTravelersOpen(p => !p)}
              className="flex items-center justify-between w-full px-4 py-3.5 bg-white border border-border rounded-2xl hover:border-brand transition-colors"
            >
              <div className="flex items-center gap-2"> 
                <Users size={14} className="text-brand shrink-0" />
                <span className="text-sm text-steel">
                 Кто переезжает
                </span>              
              </div>

              <span className="text-sm font-medium text-ink">
                {mobileTravelers.filter(t => t.type === 'adult').length} взр.
                {mobileTravelers.filter(t => t.type === 'child').length > 0 && ` · ${mobileTravelers.filter(t => t.type === 'child').length} реб.`}
                {' '}{[...new Set(mobileTravelers.map(t => CITIZENSHIPS.find(c => c.value === t.citizenship)?.flag ?? ''))].join(' ')}
              </span>
            </button>

            {mobileTravelersOpen && (
              <div className="mt-2 bg-white border border-border rounded-2xl p-4">
                <div className="flex flex-col gap-2">
                  {mobileTravelers.map((t, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs text-steel w-20 shrink-0">
                        {t.type === 'adult' ? 'Взр.' : AGE_GROUPS.find(a => a.value === t.ageGroup)?.label ?? 'Реб.'}
                      </span>
                      <select
                        value={t.citizenship}
                        onChange={e => setMobileTravelers(prev => prev.map((tr, idx) => idx === i ? { ...tr, citizenship: e.target.value } : tr))}
                        className="flex-1 h-8 px-2 rounded-lg border border-border text-xs text-ink outline-none focus:border-brand"
                      >
                        {CITIZENSHIPS.map(c => (
                          <option key={c.value} value={c.value}>{c.flag} {c.label}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          if (mobileTravelers.length === 1) return
                          setMobileTravelers(prev => prev.filter((_, idx) => idx !== i))
                        }}
                        disabled={mobileTravelers.length === 1}
                        className="text-steel hover:text-warning disabled:opacity-30 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                    </div>
                  ))}
                  {mobileAgePickerOpen && (
                    <div className="mt-2 pt-2 border-t border-border">
                      <p className="text-xs text-steel mb-2">Возраст ребёнка:</p>
                      <div className="flex flex-col gap-1">
                        {AGE_GROUPS.map(ag => (
                          <button
                            key={ag.value}
                            onClick={() => {
                              setMobileTravelers(prev => [...prev, { type: 'child' as const, citizenship: 'RU', ageGroup: ag.value }])
                              setMobileAgePickerOpen(false)
                            }}
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
                  <button onClick={() => setMobileTravelers(prev => [...prev, { type: 'adult' as const, citizenship: 'RU' }])} className="flex items-center gap-1 text-xs text-brand hover:text-positive transition-colors">
                    <Plus size={12} /> Взрослый
                  </button>
                  <button onClick={() => setMobileAgePickerOpen(true)} className="flex items-center gap-1 text-xs text-brand hover:text-positive transition-colors">
                    <Plus size={12} /> Ребёнок
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Тип жилья */}
          <div ref={mobileHousingRef}>
            <button
              onClick={() => setMobileHousingOpen(p => !p)}
              className="flex items-center justify-between w-full px-4 py-3.5 bg-white border border-border rounded-2xl hover:border-brand transition-colors"
            >
              <div className="flex items-center gap-2"> 
                <Home size={14} className="text-brand shrink-0" />
                <span className="text-sm text-steel">
                  Тип жилья
                </span>
              </div>
              <span className="text-sm font-medium text-ink">
                {HOUSING_TYPES.find(h => h.value === mobileHousingType)?.label}
                {' · '}
                {(mobileHousingType === 'house' ? BEDROOM_OPTIONS_HOUSE : BEDROOM_OPTIONS_APARTMENT).find(b => b.value === mobileBedrooms)?.label}
              </span>
            </button>

            {mobileHousingOpen && (
              <div className="mt-2 bg-white border border-border rounded-2xl p-4">
                <p className="text-xs text-steel mb-2">Тип жилья</p>
                <div className="flex gap-2 mb-3">
                  {HOUSING_TYPES.map(h => (
                    <button
                      key={h.value}
                      onClick={() => {
                        setMobileHousingType(h.value)
                        if (h.value === 'house' && mobileBedrooms === '0') setMobileBedrooms('1')
                      }}
                      className={`flex-1 h-9 rounded-xl text-sm border transition-all ${mobileHousingType === h.value ? 'bg-brand border-brand text-white' : 'border-border text-ink hover:border-brand hover:text-brand'}`}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-steel mb-2">Спальни</p>
                <div className="flex gap-2">
                  {(mobileHousingType === 'house' ? BEDROOM_OPTIONS_HOUSE : BEDROOM_OPTIONS_APARTMENT).map(b => (
                    <button
                      key={b.value}
                      onClick={() => setMobileBedrooms(b.value)}
                      className={`flex-1 h-9 rounded-xl text-sm border transition-all ${mobileBedrooms === b.value ? 'bg-brand border-brand text-white' : 'border-border text-ink hover:border-brand hover:text-brand'}`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Стиль жизни */}
          <div className="flex items-center justify-between bg-white">
            <div className="flex px-4 items-center gap-2">
              <Smile size={14} className="text-brand shrink-0" />
              <span className="text-sm text-steel shrink-0">Стиль жизни</span>
            </div>
            <div className="flex gap-1 p-1.5 border border-brand rounded-2xl">
            {LIFESTYLE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setMobileLifestyle(opt.value); selectCustom(null) }}
                  className={`px-3 h-9 rounded-full text-sm cursor-pointer transition-all whitespace-nowrap ${!selectedCustomId && mobileLifestyle === opt.value ? 'bg-brand text-white font-medium' : ' hover:text-ink'}`}
                >
                  {opt.label}
                </button>
              ))}
              {customLifestyles.map(cl => (
                <div key={cl.id} className="relative group">
                  <button
                    onClick={() => selectCustomLifestyle(cl.id)}
                    className={`px-3 h-7 rounded-full cursor-pointer text-sm transition-all whitespace-nowrap ${selectedCustomId === cl.id ? 'bg-brand text-white hover:bg-positive font-medium' : ' hover:text-ink'}`}
                  >
                    {cl.name}
                  </button>
                  <div className="absolute -top-1.5 -right-1.5 hidden group-hover:flex gap-0.5 z-10">
                    <button
                      onClick={(e) => { e.stopPropagation(); openEditCustomLifestyle(cl.id) }}
                      className="w-4 h-4 flex items-center justify-center rounded-full bg-white border border-border text-steel hover:text-brand hover:border-brand transition-colors"
                    >
                      <Pencil size={9} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); requestDeleteCustomLifestyle(cl.id) }}
                      className="w-4 h-4 flex items-center justify-center rounded-full bg-white border border-border text-steel hover:text-warning hover:border-warning transition-colors"
                    >
                      <Trash2 size={9} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={openCustomLifestyleModal}
            className="flex items-center justify-center gap-1 h-11 cursor-pointer rounded-2xl text-sm border border-dashed border-brand text-brand hover:bg-porcelain transition-all"
          >
            <Plus size={14} />
            Задай свой стиль <sup className="text-[10px]">beta</sup>
          </button>

          {/* Бюджет */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-white border border-border rounded-2xl">
            <div className="flex items-center gap-2">
              <Wallet size={14} className="text-brand shrink-0" />
              <span className="text-sm text-steel">Бюджет</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setMobileBudget(v => String(Math.max(0, (parseInt(v) || 0) - 50)))}
                className="hover:text-brand transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className=" text-sm text-steel shrink-0">до</span>
              <input
                type="text"
                value={mobileBudget}
                onChange={e => {
                  const val = e.target.value.replace(/[^0-9]/g, '')
                  setMobileBudget(val)
                }}
                className="w-14 text-sm font-medium text-ink outline-none text-center bg-transparent"
              />
              <span className="text-sm shrink-0 text-steel">$/мес</span>
              <button
                onClick={() => setMobileBudget(v => String(Math.min(20000, (parseInt(v) || 0) + 50)))}
                className="hover:text-brand transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Расширенные фильтры */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="w-full h-11 rounded-2xl border border-border bg-white text-sm text-steel hover:border-brand hover:text-brand transition-colors"
          >
            Расширенные фильтры
          </button>

          {/* Очистить + Применить */}
          <div className="flex items-center gap-2">
            <button onClick={resetMobileFilter} className="flex-1 flex items-center justify-center gap-2 h-11 rounded-2xl border border-border bg-white text-sm text-steel hover:border-warning hover:text-warning transition-colors">
              <RotateCcw size={14} />
              <span>Очистить</span>
            </button>
            <button onClick={applyMobileFilter} className="flex-1 flex items-center justify-center gap-2 h-11 rounded-2xl bg-brand text-white text-sm font-medium hover:bg-positive transition-colors">
              Применить
            </button>
          </div>
        </div>
      </div>

      {/* Модалка расширенных фильтров — центрированная карточка с максимальной шириной (под мобильный
          размер), не растягивается на всю ширину на md/sm экранах, затемнённый фон вокруг */}
      {mobileFiltersOpen && (
        <div
          className="fixed inset-0 bg-ink/40 z-50 flex items-center justify-center p-4"
          onClick={() => setMobileFiltersOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
              <h2 className="text-lg font-semibold text-ink">Фильтры</h2>
              <button onClick={() => setMobileFiltersOpen(false)} className="text-steel hover:text-ink transition-colors">
                <X size={22} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <ExtendedFiltersPanel reference={reference} />
            </div>
            <div className="flex gap-3 p-6 border-t border-border shrink-0">
              <button onClick={() => { handleReset(); setMobileFiltersOpen(false) }} className="flex-1 h-11 rounded-xl border border-border text-sm text-steel hover:border-warning hover:text-warning transition-colors">
                Сбросить
              </button>
              <button onClick={() => setMobileFiltersOpen(false)} className="flex-1 h-11 rounded-xl bg-brand text-white text-sm font-medium hover:bg-positive transition-colors">
                Применить
              </button>
            </div>
          </div>
        </div>
      )}
{/* Модал "Задать свой стиль жизни" */}
  <Dialog open={customModalOpen} onOpenChange={setCustomModalOpen}>
    <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto ">
      <DialogHeader>
        <DialogTitle>Задать свой стиль жизни</DialogTitle>
      </DialogHeader>
      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

          <HousingLevelField
            label="Уровень жилья"
            description="Влияет на аренду и коммуналку"
            value={effective.housingLevel}
            onChange={(next) => setDraftOverrides(prev => ({ ...prev, housingLevel: next }))}
          />

          <LifestyleLevelField
            label="Продуктовая корзина"
            value={effective.groceriesLevel}
            onChange={(next) => setDraftOverrides(prev => ({ ...prev, groceriesLevel: next }))}
          />

          <CheckboxField
            label="Домашний интернет"
            checked={effective.hasHomeInternet}
            onChange={(next) => setDraftOverrides(prev => ({ ...prev, hasHomeInternet: next }))}
          />

          <CounterField
            label="Мобильная связь"
            description="Тарифов на семью"
            value={effective.mobilePlansCount}
            onChange={(next) => setDraftOverrides(prev => ({ ...prev, mobilePlansCount: next }))}
          />

          <CounterField
            label="Проездной (транспорт)"
            description="Количество проездных билетов"
            value={effective.transportPassesCount}
            onChange={(next) => setDraftOverrides(prev => ({ ...prev, transportPassesCount: next }))}
          />

          <CounterField
            label="Разовые поездки"
            description="Поездок в месяц без проездного"
            value={effective.transportSingleTicketsCount}
            onChange={(next) => setDraftOverrides(prev => ({ ...prev, transportSingleTicketsCount: next }))}
          />

          <CounterField
            label="Такси"
            description="Поездок в месяц на всю семью"
            value={effective.taxiRidesPerMonth}
            onChange={(next) => setDraftOverrides(prev => ({ ...prev, taxiRidesPerMonth: next }))}
          />

          <CounterField
            label="Кафе и доставка"
            description="Визитов в месяц на всю семью"
            value={effective.cafeVisitsPerMonth}
            onChange={(next) => setDraftOverrides(prev => ({ ...prev, cafeVisitsPerMonth: next }))}
          />

          <CounterField
            label="Бьюти-услуги"
            description="Процедур в месяц"
            value={effective.beautyProceduresPerMonth}
            onChange={(next) => setDraftOverrides(prev => ({ ...prev, beautyProceduresPerMonth: next }))}
          />

          <CounterField
            label="Фитнес"
            description="Абонементов на семью"
            value={effective.fitnessMembershipsCount}
            onChange={(next) => setDraftOverrides(prev => ({ ...prev, fitnessMembershipsCount: next }))}
          />

          <CounterField
            label="Коворкинг"
            description="Мест в месяц"
            value={effective.coworkingSeatsCount}
            onChange={(next) => setDraftOverrides(prev => ({ ...prev, coworkingSeatsCount: next }))}
          />


        {hasChildren && (
          <>
              <CounterField
                label="Кружки и секции"
                description="Количество на всех детей"
                value={effective.clubsCount}
                onChange={(next) => setDraftOverrides(prev => ({ ...prev, clubsCount: next }))}
              />

            <ServiceModeField
              label="Детский сад"
              value={effective.kindergartenMode}
              onChange={(next) => setDraftOverrides(prev => ({ ...prev, kindergartenMode: next }))}
            />

            <ServiceModeField
              label="Школа"
              value={effective.schoolMode}
              onChange={(next) => setDraftOverrides(prev => ({ ...prev, schoolMode: next }))}
            />
          </>
        )}

        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
          <ServiceModeField
            label="Медицинская страховка"
            value={effective.insuranceMode}
            onChange={(next) => setDraftOverrides(prev => ({ ...prev, insuranceMode: next }))}
          />

          {effective.insuranceMode !== 'none' && (
            <CounterField
              label="Количество страховых полисов"
              description="На всех членов семьи"
              value={effective.insuranceCount}
              onChange={(next) => setDraftOverrides(prev => ({ ...prev, insuranceCount: next }))}
            />
          )}
        </div>

        </div>
        {editingCustomId ? (
          <button
            onClick={() => saveCustomLifestyle(nameInput)}
            className="w-full h-11 mt-4 rounded-xl bg-brand hover:bg-positive text-white text-sm font-medium transition-colors"
          >
            Сохранить изменения
          </button>
        ) : (
          <button
            onClick={() => setNamingStep(true)}
            className="w-full h-11 mt-4 rounded-xl bg-brand hover:bg-positive text-white text-sm font-medium transition-colors"
          >
            Создать стиль
          </button>
        )}
        {namingStep && (
          <div
            className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-lg"
            onClick={() => setNamingStep(false)}
          >
            <div
              className="bg-white border border-border rounded-2xl shadow-lg p-5 w-[320px]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-ink">Введите своё название стиля</p>
                <button onClick={() => setNamingStep(false)} className="text-steel hover:text-ink transition-colors">
                  <X size={18} />
                </button>
              </div>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                maxLength={16}
                placeholder="Например: Мой стиль"
                className="w-full h-10 px-3 rounded-lg border border-border text-sm text-ink outline-none focus:border-brand mb-4"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setNamingStep(false)}
                  className="flex-1 h-10 rounded-lg border border-border text-sm text-steel hover:border-warning hover:text-warning transition-colors"
                >
                  Отменить
                </button>
                <button
                  onClick={() => saveCustomLifestyle(nameInput)}
                  disabled={!nameInput.trim()}
                  className="flex-1 h-10 rounded-lg bg-brand hover:bg-positive text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Готово
                </button>
              </div>
            </div>
          </div>
        )}  
      </div>
    </DialogContent>
  </Dialog>
</div>

  )
}