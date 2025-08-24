'use client'

import React from 'react'

export function SkipLinks() {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <a
        href="#main-content"
        className="
          absolute top-0 left-0 z-50 p-4 bg-blue-600 text-white font-medium
          transform -translate-y-full focus:translate-y-0 transition-transform duration-200
          focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600
        "
      >
        Перейти к основному содержимому
      </a>
      <a
        href="#navigation"
        className="
          absolute top-0 left-32 z-50 p-4 bg-blue-600 text-white font-medium
          transform -translate-y-full focus:translate-y-0 transition-transform duration-200
          focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600
        "
      >
        Перейти к навигации
      </a>
    </div>
  )
}