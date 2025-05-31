
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { documentId, question, chunkCount = 5 } = await req.json()

    console.log(`Processing RAG query for document ${documentId}: "${question}"`)

    // Generate embedding for the user question
    const questionEmbedding = await generateEmbedding(question)
    console.log('Generated question embedding')

    // Search for similar chunks using the vector search function
    const { data: similarChunks, error: searchError } = await supabase
      .rpc('search_document_chunks', {
        query_embedding: JSON.stringify(questionEmbedding),
        doc_id: documentId,
        match_threshold: 0.7,
        match_count: chunkCount
      })

    if (searchError) {
      console.error('Error searching chunks:', searchError)
      throw searchError
    }

    console.log(`Found ${similarChunks?.length || 0} relevant chunks`)

    if (!similarChunks || similarChunks.length === 0) {
      return new Response(
        JSON.stringify({ 
          answer: "I couldn't find relevant information in the document to answer your question.",
          sources: []
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    // Construct context from retrieved chunks
    const context = similarChunks
      .map((chunk, index) => `[${index + 1}] ${chunk.content}`)
      .join('\n\n')

    // Generate answer using OpenAI
    const answer = await generateAnswer(question, context)
    console.log('Generated answer')

    // Prepare sources with chunk information
    const sources = similarChunks.map((chunk, index) => ({
      chunkId: chunk.id,
      pageNumber: chunk.page_number,
      chunkIndex: chunk.chunk_index,
      similarity: chunk.similarity,
      preview: chunk.content.substring(0, 150) + '...'
    }))

    return new Response(
      JSON.stringify({ 
        answer,
        sources,
        context: similarChunks.map(c => c.content)
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in rag-query:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    )
  }
})

async function generateEmbedding(text: string): Promise<number[]> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
  
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured')
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: text,
      model: 'text-embedding-ada-002',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${error}`)
  }

  const data = await response.json()
  return data.data[0].embedding
}

async function generateAnswer(question: string, context: string): Promise<string> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
  
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured')
  }

  const prompt = `You are a helpful AI assistant that answers questions based on provided document context. 

Context from the document:
${context}

Question: ${question}

Instructions:
- Answer the question based ONLY on the provided context
- If the context doesn't contain enough information to answer the question, say so
- Be concise but comprehensive
- Include relevant details from the context
- If you reference specific information, you can mention it comes from the document sections provided

Answer:`

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.3,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${error}`)
  }

  const data = await response.json()
  return data.choices[0].message.content.trim()
}
