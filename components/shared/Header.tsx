'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MapPin, Search, Send, ChevronDown, X, Loader2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

type CityResult = { id: string; name: string; countryId: string; countryName: string }
type PageMatch = { label: string; href: string }

const NAV_LINKS = [
  { label: 'Каталог', href: '/' },
  { label: 'Избранное', href: '/favorites' },
  { label: 'Сравнение', href: '/compare' },
  { label: 'О проекте', href: '/about' },
]

// Статичные страницы ищутся мгновенно на клиенте — не нужен запрос к серверу ради 4 пунктов
const STATIC_PAGES: PageMatch[] = NAV_LINKS

const LANGUAGES = [
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
]

export function Header() {
  const router = useRouter()
  const [langOpen, setLangOpen] = useState(false)
  const [currentLang, setCurrentLang] = useState('ru')
  const [query, setQuery] = useState('')
  const [suggestOpen, setSuggestOpen] = useState(false)
  const [cityResults, setCityResults] = useState<CityResult[]>([])
  const [loading, setLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const activeLang = LANGUAGES.find(l => l.code === currentLang)!

  const pageMatches = query.trim()
    ? STATIC_PAGES.filter(p => p.label.toLowerCase().includes(query.trim().toLowerCase()))
    : []

  // Города ищутся на сервере (их могут быть тысячи — весь список в браузер не тянем).
  // Debounce 300мс — иначе на каждую нажатую букву летел бы отдельный запрос к базе.
  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      setCityResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`)
        const data = await res.json()
        setCityResults(data.results ?? [])
      } catch {
        setCityResults([])
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(timeout)
  }, [query])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSuggestOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function goTo(href: string) {
    router.push(href)
    setSuggestOpen(false)
    setQuery('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') { setSuggestOpen(false); return }
    if (e.key !== 'Enter') return
    // Enter — переход на первый подходящий результат (страницу или город)
    if (pageMatches.length > 0) goTo(pageMatches[0].href)
    else if (cityResults.length > 0) goTo(`/countries/${cityResults[0].countryId}/cities/${cityResults[0].id}`)
  }

  function clearSearch() {
    setQuery('')
    setCityResults([])
    setSuggestOpen(false)
  }

  const hasAnyMatches = pageMatches.length > 0 || cityResults.length > 0

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

        {/* Поиск — живые подсказки, ведут сразу на нужную страницу (город/раздел), без Enter */}
        <div className="relative flex-1 max-w-xs hidden md:block" ref={searchRef}>
          <div className="flex items-center gap-2 bg-porcelain rounded-lg px-3 py-1.5">
            <Search size={15} className="text-steel shrink-0" />
            <input
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setSuggestOpen(true) }}
              onFocus={() => query && setSuggestOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Найти город или раздел..."
              className="bg-transparent text-sm text-ink placeholder:text-steel outline-none w-full"
            />
            {loading && <Loader2 size={14} className="text-steel animate-spin shrink-0" />}
            {query && !loading && (
              <button onClick={clearSearch} className="text-steel hover:text-ink transition-colors shrink-0">
                <X size={14} />
              </button>
            )}
          </div>

          {suggestOpen && query.trim() && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-border rounded-xl shadow-lg py-1 z-50 max-h-80 overflow-y-auto">
              {pageMatches.length > 0 && (
                <div className="mb-1 last:mb-0">
                  <p className="text-xs text-steel font-medium px-3 py-1">Разделы</p>
                  {pageMatches.map(p => (
                    <button
                      key={p.href}
                      onClick={() => goTo(p.href)}
                      className="w-full flex items-center px-3 py-2 text-sm text-ink hover:bg-porcelain transition-colors text-left"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              )}

              {cityResults.length > 0 && (
                <div className="mb-1 last:mb-0">
                  <p className="text-xs text-steel font-medium px-3 py-1">Города</p>
                  {cityResults.map(c => (
                    <button
                      key={c.id}
                      onClick={() => goTo(`/countries/${c.countryId}/cities/${c.id}`)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm text-ink hover:bg-porcelain transition-colors text-left"
                    >
                      <span>{c.name}</span>
                      <span className="text-xs text-steel">{c.countryName}</span>
                    </button>
                  ))}
                </div>
              )}

              {!loading && !hasAnyMatches && (
                <p className="px-3 py-2 text-sm text-steel">Ничего не найдено</p>
              )}
            </div>
          )}
        </div>

        {/* Правая часть */}
        <div className="ml-auto flex items-center gap-2">

          {/* Telegram */}
           <a
            href="https://t.me/julia_serganina"
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