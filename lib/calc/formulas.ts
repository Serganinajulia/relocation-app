// ============================================================
// ФОРМУЛЫ РАСЧЁТА СТОИМОСТИ ЖИЗНИ — ReloCalc
// Версия: июль 2026 — с поддержкой userOverrides (кастомных стилей)
// ============================================================

// ------------------------------------------------------------
// СТИЛИ ЖИЗНИ
// ------------------------------------------------------------

export type LifeStyle = 'economy' | 'comfort' | 'comfort_plus'

// Трёхпозиционный режим для сада/школы/страховки
export type ServiceMode = 'free_or_private' | 'private' | 'none'
// 'free_or_private' — бесплатно, если есть в стране, иначе платно (текущее дефолтное поведение)
// 'private'         — всегда платно, даже если есть бесплатный вариант
// 'none'            — не пользуемся вообще, всегда 0

// ------------------------------------------------------------
// ОВЕРРАЙДЫ ПОЛЬЗОВАТЕЛЯ (кастомный стиль жизни)
// ------------------------------------------------------------
// Все поля опциональны: нет значения → берём дефолт по пресету/составу семьи,
// есть значение (включая 0/false) → используем его.

export type LifestyleOverrides = {
  housingLevel?: LifeStyle                // уровень аренды/коммуналки — независим от общего стиля
  groceriesLevel?: LifeStyle             // уровень продуктовой корзины — независим от общего стиля

  hasHomeInternet?: boolean              // домашний интернет вкл/выкл
  mobilePlansCount?: number              // число мобильных тарифов (дефолт = adults)

  transportPassesCount?: number          // число проездных (дефолт = adults для economy/comfort, 0 для comfort_plus)
  transportSingleTicketsCount?: number    // число разовых поездок в месяц (дефолт = 0)

  taxiRidesPerMonth?: number             // дефолт по пресету: 0 / 8 / 30
  cafeVisitsPerMonth?: number            // дефолт по пресету: 0 / 8 / 20
  beautyProceduresPerMonth?: number      // дефолт по пресету: 0 / 4 / 7
  fitnessMembershipsCount?: number       // дефолт по пресету: 0 / adults / adults
  coworkingSeatsCount?: number           // дефолт по пресету: 0 / 0 / 1
  clubsCount?: number                    // дефолт по пресету: 0 / (1, если есть дети) / children×2

  insuranceMode?: ServiceMode           // дефолт: 'free_or_private' для всех стилей
  insuranceCount?: number               // сколько человек страхуем (дефолт = adults + children)
  kindergartenMode?: ServiceMode         // дефолт: economy → 'none', comfort/comfort_plus → 'free_or_private'
  schoolMode?: ServiceMode              // аналогично kindergarten
}

// ------------------------------------------------------------
// ДЕФОЛТНЫЕ ЗНАЧЕНИЯ ПО ПРЕСЕТУ (используются, если оверрайд не задан)
// ------------------------------------------------------------

export const DEFAULT_TAXI_RIDES: Record<LifeStyle, number> = {
  economy: 0, comfort: 8, comfort_plus: 30,
}

export const DEFAULT_BEAUTY_PROCEDURES: Record<LifeStyle, number> = {
  economy: 0, comfort: 4, comfort_plus: 7,
}

export const DEFAULT_COWORKING_SEATS: Record<LifeStyle, number> = {
  economy: 0, comfort: 0, comfort_plus: 1,
}

export const DEFAULT_KINDERGARTEN_MODE: Record<LifeStyle, ServiceMode> = {
  economy: 'none', comfort: 'free_or_private', comfort_plus: 'free_or_private',
}

export const DEFAULT_SCHOOL_MODE: Record<LifeStyle, ServiceMode> = {
  economy: 'none', comfort: 'free_or_private', comfort_plus: 'free_or_private',
}

