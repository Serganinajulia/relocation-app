import Link from 'next/link'
import { Clock, Shield, Waves, Mountain, Sun, Snowflake, Stamp, Globe } from 'lucide-react'

type I18n = { ru: string; en: string }

type City = {
  id: string
  name_i18n: unknown
  country_id: string | null
  sea_type: string | null
  has_mountains: boolean | null
  safety_index: number | null
  timezone_offset: number | null
  english_level: string | null
  population: number | null
  image_url: string | null
  temp_summer_min: number | null
  temp_summer_max: number | null
  temp_winter_min: number | null
  temp_winter_max: number | null
  countries: {
    name_i18n: unknown
    country_politics: {
      fh_score: number | null
      eiu_regime_type_id: number | null
      eiu_regime_types: { name_i18n: unknown } | null
    } | null
    tourist_visas: {
      origin_country_id: string
      visa_type: string
      allowed_days: number | null
      conditions_i18n: unknown
    }[] | null
    country_languages: {
      is_official: boolean
      is_widely_spoken: boolean
      languages: { name_i18n: unknown; code: string } | null
    }[] | null
  } | null
  costs: {
    groceries_usd: number | null
    cafes_usd: number | null
    utilities_usd: number | null
    internet_home_usd: number | null
    transport_basic_usd: number | null
  }[]
  rent_options: {
    accommodation_type: string | null
    bedrooms_count: number | null
    price_usd_min: number | null
    price_usd_max: number | null
  }[]
}

type Props = { city: City }

function calcMinCost(costs: City['costs']): number | null {
  if (!costs?.length) return null
  const c = costs[0]
  return (c.groceries_usd ?? 0)
    + (c.cafes_usd ?? 0)
    + (c.utilities_usd ?? 0)
    + (c.internet_home_usd ?? 0)
    + (c.transport_basic_usd ?? 0)
}

function getMinRent(rentOptions: City['rent_options']): number | null {
  const studio = rentOptions?.find(r => r.bedrooms_count === 0)
  return studio?.price_usd_min ?? null
}

function getMaxRent(rentOptions: City['rent_options']): number | null {
  const twoPlus = rentOptions?.filter(r => r.bedrooms_count !== null && r.bedrooms_count >= 2)
  if (!twoPlus?.length) return null
  return Math.max(...twoPlus.map(r => r.price_usd_max ?? 0))
}

function countryFlag(countryId: string | null): string {
  if (!countryId) return ''
  return countryId
    .toUpperCase()
    .replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt(0)))
}

function seaLabel(seaType: string | null): string | null {
  switch (seaType) {
    case 'sea': return 'Море'
    case 'ocean': return 'Океан'
    case 'lake': return 'Озеро'
    default: return null
  }
}

function englishBadge(level: string | null): { label: string; className: string } {
  switch (level) {
    case 'high': return { label: 'Высокий', className: 'bg-positive-bg text-positive' }
    case 'medium': return { label: 'Средний', className: 'bg-medium-bg text-medium' }
    case 'low': return { label: 'Низкий', className: 'bg-warning-bg text-warning' }
    case 'none': return { label: 'Не распространён', className: 'bg-warning-bg text-warning' }
    default: return { label: 'н/д', className: 'bg-porcelain text-steel' }
  }
}

function barColor(index: number | null): string {
  if (index == null) return 'bg-porcelain'
  if (index >= 70) return 'bg-bar-positive'
  if (index >= 45) return 'bg-bar-medium'
  return 'bg-bar-warning'
}

