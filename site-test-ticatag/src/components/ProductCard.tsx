import { useRef, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import ProductGlyph from './ProductGlyph'
import type { Product } from '../lib/data'
import { useI18n } from '../i18n'

/** 3D tilt card with a cursor-following glow whose colour matches the product status. */
export default function ProductCard({ p, dark = true, to = '/products' }: { p: Product; dark?: boolean; to?: string }) {
  const { d } = useI18n()
  const ref = useRef<HTMLAnchorElement>(null)
  const info = d.catalog.products[p.id]

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current
    if (!el || e.pointerType === 'touch') return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    el.style.setProperty('--rx', `${(0.5 - y) * 12}deg`)
    el.style.setProperty('--ry', `${(x - 0.5) * 14}deg`)
    el.style.setProperty('--mx', `${x * 100}%`)
    el.style.setProperty('--my', `${y * 100}%`)
  }
  const onLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg')
  }

  const style = { '--c': p.color, '--rx': '0deg', '--ry': '0deg', '--mx': '50%', '--my': '50%' } as CSSProperties

  return (
    <Link
      ref={ref}
      to={to}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={style}
      className="group relative block rounded-3xl p-px outline-none transition-[transform,box-shadow] duration-200 [transform:perspective(900px)_rotateX(var(--rx))_rotateY(var(--ry))] hover:shadow-[0_0_48px_-6px_var(--c)] focus-visible:shadow-[0_0_48px_-6px_var(--c)]"
    >
      {/* glowing border */}
      <span
        className="absolute inset-0 rounded-3xl opacity-40 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: 'radial-gradient(260px circle at var(--mx) var(--my), var(--c), transparent 70%)' }}
      />
      <span className={`relative flex h-full flex-col overflow-hidden rounded-[calc(1.5rem-1px)] p-6 ${dark ? 'bg-ink-800' : 'bg-white'}`}>
        <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold" style={{ color: p.color, borderColor: `${p.color}55`, background: `${p.color}14` }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color, boxShadow: `0 0 8px ${p.color}` }} />
          {d.status[p.status]}
        </span>
        <span className="mx-auto block h-36 w-full max-w-[220px] transition-transform duration-500 group-hover:scale-110 [transform:translateZ(40px)]">
          <ProductGlyph id={p.id} color={p.color} />
        </span>
        <span className="mt-4 block font-display text-2xl font-extrabold text-white">{info.name}</span>
        <span className="mt-1 block text-sm font-medium" style={{ color: p.color }}>{info.tagline}</span>
        <span className="mt-3 block flex-1 text-sm leading-relaxed text-white/55">{info.desc}</span>
        <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-white/80 transition group-hover:gap-2 group-hover:text-white">
          {d.catalog.discover} <ArrowUpRight size={15} />
        </span>
      </span>
    </Link>
  )
}
