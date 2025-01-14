'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useMessage } from '@/context/MessageContext'

type PurchaseItem = {
  id: number
  name: string
  price: string
  type: 'music-track' | 'event'
}

export default function Purchase() {
  const [item, setItem] = useState<PurchaseItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({})
  const { setMessage } = useMessage()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const fetchItemDetails = async () => {
      const itemId = searchParams.get('id')
      const itemType = searchParams.get('type')
      if (!itemId || !itemType) {
        setMessage({ type: 'error', content: 'Invalid purchase parameters' })
        router.push('/')
        return
      }

      try {
        setIsLoading(true)
        const response = await fetch(`http://127.0.0.1:8000/api/${itemType}s/${itemId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch item details')
        }
        const data = await response.json()
        setItem({
          id: data.id,
          name: data.name || data.title,
          price: data.price,
          type: itemType as 'music-track' | 'event'
        })
      } catch (error) {
        console.error('Error fetching item details:', error)
        setMessage({ type: 'error', content: 'Failed to load item details' })
      } finally {
        setIsLoading(false)
      }
    }

    fetchItemDetails()
  }, [searchParams, setMessage, router])

  const formatExpiryDate = (input: string) => {
    const cleanedInput = input.replace(/\D/g, '').slice(0, 4)
    if (cleanedInput.length > 2) {
      return `${cleanedInput.slice(0, 2)}/${cleanedInput.slice(2)}`
    }
    return cleanedInput
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!item) return

    setErrors({}) // Clear previous errors

    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        setMessage({ type: 'error', content: 'You must be logged in to make a purchase' })
        router.push('/login')
        return
      }

      const response = await fetch('http://127.0.0.1:8000/api/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          item_type: item.type === 'music-track' ? 'App\\Models\\MusicTrack' : 'App\\Models\\Event',
          item_id: item.id,
          quantity: quantity,
          total_price: (parseFloat(item.price) * quantity).toFixed(2),
          card_number: cardNumber,
          expiry_date: expiryDate,
          cvv: cvv
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', content: 'Purchase successful!' })
        router.push('/profile')
      } else {
        if (data.error === 'Validation failed' && data.messages) {
          setErrors(data.messages)
        } else {
          setMessage({ type: 'error', content: data.message || 'Purchase failed' })
        }
      }
    } catch (error) {
      console.error('Error processing purchase:', error)
      setMessage({ type: 'error', content: 'An error occurred while processing your purchase' })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-600 dark:text-gray-300">Item not found.</p>
      </div>
    )
  }

  const totalPrice = parseFloat(item.price) * quantity

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-4xl font-semibold text-gray-800 dark:text-white mb-6">Purchase {item.name}</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              min="1"
              required
            />
          </div>
          <div>
            <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Card Number
            </label>
            <input
              type="text"
              id="cardNumber"
              value={cardNumber}
              onChange={(e) => {
                setCardNumber(e.target.value)
                setErrors(prev => ({ ...prev, card_number: [] }))
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
            {errors.card_number && errors.card_number.map((error, index) => (
              <p key={index} className="mt-1 text-sm text-red-600">{error}</p>
            ))}
          </div>
          <div>
            <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Expiry Date (MM/YY)
            </label>
            <input
              type="text"
              id="expiryDate"
              value={expiryDate}
              onChange={(e) => {
                const formattedDate = formatExpiryDate(e.target.value)
                setExpiryDate(formattedDate)
                setErrors(prev => ({ ...prev, expiry_date: [] }))
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="MM/YY"
              maxLength={5}
              required
            />
            {errors.expiry_date && errors.expiry_date.map((error, index) => (
              <p key={index} className="mt-1 text-sm text-red-600">{error}</p>
            ))}
          </div>
          <div>
            <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              CVV
            </label>
            <input
              type="text"
              id="cvv"
              value={cvv}
              onChange={(e) => {
                setCvv(e.target.value)
                setErrors(prev => ({ ...prev, cvv: [] }))
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
            {errors.cvv && errors.cvv.map((error, index) => (
              <p key={index} className="mt-1 text-sm text-red-600">{error}</p>
            ))}
          </div>
          <div className="text-xl font-semibold text-gray-800 dark:text-white">
            Total: ${totalPrice.toFixed(2)}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
          >
            Complete Purchase
          </button>
        </form>
      </div>
    </motion.div>
  )
}

