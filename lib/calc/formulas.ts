// ============================================================
// ФОРМУЛЫ РАСЧЁТА СТОИМОСТИ ЖИЗНИ — ReloCalc
// Версия: июнь 2026
// ============================================================

// ------------------------------------------------------------
// СТИЛИ ЖИЗНИ
// ------------------------------------------------------------
// 'economy'  — Эконом
// 'comfort'  — Базовый комфорт
// 'comfort_plus' — Комфорт+

export type LifeStyle = 'economy' | 'comfort' | 'comfort_plus'

// ------------------------------------------------------------
// КОЭФФИЦИЕНТЫ ПРОДУКТОВ (W_food)
// ------------------------------------------------------------
// Первый взрослый        = 1.0
// Каждый доп. взрослый   = +0.7
// Ребёнок                = +0.4
// Младенец — НЕ добавляет коэффициент к продуктам,
//            его расходы считаются отдельно через baby_supplies_usd

export const GROCERIES_COEFFICIENTS = {
  first_adult:  1.0,
  extra_adult:  0.7,
  child:        0.4,
}

export function calcGroceriesMultiplier(adults: number, children: number): number {
  if (adults === 0) return 0
  return (
    GROCERIES_COEFFICIENTS.first_adult +
    (adults - 1) * GROCERIES_COEFFICIENTS.extra_adult +
    children * GROCERIES_COEFFICIENTS.child
  )
}

// ------------------------------------------------------------
// КОЭФФИЦИЕНТЫ СТИЛЯ ЖИЗНИ (K_style) — для продуктов
// ------------------------------------------------------------
// Эконом         = 1.0  (базовая корзина)
// Базовый        = 1.25 (импорт, деликатесы)
// Комфорт+       = 1.5  (дорогие бренды, органика)

export const LIFESTYLE_GROCERY_COEFF: Record<LifeStyle, number> = {
  economy:      1.0,
  comfort:      1.25,
  comfort_plus: 1.5,
}

// ------------------------------------------------------------
// 1. ПРОДУКТЫ И ХОЗТОВАРЫ
// ------------------------------------------------------------
// = groceries_usd × W_food × K_style × 1.18
// Коэффициент 1.18 — +18% на бытовую химию и гигиену

export const HOUSEHOLD_MARKUP = 1.18

export function calcGroceries(
  groceries_usd: number,
  adults: number,
  children: number,
  lifestyle: LifeStyle
): number {
  const w = calcGroceriesMultiplier(adults, children)
  const k = LIFESTYLE_GROCERY_COEFF[lifestyle]
  return Math.round(groceries_usd * w * k * HOUSEHOLD_MARKUP)
}

// ------------------------------------------------------------
// 2. АРЕНДА ЖИЛЬЯ
// ------------------------------------------------------------
// Эконом      = price_usd_min
// Базовый     = (price_usd_min + price_usd_max) / 2
// Комфорт+    = price_usd_max

export function calcRent(
  price_usd_min: number,
  price_usd_max: number,
  lifestyle: LifeStyle
): number {
  switch (lifestyle) {
    case 'economy':      return price_usd_min
    case 'comfort':      return Math.round((price_usd_min + price_usd_max) / 2)
    case 'comfort_plus': return price_usd_max
  }
}

// ------------------------------------------------------------
// 3. КОММУНАЛЬНЫЕ УСЛУГИ
// ------------------------------------------------------------
// Фиксировано по выбранному типу жилья, не зависит от стиля жизни
// = utilities_usd_min выбранного типа жилья

// ------------------------------------------------------------
// 4. ИНТЕРНЕТ И СВЯЗЬ
// ------------------------------------------------------------
// = internet_home_usd + mobile_plan_usd × adults

export function calcInternet(
  internet_home_usd: number,
  mobile_plan_usd: number,
  adults: number
): number {
  return internet_home_usd + mobile_plan_usd * adults
}

// ------------------------------------------------------------
// 5. ОБЩЕСТВЕННЫЙ ТРАНСПОРТ
// ------------------------------------------------------------
// Шаг 1. Стоимость проездного на 1 взрослого:
//   если transport_monthly_pass_usd > 0 → берём его
//   иначе → transport_single_ticket_usd × 44 (22 рабочих дня × 2 поездки)
//
// Шаг 2. Итого на семью:
//   pass_checked × pass_adult × (adults + children × 0.5)
//
// pass_checked по стилю жизни:
//   Эконом      = 1 (включён)
//   Базовый     = 1 (включён)
//   Комфорт+    = 0 (выключён — используют такси)

