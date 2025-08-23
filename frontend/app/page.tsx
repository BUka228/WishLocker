import { WalletCard } from '@/components/WalletCard'
import { WishList } from '@/components/WishList'
import { QuickActions } from '@/components/QuickActions'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Банк Желаний 💚💙❤️
        </h1>
        <p className="text-gray-600">
          Система управления желаниями с трехуровневой валютой
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <WalletCard />
          <QuickActions />
        </div>
        
        <div className="lg:col-span-2">
          <WishList />
        </div>
      </div>
    </div>
  )
}