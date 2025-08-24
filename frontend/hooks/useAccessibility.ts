'use client'

import { useEffect, useCallback, useRef } from 'react'

// Hook for managing focus trap in modals
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleTabKey)
    firstElement?.focus()

    return () => {
      document.removeEventListener('keydown', handleTabKey)
    }
  }, [isActive])

  return containerRef
}

// Hook for managing screen reader announcements
export function useScreenReader() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message

    document.body.appendChild(announcement)

    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }, [])

  return { announce }
}

// Hook for managing reduced motion preferences
export function useReducedMotion() {
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

  return prefersReducedMotion
}

// Hook for managing high contrast preferences
export function useHighContrast() {
  const prefersHighContrast = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-contrast: high)').matches
    : false

  return prefersHighContrast
}

// Hook for managing color scheme preferences
export function useColorScheme() {
  const prefersDark = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : false

  return prefersDark ? 'dark' : 'light'
}

// Hook for skip links
export function useSkipLinks() {
  const skipToContent = useCallback(() => {
    const mainContent = document.querySelector('main, #main-content, [role="main"]') as HTMLElement
    if (mainContent) {
      mainContent.focus()
      mainContent.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  const skipToNavigation = useCallback(() => {
    const navigation = document.querySelector('nav, [role="navigation"]') as HTMLElement
    if (navigation) {
      navigation.focus()
      navigation.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  return { skipToContent, skipToNavigation }
}

// Hook for ARIA live regions
export function useAriaLiveRegion() {
  const liveRegionRef = useRef<HTMLDivElement>(null)

  const updateLiveRegion = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (liveRegionRef.current) {
      liveRegionRef.current.setAttribute('aria-live', priority)
      liveRegionRef.current.textContent = message
    }
  }, [])

  const clearLiveRegion = useCallback(() => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = ''
    }
  }, [])

  return { liveRegionRef, updateLiveRegion, clearLiveRegion }
}

// Hook for keyboard navigation in lists
export function useKeyboardNavigation(items: any[], onSelect?: (item: any, index: number) => void) {
  const activeIndexRef = useRef(-1)
  const containerRef = useRef<HTMLElement>(null)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!containerRef.current) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        activeIndexRef.current = Math.min(activeIndexRef.current + 1, items.length - 1)
        break
      case 'ArrowUp':
        e.preventDefault()
        activeIndexRef.current = Math.max(activeIndexRef.current - 1, 0)
        break
      case 'Home':
        e.preventDefault()
        activeIndexRef.current = 0
        break
      case 'End':
        e.preventDefault()
        activeIndexRef.current = items.length - 1
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (activeIndexRef.current >= 0 && onSelect) {
          onSelect(items[activeIndexRef.current], activeIndexRef.current)
        }
        break
    }

    // Focus the active item
    const activeItem = containerRef.current.children[activeIndexRef.current] as HTMLElement
    if (activeItem) {
      activeItem.focus()
    }
  }, [items, onSelect])

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener('keydown', handleKeyDown)
      return () => container.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  return { containerRef, activeIndex: activeIndexRef.current }
}