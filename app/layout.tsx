import '../styles/globals.css'
import { ReactNode } from 'react'
import Layout from '@/components/Layout'
import { MessageProvider } from '@/context/MessageContext'
import { MessageDisplay } from '@/components/MessageDisplay'

export const metadata = {
  title: 'Music Band Website',
  description: 'A website for our music band',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MessageProvider>
          <Layout>{children}</Layout>
          <MessageDisplay />
        </MessageProvider>
      </body>
    </html>
  )
}

