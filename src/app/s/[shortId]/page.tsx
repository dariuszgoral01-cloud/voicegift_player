'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Header from '../../../components/Header'
import { AlertCircle, Play, Pause, Volume2, VolumeX, Download, Share2 } from 'lucide-react'

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
  const audioRef = useRef<HTMLAudioElement>(null)
  
  const [recording, setRecording] = useState<RecordingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [playCount, setPlayCount] = useState(0)

  // Player states
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

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

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleLoadedData = () => {
      setIsLoading(false)
      // Auto-play
      audio.play().then(() => {
        setIsPlaying(true)
      }).catch(console.log)
    }
    const handleEnded = () => setIsPlaying(false)
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadeddata', handleLoadedData)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadeddata', handleLoadedData)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
    }
  }, [recording])

  // Player control functions
  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio) return

    try {
      if (isPlaying) {
        audio.pause()
      } else {
        await audio.play()
        setPlayCount(prev => prev + 1)
      }
    } catch (error) {
      console.error('Play error:', error)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    audio.volume = newVolume
    
    if (newVolume > 0) {
      setIsMuted(false)
    }
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isMuted) {
      audio.volume = volume
      setIsMuted(false)
    } else {
      audio.volume = 0
      setIsMuted(true)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Audio Visualizer for audio files
  const AudioVisualizer = () => (
    <div className="flex items-center justify-center w-full h-full">
      <div className="flex items-end space-x-3">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className={`w-4 bg-gradient-to-t from-amber-500 to-orange-500 rounded-t-lg transition-all duration-200 ${
              isPlaying ? 'animate-pulse' : ''
            }`}
            style={{
              height: isPlaying 
                ? `${30 + Math.random() * 80}px` 
                : '30px',
              animationDelay: `${i * 0.1}s`
            }}
          />
        ))}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="relative flex items-center justify-center min-h-screen bg-black">
          <div className="text-center text-white">
            <div className="w-16 h-16 mx-auto mb-4 border-4 rounded-full border-amber-500 border-t-transparent animate-spin"></div>
            <p className="text-lg font-semibold">Loading your message...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !recording) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="relative flex items-center justify-center min-h-screen bg-black">
          <div className="max-w-md p-8 mx-auto text-center text-white">
            <AlertCircle size={64} className="mx-auto mb-4 text-red-500" />
            <h1 className="mb-2 text-2xl font-bold">Message Not Found</h1>
            <p className="mb-6 text-white/80">
              {error || 'The message you\'re looking for doesn\'t exist or has been removed.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 font-semibold text-white transition-all duration-300 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-xl hover:scale-105"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main>
        {/* Hero Player Section - Replaces the ocean image */}
        <div className="relative min-h-screen overflow-hidden bg-black">
          {/* Audio element */}
          <audio
            ref={audioRef}
            src={recording.fileUrl}
            preload="metadata"
            className="hidden"
          />

          {/* Video or Audio Visualization Background */}
          {recording.isVideo ? (
            <video
              src={recording.fileUrl}
              className="absolute inset-0 object-cover w-full h-full"
              autoPlay
              loop
              muted={isMuted}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
              <AudioVisualizer />
            </div>
          )}

          {/* Dark overlay for better text visibility */}
          <div className="absolute inset-0 bg-black/30" />

          {/* Content over the player */}
          <div className="relative z-10 flex items-center justify-center min-h-screen px-4 text-center">
            <div className="max-w-2xl mx-auto">
              <h1 className="mb-6 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                {recording.title}
              </h1>
              
              <p className="mb-8 text-lg sm:text-xl text-white/90">
                {recording.isVideo ? 'Video Message' : 'Voice Message'}
              </p>

              {/* Player Controls */}
              <div className="flex items-center justify-center mb-8 space-x-4">
                <button 
                  onClick={togglePlay}
                  disabled={isLoading}
                  className="p-4 text-white transition-all duration-200 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white rounded-full border-t-transparent animate-spin" />
                  ) : isPlaying ? (
                    <Pause size={24} />
                  ) : (
                    <Play size={24} />
                  )}
                </button>
                
                <button 
                  onClick={toggleMute}
                  className="p-3 text-white transition-all duration-200 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>

                {/* Volume Slider */}
                <div className="items-center hidden space-x-2 sm:flex">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 rounded-lg appearance-none cursor-pointer bg-white/30"
                    style={{
                      background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) 100%)`
                    }}
                  />
                </div>
                
                <a
                  href={recording.fileUrl}
                  download={recording.title}
                  className="p-3 text-white transition-all duration-200 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
                >
                  <Download size={20} />
                </a>
                
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: recording.title, url: currentUrl })
                    }
                  }}
                  className="p-3 text-white transition-all duration-200 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
                >
                  <Share2 size={20} />
                </button>
              </div>

              {/* Time display */}
              <div className="text-sm text-white/80">
                {formatTime(currentTime)} / {formatTime(recording.duration)}
              </div>
            </div>
          </div>

          {/* Progress bar at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div
              className="h-full transition-all duration-100 bg-gradient-to-r from-amber-400 to-orange-500"
              style={{ width: `${(currentTime / recording.duration) * 100}%` }}
            />
          </div>
        </div>

        {/* Rest of the page content */}
        <div className="py-16 bg-white sm:py-24">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
                Message Details
              </h2>
            </div>

            <div className="max-w-md p-8 mx-auto bg-gray-50 rounded-2xl">
              <div className="space-y-4 text-center">
                <div>
                  <p className="mb-1 font-semibold text-gray-600">Type</p>
                  <p className="font-semibold text-gray-900">
                    {recording.isVideo ? 'Video Message' : 'Voice Message'}
                  </p>
                </div>
                <div>
                  <p className="mb-1 font-semibold text-gray-600">Duration</p>
                  <p className="font-semibold text-gray-900">
                    {Math.floor(recording.duration / 60)}:{(recording.duration % 60).toString().padStart(2, '0')}
                  </p>
                </div>
                <div>
                  <p className="mb-1 font-semibold text-gray-600">Created</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(recording.createdAt).toLocaleDateString()}
                  </p>
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
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-white bg-gray-900">
        <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500">
                <i className="text-lg text-white ri-mic-line"></i>
              </div>
              <span className="text-white font-['Pacifico'] text-xl">VoiceGift</span>
            </div>
            <p className="text-sm text-gray-400">
              Powered by VoiceGift • Creating memorable voice messages
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}