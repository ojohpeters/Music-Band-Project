'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useMessage } from '@/context/MessageContext'
import AudioPlayer from '@/components/AudioPlayer'

type Track = {
  id: number
  title: string
  artist: string
  album: string
  price: string
  is_free: number
  file_path: string
  cover_image: string
  created_at: string
  updated_at: string
}

type Event = {
  id: number
  name: string
  date: string
  location: string
  price: string
  cover_image: string
  created_at: string
  updated_at: string
}

export default function Home() {
  const [featuredTracks, setFeaturedTracks] = useState<Track[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { setMessage } = useMessage()
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [tracksResponse, eventsResponse] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/music-tracks'),
          fetch('http://127.0.0.1:8000/api/events'),
        ]);
  
        if (tracksResponse.ok) {
          const tracksData = await tracksResponse.json();
          setFeaturedTracks(tracksData);
        } else {
          console.error('Error fetching tracks:', tracksResponse.statusText);
          setMessage({
            type: 'error',
            content: 'Failed to load tracks data.',
          });
        }
  
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          setUpcomingEvents(eventsData.Events);
        } else {
          console.error('Error fetching events:', eventsResponse.statusText);
          setMessage({
            type: 'error',
            content: 'Failed to load events data.',
          });
        }
  
        setMessage({
          type: 'success',
          content: 'Data loaded successfully.',
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        setMessage({
          type: 'error',
          content: 'An unexpected error occurred. Please try again later.',
        });
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, [setMessage]);

  const handlePlay = (track: Track) => {
    setCurrentTrack(track);
  };

  const Spinner = () => (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-semibold text-gray-800 dark:text-white text-shadow">Welcome to Music Band</h1>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Featured Tracks</h2>

        {featuredTracks.length === 0 ? (
          <p className="text-xl text-center text-gray-500 dark:text-gray-300">No tracks available at the moment...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {featuredTracks.map((track, index) => (
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
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    {track.is_free ? 'Free' : `$${parseFloat(track.price).toFixed(2)}`}
                  </p>
                  <button
                    onClick={() => handlePlay(track)}
                    className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
                  >
                    Play
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Upcoming Events</h2>

        {upcomingEvents.length === 0 ? (
          <p className="text-xl text-center text-gray-500 dark:text-gray-300">No events at the moment...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {upcomingEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden card-hover"
              >
                <img 
                  src={`http://127.0.0.1:8000/storage/public/uploads/images/${event.cover_image}`} 
                  alt={event.name} 
                  className="w-full h-48 object-cover" 
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{event.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{new Date(event.date).toLocaleDateString()}</p>
                  <p className="text-gray-500 dark:text-gray-400">{event.location}</p>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">${parseFloat(event.price).toFixed(2)}</p>
                  <Link href={`/events/${event.id}`}>
                    <span className="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded cursor-pointer transition-colors duration-300">
                      View Details
                    </span>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      {currentTrack && (
  <AudioPlayer
    src={`http://127.0.0.1:8000/storage/public/uploads/music/${currentTrack.file_path}`}
    title={currentTrack.title}
    artist={currentTrack.artist}
    onClose={() => setCurrentTrack(null)}
  />
)}
    </motion.div>
  )
}

