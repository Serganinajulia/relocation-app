import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim() ?? ''
  if (!q) return NextResponse.json({ results: [] })

  const { data, error } = await supabase
    .from('cities')
    .select('id, name_i18n, country_id, countries!fk_cities_country(name_i18n)')
    .ilike('name_i18n->>ru', `%${q}%`)
    .limit(8)

  if (error) {
    console.error('search api error:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
    return NextResponse.json({ results: [] })
  }

  const results = (data ?? []).map(c => ({
    id: c.id,
    name: (c.name_i18n as any)?.ru ?? '',
    countryId: c.country_id,
    countryName: (c.countries as any)?.name_i18n?.ru ?? '',
  }))

  return NextResponse.json({ results })
}