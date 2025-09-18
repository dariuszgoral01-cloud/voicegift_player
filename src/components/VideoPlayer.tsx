'use client'

import { useRef, useEffect, useState } from 'react'
import { Play, Pause, Volume2, VolumeX, RotateCcw, Download, Share2, Square } from 'lucide-react'

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
  autoPlay = false, // Changed to false by default
  onPlay,
  onPause,
  onEnded
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false) // Start unmuted
  const [volume, setVolume] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showMessage, setShowMessage] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isBuffering, setIsBuffering] = useState(false)

  // Detect mobile device
  const isMobile = typeof window !== 'undefined' && 
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userUser)

  // Hide message after 5 seconds or when video starts playing
  useEffect(() => {
    if (showMessage) {
      const timer = setTimeout(() => {
        setShowMessage(false)
      }, 5000) // Increased to 5 seconds
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
      setIsBuffering(false)
      // Remove auto-play logic - let user click to play
    }

    const handleCanPlay = () => {
      setIsBuffering(false)
    }

    const handleWaiting = () => {
      setIsBuffering(true)
    }

    const handlePlay = () => {
      setIsPlaying(true)
      setIsBuffering(false)
      setShowMessage(false)
      onPlay?.()
    }

    const handlePause = () => {
      setIsPlaying(false)
      setIsBuffering(false)
      onPause?.()
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setIsBuffering(false)
      onEnded?.()
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }

    const handleError = () => {
      setError('Failed to load video file')
      setIsLoaded(false)
      setIsBuffering(false)
    }

    // Set initial properties
    video.volume = volume
    video.muted = isMuted

    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('waiting', handleWaiting)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('error', handleError)

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('waiting', handleWaiting)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('error', handleError)
    }
  }, [onPlay, onPause, onEnded, volume, isMuted])

  const handlePlayPause = async () => {
    const video = videoRef.current
    if (!video || isBuffering) return

    try {
      if (isPlaying) {
        video.pause()
      } else {
        setIsBuffering(true)
        await video.play()
      }
    } catch (error) {
      console.error('Play/Pause failed:', error)
      setError('Failed to play video')
      setIsBuffering(false)
    }
  }

  const handleStop = () => {
    const video = videoRef.current
    if (!video) return

    video.pause()
    video.currentTime = 0
    setCurrentTime(0)
    setIsPlaying(false)
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

  const handleDownload = async () => {
    try {
      const response = await fetch(src)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${title}.${src.split('.').pop() || 'mp4'}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
      // Fallback - open in new tab
      window.open(src, '_blank')
    }
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
              onClick={handleDownload}
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
        {/* Video Area - Responsive mobile-first */}
        <div className="relative w-full" style={{ paddingBottom: '56.25%' /* 16:9 */ }}>
          <video
            ref={videoRef}
            src={src}
            className="absolute inset-0 object-cover w-full h-full"
            muted={isMuted}
            playsInline
            webkit-playsinline="true"
            preload="metadata"
            controls={false} // Hide native controls
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

          {/* Buffering Overlay */}
          {isBuffering && isLoaded && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
              <div className="w-8 h-8 border-2 border-white rounded-full animate-spin border-t-transparent" />
            </div>
          )}

          {/* Play Button Overlay - Always visible when paused */}
          {isLoaded && !isPlaying && !isBuffering && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-40">
              <button
                onClick={handlePlayPause}
                className="flex items-center justify-center w-24 h-24 transition-all duration-300 rounded-full shadow-2xl bg-gradient-to-r from-orange-400 to-amber-500 hover:scale-105"
              >
                <Play size={40} className="ml-2 text-white" />
              </button>
            </div>
          )}
        </div>

        {/* Controls Area - Outside Video, Mobile Optimized */}
        <div className="p-4 md:p-6 bg-gradient-to-r from-gray-900 to-gray-800">
          {/* Title */}
          <h3 className="mb-4 text-lg font-semibold text-center text-white md:mb-6">{title}</h3>
          
          {/* Main Controls Row - Larger for mobile */}
          <div className="flex items-center justify-center gap-3 mb-4 md:gap-4 md:mb-6">
            <button
              onClick={handlePlayPause}
              disabled={!isLoaded || isBuffering}
              className="p-3 md:p-4 bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 rounded-full transition-all duration-200 disabled:opacity-50 shadow-lg min-w-[48px] min-h-[48px] md:min-w-[56px] md:min-h-[56px]"
            >
              {isBuffering ? (
                <div className="w-6 h-6 border-2 border-white rounded-full animate-spin border-t-transparent" />
              ) : isPlaying ? (
                <Pause size={24} className="text-white" />
              ) : (
                <Play size={24} className="text-white" />
              )}
            </button>

            <button
              onClick={handleStop}
              className="p-3 text-gray-300 hover:text-white transition-colors min-w-[48px] min-h-[48px]"
              title="Stop"
            >
              <Square size={20} fill="currentColor" />
            </button>

            <div className="flex items-center gap-2 md:gap-3">
              <button 
                onClick={toggleMute}
                className="p-3 text-gray-300 hover:text-white transition-colors min-w-[48px] min-h-[48px]"
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              {!isMobile && ( // Hide volume slider on mobile to save space
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer md:w-20 accent-orange-500"
                />
              )}
            </div>
          </div>

          {/* Progress Section */}
          <div className="mb-4 space-y-2 md:space-y-3">
            <div className="flex items-center justify-between text-sm text-gray-300">
              <span className="font-mono text-xs md:text-sm">{formatTime(currentTime)}</span>
              <span className="font-mono text-xs md:text-sm">{formatTime(duration || 0)}</span>
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

          {/* Action Buttons - Stacked on mobile */}
          <div className="flex flex-col items-center justify-center gap-3 pt-4 border-t border-gray-700 sm:flex-row sm:gap-4">
            <button
              onClick={handleDownload}
              className="inline-flex items-center justify-center w-full gap-2 px-4 py-2 text-white transition-colors bg-gray-700 rounded-lg hover:bg-gray-600 sm:w-auto"
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
                  alert('Link copied to clipboard!')
                }
              }}
              className="inline-flex items-center justify-center w-full gap-2 px-4 py-2 text-white transition-colors bg-orange-600 rounded-lg hover:bg-orange-700 sm:w-auto"
            >
              <Share2 size={18} />
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}