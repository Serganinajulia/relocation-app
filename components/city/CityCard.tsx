import { Database } from '@/types/supabase'
import Link from 'next/link'

// Берём тип строки из сгенерированных типов Supabase
// Это гарантирует что компонент всегда в sync со схемой БД
type City = {
    id: string
    name_i18n: unknown
    country_id: string | null
    has_sea: boolean | null
    has_mountains: boolean | null
    safety_index: number | null
    timezone_offset: number | null
    english_level: string | null
    population: number | null
    climate_type_id: number | null
    temp_summer_max: number | null
    temp_winter_min: number | null
  }
// Pick — TypeScript утилита которая берёт только нужные поля из типа
// Вместо того чтобы описывать тип вручную — берём его прямо из БД

type Props = {
  city: City
}

export function CityCard({ city }: Props) {
  // name_i18n это объект {"ru": "Батуми", "en": "Batumi"}
  // Пока берём ru, позже добавим переключение языка
  const name = (city.name_i18n as { ru: string; en: string })?.ru ?? 'Без названия'

  return (
    <div className="border rounded-xl p-4 hover:shadow-md transition-shadow">
      <h2 className="text-xl font-semibold mb-2">{name}</h2>

      <div className="flex gap-2 flex-wrap mb-3">
        {/* Бейджи характеристик */}
        {city.has_sea && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            🌊 Море
          </span>
        )}
        {city.has_mountains && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
            ⛰️ Горы
          </span>
        )}
      </div>

      <div className="text-sm text-gray-600 space-y-1">
        {/* Температуры */}
        <p>🌡️ Лето до {city.temp_summer_max}°C · Зима от {city.temp_winter_min}°C</p>

        {/* Часовой пояс — рендерим GMT+N из числа */}
        <p>🕐 GMT{(city.timezone_offset ?? 0) >= 0 ? '+' : ''}{city.timezone_offset}</p>

        {/* Безопасность */}
        <p>🛡️ Безопасность: {city.safety_index}/100</p>

        {/* Английский */}
        <p>🇬🇧 Английский: {city.english_level}</p>
      </div>
      <Link
        href={`/countries/${city.country_id}/cities/${city.id}`}
        className="inline-block mt-4 text-sm text-blue-600 hover:underline"
        >
        Подробнее о городе →
      </Link>      
    </div>
  )
}