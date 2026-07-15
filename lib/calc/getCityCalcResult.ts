import { calcTotal, type LifeStyle, type LifestyleOverrides } from '@/lib/calc/formulas'

// Минимальный набор полей City, нужных для расчёта — совпадает с тем,
// что уже описано в CityCard, но вынесено сюда как общий источник правды.
type CityForCalc = {
  countries: {
    healthcare_access: string | null
    kindergarten_is_free: boolean | null
    school_is_free: boolean | null
  } | null
  costs: {
    groceries_usd: number | null
    cafes_usd: number | null
    internet_home_usd: number | null
    mobile_plan_usd: number | null
    transport_monthly_pass_usd: number | null
    transport_single_ticket_usd: number | null
    taxi_ride_avg_usd: number | null
    beauty_base_index_usd: number | null
    fitness_usd: number | null
    coworking_usd: number | null
    insurance_private_usd: number | null
    kindergarten_usd: number | null
    school_usd: number | null
    kids_club_activity_usd: number | null
    baby_supplies_usd: number | null
  }[]
  rent_options: {
    accommodation_type: string | null
    bedrooms_count: number | null
    price_usd_min: number | null
    price_usd_max: number | null
    utilities_usd_min: number | null
    utilities_usd_max: number | null
  }[]
}

type CalcParams = {
  housingType: string
  bedrooms: number | null
  adults: number
  children: number
  lifestyle: LifeStyle
  hasBaby: boolean
  kidsInKindergarten: number
  kidsInSchool: number
  overrides?: LifestyleOverrides
}

export type CityCalcResult = ReturnType<typeof calcTotal> & {
  rentMin: number
  rentMax: number
}

// Возвращает результат calcTotal для города, или null — если для выбранной
// комбинации (тип жилья + спальни) в этом городе нет данных вообще.
// null означает "город скрывается из выдачи", а не "стоимость = 0" —
// рендерить нулевую стоимость было бы вводящим в заблуждение.
export function getCityCalcResult(city: CityForCalc, params: CalcParams): CityCalcResult | null {
  const costs = city.costs?.[0]
  const rentEntry = params.bedrooms !== null
    ? city.rent_options?.find(r => r.accommodation_type === params.housingType && r.bedrooms_count === params.bedrooms)
    : (city.rent_options?.find(r => r.accommodation_type === params.housingType && r.bedrooms_count === 0) ??
       city.rent_options?.find(r => r.accommodation_type === params.housingType && r.bedrooms_count === 1))

  if (!costs || !rentEntry) return null

  const total = calcTotal({
    adults: params.adults,
    children: params.children,
    has_baby: params.hasBaby,
    kids_in_kindergarten: params.kidsInKindergarten,
    kids_in_school: params.kidsInSchool,
    lifestyle: params.lifestyle,
    overrides: params.overrides,
    price_usd_min: rentEntry.price_usd_min ?? 0,
    price_usd_max: rentEntry.price_usd_max ?? 0,
    utilities_usd_min: rentEntry.utilities_usd_min ?? 0,
    utilities_usd_max: rentEntry.utilities_usd_max ?? 0,
    groceries_usd: costs.groceries_usd ?? 0,
    internet_home_usd: costs.internet_home_usd ?? 0,
    mobile_plan_usd: costs.mobile_plan_usd ?? 0,
    transport_monthly_pass_usd: costs.transport_monthly_pass_usd ?? 0,
    transport_single_ticket_usd: costs.transport_single_ticket_usd ?? 0,
    taxi_ride_avg_usd: costs.taxi_ride_avg_usd ?? 0,
    cafes_usd: costs.cafes_usd ?? 0,
    beauty_base_index_usd: costs.beauty_base_index_usd ?? 0,
    fitness_usd: costs.fitness_usd ?? 0,
    coworking_usd: costs.coworking_usd ?? 0,
    insurance_private_usd: costs.insurance_private_usd ?? 0,
    kindergarten_usd: costs.kindergarten_usd ?? 0,
    school_usd: costs.school_usd ?? 0,
    kids_club_activity_usd: costs.kids_club_activity_usd ?? 0,
    baby_supplies_usd: costs.baby_supplies_usd ?? 0,
    healthcare_access: (city.countries?.healthcare_access ?? 'paid') as 'free' | 'emergency_only' | 'paid',
    kindergarten_is_free: city.countries?.kindergarten_is_free ?? false,
    school_is_free: city.countries?.school_is_free ?? false,
  })

  return {
    ...total,
    rentMin: rentEntry.price_usd_min ?? 0,
    rentMax: rentEntry.price_usd_max ?? 0,
  }
}