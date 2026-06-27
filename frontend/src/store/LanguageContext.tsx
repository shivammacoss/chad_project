import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'

export type LanguageCode = 'en' | 'fr' | 'ar'

export interface Language {
  code: LanguageCode
  /** Native name shown in the switcher. */
  label: string
  /** English name (for aria labels). */
  englishLabel: string
  flag: string
  dir: 'ltr' | 'rtl'
}

/** Supported languages, in display order. French is the default. */
// eslint-disable-next-line react-refresh/only-export-components
export const LANGUAGES: Language[] = [
  { code: 'fr', label: 'Français', englishLabel: 'French', flag: '🇫🇷', dir: 'ltr' },
  { code: 'en', label: 'English', englishLabel: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'ar', label: 'العربية', englishLabel: 'Arabic', flag: '🇸🇦', dir: 'ltr' },
]

/** Default language used when nothing has been chosen yet. */
export const DEFAULT_LANG: LanguageCode = 'fr'

const STORAGE_KEY = 'gate.lang'

interface LanguageValue {
  lang: LanguageCode
  language: Language
  setLang: (code: LanguageCode) => void
}

const LanguageCtx = createContext<LanguageValue | null>(null)

function isLanguageCode(v: unknown): v is LanguageCode {
  return v === 'en' || v === 'fr' || v === 'ar'
}

function readStored(): LanguageCode {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (isLanguageCode(v)) return v
  } catch {
    // localStorage may be unavailable (private mode / SSR) — fall back to default.
  }
  return DEFAULT_LANG
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LanguageCode>(readStored)

  const language = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0]

  // Keep the document language in sync with the choice. We intentionally do NOT
  // set `dir`: the layout stays left-to-right for every language (including
  // Arabic) — only the text content is translated.
  useEffect(() => {
    document.documentElement.lang = language.code
  }, [language])

  const setLang = useCallback((code: LanguageCode) => {
    setLangState(code)
    try {
      localStorage.setItem(STORAGE_KEY, code)
    } catch {
      // ignore persistence failures
    }
  }, [])

  return <LanguageCtx.Provider value={{ lang, language, setLang }}>{children}</LanguageCtx.Provider>
}

/**
 * Fallback used when no provider is mounted (e.g. components rendered in
 * isolation under test). Resolves to English so the original copy shows.
 */
const FALLBACK: LanguageValue = {
  lang: 'en',
  language: LANGUAGES.find((l) => l.code === 'en') ?? LANGUAGES[0],
  setLang: () => {},
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage(): LanguageValue {
  return useContext(LanguageCtx) ?? FALLBACK
}
