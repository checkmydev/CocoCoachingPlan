// Generates downloadable workout files (TCX, ZWO, MRC) from client physiological data.
// TCX speed values are in m/s; ZWO power is relative (%FTP, Zwift handles scaling);
// MRC power is absolute watts (scaled to client FTP).

function kmhToMs(kmh) { return (kmh / 3.6).toFixed(4) }

// Garmin TCX name fields must be ASCII-only (max 15 chars for Step names)
function tcxName(str, maxLen = 15) {
  return (str || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // strip diacritics (à→a, é→e…)
    .replace(/[^\x20-\x7E]/g, '')                    // remove remaining non-ASCII
    .replace(/[<>&"]/g, ' ')                          // escape XML special chars
    .trim()
    .slice(0, maxLen)
}

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

function tcxSpeedStep(id, name, durationType, durationValue, zone, vmaKmh) {
  const sp = (pct) => kmhToMs(vmaKmh * pct)
  const [lo, hi] = ZONE_VMA[zone] || ZONE_VMA.Z2
  const dur = durationType === 'dist'
    ? `<Duration xsi:type="Distance_t"><Meters>${durationValue}</Meters></Duration>`
    : `<Duration xsi:type="Time_t"><Seconds>${durationValue}</Seconds></Duration>`
  return `      <Step xsi:type="Step_t">
        <StepId>${id}</StepId>
        <Name>${tcxName(name)}</Name>
        ${dur}
        <Intensity>Active</Intensity>
        <Target xsi:type="Speed_t">
          <SpeedZone xsi:type="CustomSpeedZone_t">
            <LowInMetersPerSecond>${sp(lo)}</LowInMetersPerSecond>
            <HighInMetersPerSecond>${sp(hi)}</HighInMetersPerSecond>
          </SpeedZone>
        </Target>
      </Step>`
}

// Template workout (8x100m VMA) — used as fallback or from client profile page
export function generateRunTCX(clientName, vmaKmh) {
  const sp = (v) => kmhToMs((vmaKmh / 14) * v)
  return `${TCX_HEADER}
  <Workouts>
    <Workout Sport="Running">
      <Name>8x100m VMA</Name>
      <Step xsi:type="Step_t">
        <StepId>1</StepId>
        <Name>Echauff Z2</Name>
        <Duration xsi:type="Time_t"><Seconds>420</Seconds></Duration>
        <Intensity>Active</Intensity>
        <Target xsi:type="Speed_t">
          <SpeedZone xsi:type="CustomSpeedZone_t">
            <LowInMetersPerSecond>${sp(9.1)}</LowInMetersPerSecond>
            <HighInMetersPerSecond>${sp(10.5)}</HighInMetersPerSecond>
          </SpeedZone>
        </Target>
      </Step>
      <Step xsi:type="Repeat_t">
        <StepId>2</StepId>
        <Repetitions>8</Repetitions>
        <Child xsi:type="Step_t">
          <StepId>3</StepId>
          <Name>100m VMA</Name>
          <Duration xsi:type="Distance_t"><Meters>100</Meters></Duration>
          <Intensity>Active</Intensity>
          <Target xsi:type="Speed_t">
            <SpeedZone xsi:type="CustomSpeedZone_t">
              <LowInMetersPerSecond>${sp(13.3)}</LowInMetersPerSecond>
              <HighInMetersPerSecond>${sp(14.7)}</HighInMetersPerSecond>
            </SpeedZone>
          </Target>
        </Child>
        <Child xsi:type="Step_t">
          <StepId>4</StepId>
          <Name>100m recup</Name>
          <Duration xsi:type="Distance_t"><Meters>100</Meters></Duration>
          <Intensity>Resting</Intensity>
          <Target xsi:type="Open_t"/>
        </Child>
      </Step>
      <Step xsi:type="Step_t">
        <StepId>5</StepId>
        <Name>Retour calme</Name>
        <Duration xsi:type="Time_t"><Seconds>300</Seconds></Duration>
        <Intensity>Active</Intensity>
        <Target xsi:type="Speed_t">
          <SpeedZone xsi:type="CustomSpeedZone_t">
            <LowInMetersPerSecond>${sp(7.0)}</LowInMetersPerSecond>
            <HighInMetersPerSecond>${sp(9.0)}</HighInMetersPerSecond>
          </SpeedZone>
        </Target>
      </Step>
      <Notes>MooVLab | VMA ${vmaKmh} km/h${clientName ? ' | ' + clientName : ''}</Notes>
    </Workout>
  </Workouts>
</TrainingCenterDatabase>`
}

// Session-specific TCX — reads actual session_data structure
export function generateSessionTCX(sessionTitle, sessionData, vmaKmh) {
  const vma = vmaKmh || 14
  const sd = sessionData || {}
  const name = tcxName(sessionTitle || 'Seance course', 50)

  let id = 1
  const steps = []

  if (sd.warmup?.duration_min) {
    steps.push(tcxSpeedStep(id++, 'Echauff', 'time', sd.warmup.duration_min * 60, sd.warmup.zone || 'Z2', vma))
  }

  if (sd.main?.mode === 'intervals' && sd.main.intervals?.length > 0) {
    for (const itv of sd.main.intervals) {
      const [lo, hi] = ZONE_VMA[itv.zone] || ZONE_VMA.Z5
      const sp = (pct) => kmhToMs(vma * pct)
      const repId = id++; const wId = id++; const rId = id++
      const useDist = (itv.effort_mode ?? 'distance') !== 'time'
      const workDur = useDist && itv.distance_m
        ? `<Duration xsi:type="Distance_t"><Meters>${itv.distance_m}</Meters></Duration>`
        : `<Duration xsi:type="Time_t"><Seconds>${itv.duration_sec || 60}</Seconds></Duration>`
      const recSec = itv.recovery_sec ?? (itv.recovery_min ? itv.recovery_min * 60 : 90)
      const recDur = itv.recovery_mode === 'distance' && itv.recovery_dist_m
        ? `<Duration xsi:type="Distance_t"><Meters>${itv.recovery_dist_m}</Meters></Duration>`
        : `<Duration xsi:type="Time_t"><Seconds>${Math.round(recSec)}</Seconds></Duration>`
      steps.push(`      <Step xsi:type="Repeat_t">
        <StepId>${repId}</StepId>
        <Repetitions>${itv.reps || 1}</Repetitions>
        <Child xsi:type="Step_t">
          <StepId>${wId}</StepId>
          <Name>${tcxName(itv.zone || 'Effort')}</Name>
          ${workDur}
          <Intensity>Active</Intensity>
          <Target xsi:type="Speed_t">
            <SpeedZone xsi:type="CustomSpeedZone_t">
              <LowInMetersPerSecond>${sp(lo)}</LowInMetersPerSecond>
              <HighInMetersPerSecond>${sp(hi)}</HighInMetersPerSecond>
            </SpeedZone>
          </Target>
        </Child>
        <Child xsi:type="Step_t">
          <StepId>${rId}</StepId>
          <Name>Recup</Name>
          ${recDur}
          <Intensity>Resting</Intensity>
          <Target xsi:type="Open_t"/>
        </Child>
      </Step>`)
    }
  } else if (sd.main) {
    steps.push(tcxSpeedStep(id++, 'Effort', 'time', (sd.main.duration_min || 30) * 60, sd.main.zone || 'Z2', vma))
  }

  if (sd.cooldown?.duration_min) {
    steps.push(tcxSpeedStep(id++, 'Retour calme', 'time', sd.cooldown.duration_min * 60, sd.cooldown.zone || 'Z1', vma))
  }

  if (steps.length === 0) return generateRunTCX('', vma)

  return `${TCX_HEADER}
  <Workouts>
    <Workout Sport="Running">
      <Name>${name}</Name>
${steps.join('\n')}
      <Notes>MooVLab | VMA ${vma} km/h</Notes>
    </Workout>
  </Workouts>
</TrainingCenterDatabase>`
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
