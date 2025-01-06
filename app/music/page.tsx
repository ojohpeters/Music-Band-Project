'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

type Track = {
  id: number
  title: string
  album: string
  artist: string
  price: string
  is_free: number
  created_at: string
  updated_at: string
  file_path: string
}


export default function Music() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [filter, setFilter] = useState<'all' | 'free' | 'paid'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        setError(null)
      } catch (err) {
        setError('An error occurred while fetching tracks. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTracks()
  }, [])

  const filteredTracks = tracks.filter(track => {
    if (filter === 'free') return track.is_free === 1
    if (filter === 'paid') return track.is_free === 0
    return true
  })

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

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 text-xl">{error}</p>
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
  src={track.file_path} 
  alt={track.title} 
  className="w-full h-48 object-cover" 
/>

            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{track.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{track.artist}</p>
              <p className="text-gray-500 dark:text-gray-400">{track.album}</p>
              {track.is_free === 1 ? (
                <button
                  onClick={() => handleDownload(track)}
                  className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
                >
                  Download
                </button>
              ) : (
                <button
                  onClick={() => handlePurchase(track)}
                  className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
                >
                  Purchase (${track.price})
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

