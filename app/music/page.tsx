'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useMessage } from '@/context/MessageContext'
import AudioPlayer from '@/components/AudioPlayer'

type Track = {
  id: number
  title: string
  album: string
  artist: string
  price: string
  is_free: number
  file_path: string
  cover_image: string
  created_at: string
  updated_at: string
}

export default function Music() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [filter, setFilter] = useState<'all' | 'free' | 'paid'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const { setMessage } = useMessage()
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('http://127.0.0.1:8000/api/music-tracks')
        if (!response.ok) {
          throw new Error('Failed to fetch tracks')
        }
        const data = await response.json()
        setTracks(data)
        setMessage({
          type: 'success',
          content: 'Music tracks loaded successfully.',
        })
      } catch (err) {
        console.error('Error fetching tracks:', err)
        setMessage({
          type: 'error',
          content: 'An error occurred while fetching tracks. Please try again later.'
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTracks()
  }, [setMessage])

  const filteredTracks = tracks.filter(track => {
    if (filter === 'free') return track.is_free === 1
    if (filter === 'paid') return track.is_free === 0
    return true
  })

  const handlePlay = (track: Track) => {
    setCurrentTrack(track);
  }

  const handleDownload = (track: Track) => {
    // Implement download logic here
    console.log(`Downloading ${track.title}`)
  }

  const handlePurchase = (track: Track) => {
    // Implement purchase logic here
    console.log(`Purchasing ${track.title}`)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-semibold text-gray-800 dark:text-white text-shadow">Music</h1>

      <div className="mt-8 mb-6 flex justify-center space-x-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
        >
          All Tracks
        </button>
        <button
          onClick={() => setFilter('free')}
          className={`px-4 py-2 rounded-full ${filter === 'free' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
        >
          Free Tracks
        </button>
        <button
          onClick={() => setFilter('paid')}
          className={`px-4 py-2 rounded-full ${filter === 'paid' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
        >
          Paid Tracks
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
        {filteredTracks.map((track, index) => (
          <motion.div
            key={track.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden card-hover"
          >
            <img 
              src={`http://127.0.0.1:8000/storage/public/uploads/images/${track.cover_image}`} 
              alt={track.title} 
              className="w-full h-48 object-cover" 
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{track.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{track.artist}</p>
              <p className="text-gray-500 dark:text-gray-400">{track.album}</p>
              <button
                onClick={() => handlePlay(track)}
                className="mt-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300 mr-2"
              >
                Play
              </button>
              {track.is_free === 1 ? (
                <button
                  onClick={() => handleDownload(track)}
                  className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
                >
                  Download
                </button>
              ) : (
                <button
                  onClick={() => handlePurchase(track)}
                  className="mt-2 bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
                >
                  Purchase (${parseFloat(track.price).toFixed(2)})
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {currentTrack && (
        <AudioPlayer
          src={`http://127.0.0.1:8000/storage/public/uploads/music/${currentTrack.file_path}`}
          title={currentTrack.title}
          artist={currentTrack.artist}
        />
      )}
    </motion.div>
  )
}

