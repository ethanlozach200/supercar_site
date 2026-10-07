import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { PRODUCTS } from '../lib/data'
import ProductCard from './ProductCard'
import { Reveal } from './ui'
import { useI18n } from '../i18n'

export default function ProductGrid() {
  const { d } = useI18n()
  const c = d.catalog
  return (
    <section id="products" className="relative bg-ink py-28 text-white">
      <div className="wrap">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Reveal><span className="eyebrow">{c.eyebrow}</span></Reveal>
            <Reveal delay={0.08}><h2 className="h2 mt-4 max-w-2xl">{c.title}</h2></Reveal>
            <Reveal delay={0.16}><p className="mt-4 max-w-xl text-white/60">{c.sub}</p></Reveal>
          </div>
          <Reveal><Link to="/products" className="btn-ghost shrink-0">{c.cta} <ArrowRight size={16} /></Link></Reveal>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.06}><ProductCard p={p} /></Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
