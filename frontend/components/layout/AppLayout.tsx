'use client'

import React from 'react'
import { Navigation } from './Navigation'
import { QuickActionsFAB } from './QuickActionsFAB'

interface AppLayoutProps {
  children: React.ReactNode
  className?: string
}

export function AppLayout({ children, className = '' }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <header role="banner">
        <Navigation />
      </header>
      
      <main 
        id="main-content"
        role="main"
        tabIndex={-1}
        className={`pb-20 lg:pb-8 focus:outline-none ${className}`}
        aria-label="Основное содержимое"
      >
        {children}
      </main>
      
      <QuickActionsFAB />
      
      {/* Footer for screen readers */}
      <footer role="contentinfo" className="sr-only">
        <p>Банк Желаний - Система управления желаниями с трехуровневой валютой</p>
      </footer>
    </div>
  )
}