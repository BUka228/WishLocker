'use client'

import { useEffect, useCallback } from 'react'

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  metaKey?: boolean
  action: () => void
  description: string
  preventDefault?: boolean
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const matchingShortcut = shortcuts.find(shortcut => {
      const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase()
      const ctrlMatch = !!shortcut.ctrlKey === event.ctrlKey
      const altMatch = !!shortcut.altKey === event.altKey
      const shiftMatch = !!shortcut.shiftKey === event.shiftKey
      const metaMatch = !!shortcut.metaKey === event.metaKey

      return keyMatch && ctrlMatch && altMatch && shiftMatch && metaMatch
    })

    if (matchingShortcut) {
      if (matchingShortcut.preventDefault !== false) {
        event.preventDefault()
      }
      matchingShortcut.action()
    }
  }, [shortcuts])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return shortcuts
}

// Global keyboard shortcuts hook
export function useGlobalKeyboardShortcuts() {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'n',
      ctrlKey: true,
      action: () => {
        // Navigate to create wish
        window.location.href = '/wishes/create'
      },
      description: 'Создать новое желание'
    },
    {
      key: 'h',
      ctrlKey: true,
      action: () => {
        // Navigate to home
        window.location.href = '/'
      },
      description: 'Перейти на главную'
    },
    {
      key: 'w',
      ctrlKey: true,
      action: () => {
        // Navigate to wishes
        window.location.href = '/wishes'
      },
      description: 'Перейти к желаниям'
    },
    {
      key: 'f',
      ctrlKey: true,
      action: () => {
        // Navigate to friends
        window.location.href = '/social'
      },
      description: 'Перейти к друзьям'
    },
    {
      key: 't',
      ctrlKey: true,
      action: () => {
        // Navigate to transactions
        window.location.href = '/transactions'
      },
      description: 'Перейти к транзакциям'
    },
    {
      key: 'a',
      ctrlKey: true,
      action: () => {
        // Navigate to achievements
        window.location.href = '/achievements'
      },
      description: 'Перейти к достижениям'
    },
    {
      key: '/',
      action: () => {
        // Focus search input if available
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="поиск" i]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        }
      },
      description: 'Фокус на поиске'
    },
    {
      key: 'Escape',
      action: () => {
        // Close modals, blur active element
        const activeElement = document.activeElement as HTMLElement
        if (activeElement && activeElement.blur) {
          activeElement.blur()
        }
        
        // Close any open modals
        const closeButtons = document.querySelectorAll('[data-close-modal]')
        closeButtons.forEach(button => {
          if (button instanceof HTMLElement) {
            button.click()
          }
        })
      },
      description: 'Закрыть модальные окна'
    }
  ]

  return useKeyboardShortcuts(shortcuts)
}

// Hook for showing keyboard shortcuts help
export function useKeyboardShortcutsHelp() {
  const shortcuts = useGlobalKeyboardShortcuts()
  
  const showHelp = useCallback(() => {
    const helpContent = shortcuts
      .map(shortcut => {
        const keys = []
        if (shortcut.ctrlKey) keys.push('Ctrl')
        if (shortcut.altKey) keys.push('Alt')
        if (shortcut.shiftKey) keys.push('Shift')
        if (shortcut.metaKey) keys.push('Cmd')
        keys.push(shortcut.key.toUpperCase())
        
        return `${keys.join(' + ')}: ${shortcut.description}`
      })
      .join('\n')
    
    alert(`Горячие клавиши:\n\n${helpContent}`)
  }, [shortcuts])

  // Add help shortcut
  useKeyboardShortcuts([
    {
      key: '?',
      shiftKey: true,
      action: showHelp,
      description: 'Показать справку по горячим клавишам'
    }
  ])

  return { showHelp, shortcuts }
}