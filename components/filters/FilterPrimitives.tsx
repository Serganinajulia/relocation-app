'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

type Option = { id: number | string; label: string }

export function MultiSelectDropdown({
  label,
  options,
  groups,
  selected,
  onChange,
}: {
  label: string
  options?: Option[]
  groups?: { id: number; label: string; options: Option[] }[]
  selected: (number | string)[]
  onChange: (next: (number | string)[]) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function toggle(id: number | string) {
    onChange(selected.includes(id) ? selected.filter(v => v !== id) : [...selected, id])
  }

  const summary = selected.length ? `${label} (${selected.length})` : label

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(p => !p)}
        className={`flex items-center justify-between w-full h-9 px-3 rounded-lg border text-sm transition-colors ${
          selected.length ? 'border-brand text-ink' : 'border-border text-steel'
        } hover:border-brand`}
      >
        <span className="truncate">{summary}</span>
        <ChevronDown size={14} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-full max-h-64 overflow-y-auto bg-white border border-border rounded-lg shadow-lg p-2 z-50">
          {groups
            ? groups.map(g => (
                <div key={g.id} className="mb-2 last:mb-0">
                  <p className="text-xs text-steel font-medium px-2 py-1">{g.label}</p>
                  {g.options.map(opt => (
                    <label key={opt.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-porcelain cursor-pointer text-sm text-ink">
                      <input type="checkbox" checked={selected.includes(opt.id)} onChange={() => toggle(opt.id)} className="accent-brand" />
                      {opt.label}
                    </label>
                  ))}
                </div>
              ))
            : (options ?? []).map(opt => (
                <label key={opt.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-porcelain cursor-pointer text-sm text-ink">
                  <input type="checkbox" checked={selected.includes(opt.id)} onChange={() => toggle(opt.id)} className="accent-brand" />
                  {opt.label}
                </label>
              ))}
        </div>
      )}
    </div>
  )
}

export function SingleSelectDropdown({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { id: string; label: string }[]
  value: string | null
  onChange: (next: string | null) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const current = options.find(o => o.id === value)?.label ?? 'Любой'

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(p => !p)}
        className={`flex items-center justify-between w-full h-9 px-3 rounded-lg border text-sm transition-colors ${
          value ? 'border-brand text-ink' : 'border-border text-steel'
        } hover:border-brand`}
      >
        <span className="truncate">{label}: {current}</span>
        <ChevronDown size={14} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-border rounded-lg shadow-lg p-1 z-50">
          <button
            onClick={() => { onChange(null); setOpen(false) }}
            className={`block w-full text-left px-2 py-1.5 rounded text-sm hover:bg-porcelain ${!value ? 'text-brand font-medium' : 'text-ink'}`}
          >
            Любой
          </button>
          {options.map(opt => (
            <button
              key={opt.id}
              onClick={() => { onChange(opt.id); setOpen(false) }}
              className={`block w-full text-left px-2 py-1.5 rounded text-sm hover:bg-porcelain ${value === opt.id ? 'text-brand font-medium' : 'text-ink'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function getFillColor(value: number, acceptableFrom: number, highFrom: number): string {
  if (value >= highFrom) return '#58C8AA'   // мятный — высокий уровень
  if (value >= acceptableFrom) return '#BA8E3F' // жёлтый — допустимый
  return '#BF5853'                          // красный — ниже допустимого
}

// Слайдер-градусник: непрерывный порог 0-100, значение 0 трактуется как "Любой" (фильтр не применяется).
// Локальный стейт — для мгновенной реакции при перетаскивании; в URL (и на сервер) значение
// уходит только на отпускание — иначе каждый пиксель движения запускал бы отдельный запрос к серверу.
// Цвет заливки меняется по достижении калиброванных порогов (см. EXTENDED_FILTER_SPEC.md).
export function ThresholdSlider({
  label,
  value,
  onChange,
  acceptableFrom,
  highFrom,
}: {
  label: string
  value: number | null
  onChange: (next: number | null) => void
  acceptableFrom: number
  highFrom: number
}) {
  const [localValue, setLocalValue] = useState(value ?? 0)

  useEffect(() => {
    setLocalValue(value ?? 0)
  }, [value])

  function commit(next: number) {
    onChange(next === 0 ? null : next)
  }

  const fillColor = getFillColor(localValue, acceptableFrom, highFrom)

  return (
    <div className="pt-1">
      <p className="text-sm text-steel mb-1.5">
        {label} от: <span className="text-ink font-medium">{localValue || 'любой'}</span>
      </p>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={localValue}
        onChange={e => setLocalValue(Number(e.target.value))}
        onMouseUp={e => commit(Number((e.target as HTMLInputElement).value))}
        onTouchEnd={e => commit(Number((e.target as HTMLInputElement).value))}
        onKeyUp={e => commit(Number((e.target as HTMLInputElement).value))}
        style={{ background: `linear-gradient(to right, ${fillColor} ${localValue}%, #F7F8FA ${localValue}%)` }}
        className="w-full h-1 rounded-full appearance-none cursor-pointer outline-none
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2
          [&::-webkit-slider-thumb]:border-brand [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:cursor-pointer
          [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-brand
          [&::-moz-range-thumb]:shadow [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-track]:bg-transparent"
      />
    </div>
  )
}

export function PillsSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: number | null
  onChange: (next: number | null) => void
  options: { value: number | null; text: string }[]
}) {
  return (
    <div>
      <p className="text-sm text-steel mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => (
          <button
            key={String(opt.value)}
            onClick={() => onChange(opt.value)}
            className={`px-2.5 h-7 rounded-full text-sm border transition-colors ${
              value === opt.value ? 'bg-brand border-brand text-white' : 'border-border text-steel hover:border-brand hover:text-brand'
            }`}
          >
            {opt.text}
          </button>
        ))}
      </div>
    </div>
  )
}

export function TempRangeInput({
  label,
  min,
  max,
  onChange,
}: {
  label: string
  min: number | null
  max: number | null
  onChange: (min: number | null, max: number | null) => void
}) {
  function parse(v: string): number | null {
    if (v === '') return null
    const n = parseInt(v, 10)
    if (isNaN(n)) return null
    return Math.max(-40, Math.min(50, n))
  }

  return (
    <div>
      <p className="text-xs text-steel mb-1.5">{label}</p>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={min ?? ''}
          onChange={e => onChange(parse(e.target.value), max)}
          placeholder="от"
          className="w-full h-9 px-2 rounded-lg border border-border text-sm text-ink outline-none focus:border-brand text-center"
        />
        <span className="text-steel text-xs">—</span>
        <input
          type="number"
          value={max ?? ''}
          onChange={e => onChange(min, parse(e.target.value))}
          placeholder="до"
          className="w-full h-9 px-2 rounded-lg border border-border text-sm text-ink outline-none focus:border-brand text-center"
        />
        <span className="text-steel text-xs shrink-0">°C</span>
      </div>
    </div>
  )
}

export function CheckboxRow({
  label,
  checked,
  onChange,
  beta,
}: {
  label: string
  checked: boolean
  onChange: (next: boolean) => void
  beta?: boolean
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-ink cursor-pointer select-none">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="accent-brand" />
      {label}
      {beta && <sup className="text-[10px] text-brand">beta</sup>}
    </label>
  )
}