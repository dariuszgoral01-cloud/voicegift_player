import { NextRequest, NextResponse } from 'next/server'
import { getRecordingByShortId } from '../../../../lib/supabase'

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

    console.log('🎯 API: Looking for recording with shortId:', shortId)

    // Pobierz nagranie z bazy danych
    const recording = await getRecordingByShortId(shortId)

    if (!recording) {
      console.log('❌ API: Recording not found for shortId:', shortId)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Recording not found',
          shortId: shortId
        },
        { status: 404 }
      )
    }

    console.log('✅ API: Recording found:', recording.title)

    return NextResponse.json({
      success: true,
      data: recording
    })

  } catch (error) {
    console.error('💥 API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}