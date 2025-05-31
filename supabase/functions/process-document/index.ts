
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DocumentChunk {
  chunk_index: number;
  content: string;
  page_number?: number;
  start_char?: number;
  end_char?: number;
  chunk_type?: string;
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

    const { documentId, content, fileType } = await req.json()

    console.log(`Processing document ${documentId} of type ${fileType}`)

    // Smart text chunking based on document structure
    const chunks = chunkText(content, fileType)
    console.log(`Created ${chunks.length} chunks`)

    // Generate embeddings for each chunk
    const processedChunks = []
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      
      try {
        // Generate embedding using OpenAI
        const embedding = await generateEmbedding(chunk.content)
        
        processedChunks.push({
          document_id: documentId,
          chunk_index: chunk.chunk_index,
          content: chunk.content,
          page_number: chunk.page_number,
          start_char: chunk.start_char,
          end_char: chunk.end_char,
          chunk_type: chunk.chunk_type,
          embedding: JSON.stringify(embedding),
          metadata: {}
        })

        console.log(`Processed chunk ${i + 1}/${chunks.length}`)
      } catch (error) {
        console.error(`Error processing chunk ${i}:`, error)
        // Continue with other chunks
      }
    }

    // Store chunks with embeddings in database
    const { error: insertError } = await supabase
      .from('document_chunks')
      .insert(processedChunks)

    if (insertError) {
      console.error('Error inserting chunks:', insertError)
      throw insertError
    }

    // Update document status to completed
    const { error: updateError } = await supabase
      .from('documents')
      .update({ 
        processing_status: 'completed',
        processed_date: new Date().toISOString()
      })
      .eq('id', documentId)

    if (updateError) {
      console.error('Error updating document:', updateError)
      throw updateError
    }

    console.log(`Successfully processed document ${documentId}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        chunksCreated: processedChunks.length 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in process-document:', error)
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

function chunkText(content: string, fileType: string): DocumentChunk[] {
  const chunks: DocumentChunk[] = []
  
  // Smart chunking based on document structure
  if (fileType === 'txt' || fileType === 'md') {
    // Split by paragraphs for text files
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0)
    
    let charOffset = 0
    paragraphs.forEach((paragraph, index) => {
      const trimmed = paragraph.trim()
      if (trimmed.length > 50) { // Minimum chunk size
        chunks.push({
          chunk_index: index,
          content: trimmed,
          start_char: charOffset,
          end_char: charOffset + trimmed.length,
          chunk_type: 'paragraph'
        })
      }
      charOffset += paragraph.length + 2 // +2 for \n\n
    })
  } else {
    // For other file types, use fixed-size chunks with overlap
    const chunkSize = 1000
    const overlap = 200
    
    for (let i = 0; i < content.length; i += chunkSize - overlap) {
      const chunk = content.slice(i, i + chunkSize)
      if (chunk.trim().length > 50) {
        chunks.push({
          chunk_index: Math.floor(i / (chunkSize - overlap)),
          content: chunk.trim(),
          start_char: i,
          end_char: Math.min(i + chunkSize, content.length),
          chunk_type: 'section'
        })
      }
    }
  }
  
  return chunks
}

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
