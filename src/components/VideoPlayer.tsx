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
  autoPlay = false,
  onPlay,
  onPause,
  onEnded
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showMessage, setShowMessage] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isBuffering, setIsBuffering] = useState(false)

  // Detect mobile device
  const isMobile = typeof window !== 'undefined' && 
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  // Hide message after 3 seconds or when video starts playing
  useEffect(() => {
    if (showMessage) {
      const timer = setTimeout(() => {
        setShowMessage(false)
      }, 3000)
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

    // Multiple event listeners to catch when video is ready
    const handleLoadedMetadata = () => {
      setIsLoaded(true)
      setIsBuffering(false)
    }

    const handleLoadedData = () => {
      setIsLoaded(true)
      setIsBuffering(false)
    }

    const handleCanPlay = () => {
      setIsLoaded(true)
      setIsBuffering(false)
    }

    const handleCanPlayThrough = () => {
      setIsLoaded(true)
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

    // Add event listeners
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('canplaythrough', handleCanPlayThrough)
    video.addEventListener('waiting', handleWaiting)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('error', handleError)

    // Fallback - assume loaded after 5 seconds
    const fallbackTimer = setTimeout(() => {
      if (!isLoaded) {
        setIsLoaded(true)
        setIsBuffering(false)
      }
    }, 5000)

    // Check if already loaded
    if (video.readyState >= 2) {
      setIsLoaded(true)
      setIsBuffering(false)
    }

    return () => {
      clearTimeout(fallbackTimer)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('canplaythrough', handleCanPlayThrough)
      video.removeEventListener('waiting', handleWaiting)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('error', handleError)
    }
  }, [onPlay, onPause, onEnded, volume, isMuted, isLoaded])

  const handlePlayPause = async () => {
    const video = videoRef.current
    if (!video) return

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
    setIsBuffering(false)
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
      <div className="w-full px-2">
        <div className="p-6 text-white shadow-2xl bg-gradient-to-br from-red-500 to-red-600 rounded-2xl">
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
    <div className={`w-full ${isMobile ? 'px-2' : 'max-w-4xl mx-auto px-4'}`}>
      {/* Welcome Message - Smaller on mobile */}
      {showMessage && (
        <div className={`text-center animate-fade-in ${isMobile ? 'mb-3' : 'mb-6'}`}>
          <div className={`bg-gradient-to-r from-orange-400 to-amber-500 text-white rounded-2xl shadow-lg ${isMobile ? 'px-4 py-3' : 'px-6 py-4'}`}>
            <h2 className={`font-bold ${isMobile ? 'text-lg' : 'text-xl'}`}>{senderName}</h2>
            <p className={`text-orange-100 ${isMobile ? 'text-sm' : ''}`}>{message}</p>
          </div>
        </div>
      )}

      {/* Video Player Container - Much larger on mobile */}
      <div className="w-full overflow-hidden bg-black shadow-2xl rounded-2xl">
        {/* Video Area - Maximum size on mobile */}
        <div className="relative w-full" style={{ 
          paddingBottom: isMobile ? '85%' : '56.25%' // Much taller on mobile
        }}>
          <video
            ref={videoRef}
            src={src}
            className="absolute inset-0 object-cover w-full h-full"
            muted={isMuted}
            playsInline
            webkit-playsinline="true"
            preload="metadata"
            controls={false}
          />
          
          {/* Loading Overlay */}
          {!isLoaded && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-900">
              <div className="text-center text-white">
                <div className="w-16 h-16 mx-auto mb-4 border-4 border-white rounded-full animate-spin border-t-transparent" />
                <p className={`${isMobile ? 'text-base' : 'text-lg'}`}>Loading your message...</p>
              </div>
            </div>
          )}

          {/* Buffering Overlay */}
          {isBuffering && isLoaded && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
              <div className="w-10 h-10 border-white rounded-full border-3 animate-spin border-t-transparent" />
            </div>
          )}

          {/* Play Button Overlay - Extra large on mobile */}
          {isLoaded && !isPlaying && !isBuffering && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-40">
              <button
                onClick={handlePlayPause}
                className={`${
                  isMobile ? 'w-40 h-40' : 'w-28 h-28'
                } bg-gradient-to-r from-orange-400 to-amber-500 rounded-full flex items-center justify-center hover:scale-105 transition-all duration-300 shadow-2xl`}
              >
                <Play size={isMobile ? 64 : 48} className="ml-3 text-white" />
              </button>
            </div>
          )}
        </div>

        {/* Controls Area - Compact on mobile */}
        <div className={`bg-gradient-to-r from-gray-900 to-gray-800 ${isMobile ? 'p-3' : 'p-4 md:p-6'}`}>
          {/* Title - Compact on mobile */}
          <h3 className={`text-white font-semibold text-center ${isMobile ? 'text-lg mb-3' : 'text-xl mb-4 md:mb-6'}`}>
            {title}
          </h3>
          
          {/* Main Controls - Optimized for mobile */}
          <div className={`flex items-center justify-center mb-4 ${isMobile ? 'gap-6' : 'gap-4 md:gap-6'}`}>
            <button
              onClick={handlePlayPause}
              disabled={!isLoaded || isBuffering}
              className={`${
                isLoaded && !isBuffering 
                  ? 'bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600' 
                  : 'bg-gray-600'
              } rounded-full transition-all duration-200 shadow-lg ${
                isMobile ? 'p-5 w-16 h-16' : 'p-4 w-14 h-14'
              }`}
            >
              {isBuffering ? (
                <div className="w-6 h-6 border-2 border-white rounded-full animate-spin border-t-transparent" />
              ) : isPlaying ? (
                <Pause size={isMobile ? 32 : 28} className="text-white" />
              ) : (
                <Play size={isMobile ? 32 : 28} className="text-white" />
              )}
            </button>

            <button
              onClick={handleStop}
              className={`text-gray-300 hover:text-white transition-colors ${
                isMobile ? 'p-4 w-14 h-14' : 'p-3 w-12 h-12'
              }`}
              title="Stop"
            >
              <Square size={isMobile ? 28 : 24} fill="currentColor" />
            </button>

            <button 
              onClick={toggleMute}
              className={`text-gray-300 hover:text-white transition-colors ${
                isMobile ? 'p-4 w-14 h-14' : 'p-3 w-12 h-12'
              }`}
            >
              {isMuted ? (
                <VolumeX size={isMobile ? 28 : 24} />
              ) : (
                <Volume2 size={isMobile ? 28 : 24} />
              )}
            </button>
          </div>

          {/* Progress Section - Larger on mobile */}
          <div className={`mb-4 ${isMobile ? 'space-y-3' : 'space-y-2'}`}>
            <div className="flex items-center justify-between text-gray-300">
              <span className={`font-mono ${isMobile ? 'text-base' : 'text-sm'}`}>
                {formatTime(currentTime)}
              </span>
              <span className={`font-mono ${isMobile ? 'text-base' : 'text-sm'}`}>
                {formatTime(duration || 0)}
              </span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className={`w-full bg-gray-700 rounded-full appearance-none cursor-pointer accent-orange-500 ${
                  isMobile ? 'h-5' : 'h-4'
                }`}
                style={{
                  background: `linear-gradient(to right, #f97316 0%, #f97316 ${(currentTime / (duration || 1)) * 100}%, #374151 ${(currentTime / (duration || 1)) * 100}%, #374151 100%)`
                }}
              />
            </div>
          </div>

          {/* Action Buttons - Full width on mobile */}
          <div className={`flex gap-3 pt-4 border-t border-gray-700 ${isMobile ? 'flex-col' : 'flex-row justify-center'}`}>
            <button
              onClick={handleDownload}
              className={`inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors justify-center ${
                isMobile ? 'w-full px-6 py-4 text-lg font-medium' : 'px-6 py-3'
              }`}
            >
              <Download size={isMobile ? 28 : 20} />
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
              className={`inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors justify-center ${
                isMobile ? 'w-full px-6 py-4 text-lg font-medium' : 'px-6 py-3'
              }`}
            >
              <Share2 size={isMobile ? 28 : 20} />
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}