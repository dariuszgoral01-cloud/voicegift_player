import { NextRequest, NextResponse } from 'next/server'
import { getRecordingByShortId } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { shortId: string } }
) {
  try {
    const { shortId } = params

    if (!shortId) {
      return NextResponse.json(
        { success: false, error: 'Missing shortId parameter' },
        { status: 400 }
      )
    }

    // Get recording from voice_recordings table using short_url_slug
    const recording = await getRecordingByShortId(shortId)

    if (!recording) {
      return NextResponse.json(
        { success: false, error: 'Recording not found' },
        { status: 404 }
      )
    }

    // Use file_url directly (already a complete URL)
    const fileUrl = recording.file_url

    // Check if video or audio based on media_type
    const isVideo = recording.media_type === 'video' || 
                   recording.media_type?.toLowerCase().includes('video')

    // Create title from customer name and product
    const title = recording.customer_name && recording.product_name
      ? `${recording.product_name} for ${recording.customer_name}`
      : recording.customer_name 
        ? `Voice Message for ${recording.customer_name}`
        : recording.product_name || 'Voice Message'

    const response = {
      success: true,
      data: {
        id: recording.id.toString(),
        recordingId: recording.recording_id,
        shortId: recording.short_url_slug,
        title: title,
        fileUrl: fileUrl,
        duration: recording.duration_seconds || 0,
        fileSize: recording.file_size || 0,
        mimeType: recording.media_type || (isVideo ? 'video/mp4' : 'audio/mp3'),
        isVideo: isVideo,
        createdAt: recording.created_at,
        customerName: recording.customer_name,
        productName: recording.product_name,
        hasVirtualBackground: recording.has_virtual_background,
        backgroundName: recording.background_name,
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}