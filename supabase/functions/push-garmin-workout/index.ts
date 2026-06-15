import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Build a Garmin Connect workout object from MooVLab session_data
function buildWorkout(name: string, sd: any, vma: number) {
  const SPORT = { sportTypeId: 1, sportTypeKey: 'running' }
  const NO_TARGET = {
    targetType: { workoutTargetTypeId: 1, workoutTargetTypeKey: 'no.target' },
    targetValueOne: null,
    targetValueTwo: null,
    zoneNumber: null,
  }

  const steps: any[] = []
  let so = 1

  function execStep(
    desc: string,
    endKey: 'time' | 'distance',
    endVal: number,
    intensity = 'ACTIVE',
    childStepId: number | null = null,
  ) {
    return {
      stepOrder: so++,
      stepType: { stepTypeId: 7, stepTypeKey: 'ExecutableStep' },
      childStepId,
      description: desc,
      endCondition: endKey === 'time'
        ? { conditionTypeId: 2, conditionTypeKey: 'time' }
        : { conditionTypeId: 3, conditionTypeKey: 'distance' },
      endConditionValue: endVal,
      preferredEndConditionUnit: endKey === 'distance' ? { unitId: 2, unitKey: 'meter' } : null,
      isEndConditionCustom: false,
      ...NO_TARGET,
      intensity: intensity === 'REST'
        ? { intensityId: 2, intensityKey: 'REST' }
        : { intensityId: 1, intensityKey: 'ACTIVE' },
    }
  }

  if (+sd?.warmup?.duration_min > 0) {
    const z = sd.warmup.zone ?? 'Z2'
    steps.push(execStep(`Echauffement ${z}`, 'time', Math.round(sd.warmup.duration_min * 60)))
  }

  if (sd?.main?.mode === 'intervals') {
    for (const itv of sd.main.intervals ?? []) {
      const reps = Math.max(1, parseInt(itv.reps) || 1)
      const z = itv.zone ?? 'Z4'
      const parentSo = so++

      const childSteps: any[] = []
      const effortKey = (itv.effort_mode ?? 'distance') === 'time' ? 'time' : 'distance'
      const effortVal = effortKey === 'distance'
        ? (parseInt(itv.distance_m) || 400)
        : (parseInt(itv.duration_sec) || 60)
      childSteps.push(execStep(
        `${z} – ${effortKey === 'distance' ? effortVal + 'm' : effortVal + 's'}`,
        effortKey, effortVal, 'ACTIVE', parentSo,
      ))

      const recVal = itv.recovery_mode === 'distance'
        ? (parseInt(itv.recovery_dist_m) || 0)
        : (parseInt(itv.recovery_sec) || 0)
      if (recVal > 0) {
        const recKey = itv.recovery_mode === 'distance' ? 'distance' : 'time'
        childSteps.push(execStep('Récupération Z1', recKey, recVal, 'REST', parentSo))
      }

      steps.push({
        stepOrder: parentSo,
        stepType: { stepTypeId: 6, stepTypeKey: 'RepeatGroupStep' },
        childStepId: null,
        numberOfIterations: reps,
        endCondition: { conditionTypeId: 7, conditionTypeKey: 'iterations' },
        endConditionValue: reps,
        workoutSteps: childSteps,
      })
    }
  } else if (sd?.main?.mode === 'continuous' && +sd?.main?.duration_min > 0) {
    const z = sd.main.zone ?? 'Z3'
    steps.push(execStep(`Continu ${z}`, 'time', Math.round(sd.main.duration_min * 60)))
  }

  if (+sd?.cooldown?.duration_min > 0) {
    const z = sd.cooldown.zone ?? 'Z1'
    steps.push(execStep(`Retour calme ${z}`, 'time', Math.round(sd.cooldown.duration_min * 60), 'REST'))
  }

  if (steps.length === 0) steps.push(execStep('Séance MooVLab', 'time', 1800))

  return {
    workoutName: name.slice(0, 50),
    description: `MooVLab | VMA ${vma} km/h`,
    sportType: SPORT,
    workoutSegments: [{ segmentOrder: 1, sportType: SPORT, workoutSteps: steps }],
  }
}

serve(async (req: Request) => {
  // OPTIONS always succeeds — must be before any import that could fail
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const { garminEmail, garminPassword, sessionTitle, sessionData, vmaKmh } = await req.json()

    if (!garminEmail?.trim() || !garminPassword?.trim()) {
      return new Response(JSON.stringify({ error: 'Email et mot de passe Garmin requis' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    // Lazy import so module load errors don't prevent OPTIONS handler from working
    const { GarminConnect } = await import('npm:garmin-connect')

    const gc = new GarminConnect({ domain: 'garmin.com' })
    await gc.login(garminEmail.trim(), garminPassword)

    const workout = buildWorkout(sessionTitle || 'MooVLab', sessionData ?? {}, vmaKmh || 14)
    const result = await gc.addWorkout(workout)

    return new Response(JSON.stringify({
      success: true,
      workoutId: result?.workoutId,
      workoutName: result?.workoutName ?? workout.workoutName,
    }), { headers: { ...cors, 'Content-Type': 'application/json' } })

  } catch (err: any) {
    const msg = err?.message || 'Erreur lors de la connexion à Garmin Connect'
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }
})
