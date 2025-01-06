'use client'

import React, { createContext, useState, useContext, ReactNode } from 'react'

type MessageType = 'success' | 'error' | 'info'

interface Message {
  type: MessageType
  content: string
}

interface MessageContextType {
  message: Message | null
  setMessage: (message: Message | null) => void
}

const MessageContext = createContext<MessageContextType | undefined>(undefined)

export const MessageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [message, setMessage] = useState<Message | null>(null)

  return (
    <MessageContext.Provider value={{ message, setMessage }}>
      {children}
    </MessageContext.Provider>
  )
}

export const useMessage = () => {
  const context = useContext(MessageContext)
  if (context === undefined) {
    throw new Error('useMessage must be used within a MessageProvider')
  }
  return context
}

