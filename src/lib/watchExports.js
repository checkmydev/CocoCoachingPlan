// Generates downloadable workout files (TCX, ZWO, MRC) from client physiological data.
// TCX uses Garmin Connect Activities format (<Activities>/<Lap>) — importable via
//   connect.garmin.com/modern/import-data as a running activity.
// ZWO power is relative (%FTP, Zwift handles scaling).
// MRC power is absolute watts (scaled to client FTP).

function tcxSanitize(str, maxLen = 200) {
  return (str || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // strip diacritics
    .replace(/[^\x20-\x7E]/g, '')                     // remove remaining non-ASCII
    .replace(/[<>&"]/g, ' ')                           // escape XML special chars
    .trim()
    .slice(0, maxLen)
}

// Keep the old alias used in a few places below
function tcxName(str, maxLen = 15) { return tcxSanitize(str, maxLen) }

const TCX_HEADER = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2 http://www.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd">`

// VMA zone boundaries (% of VMA)
const ZONE_VMA = {
  Z1: [0.55, 0.65], Z2: [0.65, 0.75], Z3: [0.75, 0.85],
  Z4: [0.85, 0.92], Z5: [0.95, 1.05],
}
// FTP zone boundaries (% of FTP)
const ZONE_FTP = {
  Z1: [0.45, 0.55], Z2: [0.55, 0.75], Z3: [0.75, 0.90],
  Z4: [0.90, 1.00], Z5: [1.00, 1.15],
}
// Heart rate reserve (Karvonen) zone boundaries
const ZONE_HRR = {
  Z1: [0.50, 0.60], Z2: [0.60, 0.70], Z3: [0.70, 0.80],
  Z4: [0.80, 0.90], Z5: [0.90, 1.00],
}

function zoneHRAvg(zone, fcMax, fcRest) {
  const [lo, hi] = ZONE_HRR[zone] || ZONE_HRR.Z2
  return Math.round(fcRest + (fcMax - fcRest) * (lo + hi) / 2)
}

function zoneSpeedAvgMs(zone, vmaKmh) {
  const [lo, hi] = ZONE_VMA[zone] || ZONE_VMA.Z2
  return vmaKmh * (lo + hi) / 2 / 3.6
}

// Build one <Lap> element in Activities/Activity format.
// cumulDistM = cumulative distance from start of activity up to this lap's start.
function buildLap(t0Ms, durSec, distM, hrBpm, isRest, cumulDistM) {
  const dur = Math.max(1, Math.round(durSec))
  const dist = Math.max(0, Math.round(distM))
  const cumul = Math.max(0, Math.round(cumulDistM))
  const cal = Math.round(dur / 60 * (isRest ? 3 : 8))
  const s0 = new Date(t0Ms).toISOString()
  const s1 = new Date(t0Ms + dur * 1000).toISOString()
  return {
    xml: `    <Lap StartTime="${s0}">
      <TotalTimeSeconds>${dur}</TotalTimeSeconds>
      <DistanceMeters>${dist}</DistanceMeters>
      <Calories>${cal}</Calories>
      <Intensity>${isRest ? 'Resting' : 'Active'}</Intensity>
      <TriggerMethod>Manual</TriggerMethod>
      <Track>
        <Trackpoint>
          <Time>${s0}</Time>
          <DistanceMeters>${cumul}</DistanceMeters>
          <HeartRateBpm><Value>${hrBpm}</Value></HeartRateBpm>
        </Trackpoint>
        <Trackpoint>
          <Time>${s1}</Time>
          <DistanceMeters>${cumul + dist}</DistanceMeters>
          <HeartRateBpm><Value>${hrBpm}</Value></HeartRateBpm>
        </Trackpoint>
      </Track>
    </Lap>`,
    durMs: dur * 1000,
    distM: dist,
  }
}

function wrapActivity(sport, startISO, notes, laps) {
  return `${TCX_HEADER}
  <Activities>
    <Activity Sport="${sport}">
      <Id>${startISO}</Id>
${laps.map(l => l.xml).join('\n')}
      <Notes>${tcxSanitize(notes, 200)}</Notes>
    </Activity>
  </Activities>
</TrainingCenterDatabase>`
}

// Template workout: 8×100m VMA — generates an activity importable on Garmin Connect
export function generateRunTCX(clientName, vmaKmh, fcMax = 190, fcRest = 55) {
  const vma = vmaKmh || 14
  const now = new Date()
  let tMs = now.getTime()
  let cumDist = 0
  const laps = []

  const addLap = (zone, durSec, distM, isRest = false) => {
    const l = buildLap(tMs, durSec, distM, zoneHRAvg(zone, fcMax, fcRest), isRest, cumDist)
    laps.push(l); tMs += l.durMs; cumDist += l.distM
  }

  const spZ2 = zoneSpeedAvgMs('Z2', vma)
  const spZ4 = zoneSpeedAvgMs('Z4', vma)
  const spZ1 = zoneSpeedAvgMs('Z1', vma)

  addLap('Z2', 420, spZ2 * 420)                          // Échauffement 7 min Z2
  for (let i = 0; i < 8; i++) {
    addLap('Z4', 100 / spZ4, 100)                        // 100m effort Z4
    addLap('Z1', 100 / spZ1, 100, true)                  // 100m récup Z1
  }
  addLap('Z1', 300, spZ1 * 300, true)                    // Retour calme 5 min Z1

  const notes = `MooVLab | VMA ${vma} km/h${clientName ? ' | ' + clientName : ''}`
  return wrapActivity('Running', now.toISOString(), notes, laps)
}

// Session-specific TCX — converts session_data to a Garmin Connect importable activity
export function generateSessionTCX(sessionTitle, sessionData, vmaKmh, fcMax = 190, fcRest = 55) {
  const vma = vmaKmh || 14
  const sd = sessionData || {}
  const now = new Date()
  let tMs = now.getTime()
  let cumDist = 0
  const laps = []

  const addLap = (zone, durSec, distM, isRest = false) => {
    if (durSec <= 0) return
    const l = buildLap(tMs, durSec, distM, zoneHRAvg(zone, fcMax, fcRest), isRest, cumDist)
    laps.push(l); tMs += l.durMs; cumDist += l.distM
  }

  if (+sd.warmup?.duration_min > 0) {
    const z = sd.warmup.zone || 'Z2'
    const d = sd.warmup.duration_min * 60
    addLap(z, d, zoneSpeedAvgMs(z, vma) * d)
  }

  if (sd.main?.mode === 'intervals' && sd.main.intervals?.length > 0) {
    for (const itv of sd.main.intervals) {
      const reps = Math.max(1, parseInt(itv.reps) || 1)
      const z = itv.zone || 'Z4'
      const sp = zoneSpeedAvgMs(z, vma)
      const spR = zoneSpeedAvgMs('Z1', vma)
      for (let i = 0; i < reps; i++) {
        let dur, dist
        if ((itv.effort_mode ?? 'distance') !== 'time') {
          dist = parseInt(itv.distance_m) || 400
          dur = dist / sp
        } else {
          dur = parseInt(itv.duration_sec) || 60
          dist = sp * dur
        }
        addLap(z, dur, dist)
        if (itv.recovery_mode === 'distance') {
          const rd = parseInt(itv.recovery_dist_m) || 0
          if (rd > 0) addLap('Z1', rd / spR, rd, true)
        } else {
          const rs = parseInt(itv.recovery_sec) || 0
          if (rs > 0) addLap('Z1', rs, spR * rs, true)
        }
      }
    }
  } else if (sd.main?.mode === 'continuous' && +sd.main?.duration_min > 0) {
    const z = sd.main.zone || 'Z3'
    const d = sd.main.duration_min * 60
    addLap(z, d, zoneSpeedAvgMs(z, vma) * d)
  }

  if (+sd.cooldown?.duration_min > 0) {
    const z = sd.cooldown.zone || 'Z1'
    const d = sd.cooldown.duration_min * 60
    addLap(z, d, zoneSpeedAvgMs(z, vma) * d, true)
  }

  if (laps.length === 0) return generateRunTCX('', vma, fcMax, fcRest)

  const notes = `${tcxSanitize(sessionTitle || 'Seance course', 80)} | MooVLab VMA ${vma} km/h`
  return wrapActivity('Running', now.toISOString(), notes, laps)
}

// Session-specific ZWO (Zwift) — reads session_data, power relative to FTP
export function generateSessionZWO(sessionTitle, sessionData, ftpWatts) {
  const sd = sessionData || {}
  const name = (sessionTitle || 'Seance velo').slice(0, 50)
  const parts = []

  if (sd.warmup?.duration_min) {
    const [lo, hi] = ZONE_FTP[sd.warmup.zone] || ZONE_FTP.Z2
    parts.push(`    <Warmup Duration="${sd.warmup.duration_min * 60}" PowerLow="${lo.toFixed(3)}" PowerHigh="${hi.toFixed(3)}" pace="0"/>`)
  }

  if (sd.main?.mode === 'intervals' && sd.main.intervals?.length > 0) {
    for (const itv of sd.main.intervals) {
      const [lo, hi] = ZONE_FTP[itv.zone] || ZONE_FTP.Z5
      const pwr = ((lo + hi) / 2).toFixed(3)
      const onSec = itv.duration_sec || 60
      const offSec = Math.round(itv.recovery_sec ?? (itv.recovery_min ? itv.recovery_min * 60 : 90))
      parts.push(`    <IntervalsT Repeat="${itv.reps || 1}" OnDuration="${onSec}" OffDuration="${offSec}" OnPower="${pwr}" OffPower="0.500" pace="0"/>`)
    }
  } else if (sd.main) {
    const [lo, hi] = ZONE_FTP[sd.main.zone] || ZONE_FTP.Z2
    parts.push(`    <SteadyState Duration="${(sd.main.duration_min || 30) * 60}" Power="${((lo + hi) / 2).toFixed(3)}" pace="0"/>`)
  }

  if (sd.cooldown?.duration_min) {
    const [lo, hi] = ZONE_FTP[sd.cooldown.zone] || ZONE_FTP.Z1
    parts.push(`    <Cooldown Duration="${sd.cooldown.duration_min * 60}" PowerLow="${hi.toFixed(3)}" PowerHigh="${lo.toFixed(3)}" pace="0"/>`)
  }

  if (parts.length === 0) return generateBikeZWO('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<workout_file>
  <author>MooVLab</author>
  <name>${name}</name>
  <description>MooVLab | FTP ${ftpWatts || 200}W</description>
  <sportType>bike</sportType>
  <tags><tag name="MooVLab"/></tags>
  <workout>
${parts.join('\n')}
  </workout>
</workout_file>`
}

// Session-specific MRC (Wahoo/TrainerRoad) — absolute watts
export function generateSessionMRC(sessionTitle, sessionData, ftpWatts) {
  const ftp = ftpWatts || 200
  const w = (pct) => Math.round(ftp * pct)
  const sd = sessionData || {}
  const name = (sessionTitle || 'Seance velo').slice(0, 50)

  const rows = []
  let t = 0
  const seg = (mins, pct) => {
    rows.push(`${t.toFixed(2)}    ${w(pct)}`)
    t += mins
    rows.push(`${t.toFixed(2)}    ${w(pct)}`)
  }

  if (sd.warmup?.duration_min) {
    const [lo, hi] = ZONE_FTP[sd.warmup.zone] || ZONE_FTP.Z2
    seg(sd.warmup.duration_min, (lo + hi) / 2)
  }

  if (sd.main?.mode === 'intervals' && sd.main.intervals?.length > 0) {
    for (const itv of sd.main.intervals) {
      const [lo, hi] = ZONE_FTP[itv.zone] || ZONE_FTP.Z5
      const workMins = (itv.duration_sec || 60) / 60
      const recMins = (itv.recovery_sec ?? (itv.recovery_min ? itv.recovery_min * 60 : 90)) / 60
      for (let i = 0; i < (itv.reps || 1); i++) {
        seg(workMins, (lo + hi) / 2)
        seg(recMins, 0.50)
      }
    }
  } else if (sd.main) {
    const [lo, hi] = ZONE_FTP[sd.main.zone] || ZONE_FTP.Z2
    seg(sd.main.duration_min || 30, (lo + hi) / 2)
  }

  if (sd.cooldown?.duration_min) {
    const [lo, hi] = ZONE_FTP[sd.cooldown.zone] || ZONE_FTP.Z1
    seg(sd.cooldown.duration_min, (lo + hi) / 2)
  }

  if (rows.length === 0) return generateBikeMRC('', ftp)

  return `[COURSE HEADER]
VERSION = 2
UNITS = METRIC
DESCRIPTION = MooVLab - ${name} | FTP ${ftp}W
FILE NAME = moovlab_session
MINUTES WATTS
[END COURSE HEADER]

[COURSE DATA]
${rows.join('\n')}
[END COURSE DATA]`
}

// Template workouts (used from client profile page or as fallback)
export function generateBikeZWO(clientName) {
  const label = clientName ? ` (${clientName})` : ''
  return `<?xml version="1.0" encoding="UTF-8"?>
<workout_file>
  <author>MooVLab</author>
  <name>MooVLab Zone4 4x10min${label}</name>
  <description>4 blocs 10 min a 90% FTP, recup 5 min. Echauffement 10 min, retour calme 10 min.</description>
  <sportType>bike</sportType>
  <tags><tag name="MooVLab"/><tag name="FTP"/><tag name="Zone4"/></tags>
  <workout>
    <Warmup      Duration="600" PowerLow="0.450" PowerHigh="0.750" pace="0"/>
    <SteadyState Duration="600" Power="0.900" pace="0"/>
    <SteadyState Duration="300" Power="0.550" pace="0"/>
    <SteadyState Duration="600" Power="0.900" pace="0"/>
    <SteadyState Duration="300" Power="0.550" pace="0"/>
    <SteadyState Duration="600" Power="0.900" pace="0"/>
    <SteadyState Duration="300" Power="0.550" pace="0"/>
    <SteadyState Duration="600" Power="0.900" pace="0"/>
    <SteadyState Duration="300" Power="0.550" pace="0"/>
    <Cooldown    Duration="600" PowerLow="0.700" PowerHigh="0.400" pace="0"/>
  </workout>
</workout_file>`
}

export function generateBikeMRC(clientName, ftpWatts) {
  const f = (ftpWatts || 200) / 200
  const w = (v) => Math.round(v * f)
  const label = clientName ? ` (${clientName})` : ''
  return `[COURSE HEADER]
VERSION = 2
UNITS = METRIC
DESCRIPTION = MooVLab - Zone 4 FTP 4x10min${label} | FTP ${ftpWatts}W
FILE NAME = moovlab_zone4_ftp
MINUTES WATTS
[END COURSE HEADER]

[COURSE DATA]
0.00    ${w(90)}
10.00   ${w(150)}
10.01   ${w(180)}
20.00   ${w(180)}
20.01   ${w(110)}
25.00   ${w(110)}
25.01   ${w(180)}
35.00   ${w(180)}
35.01   ${w(110)}
40.00   ${w(110)}
40.01   ${w(180)}
50.00   ${w(180)}
50.01   ${w(110)}
55.00   ${w(110)}
55.01   ${w(180)}
65.00   ${w(180)}
65.01   ${w(110)}
70.00   ${w(110)}
70.01   ${w(140)}
80.00   ${w(80)}
[END COURSE DATA]`
}

export async function downloadFile(content, filename) {
  const blob = new Blob([content], { type: 'application/octet-stream' })

  if (navigator.canShare && navigator.canShare({ files: [new File([blob], filename)] })) {
    try {
      const file = new File([blob], filename, { type: 'application/octet-stream' })
      await navigator.share({ files: [file], title: filename })
      return
    } catch (e) {
      if (e.name === 'AbortError') return
    }
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
