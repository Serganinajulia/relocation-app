'use client'

import Link from 'next/link'
import { MapPin, Search, Send, ChevronDown } from 'lucide-react'
import { useState } from 'react'

const NAV_LINKS = [
  { label: 'Каталог', href: '/catalog' },
  { label: 'Сравнение', href: '/compare' },
  { label: 'Рейтинги', href: '/ratings' },
  { label: 'О проекте', href: '/about' },
]

const LANGUAGES = [
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
]

export function Header() {
  const [langOpen, setLangOpen] = useState(false)
  const [currentLang, setCurrentLang] = useState('ru')

  const activeLang = LANGUAGES.find(l => l.code === currentLang)!

  return (
    <header className="w-full bg-white border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center gap-6">

        {/* Логотип */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <MapPin size={20} className="text-brand" />
          <span className="font-bold text-ink text-lg">ReloCalc</span>
        </Link>

        {/* Навигация */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 text-sm text-steel hover:text-ink hover:bg-porcelain rounded-lg transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Поиск */}
        <div className="flex-1 max-w-xs hidden md:flex items-center gap-2 bg-porcelain rounded-lg px-3 py-1.5">
          <Search size={15} className="text-steel shrink-0" />
          <input
            type="text"
            placeholder="Найти город..."
            className="bg-transparent text-sm text-ink placeholder:text-steel outline-none w-full"
          />
        </div>

        {/* Правая часть */}
        <div className="ml-auto flex items-center gap-2">

          {/* Telegram */}
           <a
            href="https://t.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-steel hover:text-brand hover:bg-porcelain transition-colors"
            title="Telegram"
          >
            <Send size={17} />
          </a>

          {/* Язык */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(prev => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-steel hover:text-ink hover:bg-porcelain transition-colors"
            >
              <span>{activeLang.flag}</span>
              <span className="hidden sm:inline">{activeLang.code.toUpperCase()}</span>
              <ChevronDown size={14} />
            </button>

            {langOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-border rounded-xl shadow-md py-1 min-w-[130px] z-50">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => { setCurrentLang(lang.code); setLangOpen(false) }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-porcelain
                      ${currentLang === lang.code ? 'text-brand font-medium' : 'text-ink'}`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  )
}