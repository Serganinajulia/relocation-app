import { PageHero } from '@/components/shared/PageHero'

export default function AboutPage() {
  return (
    <main>
      <PageHero
        breadcrumbs={[
          { label: 'Главная', href: '/' },
          { label: 'О проекте' },
        ]}
        title="О проекте"
        description="ReloCalc — сервис для сравнения городов мира при релокации: стоимость жизни, климат, безопасность, визовые условия. Страница в разработке."
      />
    </main>
  )
}