import { useCallback } from 'react'
import { useLanguage, type LanguageCode } from '@/store/LanguageContext'

/**
 * A piece of text available in every supported language.
 *
 * Translations are co-located with the code that renders them, so there is no
 * central translation file to keep in sync. Render one with {@link useTr}.
 */
export type Localized = { fr: string; en: string; ar: string }

/** Either a plain (untranslated) string or a {@link Localized} value. */
export type Translatable = string | Localized

/** Resolve a {@link Translatable} for a specific language (French falls back). */
export function translate(value: Translatable, lang: LanguageCode): string {
  if (typeof value === 'string') return value
  return value[lang] ?? value.fr ?? value.en
}

/**
 * Returns a `tr()` function bound to the active language.
 *
 * @example
 * const tr = useTr()
 * return <h1>{tr({ fr: 'Bonjour', en: 'Hello', ar: 'مرحبا' })}</h1>
 */
export function useTr(): (value: Translatable) => string {
  const { lang } = useLanguage()
  return useCallback((value: Translatable) => translate(value, lang), [lang])
}
