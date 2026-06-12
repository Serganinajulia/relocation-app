'use client'

import { useState, useRef, useEffect } from 'react'
import { Info } from 'lucide-react'

type Props = {
  text: string
  link?: { label: string; href: string }
}

export function InfoTooltip({ text, link }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative inline-flex" ref={ref}>
      <button
        onClick={() => setOpen(prev => !prev)}
        className="text-steel hover:text-brand transition-colors"
      >
        <Info size={13} />
      </button>
      {open && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-ink text-white text-xs rounded-lg px-3 py-2 shadow-lg z-50">
          <p>{text}</p>
          {link && (
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="mt-1.5 inline-block text-brand hover:underline"
            >
              {link.label} →
            </a>
          )}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-ink" />
        </div>
      )}
    </div>
  )
}