"use client";
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

type Event = {
  id: number
  name: string
  date: string
  location: string
  description: string
  price: number
  imageUrl: string
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([])

  useEffect(() => {
    // Fetch events from API
    // For now, we'll use mock data
    setEvents([
      {
        id: 1,
        name: 'Summer Fest',
        date: '2023-07-15',
        location: 'Central Park, New York',
        description: 'Join us for a night of amazing music under the stars!',
        price: 49.99,
        imageUrl: 'https://source.unsplash.com/random/800x600?concert,summer'
      },
      {
        id: 2,
        name: 'Acoustic Night',
        date: '2023-08-01',
        location: 'The Blue Note, Chicago',
        description: 'An intimate evening of acoustic performances.',
        price: 29.99,
        imageUrl: 'https://source.unsplash.com/random/800x600?acoustic,guitar'
      },
      {
        id: 3,
        name: 'Electronica',
        date: '2023-08-15',
        location: 'Warehouse 23, Los Angeles',
        description: 'Experience the future of music with cutting-edge electronic performances.',
        price: 39.99,
        imageUrl: 'https://source.unsplash.com/random/800x600?electronic,party'
      },
    ])
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-semibold text-gray-800 dark:text-white text-shadow">Upcoming Events</h1>

      <div className="mt-8 grid gap-6">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden card-hover"
          >
            <div className="md:flex">
              <div className="md:flex-shrink-0">
                <img className="h-48 w-full object-cover md:w-48" src={event.imageUrl} alt={event.name} />
              </div>
              <div className="p-8">
                <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">{event.date}</div>
                <h2 className="block mt-1 text-lg leading-tight font-medium text-black dark:text-white">{event.name}</h2>
                <p className="mt-2 text-gray-500 dark:text-gray-300">{event.location}</p>
                <p className="mt-2 text-gray-500 dark:text-gray-300">{event.description}</p>
                <div className="mt-4">
                  <span className="text-gray-600 dark:text-gray-400 font-bold">${event.price.toFixed(2)}</span>
                  <Link href={`/events/${event.id}`}>
                    <span className="ml-4 inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded cursor-pointer transition-colors duration-300">
                      View Details
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

