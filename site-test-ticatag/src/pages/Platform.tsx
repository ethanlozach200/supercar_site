import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Battery, BellRing, Check, LogIn, LogOut, MapPinned, PenTool, Plug, Radio, Thermometer, Trash2, Waves, X, Zap } from 'lucide-react'
import { PageHeader, Reveal } from '../components/ui'
import CtaBand from '../components/CtaBand'
import { useI18n } from '../i18n'

type AssetType = 'om1s' | 'tg230' | 'sensor'
type AlertKind = 'enter' | 'exit' | 'battery' | 'temp' | 'shock'
type Pt = [number, number]

interface Asset { id: number; name: string; type: AssetType; x: number; y: number; vx: number; vy: number; battery: number; lowFlag: boolean }
interface Zone { id: number; name: string; color: string; points: Pt[] }
interface Alert { id: number; ts: number; kind: AlertKind; asset: string; zone?: string }

const W = 800, H = 480
const ZONE_COLORS = ['#00D2FF', '#8B5CF6', '#10B981', '#F59E0B']
const TYPE_COLOR: Record<AssetType, string> = { om1s: '#00D2FF', tg230: '#8B5CF6', sensor: '#10B981' }
const KIND_META: Record<AlertKind, { color: string; Icon: typeof LogIn }> = {
  enter: { color: '#10B981', Icon: LogIn },
  exit: { color: '#F59E0B', Icon: LogOut },
  battery: { color: '#F59E0B', Icon: Battery },
  temp: { color: '#EF4444', Icon: Thermometer },
  shock: { color: '#8B5CF6', Icon: Zap },
}

function pointInPoly(p: Pt, poly: Pt[]) {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j]
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

function makeAssets(): Asset[] {
  const spec: [AssetType, number][] = [['om1s', 5], ['tg230', 4], ['sensor', 4]]
  const tag: Record<AssetType, string> = { om1s: 'OM1S', tg230: 'TG230', sensor: 'TMP' }
  const out: Asset[] = []
  let id = 0
  for (const [type, n] of spec) {
    for (let i = 0; i < n; i++) {
      const sp = type === 'tg230' ? 22 : 11
      const a = Math.random() * Math.PI * 2
      out.push({
        id: id++, name: `${tag[type]}-${String(i + 1).padStart(3, '0')}`, type,
        x: 80 + Math.random() * (W - 160), y: 70 + Math.random() * (H - 140),
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        battery: id === 3 ? 19 : id === 9 ? 17 : Math.round(45 + Math.random() * 55), lowFlag: false,
      })
    }
  }
  return out
}

const INITIAL_ZONE: Zone = { id: 1, name: 'Zone 1', color: ZONE_COLORS[0], points: [[120, 110], [400, 110], [400, 300], [120, 300]] }

