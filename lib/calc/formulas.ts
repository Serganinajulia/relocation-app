// ============================================
// ФОРМУЛЫ РАСЧЁТА СТОИМОСТИ ЖИЗНИ — ReloCalc
// ============================================

// --- КОЭФФИЦИЕНТЫ ПРОДУКТОВ ---
// Базовая корзина groceries_usd рассчитана на 1 взрослого/месяц
export const GROCERIES_COEFFICIENTS = {
    first_adult: 1.0,    // первый взрослый
    extra_adult: 0.7,    // каждый доп. взрослый
    child: 0.4,          // ребёнок
  }
  
  // --- СТОИМОСТЬ ЖИЗНИ (без аренды) ---
  // Дефолт (1 человек):
  //   groceries × 1.0 + internet + utilities_min (студия или мин запись выбранного типа жилья)
  //
  // Калькулятор (семья):
  //   groceries × (1.0 + extra_adults × 0.7 + children × 0.4) + internet + utilities_min
  
  export function calcGroceriesMultiplier(adults: number, children: number): number {
    if (adults === 0) return 0
    return GROCERIES_COEFFICIENTS.first_adult
      + (adults - 1) * GROCERIES_COEFFICIENTS.extra_adult
      + children * GROCERIES_COEFFICIENTS.child
  }
  
  // --- АРЕНДА ---
  // Дефолт:
  //   min = минимум студии данного типа жилья в городе
  //   max = максимум 1+ спальни данного типа жилья в городе
  //
  // Калькулятор:
  //   min = price_usd_min выбранного типа и кол-ва комнат
  //   max = price_usd_max выбранного типа и кол-ва комнат
  
  // --- БЮДЖЕТ ОТ ---
  //   стоимость жизни (мин) + аренда мин