'use client'
import { useState, useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { HomeIcon, MusicalNoteIcon, CalendarIcon, UserIcon, MoonIcon, SunIcon, CogIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'

type LayoutProps = {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [darkMode, setDarkMode] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('authToken')
      setIsLoggedIn(!!token)
      if (token) {
        try {
          const response = await fetch('http://127.0.0.1:8000/api/user', {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const userData = await response.json();
            setUserRole(userData.role);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUserRole(null);
      }
    }

    checkAuthStatus()
    window.addEventListener('storage', checkAuthStatus)

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('storage', checkAuthStatus)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  const navItems = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Music', href: '/music', icon: MusicalNoteIcon },
    { name: 'Events', href: '/events', icon: CalendarIcon },
  ]

  // Add Profile link only if user is logged in
  const fullNavItems = isLoggedIn
    ? [
        ...navItems,
        { name: 'Profile', href: '/profile', icon: UserIcon },
        ...(userRole === 'admin' ? [{ name: 'Admin', href: '/admin', icon: CogIcon }] : [])
      ]
    : navItems

  const authItems = isLoggedIn
    ? [{ name: 'Logout', href: '#', icon: UserIcon }]
    : [
        { name: 'Login', href: '/login', icon: UserIcon },
        { name: 'Signup', href: '/signup', icon: UserIcon },
      ]

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    setIsLoggedIn(false)
    router.push('/')
  }

  const Sidebar = () => (
    <motion.div
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5 }}
      className="w-64 h-full bg-white dark:bg-gray-900 overflow-y-auto"
    >
      <div className="flex items-center justify-center mt-8">
        <span className="text-2xl font-semibold text-gray-800 dark:text-white">Peters Music Site</span>
      </div>
      <nav className="mt-10">
        {[...fullNavItems, ...authItems].map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {item.name === 'Logout' ? (
              <button
                onClick={handleLogout}
                className="flex items-center mt-4 py-2 px-6 w-full cursor-pointer text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:bg-opacity-25 hover:text-gray-900 dark:hover:text-white"
              >
                <item.icon className="h-6 w-6" />
                <span className="mx-4">{item.name}</span>
              </button>
            ) : (
              <Link href={item.href}>
                <span
                  className={`flex items-center mt-4 py-2 px-6 cursor-pointer ${
                    pathname === item.href
                      ? 'bg-gray-200 dark:bg-gray-700 bg-opacity-25 text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:bg-opacity-25 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <item.icon className="h-6 w-6" />
                  <span className="mx-4">{item.name}</span>
                </span>
              </Link>
            )}
          </motion.div>
        ))}
      </nav>
      <div className="absolute bottom-0 my-10">
        <button
          className="flex items-center py-2 px-8 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          onClick={toggleDarkMode}
        >
          {darkMode ? <SunIcon className="h-6 w-6 mr-2" /> : <MoonIcon className="h-6 w-6 mr-2" />}
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
    </motion.div>
  )

  return (
    <div className={`flex h-screen bg-gray-100 ${darkMode ? 'dark' : ''}`}>
      {!isMobile && <Sidebar />}
      {isMobile && mobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black opacity-50" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-900">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <X className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  {isMobile && (
                    <button
                      onClick={() => setMobileMenuOpen(true)}
                      className="text-gray-500 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                    >
                      <Menu className="h-6 w-6" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}