'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav className={`flex items-center space-x-1 text-sm text-gray-600 ${className}`} aria-label="Breadcrumb">
      <Link
        href="/"
        className="flex items-center hover:text-gray-900 transition-colors duration-200"
      >
        <Home className="w-4 h-4" />
        <span className="sr-only">Главная</span>
      </Link>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          
          {item.href ? (
            <Link
              href={item.href}
              className="flex items-center hover:text-gray-900 transition-colors duration-200"
            >
              {item.icon && <item.icon className="w-4 h-4 mr-1" />}
              <span>{item.label}</span>
            </Link>
          ) : (
            <span className="flex items-center text-gray-900 font-medium">
              {item.icon && <item.icon className="w-4 h-4 mr-1" />}
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}