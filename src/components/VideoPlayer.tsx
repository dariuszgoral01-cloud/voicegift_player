'use client'

import { useRef, useEffect, useState } from 'react'
import { Play, Pause, Volume2, VolumeX, RotateCcw, Download, Share2 } from 'lucide-react'

interface VideoPlayerProps {
  src: string
  title: string
  duration: number
  senderName?: string
  message?: string
  autoPlay?: boolean
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
}

export default function VideoPlayer({
  src,
  title,
  duration,
  senderName = "Someone special",
  message = "sent you a voice message",
  autoPlay = false,
  onPlay,
  onPause,
  onEnded
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true) // Start muted for mobile compatibility
  const [volume, setVolume] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showPlayButton, setShowPlayButton] = useState(false)
  const [showMessage, setShowMessage] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Detect mobile device
  const isMobile = typeof window !== 'undefined' && 
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  // Hide message after 4 seconds or when video starts playing
  useEffect(() => {
    if (showMessage) {
      const timer = setTimeout(() => {
        setShowMessage(false)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [showMessage])

  useEffect(() => {
    if (isPlaying && showMessage) {
      setShowMessage(false)
    }
  }, [isPlaying, showMessage])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedData = () => {
      setIsLoaded(true)
      if (autoPlay) {
        attemptAutoPlay()
      }
    }

    const handlePlay = () => {
      setIsPlaying(true)
      setShowPlayButton(false)
      setShowMessage(false) // Hide message when playing
      onPlay?.()
    }

    const handlePause = () => {
      setIsPlaying(false)
      onPause?.()
    }

    const handleEnded = () => {
      setIsPlaying(false)
      onEnded?.()
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }

    const handleError = () => {
      setError('Failed to load video file')
      setIsLoaded(false)
    }

    // Set initial properties
    video.volume = volume
    video.muted = isMuted

    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('error', handleError)

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('error', handleError)
    }
  }, [autoPlay, onPlay, onPause, onEnded, volume, isMuted])

  const attemptAutoPlay = async () => {
    const video = videoRef.current
    if (!video) return

    try {
      // Start muted on mobile to bypass auto-play restrictions
      if (isMobile) {
        video.muted = true
        setIsMuted(true)
      }
      
      await video.play()
      setIsPlaying(true)
      setShowPlayButton(false)
      
      // Auto-unmute after 1 second if not mobile
      if (!isMobile) {
        setTimeout(() => {
          video.muted = false
          setIsMuted(false)
        }, 1000)
      }
    } catch (error) {
      console.log('Auto-play blocked, showing play button:', error)
      setShowPlayButton(true)
      setIsPlaying(false)
    }
  }

  const togglePlay = async () => {
    if (!videoRef.current) return

    try {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        // User gesture - can unmute
        if (isMobile && isMuted) {
          videoRef.current.muted = false
          setIsMuted(false)
        }
        await videoRef.current.play()
      }
    } catch (error) {
      console.error('Play failed:', error)
      setError('Failed to play video')
    }
  }

  const handlePlayButtonClick = async () => {
    const video = videoRef.current
    if (!video) return

    try {
      // User clicked - can play unmuted
      video.muted = false
      setIsMuted(false)
      await video.play()
      setShowPlayButton(false)
    } catch (error) {
      console.error('Play button failed:', error)
      // Fallback to download
      window.open(src, '_blank')
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return

    const newMutedState = !isMuted
    videoRef.current.muted = newMutedState
    setIsMuted(newMutedState)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
      if (newVolume > 0) {
        videoRef.current.muted = false
        setIsMuted(false)
      }
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value)
    setCurrentTime(seekTime)
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime
    }
  }

  const restart = () => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = 0
    setCurrentTime(0)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="p-8 text-white shadow-2xl bg-gradient-to-br from-red-500 to-red-600 rounded-2xl">
          <div className="text-center">
            <h3 className="mb-2 text-xl font-bold">Unable to load video</h3>
            <p className="mb-4 opacity-90">{error}</p>
            <button
              onClick={() => window.open(src, '_blank')}
              className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-red-600 transition-colors bg-white rounded-full hover:bg-gray-100"
            >
              <Download size={20} />
              Download & Play
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Welcome Message - Appears first then disappears */}
      {showMessage && (
        <div className="mb-6 text-center animate-fade-in">
          <div className="px-6 py-4 text-white shadow-lg bg-gradient-to-r from-orange-400 to-amber-500 rounded-2xl">
            <h2 className="text-xl font-bold">{senderName}</h2>
            <p className="text-orange-100">{message}</p>
          </div>
        </div>
      )}

      {/* Video Player Container */}
      <div className="overflow-hidden bg-black shadow-2xl rounded-2xl">
        {/* Video Area */}
        <div className="relative bg-gray-900 aspect-video">
          <video
            ref={videoRef}
            src={src}
            className="object-cover w-full h-full"
            muted={isMuted}
            playsInline // Critical for mobile
            webkit-playsinline="true" // iOS Safari
            preload="metadata"
          />
          
          {/* Loading Overlay */}
          {!isLoaded && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-900">
              <div className="text-center text-white">
                <div className="w-12 h-12 mx-auto mb-4 border-white rounded-full border-3 animate-spin border-t-transparent" />
                <p className="text-lg">Loading your message...</p>
              </div>
            </div>
          )}

          {/* Large Play Button for Mobile/Blocked Auto-play */}
          {showPlayButton && isLoaded && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-60">
              <button
                onClick={handlePlayButtonClick}
                className="flex items-center justify-center w-24 h-24 transition-all duration-300 rounded-full shadow-2xl bg-gradient-to-r from-orange-400 to-amber-500 hover:scale-105"
              >
                <Play size={40} className="ml-2 text-white" />
              </button>
            </div>
          )}

          {/* Regular Play Overlay */}
          {isLoaded && !isPlaying && !showPlayButton && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
              <button
                onClick={togglePlay}
                className="flex items-center justify-center w-20 h-20 transition-all bg-white rounded-full bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm"
              >
                <Play size={32} className="ml-1 text-white" />
              </button>
            </div>
          )}
        </div>

        {/* Controls Area - Outside Video */}
        <div className="p-6 bg-gradient-to-r from-gray-900 to-gray-800">
          {/* Title */}
          <h3 className="mb-6 text-lg font-semibold text-center text-white">{title}</h3>
          
          {/* Main Controls Row */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={restart}
              className="p-3 text-gray-300 transition-colors hover:text-white"
              title="Restart"
            >
              <RotateCcw size={24} />
            </button>

            <button
              onClick={togglePlay}
              disabled={!isLoaded}
              className="p-4 transition-all duration-200 rounded-full shadow-lg bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 disabled:opacity-50"
            >
              {isPlaying ? <Pause size={28} className="text-white" /> : <Play size={28} className="text-white" />}
            </button>

            <div className="flex items-center gap-3">
              <button 
                onClick={toggleMute}
                className="p-3 text-gray-300 transition-colors hover:text-white"
              >
                {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>
          </div>

          {/* Progress Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-gray-300">
              <span className="font-mono">{formatTime(currentTime)}</span>
              <span className="font-mono">{formatTime(duration || 0)}</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-3 bg-gray-700 rounded-full appearance-none cursor-pointer accent-orange-500"
                style={{
                  background: `linear-gradient(to right, #f97316 0%, #f97316 ${(currentTime / (duration || 1)) * 100}%, #374151 ${(currentTime / (duration || 1)) * 100}%, #374151 100%)`
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4 pt-4 mt-6 border-t border-gray-700">
            <button
              onClick={() => window.open(src, '_blank')}
              className="inline-flex items-center gap-2 px-4 py-2 text-white transition-colors bg-gray-700 rounded-lg hover:bg-gray-600"
            >
              <Download size={18} />
              Download
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: title,
                    text: `Check out this message from ${senderName}`,
                    url: window.location.href
                  })
                } else {
                  navigator.clipboard.writeText(window.location.href)
                  // You could add a toast notification here
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-white transition-colors bg-orange-600 rounded-lg hover:bg-orange-700"
            >
              <Share2 size={18} />
              Share
            </button>
          </div>

          {/* Mobile Helper Text */}
          {isMobile && showPlayButton && (
            <div className="p-3 mt-4 text-center bg-orange-500 rounded-lg bg-opacity-20">
              <p className="text-sm text-orange-200">
                📱 Tap the play button above to start your message
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        /* Custom range slider styling */
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
        }

        input[type="range"]::-webkit-slider-track {
          background: transparent;
          border-radius: 0.5rem;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 1.25rem;
          width: 1.25rem;
          border-radius: 50%;
          background: #f97316;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          border: 2px solid white;
        }

        input[type="range"]::-moz-range-track {
          background: transparent;
          border-radius: 0.5rem;
          height: 0.75rem;
        }

        input[type="range"]::-moz-range-thumb {
          height: 1.25rem;
          width: 1.25rem;
          border-radius: 50%;
          background: #f97316;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .aspect-video {
          aspect-ratio: 16 / 9;
        }
      `}</style>
    </div>
  )
}