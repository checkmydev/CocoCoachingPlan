import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  const { email, coachName } = await req.json()
  const appUrl = Deno.env.get('APP_URL') ?? 'https://checkmydev.github.io/CocoCoachingPlan/'

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const redirectTo = appUrl.endsWith('/') ? appUrl : `${appUrl}/`

  const { data: inviteData, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { role: 'client' },
    redirectTo,
  })

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  // Ensure the profile exists with role='client' so the client can access the app
  if (inviteData?.user?.id) {
    await admin.from('profiles').upsert(
      { id: inviteData.user.id, email: email, role: 'client' },
      { onConflict: 'id', ignoreDuplicates: false }
    )
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
})
