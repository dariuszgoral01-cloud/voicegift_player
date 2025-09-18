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

  // Hide message after 5 seconds or when video starts playing
  useEffect(() => {
    if (showMessage) {
      const timer = setTimeout(() => {
        setShowMessage(false)
      }, 5000)
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
      <div className="w-full px-4 mx-auto">
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
    <div className="w-full px-4 mx-auto">
      {/* Welcome Message - Appears first then disappears */}
      {showMessage && (
        <div className="mb-6 text-center animate-fade-in">
          <div className="px-6 py-4 text-white shadow-lg bg-gradient-to-r from-orange-400 to-amber-500 rounded-2xl">
            <h2 className="text-xl font-bold">{senderName}</h2>
            <p className="text-orange-100">{message}</p>
          </div>
        </div>
      )}

      {/* Video Player Container - Full width on mobile */}
      <div className="w-full overflow-hidden bg-black shadow-2xl rounded-2xl">
        {/* Video Area - Larger on mobile, maintains aspect ratio */}
        <div className="relative w-full" style={{ 
          paddingBottom: isMobile ? '75%' : '56.25%' // Taller on mobile for better viewing
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

          {/* Play Button Overlay - Always visible when paused, larger on mobile */}
          {isLoaded && !isPlaying && !isBuffering && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-40">
              <button
                onClick={handlePlayPause}
                className={`${
                  isMobile ? 'w-32 h-32' : 'w-24 h-24'
                } bg-gradient-to-r from-orange-400 to-amber-500 rounded-full flex items-center justify-center hover:scale-105 transition-all duration-300 shadow-2xl`}
              >
                <Play size={isMobile ? 48 : 40} className="ml-2 text-white" />
              </button>
            </div>
          )}
        </div>

        {/* Controls Area - Mobile Optimized */}
        <div className="p-4 md:p-6 bg-gradient-to-r from-gray-900 to-gray-800">
          {/* Title - Larger on mobile */}
          <h3 className={`text-white font-semibold text-center mb-4 md:mb-6 ${
            isMobile ? 'text-xl' : 'text-lg'
          }`}>{title}</h3>
          
          {/* Main Controls Row - Larger buttons for mobile */}
          <div className="flex items-center justify-center gap-4 mb-4 md:gap-6 md:mb-6">
            <button
              onClick={handlePlayPause}
              disabled={!isLoaded || isBuffering}
              className={`${
                isLoaded && !isBuffering 
                  ? 'bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600' 
                  : 'bg-gray-600'
              } rounded-full transition-all duration-200 shadow-lg ${
                isMobile ? 'p-4 min-w-[56px] min-h-[56px]' : 'p-3 md:p-4 min-w-[48px] min-h-[48px] md:min-w-[56px] md:min-h-[56px]'
              }`}
            >
              {isBuffering ? (
                <div className="w-6 h-6 border-2 border-white rounded-full animate-spin border-t-transparent" />
              ) : isPlaying ? (
                <Pause size={isMobile ? 28 : 24} className="text-white" />
              ) : (
                <Play size={isMobile ? 28 : 24} className="text-white" />
              )}
            </button>

            <button
              onClick={handleStop}
              className={`text-gray-300 hover:text-white transition-colors ${
                isMobile ? 'p-4 min-w-[56px] min-h-[56px]' : 'p-3 min-w-[48px] min-h-[48px]'
              }`}
              title="Stop"
            >
              <Square size={isMobile ? 24 : 20} fill="currentColor" />
            </button>

            <div className="flex items-center gap-2 md:gap-3">
              <button 
                onClick={toggleMute}
                className={`text-gray-300 hover:text-white transition-colors ${
                  isMobile ? 'p-4 min-w-[56px] min-h-[56px]' : 'p-3 min-w-[48px] min-h-[48px]'
                }`}
              >
                {isMuted ? (
                  <VolumeX size={isMobile ? 24 : 20} />
                ) : (
                  <Volume2 size={isMobile ? 24 : 20} />
                )}
              </button>
              {!isMobile && (
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

          {/* Progress Section - Larger on mobile */}
          <div className="mb-6 space-y-3">
            <div className="flex items-center justify-between text-gray-300">
              <span className={`font-mono ${isMobile ? 'text-sm' : 'text-xs md:text-sm'}`}>
                {formatTime(currentTime)}
              </span>
              <span className={`font-mono ${isMobile ? 'text-sm' : 'text-xs md:text-sm'}`}>
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
                  isMobile ? 'h-4' : 'h-3'
                }`}
                style={{
                  background: `linear-gradient(to right, #f97316 0%, #f97316 ${(currentTime / (duration || 1)) * 100}%, #374151 ${(currentTime / (duration || 1)) * 100}%, #374151 100%)`
                }}
              />
            </div>
          </div>

          {/* Action Buttons - Larger and full width on mobile */}
          <div className="flex flex-col gap-3 pt-4 border-t border-gray-700">
            <button
              onClick={handleDownload}
              className={`inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors justify-center ${
                isMobile ? 'w-full px-6 py-4 text-lg' : 'px-4 py-2'
              }`}
            >
              <Download size={isMobile ? 24 : 18} />
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
                isMobile ? 'w-full px-6 py-4 text-lg' : 'px-4 py-2'
              }`}
            >
              <Share2 size={isMobile ? 24 : 18} />
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}