function regimeBadge(regimeTypeId: number | null): { className: string } {
  switch (regimeTypeId) {
    case 1: return { className: 'bg-positive-bg text-positive' }        // Полная демократия
    case 2: return { className: 'bg-medium-bg text-medium' }            // Несовершенная демократия
    case 3: return { className: 'bg-orange-50 text-orange-500' }        // Гибридный режим
    case 4: return { className: 'bg-warning-bg text-warning' }          // Авторитарный режим
    default: return { className: 'bg-porcelain text-steel' }
  }
}
function visaLabel(visas: { origin_country_id: string; visa_type: string; allowed_days: number | null; conditions_i18n: unknown }[] | null): { label: string; className: string } {
  const ruVisa = visas?.find(v => v.origin_country_id === 'RU')
  if (!ruVisa) return { label: 'Уточнить', className: 'bg-porcelain text-steel' }
  if (ruVisa.visa_type === 'visa_free') {
    if (ruVisa.allowed_days && ruVisa.allowed_days >= 180) {
      return { label: `Без визы ${ruVisa.allowed_days} дней`, className: 'bg-positive-bg text-positive' }
    }
    return { label: `Без визы ${ruVisa.allowed_days} дней`, className: 'bg-medium-bg text-medium' }
  }
  const condName = (ruVisa.conditions_i18n as { ru?: string })?.ru
  return { label: condName ?? 'Нужна виза', className: 'bg-warning-bg text-warning' }
}
function getCurrentTime(offset: number | null): string {
  if (offset == null) return '—'
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const local = new Date(utc + offset * 3600000)
  return local.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

export function CityCard({ city }: Props) {
  const name = (city.name_i18n as I18n)?.ru ?? 'Без названия'
  const countryName = (city.countries?.name_i18n as I18n)?.ru ?? ''
  const flag = countryFlag(city.country_id)
  const minCost = calcMinCost(city.costs)
  const minRent = getMinRent(city.rent_options)
  const maxRent = getMaxRent(city.rent_options)
  const tz = city.timezone_offset
  const tzLabel = tz != null ? `GMT${tz >= 0 ? '+' : ''}${tz}` : '—'
  const currentTime = getCurrentTime(tz)
  const sea = seaLabel(city.sea_type)
  const english = englishBadge(city.english_level)

  const politics = city.countries?.country_politics
  const regime = regimeBadge(politics?.eiu_regime_type_id ?? null)
  const visa = visaLabel(city.countries?.tourist_visas ?? null)
  const regimeName = (politics?.eiu_regime_types?.name_i18n as I18n)?.ru ?? null

  const languages = city.countries?.country_languages ?? []
  const officialLangs = languages.filter(l => l.is_official)
  const shownLangs = officialLangs.slice(0, 2)
  const extraLangs = officialLangs.length - 2

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow flex flex-col">

      {/* Фото + оверлей */}
      <div className="relative h-[200px] bg-porcelain shrink-0 overflow-hidden">
        {city.image_url ? (
          <img
            src={city.image_url}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-porcelain" />
        )}
        {/* Градиент поверх фото */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-ink/10" />

        {/* Название + часовой пояс */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
          <p className="text-white/70 text-xs font-medium tracking-widest uppercase mb-0.5">
            {flag} {countryName}
          </p>
          <h2 className="text-white text-2xl font-bold tracking-wide uppercase leading-tight mb-1.5">
            {name}
          </h2>
          <div className="flex items-center gap-1.5 text-white/70 text-xs">
            <Clock size={11} />
            <span>{tzLabel} · Сейчас {currentTime}</span>
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">

        {/* Бюджет */}
        {(minCost || minRent) && (
          <div>
            {minCost && minRent && (
              <p className="text-xl font-semibold text-ink">
                Бюджет: от ${minCost + minRent} / месяц
              </p>
            )}
            <div className="flex gap-3 text-sm mt-1.5">
              {minCost && (
                <div className="bg-porcelain rounded-lg px-3 py-2 flex-1">
                  <p className="text-xs text-steel mb-0.5">Стоимость жизни</p>
                  <p className="font-semibold text-ink">от ${minCost}</p>
                </div>
              )}
              {minRent && (
                <div className="bg-porcelain rounded-lg px-3 py-2 flex-1">
                  <p className="text-xs text-steel mb-0.5">Стоимость аренды</p>
                  <p className="font-semibold text-ink">
                    ${minRent}{maxRent ? `–$${maxRent}` : ''}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Теги: виза, режим, свобода, море, горы */}
        <div className="flex flex-wrap gap-1.5">
        <span className={`flex items-center gap-1 text-sm px-2.5 py-1 rounded-full ${visa.className}`}>
          <Stamp size={12} />
          {visa.label}
        </span>
          {regimeName && (
            <span className={`flex items-center gap-1 text-sm px-2.5 py-1 rounded-full ${regime.className}`}>
              <Globe size={12} />
              {regimeName}
            </span>
          )}
          {sea && (
            <span className="flex items-center gap-1 text-sm bg-sky-bg text-sky px-2.5 py-1 rounded-full">
              <Waves size={12} />
              {sea}
            </span>
          )}
          {city.has_mountains && (
            <span className="flex items-center gap-1 text-sm bg-lilac-bg text-lilac px-2.5 py-1 rounded-full">
              <Mountain size={12} />
              Горы
            </span>
          )}
        </div>

        {/* Две колонки: климат + языки */}
        <div className="grid grid-cols-2 gap-4">

          {/* Климат */}
          <div className="flex flex-col gap-1.5">
            <p className="flex items-center gap-1.5 text-sm text-steel">
              <Sun size={13} className="text-brand shrink-0" />
              <span>Летом:</span>
              <span>{city.temp_summer_min}°– {city.temp_summer_max}°</span>
            </p>
            <p className="flex items-center gap-1.5 text-sm text-steel">
              <Snowflake size={13} className="text-brand shrink-0" />
              <span>Зимой:</span>
              <span>{city.temp_winter_min}°– {city.temp_winter_max}°</span>
            </p>
          </div>

          {/* Языки */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm text-steel">Язык:</span>
              {shownLangs.map((l, i) => (
                <span key={i} className="text-sm bg-porcelain text-steel px-2 py-0.5 rounded-full">
                  {(l.languages?.name_i18n as I18n)?.ru ?? '—'}
                </span>
              ))}
              {extraLangs > 0 && (
                <span className="text-sm bg-porcelain text-steel px-2 py-0.5 rounded-full">
                  +{extraLangs}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm text-steel">English:</span>
              <span className={`text-sm px-2 py-0.5 rounded-full ${english.className}`}>
                {english.label}
              </span>
            </div>
          </div>

        </div>

        {/* Безопасность */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="flex items-center gap-1.5 text-steel text-sm">
              <Shield size={13} className="text-brand" />
              Безопасность
            </span>
            <span className="text-xs text-steel">{city.safety_index}/100</span>
          </div>
          <div className="w-full bg-porcelain rounded-full h-1">
            <div
              className={`h-1 rounded-full transition-all ${barColor(city.safety_index)}`}
              style={{ width: `${city.safety_index ?? 0}%` }}
            />
          </div>
        </div>
        {/* Свобода */}
        {politics?.fh_score != null && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5 text-steel text-sm">
                <Globe size={13} className="text-brand" />
                Индекс свободы
              </span>
              <span className="text-xs text-steel">{politics.fh_score}/100</span>
            </div>
            <div className="w-full bg-porcelain rounded-full h-1">
              <div
                className={`h-1 rounded-full transition-all ${barColor(politics.fh_score)}`}
                style={{ width: `${politics.fh_score}%` }}
              />
            </div>
          </div>
        )}

        {/* Кнопка */}
        <Link
          href={`/countries/${city.country_id}/cities/${city.id}`}
          className="block my-2 text-center bg-brand hover:bg-positive text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
        >
          Подробнее о городе
        </Link>

      </div>
    </div>
  )
}