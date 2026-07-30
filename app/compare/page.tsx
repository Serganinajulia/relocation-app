import { PageHero } from '@/components/shared/PageHero'

export default function ComparePage() {
  return (
    <main>
      <PageHero
        breadcrumbs={[
          { label: 'Главная', href: '/' },
          { label: 'Сравнение' },
        ]}
        title="Сравнение городов"
        description="Здесь можно будет сравнить несколько городов бок о бок по всем параметрам. Раздел в разработке."
      />
    </main>
  )
}