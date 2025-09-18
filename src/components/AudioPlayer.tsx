'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, RotateCcw } from 'lucide-react'

interface AudioPlayerProps {
  src: string
  title: string
  duration: number
  autoPlay?: boolean
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
}

export default function AudioPlayer({
  src,
  title,
  duration,
  autoPlay = false,
  onPlay,
  onPause,
  onEnded
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleLoadedData = () => setIsLoading(false)
    const handleError = () => {
      setError('Failed to load audio file')
      setIsLoading(false)
    }
    const handleEnded = () => {
      setIsPlaying(false)
      onEnded?.()
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadeddata', handleLoadedData)
    audio.addEventListener('error', handleError)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadeddata', handleLoadedData)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [onEnded])

  useEffect(() => {
    if (autoPlay && audioRef.current && !isLoading) {
      const playPromise = audioRef.current.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true)
            onPlay?.()
          })
          .catch(() => {
            console.log('Auto-play prevented by browser')
          })
      }
    }
  }, [autoPlay, isLoading, onPlay])

  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio) return

    try {
      if (isPlaying) {
        audio.pause()
        setIsPlaying(false)
        onPause?.()
      } else {
        await audio.play()
        setIsPlaying(true)
        onPlay?.()
      }
    } catch (error) {
      setError('Failed to play audio')
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const newTime = parseFloat(e.target.value)
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
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

  const restart = () => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = 0
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
        <p className="mb-2 text-lg">Audio Error</p>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl p-6 mx-auto bg-white shadow-lg rounded-xl">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        className="hidden"
      />

      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="mb-2 text-2xl font-bold text-gray-800">
          {title}
        </h1>
        <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-amber-400 to-orange-500">
          <div className="flex items-center justify-center w-12 h-12 bg-white rounded-full bg-opacity-20">
            <Volume2 size={20} className="text-white" />
          </div>
        </div>
      </div>

      {/* Main Play Button */}
      <div className="mb-8 text-center">
        <button
          onClick={togglePlay}
          disabled={isLoading}
          className="flex items-center justify-center w-20 h-20 text-white transition-all duration-200 rounded-full shadow-lg bg-gradient-to-r from-amber-400 to-orange-500 hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-8 h-8 border-2 border-white rounded-full animate-spin border-t-transparent" />
          ) : isPlaying ? (
            <Pause size={32} />
          ) : (
            <Play size={32} className="ml-1" />
          )}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2 text-sm text-gray-600">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-6">
        <button
          onClick={restart}
          className="p-3 text-gray-600 transition-colors duration-200 hover:text-orange-500"
          title="Restart"
        >
          <RotateCcw size={20} />
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMute}
            className="text-gray-600 transition-colors duration-200 hover:text-orange-500"
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
            className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
        </div>
      </div>
    </div>
  )
}