export const TRANSPORT_PASS_CHECKED: Record<LifeStyle, number> = {
  economy:      1,
  comfort:      1,
  comfort_plus: 0,
}

export function calcTransport(
  transport_monthly_pass_usd: number,
  transport_single_ticket_usd: number,
  adults: number,
  children: number,
  lifestyle: LifeStyle
): number {
  const pass_checked = TRANSPORT_PASS_CHECKED[lifestyle]
  if (pass_checked === 0) return 0
  const pass_adult = transport_monthly_pass_usd > 0
    ? transport_monthly_pass_usd
    : transport_single_ticket_usd * 44
  return Math.round(pass_checked * pass_adult * (adults + children * 0.5))
}

// ------------------------------------------------------------
// 6. ТАКСИ
// ------------------------------------------------------------
// = taxi_rides × taxi_ride_avg_usd
// taxi_rides на семью по стилю жизни:
//   Эконом      = 0
//   Базовый     = 8
//   Комфорт+    = 30

export const TAXI_RIDES_PRESET: Record<LifeStyle, number> = {
  economy:      0,
  comfort:      8,
  comfort_plus: 30,
}

export function calcTaxi(
  taxi_ride_avg_usd: number,
  lifestyle: LifeStyle
): number {
  return TAXI_RIDES_PRESET[lifestyle] * taxi_ride_avg_usd
}

// ------------------------------------------------------------
// 7. КАФЕ И ДОСТАВКА
// ------------------------------------------------------------
// = cafe_visits × cafes_usd
// cafe_visits = preset × (adults + children)
// preset по стилю жизни:
//   Эконом      = 0
//   Базовый     = 8  (примерно 2 раза в неделю)
//   Комфорт+    = 20 (примерно 5 раз в неделю)

export const CAFE_VISITS_PRESET: Record<LifeStyle, number> = {
  economy:      0,
  comfort:      8,
  comfort_plus: 20,
}

export function calcCafe(
  cafes_usd: number,
  adults: number,
  children: number,
  lifestyle: LifeStyle
): number {
  const visits = CAFE_VISITS_PRESET[lifestyle] * (adults + children)
  return Math.round(visits * cafes_usd)
}

// ------------------------------------------------------------
// 8. БЬЮТИ-УСЛУГИ
// ------------------------------------------------------------
// = beauty_base_index_usd × V_beauty
// V_beauty по стилю жизни:
//   Эконом      = 0
//   Базовый     = 4.0
//   Комфорт+    = 7.0

export const BEAUTY_MULTIPLIER: Record<LifeStyle, number> = {
  economy:      0,
  comfort:      4.0,
  comfort_plus: 7.0,
}

export function calcBeauty(
  beauty_base_index_usd: number,
  lifestyle: LifeStyle
): number {
  return Math.round(beauty_base_index_usd * BEAUTY_MULTIPLIER[lifestyle])
}

// ------------------------------------------------------------
// 9. ФИТНЕС
// ------------------------------------------------------------
// = fitness_count × fitness_usd
// fitness_count по стилю жизни:
//   Эконом      = 0
//   Базовый     = adults
//   Комфорт+    = adults (только взрослые, у детей — кружки)

export function calcFitness(
  fitness_usd: number,
  adults: number,
  lifestyle: LifeStyle
): number {
  switch (lifestyle) {
    case 'economy':      return 0
    case 'comfort':      return adults * fitness_usd
    case 'comfort_plus': return adults * fitness_usd
  }
}

// ------------------------------------------------------------
// 10. КОВОРКИНГ
// ------------------------------------------------------------
// = coworking_count × coworking_usd
// coworking_count по стилю жизни:
//   Эконом      = 0
//   Базовый     = 0 (работа из дома)
//   Комфорт+    = 1 выделенное место

export const COWORKING_COUNT: Record<LifeStyle, number> = {
  economy:      0,
  comfort:      0,
  comfort_plus: 1,
}

export function calcCoworking(
  coworking_usd: number,
  lifestyle: LifeStyle
): number {
  return COWORKING_COUNT[lifestyle] * coworking_usd
}

// ------------------------------------------------------------
// 11. МЕДИЦИНСКАЯ СТРАХОВКА
// ------------------------------------------------------------
// healthcare_access:
//   'free'           → 0 (бесплатно для всех)
//   'emergency_only' → платная страховка на всех
//   'paid'           → платная страховка на всех
//
// = insurance_private_usd × (adults + children)

