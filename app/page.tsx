import { getCities } from '@/lib/queries/cities'
import { CityGrid } from '@/components/city/CityGrid'
import { PageHero } from '@/components/shared/PageHero'

export default async function HomePage() {
  const cities = await getCities()

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
      <div className="container mx-auto px-4 py-8">
        <CityGrid cities={cities} />
      </div>
    </main>
  )
}