import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import fr, { type Dict } from './fr'
import en from './en'

export type Lang = 'fr' | 'en'
const dicts: Record<Lang, Dict> = { fr, en }

type Ctx = { lang: Lang; d: Dict; setLang: (l: Lang) => void; toggle: () => void }
const I18nCtx = createContext<Ctx | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const s = localStorage.getItem('ticatag-lang')
      if (s === 'fr' || s === 'en') return s
    } catch { /* ignore */ }
    return 'fr'
  })
  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try { localStorage.setItem('ticatag-lang', l) } catch { /* ignore */ }
  }, [])
  useEffect(() => { document.documentElement.lang = lang }, [lang])
  const value = useMemo<Ctx>(() => ({ lang, d: dicts[lang], setLang, toggle: () => setLang(lang === 'fr' ? 'en' : 'fr') }), [lang, setLang])
  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>
}

export function useI18n() {
  const c = useContext(I18nCtx)
  if (!c) throw new Error('useI18n outside provider')
  return c
}
