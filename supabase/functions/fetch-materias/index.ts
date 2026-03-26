import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const externalUrl = Deno.env.get('EXTERNAL_SUPABASE_URL')
    const externalKey = Deno.env.get('EXTERNAL_SUPABASE_ANON_KEY')

    console.log('Environment check:', {
      hasExternalUrl: !!externalUrl,
      hasExternalKey: !!externalKey,
      externalUrlPrefix: externalUrl?.substring(0, 30),
    })

    if (!externalUrl || !externalKey) {
      throw new Error('External Supabase credentials not configured')
    }

    const externalSupabase = createClient(externalUrl, externalKey)

    // First, get the total count
    const { count, error: countError } = await externalSupabase
      .from('materias')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('Count error:', JSON.stringify(countError))
      throw countError
    }

    const totalCount = count || 0
    console.log('Total count:', totalCount)
    const pageSize = 1000
    const allData: any[] = []

    // Fetch all data using pagination
    for (let offset = 0; offset < totalCount; offset += pageSize) {
      const { data: pageData, error: pageError } = await externalSupabase
        .from('materias')
        .select('*')
        .range(offset, offset + pageSize - 1)

      if (pageError) {
        console.error('Page error at offset', offset, ':', JSON.stringify(pageError))
        throw pageError
      }

      if (pageData) {
        allData.push(...pageData)
      }
    }

    console.log(`Fetched ${allData.length} records out of ${totalCount} total`)

    return new Response(
      JSON.stringify({ data: allData, total: totalCount }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Error details:', errorMessage)
    if (error instanceof Error && error.stack) {
      console.error('Stack:', error.stack)
    }
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
