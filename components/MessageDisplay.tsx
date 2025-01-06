'use client'

import React, { useEffect } from 'react'
import { useMessage } from '../context/MessageContext'

export const MessageDisplay: React.FC = () => {
  const { message, setMessage } = useMessage()

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [message, setMessage])

  if (!message) return null

  const bgColor = message.type === 'success' ? 'bg-green-500' : message.type === 'error' ? 'bg-red-500' : 'bg-blue-500'

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white p-4 rounded shadow-lg z-50`}>
      {message.content}
    </div>
  )
}

