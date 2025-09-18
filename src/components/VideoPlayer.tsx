'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import AudioPlayer from '@/components/AudioPlayer'
import VideoPlayer from '@/components/VideoPlayer'
import ShareComponent from '@/components/ShareComponent'
import { AlertCircle, Loader2 } from 'lucide-react'

interface RecordingData {
  id: string
  recordingId: string
  shortId: string
  title: string
  fileUrl: string
  duration: number
  fileSize: number
  mimeType: string
  isVideo: boolean
  createdAt: string
}

export default function PlayerPage() {
  const params = useParams()
  const shortId = params.shortId as string
  
  const [recording, setRecording] = useState<RecordingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [playCount, setPlayCount] = useState(0)

  const currentUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/s/${shortId}` 
    : `https://player.voicegift.uk/s/${shortId}`

  useEffect(() => {
    const fetchRecording = async () => {
      if (!shortId) {
        setError('Invalid recording ID')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/play/${shortId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load recording')
        }

        if (!data.success) {
          throw new Error(data.error || 'Recording not found')
        }

        setRecording(data.data)
      } catch (error) {
        console.error('Error fetching recording:', error)
        setError(error instanceof Error ? error.message : 'Failed to load recording')
      } finally {
        setLoading(false)
      }
    }

    fetchRecording()
  }, [shortId])

  const handlePlay = () => {
    setPlayCount(prev => prev + 1)
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 size={48} className="mx-auto mb-4 text-orange-500 animate-spin" />
          <p className="text-lg text-gray-600">Loading your message...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !recording) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md p-8 mx-auto text-center">
          <AlertCircle size={64} className="mx-auto mb-4 text-red-500" />
          <h1 className="mb-2 text-2xl font-bold text-gray-800">
            Message Not Found
          </h1>
          <p className="mb-6 text-gray-600">
            {error || 'The message you\'re looking for doesn\'t exist or has been removed.'}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full btn-primary"
            >
              Try Again
            </button>
            <a
              href="/"
              className="inline-block w-full text-center btn-secondary"
            >
              Go Home
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl px-4 py-4 mx-auto">
          <div className="flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-transparent bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text">
              VoiceGift Player
            </a>
            <div className="text-sm text-gray-600">
              ID: {shortId}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl px-4 py-8 mx-auto">
        <div className="animate-fade-in">
          {/* Player Component - Choose based on media type */}
          {recording.isVideo ? (
            <VideoPlayer
              src={recording.fileUrl}
              title={recording.title}
              duration={recording.duration}
              autoPlay={true}
              onPlay={handlePlay}
            />
          ) : (
            <AudioPlayer
              src={recording.fileUrl}
              title={recording.title}
              duration={recording.duration}
              autoPlay={true}
              onPlay={handlePlay}
            />
          )}

          {/* Action Buttons */}
          <div className="flex flex-col items-center justify-center mt-8 space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6">
            <ShareComponent
              url={currentUrl}
              title={recording.title}
              description={`Listen to this voice message`}
            />
            
            <a
              href={recording.fileUrl}
              download={recording.title}
              className="flex items-center space-x-2 btn-secondary"
            >
              <span>Download</span>
            </a>
          </div>

          {/* Message Info */}
          <div className="p-6 mt-12 bg-white border border-gray-200 rounded-lg shadow-sm">
            <h3 className="mb-4 font-semibold text-gray-800">Message Details</h3>
            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
              <div>
                <p className="text-gray-600">Type</p>
                <p className="font-medium">{recording.isVideo ? 'Video Message' : 'Voice Message'}</p>
              </div>
              <div>
                <p className="text-gray-600">Duration</p>
                <p className="font-medium">
                  {Math.floor(recording.duration / 60)}:{(recording.duration % 60).toString().padStart(2, '0')}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Created</p>
                <p className="font-medium">
                  {new Date(recording.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            {playCount > 0 && (
              <div className="pt-4 mt-4 border-t border-gray-200">
                <p className="text-xs text-gray-600">
                  Played {playCount} time{playCount !== 1 ? 's' : ''} this session
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-white border-t border-gray-200">
        <div className="max-w-4xl px-4 py-8 mx-auto text-center">
          <p className="text-sm text-gray-600">
            Powered by <span className="font-semibold text-transparent bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text">VoiceGift</span>
          </p>
        </div>
      </footer>
    </div>
  )
}