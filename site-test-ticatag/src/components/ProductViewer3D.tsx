import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, OrbitControls, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import * as Slider from '@radix-ui/react-slider'
import { Battery, Cpu, Hand, MousePointerClick, Radio, RotateCcw, Shield } from 'lucide-react'
import { useI18n } from '../i18n'

type PartKey = 'case' | 'battery' | 'chip' | 'antenna'
type ModelId = 'om1s' | 'tg230'

interface PartDef {
  id: string
  key: PartKey | 'pcb'
  kind: 'rbox' | 'box' | 'cyl' | 'ring'
  size: number[]
  x?: number
  z?: number
  y: number // base y
  dy: number // explode offset
  color: string
  metal?: number
  rough?: number
  opacity?: number
  hotspot?: boolean
}

const MODELS: Record<ModelId, PartDef[]> = {
  om1s: [
    { id: 'base', key: 'case', kind: 'rbox', size: [1.7, 0.22, 1.7], y: -0.35, dy: -0.9, color: '#1d2a52', metal: 0.3, rough: 0.45, hotspot: true },
    { id: 'bat', key: 'battery', kind: 'cyl', size: [0.5, 0.5, 0.14], y: -0.12, dy: -0.3, color: '#cfd6e6', metal: 0.8, rough: 0.3, hotspot: true },
    { id: 'pcb', key: 'pcb', kind: 'box', size: [1.3, 0.05, 1.3], y: 0.06, dy: 0.25, color: '#0f6b57', metal: 0.2, rough: 0.6 },
    { id: 'chip', key: 'chip', kind: 'box', size: [0.34, 0.07, 0.34], y: 0.13, dy: 0.55, x: 0.25, z: -0.2, color: '#0A0F1D', metal: 0.4, rough: 0.3, hotspot: true },
    { id: 'ant', key: 'antenna', kind: 'ring', size: [0.5, 0.02, 0.5], y: 0.11, dy: 0.85, x: -0.15, z: 0.1, color: '#00D2FF', metal: 0.6, rough: 0.3, hotspot: true },
    { id: 'lid', key: 'case', kind: 'rbox', size: [1.7, 0.2, 1.7], y: 0.42, dy: 1.6, color: '#0066FF', metal: 0.2, rough: 0.35, opacity: 0.42 },
  ],
  tg230: [
    { id: 'base', key: 'case', kind: 'rbox', size: [2.4, 0.28, 1.5], y: -0.4, dy: -0.9, color: '#1d2a52', metal: 0.3, rough: 0.45, hotspot: true },
    { id: 'bat', key: 'battery', kind: 'box', size: [1.4, 0.2, 0.95], y: -0.1, dy: -0.3, x: -0.3, color: '#2b3556', metal: 0.7, rough: 0.35, hotspot: true },
    { id: 'pcb', key: 'pcb', kind: 'box', size: [2.1, 0.05, 1.2], y: 0.08, dy: 0.25, color: '#0f6b57', metal: 0.2, rough: 0.6 },
    { id: 'chip', key: 'chip', kind: 'box', size: [0.5, 0.07, 0.5], y: 0.15, dy: 0.55, x: -0.55, z: 0.1, color: '#0A0F1D', metal: 0.4, rough: 0.3, hotspot: true },
    { id: 'ant', key: 'antenna', kind: 'box', size: [0.9, 0.025, 0.5], y: 0.13, dy: 0.85, x: 0.6, z: -0.1, color: '#d9b45a', metal: 0.9, rough: 0.3, hotspot: true },
    { id: 'lid', key: 'case', kind: 'rbox', size: [2.4, 0.24, 1.5], y: 0.46, dy: 1.6, color: '#8B5CF6', metal: 0.2, rough: 0.35, opacity: 0.42 },
  ],
}

const ICON: Record<PartKey, typeof Battery> = { case: Shield, battery: Battery, chip: Cpu, antenna: Radio }
const PART_KEYS: PartKey[] = ['case', 'battery', 'chip', 'antenna']

interface ViewerCtx { onPick: (k: PartKey) => void; labels: Record<PartKey, string>; accent: string }
const Ctx = createContext<ViewerCtx>({ onPick: () => {}, labels: { case: '', battery: '', chip: '', antenna: '' }, accent: '#00D2FF' })

