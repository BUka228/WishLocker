import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from '../contexts/AuthContext'
import { WalletProvider } from '../contexts/WalletContext'
import { SocialProvider } from '../contexts/SocialContext'
import { WishProvider } from '../contexts/WishContext'
import { DisputeProvider } from '../contexts/DisputeContext'
import { NotificationProvider } from '../contexts/NotificationContext'
import { ToastProvider } from '../components/ui/Toast'

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
        <ToastProvider>
          <AuthProvider>
            <WalletProvider>
              <SocialProvider>
                <WishProvider>
                  <DisputeProvider>
                    <NotificationProvider>
                      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
                        {children}
                      </div>
                    </NotificationProvider>
                  </DisputeProvider>
                </WishProvider>
              </SocialProvider>
            </WalletProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  )
}