'use client'

import { useRef, useEffect, useState } from 'react'
import { Play, Pause, Volume2, VolumeX, RotateCcw } from 'lucide-react'

interface VideoPlayerProps {
  src: string
  title: string
  duration: number
  autoPlay?: boolean
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
}

export default function VideoPlayer({
  src,
  title,
  duration,
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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedData = () => {
      setIsLoaded(true)
      if (autoPlay) {
        video.play().catch(console.error)
      }
    }

    const handlePlay = () => {
      setIsPlaying(true)
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

    // Set initial volume
    video.volume = volume

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
  }, [autoPlay, onPlay, onPause, onEnded, volume])

  const togglePlay = async () => {
    if (!videoRef.current) return

    try {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        await videoRef.current.play()
      }
    } catch (error) {
      setError('Failed to play video')
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return

    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
    if (newVolume > 0) {
      setIsMuted(false)
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
      <div className="p-8 text-center text-red-500">
        <p className="mb-2 text-lg">Video Error</p>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto overflow-hidden bg-black rounded-lg shadow-lg">
      <div className="relative">
        <video
          ref={videoRef}
          src={src}
          className="w-full h-auto"
          muted={isMuted}
        />
        
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center text-white">
              <div className="w-8 h-8 mx-auto mb-2 border-2 border-white rounded-full animate-spin border-t-transparent" />
              <div>Loading video...</div>
            </div>
          </div>
        )}

        {/* Overlay Play Button for better UX */}
        {isLoaded && !isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
            <button
              onClick={togglePlay}
              className="flex items-center justify-center w-20 h-20 text-white transition-all bg-black bg-opacity-50 rounded-full hover:bg-opacity-70"
            >
              <Play size={32} className="ml-1" />
            </button>
          </div>
        )}
      </div>

      <div className="p-4 text-white bg-gray-900">
        <h3 className="mb-4 text-lg font-semibold text-center">{title}</h3>
        
        <div className="flex items-center justify-center mb-4 space-x-4">
          <button
            onClick={togglePlay}
            disabled={!isLoaded}
            className="p-3 transition-colors bg-orange-500 rounded-full hover:bg-orange-600 disabled:opacity-50"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>

          <button
            onClick={restart}
            className="p-3 text-gray-300 transition-colors hover:text-white"
            title="Restart"
          >
            <RotateCcw size={20} />
          </button>

          <div className="flex items-center space-x-2">
            <button 
              onClick={toggleMute}
              className="text-gray-300 transition-colors hover:text-white"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 accent-orange-500"
            />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-300">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration || 0)}</span>
          </div>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
        </div>
      </div>
    </div>
  )
}