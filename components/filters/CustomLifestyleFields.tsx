'use client'

import { Minus, Plus } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { ServiceMode, LifeStyle } from '@/lib/calc/formulas'

// ------------------------------------------------------------
// СЧЁТЧИК — для 8 полей вида "количество ... в месяц"
// ------------------------------------------------------------

type CounterFieldProps = {
  label: string
  description?: string
  value: number
  onChange: (next: number) => void
  min?: number
  max?: number
}

export function CounterField({ label, description, value, onChange, min = 0, max = 99 }: CounterFieldProps) {
  return (
    <div className="flex items-center justify-between p-3 border border-border rounded-xl">
      <div className="flex flex-col gap-0.5 pr-4">
        <span className="text-sm text-ink font-medium">{label}</span>
        {description && <span className="text-xs text-steel">{description}</span>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-7 h-7 flex items-center justify-center rounded-full border border-border text-steel hover:border-brand hover:text-brand transition-colors"
        >
          <Minus size={13} />
        </button>
        <span className="w-6 text-center text-sm font-medium text-ink">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-7 h-7 flex items-center justify-center rounded-full border border-border text-steel hover:border-brand hover:text-brand transition-colors"
        >
          <Plus size={13} />
        </button>
      </div>
    </div>
  )
}

// ------------------------------------------------------------
// ТРЁХПОЗИЦИОННЫЙ ВЫБОР — для сада/школы/страховки
// ------------------------------------------------------------

type ServiceModeFieldProps = {
  label: string
  description?: string
  value: ServiceMode
  onChange: (next: ServiceMode) => void
  // Формулировки для каждого режима можно переопределить под конкретное поле
  // (например, для страховки и для сада текст может звучать по-разному)
  freeOrPrivateLabel?: string
  privateLabel?: string
  noneLabel?: string
}

export function ServiceModeField({
  label,
  description,
  value,
  onChange,
  freeOrPrivateLabel = 'Бесплатно, если есть, иначе частно',
  privateLabel = 'Всегда частно',
  noneLabel = 'Не пользуемся',
}: ServiceModeFieldProps) {
  return (
    <div className="p-3 border border-border rounded-xl">
      <div className="flex flex-col gap-0.5 mb-2">
        <span className="text-sm text-ink font-medium">{label}</span>
        {description && <span className="text-xs text-steel">{description}</span>}
      </div>
      <RadioGroup value={value} onValueChange={(v) => onChange(v as ServiceMode)} className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <RadioGroupItem value="free_or_private" id={`${label}-free`} />
          <Label htmlFor={`${label}-free`} className="text-sm text-ink font-normal cursor-pointer">{freeOrPrivateLabel}</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="private" id={`${label}-private`} />
          <Label htmlFor={`${label}-private`} className="text-sm text-ink font-normal cursor-pointer">{privateLabel}</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="none" id={`${label}-none`} />
          <Label htmlFor={`${label}-none`} className="text-sm text-ink font-normal cursor-pointer">{noneLabel}</Label>
        </div>
      </RadioGroup>
    </div>
  )
}

// ------------------------------------------------------------
// ЧЕКБОКС — для полей вида "вкл/выкл" (домашний интернет)
// ------------------------------------------------------------

type CheckboxFieldProps = {
  label: string
  description?: string
  checked: boolean
  onChange: (next: boolean) => void
}

export function CheckboxField({ label, description, checked, onChange }: CheckboxFieldProps) {
  return (
    <div className="flex items-center justify-between p-3 border border-border rounded-xl">
      <div className="flex flex-col gap-0.5 pr-4">
        <span className="text-sm text-ink font-medium">{label}</span>
        {description && <span className="text-xs text-steel">{description}</span>}
      </div>
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(v === true)} />
    </div>
  )
}

// ------------------------------------------------------------
// ВЫБОР УРОВНЯ ПРОДУКТОВОЙ КОРЗИНЫ — независим от общего стиля жизни
// ------------------------------------------------------------

type LifestyleLevelFieldProps = {
  label: string
  description?: string
  value: LifeStyle
  onChange: (next: LifeStyle) => void
}

const GROCERIES_LEVEL_OPTIONS: { value: LifeStyle; label: string; description: string }[] = [
  { value: 'economy', label: 'Эконом', description: 'Минимальная продуктовая корзина города (данные Numbeo)' },
  { value: 'comfort', label: 'Базовый', description: '~125% от минимальной корзины — импорт, деликатесы' },
  { value: 'comfort_plus', label: 'Комфорт+', description: '~150% от минимальной корзины — премиум-бренды, органика' },
]

export function LifestyleLevelField({ label, description, value, onChange }: LifestyleLevelFieldProps) {
  return (
    <div className="p-3 border border-border rounded-xl">
      <div className="flex flex-col gap-0.5 mb-2">
        <span className="text-sm text-ink font-medium">{label}</span>
        {description && <span className="text-xs text-steel">{description}</span>}
      </div>
      <div className="flex flex-col gap-2">
        {GROCERIES_LEVEL_OPTIONS.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`text-left px-3 py-2 rounded-lg border transition-all ${
              value === opt.value ? 'border-brand bg-positive-bg' : 'border-border hover:border-brand'
            }`}
          >
            <span className="text-sm font-medium text-ink block">{opt.label}</span>
            <span className="text-xs text-steel">{opt.description}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ------------------------------------------------------------
// ВЫБОР УРОВНЯ ЖИЛЬЯ (аренда + коммуналка) — тоже независим от общего стиля
// ------------------------------------------------------------

const HOUSING_LEVEL_OPTIONS: { value: LifeStyle; label: string; description: string }[] = [
  { value: 'economy', label: 'Эконом', description: 'По нижней планке цен — меньшая площадь, более бюджетные районы' },
  { value: 'comfort', label: 'Базовый', description: 'Средняя цена по выбранному типу жилья' },
  { value: 'comfort_plus', label: 'Комфорт+', description: 'По верхней планке цен — больше площадь, более престижные районы' },
]

export function HousingLevelField({ label, description, value, onChange }: LifestyleLevelFieldProps) {
  return (
    <div className="p-3 border border-border rounded-xl">
      <div className="flex flex-col gap-0.5 mb-2">
        <span className="text-sm text-ink font-medium">{label}</span>
        {description && <span className="text-xs text-steel">{description}</span>}
      </div>
      <div className="flex flex-col gap-2">
        {HOUSING_LEVEL_OPTIONS.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`text-left px-3 py-2 rounded-lg border transition-all ${
              value === opt.value ? 'border-brand bg-positive-bg' : 'border-border hover:border-brand'
            }`}
          >
            <span className="text-sm font-medium text-ink block">{opt.label}</span>
            <span className="text-xs text-steel">{opt.description}</span>
          </button>
        ))}
      </div>
    </div>
  )
}