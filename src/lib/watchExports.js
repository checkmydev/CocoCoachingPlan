// Generates downloadable workout files (TCX, ZWO, MRC) from client physiological data.
// TCX speed values are in m/s; ZWO power is relative (%FTP, Zwift handles scaling);
// MRC power is absolute watts (scaled to client FTP).

function kmhToMs(kmh) { return (kmh / 3.6).toFixed(4) }

export function generateRunTCX(clientName, vmaKmh) {
  const s = vmaKmh / 14  // scale factor vs reference VMA 14 km/h
  const sp = (v) => kmhToMs(v * s)
  const label = clientName ? ` (${clientName})` : ''

  return `<?xml version="1.0" encoding="UTF-8"?>
<TrainingCenterDatabase
  xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2
    http://www.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd">
  <Workouts>
    <Workout Sport="Running">
      <Name>MooVLab - 8x100m VMA${label}</Name>

      <Step xsi:type="Step_t">
        <StepId>1</StepId>
        <Name>Echauffement Z2 (7min)</Name>
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
          <Name>100m @ VMA (${vmaKmh} km/h)</Name>
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
          <Name>Recuperation 100m trot</Name>
          <Duration xsi:type="Distance_t"><Meters>100</Meters></Duration>
          <Intensity>Resting</Intensity>
          <Target xsi:type="Speed_t">
            <SpeedZone xsi:type="CustomSpeedZone_t">
              <LowInMetersPerSecond>${sp(6.5)}</LowInMetersPerSecond>
              <HighInMetersPerSecond>${sp(9.0)}</HighInMetersPerSecond>
            </SpeedZone>
          </Target>
        </Child>
      </Step>

      <Step xsi:type="Step_t">
        <StepId>5</StepId>
        <Name>Retour au calme Z1 (5min)</Name>
        <Duration xsi:type="Time_t"><Seconds>300</Seconds></Duration>
        <Intensity>Active</Intensity>
        <Target xsi:type="Speed_t">
          <SpeedZone xsi:type="CustomSpeedZone_t">
            <LowInMetersPerSecond>${sp(7.0)}</LowInMetersPerSecond>
            <HighInMetersPerSecond>${sp(9.0)}</HighInMetersPerSecond>
          </SpeedZone>
        </Target>
      </Step>

      <Notes>MooVLab | ${clientName || 'client'} | VMA ref: ${vmaKmh} km/h</Notes>
    </Workout>
  </Workouts>
</TrainingCenterDatabase>`
}

// ZWO uses relative %FTP — Zwift applies the user's own FTP, no scaling needed.
export function generateBikeZWO(clientName) {
  const label = clientName ? ` (${clientName})` : ''
  return `<?xml version="1.0" encoding="UTF-8"?>
<workout_file>
  <author>MooVLab</author>
  <name>MooVLab - Zone 4 FTP 4x10min${label}</name>
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

// MRC uses absolute watts — scaled to client FTP.
export function generateBikeMRC(clientName, ftpWatts) {
  const f = ftpWatts / 200
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
; Echauffement 10 min (45->75% FTP)
0.00    ${w(90)}
10.00   ${w(150)}
; Intervalle 1 : 10 min @ 90% FTP = ${w(180)}W
10.01   ${w(180)}
20.00   ${w(180)}
; Recup 1 : 5 min @ 55% FTP = ${w(110)}W
20.01   ${w(110)}
25.00   ${w(110)}
; Intervalle 2
25.01   ${w(180)}
35.00   ${w(180)}
; Recup 2
35.01   ${w(110)}
40.00   ${w(110)}
; Intervalle 3
40.01   ${w(180)}
50.00   ${w(180)}
; Recup 3
50.01   ${w(110)}
55.00   ${w(110)}
; Intervalle 4
55.01   ${w(180)}
65.00   ${w(180)}
; Recup 4
65.01   ${w(110)}
70.00   ${w(110)}
; Retour au calme 10 min (70->40% FTP)
70.01   ${w(140)}
80.00   ${w(80)}
[END COURSE DATA]`
}

export async function downloadFile(content, filename) {
  const blob = new Blob([content], { type: 'application/octet-stream' })

  // On mobile, use Web Share API so the native share sheet opens
  if (navigator.canShare && navigator.canShare({ files: [new File([blob], filename)] })) {
    const file = new File([blob], filename, { type: 'application/octet-stream' })
    await navigator.share({ files: [file], title: filename })
    return
  }

  // Desktop fallback: trigger a normal download
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