export default function Platform() {
  const { d, lang } = useI18n()
  const p = d.platform
  const dRef = useRef(p)
  dRef.current = p

  const assetsRef = useRef<Asset[]>(makeAssets())
  const [, setFrame] = useState(0)
  const [zones, setZones] = useState<Zone[]>([INITIAL_ZONE])
  const zonesRef = useRef(zones)
  zonesRef.current = zones
  const zoneSeq = useRef(2)
  const alertSeq = useRef(1)
  const prevInside = useRef<Map<number, Set<number>>>(new Map())
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [alertTotal, setAlertTotal] = useState(0)
  const [drawing, setDrawing] = useState(false)
  const [draft, setDraft] = useState<Pt[]>([])
  const [cursor, setCursor] = useState<Pt | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const push = useCallback((kind: AlertKind, asset: string, zone?: string) => {
    setAlerts((a) => [{ id: alertSeq.current++, ts: Date.now(), kind, asset, zone }, ...a].slice(0, 40))
    setAlertTotal((n) => n + 1)
  }, [])

  // Simulation loop
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dt = 0.12
    let tick = 0
    // seed a first alert quickly so the feed is never empty
    const seed = setTimeout(() => push('temp', 'TMP-002'), 900)
    const id = setInterval(() => {
      tick++
      for (const a of assetsRef.current) {
        if (!reduce) {
          if (Math.random() < 0.04) {
            const ang = Math.random() * Math.PI * 2
            const sp = a.type === 'tg230' ? 22 : 11
            a.vx = Math.cos(ang) * sp; a.vy = Math.sin(ang) * sp
          }
          a.x += a.vx * dt; a.y += a.vy * dt
          if (a.x < 24 || a.x > W - 24) { a.vx *= -1; a.x = Math.min(W - 24, Math.max(24, a.x)) }
          if (a.y < 24 || a.y > H - 24) { a.vy *= -1; a.y = Math.min(H - 24, Math.max(24, a.y)) }
        }
        if (tick % 40 === 0 && a.battery > 5 && Math.random() < 0.5) a.battery -= 1
        if (a.battery < 20 && !a.lowFlag) { a.lowFlag = true; push('battery', a.name) }

        const now = new Set<number>()
        for (const z of zonesRef.current) if (pointInPoly([a.x, a.y], z.points)) now.add(z.id)
        const before = prevInside.current.get(a.id)
        if (before) {
          for (const zid of now) if (!before.has(zid)) push('enter', a.name, zonesRef.current.find((z) => z.id === zid)?.name)
          for (const zid of before) if (!now.has(zid)) { const z = zonesRef.current.find((q) => q.id === zid); if (z) push('exit', a.name, z.name) }
        }
        prevInside.current.set(a.id, now)
      }
      if (tick % 55 === 0) {
        const s = assetsRef.current.filter((a) => a.type === 'sensor')
        push(Math.random() < 0.6 ? 'temp' : 'shock', s[Math.floor(Math.random() * s.length)].name)
      }
      setFrame((f) => (f + 1) % 1e6)
    }, dt * 1000)
    return () => { clearInterval(id); clearTimeout(seed) }
  }, [push])

  // Esc cancels drawing
  useEffect(() => {
    if (!drawing) return
    const on = (e: KeyboardEvent) => { if (e.key === 'Escape') cancel() }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [drawing])

  const toSvg = (e: React.PointerEvent | React.MouseEvent): Pt => {
    const svg = svgRef.current!
    const pt = svg.createSVGPoint()
    pt.x = e.clientX; pt.y = e.clientY
    const m = svg.getScreenCTM()!.inverse()
    const r = pt.matrixTransform(m)
    return [Math.round(Math.max(0, Math.min(W, r.x))), Math.round(Math.max(0, Math.min(H, r.y)))]
  }

  const cancel = () => { setDrawing(false); setDraft([]); setCursor(null) }
  const validate = (pts: Pt[]) => {
    if (pts.length < 3) return
    const n = zoneSeq.current++
    setZones((z) => [...z, { id: n, name: `${dRef.current.zoneName} ${n}`, color: ZONE_COLORS[(n - 1) % ZONE_COLORS.length], points: pts }])
    cancel()
  }
  const onMapClick = (e: React.MouseEvent) => {
    if (!drawing) return
    const pt = toSvg(e)
    if (draft.length >= 3 && Math.hypot(pt[0] - draft[0][0], pt[1] - draft[0][1]) < 16) return validate(draft)
    setDraft((q) => [...q, pt])
  }

  const assets = assetsRef.current
  const insideNow = useMemo(() => new Set<number>(), [])
  insideNow.clear()
  assets.forEach((a) => { if (zones.some((z) => pointInPoly([a.x, a.y], z.points))) insideNow.add(a.id) })
  const lowBat = assets.filter((a) => a.battery < 20).length
  const zoneCount = (z: Zone) => assets.filter((a) => pointInPoly([a.x, a.y], z.points)).length
  const time = (ts: number) => new Date(ts).toLocaleTimeString(lang === 'fr' ? 'fr-FR' : 'en-GB')

  const stat = [
    { l: p.stats.assets, v: assets.length, c: '#00D2FF', Icon: Radio },
    { l: p.stats.inzone, v: insideNow.size, c: '#10B981', Icon: MapPinned },
    { l: p.stats.alerts, v: alertTotal, c: '#8B5CF6', Icon: BellRing },
    { l: p.stats.lowbat, v: lowBat, c: '#F59E0B', Icon: Battery },
  ]

  return (
    <>
      <PageHeader eyebrow={p.eyebrow} title={p.title} sub={p.sub} />

      <section className="bg-ink pb-24 text-white">
        <div className="wrap">
          {/* window chrome */}
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-ink-800 shadow-[0_40px_120px_-40px_rgba(0,82,255,.55)]">
            <div className="flex items-center gap-2 border-b border-white/10 px-5 py-3">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" /><span className="h-3 w-3 rounded-full bg-[#febc2e]" /><span className="h-3 w-3 rounded-full bg-[#28c840]" />
              <span className="ml-3 flex items-center gap-2 text-xs text-white/45"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ok" /> cloud.ticatag.demo — {p.map}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 sm:p-5 lg:grid-cols-4">
              {stat.map(({ l, v, c, Icon }) => (
                <div key={l} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2 text-xs text-white/50"><Icon size={14} style={{ color: c }} /> {l}</div>
                  <div className="mt-1 font-display text-3xl font-extrabold tabular-nums" style={{ color: c }}>{v}</div>
                </div>
              ))}
            </div>

            <div className="grid gap-4 p-4 pt-0 sm:p-5 sm:pt-0 lg:grid-cols-[1.9fr_1fr]">
              {/* MAP */}
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-ink">
                <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-4 py-3">
                  <span className="mr-auto flex items-center gap-2 text-sm font-semibold"><Waves size={15} className="text-beacon" /> {p.map}</span>
                  {!drawing ? (
                    <button onClick={() => setDrawing(true)} className="btn-primary !px-4 !py-2 !text-xs"><PenTool size={13} /> {p.draw}</button>
                  ) : (
                    <>
                      <span className="hidden text-xs text-beacon sm:inline">{p.drawing} — {p.drawHint}</span>
                      <button onClick={() => validate(draft)} disabled={draft.length < 3} className="btn !bg-ok !px-4 !py-2 !text-xs text-white disabled:opacity-40"><Check size={13} /> {p.close}</button>
                      <button onClick={cancel} className="btn-ghost !px-4 !py-2 !text-xs"><X size={13} /> {p.cancel}</button>
                    </>
                  )}
                </div>

                <svg
                  ref={svgRef}
                  viewBox={`0 0 ${W} ${H}`}
                  className={`block w-full touch-none select-none ${drawing ? 'cursor-crosshair' : ''}`}
                  onClick={onMapClick}
                  onPointerMove={(e) => { if (drawing) setCursor(toSvg(e)) }}
                  onPointerLeave={() => setCursor(null)}
                  role="img"
                  aria-label={p.map}
                >
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="rgba(255,255,255,.05)" /></pattern>
                    <radialGradient id="vig" cx="50%" cy="50%" r="70%"><stop offset="60%" stopColor="transparent" /><stop offset="100%" stopColor="#0A0F1D" /></radialGradient>
                  </defs>
                  <rect width={W} height={H} fill="#0c1426" />
                  <rect width={W} height={H} fill="url(#grid)" />
                  {/* site plan: buildings + roads */}
                  <g fill="rgba(0,102,255,.07)" stroke="rgba(0,210,255,.22)" strokeWidth="1.2">
                    <rect x="60" y="60" width="380" height="270" rx="6" />
                    <rect x="480" y="60" width="260" height="130" rx="6" />
                    <rect x="480" y="230" width="120" height="180" rx="6" />
                    <rect x="640" y="230" width="100" height="100" rx="6" />
                    <rect x="60" y="370" width="380" height="60" rx="6" />
                  </g>
                  <g stroke="rgba(255,255,255,.07)" strokeWidth="14" strokeLinecap="round" fill="none">
                    <path d="M20 345 H780" /><path d="M460 20 V460" />
                  </g>
                  <g fill="rgba(255,255,255,.28)" fontSize="10" fontFamily="Inter, sans-serif" letterSpacing="1.5">
                    <text x="72" y="82">BÂT. A</text><text x="492" y="82">BÂT. B</text><text x="492" y="252">QUAI</text><text x="72" y="392">PARKING</text>
                  </g>

                  {/* zones */}
                  {zones.map((z) => (
                    <g key={z.id}>
                      <polygon points={z.points.map((q) => q.join(',')).join(' ')} fill={z.color} fillOpacity="0.13" stroke={z.color} strokeWidth="2" strokeDasharray="7 5" />
                      <text x={z.points[0][0] + 8} y={z.points[0][1] + 18} fill={z.color} fontSize="12" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">{z.name}</text>
                    </g>
                  ))}

                  {/* draft */}
                  {drawing && draft.length > 0 && (
                    <g>
                      <polyline points={[...draft, ...(cursor ? [cursor] : [])].map((q) => q.join(',')).join(' ')} fill="rgba(0,210,255,.1)" stroke="#00D2FF" strokeWidth="2" />
                      {draft.map((q, i) => (
                        <circle key={i} cx={q[0]} cy={q[1]} r={i === 0 && draft.length >= 3 ? 9 : 5} fill={i === 0 ? '#10B981' : '#00D2FF'} stroke="#fff" strokeWidth="1.5" />
                      ))}
                    </g>
                  )}

                  {/* assets */}
                  {assets.map((a) => {
                    const inside = insideNow.has(a.id)
                    const col = a.battery < 20 ? '#F59E0B' : TYPE_COLOR[a.type]
                    return (
                      <g key={a.id} style={{ transform: `translate(${a.x}px, ${a.y}px)`, transition: 'transform 120ms linear' }}>
                        <circle r="14" fill={col} opacity="0.14"><animate attributeName="r" values="8;18;8" dur="3s" repeatCount="indefinite" /></circle>
                        {a.type === 'tg230' ? <rect x="-6" y="-6" width="12" height="12" rx="3" fill={col} stroke={inside ? '#10B981' : '#fff'} strokeWidth={inside ? 2.5 : 1.2} />
                          : a.type === 'sensor' ? <polygon points="0,-8 7,5 -7,5" fill={col} stroke={inside ? '#10B981' : '#fff'} strokeWidth={inside ? 2.5 : 1.2} />
                          : <circle r="6" fill={col} stroke={inside ? '#10B981' : '#fff'} strokeWidth={inside ? 2.5 : 1.2} />}
                        <text y="-14" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,.7)" fontFamily="Inter, sans-serif">{a.name}</text>
                      </g>
                    )
                  })}
                </svg>
              </div>

              {/* SIDE */}
              <div className="flex flex-col gap-4">
                <div className="rounded-2xl border border-white/10 bg-ink p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">{p.zones}</h3>
                    {zones.length > 0 && <button onClick={() => setZones([])} className="text-xs text-white/40 transition hover:text-warn">{p.clear}</button>}
                  </div>
                  <ul className="mt-3 space-y-2">
                    {zones.length === 0 && <li className="text-sm text-white/40">{p.noZones}</li>}
                    {zones.map((z) => (
                      <li key={z.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
                        <span className="h-3 w-3 rounded-full" style={{ background: z.color, boxShadow: `0 0 10px ${z.color}` }} />
                        <span className="flex-1 text-sm font-medium">{z.name}</span>
                        <span className="text-xs tabular-nums text-white/50">{zoneCount(z)} {p.inside}</span>
                        <button onClick={() => setZones((q) => q.filter((x) => x.id !== z.id))} aria-label={`${p.delete} ${z.name}`} className="text-white/35 transition hover:text-warn"><Trash2 size={14} /></button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex min-h-[260px] flex-1 flex-col rounded-2xl border border-white/10 bg-ink p-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-warn" /> {p.feed}</h3>
                  <ul className="mt-3 max-h-[300px] flex-1 space-y-2 overflow-y-auto pr-1" aria-live="polite">
                    {alerts.length === 0 && <li className="text-sm text-white/40">{p.noAlerts}</li>}
                    <AnimatePresence initial={false}>
                      {alerts.map((a) => {
                        const { color, Icon } = KIND_META[a.kind]
                        return (
                          <motion.li key={a.id} layout initial={{ opacity: 0, x: 24, height: 0 }} animate={{ opacity: 1, x: 0, height: 'auto' }} exit={{ opacity: 0 }} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm">
                            <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg" style={{ background: `${color}22`, color }}><Icon size={14} /></span>
                            <span className="min-w-0 flex-1">
                              <span className="font-semibold">{a.asset}</span> <span className="text-white/60">{p.alertTypes[a.kind]}</span> {a.zone && <span style={{ color }} className="font-semibold">{a.zone}</span>}
                            </span>
                            <span className="shrink-0 text-[11px] tabular-nums text-white/35">{time(a.ts)}</span>
                          </motion.li>
                        )
                      })}
                    </AnimatePresence>
                  </ul>
                </div>
              </div>
            </div>

            {/* TABLE */}
            <div className="p-4 pt-0 sm:p-5 sm:pt-0">
              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-ink">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <caption className="sr-only">{p.assetsTitle}</caption>
                  <thead className="text-xs uppercase tracking-wider text-white/40">
                    <tr>{[p.cols.name, p.cols.type, p.cols.battery, p.cols.state].map((c) => <th key={c} scope="col" className="px-4 py-3 font-semibold">{c}</th>)}</tr>
                  </thead>
                  <tbody>
                    {assets.map((a) => {
                      const inside = insideNow.has(a.id)
                      const low = a.battery < 20
                      return (
                        <tr key={a.id} className="border-t border-white/5">
                          <td className="px-4 py-2.5 font-semibold">{a.name}</td>
                          <td className="px-4 py-2.5 text-white/60"><span className="mr-2 inline-block h-2 w-2 rounded-full" style={{ background: TYPE_COLOR[a.type] }} />{p.types[a.type]}</td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full transition-all" style={{ width: `${a.battery}%`, background: low ? '#F59E0B' : '#10B981' }} /></div>
                              <span className={`text-xs tabular-nums ${low ? 'text-warn' : 'text-white/60'}`}>{a.battery}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-xs">
                            <span className={`rounded-full px-2.5 py-1 font-semibold ${zones.length === 0 ? 'bg-white/5 text-white/50' : inside ? 'bg-ok/15 text-ok' : 'bg-warn/15 text-warn'}`}>
                              {zones.length === 0 ? p.states.free : inside ? p.states.inside : p.states.outside}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-24">
        <div className="wrap grid gap-5 md:grid-cols-3">
          {p.features.map((f, i) => {
            const Icon = [BellRing, PenTool, Plug][i]
            return (
              <Reveal key={f.t} delay={i * 0.08}>
                <div className="h-full rounded-3xl border border-slate-200 bg-white p-7 transition hover:-translate-y-1 hover:shadow-xl">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand/10 text-brand-500"><Icon size={20} /></span>
                  <h3 className="mt-5 font-display text-xl font-extrabold">{f.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/60">{f.d}</p>
                </div>
              </Reveal>
            )
          })}
        </div>
      </section>

      <CtaBand />
    </>
  )
}
