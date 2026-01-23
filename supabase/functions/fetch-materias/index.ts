import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const externalUrl = Deno.env.get('EXTERNAL_SUPABASE_URL')
    const externalKey = Deno.env.get('EXTERNAL_SUPABASE_ANON_KEY')

    if (!externalUrl || !externalKey) {
      throw new Error('External Supabase credentials not configured')
    }

    const externalSupabase = createClient(externalUrl, externalKey)

    // First, get the total count
    const { count, error: countError } = await externalSupabase
      .from('materias')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      throw countError
    }

    const totalCount = count || 0
    const pageSize = 1000
    const allData: any[] = []

    // Fetch all data using pagination to bypass the 1000 row limit
    for (let offset = 0; offset < totalCount; offset += pageSize) {
      const { data: pageData, error: pageError } = await externalSupabase
        .from('materias')
        .select('*')
        .range(offset, offset + pageSize - 1)

      if (pageError) {
        throw pageError
      }

      if (pageData) {
        allData.push(...pageData)
      }
    }

    console.log(`Fetched ${allData.length} records out of ${totalCount} total`)

    return new Response(
      JSON.stringify({ 
        data: allData,
        total: totalCount
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error:', errorMessage)
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
