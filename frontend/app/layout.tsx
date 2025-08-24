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

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata = {
  title: 'Банк Желаний',
  description: 'Система управления желаниями с трехуровневой валютной системой',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
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
                                <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
                                  {children}
                                  <GlobalAchievementNotifications />
                                  <LiveNotifications />
                                </div>
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