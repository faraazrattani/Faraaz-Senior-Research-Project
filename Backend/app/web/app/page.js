'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-card">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            MarketMind
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Predict stock movements around earnings week using machine learning.
            Backtest strategies, analyze patterns, and explore explainable AI results.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              const q = searchQuery.trim().toUpperCase()
              if (!q) return
              window.location.href = `/app/ticker/${q}`
            }}
            className="max-w-2xl mx-auto flex gap-2"
          >
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60">🔎</span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search a ticker... (e.g., AAPL)"
                className="pl-9 bg-background border border-border rounded-md h-10 w-full"
              />
            </div>
            <button type="submit" className="px-4 rounded-md bg-primary text-primary-foreground">
              Analyze
            </button>
          </form>
        </div>
      </section>

      {/* Links */}
      <section className="container mx-auto px-4 pb-20">
        <div className="flex gap-4 justify-center">
          <Link href="/public/landing.html" className="underline">Landing</Link>
          <Link href="/public/about.html" className="underline">About</Link>
          <Link href="/public/methods_static.html" className="underline">Methods</Link>
        </div>
      </section>
    </main>
  )
}
