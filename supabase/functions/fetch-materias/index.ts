import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message

  if (typeof error === 'string') return error

  if (error && typeof error === 'object') {
    const record = error as Record<string, unknown>
    const parts = [record.message, record.details, record.hint, record.code]
      .filter((part): part is string => typeof part === 'string' && part.length > 0)

    if (parts.length > 0) return parts.join(' | ')

    try {
      return JSON.stringify(record)
    } catch {
      return 'Unknown error'
    }
  }

  return 'Unknown error'
}

function getClientError(error: unknown) {
  const message = getErrorMessage(error)
  const normalizedMessage = message.toLowerCase()

  if (
    normalizedMessage.includes('dns error') ||
    normalizedMessage.includes('failed to lookup address information') ||
    normalizedMessage.includes('name or service not known')
  ) {
    return {
      status: 503,
      message:
        'External data source is unavailable. Check whether the external project is active and whether EXTERNAL_SUPABASE_URL is correct.',
    }
  }

  if (normalizedMessage.includes('credentials not configured')) {
    return {
      status: 500,
      message: 'External data source credentials are not configured.',
    }
  }

  return {
    status: 500,
    message,
  }
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
    })

    if (!externalUrl || !externalKey) {
      throw new Error('External Supabase credentials not configured')
    }

    const externalSupabase = createClient(externalUrl, externalKey)

    const { count, error: countError } = await externalSupabase
      .from('materias')
      .select('id_noticia', { count: 'exact', head: true })

    if (countError) {
      throw new Error(getErrorMessage(countError))
    }

    const totalCount = count || 0
    const pageSize = 1000
    const allData: unknown[] = []

    for (let offset = 0; offset < totalCount; offset += pageSize) {
      const { data: pageData, error: pageError } = await externalSupabase
        .from('materias')
        .select('*')
        .range(offset, offset + pageSize - 1)

      if (pageError) {
        throw new Error(getErrorMessage(pageError))
      }

      if (pageData) {
        allData.push(...pageData)
      }
    }

    console.log(`Fetched ${allData.length} records out of ${totalCount} total`)

    return new Response(JSON.stringify({ data: allData, total: totalCount }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: unknown) {
    const clientError = getClientError(error)

    console.error('fetch-materias error:', getErrorMessage(error))

    return new Response(JSON.stringify({ error: clientError.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: clientError.status,
    })
  }
})