// Разворачивает оверрайды в полностью заполненный объект (без опциональных полей).
// Здесь и живёт вся логика "дефолт зависит от пресета + состава семьи".
export function resolveOverrides(
  lifestyle: LifeStyle,
  adults: number,
  children: number,
  overrides: LifestyleOverrides = {}
) {
  // Дефолт кружков — раньше это была логика внутри calcClubs, теперь вынесена сюда
  const defaultClubsCount = lifestyle === 'economy' ? 0
    : lifestyle === 'comfort' ? (children > 0 ? 1 : 0)
    : children * 2

  return {
    housingLevel: overrides.housingLevel ?? lifestyle,
    groceriesLevel: overrides.groceriesLevel ?? lifestyle,

    hasHomeInternet: overrides.hasHomeInternet ?? true,
    mobilePlansCount: overrides.mobilePlansCount ?? adults,

    transportPassesCount: overrides.transportPassesCount
      ?? (lifestyle === 'comfort_plus' ? 0 : adults),
    transportSingleTicketsCount: overrides.transportSingleTicketsCount ?? 0,

    taxiRidesPerMonth: overrides.taxiRidesPerMonth ?? DEFAULT_TAXI_RIDES[lifestyle],
    cafeVisitsPerMonth: overrides.cafeVisitsPerMonth ?? CAFE_VISITS_PRESET[lifestyle],
    beautyProceduresPerMonth: overrides.beautyProceduresPerMonth ?? DEFAULT_BEAUTY_PROCEDURES[lifestyle],
    fitnessMembershipsCount: overrides.fitnessMembershipsCount
      ?? (lifestyle === 'economy' ? 0 : adults),
    coworkingSeatsCount: overrides.coworkingSeatsCount ?? DEFAULT_COWORKING_SEATS[lifestyle],
    clubsCount: overrides.clubsCount ?? defaultClubsCount,

    insuranceMode: overrides.insuranceMode ?? 'free_or_private',
    insuranceCount: overrides.insuranceCount ?? (adults + children),
    kindergartenMode: overrides.kindergartenMode ?? DEFAULT_KINDERGARTEN_MODE[lifestyle],
    schoolMode: overrides.schoolMode ?? DEFAULT_SCHOOL_MODE[lifestyle],
  }
}

// ------------------------------------------------------------
// КОЭФФИЦИЕНТЫ ПРОДУКТОВ (W_food)
// ------------------------------------------------------------

export const GROCERIES_COEFFICIENTS = {
  first_adult: 1.0,
  extra_adult: 0.7,
  child: 0.4,
}

export function calcGroceriesMultiplier(adults: number, children: number): number {
  if (adults === 0) return 0
  return (
    GROCERIES_COEFFICIENTS.first_adult +
    (adults - 1) * GROCERIES_COEFFICIENTS.extra_adult +
    children * GROCERIES_COEFFICIENTS.child
  )
}

export const LIFESTYLE_GROCERY_COEFF: Record<LifeStyle, number> = {
  economy: 1.0, comfort: 1.25, comfort_plus: 1.5,
}

// ------------------------------------------------------------
// 1. ПРОДУКТЫ И ХОЗТОВАРЫ
// ------------------------------------------------------------
// = groceries_usd × W_food × K_style × 1.18
// groceriesLevel — независимый выбор уровня корзины (может отличаться от общего lifestyle)

export const HOUSEHOLD_MARKUP = 1.18

export function calcGroceries(
  groceries_usd: number,
  adults: number,
  children: number,
  groceriesLevel: LifeStyle
): number {
  const w = calcGroceriesMultiplier(adults, children)
  const k = LIFESTYLE_GROCERY_COEFF[groceriesLevel]
  return Math.round(groceries_usd * w * k * HOUSEHOLD_MARKUP)
}

// ------------------------------------------------------------
// 2. АРЕНДА ЖИЛЬЯ
// ------------------------------------------------------------
// Формула зависит от уровня жилья (housingLevel) — независимого оверрайда,
// а не от общего lifestyle напрямую (см. LifestyleOverrides.housingLevel)

export function calcRent(
  price_usd_min: number,
  price_usd_max: number,
  lifestyle: LifeStyle
): number {
  switch (lifestyle) {
    case 'economy': return price_usd_min
    case 'comfort': return Math.round((price_usd_min + price_usd_max) / 2)
    case 'comfort_plus': return price_usd_max
  }
}

// ------------------------------------------------------------
// 3. КОММУНАЛЬНЫЕ УСЛУГИ
// ------------------------------------------------------------
// Та же логика, что и аренда — зависит от housingLevel

export function calcUtilities(
  utilities_usd_min: number,
  utilities_usd_max: number,
  lifestyle: LifeStyle
): number {
  switch (lifestyle) {
    case 'economy': return utilities_usd_min
    case 'comfort': return Math.round((utilities_usd_min + utilities_usd_max) / 2)
    case 'comfort_plus': return utilities_usd_max
  }
}

// ------------------------------------------------------------
// 4. ИНТЕРНЕТ И СВЯЗЬ
// ------------------------------------------------------------
// = (hasHomeInternet ? internet_home_usd : 0) + mobile_plan_usd × mobilePlansCount

export function calcInternet(
  internet_home_usd: number,
  mobile_plan_usd: number,
  hasHomeInternet: boolean,
  mobilePlansCount: number
): number {
  return (hasHomeInternet ? internet_home_usd : 0) + mobile_plan_usd * mobilePlansCount
}

