import { NextResponse } from 'next/server'

type Track = {
  id: number
  title: string
  artist: string
  album: string
  coverUrl: string
  price: number | null
}

const tracks: Track[] = [
  { id: 1, title: "Neon Lights", artist: "The Glowing Embers", album: "City Nights", coverUrl: "https://picsum.photos/536/354", price: null },
  { id: 2, title: "Midnight Drive", artist: "Lunar Eclipse", album: "Stargazer", coverUrl: "https://picsum.photos/536/354", price: 0.99 },
  { id: 3, title: "Electric Dreams", artist: "Synth Waves", album: "Retro Future", coverUrl: "https://picsum.photos/536/354", price: null },
  { id: 4, title: "Cosmic Dance", artist: "Stardust Collective", album: "Galactic Grooves", coverUrl: "https://source.unsplash.com/random/800x800?space,dance", price: 1.99 },
  { id: 5, title: "Urban Jungle", artist: "Concrete Beats", album: "City Rhythms", coverUrl: "https://source.unsplash.com/random/800x800?urban,music", price: null },
  { id: 6, title: "Sunset Serenade", artist: "Ocean Breeze", album: "Coastal Vibes", coverUrl: "https://source.unsplash.com/random/800x800?sunset,beach", price: 1.49 },
]

export async function GET() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return NextResponse.json(tracks)
}

