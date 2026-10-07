import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { RotateCcw } from 'lucide-react'
import { PRODUCTS, type IndId, type TechId } from '../lib/data'
import ProductCard from '../components/ProductCard'
import ProductViewer3D from '../components/ProductViewer3D'
import SpecMatrix from '../components/SpecMatrix'
import CtaBand from '../components/CtaBand'
import { PageHeader } from '../components/ui'
import { useI18n } from '../i18n'

const TECHS: TechId[] = ['ble', 'gps', 'lte', 'sensor']
const INDS: IndId[] = ['medical', 'logistics', 'btp', 'sport', 'cold']

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${on ? 'border-brand-500 bg-brand-500 text-white shadow-[0_0_24px_rgba(0,102,255,.5)]' : 'border-white/15 bg-white/5 text-white/70 hover:border-white/40 hover:text-white'}`}
    >
      {children}
    </button>
  )
}

export default function Products() {
  const { d } = useI18n()
  const p = d.products
  const [tech, setTech] = useState<TechId | null>(null)
  const [ind, setInd] = useState<IndId | null>(null)

  const list = useMemo(
    () => PRODUCTS.filter((x) => (!tech || x.techs.includes(tech)) && (!ind || x.inds.includes(ind))),
    [tech, ind],
  )

  return (
    <>
      <PageHeader eyebrow={p.eyebrow} title={p.title} sub={p.sub} />

      <section className="bg-ink pb-28 text-white">
        <div className="wrap">
          <div className="grid gap-5 rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 md:grid-cols-2">
            <div>
              <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">{p.techFilter}</div>
              <div className="flex flex-wrap gap-2">
                <Chip on={!tech} onClick={() => setTech(null)}>{p.all}</Chip>
                {TECHS.map((t) => <Chip key={t} on={tech === t} onClick={() => setTech(tech === t ? null : t)}>{d.techs[t]}</Chip>)}
              </div>
            </div>
            <div>
              <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">{p.indFilter}</div>
              <div className="flex flex-wrap gap-2">
                <Chip on={!ind} onClick={() => setInd(null)}>{p.all}</Chip>
                {INDS.map((t) => <Chip key={t} on={ind === t} onClick={() => setInd(ind === t ? null : t)}>{d.inds[t]}</Chip>)}
              </div>
            </div>
          </div>

          <motion.div layout className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {list.map((x) => (
                <motion.div key={x.id} layout initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} transition={{ duration: 0.35 }}>
                  <ProductCard p={x} to={x.featured ? '/products#viewer' : '/products#matrix'} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {list.length === 0 && (
            <div className="mt-10 text-center text-white/55">
              <p>{p.none}</p>
              <button onClick={() => { setTech(null); setInd(null) }} className="btn-ghost mt-4"><RotateCcw size={14} /> {p.reset}</button>
            </div>
          )}
        </div>
      </section>

      <ProductViewer3D />
      <SpecMatrix />
      <CtaBand />
    </>
  )
}
