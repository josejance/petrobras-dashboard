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

    // Fetch sample data to understand the structure
    const { data, error } = await externalSupabase
      .from('materias')
      .select('*')
      .limit(10)

    if (error) {
      throw error
    }

    // Get column names from the first row
    const columns = data && data.length > 0 ? Object.keys(data[0]) : []

    return new Response(
      JSON.stringify({ 
        columns,
        sampleData: data,
        totalSample: data?.length || 0
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
