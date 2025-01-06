'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from "next/navigation";

type User = {
  id: number
  name: string
  email: string
}

type Order = {
  id: number
  date: string
  total: number
  items: string[]
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      // If the user is logged in, redirect them to the homepage or another page
      router.push("/"); // Redirect to home page or profile page
    }
  }, []);
  useEffect(() => {
    // Fetch user data and order history from API
    // For now, we'll use mock data
    setUser({
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
    })

    setOrders([
      {
        id: 1,
        date: '2023-05-15',
        total: 29.99,
        items: ['Song 1', 'Song 2'],
      },
      {
        id: 2,
        date: '2023-06-01',
        total: 49.99,
        items: ['Concert Ticket'],
      },
    ])
  }, [])

  if (!user) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-xl text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-semibold text-gray-800 dark:text-white">Profile</h1>

      <div className="mt-8 bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">User Information</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Name: {user.name}</p>
          <p className="text-gray-600 dark:text-gray-300">Email: {user.email}</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Order History</h2>
        <div className="mt-4 space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Order #{order.id}</h3>
                <p className="text-gray-600 dark:text-gray-300 mt-2">Date: {order.date}</p>
                <p className="text-gray-600 dark:text-gray-300">Total: ${order.total.toFixed(2)}</p>
                <div className="mt-4">
                  <h4 className="text-md font-semibold text-gray-700 dark:text-gray-200">Items:</h4>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
                    {order.items.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

