'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import VideoPlayer from '../../../components/VideoPlayer'
import AudioPlayer from '../../../components/AudioPlayer'
import Header from '../../../components/Header'
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
  // Optional fields for personalization
  senderName?: string
  occasion?: string
  customMessage?: string
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

  // Helper function to extract personalized message info
  const getPersonalizedMessage = (recording: RecordingData) => {
    // Extract sender info from title or use defaults
    const senderName = recording.senderName || 
      (recording.title.includes('from') ? 
       recording.title.split('from')[1]?.trim() : 
       "Someone special")
    
    const occasion = recording.occasion || 
      (recording.title.toLowerCase().includes('birthday') ? 'birthday message' :
       recording.title.toLowerCase().includes('christmas') ? 'Christmas message' :
       recording.title.toLowerCase().includes('anniversary') ? 'anniversary message' :
       'message')
    
    const customMessage = recording.customMessage || `sent you a ${occasion}`
    
    return { senderName, message: customMessage }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center text-white">
            <Loader2 size={64} className="mx-auto mb-6 text-orange-500 animate-spin" />
            <h1 className="mb-2 text-2xl font-bold">Loading your message...</h1>
            <p className="text-gray-300">Please wait while we prepare your voice gift</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !recording) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="max-w-md p-8 mx-auto text-center">
            <div className="mb-6">
              <AlertCircle size={80} className="mx-auto mb-4 text-red-400" />
              <h1 className="mb-2 text-3xl font-bold text-white">
                Message Not Found
              </h1>
              <p className="mb-6 text-gray-300">
                {error || 'The message you\'re looking for doesn\'t exist or has been removed.'}
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-6 py-3 text-white transition-all duration-300 rounded-full bg-gradient-to-r from-orange-400 to-amber-500 hover:shadow-2xl hover:scale-105"
              >
                Try Again
              </button>
              <a
                href="https://voicegift.uk"
                className="inline-block w-full px-6 py-3 text-center text-gray-300 transition-all duration-300 bg-gray-700 rounded-full hover:bg-gray-600"
              >
                Go to VoiceGift
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Get personalized message data
  const { senderName, message } = getPersonalizedMessage(recording)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Header />
      
      {/* Main Player Section - Mobile First Layout */}
      <main className="pt-16 md:pt-20"> {/* Add top padding for header */}
        <div className="px-4 py-4 md:py-8">
          {/* Player Component - Full width on mobile, centered on desktop */}
          <div className="w-full md:max-w-4xl md:mx-auto">
            {recording.isVideo ? (
              <VideoPlayer
                src={recording.fileUrl}
                title={recording.title}
                duration={recording.duration}
                senderName={senderName}
                message={message}
                autoPlay={false} // Disabled auto-play as requested
                onPlay={handlePlay}
              />
            ) : (
              <AudioPlayer
                src={recording.fileUrl}
                title={recording.title}
                duration={recording.duration}
                autoPlay={false} // Disabled auto-play as requested
                onPlay={handlePlay}
              />
            )}
          </div>

          {/* Message Details Card - Below player */}
          <div className="px-4 mt-6 md:mt-8">
            <div className="w-full p-6 bg-white border border-gray-200 shadow-xl md:max-w-2xl md:mx-auto md:p-8 rounded-2xl bg-opacity-95 backdrop-blur-sm">
              <h3 className="mb-4 text-lg font-bold text-center text-gray-800 md:mb-6 md:text-xl">Message Details</h3>
              
              {/* Mobile-first grid layout */}
              <div className="grid grid-cols-1 gap-4 mb-6 text-center sm:grid-cols-3 md:gap-6">
                <div className="p-3 md:p-4 bg-gray-50 rounded-xl">
                  <p className="mb-2 text-xs font-medium text-gray-600 md:text-sm">Type</p>
                  <div className="flex items-center justify-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${recording.isVideo ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                    <p className="text-sm font-semibold text-gray-900 md:text-base">
                      {recording.isVideo ? 'Video' : 'Voice'}
                    </p>
                  </div>
                </div>
                
                <div className="p-3 md:p-4 bg-gray-50 rounded-xl">
                  <p className="mb-2 text-xs font-medium text-gray-600 md:text-sm">Duration</p>
                  <p className="text-lg font-bold text-orange-600 md:text-2xl">
                    {Math.floor(recording.duration / 60)}:{(recording.duration % 60).toString().padStart(2, '0')}
                  </p>
                </div>
                
                <div className="p-3 md:p-4 bg-gray-50 rounded-xl">
                  <p className="mb-2 text-xs font-medium text-gray-600 md:text-sm">Created</p>
                  <p className="text-sm font-semibold text-gray-900 md:text-base">
                    {new Date(recording.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* File Info - Collapsed on mobile */}
              <details className="mb-4 md:mb-6">
                <summary className="mb-2 text-sm font-medium text-gray-600 cursor-pointer md:text-base">
                  File Information
                </summary>
                <div className="pt-2 text-center border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 md:text-sm">
                    <div>
                      <span className="font-medium">Size:</span> {(recording.fileSize / 1024 / 1024).toFixed(2)} MB
                    </div>
                    <div>
                      <span className="font-medium">Format:</span> {recording.mimeType.split('/')[1].toUpperCase()}
                    </div>
                  </div>
                </div>
              </details>

              {/* Play Statistics */}
              {playCount > 0 && (
                <div className="mb-4 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <p className="text-xs font-medium text-orange-700 md:text-sm">
                      Played {playCount} time{playCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              )}

              {/* Share Section - Mobile optimized */}
              <div className="text-center">
                <p className="mb-4 text-xs text-gray-600 md:text-sm">Share this message</p>
                <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: recording.title,
                          text: `Listen to this message from ${senderName}`,
                          url: currentUrl
                        })
                      } else {
                        navigator.clipboard.writeText(currentUrl)
                        alert('Link copied to clipboard!')
                      }
                    }}
                    className="inline-flex items-center justify-center w-full gap-2 px-6 py-3 text-white transition-all duration-300 rounded-full sm:w-auto bg-gradient-to-r from-orange-400 to-amber-500 hover:shadow-xl hover:scale-105"
                  >
                    Share Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - Simplified for mobile */}
      <footer className="py-6 mt-8 text-center text-gray-400 border-t border-gray-800 md:py-8">
        <div className="max-w-4xl px-4 mx-auto">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-r from-orange-400 to-amber-500">
              <span className="text-xs text-white">🎤</span>
            </div>
            <span className="font-semibold text-transparent bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text">
              VoiceGift
            </span>
          </div>
          <p className="text-xs md:text-sm">
            Creating memorable voice messages
          </p>
        </div>
      </footer>
    </div>
  )
}