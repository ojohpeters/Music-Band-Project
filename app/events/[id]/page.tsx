'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useMessage } from '@/context/MessageContext'
import Link from 'next/link'

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

export default function EventDetails() {
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { setMessage } = useMessage()
  const params = useParams()
  const eventId = params.id

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`http://127.0.0.1:8000/api/events/${eventId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch event details')
        }
        const data = await response.json()
        setEvent(data)
        setMessage({
          type: 'success',
          content: 'Event details loaded successfully.',
        })
      } catch (err) {
        console.error('Error fetching event details:', err)
        setMessage({
          type: 'error',
          content: 'An error occurred while fetching event details. Please try again later.'
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (eventId) {
      fetchEventDetails()
    }
  }, [eventId, setMessage])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-600 dark:text-gray-300">Event not found.</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-4xl font-semibold text-gray-800 dark:text-white mb-6">{event.name}</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <img 
          src={`http://127.0.0.1:8000/storage/public/uploads/images/${event.cover_image}`} 
          alt={event.name} 
          className="w-full h-64 object-cover"
        />
        <div className="p-6">
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
            <span className="font-semibold">Date:</span> {new Date(event.date).toLocaleDateString()}
          </p>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
            <span className="font-semibold">Location:</span> {event.location}
          </p>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
            <span className="font-semibold">Price:</span> ${parseFloat(event.price).toFixed(2)}
          </p>
          <Link href={`/purchase?id=${event.id}&type=event`}>
            <span className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300">
              Purchase Tickets
            </span>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

