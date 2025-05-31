
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

    const formData = await req.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string || file.name

    if (!file) {
      throw new Error('No file provided')
    }

    console.log(`Uploading file: ${file.name}, size: ${file.size}`)

    // Generate unique file path
    const timestamp = Date.now()
    const fileName = `${timestamp}-${file.name}`
    const filePath = `documents/${user.id}/${fileName}`

    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        contentType: file.type,
        duplex: 'half'
      })

    if (uploadError) {
      console.error('Error uploading file:', uploadError)
      throw uploadError
    }

    console.log(`File uploaded to: ${uploadData.path}`)

    // Get file type
    const fileType = getFileType(file.name)
    
    // Extract text content from file
    const content = await extractTextContent(file, fileType)
    
    // Store file metadata in database
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        title: title,
        file_path: uploadData.path,
        file_type: fileType,
        file_size: file.size,
        page_count: estimatePageCount(content),
        processing_status: 'pending'
      })
      .select()
      .single()

    if (docError) {
      console.error('Error inserting document:', docError)
      throw docError
    }

    console.log(`Document created with ID: ${document.id}`)

    // Process document in background
    processDocumentBackground(document.id, content, fileType)

    return new Response(
      JSON.stringify({ 
        success: true, 
        documentId: document.id,
        title: document.title,
        status: 'processing'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in upload-document:', error)
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

function getFileType(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase()
  switch (extension) {
    case 'pdf': return 'pdf'
    case 'docx': return 'docx'
    case 'txt': return 'txt'
    case 'md': return 'md'
    default: return 'txt'
  }
}

async function extractTextContent(file: File, fileType: string): Promise<string> {
  // For now, we'll only handle text files
  if (fileType === 'txt' || fileType === 'md') {
    return await file.text()
  } else {
    // For PDF/DOCX, return placeholder text for demo
    return `Content extracted from ${file.name}. This is a demo placeholder for ${fileType} files.`
  }
}

function estimatePageCount(content: string): number {
  // Rough estimation: 250 words per page
  const wordCount = content.split(/\s+/).length
  return Math.max(1, Math.ceil(wordCount / 250))
}

async function processDocumentBackground(documentId: string, content: string, fileType: string) {
  try {
    console.log(`Starting background processing for document ${documentId}`)
    
    // Call the process-document function
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/process-document`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentId,
        content,
        fileType
      })
    })

    if (!response.ok) {
      throw new Error(`Process document failed: ${await response.text()}`)
    }

    console.log(`Background processing completed for document ${documentId}`)
  } catch (error) {
    console.error(`Background processing failed for document ${documentId}:`, error)
    
    // Update document status to failed
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    await supabase
      .from('documents')
      .update({ processing_status: 'failed' })
      .eq('id', documentId)
  }
}