function PartMesh({ def, explode, setRef, active }: { def: PartDef; explode: React.MutableRefObject<number>; setRef: (id: string, o: THREE.Object3D | null) => void; active: PartKey | null }) {
  const { onPick, labels, accent } = useContext(Ctx)
  const g = useRef<THREE.Group | null>(null)
  useFrame(() => { if (g.current) g.current.position.y = def.y + def.dy * explode.current })
  const sel = active === def.key
  const mat = (
    <meshStandardMaterial
      color={def.color}
      metalness={def.metal ?? 0.3}
      roughness={def.rough ?? 0.5}
      transparent={def.opacity !== undefined}
      opacity={def.opacity ?? 1}
      emissive={sel ? accent : '#000000'}
      emissiveIntensity={sel ? 0.55 : 0}
      depthWrite={def.opacity === undefined}
    />
  )
  const key = def.key as PartKey
  return (
    <group
      ref={(o) => { g.current = o; setRef(def.id, o) }}
      position={[def.x ?? 0, def.y, def.z ?? 0]}
      onClick={(e) => { e.stopPropagation(); onPick(key) }}
    >
      {def.kind === 'rbox' && <RoundedBox args={[def.size[0], def.size[1], def.size[2]]} radius={0.1} smoothness={4}>{mat}</RoundedBox>}
      {def.kind === 'box' && <mesh><boxGeometry args={[def.size[0], def.size[1], def.size[2]]} />{mat}</mesh>}
      {def.kind === 'cyl' && <mesh><cylinderGeometry args={[def.size[0], def.size[1], def.size[2], 40]} />{mat}</mesh>}
      {def.kind === 'ring' && <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[def.size[0], def.size[1], 10, 56]} />{mat}</mesh>}
      {def.hotspot && (
        <Html position={[0, def.size[1] / 2 + 0.12, 0]} center zIndexRange={[20, 0]}>
          <button
            onClick={() => onPick(key)}
            aria-label={labels[key]}
            className="relative grid h-7 w-7 place-items-center rounded-full border border-white/70 bg-ink/70 backdrop-blur transition hover:scale-125"
            style={{ boxShadow: `0 0 18px ${accent}` }}
          >
            <span className="absolute inset-0 animate-ping2 rounded-full" style={{ background: accent, opacity: 0.45 }} />
            <span className="relative h-2.5 w-2.5 rounded-full" style={{ background: sel ? '#fff' : accent }} />
          </button>
        </Html>
      )}
    </group>
  )
}

function Rig({ model, defs, explodeTarget, active, resetSignal, onTouch }: { model: ModelId; defs: PartDef[]; explodeTarget: number; active: PartKey | null; resetSignal: number; onTouch: () => void }) {
  const explode = useRef(0)
  const refs = useRef<Record<string, THREE.Object3D | null>>({})
  const controls = useRef<any>(null)
  const { camera } = useThree()
  const settle = useRef(0)
  const goal = useMemo(() => new THREE.Vector3(), [])
  const dir = useMemo(() => new THREE.Vector3(), [])

  useEffect(() => { settle.current = 1.6 }, [active, resetSignal, model])

  useFrame((_, dt) => {
    const k = 1 - Math.exp(-6 * Math.min(dt, 0.05))
    explode.current += (explodeTarget - explode.current) * k
    const c = controls.current
    if (!c) return
    if (active) {
      // focus the first visible mesh of the active part (prefer hotspot one)
      const def = defs.find((d) => d.key === active && d.hotspot) ?? defs.find((d) => d.key === active)!
      refs.current[def.id]?.getWorldPosition(goal)
    } else goal.set(0, 0, 0)
    c.target.lerp(goal, k)
    if (settle.current > 0) {
      settle.current -= dt
      const want = active ? 2.6 : model === 'tg230' ? 6.6 : 5.8
      dir.copy(camera.position).sub(c.target).normalize()
      const cur = camera.position.distanceTo(c.target)
      camera.position.copy(c.target).addScaledVector(dir, cur + (want - cur) * k)
    }
    c.update()
  })

  return (
    <>
      <OrbitControls ref={controls} enablePan={false} enableDamping minDistance={1.8} maxDistance={9} autoRotate={!active} autoRotateSpeed={1.2} onStart={onTouch} />
      <group>
        {defs.map((d) => (
          <PartMesh key={`${model}-${d.id}`} def={d} explode={explode} setRef={(id, o) => { refs.current[id] = o }} active={active} />
        ))}
      </group>
    </>
  )
}

