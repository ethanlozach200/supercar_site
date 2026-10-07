import type { ProductId } from '../lib/data'

/** Stylised device illustrations (SVG) — no external assets. */
export default function ProductGlyph({ id, color }: { id: ProductId; color: string }) {
  const body = '#151D35'
  const edge = 'rgba(255,255,255,.18)'
  return (
    <svg viewBox="0 0 200 140" className="h-full w-full" role="img" aria-hidden>
      <defs>
        <radialGradient id={`g-${id}`} cx="50%" cy="50%" r="60%">
          <stop offset="0" stopColor={color} stopOpacity=".45" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`b-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#26325a" />
          <stop offset="1" stopColor={body} />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="76" rx="92" ry="60" fill={`url(#g-${id})`} />
      {id === 'tibib' && (
        <g>
          <rect x="52" y="34" width="96" height="72" rx="10" fill="#fff" opacity=".92" />
          <text x="100" y="82" textAnchor="middle" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="800" fontSize="34" fill="#0A0F1D">1042</text>
          <rect x="82" y="24" width="36" height="22" rx="11" fill={`url(#b-${id})`} stroke={color} />
          <circle cx="100" cy="35" r="3.5" fill={color} />
        </g>
      )}
      {id === 'om1s' && (
        <g>
          <rect x="54" y="26" width="92" height="92" rx="24" fill={`url(#b-${id})`} stroke={edge} />
          <circle cx="100" cy="72" r="28" fill="none" stroke={color} strokeWidth="2" opacity=".55" />
          <circle cx="100" cy="72" r="18" fill="none" stroke={color} strokeWidth="2" opacity=".8" />
          <circle cx="100" cy="72" r="6" fill={color} />
          <text x="100" y="110" textAnchor="middle" fontFamily="Plus Jakarta Sans" fontWeight="700" fontSize="9" fill="rgba(255,255,255,.55)" letterSpacing="2">OM1S</text>
        </g>
      )}
      {(id === 'tg100' || id === 'tg230') && (
        <g>
          <rect x="40" y="38" width="120" height="68" rx="10" fill={`url(#b-${id})`} stroke={edge} />
          <rect x="52" y="50" width="52" height="8" rx="4" fill={color} opacity=".8" />
          <rect x="52" y="64" width="34" height="5" rx="2.5" fill="#fff" opacity=".2" />
          <circle cx="138" cy="60" r="5" fill={color} />
          <circle cx="138" cy="60" r="11" fill="none" stroke={color} opacity=".5" />
          <text x="52" y="96" fontFamily="Plus Jakarta Sans" fontWeight="800" fontSize="14" fill="#fff">{id === 'tg230' ? 'TG230' : 'TG100'}</text>
          {id === 'tg230' && <path d="M64 38 v-14 M136 38 v-14" stroke={color} strokeWidth="3" strokeLinecap="round" />}
          {id === 'tg100' && <path d="M140 38 v-18" stroke={color} strokeWidth="3" strokeLinecap="round" />}
        </g>
      )}
      {id === 'sensors' && (
        <g>
          <rect x="62" y="30" width="76" height="86" rx="18" fill={`url(#b-${id})`} stroke={edge} />
          <path d="M100 48 c10 14 14 21 14 28 a14 14 0 0 1 -28 0 c0 -7 4 -14 14 -28z" fill={color} opacity=".85" />
          <rect x="76" y="98" width="48" height="5" rx="2.5" fill="#fff" opacity=".25" />
          <rect x="76" y="98" width="30" height="5" rx="2.5" fill="#10B981" />
        </g>
      )}
    </svg>
  )
}
