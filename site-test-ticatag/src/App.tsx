import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'

const Products = lazy(() => import('./pages/Products'))
const Solutions = lazy(() => import('./pages/Solutions'))
const Platform = lazy(() => import('./pages/Platform'))

gsap.registerPlugin(ScrollTrigger)

let lenisRef: Lenis | null = null
export const scrollToId = (id: string) => {
  const el = document.getElementById(id)
  if (!el) return
  if (lenisRef) lenisRef.scrollTo(el, { offset: -72 })
  else el.scrollIntoView({ behavior: 'smooth' })
}

export default function App() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
    lenisRef = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (t: number) => lenis.raf(t * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      lenisRef = null
    }
  }, [])

  useEffect(() => {
    if (hash) {
      const id = hash.slice(1)
      setTimeout(() => scrollToId(id), 350)
    } else if (lenisRef) lenisRef.scrollTo(0, { immediate: true })
    else window.scrollTo(0, 0)
  }, [pathname, hash])

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main>
        <Suspense fallback={<div className="grid h-screen place-items-center bg-ink text-beacon">…</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/solutions" element={<Solutions />} />
            <Route path="/platform" element={<Platform />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
