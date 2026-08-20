import { getCities } from '@/lib/queries/cities'
import { getFilterReferenceData } from '@/lib/queries/referenceData'
import { CityGrid } from '@/components/city/CityGrid'
import { PageHero } from '@/components/shared/PageHero'
import { QuickFilter } from '@/components/filters/QuickFilter'

import { Suspense } from 'react'

export default async function HomePage() {
  const [cities, reference] = await Promise.all([getCities(), getFilterReferenceData()])

  return (
    <main>
      <PageHero
        breadcrumbs={[
          { label: 'Главная', href: '/' },
          { label: 'Каталог городов' },
        ]}
        title="Каталог городов мира для переезда"
        description="Считай стоимость жизни, сравнивай климат, безопасность и визовые условия. Фильтруй по бюджету и находи свой идеальный вариант."
      />
      <Suspense fallback={null}>
        <QuickFilter reference={reference} />
      </Suspense>
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={null}>
          <CityGrid cities={cities} reference={reference} />
        </Suspense>
      </div>
    </main>
  )
}