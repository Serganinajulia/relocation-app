import Link from 'next/link'
import { MapPin, Send } from 'lucide-react'

const FOOTER_LINKS = [
  { label: 'Каталог', href: '/' },
  { label: 'Избранное', href: '/favorites' },
  { label: 'Сравнение', href: '/compare' },
  { label: 'О проекте', href: '/about' },
]

export function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="container mx-auto px-4 py-10 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">

          <div className="flex flex-col gap-3 max-w-sm">
            <div className="flex items-center gap-2">
              <MapPin size={20} className="text-brand" />
              <span className="font-bold text-lg">ReloCalc</span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Сервис для сравнения городов мира при релокации: стоимость жизни, климат, безопасность, визовые условия.
            </p>
          </div>

          <nav className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-wide text-white/40 mb-1">Навигация</span>
            {FOOTER_LINKS.map(link => (
              <Link key={link.href} href={link.href} className="text-sm text-white/70 hover:text-brand transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-wide text-white/40 mb-1">Связь</span>
            <a
              href="https://t.me/julia_serganina"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-white/70 hover:text-brand transition-colors"
            >
              <Send size={15} />
              Telegram
            </a>
          </div>

        </div>

        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/40">
          <span>© {new Date().getFullYear()} ReloCalc</span>
          <span>Сделано для тех, кто ищет новый дом</span>
        </div>
      </div>
    </footer>
  )
}