import { getCities } from '@/lib/queries/cities'
import { CityCard } from '@/components/city/CityCard'

export default async function HomePage() {
  const cities = await getCities()

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        Найди свой город для релокации
      </h1>

      {/* Сетка карточек городов */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cities.map((city) => (
          <CityCard key={city.id} city={city} />
        ))}
      </div>
    </main>
  )
}