import { supabase } from '@/lib/supabase'

// Функция получения всех стран
// Используется для фильтра по стране и страницы списка стран
export async function getCountries() {
  const { data, error } = await supabase
    .from('countries')
    .select(`
      id,
      name_i18n,
      currency,
      passport_strength,
      remote_income_tax_type,
      remote_income_tax_note_i18n
    `)

  if (error) {
    console.error('getCountries error:', error)
    return []
  }

  return data
}

// Функция получения одной страны по id
// Используется на странице страны — тянем все поля
export async function getCountryById(id: string) {
  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .eq('id', id)
    .single() // ожидаем ровно одну запись

  if (error) {
    console.error('getCountryById error:', error)
    return null
  }

  return data
}