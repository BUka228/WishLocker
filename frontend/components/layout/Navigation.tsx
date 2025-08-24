'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Wallet, 
  Heart, 
  Users, 
  Trophy, 
  History, 
  Menu, 
  X, 
  User,
  Bell,
  Settings
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { NotificationBell } from '@/components/notifications/NotificationBell'

interface NavigationItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  const navigationItems: NavigationItem[] = [
    { href: '/', label: 'Главная', icon: Home },
    { href: '/wishes', label: 'Желания', icon: Heart },
    { href: '/social', label: 'Друзья', icon: Users },
    { href: '/transactions', label: 'История', icon: History },
    { href: '/achievements', label: 'Достижения', icon: Trophy },
  ]

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsProfileMenuOpen(false)
  }, [pathname])

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.mobile-menu') && !target.closest('.menu-button')) {
        setIsMobileMenuOpen(false)
      }
      if (!target.closest('.profile-menu') && !target.closest('.profile-button')) {
        setIsProfileMenuOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav 
        id="navigation"
        className="hidden lg:flex bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40"
        role="navigation"
        aria-label="Основная навигация"
      >
        <div className="container-responsive">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="text-2xl">💚💙❤️</div>
              <span className="text-xl font-bold text-gray-800">Банк Желаний</span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                      ${isActiveRoute(item.href)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[1.25rem] text-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>

            {/* User Menu */}
            {user && (
              <div className="flex items-center space-x-3">
                <NotificationBell />
                
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="profile-button flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden xl:inline">{user.username}</span>
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileMenuOpen && (
                    <div className="profile-menu absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 animate-slide-down">
                      <Link
                        href="/profile"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <User className="w-4 h-4" />
                        <span>Профиль</span>
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Настройки</span>
                      </Link>
                      <hr className="my-1" />
                      <button
                        onClick={handleSignOut}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                        <span>Выйти</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav 
        className="lg:hidden bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40"
        role="navigation"
        aria-label="Мобильная навигация"
      >
        <div className="px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="text-xl">💚💙❤️</div>
              <span className="text-lg font-bold text-gray-800">Банк Желаний</span>
            </Link>

            {/* Mobile Menu Button */}
            <div className="flex items-center space-x-2">
              {user && <NotificationBell />}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="menu-button p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label={isMobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
        )}

        {/* Mobile Menu */}
        <div 
          id="mobile-menu"
          className={`mobile-menu ${isMobileMenuOpen ? 'open' : 'closed'}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-menu-title"
          aria-hidden={!isMobileMenuOpen}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="text-xl">💚💙❤️</div>
                <span className="text-lg font-bold text-gray-800">Банк Желаний</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* User Info */}
            {user && (
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.username}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <div className="flex-1 py-4">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center space-x-3 px-4 py-3 text-base font-medium transition-colors duration-200
                      ${isActiveRoute(item.href)
                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[1.25rem] text-center ml-auto">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Footer Actions */}
            {user && (
              <div className="border-t border-gray-200 p-4 space-y-2">
                <Link
                  href="/profile"
                  className="flex items-center space-x-3 px-4 py-3 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <User className="w-5 h-5" />
                  <span>Профиль</span>
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center space-x-3 px-4 py-3 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <Settings className="w-5 h-5" />
                  <span>Настройки</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-3 w-full px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                  <span>Выйти</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Bottom Navigation for Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 safe-area-inset">
        <div className="grid grid-cols-5 h-16">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center space-y-1 transition-colors duration-200
                  ${isActiveRoute(item.href)
                    ? 'text-blue-600'
                    : 'text-gray-400 hover:text-gray-600'
                  }
                `}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.badge && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1rem] text-center leading-none">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Spacer for bottom navigation */}
      <div className="lg:hidden h-16" />
    </>
  )
}