import './globals.css'
import { Inter } from 'next/font/google'

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
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
          {children}
        </div>
      </body>
    </html>
  )
}