'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from "next/navigation";
import { useMessage } from "@/context/MessageContext";

type User = {
  name: string
  email: string
  role: string
  created_at: string
  updated_at: string
}

type Purchase = {
  id: number
  item_type: string
  item_id: number
  quantity: number
  total_price: string
  created_at: string
  updated_at: string
  item: any // This could be more specifically typed if the item structure is known
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null)
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter();
  const { setMessage } = useMessage();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [userResponse, purchasesResponse] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/user', {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          }),
          fetch('http://127.0.0.1:8000/api/purchases', {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          })
        ]);

        if (!userResponse.ok || !purchasesResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const userData = await userResponse.json();
        const purchasesData = await purchasesResponse.json();

        setUser(userData);
        setPurchases(purchasesData.Purchases || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setMessage({
          type: 'error',
          content: 'Failed to load profile data. Please try again later.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router, setMessage]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-xl text-gray-600 dark:text-gray-300">Failed to load profile data. Please try again later.</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <h1 className="text-4xl font-semibold text-gray-800 dark:text-white">Profile</h1>

      <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">User Information</h2>
          <p className="text-gray-600 dark:text-gray-300">Name: {user.name}</p>
          <p className="text-gray-600 dark:text-gray-300">Email: {user.email}</p>
          <p className="text-gray-600 dark:text-gray-300">Role: {user.role}</p>
          <p className="text-gray-600 dark:text-gray-300">Joined: {new Date(user.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Purchase History</h2>
        {purchases.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">No purchases found.</p>
        ) : (
          <div className="space-y-4">
            {purchases.map((purchase) => (
              <div key={purchase.id} className="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Purchase #{purchase.id}</h3>
                  <p className="text-gray-600 dark:text-gray-300">Date: {new Date(purchase.created_at).toLocaleDateString()}</p>
                  <p className="text-gray-600 dark:text-gray-300">Item Type: {purchase.item_type.split('\\').pop()}</p>
                  <p className="text-gray-600 dark:text-gray-300">Quantity: {purchase.quantity}</p>
                  <p className="text-gray-600 dark:text-gray-300">Total Price: ${parseFloat(purchase.total_price).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

