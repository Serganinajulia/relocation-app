import { getCities } from '@/lib/queries/cities'
import { CityGrid } from '@/components/city/CityGrid'

export default async function CountryPage() {
  const cities = await getCities()

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        Найди свой город для релокации
      </h1>
      <CityGrid cities={cities} />
    </main>
  )
}