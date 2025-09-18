import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Interface dla nagrań
export interface Recording {
  id: string
  title: string
  fileUrl: string
  duration: number
  fileSize: number
  mimeType: string
  isVideo: boolean
  createdAt: string
  shortId: string
}

// Unified function dla obu tabel - POPRAWIONE NAZWY KOLUMN
export async function getRecordingByShortId(shortId: string): Promise<Recording | null> {
  console.log('🔍 Searching for recording:', shortId)

  // KROK 1: Sprawdź nową tabelę 'recordings' (play_slug)
  const { data: newRecording, error: newError } = await supabase
    .from('recordings')
    .select(`
      id,
      product_name,
      file_path,
      duration_seconds,
      size_bytes,
      mime_type,
      type,
      created_at,
      play_slug
    `)
    .eq('play_slug', shortId)
    .single()

  if (newRecording && !newError) {
    console.log('✅ Found in recordings table:', newRecording)
    
    // Buduj pełny URL do pliku
    const fileUrl = `https://gbhbrdcbexhybxowkpaz.supabase.co/storage/v1/object/public/voice-recordings/${newRecording.file_path}`
    
    return {
      id: newRecording.id,
      title: newRecording.product_name || `Voice Message`,
      fileUrl: fileUrl,
      duration: newRecording.duration_seconds || 0,
      fileSize: newRecording.size_bytes || 0,
      mimeType: newRecording.mime_type || 'video/webm',
      isVideo: newRecording.type === 'video',
      createdAt: newRecording.created_at,
      shortId: newRecording.play_slug
    }
  }

  console.log('❌ Not found in recordings table, trying voice_recordings...')

  // KROK 2: Sprawdź legacy tabelę 'voice_recordings' (short_url_slug)
  const { data: legacyRecording, error: legacyError } = await supabase
    .from('voice_recordings')
    .select(`
      id,
      product_name,
      file_url,
      duration_seconds,
      file_size,
      media_type,
      created_at,
      short_url_slug
    `)
    .eq('short_url_slug', shortId)
    .single()

  if (legacyRecording && !legacyError) {
    console.log('✅ Found in voice_recordings table:', legacyRecording)
    
    return {
      id: legacyRecording.id.toString(),
      title: legacyRecording.product_name || `Voice Message`,
      fileUrl: legacyRecording.file_url,
      duration: legacyRecording.duration_seconds || 0,
      fileSize: legacyRecording.file_size || 0,
      mimeType: legacyRecording.media_type === 'video' ? 'video/webm' : 'audio/webm',
      isVideo: legacyRecording.media_type === 'video',
      createdAt: legacyRecording.created_at,
      shortId: legacyRecording.short_url_slug
    }
  }

  console.log('❌ Recording not found in any table')
  console.log('New table error:', newError)
  console.log('Legacy table error:', legacyError)
  
  return null
}

// Helper do pobierania file URL z Supabase Storage
export function getStorageFileUrl(bucketName: string, filePath: string): string {
  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath)
  
  return data.publicUrl
}