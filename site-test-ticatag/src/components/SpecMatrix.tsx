import { useState } from 'react'
import { PRODUCTS, type ProductId } from '../lib/data'
import { useI18n } from '../i18n'
import { Reveal } from './ui'

type Row = 'tech' | 'conn' | 'range' | 'battery' | 'ip' | 'use'
const ROWS: Row[] = ['tech', 'conn', 'range', 'battery', 'ip', 'use']

export default function SpecMatrix() {
  const { d } = useI18n()
  const m = d.products.matrix
  const [hover, setHover] = useState<ProductId | null>(null)

  return (
    <section id="matrix" className="bg-slate-50 py-28">
      <div className="wrap">
        <Reveal><span className="eyebrow !text-brand-500">{m.eyebrow}</span></Reveal>
        <Reveal delay={0.08}><h2 className="h2 mt-4 max-w-2xl">{m.title}</h2></Reveal>

        <Reveal delay={0.12} className="mt-10">
          <div className="max-h-[70vh] overflow-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[820px] border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr>
                  <th className="sticky left-0 top-0 z-30 w-40 border-b border-slate-200 bg-white/95 p-4 backdrop-blur" />
                  {PRODUCTS.map((p) => (
                    <th
                      key={p.id}
                      onMouseEnter={() => setHover(p.id)}
                      onMouseLeave={() => setHover(null)}
                      className={`sticky top-0 z-20 border-b border-slate-200 p-4 font-display text-base font-extrabold backdrop-blur transition-colors ${hover === p.id ? 'bg-slate-50/95' : 'bg-white/95'}`}
                    >
                      <span className="mb-1.5 block h-1 w-8 rounded-full" style={{ background: p.color }} />
                      {m.cols[p.id]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r) => (
                  <tr key={r}>
                    <th scope="row" className="sticky left-0 z-10 border-b border-slate-100 bg-white/95 p-4 text-xs font-semibold uppercase tracking-wider text-ink/50 backdrop-blur">{m.rows[r]}</th>
                    {PRODUCTS.map((p) => (
                      <td
                        key={p.id}
                        onMouseEnter={() => setHover(p.id)}
                        onMouseLeave={() => setHover(null)}
                        className={`border-b border-slate-100 p-4 font-medium transition-colors ${hover === p.id ? 'bg-slate-50' : ''} ${r === 'battery' && d.products.specs[p.id][r].includes('5') ? 'text-ok' : ''}`}
                      >
                        {d.products.specs[p.id][r]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-ink/40">{m.note}</p>
        </Reveal>
      </div>
    </section>
  )
}
