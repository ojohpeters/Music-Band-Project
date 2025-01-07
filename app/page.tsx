'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useMessage } from '@/context/MessageContext'

type Track = {
  id: number
  title: string
  artist: string
  album: string
  file_path: string
}

type Event = {
  id: number
  name: string
  date: string
  location: string
  imageUrl: string
}

export default function Home() {
  const [featuredTracks, setFeaturedTracks] = useState<Track[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { setMessage } = useMessage()

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Simulating API calls
        const [tracksResponse, eventsResponse] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/music-tracks'),
          fetch('http://127.0.0.1:8000/api/events'),
        ]);
  
        let tracksData = null;
        let eventsData = null;
  
        if (tracksResponse.ok) {
          tracksData = await tracksResponse.json();
          setFeaturedTracks(tracksData);
        } else {
          console.error('Error fetching tracks:', tracksResponse.statusText);
          setMessage((prev) => ({
            ...prev,
            type: 'error',
            content: 'Failed to load tracks data.',
          }));
        }
  
        if (eventsResponse.ok) {
          eventsData = await eventsResponse.json();
          setUpcomingEvents(eventsData);
        } else {
          console.error('Error fetching events:', eventsResponse.statusText);
          setMessage((prev) => ({
            ...prev,
            type: 'error',
            content: 'Failed to load events data.',
          }));
        }
  
        if (tracksData && eventsData) {
          setMessage({
            type: 'success',
            content: 'Data loaded successfully.',
          });
        }
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

        {/* Check if featuredTracks is empty */}
        {featuredTracks.length === 0 || featuredTracks[0] == null ? (
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
                <img src={track.file_path} alt={track.title} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{track.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{track.artist}</p>
                  <p className="text-gray-500 dark:text-gray-400">{track.album}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Upcoming Events</h2>

        {/* Check if upcomingEvents is empty or if the first event's data is empty */}
        {upcomingEvents.length === 0 || !upcomingEvents[0] ? (
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
                <img src={event.imageUrl} alt={event.name} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{event.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{event.date}</p>
                  <p className="text-gray-500 dark:text-gray-400">{event.location}</p>
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
    </motion.div>
  )
}