// ------------------------------------------------------------
// 5. ТРАНСПОРТ — проездные + разовые поездки (два независимых счётчика)
// ------------------------------------------------------------
// = transport_monthly_pass_usd × transportPassesCount
//   + transport_single_ticket_usd × transportSingleTicketsCount

export function calcTransport(
  transport_monthly_pass_usd: number,
  transport_single_ticket_usd: number,
  transportPassesCount: number,
  transportSingleTicketsCount: number
): number {
  return Math.round(
    transport_monthly_pass_usd * transportPassesCount +
    transport_single_ticket_usd * transportSingleTicketsCount
  )
}

// ------------------------------------------------------------
// 6. ТАКСИ
// ------------------------------------------------------------
// = taxi_ride_avg_usd × taxiRidesPerMonth

export function calcTaxi(
  taxi_ride_avg_usd: number,
  taxiRidesPerMonth: number
): number {
  return Math.round(taxi_ride_avg_usd * taxiRidesPerMonth)
}

// ------------------------------------------------------------
// 7. КАФЕ И ДОСТАВКА
// ------------------------------------------------------------
// = cafe_visits × cafes_usd
// cafe_visits = cafeVisitsPerMonth × (adults + children)

export const CAFE_VISITS_PRESET: Record<LifeStyle, number> = {
  economy: 0, comfort: 8, comfort_plus: 20,
}

export function calcCafe(
  cafes_usd: number,
  adults: number,
  children: number,
  cafeVisitsPerMonth: number
): number {
  const visits = cafeVisitsPerMonth * (adults + children)
  return Math.round(visits * cafes_usd)
}

// ------------------------------------------------------------
// 8. БЬЮТИ-УСЛУГИ
// ------------------------------------------------------------
// = beauty_base_index_usd × beautyProceduresPerMonth

export function calcBeauty(
  beauty_base_index_usd: number,
  beautyProceduresPerMonth: number
): number {
  return Math.round(beauty_base_index_usd * beautyProceduresPerMonth)
}

// ------------------------------------------------------------
// 9. ФИТНЕС
// ------------------------------------------------------------
// = fitness_usd × fitnessMembershipsCount

export function calcFitness(
  fitness_usd: number,
  fitnessMembershipsCount: number
): number {
  return fitness_usd * fitnessMembershipsCount
}

// ------------------------------------------------------------
// 10. КОВОРКИНГ
// ------------------------------------------------------------
// = coworking_usd × coworkingSeatsCount

export function calcCoworking(
  coworking_usd: number,
  coworkingSeatsCount: number
): number {
  return coworking_usd * coworkingSeatsCount
}

// ------------------------------------------------------------
// 11. МЕДИЦИНСКАЯ СТРАХОВКА
// ------------------------------------------------------------
// insuranceMode:
//   'free_or_private' → 0, если healthcare_access === 'free', иначе платно
//   'private'         → всегда платно
//   'none'            → всегда 0
// insuranceCount — явное число застрахованных (дефолт adults+children, задаётся в resolveOverrides)

export function calcInsurance(
  insurance_private_usd: number,
  healthcare_access: 'free' | 'emergency_only' | 'paid',
  insuranceMode: ServiceMode,
  insuranceCount: number
): number {
  if (insuranceMode === 'none') return 0
  if (insuranceMode === 'private') return insurance_private_usd * insuranceCount
  // 'free_or_private'
  if (healthcare_access === 'free') return 0
  return insurance_private_usd * insuranceCount
}

// ------------------------------------------------------------
// 12. ДЕТСКИЙ САД
// ------------------------------------------------------------
// kindergartenMode:
//   'free_or_private' → 0, если kindergarten_is_free, иначе платно
//   'private'         → всегда платно
//   'none'            → всегда 0 (дефолт для economy)

export function calcKindergarten(
  kindergarten_usd: number,
  kindergarten_is_free: boolean,
  kids_in_kindergarten: number,
  kindergartenMode: ServiceMode
): number {
  if (kindergartenMode === 'none') return 0
  if (kindergartenMode === 'private') return kindergarten_usd * kids_in_kindergarten
  // 'free_or_private'
  if (kindergarten_is_free) return 0
  return kindergarten_usd * kids_in_kindergarten
}

// ------------------------------------------------------------
// 13. ШКОЛА (логика идентична саду)
// ------------------------------------------------------------

export function calcSchool(
  school_usd: number,
  school_is_free: boolean,
  kids_in_school: number,
  schoolMode: ServiceMode
): number {
  if (schoolMode === 'none') return 0
  if (schoolMode === 'private') return school_usd * kids_in_school
  // 'free_or_private'
  if (school_is_free) return 0
  return school_usd * kids_in_school
}

