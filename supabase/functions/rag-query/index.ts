
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

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Get user from JWT token
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    const { query, documentId } = await req.json()

    if (!query) {
      throw new Error('Query is required')
    }

    console.log(`Processing query: ${query}`)

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Generate embedding for the query
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: query,
        model: 'text-embedding-ada-002',
      }),
    })

    if (!embeddingResponse.ok) {
      throw new Error(`OpenAI embedding error: ${embeddingResponse.statusText}`)
    }

    const embeddingData = await embeddingResponse.json()
    const queryEmbedding = embeddingData.data[0].embedding

    // Search for similar chunks
    let searchQuery = supabase.rpc('search_document_chunks', {
      query_embedding: queryEmbedding,
      doc_id: documentId,
      match_threshold: 0.7,
      match_count: 5
    })

    // If no specific document, search across all user's documents
    if (!documentId) {
      const { data: userDocs } = await supabase
        .from('documents')
        .select('id')
        .eq('user_id', user.id)

      if (userDocs && userDocs.length > 0) {
        // For demo, just use the first document
        const firstDocId = userDocs[0].id
        searchQuery = supabase.rpc('search_document_chunks', {
          query_embedding: queryEmbedding,
          doc_id: firstDocId,
          match_threshold: 0.7,
          match_count: 5
        })
      }
    }

    const { data: chunks, error: searchError } = await searchQuery

    if (searchError) {
      console.error('Error searching chunks:', searchError)
      throw searchError
    }

    if (!chunks || chunks.length === 0) {
      return new Response(
        JSON.stringify({
          answer: "I couldn't find relevant information in the documents to answer your question.",
          sources: []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Prepare context from chunks
    const context = chunks.map((chunk: any) => chunk.content).join('\n\n')

    // Generate answer using OpenAI
    const completionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that answers questions based on the provided context. If the context does not contain relevant information, say so clearly.'
          },
          {
            role: 'user',
            content: `Context:\n${context}\n\nQuestion: ${query}`
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    if (!completionResponse.ok) {
      throw new Error(`OpenAI completion error: ${completionResponse.statusText}`)
    }

    const completionData = await completionResponse.json()
    const answer = completionData.choices[0].message.content

    // Prepare sources
    const sources = chunks.map((chunk: any) => ({
      page: chunk.page_number,
      content: chunk.content.substring(0, 200) + '...',
      similarity: chunk.similarity
    }))

    return new Response(
      JSON.stringify({
        answer,
        sources
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in rag-query:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
