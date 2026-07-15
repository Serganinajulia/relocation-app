// ------------------------------------------------------------
// ПОДСВЕТКА ЗАПАСА БЮДЖЕТА
// ------------------------------------------------------------
// Статус показывает, насколько комфортно бюджет пользователя
// покрывает стоимость выбранного (или сравниваемого) стиля жизни.
//
// Пороги — гибрид (% от стоимости + абсолютный "пол" в долларах),
// стартовые значения, калибруются позже на реальных данных по городам.

export type BudgetStatus = 'exceeds' | 'comfortable' | 'tight' | 'insufficient'

// Нижний порог "впритык → комфортно": 10% от бюджета, но не меньше $50
const TIGHT_THRESHOLD_PERCENT = 0.10
const TIGHT_THRESHOLD_FLOOR_USD = 50

// Верхний порог "комфортно → с запасом": 30% от бюджета, но не меньше $400
const COMFORTABLE_THRESHOLD_PERCENT = 0.30
const COMFORTABLE_THRESHOLD_FLOOR_USD = 400

export function getBudgetStatus(budget: number, cost: number): BudgetStatus {
  if (budget < cost) return 'insufficient'

  const surplus = budget - cost

  // Проценты считаются от бюджета (дохода), а не от стоимости —
  // как в финансовом планировании процент сбережений считают от дохода
  const tightThreshold = Math.max(budget * TIGHT_THRESHOLD_PERCENT, TIGHT_THRESHOLD_FLOOR_USD)
  const comfortableThreshold = Math.max(budget * COMFORTABLE_THRESHOLD_PERCENT, COMFORTABLE_THRESHOLD_FLOOR_USD)

  if (surplus < tightThreshold) return 'tight'
  if (surplus < comfortableThreshold) return 'comfortable'
  return 'exceeds'
}