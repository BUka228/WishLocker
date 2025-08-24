'use client'

import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from '../contexts/AuthContext'
import { WalletProvider } from '../contexts/WalletContext'
import { SocialProvider } from '../contexts/SocialContext'
import { WishProvider } from '../contexts/WishContext'
import { DisputeProvider } from '../contexts/DisputeContext'
import { NotificationProvider } from '../contexts/NotificationContext'
import { NotificationPreferencesProvider } from '../contexts/NotificationPreferencesContext'
import { AchievementProvider } from '../contexts/AchievementContext'
import { ToastProvider } from '../components/ui/Toast'
import { GlobalAchievementNotifications } from '../components/achievements/GlobalAchievementNotifications'
import { LiveNotifications } from '../components/notifications/LiveNotifications'
import { ErrorBoundary, WalletErrorBoundary, WishErrorBoundary, SocialErrorBoundary } from '../components/error/ErrorBoundary'
import { SkipLinks } from '../components/accessibility/SkipLinks'
import { useGlobalKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { useEffect } from 'react'

const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-inter'
})

function AppContent({ children }: { children: React.ReactNode }) {
  // Initialize global keyboard shortcuts
  useGlobalKeyboardShortcuts()

  // Set up global accessibility features
  useEffect(() => {
    // Add lang attribute for screen readers
    document.documentElement.lang = 'ru'
    
    // Add skip links styles
    const style = document.createElement('style')
    style.textContent = `
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
      
      .sr-only:focus {
        position: static;
        width: auto;
        height: auto;
        padding: inherit;
        margin: inherit;
        overflow: visible;
        clip: auto;
        white-space: normal;
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return (
    <>
      <SkipLinks />
      <div id="app-root">
        {children}
        <GlobalAchievementNotifications />
        <LiveNotifications />
      </div>
      
      {/* ARIA live region for announcements */}
      <div
        id="aria-live-region"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
      
      {/* ARIA live region for urgent announcements */}
      <div
        id="aria-live-region-assertive"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      />
    </>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className={inter.variable}>
      <head>
        <title>Банк Желаний</title>
        <meta name="description" content="Система управления желаниями с трехуровневой валютной системой" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Банк Желаний" />
        
        {/* Accessibility meta tags */}
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
      </head>
      <body className={`${inter.className} antialiased touch-manipulation`}>
        <ErrorBoundary>
          <ToastProvider>
            <AuthProvider>
              <WalletErrorBoundary>
                <WalletProvider>
                  <SocialErrorBoundary>
                    <SocialProvider>
                      <WishErrorBoundary>
                        <WishProvider>
                          <DisputeProvider>
                            <NotificationProvider>
                              <NotificationPreferencesProvider>
                                <AchievementProvider>
                                  <AppContent>
                                    {children}
                                  </AppContent>
                                </AchievementProvider>
                              </NotificationPreferencesProvider>
                            </NotificationProvider>
                          </DisputeProvider>
                        </WishProvider>
                      </WishErrorBoundary>
                    </SocialProvider>
                  </SocialErrorBoundary>
                </WalletProvider>
              </WalletErrorBoundary>
            </AuthProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}