export default function ProductViewer3D() {
  const { d } = useI18n()
  const v = d.products.viewer
  const [model, setModel] = useState<ModelId>('om1s')
  const [explode, setExplode] = useState(0.55)
  const [active, setActive] = useState<PartKey | null>(null)
  const [resetSignal, setResetSignal] = useState(0)
  const [touched, setTouched] = useState(false)

  const defs = MODELS[model]
  const accent = model === 'om1s' ? '#00D2FF' : '#8B5CF6'
  const parts = v.parts[model]

  const ctx = useMemo<ViewerCtx>(
    () => ({
      onPick: (k) => setActive((a) => (a === k ? null : k)),
      labels: { case: parts.case.label, battery: parts.battery.label, chip: parts.chip.label, antenna: parts.antenna.label },
      accent,
    }),
    [parts, accent],
  )

  useEffect(() => { setActive(null) }, [model])

  const info = active ? parts[active] : null
  const ActiveIcon = active ? ICON[active] : MousePointerClick

  return (
    <section id="viewer" className="relative overflow-hidden bg-ink-800 py-28 text-white">
      <div className="grid-bg absolute inset-0 opacity-50" />
      <div className="wrap relative">
        <span className="eyebrow">{v.eyebrow}</span>
        <h2 className="h2 mt-4 max-w-2xl">{v.title}</h2>
        <p className="mt-4 max-w-2xl text-white/60">{v.sub}</p>

        <div className="mt-8 inline-flex rounded-full border border-white/10 bg-white/5 p-1" role="tablist">
          {(['om1s', 'tg230'] as ModelId[]).map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={model === m}
              onClick={() => setModel(m)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${model === m ? 'bg-brand-500 text-white shadow-[0_0_24px_rgba(0,102,255,.6)]' : 'text-white/60 hover:text-white'}`}
            >
              {v.models[m]}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.7fr_1fr]">
          <div className="relative h-[460px] overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-ink-700 to-ink sm:h-[560px]">
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2" style={{ background: `radial-gradient(ellipse at 50% 100%, ${accent}33, transparent 70%)` }} />
            <Canvas camera={{ position: [3.4, 2.4, 4.6], fov: 38 }} dpr={[1, 2]} aria-label={v.title}>
              <ambientLight intensity={1.1} />
              <hemisphereLight args={['#bcd4ff', '#0a0f1d', 0.9]} />
              <directionalLight position={[4, 6, 5]} intensity={2.4} />
              <directionalLight position={[-5, 2, -4]} intensity={1.2} color={accent} />
              <pointLight position={[0, -2, 2]} intensity={6} color={accent} distance={8} />
              <Ctx.Provider value={ctx}>
                <Rig model={model} defs={defs} explodeTarget={explode} active={active} resetSignal={resetSignal} onTouch={() => setTouched(true)} />
              </Ctx.Provider>
            </Canvas>
            <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/10 bg-ink/60 px-3 py-1.5 text-xs text-white/70 backdrop-blur">
              <Hand size={13} /> {touched ? v.pick : v.drag}
            </div>
            <button onClick={() => { setActive(null); setResetSignal((n) => n + 1) }} className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-white/15 bg-ink/60 px-3 py-1.5 text-xs font-semibold text-white/80 backdrop-blur transition hover:bg-white/10">
              <RotateCcw size={13} /> {v.reset}
            </button>
            <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/10 bg-ink/70 px-5 py-3 backdrop-blur sm:inset-x-auto sm:left-1/2 sm:w-[min(420px,80%)] sm:-translate-x-1/2">
              <div className="flex items-center justify-between text-xs text-white/60">
                <label id="explode-l">{v.explode}</label>
                <span className="tabular-nums">{Math.round(explode * 100)}%</span>
              </div>
              <Slider.Root className="relative mt-2 flex h-5 touch-none select-none items-center" value={[explode]} min={0} max={1} step={0.01} onValueChange={([x]) => setExplode(x)} aria-labelledby="explode-l">
                <Slider.Track className="relative h-1.5 grow rounded-full bg-white/15">
                  <Slider.Range className="absolute h-full rounded-full" style={{ background: accent }} />
                </Slider.Track>
                <Slider.Thumb className="block h-4 w-4 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,.6)] outline-none focus-visible:ring-4 focus-visible:ring-white/30" />
              </Slider.Root>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {PART_KEYS.map((k) => {
              const Icon = ICON[k]
              const on = active === k
              return (
                <button
                  key={k}
                  onClick={() => setActive(on ? null : k)}
                  aria-pressed={on}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition ${on ? 'border-white/40 bg-white/10' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07]'}`}
                  style={on ? { boxShadow: `0 0 30px -8px ${accent}` } : undefined}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: `${accent}22`, color: accent }}><Icon size={18} /></span>
                  <span className="font-semibold">{parts[k].label}</span>
                </button>
              )
            })}
            <div className="relative mt-1 flex-1 overflow-hidden rounded-2xl border border-white/10 bg-ink/60 p-5" aria-live="polite">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest" style={{ color: accent }}>
                <ActiveIcon size={14} /> {d.products.specsLabel}
              </div>
              {info ? (
                <>
                  <h3 className="mt-3 font-display text-xl font-bold">{info.label}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{info.desc}</p>
                  <div className="mt-4 inline-block rounded-lg border px-3 py-1.5 text-sm font-semibold" style={{ borderColor: `${accent}66`, color: accent, background: `${accent}12` }}>{info.spec}</div>
                </>
              ) : (
                <p className="mt-3 text-sm text-white/45">{v.pick}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
