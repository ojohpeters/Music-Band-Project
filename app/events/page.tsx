'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useMessage } from '@/context/MessageContext'

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

export default function Events() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { setMessage } = useMessage()

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('http://127.0.0.1:8000/api/events')
        if (!response.ok) {
          throw new Error('Failed to fetch events')
        }
        const data = await response.json()
        setEvents(data.Events)
        setMessage({
          type: 'success',
          content: 'Events loaded successfully.',
        })
      } catch (err) {
        console.error('Error fetching events:', err)
        setMessage({
          type: 'error',
          content: 'An error occurred while fetching events. Please try again later.'
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [setMessage])

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
      <h1 className="text-4xl font-semibold text-gray-800 dark:text-white text-shadow mb-8">Upcoming Events</h1>

      {events.length === 0 ? (
        <p className="text-xl text-center text-gray-600 dark:text-gray-300">No events scheduled at the moment.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden card-hover"
            >
              {/* <img src={event.cover_image} alt={event.name} className="w-full h-48 object-cover" /> */}
              <img 
              src={`http://127.0.0.1:8000/storage/public/uploads/images/${event.cover_image}`} 
              alt={event.name} 
              className="w-full h-48 object-cover" 
            />
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{event.name}</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  <span className="font-semibold">Date:</span> {new Date(event.date).toLocaleDateString()}
                </p>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  <span className="font-semibold">Location:</span> {event.location}
                </p>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  <span className="font-semibold">Price:</span> ${parseFloat(event.price).toFixed(2)}
                </p>
                <Link href={`/events/${event.id}`}>
                  <span className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300">
                    View Details
                  </span>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