// ------------------------------------------------------------
// 14. КРУЖКИ И СЕКЦИИ
// ------------------------------------------------------------
// = clubsCount × kids_club_activity_usd
// Дефолт clubsCount по стилю жизни считается в resolveOverrides (зависит от children)

export function calcClubs(
  kids_club_activity_usd: number,
  clubsCount: number
): number {
  return clubsCount * kids_club_activity_usd
}

// ------------------------------------------------------------
// 15. РАСХОДЫ НА МЛАДЕНЦА (не по стилю жизни — по составу семьи)
// ------------------------------------------------------------

export function calcBaby(
  baby_supplies_usd: number,
  has_baby: boolean
): number {
  return has_baby ? baby_supplies_usd : 0
}

// ------------------------------------------------------------
// ИТОГОВЫЙ РАСЧЁТ
// ------------------------------------------------------------

export type CalcInput = {
  // Семья
  adults: number
  children: number
  has_baby: boolean
  kids_in_kindergarten: number
  kids_in_school: number

  // Стиль жизни
  lifestyle: LifeStyle
  overrides?: LifestyleOverrides   // НОВОЕ — оверрайды кастомного стиля (опционально)

  // Жильё
  price_usd_min: number
  price_usd_max: number
  utilities_usd_min: number
  utilities_usd_max: number

  // Данные из costs
  groceries_usd: number
  internet_home_usd: number
  mobile_plan_usd: number
  transport_monthly_pass_usd: number
  transport_single_ticket_usd: number
  taxi_ride_avg_usd: number
  cafes_usd: number
  beauty_base_index_usd: number
  fitness_usd: number
  coworking_usd: number
  insurance_private_usd: number
  kindergarten_usd: number
  school_usd: number
  kids_club_activity_usd: number
  baby_supplies_usd: number

  // Данные из countries
  healthcare_access: 'free' | 'emergency_only' | 'paid'
  kindergarten_is_free: boolean
  school_is_free: boolean
}

export function calcTotal(input: CalcInput): {
  groceries: number
  rent: number
  utilities: number
  internet: number
  transport: number
  taxi: number
  cafe: number
  beauty: number
  fitness: number
  coworking: number
  insurance: number
  kindergarten: number
  school: number
  clubs: number
  baby: number
  total: number
} {
  // Разворачиваем оверрайды в полный набор эффективных значений
  const eff = resolveOverrides(input.lifestyle, input.adults, input.children, input.overrides)

  const groceries = calcGroceries(input.groceries_usd, input.adults, input.children, eff.groceriesLevel)
  const rent = calcRent(input.price_usd_min, input.price_usd_max, eff.housingLevel)
  const utilities = calcUtilities(input.utilities_usd_min, input.utilities_usd_max, eff.housingLevel)
  const internet = calcInternet(input.internet_home_usd, input.mobile_plan_usd, eff.hasHomeInternet, eff.mobilePlansCount)
  const transport = calcTransport(
    input.transport_monthly_pass_usd,
    input.transport_single_ticket_usd,
    eff.transportPassesCount,
    eff.transportSingleTicketsCount
  )
  const taxi = calcTaxi(input.taxi_ride_avg_usd, eff.taxiRidesPerMonth)
  const cafe = calcCafe(input.cafes_usd, input.adults, input.children, eff.cafeVisitsPerMonth)
  const beauty = calcBeauty(input.beauty_base_index_usd, eff.beautyProceduresPerMonth)
  const fitness = calcFitness(input.fitness_usd, eff.fitnessMembershipsCount)
  const coworking = calcCoworking(input.coworking_usd, eff.coworkingSeatsCount)
  const insurance = calcInsurance(input.insurance_private_usd, input.healthcare_access, eff.insuranceMode, eff.insuranceCount)
  const kindergarten = calcKindergarten(input.kindergarten_usd, input.kindergarten_is_free, input.kids_in_kindergarten, eff.kindergartenMode)
  const school = calcSchool(input.school_usd, input.school_is_free, input.kids_in_school, eff.schoolMode)
  const clubs = calcClubs(input.kids_club_activity_usd, eff.clubsCount)
  const baby = calcBaby(input.baby_supplies_usd, input.has_baby)

  const total = groceries + rent + utilities + internet + transport
    + taxi + cafe + beauty + fitness + coworking
    + insurance + kindergarten + school + clubs + baby

  return {
    groceries, rent, utilities, internet, transport,
    taxi, cafe, beauty, fitness, coworking,
    insurance, kindergarten, school, clubs, baby,
    total,
  }
}