export function calcInsurance(
  insurance_private_usd: number,
  healthcare_access: 'free' | 'emergency_only' | 'paid',
  adults: number,
  children: number
): number {
  if (healthcare_access === 'free') return 0
  return insurance_private_usd * (adults + children)
}

// ------------------------------------------------------------
// 12. ДЕТСКИЙ САД
// ------------------------------------------------------------
// если kindergarten_is_free = true → 0
// иначе → kindergarten_usd × kids_in_kindergarten
// kids_in_kindergarten — счётчик из фильтра пользователя

export function calcKindergarten(
  kindergarten_usd: number,
  kindergarten_is_free: boolean,
  kids_in_kindergarten: number
): number {
  if (kindergarten_is_free) return 0
  return kindergarten_usd * kids_in_kindergarten
}

// ------------------------------------------------------------
// 13. ШКОЛА
// ------------------------------------------------------------
// если school_is_free = true → 0
// иначе → school_usd × kids_in_school
// kids_in_school — счётчик из фильтра пользователя

export function calcSchool(
  school_usd: number,
  school_is_free: boolean,
  kids_in_school: number
): number {
  if (school_is_free) return 0
  return school_usd * kids_in_school
}

// ------------------------------------------------------------
// 14. КРУЖКИ И СЕКЦИИ
// ------------------------------------------------------------
// = clubs_count × kids_club_activity_usd
// clubs_count по стилю жизни:
//   Эконом      = 0
//   Базовый     = 1 кружок на всех детей суммарно
//   Комфорт+    = children × 2

export function calcClubs(
  kids_club_activity_usd: number,
  children: number,
  lifestyle: LifeStyle
): number {
  switch (lifestyle) {
    case 'economy':      return 0
    case 'comfort':      return children > 0 ? 1 * kids_club_activity_usd : 0
    case 'comfort_plus': return children * 2 * kids_club_activity_usd
  }
}

// ------------------------------------------------------------
// 15. РАСХОДЫ НА МЛАДЕНЦА
// ------------------------------------------------------------
// если has_baby = true → baby_supplies_usd
// иначе → 0

export function calcBaby(
  baby_supplies_usd: number,
  has_baby: boolean
): number {
  return has_baby ? baby_supplies_usd : 0
}

// ------------------------------------------------------------
// ИТОГОВЫЙ РАСЧЁТ
// ------------------------------------------------------------
// Бюджет = Продукты + Аренда + Коммуналка + Интернет/Связь
//        + Транспорт + Такси + Кафе + Бьюти + Фитнес
//        + Коворкинг + Страховка + Сад + Школа + Кружки + Младенец

export type CalcInput = {
  // Семья
  adults: number
  children: number
  has_baby: boolean
  kids_in_kindergarten: number
  kids_in_school: number

  // Стиль жизни
  lifestyle: LifeStyle

  // Жильё
  price_usd_min: number
  price_usd_max: number
  utilities_usd_min: number

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
  const groceries   = calcGroceries(input.groceries_usd, input.adults, input.children, input.lifestyle)
  const rent        = calcRent(input.price_usd_min, input.price_usd_max, input.lifestyle)
  const utilities   = input.utilities_usd_min
  const internet    = calcInternet(input.internet_home_usd, input.mobile_plan_usd, input.adults)
  const transport   = calcTransport(input.transport_monthly_pass_usd, input.transport_single_ticket_usd, input.adults, input.children, input.lifestyle)
  const taxi        = calcTaxi(input.taxi_ride_avg_usd, input.lifestyle)
  const cafe        = calcCafe(input.cafes_usd, input.adults, input.children, input.lifestyle)
  const beauty      = calcBeauty(input.beauty_base_index_usd, input.lifestyle)
  const fitness     = calcFitness(input.fitness_usd, input.adults, input.lifestyle)
  const coworking   = calcCoworking(input.coworking_usd, input.lifestyle)
  const insurance   = calcInsurance(input.insurance_private_usd, input.healthcare_access, input.adults, input.children)
  const kindergarten = calcKindergarten(input.kindergarten_usd, input.kindergarten_is_free, input.kids_in_kindergarten)
  const school      = calcSchool(input.school_usd, input.school_is_free, input.kids_in_school)
  const clubs       = calcClubs(input.kids_club_activity_usd, input.children, input.lifestyle)
  const baby        = calcBaby(input.baby_supplies_usd, input.has_baby)

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