
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { documentId, content, fileType } = await req.json()

    console.log(`Processing document ${documentId}`)

    // Split content into chunks
    const chunks = chunkText(content, 1000, 200)

    // Generate embeddings for each chunk
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const embeddingPromises = chunks.map(async (chunk, index) => {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: chunk.content,
          model: 'text-embedding-ada-002',
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        document_id: documentId,
        content: chunk.content,
        page_number: chunk.page,
        chunk_index: index,
        embedding: data.data[0].embedding,
      }
    })

    const chunksWithEmbeddings = await Promise.all(embeddingPromises)

    // Insert chunks into database
    const { error: chunksError } = await supabase
      .from('document_chunks')
      .insert(chunksWithEmbeddings)

    if (chunksError) {
      console.error('Error inserting chunks:', chunksError)
      throw chunksError
    }

    // Update document status to completed
    const { error: updateError } = await supabase
      .from('documents')
      .update({ processing_status: 'completed' })
      .eq('id', documentId)

    if (updateError) {
      console.error('Error updating document status:', updateError)
      throw updateError
    }

    console.log(`Document ${documentId} processed successfully`)

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in process-document:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

function chunkText(text: string, chunkSize: number, overlap: number) {
  const chunks = []
  let start = 0
  let page = 1

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    const chunk = text.slice(start, end)
    
    chunks.push({
      content: chunk,
      page: page,
    })

    start = end - overlap
    if (start >= text.length) break
    
    // Estimate page breaks (rough calculation)
    if (chunks.length % 3 === 0) page++
  }

  return chunks
}
