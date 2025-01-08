'use client'

import { useState, useEffect, useRef } from 'react'

interface AudioPlayerProps {
  src: string
  title: string
  artist: string
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, title, artist }) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedData = () => {
      setDuration(audio.duration || 0)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    audio.addEventListener('loadeddata', handleLoadedData)
    audio.addEventListener('timeupdate', handleTimeUpdate)

    return () => {
      audio.removeEventListener('loadeddata', handleLoadedData)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
    }
  }, [])

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleCancel = () => {
    setIsVisible(false) // Hide the player
    setIsPlaying(false) // Reset the playing state
    if (audioRef.current) {
      audioRef.current.pause() // Pause the audio
      audioRef.current.currentTime = 0 // Reset to the start of the audio
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 p-4 shadow-lg z-50">
      <audio ref={audioRef} src={src} />
      <div className="flex items-center justify-between space-x-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{artist}</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <input
            type="range"
            min={0}
            max={duration || 1}
            value={currentTime}
            onChange={handleTimeChange}
            className="w-64"
            aria-label="Audio progress"
          />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <button
            onClick={handleCancel}
            aria-label="Close audio player"
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default AudioPlayer
