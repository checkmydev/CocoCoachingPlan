// ─── Pace helpers ─────────────────────────────────────────────────────────────

export function fmtPace(minDecimal) {
  if (!isFinite(minDecimal) || minDecimal <= 0) return '—'
  const min = Math.floor(minDecimal)
  const sec = Math.round((minDecimal - min) * 60)
  return `${min}'${String(sec).padStart(2, '0')}"`
}

export function speedToPaceKm(kmh) {
  if (!kmh || kmh <= 0) return '—'
  return fmtPace(60 / kmh)
}

export function speedToPace100m(kmh) {
  if (!kmh || kmh <= 0) return '—'
  return fmtPace(6 / kmh)
}

export function distToTimeFmt(distM, speedKmh) {
  if (!distM || !speedKmh || speedKmh <= 0) return '—'
  const totalSec = Math.round((distM / 1000) / speedKmh * 3600)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}'${String(sec).padStart(2, '0')}"`
}

export function fmtSec(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return m > 0 ? `${m}'${String(s).padStart(2, '0')}"` : `${sec}"`
}

// ─── Running VMA session templates (inspired by the fractionné Excel table) ───

export const VMA_TEMPLATES = [
  // Fractionné court — 105% VMA
  { id: 'fc_30_30',  cat: 'Fractionné court', name: '30" / 30"', pct: 105, mode: 'time', work: 30,  rest_mode: 'time', rest: 30,  reps: 20, zone: 'Z5' },
  { id: 'fc_40_40',  cat: 'Fractionné court', name: '40" / 40"', pct: 105, mode: 'time', work: 40,  rest_mode: 'time', rest: 40,  reps: 20, zone: 'Z5' },
  { id: 'fc_200m',   cat: 'Fractionné court', name: '200 m',      pct: 105, mode: 'dist', work: 200, rest_mode: 'dist', rest: 200, reps: 20, zone: 'Z5' },
  { id: 'fc_300m',   cat: 'Fractionné court', name: '300 m',      pct: 100, mode: 'dist', work: 300, rest_mode: 'time', rest: 60,  reps: 15, zone: 'Z5' },
  { id: 'fc_400m',   cat: 'Fractionné court', name: '400 m',      pct: 100, mode: 'dist', work: 400, rest_mode: 'time', rest: 90,  reps: 10, zone: 'Z5' },
  { id: 'fc_pyra',   cat: 'Fractionné court', name: 'Pyramide',   pct: 100, mode: 'dist', work: 400, rest_mode: 'dist', rest: 200, reps: 1,  zone: 'Z4-Z5', note: '200-300-400-300-200m' },
  // Fractionné long — 90-95% VMA
  { id: 'fl_800m',   cat: 'Fractionné long',  name: '800 m',      pct: 95,  mode: 'dist', work: 800,  rest_mode: 'time', rest: 120, reps: 8, zone: 'Z4' },
  { id: 'fl_1000m',  cat: 'Fractionné long',  name: '1000 m',     pct: 90,  mode: 'dist', work: 1000, rest_mode: 'time', rest: 120, reps: 6, zone: 'Z4' },
  { id: 'fl_1200m',  cat: 'Fractionné long',  name: '1200 m',     pct: 90,  mode: 'dist', work: 1200, rest_mode: 'time', rest: 150, reps: 5, zone: 'Z4' },
  // Séances au seuil — 80% VMA
  { id: 'th_1500m',  cat: 'Séances au seuil', name: '1500 m',     pct: 80,  mode: 'dist', work: 1500, rest_mode: 'time', rest: 120, reps: 4, zone: 'Z3' },
  { id: 'th_2000m',  cat: 'Séances au seuil', name: '2000 m',     pct: 80,  mode: 'dist', work: 2000, rest_mode: 'time', rest: 150, reps: 3, zone: 'Z3' },
  { id: 'th_3000m',  cat: 'Séances au seuil', name: '3000 m',     pct: 80,  mode: 'dist', work: 3000, rest_mode: 'time', rest: 180, reps: 3, zone: 'Z3' },
]

