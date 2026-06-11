import Link from 'next/link'

type Breadcrumb = {
  label: string
  href?: string
}

type Props = {
  breadcrumbs?: Breadcrumb[]
  title: string
  description?: string
}

export function PageHero({ breadcrumbs, title, description }: Props) {
  return (
    <div className="bg-white border-b border-border">
      <div className="container mx-auto px-4 py-8">

        {/* Хлебные крошки */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-sm text-steel mb-3">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-border">→</span>}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-brand transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-ink">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        {/* Заголовок */}
        <h1 className="text-3xl mb-2 text-ink">{title}</h1>

        {/* Описание */}
        {description && (
          <p className="text-steel text-sm max-w-2xl leading-relaxed">
            {description}
          </p>
        )}

      </div>
    </div>
  )
}