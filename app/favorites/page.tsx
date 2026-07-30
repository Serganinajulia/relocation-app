import { PageHero } from '@/components/shared/PageHero'

export default function FavoritesPage() {
  return (
    <main>
      <PageHero
        breadcrumbs={[
          { label: 'Главная', href: '/' },
          { label: 'Избранное' },
        ]}
        title="Избранное"
        description="Здесь появятся города, которые вы сохраните. Раздел в разработке."
      />
    </main>
  )
}