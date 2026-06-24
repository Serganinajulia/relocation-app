import { getCities } from '@/lib/queries/cities'
import { CityGrid } from '@/components/city/CityGrid'
import { PageHero } from '@/components/shared/PageHero'
import { QuickFilter } from '@/components/filters/QuickFilter'

export default async function HomePage({
  searchParams,
}: {
  searchParams: { housing_type?: string; bedrooms?: string; adults?: string; children?: string }
}) {
  const cities = await getCities()

  const housingType = searchParams.housing_type ?? 'apartment'
  const bedrooms = searchParams.bedrooms ? parseInt(searchParams.bedrooms) : null
  const adults = parseInt(searchParams.adults ?? '1')
  const children = parseInt(searchParams.children ?? '0')

  return (
    <main>
      <PageHero
        breadcrumbs={[
          { label: 'Главная', href: '/' },
          { label: 'Каталог городов' },
        ]}
        title="Каталог городов для релокации"
        description="Сравнивай стоимость жизни, климат, безопасность и визовые условия в популярных городах для переезда. Фильтруй по бюджету и находи свой идеальный вариант."
      />
      <QuickFilter />
      <div className="container mx-auto px-4 py-8">
        <CityGrid
          cities={cities}
          housingType={housingType}
          bedrooms={bedrooms}
          adults={adults}
          children={children}
        />
      </div>
    </main>
  )
}