export function calcVmaTemplate(tpl, vmaKmh) {
  const v = parseFloat(vmaKmh)
  if (!v || v <= 0) {
    return { ...tpl, speed_kmh: null, pace_km: '—', pace_100m: '—', work_display: '—', rest_display: '—' }
  }
  const speed = v * tpl.pct / 100
  const work_display = tpl.mode === 'time'
    ? `${tpl.work}"`
    : `${tpl.work}m · ${distToTimeFmt(tpl.work, speed)}`
  const rest_display = tpl.rest_mode === 'time'
    ? fmtSec(tpl.rest)
    : `${tpl.rest}m`
  return {
    ...tpl,
    speed_kmh: +(speed.toFixed(2)),
    pace_km: speedToPaceKm(speed),
    pace_100m: speedToPace100m(speed),
    work_display,
    rest_display,
  }
}

// ─── FC zones (Karvonen / % réserve) ──────────────────────────────────────────

const FC_ZONE_DEFS = [
  { name: 'Endurance fondamentale', pct_min: 60, pct_max: 70, color: '#60A5FA' },
  { name: 'Endurance active',       pct_min: 70, pct_max: 80, color: '#34D399' },
  { name: 'Seuil anaérobique',      pct_min: 80, pct_max: 90, color: '#FBBF24' },
  { name: 'VMA',                    pct_min: 90, pct_max: 100, color: '#F87171' },
]

export function calcFCZones(fcRepos, fcMax) {
  if (!fcMax || fcMax <= 0) return []
  const repos = parseInt(fcRepos) || 0
  const reserve = fcMax - repos
  return FC_ZONE_DEFS.map(z => ({
    ...z,
    fc_min: Math.round(repos + reserve * z.pct_min / 100),
    fc_max: Math.round(repos + reserve * z.pct_max / 100),
  }))
}

// ─── PMA / Cycling zones (inspired by the PMA Excel table) ────────────────────

export const PMA_ZONE_DEFS = [
  { zone: 1, label: 'Légère',              pct_min: 0,   pct_max: 55,  color: '#BFDBFE', textDark: true,  time: '>2h',       desc: 'Récupération active, grandes distances' },
  { zone: 2, label: 'Endurance',           pct_min: 56,  pct_max: 75,  color: '#6EE7B7', textDark: true,  time: '1–3h',      desc: 'Endurance fondamentale, sortie longue' },
  { zone: 3, label: 'Soutenu',             pct_min: 76,  pct_max: 90,  color: '#FDE68A', textDark: true,  time: '20–60min',  desc: 'Tempo, améliore le seuil lacique' },
  { zone: 4, label: 'Critique (FTP)',      pct_min: 91,  pct_max: 105, color: '#FDBA74', textDark: true,  time: '8–20min',   desc: 'Seuil FTP, effort difficile à maintenir' },
  { zone: 5, label: 'Survitesse',          pct_min: 106, pct_max: 120, color: '#F87171', textDark: true,  time: '3–8min',    desc: 'Intervalles PMA, développer VO2max' },
  { zone: 6, label: 'Cap. anaérobie',     pct_min: 121, pct_max: 150, color: '#C084FC', textDark: true,  time: '30s–3min',  desc: 'Sprint répété, résistance à la fatigue' },
  { zone: 7, label: 'Puissance max.',     pct_min: 151, pct_max: 200, color: '#374151', textDark: false, time: '<30s',       desc: 'Sprint maximal, efforts neuromusculaires' },
]

export function calcPMAZones(pmaWatts) {
  const p = parseFloat(pmaWatts) || 0
  return PMA_ZONE_DEFS.map(z => ({
    ...z,
    watts_min: p > 0 ? Math.round(p * z.pct_min / 100) : null,
    watts_max: p > 0 ? Math.round(p * z.pct_max / 100) : null,
  }))
}
